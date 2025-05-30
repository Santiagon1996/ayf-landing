#!/bin/bash

# Define las URLs de tus APIs
LOGIN_URL="http://localhost:3000/api/admin/auth"
GET_ME_URL="http://localhost:3000/api/admin/user" # ¡Nueva ruta a testear!
LOGOUT_URL="http://localhost:3000/api/admin/logout"

# Datos de usuario para login (ajusta según tus datos de prueba)
USER_EMAIL="admin@admin.com" # Debe ser un usuario existente en tu DB
USER_PASSWORD="123123123"    # Contraseña de ese usuario

# Archivo temporal para las cookies
COOKIE_FILE="/tmp/cookies_me_test.txt"

# --- Parte de Login ---
echo "--- Paso 1: Intentando iniciar sesión para obtener una cookie ---"

LOGIN_CURL_OUTPUT=$(curl -X POST \
  -H "Content-Type: application/json" \
  -d "{\"email\":\"$USER_EMAIL\",\"password\":\"$USER_PASSWORD\"}" \
  -c "$COOKIE_FILE" \
  -s -v \
  "$LOGIN_URL" 2>&1)

echo "$LOGIN_CURL_OUTPUT"

# # ANTERIOR: LOGIN_STATUS=$(echo "$LOGIN_CURL_OUTPUT" | awk '/^< HTTP\// {print $2; exit}')
# NUEVO: Extracción robusta del estado HTTP numérico
LOGIN_STATUS=$(echo "$LOGIN_CURL_OUTPUT" | grep -oP '^< HTTP/\S+\s+\K\d{3}' | head -1)


if [[ "$LOGIN_STATUS" == "200" ]]; then
  echo "✅ Éxito en el login: Estado HTTP $LOGIN_STATUS."
else
  echo "❌ Fallo: El login no fue exitoso. Estado HTTP: $LOGIN_STATUS."
  echo "Asegúrate de que la URL de login sea $LOGIN_URL, que el usuario $USER_EMAIL exista y que la contraseña sea correcta."
  rm -f "$COOKIE_FILE"
  exit 1
fi

# --- Parte de Obtener Datos del Usuario (/api/auth/me) ---
echo -e "\n--- Paso 2: Intentando obtener datos del usuario desde $GET_ME_URL ---"

GET_ME_CURL_OUTPUT=$(curl -X GET \
  -b "$COOKIE_FILE" \
  -s -v \
  "$GET_ME_URL" 2>&1)

echo "$GET_ME_CURL_OUTPUT"

# # ANTERIOR: GET_ME_STATUS=$(echo "$GET_ME_CURL_OUTPUT" | awk '/^< HTTP\// {print $2; exit}')
# NUEVO: Extracción robusta del estado HTTP numérico
GET_ME_STATUS=$(echo "$GET_ME_CURL_OUTPUT" | grep -oP '^< HTTP/\S+\s+\K\d{3}' | head -1)

if [[ "$GET_ME_STATUS" == "200" ]]; then
  echo "✅ Éxito al obtener datos del usuario: Estado HTTP $GET_ME_STATUS."
  # Opcional: Verificar que el JSON devuelto contenga el email esperado
  if echo "$GET_ME_CURL_OUTPUT" | grep -q "\"email\":\"$USER_EMAIL\""; then
    echo "✅ Los datos del usuario incluyen el email esperado ($USER_EMAIL)."
  else
    echo "❌ Advertencia: El email del usuario esperado no se encontró en la respuesta."
    echo "JSON de respuesta (solo body):"
    # Ajuste para imprimir solo el body JSON de forma más fiable
    echo "$GET_ME_CURL_OUTPUT" | sed -n '/^< HTTP/,/^$/!p' | grep -v '^\*\|^<\|^\s*$' | sed '/^$/d'
  fi
else
  echo "❌ Fallo al obtener datos del usuario. Estado HTTP: $GET_ME_STATUS."
  echo "Asegúrate de que la ruta $GET_ME_URL exista y que tu lógica de verificación de token funcione."
  rm -f "$COOKIE_FILE"
  exit 1
fi

# --- Parte de Logout ---
echo -e "\n--- Paso 3: Intentando cerrar sesión para limpiar la cookie ---"

LOGOUT_CURL_OUTPUT=$(curl -X POST \
  -b "$COOKIE_FILE" \
  -s -v \
  "$LOGOUT_URL" 2>&1)

echo "$LOGOUT_CURL_OUTPUT"

# NUEVO: Extracción robusta del estado HTTP numérico para logout
LOGOUT_HTTP_STATUS=$(echo "$LOGOUT_CURL_OUTPUT" | grep -oP '^< HTTP/\S+\s+\K\d{3}' | head -1)

# Verificación flexible de la eliminación de la cookie (igual que en el test de logout)
if echo "$LOGOUT_CURL_OUTPUT" | grep -q "Set-Cookie: accessToken=;.*\(Max-Age=0\|Expires=Thu, 01 Jan 1970.*\)" && \
   [[ "$LOGOUT_HTTP_STATUS" == "200" ]]; then # Añadimos verificación del status aquí también
  echo "✅ Éxito: Se recibió el encabezado 'Set-Cookie: accessToken=' indicando que la cookie de acceso ha sido eliminada."
  echo "✅ Éxito: La ruta de logout devolvió un estado HTTP 200 OK."
else
  echo "❌ Fallo: Problema con el logout."
  echo "Detalles del error: El script no detectó 'Max-Age=0' o 'Expires=Thu, 01 Jan 1970' en el Set-Cookie O el estado HTTP no fue 200."
  echo "Set-Cookie Header(s):"
  echo "$LOGOUT_CURL_OUTPUT" | grep "Set-Cookie:"
  echo "Estado HTTP de Logout: $LOGOUT_HTTP_STATUS"
fi

# Limpiar el archivo de cookies temporal
rm -f "$COOKIE_FILE"

echo -e "\n--- Fin del test de /api/auth/user ---"