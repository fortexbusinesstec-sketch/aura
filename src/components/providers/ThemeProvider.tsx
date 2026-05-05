'use client'

import { useEffect } from 'react'
import { THEMES, type ThemeId } from '@/lib/themes'
import { createClient } from '@/utils/supabase/client'

export type { ThemeId }
export { THEMES }

/**
 * ═══════════════════════════════════════════════════════════════
 *  AURA OS — ThemeProvider (Legacy + Dynamic)
 *  Monta el tema en el cliente para transiciones sin flash.
 *  Compatible con:
 *  1. Temas estáticos (warm, midnight, ocean, forest, custom)
 *  2. Temas importados desde CSS (localStorage)
 *  3. Temas dinámicos desde Supabase (nuevo)
 * ═══════════════════════════════════════════════════════════════
 */

export function ThemeProvider({ initialTheme }: { initialTheme: string }) {
    useEffect(() => {
        const apply = async () => {
            const html = document.documentElement
            const supabase = createClient()

            // 1. Intentar cargar tema del usuario desde Supabase
            try {
                const { data: { user } } = await supabase.auth.getUser()
                if (user) {
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

                        if (theme?.hsl_values) {
                            // Limpiar clases de temas estáticos
                            THEMES.forEach(t => t.className && html.classList.remove(t.className))
                            // Inyectar variables HSL
                            Object.entries(theme.hsl_values).forEach(([k, v]) => {
                                html.style.setProperty(`--${k}`, String(v))
                            })
                            return // Tema dinámico aplicado, no seguir
                        }
                    }
                }
            } catch (err) {
                console.error('[ThemeProvider] Error cargando tema dinámico:', err)
            }

            // 2. Fallback: aplicar tema legacy (estático o importado)
            applyTheme(initialTheme)
        }

        apply()

        // Escuchar cambios de storage por si el usuario cambia tema en otra pestaña
        const handleStorage = (e: StorageEvent) => {
            if (e.key === 'aura-theme' || e.key === 'aura-imported-themes') {
                const match = document.cookie.match(/aura-theme=([^;]+)/)
                if (match) applyTheme(match[1])
            }
        }
        window.addEventListener('storage', handleStorage)
        return () => window.removeEventListener('storage', handleStorage)
    }, [initialTheme])

    return null
}

/**
 * Aplica la clase de tema al elemento <html> (modo legacy).
 * NO borra las variables CSS inyectadas por el server;
 * solo las sobreescribe si es un tema estático o custom.
 */
export function applyTheme(themeId: string) {
    const html = document.documentElement

    // 1. Buscar en temas estáticos
    const staticTheme = THEMES.find(t => t.id === themeId)
    
    // 2. Buscar en temas importados
    const importedThemes = getImportedThemes()
    const importedTheme = importedThemes.find(t => t.id === themeId)

    // Limpiar clases de temas estáticos
    THEMES.forEach(t => t.className && html.classList.remove(t.className))

    if (staticTheme) {
        if (staticTheme.className) html.classList.add(staticTheme.className)
        
        // Si es el 'custom', aplicar sus colores
        if (themeId === 'custom') {
            const colors = getCustomColorsFromCookie()
            Object.entries(colors).forEach(([k, v]) => html.style.setProperty(`--${k}`, v as string))
        }
    } else if (importedTheme) {
        // Aplicar las variables del tema importado
        Object.entries(importedTheme.colors).forEach(([k, v]) => {
            html.style.setProperty(`--${k}`, v as string)
        })
    }
}

/**
 * Obtiene temas guardados en localStorage
 */
export function getImportedThemes(): any[] {
    if (typeof window === 'undefined') return []
    const stored = localStorage.getItem('aura-imported-themes')
    return stored ? JSON.parse(stored) : []
}

/**
 * Parsea un bloque de CSS y lo guarda como tema nuevo
 */
export function importThemeFromCSS(name: string, css: string) {
    const colors: Record<string, string> = {}
    const lines = css.split('\n')
    
    lines.forEach(line => {
        const match = line.match(/--([\w-]+):\s*([^;]+);/)
        if (match) {
            colors[match[1]] = match[2].trim()
        }
    })

    if (Object.keys(colors).length === 0) return null

    const newTheme = {
        id: `imported-${Date.now()}`,
        label: name,
        description: 'Tema importado desde CSS.',
        colors: colors,
        preview: [
            colors['background'] ? `hsl(${colors['background']})` : '#fff',
            colors['primary'] ? `hsl(${colors['primary']})` : '#000',
            colors['foreground'] ? `hsl(${colors['foreground']})` : '#ccc'
        ]
    }

    const current = getImportedThemes()
    localStorage.setItem('aura-imported-themes', JSON.stringify([...current, newTheme]))
    return newTheme
}

export function deleteImportedTheme(id: string) {
    const current = getImportedThemes()
    localStorage.setItem('aura-imported-themes', JSON.stringify(current.filter(t => t.id !== id)))
}

/**
 * Guarda el tema elegido en cookie (1 año de expiración).
 */
export function saveThemeCookie(themeId: ThemeId) {
    document.cookie = `aura-theme=${themeId}; path=/; max-age=31536000; SameSite=Lax`
}

/**
 * Lee los colores personalizados desde la cookie
 */
export function getCustomColorsFromCookie(): Record<string, string> {
    if (typeof document === 'undefined') return {}
    const match = document.cookie.match(/aura-custom-colors=([^;]+)/)
    if (!match) return {}
    try {
        return JSON.parse(decodeURIComponent(match[1]))
    } catch {
        return {}
    }
}

/**
 * Guarda un color específico en la configuración personalizada
 */
export function updateCustomColor(key: string, value: string) {
    const current = getCustomColorsFromCookie()
    const updated = { ...current, [key]: value }
    const json = JSON.stringify(updated)
    document.cookie = `aura-custom-colors=${encodeURIComponent(json)}; path=/; max-age=31536000; SameSite=Lax`

    // Aplicar al instante si estamos en modo custom
    const html = document.documentElement
    html.style.setProperty(`--${key}`, value)
}
