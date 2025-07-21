import { EB_Garamond, Inter, Lora } from "next/font/google";

import "./globals.css";

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
    "AyF Asociados ofrece servicios jurídicos y contables integrales en Rosario. Asesoramiento legal experto y gestión contable eficiente para empresas y particulares. Tu aliado en derecho y finanzas.",
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
  },
};

export default function RootLayout({ children }) {
  return (
    <html lang="es">
      <head>
        <meta
          name="google-site-verification"
          content="MCGbvJ7D7oOafzvnhDx3NKT9u3CAADyEDw6e3qhvHRI"
        />
      </head>
      <body
        className={`${ebGaramond.variable} ${inter.variable} ${lora.variable} antialiased`}
      >
        {children}
      </body>
    </html>
  );
}
