import type { Metadata } from "next";
import { Montserrat } from "next/font/google";
import { cookies } from "next/headers";
import "./globals.css";

import { Toaster } from 'sonner'
import { ThemeProvider } from '@/components/providers/ThemeProvider'
import { THEMES } from '@/lib/themes'
import type { ThemeId } from '@/lib/themes'
import { createClient } from '@/utils/supabase/server'

const montserrat = Montserrat({
  variable: "--font-montserrat",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Aura OS - Ecosistema Operativo",
  description: "Sistema interno B2B/SaaS para gestión interestelar.",
};

/**
 * Carga el tema del usuario o el tema default del sistema desde Supabase.
 * Inyecta las variables HSL como estilo inline en <html> para SSR sin flash.
 */
async function getServerThemeHsl(): Promise<Record<string, string>> {
    try {
        const supabase = await createClient()

        // 1. Intentar obtener usuario logueado
        const { data: { user } } = await supabase.auth.getUser()

        if (user) {
            // 2. Buscar tema preferido del usuario
            const { data: profile } = await supabase
                .from('profiles')
                .select('preferred_theme_slug')
                .eq('id', user.id)
                .maybeSingle()

            if (profile?.preferred_theme_slug) {
                const { data: theme } = await supabase
                    .from('themes')
                    .select('hsl_values')
                    .eq('slug', profile.preferred_theme_slug)
                    .eq('is_active', true)
                    .maybeSingle()

                if (theme?.hsl_values) return theme.hsl_values as Record<string, string>
            }
        }

        // 3. Fallback: tema default del sistema
        const { data: defaultTheme } = await supabase
            .from('themes')
            .select('hsl_values')
            .eq('is_default', true)
            .eq('is_active', true)
            .maybeSingle()

        if (defaultTheme?.hsl_values) return defaultTheme.hsl_values as Record<string, string>
    } catch (err) {
        console.error('[Layout] Error cargando tema server-side:', err)
    }

    // 4. Último fallback: cookie legacy
    return {}
}

export default async function RootLayout({
    children,
}: Readonly<{
    children: React.ReactNode;
}>) {
    // Leer tema guardado en cookie (legacy fallback)
    const cookieStore = await cookies()
    const themeId = cookieStore.get('aura-theme')?.value || 'warm'

    // La clase que se aplica al <html> server-side (solo para temas estáticos)
    const themeClass = THEMES.find(t => t.id === themeId)?.className ?? ''

    // Cargar tema dinámico desde Supabase
    const serverHsl = await getServerThemeHsl()

    // Construir style object con las variables HSL para React
    const hslStyle: Record<string, string> = {}
    Object.entries(serverHsl).forEach(([key, value]) => {
        hslStyle[`--${key}`] = value
    })

    return (
        <html
            lang="es"
            className={`${montserrat.variable} h-full antialiased ${themeClass}`.trim()}
            style={Object.keys(hslStyle).length > 0 ? hslStyle : undefined}
        >
            <body className="min-h-full flex flex-col font-montserrat">
                {/* Hidrata el tema en el cliente para transiciones sin flash */}
                <ThemeProvider initialTheme={themeId} />
                {children}
                <Toaster position="top-right" expand={true} richColors />
            </body>
        </html>
    );
}
