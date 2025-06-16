#!/bin/bash

# --- Configuración Base ---
# Asegúrate de que tu aplicación Next.js esté corriendo en este puerto y host.
LOGIN_URL="http://localhost:3000/api/admin/auth"
ADD_BLOG_URL="http://localhost:3000/api/blogs" # ¡Punto de conexión de la API para crear blogs!

# --- Datos de Usuario para Login ---
# ¡IMPORTANTE! Ajusta estos datos para que coincidan con un usuario admin existente en tu base de datos.
USER_NAME="admin"      # Por ejemplo: el nombre de usuario de un admin
USER_PASSWORD="123123123" # Por ejemplo: la contraseña de ese admin

# --- Archivo Temporal para Cookies ---
# Aquí es donde curl guardará y leerá las cookies de autenticación.
COOKIE_FILE="/tmp/add_blog_test_cookies.txt"

# --- Variables para Datos del Blog ---
# Usamos un timestamp para asegurar títulos de blog únicos para cada ejecución.
TIMESTAMP=$(date +%s)
BLOG_TITLE="Mi Blog Creado por Script Bash $TIMESTAMP"
BLOG_CATEGORY="noticias-generales" # Una categoría válida de tu esquema Blog
BLOG_CONTENT="Este es el contenido detallado de un blog creado mediante un script de prueba. Asegura la longitud mínima."

# --- Función para extraer el estado HTTP de la salida de curl ---
# Esto ayuda a verificar las respuestas de forma robusta.
extract_http_status() {
  echo "$1" | grep -oP '^< HTTP/\S+\s+\K\d{3}' | head -1
}

echo "--- Iniciando Prueba de Ruta Exitosa para Add Blog API (usando Cookies) ---"
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

# --- Paso 2: Crear un Blog usando la Cookie de Autenticación ---
echo -e "\n--- Paso 2: Creando un nuevo blog usando la cookie de autenticación ---"

# Aquí definimos los datos del blog en formato JSON.
# Asegúrate de que los campos y sus valores coincidan con los requisitos de tu esquema de Blog.
# El 'author' se asume que se obtendrá del usuario autenticado vía cookie en el backend.
BLOG_DATA='{
    "title": "'"${BLOG_TITLE}"'",
    "content": "'"${BLOG_CONTENT}"'",
    "category": "'"${BLOG_CATEGORY}"'",
    "iconUrl": "https://placehold.co/64x64/000/FFF?text=BlogIcon"
}'

ADD_BLOG_CURL_OUTPUT=$(curl -X POST \
  -H "Content-Type: application/json" \
  -b "$COOKIE_FILE" \
  -d "${BLOG_DATA}" \
  -s -v \
  "$ADD_BLOG_URL" 2>&1)

ADD_BLOG_STATUS=$(extract_http_status "$ADD_BLOG_CURL_OUTPUT")

echo "$ADD_BLOG_CURL_OUTPUT" # Muestra la salida detallada de la creación del blog
if [[ "$ADD_BLOG_STATUS" == "201" ]]; then
  echo "✅ Éxito: Blog creado correctamente. Estado HTTP: $ADD_BLOG_STATUS."
else
  echo "❌ Fallo: Error al crear el blog. Estado HTTP: $ADD_BLOG_STATUS."
  echo "Revisa los logs del servidor para ver el error exacto. Asegúrate de que tu API /api/blogs esté configurada para recibir estos datos y que la lógica addBlog funcione correctamente con la autenticación."
fi

# --- Paso Final: Limpiar el archivo de cookies ---
# Es una buena práctica eliminar los archivos temporales.
rm -f "$COOKIE_FILE"

echo -e "\n--- Prueba de Add Blog con Cookies Completada ---"
echo "Verifica los resultados anteriores para confirmar el éxito."