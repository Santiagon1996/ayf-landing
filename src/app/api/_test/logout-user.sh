#!/bin/bash

# Define la URL de tu API de logout
LOGOUT_URL="http://localhost:3000/api/admin/logout"

# Define la URL de tu API de login
LOGIN_URL="http://localhost:3000/api/admin/auth" # ¡Ambas rutas bajo /api/admin/!

# Datos de usuario para login (ajusta según tus datos de prueba)
USER_EMAIL="admin@admin.com"
USER_PASSWORD="123123123"

# --- Parte de Login ---
echo "--- Intentando iniciar sesión para obtener una cookie ---"

LOGIN_CURL_OUTPUT=$(curl -X POST \
  -H "Content-Type: application/json" \
  -d "{\"email\":\"$USER_EMAIL\",\"password\":\"$USER_PASSWORD\"}" \
  -c /tmp/cookies.txt \
  -s -v \
  "$LOGIN_URL" 2>&1)

echo "$LOGIN_CURL_OUTPUT"

# EXTRACCIÓN DE ESTADO HTTP AÚN MÁS ROBUSTA
LOGIN_STATUS=$(echo "$LOGIN_CURL_OUTPUT" | grep -oP '^< HTTP/\S+\s+\K\d{3}' | head -1)


if [[ "$LOGIN_STATUS" == "200" ]]; then
  echo "✅ Éxito en el login: Estado HTTP $LOGIN_STATUS."
else
  echo "❌ Fallo: El login no fue exitoso. Estado HTTP: $LOGIN_STATUS."
  echo "Asegúrate de que la URL de login sea $LOGIN_URL, que el usuario $USER_EMAIL exista y que la contraseña sea correcta."
  rm -f /tmp/cookies.txt
  exit 1
fi

# --- Parte de Logout ---
echo -e "\n--- Intentando cerrar sesión con la cookie obtenida ---"

LOGOUT_CURL_OUTPUT=$(curl -X POST \
  -b /tmp/cookies.txt \
  -s -v \
  "$LOGOUT_URL" 2>&1)

echo "$LOGOUT_CURL_OUTPUT"

# Verificar si se recibió el encabezado 'Set-Cookie' que indica eliminación
# Buscamos "Set-Cookie: accessToken=" seguido de una indicación de expiración (Max-Age=0 O Expires en el pasado)
# Modificación clave: Agregamos '.*' después de la fecha en Expires para ser más flexibles
if echo "$LOGOUT_CURL_OUTPUT" | grep -q "Set-Cookie: accessToken=;.*\(Max-Age=0\|Expires=Thu, 01 Jan 1970.*\)"; then
  echo -e "\n✅ Éxito: Se recibió el encabezado 'Set-Cookie: accessToken=' indicando que la cookie de acceso ha sido eliminada."
  LOGOUT_HTTP_STATUS=$(echo "$LOGOUT_CURL_OUTPUT" | awk '/^< HTTP\// {print $2; exit}')
  if [[ "$LOGOUT_HTTP_STATUS" == "200" ]]; then
    echo "✅ Éxito: La ruta de logout devolvió un estado HTTP 200 OK."
  else
    echo "⚠️ Advertencia: La ruta de logout devolvió un estado HTTP $LOGOUT_HTTP_STATUS, esperado 200 OK."
  fi
else
  echo -e "\n❌ Fallo: No se encontró un encabezado 'Set-Cookie: accessToken=' que indique la eliminación de la cookie."
  echo "Detalles del error: El script no detectó 'Max-Age=0' o 'Expires=Thu, 01 Jan 1970' en el Set-Cookie."
  echo "Set-Cookie Header(s):"
  echo "$LOGOUT_CURL_OUTPUT" | grep "Set-Cookie:"
fi

# Limpiar el archivo de cookies temporal
rm -f /tmp/cookies.txt

echo -e "\n--- Fin del test de logout ---"