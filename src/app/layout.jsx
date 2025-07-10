import { Geist, Geist_Mono, EB_Garamond, Inter, Lora } from "next/font/google";
import Head from "next/head";

import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});
// Configuración de EB Garamond para los títulos
const ebGaramond = EB_Garamond({
  subsets: ["latin"],
  display: "swap", // 'swap' garantiza que el texto sea visible mientras la fuente se carga
  variable: "--font-eb-garamond", // Variable CSS para usar en Tailwind
});

// Configuración de Inter para el cuerpo de texto general
const inter = Inter({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-inter", // Variable CSS para usar en Tailwind
});

// Configuración de Lora para la sección tipo "artículo de diario"
const lora = Lora({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-lora", // Variable CSS para usar en Tailwind
});
export const metadata = {
  // Título principal del sitio web
  title: {
    default: "AyF Asociados | Estudio Jurídico Contable Integral",
    template: "%s | AyF Asociados", // Permite que los títulos de las páginas internas se añadan aquí
  },
  // Descripción concisa y relevante para SEO
  description:
    "AyF Asociados ofrece servicios jurídicos y contables integrales en Barcelona. Asesoramiento legal experto y gestión contable eficiente para empresas y particulares. Tu aliado en derecho y finanzas.",
  // Palabras clave para ayudar a los motores de búsqueda (opcional, pero útil)
  keywords: [
    "estudio jurídico contable",
    "asesoramiento legal Rosario",
    "servicios contables Rosario",
    "abogados Rosario",
    "contadores Rosario",
    "asesoría fiscal",
    "derecho mercantil",
    "auditoría contable",
    "gestión patrimonial",
    "AyF Asociados",
  ],
  // URL canónica para evitar problemas de contenido duplicado
  alternates: {
    canonical: "https://www.ayfasociados.com", // Reemplaza con tu dominio real
  },
  // Información sobre el autor o empresa
  authors: [{ name: "AyF Asociados" }],
  // Configuración para Open Graph (redes sociales y mensajería)

  // Configuración para Twitter Cards

  // Favicon
  icons: {
    icon: "/AyF-Logo.png",
    shortcut: "/favicon-16x16.png",
    apple: "/apple-touch-icon.png",
  },
};

export default function RootLayout({ children }) {
  return (
    <html lang="es">
      <Head>
        {/* Título para la página (importante para SEO y UX) */}
        <title>{metadata.title.default}</title>

        {/* Meta descripción para los motores de búsqueda */}
        <meta name="description" content={metadata.description} />

        {/* Define el favicon (ícono de la pestaña del navegador) */}
        <link
          rel="icon"
          href="/AyF-Logo.png"
          sizes="512x512"
          type="image/png"
        />

        {/* Configuración de vista en dispositivos móviles */}
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />

        {/* Metaetiquetas relacionadas con el idioma y la región */}
        <meta name="language" content="es" />
        <meta name="geo.region" content="AR-S" />
        <meta name="geo.placename" content="Rosario" />
        <meta name="geo.position" content="-32.94682;-60.63932" />
        <meta name="ICBM" content="-32.94682, -60.63932" />

        {/* Etiqueta para autor */}
        <meta name="author" content="AyF" />

        {/* Palabras clave para motores de búsqueda */}
        <meta name="keywords" content={metadata.keywords} />

        {/* Atributos de robots para indexación y seguimiento */}
        <meta name="robots" content="index, follow" />

        {/* Preconexión para optimizar carga de recursos */}
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link
          rel="preconnect"
          href="https://fonts.gstatic.com"
          crossOrigin="anonymous"
        />
      </Head>
      <body
        className={`${ebGaramond.variable} ${inter.variable} ${lora.variable} antialiased`}
      >
        {children}
      </body>
    </html>
  );
}
