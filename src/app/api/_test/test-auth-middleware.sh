#!/bin/bash

# Define las URLs de tus APIs
LOGIN_URL="http://localhost:3000/api/admin/auth"
PROTECTED_ME_URL="http://localhost:3000/api/admin/user" # Ruta protegida a testear
LOGOUT_URL="http://localhost:3000/api/admin/logout"

# Datos de usuario para login (ajusta según tus datos de prueba)
USER_NAME="admin" # Debe ser un usuario existente en tu DB
USER_PASSWORD="123123123"    # Contraseña de ese usuario

# Archivo temporal para las cookies
COOKIE_FILE="/tmp/auth_middleware_test_cookies.txt"

# Función para extraer el estado HTTP de la salida de curl
extract_http_status() {
  echo "$1" | grep -oP '^< HTTP/\S+\s+\K\d{3}' | head -1
}

# --- Test 1: Acceso a ruta protegida SIN token (no autenticado) ---
echo "--- Test 1: Acceso a $PROTECTED_ME_URL SIN token ---"
NO_TOKEN_CURL_OUTPUT=$(curl -X GET \
  -s -v \
  "$PROTECTED_ME_URL" 2>&1)

NO_TOKEN_STATUS=$(extract_http_status "$NO_TOKEN_CURL_OUTPUT")

echo "$NO_TOKEN_CURL_OUTPUT"
if [[ "$NO_TOKEN_STATUS" == "401" ]]; then
  echo "✅ Éxito: Se denegó el acceso sin token. Estado HTTP: $NO_TOKEN_STATUS."
else
  echo "❌ Fallo: Se esperaba 401 sin token, pero se obtuvo $NO_TOKEN_STATUS."
  exit 1
fi

# --- Test 2: Acceso a ruta protegida con token INVÁLIDO ---
echo -e "\n--- Test 2: Acceso a $PROTECTED_ME_URL con token INVÁLIDO ---"
INVALID_TOKEN="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6IjEyMyIsImlhdCI6MTY3ODU5OTY1MiwiZXhwIjoxNjc4NjAzMjUyfQ.INVALID_SIGNATURE_THIS_IS_FAKE"
# nextjs cookies() solo lee lo enviado por el navegador, no podemos "forzar" una cookie fácilmente desde curl en todas las circunstancias
# Sin embargo, podemos simularlo si Next.js permite headers de Cookie (lo cual sí hace)
INVALID_TOKEN_CURL_OUTPUT=$(curl -X GET \
  -H "Cookie: accessToken=$INVALID_TOKEN" \
  -s -v \
  "$PROTECTED_ME_URL" 2>&1)

INVALID_TOKEN_STATUS=$(extract_http_status "$INVALID_TOKEN_CURL_OUTPUT")

echo "$INVALID_TOKEN_CURL_OUTPUT"
if [[ "$INVALID_TOKEN_STATUS" == "401" ]]; then
  echo "✅ Éxito: Se denegó el acceso con token inválido. Estado HTTP: $INVALID_TOKEN_STATUS."
else
  echo "❌ Fallo: Se esperaba 401 con token inválido, pero se obtuvo $INVALID_TOKEN_STATUS."
  exit 1
fi

# --- Test 3: Acceso a ruta protegida con token VÁLIDO (obtenido por login) ---
echo -e "\n--- Test 3: Acceso a $PROTECTED_ME_URL con token VÁLIDO ---"

# 3.1 Login para obtener la cookie
echo "--- (Sub-paso) Intentando iniciar sesión para obtener una cookie ---"
LOGIN_CURL_OUTPUT=$(curl -X POST \
  -H "Content-Type: application/json" \
  -d "{\"name\":\"$USER_NAME\",\"password\":\"$USER_PASSWORD\"}" \
  -c "$COOKIE_FILE" \
  -s -v \
  "$LOGIN_URL" 2>&1)

LOGIN_STATUS=$(extract_http_status "$LOGIN_CURL_OUTPUT")
if [[ "$LOGIN_STATUS" == "200" ]]; then
  echo "✅ Éxito en el login: Estado HTTP $LOGIN_STATUS."
else
  echo "❌ Fallo: El login no fue exitoso. Estado HTTP: $LOGIN_STATUS."
  rm -f "$COOKIE_FILE"
  exit 1
fi

# 3.2 Acceder a la ruta protegida con la cookie válida
echo "--- (Sub-paso) Accediendo a $PROTECTED_ME_URL con la cookie de sesión ---"
VALID_TOKEN_CURL_OUTPUT=$(curl -X GET \
  -b "$COOKIE_FILE" \
  -s -v \
  "$PROTECTED_ME_URL" 2>&1)

VALID_TOKEN_STATUS=$(extract_http_status "$VALID_TOKEN_CURL_OUTPUT")

echo "$VALID_TOKEN_CURL_OUTPUT"
if [[ "$VALID_TOKEN_STATUS" == "200" ]]; then
  echo "✅ Éxito: Se accedió a la ruta protegida con token válido. Estado HTTP: $VALID_TOKEN_STATUS."
  if echo "$VALID_TOKEN_CURL_OUTPUT" | grep -q "\"name\":\"$USER_NAME\""; then
    echo "✅ Los datos del usuario incluyen el nombre esperado ($USER_NAME)."
  else
    echo "❌ Advertencia: El nombre del usuario esperado no se encontró en la respuesta."
  fi
else
  echo "❌ Fallo: Se esperaba 200 con token válido, pero se obtuvo $VALID_TOKEN_STATUS."
  rm -f "$COOKIE_FILE"
  exit 1
fi

# --- Paso final: Logout para limpiar la cookie ---
echo -e "\n--- Paso Final: Cerrando sesión ---"
LOGOUT_CURL_OUTPUT=$(curl -X POST \
  -b "$COOKIE_FILE" \
  -s -v \
  "$LOGOUT_URL" 2>&1)

LOGOUT_HTTP_STATUS=$(extract_http_status "$LOGOUT_CURL_OUTPUT")

if echo "$LOGOUT_CURL_OUTPUT" | grep -q "Set-Cookie: accessToken=;.*\(Max-Age=0\|Expires=Thu, 01 Jan 1970.*\)" && \
   [[ "$LOGOUT_HTTP_STATUS" == "200" ]]; then
  echo "✅ Éxito: Logout completado y cookie eliminada."
else
  echo "❌ Advertencia: Problema con el logout (posible falso negativo en script)."
fi

# Limpiar el archivo de cookies temporal
rm -f "$COOKIE_FILE"

echo -e "\n--- Fin del test de authMiddleware ---"