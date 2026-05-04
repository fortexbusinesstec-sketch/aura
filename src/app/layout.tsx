import type { Metadata } from "next";
import { Montserrat } from "next/font/google";
import { cookies } from "next/headers";
import "./globals.css";

import { Toaster } from 'sonner'
import { ThemeProvider } from '@/components/providers/ThemeProvider'
import { THEMES } from '@/lib/themes'
import type { ThemeId } from '@/lib/themes'

const montserrat = Montserrat({
  variable: "--font-montserrat",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Aura OS - Ecosistema Operativo",
  description: "Sistema interno B2B/SaaS para gestión interestelar.",
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  // Leer tema guardado en cookie (SSR) para evitar flash al cargar
  const cookieStore = await cookies()
  const themeId = cookieStore.get('aura-theme')?.value || 'warm'

  // La clase que se aplica al <html> server-side (solo para temas estáticos)
  const themeClass = THEMES.find(t => t.id === themeId)?.className ?? ''

  return (
    <html lang="es" className={`${montserrat.variable} h-full antialiased ${themeClass}`.trim()}>
      <body className="min-h-full flex flex-col font-montserrat">
        {/* Hidrata el tema en el cliente para transiciones sin flash */}
        <ThemeProvider initialTheme={themeId} />
        {children}
        <Toaster position="top-right" expand={true} richColors />
      </body>
    </html>
  );
}
