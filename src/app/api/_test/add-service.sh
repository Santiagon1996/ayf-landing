#!/bin/bash

# --- Configuración Base ---
# Asegúrate de que tu aplicación Next.js esté corriendo en este puerto y host.
LOGIN_URL="http://localhost:3000/api/admin/auth"
ADD_SERVICE_URL="http://localhost:3000/api/services"

# --- Datos de Usuario para Login ---
# ¡IMPORTANTE! Ajusta estos datos para que coincidan con un usuario existente en tu base de datos (ej. un admin).
USER_NAME="admin"
USER_PASSWORD="123123123" 

# --- Archivo Temporal para Cookies ---
# Aquí es donde curl guardará y leerá las cookies.
COOKIE_FILE="/tmp/add_service_test_cookies.txt"

# --- Variables para Datos de Servicio ---
# Usamos un timestamp para asegurar nombres de servicio únicos para cada ejecución.
TIMESTAMP=$(date +%s)
SERVICE_NAME="Mi Servicio Creado con Cookies $TIMESTAMP"

# --- Función para extraer el estado HTTP de la salida de curl ---
# Esto ayuda a verificar las respuestas de forma robusta.
extract_http_status() {
  echo "$1" | grep -oP '^< HTTP/\S+\s+\K\d{3}' | head -1
}

echo "--- Iniciando Prueba de Ruta Exitosa para Add Service API (usando Cookies) ---"
echo ""

# --- Paso 1: Iniciar Sesión para Obtener el Token (en la Cookie) ---
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
  rm -f "$COOKIE_FILE" # Limpiamos antes de salir
  exit 1
fi

# --- Paso 2: Crear un Servicio usando la Cookie de Autenticación ---
echo -e "\n--- Paso 2: Creando un nuevo servicio usando la cookie de autenticación ---"
SERVICE_DATA='{
    "name": "'"${SERVICE_NAME}"'",
    "category":"asesoria-juridica",
    "type": "juridico",
    "shortDescription": "Una descripción breve del servicio: '"${SERVICE_NAME}"'",
    "fullDescription": "Una descripción completa del servicio creado con la cookie: '"${SERVICE_NAME}"'",
    "details": ["Funcionalidad A", "Funcionalidad B"],
    "iconUrl": "https://example.com/cookie-icon.png"
}'

ADD_SERVICE_CURL_OUTPUT=$(curl -X POST \
     -H "Content-Type: application/json" \
     -b "$COOKIE_FILE" \
     -d "${SERVICE_DATA}" \
     -s -v \
     "$ADD_SERVICE_URL" 2>&1)

ADD_SERVICE_STATUS=$(extract_http_status "$ADD_SERVICE_CURL_OUTPUT")

echo "$ADD_SERVICE_CURL_OUTPUT" # Muestra la salida detallada de la creación del servicio
if [[ "$ADD_SERVICE_STATUS" == "201" ]]; then
  echo "✅ Éxito: Servicio creado correctamente. Estado HTTP: $ADD_SERVICE_STATUS."
else
  echo "❌ Fallo: Error al crear el servicio. Estado HTTP: $ADD_SERVICE_STATUS."
  echo "Revisa los logs del servidor para ver el error exacto. Asegúrate de que el 'userId' se pase a 'addService'."
fi

# --- Paso Final: Limpiar el archivo de cookies ---
# Es una buena práctica eliminar los archivos temporales.
rm -f "$COOKIE_FILE"

echo -e "\n--- Prueba de Add Service con Cookies Completada ---"
echo "Verifica los resultados anteriores para confirmar el éxito."