'use client'

import { applyTheme, saveThemeCookie, updateCustomColor, getCustomColorsFromCookie, importThemeFromCSS, getImportedThemes, deleteImportedTheme, THEMES } from '@/components/providers/ThemeProvider'
import { useState } from 'react'
import { Palette, Check, Paintbrush, Info, Settings } from 'lucide-react'
import { toast } from 'sonner'

/**
 * Convierte Hex (#ffffff) a HSL string compatible con Aura CSS Variables
 */
function hexToHsl(hex: string): string {
    let r = parseInt(hex.slice(1, 3), 16) / 255
    let g = parseInt(hex.slice(3, 5), 16) / 255
    let b = parseInt(hex.slice(5, 7), 16) / 255

    let max = Math.max(r, g, b), min = Math.min(r, g, b)
    let h = 0, s = 0, l = (max + min) / 2

    if (max !== min) {
        let d = max - min
        s = l > 0.5 ? d / (2 - max - min) : d / (max + min)
        switch (max) {
            case r: h = (g - b) / d + (g < b ? 6 : 0); break
            case g: h = (b - r) / d + 2; break
            case b: h = (r - g) / d + 4; break
        }
        h /= 6
    }
    return `${Math.round(h * 360)} ${Math.round(s * 100)}% ${Math.round(l * 100)}%`
}

/**
 * Convierte HSL string a Hex (#ffffff) para el input color
 */
function hslToHex(hsl: string): string {
    const parts = hsl.split(' ')
    if (parts.length < 3) return '#ffffff'
    const h = parseInt(parts[0]) / 360
    const s = parseInt(parts[1]) / 100
    const l = parseInt(parts[2]) / 100

    let r, g, b
    if (s === 0) {
        r = g = b = l
    } else {
        const q = l < 0.5 ? l * (1 + s) : l + s - l * s
        const p = 2 * l - q
        const hue2rgb = (t: number) => {
            if (t < 0) t += 1
            if (t > 1) t -= 1
            if (t < 1 / 6) return p + (q - p) * 6 * t
            if (t < 1 / 2) return q
            if (t < 2 / 3) return p + (q - p) * (2 / 3 - t) * 6
            return p
        }
        r = hue2rgb(h + 1 / 3)
        g = hue2rgb(h)
        b = hue2rgb(h - 1 / 3)
    }
    const toHex = (x: number) => {
        const hex = Math.round(x * 255).toString(16)
        return hex.length === 1 ? '0' + hex : hex
    }
    return `#${toHex(r)}${toHex(g)}${toHex(b)}`
}

