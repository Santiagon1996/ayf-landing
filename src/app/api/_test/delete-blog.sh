#!/bin/bash

# --- Configuración Base ---
# Asegúrate de que tu aplicación Next.js esté corriendo en este puerto y host.
LOGIN_URL="http://localhost:3000/api/admin/auth"
ADD_BLOG_URL="http://localhost:3000/api/blogs"         # Punto de conexión para crear blogs
DELETE_BLOG_BASE_URL="http://localhost:3000/api/blogs" # URL base para eliminar blogs (DELETE)

# --- Datos de Usuario para Login ---
# ¡IMPORTANTE! Ajusta estos datos para que coincidan con un usuario admin existente en tu base de datos.
USER_NAME="admin"
USER_PASSWORD="123123123"

# --- Archivo Temporal para Cookies ---
# Aquí es donde curl guardará y leerá las cookies de autenticación.
COOKIE_FILE="/tmp/delete_blog_test_cookies.txt"

# --- Variables para Datos del Blog ---
# Usamos un timestamp para asegurar títulos de blog únicos para cada ejecución.
TIMESTAMP=$(date +%s)
BLOG_TITLE_TO_DELETE="Blog para Eliminar con Bash $TIMESTAMP"
BLOG_CONTENT_TO_DELETE="Este es el contenido de un blog que se creará y luego se eliminará. Es lo suficientemente largo para ser válido."
BLOG_CATEGORY_TO_DELETE="laboral" # Una categoría válida de tu esquema Blog
BLOG_ICON_TO_DELETE="https://placehold.co/64x64/FF0000/FFFFFF?text=DeleteBlog"


# --- Función para extraer el estado HTTP de la salida de curl ---
# Esto ayuda a verificar las respuestas de forma robusta.
extract_http_status() {
  echo "$1" | grep -oP '^< HTTP/\S+\s+\K\d{3}' | head -1
}

# --- Función para extraer el ID del blog creado ---
extract_blog_id() {
  echo "$1" | grep -oP '"_id":"\K[^"]+' | head -1
}

echo "--- Iniciando Prueba de Ruta Exitosa para DELETE Blog API (usando Cookies) ---"
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
  rm -f "$COOKIE_FILE" # Limpiamos antes de salir
  exit 1
fi

# --- Paso 2: Crear un Blog para Eliminar ---
echo -e "\n--- Paso 2: Creando un nuevo blog que será eliminado ---"
BLOG_DATA_TO_DELETE='{
    "title": "'"${BLOG_TITLE_TO_DELETE}"'",
    "content": "'"${BLOG_CONTENT_TO_DELETE}"'",
    "category": "'"${BLOG_CATEGORY_TO_DELETE}"'",
    "iconUrl": "'"${BLOG_ICON_TO_DELETE}"'"
}'

ADD_BLOG_CURL_OUTPUT=$(curl -X POST \
  -H "Content-Type: application/json" \
  -b "$COOKIE_FILE" \
  -d "${BLOG_DATA_TO_DELETE}" \
  -s -v \
  "$ADD_BLOG_URL" 2>&1)

ADD_BLOG_STATUS=$(extract_http_status "$ADD_BLOG_CURL_OUTPUT")
BLOG_ID_TO_DELETE=$(extract_blog_id "$ADD_BLOG_CURL_OUTPUT") # Extraer el ID del blog creado

echo "$ADD_BLOG_CURL_OUTPUT"
if [[ "$ADD_BLOG_STATUS" == "201" && -n "$BLOG_ID_TO_DELETE" ]]; then
  echo "✅ Éxito: Blog a eliminar creado correctamente. ID: $BLOG_ID_TO_DELETE. Estado HTTP: $ADD_BLOG_STATUS."
else
  echo "❌ Fallo: Error al crear el blog que se iba a eliminar. Estado HTTP: $ADD_BLOG_STATUS."
  echo "Salida de curl: $ADD_BLOG_CURL_OUTPUT"
  rm -f "$COOKIE_FILE"
  exit 1
fi

# --- Paso 3: Eliminar el Blog usando la Cookie de Autenticación ---
echo -e "\n--- Paso 3: Eliminando el blog usando la cookie de autenticación ---"
DELETE_BLOG_URL="${DELETE_BLOG_BASE_URL}/${BLOG_ID_TO_DELETE}"

DELETE_CURL_OUTPUT=$(curl -X DELETE \
  -b "$COOKIE_FILE" \
  -s -v \
  "$DELETE_BLOG_URL" 2>&1)

DELETE_STATUS=$(extract_http_status "$DELETE_CURL_OUTPUT")

echo "$DELETE_CURL_OUTPUT" # Muestra la salida detallada de la eliminación
if [[ "$DELETE_STATUS" == "204" ]]; then
  echo "✅ Éxito: Blog eliminado correctamente. Estado HTTP: $DELETE_STATUS (No Content)."
  echo "Puedes verificar manualmente en la base de datos que el blog con ID $BLOG_ID_TO_DELETE ya no existe."
else
  echo "❌ Fallo: Error al eliminar el blog. Estado HTTP: $DELETE_STATUS."
  echo "Revisa los logs del servidor para ver el error exacto."
fi

# --- Paso Final: Limpiar el archivo de cookies ---
# Es una buena práctica eliminar los archivos temporales.
rm -f "$COOKIE_FILE"

echo -e "\n--- Prueba de DELETE Blog con Cookies Completada ---"
echo "Verifica los resultados anteriores para confirmar el éxito."
