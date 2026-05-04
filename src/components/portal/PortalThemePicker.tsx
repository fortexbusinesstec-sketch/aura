'use client'

import { useState, useEffect } from 'react'
import { Palette, Check, X } from 'lucide-react'

interface PortalTheme {
    id: string
    label: string
    preview: string[] // 3 hex colors
    colors?: Record<string, string>
    className?: string | null
}

// Tema Warm (el único estático disponible en el portal)
const WARM_THEME: PortalTheme = {
    id: 'warm',
    label: 'Aura Warm',
    preview: ['#F6F4E8', '#D4A843', '#1A1714'],
    className: null,
}

function applyPortalTheme(theme: PortalTheme) {
    const html = document.documentElement
    // Limpiar todas las clases de tema
    Array.from(html.classList)
        .filter(c => c.endsWith('-theme'))
        .forEach(c => html.classList.remove(c))
    html.removeAttribute('style')

    if (theme.className) {
        html.classList.add(theme.className)
    }
    if (theme.colors) {
        Object.entries(theme.colors).forEach(([k, v]) =>
            html.style.setProperty(`--${k}`, v)
        )
    }
}

function savePortalTheme(portalToken: string, themeId: string) {
    localStorage.setItem(`aura_portal_theme_${portalToken}`, themeId)
    // Actualizar la cookie también para SSR
    document.cookie = `aura-theme=${themeId}; path=/; max-age=31536000; SameSite=Lax`
}

export function PortalThemePicker({ portalToken }: { portalToken: string }) {
    const [isOpen, setIsOpen] = useState(false)
    const [activeId, setActiveId] = useState('warm')
    const [themes, setThemes] = useState<PortalTheme[]>([WARM_THEME])

    useEffect(() => {
        // Cargar temas importados del localStorage
        const stored = localStorage.getItem('aura-imported-themes')
        const imported: PortalTheme[] = stored ? JSON.parse(stored) : []

        // Filtrar solo temas con colores reales y que tengan "contenido" (warm y linear según el usuario)
        const importedFiltered = imported.filter(t => {
            const hasColors = t.colors && Object.keys(t.colors).length > 0
            const isLinear = t.label.toLowerCase().includes('linear') || t.id.toLowerCase().includes('linear')
            return hasColors && isLinear
        }).map(t => ({
            ...t,
            preview: [
                t.colors?.['background'] ? `hsl(${t.colors['background']})` : '#fff',
                t.colors?.['primary'] ? `hsl(${t.colors['primary']})` : '#000',
                t.colors?.['foreground'] ? `hsl(${t.colors['foreground']})` : '#888',
            ]
        }))

        const allAvailable = [WARM_THEME, ...importedFiltered]
        setThemes(allAvailable)

        // Restaurar tema guardado del portal
        const savedId = localStorage.getItem(`aura_portal_theme_${portalToken}`) || 'warm'
        setActiveId(savedId)
        const savedTheme = allAvailable.find(t => t.id === savedId) || WARM_THEME
        applyPortalTheme(savedTheme)
    }, [portalToken])

    const handleSelect = (theme: PortalTheme) => {
        setActiveId(theme.id)
        applyPortalTheme(theme)
        savePortalTheme(portalToken, theme.id)
        setIsOpen(false)
    }

    // Solo mostrar el picker si hay más de un tema disponible
    if (themes.length <= 1) return null

    return (
        <div className="fixed bottom-6 right-6 z-50">
            {/* Panel desplegable */}
            {isOpen && (
                <div className="absolute bottom-14 right-0 mb-2 w-56 bg-card border border-border rounded-2xl shadow-2xl p-3 space-y-2 animate-in zoom-in-95 slide-in-from-bottom-4 duration-200">
                    <div className="flex items-center justify-between px-1 pb-1 border-b border-border/50">
                        <span className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">
                            Tema Visual
                        </span>
                        <button
                            onClick={() => setIsOpen(false)}
                            className="text-muted-foreground hover:text-foreground transition-colors"
                        >
                            <X size={12} />
                        </button>
                    </div>
                    {themes.map(theme => (
                        <button
                            key={theme.id}
                            onClick={() => handleSelect(theme)}
                            className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all text-left
                                ${activeId === theme.id
                                    ? 'bg-primary/10 border border-primary/30'
                                    : 'hover:bg-secondary border border-transparent'
                                }`}
                        >
                            <div className="flex gap-1 shrink-0">
                                {theme.preview.map((color, i) => (
                                    <div
                                        key={i}
                                        className="w-3 h-3 rounded-full border border-black/10"
                                        style={{ backgroundColor: color }}
                                    />
                                ))}
                            </div>
                            <span className="text-xs font-bold text-foreground flex-1 truncate">
                                {theme.label}
                            </span>
                            {activeId === theme.id && (
                                <Check size={12} className="text-primary shrink-0" />
                            )}
                        </button>
                    ))}
                </div>
            )}

            {/* Botón flotante */}
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="w-12 h-12 rounded-2xl bg-card border border-border shadow-xl flex items-center justify-center text-muted-foreground hover:text-primary hover:border-primary/30 transition-all hover:scale-110 active:scale-95"
                title="Cambiar tema visual"
            >
                <Palette size={20} />
            </button>
        </div>
    )
}
