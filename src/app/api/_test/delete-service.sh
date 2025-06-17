#!/bin/bash

# --- Configuración Base ---
# Asegúrate de que tu aplicación Next.js esté corriendo en este puerto y host.
LOGIN_URL="http://localhost:3000/api/admin/auth"
ADD_SERVICE_URL="http://localhost:3000/api/services"
DELETE_SERVICE_BASE_URL="http://localhost:3000/api/services" # La URL base para DELETE

# --- Datos de Usuario para Login ---
# ¡IMPORTANTE! Ajusta estos datos para que coincidan con un usuario existente en tu base de datos (ej. un admin).
USER_NAME="admin"
USER_PASSWORD="123123123"

# --- Archivo Temporal para Cookies ---
COOKIE_FILE="/tmp/delete_service_test_cookies.txt"

# --- Variables para Datos de Servicio ---
TIMESTAMP=$(date +%s)
SERVICE_TO_DELETE_NAME="Servicio para Eliminar con Bash $TIMESTAMP"

# --- Función para extraer el estado HTTP de la salida de curl ---
extract_http_status() {
    echo "$1" | grep -oP '^< HTTP/\S+\s+\K\d{3}' | head -1
}

# --- Función para extraer el ID del servicio creado ---
extract_service_id() {
    echo "$1" | grep -oP '"_id":"\K[^"]+' | head -1
}

echo "--- Iniciando Prueba de Ruta Exitosa para DELETE Service API (usando Cookies) ---"
echo ""

# --- Paso 1: Iniciar Sesión para Obtener la Cookie ---
echo "--- Paso 1: Intentando iniciar sesión para obtener la cookie de autenticación ---"
LOGIN_CURL_OUTPUT=$(curl -X POST \
    -H "Content-Type: application/json" \
    -d "{\"name\":\"$USER_NAME\",\"password\":\"$USER_PASSWORD\"}" \
    -c "$COOKIE_FILE" \
    -s -v \
    "$LOGIN_URL" 2>&1)

LOGIN_STATUS=$(extract_http_status "$LOGIN_CURL_OUTPUT")

echo "$LOGIN_CURL_OUTPUT" # Muestra la salida detallada del login
if [[ "$LOGIN_STATUS" == "200" ]]; then
    echo "✅ Éxito: Inicio de sesión exitoso. Se obtuvo la cookie."
else
    echo "❌ Fallo: El inicio de sesión falló. Estado HTTP: $LOGIN_STATUS."
    echo "Asegúrate de que el usuario '$USER_NAME' y la contraseña sean correctos y que la API de login funcione."
    rm -f "$COOKIE_FILE"
    exit 1
fi

# --- Paso 2: Crear un Servicio para Eliminar ---
echo -e "\n--- Paso 2: Creando un nuevo servicio que será eliminado ---"
SERVICE_DATA_TO_DELETE='{
    "name": "'"${SERVICE_TO_DELETE_NAME}"'",
    "category":"asesoria-juridica",
    "type": "juridico",
    "shortDescription": "Descripción breve del servicio a eliminar: '"${SERVICE_TO_DELETE_NAME}"'",
    "fullDescription": "Descripción completa del servicio a eliminar.",
    "details": ["Detalle X", "Detalle Y"],
    "iconUrl": "https://example.com/delete-icon.png"
}'

ADD_SERVICE_CURL_OUTPUT=$(curl -X POST \
    -H "Content-Type: application/json" \
    -b "$COOKIE_FILE" \
    -d "${SERVICE_DATA_TO_DELETE}" \
    -s -v \
    "$ADD_SERVICE_URL" 2>&1)

ADD_SERVICE_STATUS=$(extract_http_status "$ADD_SERVICE_CURL_OUTPUT")
SERVICE_ID_TO_DELETE=$(echo "$ADD_SERVICE_CURL_OUTPUT" | grep -oP '"_id":"\K[^"]+' | head -1) # Extraer el ID del servicio creado

echo "$ADD_SERVICE_CURL_OUTPUT"
if [[ "$ADD_SERVICE_STATUS" == "201" && -n "$SERVICE_ID_TO_DELETE" ]]; then
    echo "✅ Éxito: Servicio a eliminar creado correctamente. ID: $SERVICE_ID_TO_DELETE. Estado HTTP: $ADD_SERVICE_STATUS."
else
    echo "❌ Fallo: Error al crear el servicio que se iba a eliminar. Estado HTTP: $ADD_SERVICE_STATUS."
    echo "Salida de curl: $ADD_SERVICE_CURL_OUTPUT"
    rm -f "$COOKIE_FILE"
    exit 1
fi

# --- Paso 3: Eliminar el Servicio usando la Cookie de Autenticación ---
echo -e "\n--- Paso 3: Eliminando el servicio usando la cookie de autenticación ---"
DELETE_SERVICE_URL="${DELETE_SERVICE_BASE_URL}/${SERVICE_ID_TO_DELETE}"

DELETE_CURL_OUTPUT=$(curl -X DELETE \
    -b "$COOKIE_FILE" \
    -s -v \
    "$DELETE_SERVICE_URL" 2>&1)

DELETE_STATUS=$(extract_http_status "$DELETE_CURL_OUTPUT")

echo "$DELETE_CURL_OUTPUT" # Muestra la salida detallada de la eliminación
if [[ "$DELETE_STATUS" == "204" ]]; then
    echo "✅ Éxito: Servicio eliminado correctamente. Estado HTTP: $DELETE_STATUS (No Content)."
    echo "Puedes verificar manualmente en la base de datos que el servicio con ID $SERVICE_ID_TO_DELETE ya no existe."
else
    echo "❌ Fallo: Error al eliminar el servicio. Estado HTTP: $DELETE_STATUS."
    echo "Revisa los logs del servidor para ver el error exacto."
fi

# --- Paso Final: Limpiar el archivo de cookies ---
rm -f "$COOKIE_FILE"

echo -e "\n--- Prueba de DELETE Service con Cookies Completada ---"
echo "Verifica los resultados anteriores para confirmar el éxito."