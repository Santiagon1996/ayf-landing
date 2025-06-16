#!/bin/bash

# --- Configuración Base ---
# Asegúrate de que tu aplicación Next.js esté corriendo en este puerto y host.
LOGIN_URL="http://localhost:3000/api/admin/auth"
ADD_BLOG_URL="http://localhost:3000/api/blogs"         # Punto de conexión para crear blogs
PATCH_BLOG_BASE_URL="http://localhost:3000/api/blogs"  # URL base para actualizar blogs (PATCH)

# --- Datos de Usuario para Login ---
# ¡IMPORTANTE! Ajusta estos datos para que coincidan con un usuario admin existente en tu base de datos.
USER_NAME="admin"
USER_PASSWORD="123123123"

# --- Archivo Temporal para Cookies ---
# Aquí es donde curl guardará y leerá las cookies de autenticación.
COOKIE_FILE="/tmp/update_blog_test_cookies.txt"

# --- Variables para Datos del Blog ---
# Usamos un timestamp para asegurar títulos de blog únicos para cada ejecución.
TIMESTAMP=$(date +%s)
INITIAL_BLOG_TITLE="Blog Inicial para Actualizar con Bash $TIMESTAMP"
INITIAL_BLOG_CONTENT="Este es el contenido inicial del blog de prueba, creado para ser actualizado. Es lo suficientemente largo."
INITIAL_BLOG_CATEGORY="juridico" # Una categoría válida de tu esquema Blog
INITIAL_BLOG_ICON="https://placehold.co/64x64/000/FFF?text=InitialBlogIcon"

UPDATED_BLOG_TITLE="Blog Actualizado con Bash $TIMESTAMP"
UPDATED_BLOG_CONTENT="Contenido actualizado para el blog de prueba, demostrando la función de actualización. Ahora es más largo y mejor."
UPDATED_BLOG_CATEGORY="fiscal" # Una categoría válida para la actualización
UPDATED_BLOG_ICON="https://placehold.co/64x64/000/000?text=UpdatedBlogIcon"


# --- Función para extraer el estado HTTP de la salida de curl ---
# Esto ayuda a verificar las respuestas de forma robusta.
extract_http_status() {
  echo "$1" | grep -oP '^< HTTP/\S+\s+\K\d{3}' | head -1
}

# --- Función para extraer el ID del blog creado ---
extract_blog_id() {
  echo "$1" | grep -oP '"_id":"\K[^"]+' | head -1
}

echo "--- Iniciando Prueba de Ruta Exitosa para PATCH Blog API (usando Cookies) ---"
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

# --- Paso 2: Crear un Blog Inicial para Actualizar ---
echo -e "\n--- Paso 2: Creando un blog inicial para actualizar ---"
INITIAL_BLOG_DATA='{
    "title": "'"${INITIAL_BLOG_TITLE}"'",
    "content": "'"${INITIAL_BLOG_CONTENT}"'",
    "category": "'"${INITIAL_BLOG_CATEGORY}"'",
    "iconUrl": "'"${INITIAL_BLOG_ICON}"'"
}'

ADD_BLOG_CURL_OUTPUT=$(curl -X POST \
  -H "Content-Type: application/json" \
  -b "$COOKIE_FILE" \
  -d "${INITIAL_BLOG_DATA}" \
  -s -v \
  "$ADD_BLOG_URL" 2>&1)

ADD_BLOG_STATUS=$(extract_http_status "$ADD_BLOG_CURL_OUTPUT")
BLOG_ID=$(extract_blog_id "$ADD_BLOG_CURL_OUTPUT") # Extraer el ID del blog creado

echo "$ADD_BLOG_CURL_OUTPUT"
if [[ "$ADD_BLOG_STATUS" == "201" && -n "$BLOG_ID" ]]; then
  echo "✅ Éxito: Blog inicial creado correctamente. ID: $BLOG_ID. Estado HTTP: $ADD_BLOG_STATUS."
else
  echo "❌ Fallo: Error al crear el blog inicial. Estado HTTP: $ADD_BLOG_STATUS."
  echo "Salida de curl: $ADD_BLOG_CURL_OUTPUT"
  rm -f "$COOKIE_FILE"
  exit 1
fi

# --- Paso 3: Actualizar el Blog usando la Cookie de Autenticación ---
echo -e "\n--- Paso 3: Actualizando el blog usando la cookie de autenticación ---"
UPDATED_BLOG_DATA='{
    "title": "'"${UPDATED_BLOG_TITLE}"'",
    "content": "'"${UPDATED_BLOG_CONTENT}"'",
    "category": "'"${UPDATED_BLOG_CATEGORY}"'",
    "iconUrl": "'"${UPDATED_BLOG_ICON}"'"
}'

PATCH_BLOG_URL="${PATCH_BLOG_BASE_URL}/${BLOG_ID}"

PATCH_CURL_OUTPUT=$(curl -X PATCH \
  -H "Content-Type: application/json" \
  -b "$COOKIE_FILE" \
  -d "${UPDATED_BLOG_DATA}" \
  -s -v \
  "$PATCH_BLOG_URL" 2>&1)

PATCH_STATUS=$(extract_http_status "$PATCH_CURL_OUTPUT")

echo "$PATCH_CURL_OUTPUT" # Muestra la salida detallada de la actualización
if [[ "$PATCH_STATUS" == "204" ]]; then
  echo "✅ Éxito: Blog actualizado correctamente. Estado HTTP: $PATCH_STATUS (No Content)."
  echo "Puedes verificar manualmente en la base de datos que el blog con ID $BLOG_ID se ha actualizado."
else
  echo "❌ Fallo: Error al actualizar el blog. Estado HTTP: $PATCH_STATUS."
  echo "Revisa los logs del servidor para ver el error exacto."
fi

# --- Paso Final: Limpiar el archivo de cookies ---
# Es una buena práctica eliminar los archivos temporales.
rm -f "$COOKIE_FILE"

echo -e "\n--- Prueba de PATCH Blog con Cookies Completada ---"
echo "Verifica los resultados anteriores para confirmar el éxito."