export default function ConfiguracionPage() {
    const [activeTheme, setActiveTheme] = useState<string>(() => {
        if (typeof document === 'undefined') return 'warm'
        const match = document.cookie.match(/aura-theme=([^;]+)/)
        return match?.[1] || 'warm'
    })

    const [customColors, setCustomColors] = useState<Record<string, string>>(() => getCustomColorsFromCookie())
    const [importedThemes, setImportedThemes] = useState<any[]>(() => getImportedThemes())
    const [isImporting, setIsImporting] = useState(false)
    const [importName, setImportName] = useState('')
    const [importCss, setImportCss] = useState('')

    const handleThemeSelect = (themeId: string) => {
        setActiveTheme(themeId)
        applyTheme(themeId)
        saveThemeCookie(themeId as any)
    }

    const handleColorChange = (key: string, hex: string) => {
        const hsl = hexToHsl(hex)
        setCustomColors(prev => ({ ...prev, [key]: hsl }))
        updateCustomColor(key, hsl)
    }

    const handleImport = () => {
        if (!importName || !importCss) {
            toast.error('Nombre y CSS son obligatorios')
            return
        }
        const newTheme = importThemeFromCSS(importName, importCss)
        if (newTheme) {
            setImportedThemes(getImportedThemes())
            setIsImporting(false)
            setImportName('')
            setImportCss('')
            toast.success('Tema importado correctamente')
        } else {
            toast.error('No se encontraron variables válidas (--nombre: valor;)')
        }
    }

    const handleDelete = (id: string, e: React.MouseEvent) => {
        e.stopPropagation()
        deleteImportedTheme(id)
        setImportedThemes(getImportedThemes())
        if (activeTheme === id) handleThemeSelect('warm')
        toast.info('Tema eliminado')
    }

    const EDITABLE_COLORS = [
        { key: 'background', label: 'Fondo' },
        { key: 'foreground', label: 'Texto' },
        { key: 'primary', label: 'Principal' },
        { key: 'card', label: 'Tarjetas' },
        { key: 'border', label: 'Bordes' },
        { key: 'accent', label: 'Acentos' },
    ]

    const allDisplayThemes = [...THEMES, ...importedThemes]

    return (
        <div className="max-w-4xl mx-auto space-y-10 py-2">
            <div className="space-y-1">
                <div className="flex items-center justify-between">
                    <h1 className="text-2xl font-bold text-foreground flex items-center gap-3">
                        <Paintbrush size={24} className="text-primary-foreground opacity-70" />
                        Configuración
                    </h1>
                    <button 
                        onClick={() => setIsImporting(!isImporting)}
                        className="flex items-center gap-2 px-4 py-2 rounded-xl bg-primary text-primary-foreground text-xs font-bold transition-all hover:scale-105 active:scale-95"
                    >
                        <Settings size={14} />
                        Importar Tema CSS
                    </button>
                </div>
                <p className="text-sm text-muted-foreground">
                    Personaliza la apariencia de Aura OS. Los cambios se aplican al instante.
                </p>
            </div>

            {/* ── Modal / Panel de Importación ── */}
            {isImporting && (
                <section className="rounded-2xl border-2 border-primary/30 bg-primary/5 p-6 shadow-xl animate-in zoom-in-95 duration-300 space-y-4">
                    <h3 className="text-sm font-bold text-foreground">Importador de Temas Inteligente</h3>
                    <div className="space-y-3">
                        <input 
                            type="text" 
                            placeholder="Nombre del tema (ej: Cyberpunk)"
                            value={importName}
                            onChange={(e) => setImportName(e.target.value)}
                            className="w-full px-4 py-2 rounded-lg border border-border bg-background text-sm focus:ring-2 focus:ring-primary outline-none"
                        />
                        <textarea 
                            placeholder="Pega aquí el código CSS (ej: --background: 220 20% 10%; ...)"
                            value={importCss}
                            onChange={(e) => setImportCss(e.target.value)}
                            rows={6}
                            className="w-full px-4 py-2 rounded-lg border border-border bg-background text-xs font-mono focus:ring-2 focus:ring-primary outline-none"
                        />
                        <div className="flex gap-2">
                            <button 
                                onClick={handleImport}
                                className="flex-1 py-2 rounded-lg bg-primary text-primary-foreground text-xs font-bold hover:bg-primary/90"
                            >
                                Guardar e Importar
                            </button>
                            <button 
                                onClick={() => setIsImporting(false)}
                                className="px-4 py-2 rounded-lg bg-muted text-foreground text-xs font-bold"
                            >
                                Cancelar
                            </button>
                        </div>
                    </div>
                </section>
            )}

            <section className="rounded-2xl border border-border bg-card p-6 shadow-sm space-y-5">
                <div className="flex items-center gap-2">
                    <Palette size={18} className="text-muted-foreground" />
                    <h2 className="text-sm font-bold text-foreground uppercase tracking-widest">
                        Temas Disponibles
                    </h2>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                    {allDisplayThemes.map((theme) => {
                        const isActive = activeTheme === theme.id
                        const isImported = theme.id.toString().startsWith('imported-')

                        return (
                            <button
                                key={theme.id}
                                onClick={() => handleThemeSelect(theme.id)}
                                className={`
                                    relative flex items-start gap-4 rounded-xl border p-4 text-left
                                    transition-all duration-200 hover:shadow-md
                                    ${isActive
                                        ? 'border-primary bg-primary/10 shadow-sm ring-2 ring-primary/30'
                                        : 'border-border bg-background hover:border-primary/40 hover:bg-secondary'
                                    }
                                `}
                            >
                                <div className="flex shrink-0 flex-col gap-1 pt-0.5">
                                    {theme.preview.map((color: string, i: number) => (
                                        <div
                                            key={i}
                                            className="h-4 w-4 rounded-full border border-black/10 shadow-inner"
                                            style={{ backgroundColor: color }}
                                        />
                                    ))}
                                </div>
                                <div className="flex-1 min-w-0 pr-6">
                                    <p className="text-sm font-bold text-foreground leading-tight truncate">
                                        {theme.label}
                                    </p>
                                    <p className="mt-1 text-[10px] text-muted-foreground leading-relaxed line-clamp-2">
                                        {theme.description}
                                    </p>
                                </div>
                                
                                {isImported && (
                                    <button 
                                        onClick={(e) => handleDelete(theme.id, e)}
                                        className="absolute bottom-2 right-2 p-1 rounded-md text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-colors"
                                    >
                                        <Check size={14} className="rotate-45" />
                                    </button>
                                )}

                                {isActive && (
                                    <div className="absolute top-3 right-3 h-5 w-5 rounded-full bg-primary flex items-center justify-center">
                                        <Check size={11} className="text-primary-foreground" strokeWidth={3} />
                                    </div>
                                )}
                            </button>
                        )
                    })}
                </div>

                {/* ── Editor Dinámico (Solo para Custom) ── */}
                {activeTheme === 'custom' && (
                    <div className="mt-8 pt-8 border-t border-border animate-in fade-in slide-in-from-top-4 duration-500">
                        <div className="flex items-center justify-between mb-6">
                            <div>
                                <h3 className="text-sm font-bold text-foreground">Editor de Colores</h3>
                                <p className="text-xs text-muted-foreground">Ajusta cada variable en tiempo real.</p>
                            </div>
                            <Paintbrush size={20} className="text-primary" />
                        </div>

                        <div className="grid grid-cols-2 sm:grid-cols-3 gap-6">
                            {EDITABLE_COLORS.map(({ key, label }) => {
                                const currentHsl = customColors[key] || '0 0% 100%'
                                const currentHex = hslToHex(currentHsl)

                                return (
                                    <div key={key} className="space-y-2">
                                        <label className="text-[10px] font-black uppercase tracking-wider text-muted-foreground ml-1">
                                            {label}
                                        </label>
                                        <div className="flex items-center gap-3 p-2 rounded-xl border border-border bg-background/50">
                                            <input
                                                type="color"
                                                value={currentHex}
                                                onChange={(e) => handleColorChange(key, e.target.value)}
                                                className="h-8 w-8 cursor-pointer rounded-lg border-0 bg-transparent p-0"
                                            />
                                            <span className="text-[10px] font-mono font-bold text-foreground opacity-60">
                                                {currentHex.toUpperCase()}
                                            </span>
                                        </div>
                                    </div>
                                )
                            })}
                        </div>
                    </div>
                )}

                <div className="flex items-start gap-2 rounded-xl border border-border bg-muted/40 px-4 py-3 mt-6">
                    <Info size={14} className="mt-0.5 shrink-0 text-muted-foreground" />
                    <p className="text-xs text-muted-foreground">
                        Ahora puedes importar temas pegando el código CSS directamente. Ideal para usar paletas creadas por IA.
                    </p>
                </div>
            </section>
        </div>
    )
}

