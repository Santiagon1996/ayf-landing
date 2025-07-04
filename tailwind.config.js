// tailwind.config.js
/** @type {import('tailwindcss').Config} */
module.exports = {
  // Esta es la configuración 'content' que le dice a Tailwind dónde buscar tus clases
  // Asegúrate de que las rutas reflejen la estructura de tu proyecto.
  // Si usas la carpeta `src`, `./src/**/*.{js,ts,jsx,tsx,mdx}` es crucial.
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}", // Para App Router
    "./pages/**/*.{js,ts,jsx,tsx,mdx}", // Si usas Pages Router (o mezcla ambos)
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/**/*.{js,ts,jsx,tsx,mdx}", // IMPORTANTE: Si tus componentes están dentro de `src`
  ],
  theme: {
    extend: {
      fontFamily: {
        // Fuentes para tu sitio (EB Garamond, Inter, Lora)
        heading: ["var(--font-eb-garamond)", "serif"],
        body: ["var(--font-inter)", "sans-serif"],
        article: ["var(--font-lora)", "serif"],
      },
      // Aquí puedes extender otros aspectos de Tailwind (colores, espaciado, etc.)
    },
  },
  plugins: [], // Aquí puedes añadir plugins de Tailwind si los necesitas
};
