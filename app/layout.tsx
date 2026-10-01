import type { Metadata, Viewport } from "next";
import '@fontsource/plus-jakarta-sans/400.css';
import '@fontsource/plus-jakarta-sans/500.css';
import '@fontsource/plus-jakarta-sans/600.css';
import '@fontsource/plus-jakarta-sans/700.css';
import '@fontsource/plus-jakarta-sans/800.css';
import "./globals.css";
import { connection } from "next/server";
export const metadata: Metadata = {
  title: "Ruta Vocacional 360° | Conócete. Explora. Elige tu camino.",
  description:
    "Descubre tus intereses, explora carreras y construye tu futuro con orientación académica y profesional.",
  icons: {
    icon: [{ url: "/favicon.ico", sizes: "any" }, { url: "/favicon-32.png", type: "image/png", sizes: "32x32" }],
    apple: [{ url: "/apple-touch-icon.png", sizes: "180x180" }],
  },
  manifest: "/site.webmanifest",
};
export const viewport: Viewport = {
  colorScheme: "light",
  themeColor: "#f5f7ff",
};
export default async function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  await connection();
  return (
    <html lang="es" data-scroll-behavior="smooth">
      <body>{children}</body>
    </html>
  );
}
