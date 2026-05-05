'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/utils/supabase/client'
import { Theme, ClientTheme } from '@/types'

interface ThemeInjectorProps {
    source: 'system' | 'client' | 'user'
    themeSlug?: string
    clientId?: string
    children: React.ReactNode
}

/**
 * ═══════════════════════════════════════════════════════════════
 *  AURA OS — ThemeInjector
 *  Inyecta variables CSS dinámicas en :root según la fuente:
 *  - 'system': tema por defecto de la tabla themes
 *  - 'user': tema preferido del usuario logueado
 *  - 'client': tema personalizado del cliente (portales)
 * ═══════════════════════════════════════════════════════════════
 */

export function ThemeInjector({ source, themeSlug, clientId, children }: ThemeInjectorProps) {
    const [isLoaded, setIsLoaded] = useState(false)
    const supabase = createClient()

    useEffect(() => {
        const inject = async () => {
            const html = document.documentElement

            // Limpiar variables previas inyectadas dinámicamente
            // (conservamos las del :root estático en CSS)
            const dynamicVars = [
                '--background', '--foreground', '--card', '--card-foreground',
                '--popover', '--popover-foreground', '--primary', '--primary-foreground',
                '--secondary', '--secondary-foreground', '--muted', '--muted-foreground',
                '--accent', '--accent-foreground', '--destructive', '--destructive-foreground',
                '--success', '--success-foreground', '--warning', '--warning-foreground',
                '--border', '--input', '--ring', '--radius',
                '--font-heading', '--font-body',
            ]
            dynamicVars.forEach(v => html.style.removeProperty(v))

            try {
                if (source === 'client' && clientId) {
                    // ═══════════════════════════════════════════════════
                    // MODO CLIENTE: cargar tema del cliente desde BD
                    // ═══════════════════════════════════════════════════
                    const { data: clientTheme } = await supabase
                        .from('client_themes')
                        .select('*, base_theme:themes(*)')
                        .eq('client_id', clientId)
                        .maybeSingle()

                    if (clientTheme) {
                        const ct = clientTheme as ClientTheme & { base_theme?: Theme }
                        const baseHsl = ct.base_theme?.hsl_values || {}
                        const overrides = ct.custom_hsl_overrides || {}
                        const merged = { ...baseHsl, ...overrides }

                        Object.entries(merged).forEach(([key, value]) => {
                            if (value) html.style.setProperty(`--${key}`, String(value))
                        })

                        // Tipografía
                        if (ct.font_heading) html.style.setProperty('--font-heading', ct.font_heading)
                        if (ct.font_body) html.style.setProperty('--font-body', ct.font_body)
                    } else {
                        // Si no hay tema de cliente, usar tema default del sistema
                        await loadSystemDefault(supabase, html)
                    }
                } else if (source === 'user' && themeSlug) {
                    // ═══════════════════════════════════════════════════
                    // MODO USUARIO: tema preferido del perfil
                    // ═══════════════════════════════════════════════════
                    const { data: theme } = await supabase
                        .from('themes')
                        .select('*')
                        .eq('slug', themeSlug)
                        .eq('is_active', true)
                        .maybeSingle()

                    if (theme) {
                        applyHslValues(theme.hsl_values, html)
                    } else {
                        await loadSystemDefault(supabase, html)
                    }
                } else {
                    // ═══════════════════════════════════════════════════
                    // MODO SISTEMA: tema por defecto
                    // ═══════════════════════════════════════════════════
                    await loadSystemDefault(supabase, html)
                }
            } catch (err) {
                console.error('[ThemeInjector] Error cargando tema:', err)
            }

            setIsLoaded(true)
        }

        inject()
    }, [source, themeSlug, clientId])

    return <>{children}</>
}

// Helper: cargar tema default del sistema
async function loadSystemDefault(supabase: ReturnType<typeof createClient>, html: HTMLElement) {
    const { data: theme } = await supabase
        .from('themes')
        .select('*')
        .eq('is_default', true)
        .eq('is_active', true)
        .maybeSingle()

    if (theme) {
        applyHslValues(theme.hsl_values, html)
    }
}

// Helper: aplicar valores HSL al html
function applyHslValues(hslValues: Record<string, string>, html: HTMLElement) {
    Object.entries(hslValues).forEach(([key, value]) => {
        if (value) html.style.setProperty(`--${key}`, value)
    })
}
