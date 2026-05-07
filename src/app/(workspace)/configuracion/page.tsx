'use client'

import { useState, useEffect, useCallback } from 'react'
import { applyTheme, saveThemeCookie, updateCustomColor, getCustomColorsFromCookie } from '@/components/providers/ThemeProvider'
import { Palette, Check, Paintbrush, Info, Settings, Loader2, Copy, Pencil, Trash2 } from 'lucide-react'
import { toast } from 'sonner'
import { createClient } from '@/utils/supabase/client'
import { Theme } from '@/types'
import { Modal } from '@/components/ui/Modal'

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
    const supabase = createClient()
    const [themes, setThemes] = useState<Theme[]>([])
    const [loading, setLoading] = useState(true)
    const [activeTheme, setActiveTheme] = useState<string>('')
    const [customColors, setCustomColors] = useState<Record<string, string>>(() => getCustomColorsFromCookie())
    
    // Estados para Importación
    const [isImportModalOpen, setIsImportModalOpen] = useState(false)
    const [cssInput, setCssInput] = useState('')
    const [importThemeName, setImportThemeName] = useState('')
    const [isProcessing, setIsProcessing] = useState(false)

    // Estados para Edición
    const [isEditModalOpen, setIsEditModalOpen] = useState(false)
    const [editingTheme, setEditingTheme] = useState<Theme | null>(null)
    const [editName, setEditName] = useState('')
    const [editHslValues, setEditHslValues] = useState<Record<string, string>>({})
    const loadThemes = useCallback(async () => {
        setLoading(true)
        const { data, error } = await supabase
            .from('themes')
            .select('*')
            .eq('is_active', true)
            .order('name')

        if (error) {
            toast.error('Error cargando temas')
        } else {
            setThemes(data || [])
            
            // Determinar tema activo actual (desde cookie o default)
            const match = document.cookie.match(/aura-theme=([^;]+)/)
            const currentSlug = match?.[1]
            if (currentSlug) {
                setActiveTheme(currentSlug)
            } else {
                const def = data?.find(t => t.is_default)
                if (def) setActiveTheme(def.slug)
            }
        }
        setLoading(false)
    }, [supabase])

    useEffect(() => {
        loadThemes()
    }, [loadThemes])

    const handleThemeSelect = async (theme: Theme) => {
        setActiveTheme(theme.slug)
        saveThemeCookie(theme.slug as any)
        
        // Aplicar al instante inyectando HSL al DOM
        const html = document.documentElement
        Object.entries(theme.hsl_values).forEach(([k, v]) => {
            html.style.setProperty(`--${k}`, String(v))
        })

        // Guardar preferencia en el perfil del usuario si está logueado
        const { data: { user } } = await supabase.auth.getUser()
        if (user) {
            await supabase
                .from('profiles')
                .update({ preferred_theme_slug: theme.slug })
                .eq('id', user.id)
        }

        toast.success(`Tema ${theme.name} aplicado`)
    }

    const handleImportCss = async () => {
        if (!cssInput.trim()) return

        setIsProcessing(true)
        try {
            // 1. Determinar nombre del tema (prioridad: input > comentario > default)
            let themeName = importThemeName.trim()
            
            if (!themeName) {
                const commentMatch = cssInput.match(/\/\*\*?\s*(?:AURA OS\s*—\s*)?Tema\s*["']([^"']+)["']\s*\*?\//i)
                const classMatch = cssInput.match(/\.theme-([a-z-]+)/i)
                if (commentMatch) themeName = commentMatch[1]
                else if (classMatch) themeName = classMatch[1].charAt(0).toUpperCase() + classMatch[1].slice(1)
                else themeName = 'Tema Importado'
            }

            // 2. Parsear variables HSL
            const hslValues: Record<string, string> = {}
            const vars = [
                'background', 'foreground', 'card', 'card-foreground', 'popover', 'popover-foreground',
                'primary', 'primary-foreground', 'secondary', 'secondary-foreground', 'muted', 'muted-foreground',
                'accent', 'accent-foreground', 'destructive', 'destructive-foreground', 'success', 'success-foreground',
                'warning', 'warning-foreground', 'border', 'input', 'ring', 'radius'
            ]

            vars.forEach(v => {
                // Regex flexible para: --variable: 220 20% 10%; o --variable: hsl(220 20% 10%);
                const regex = new RegExp(`--${v}:\\s*(?:hsl\\()?([^;)]+)(?:\\))?;`, 'i')
                const match = cssInput.match(regex)
                if (match) {
                    hslValues[v] = match[1].trim()
                }
            })

            if (Object.keys(hslValues).length === 0) {
                toast.error('No se detectaron variables CSS válidas')
                return
            }

            // 3. Guardar en Supabase
            const slug = themeName.toLowerCase().replace(/\s+/g, '-') + '-' + Math.random().toString(36).substring(2, 5)
            
            const { data: newTheme, error } = await supabase
                .from('themes')
                .insert({
                    name: themeName,
                    slug,
                    description: 'Tema importado desde configuración.',
                    hsl_values: hslValues,
                    is_active: true,
                    is_default: false
                })
                .select()
                .single()

            if (error) throw error

            toast.success(`Tema "${themeName}" guardado en Supabase`)
            setCssInput('')
            setImportThemeName('')
            setIsImportModalOpen(false)
            loadThemes() // Recargar galería
            
            if (newTheme) handleThemeSelect(newTheme)
        } catch (err: any) {
            console.error('Error importando:', err)
            toast.error('Error al guardar tema: ' + err.message)
        } finally {
            setIsProcessing(false)
        }
    }

    const handleColorChange = (key: string, hex: string) => {
        const hsl = hexToHsl(hex)
        setCustomColors((prev: Record<string, string>) => ({ ...prev, [key]: hsl }))
        updateCustomColor(key, hsl)
    }

    const handleSaveEdit = async () => {
        if (!editingTheme || !editName.trim()) return

        setIsProcessing(true)
        try {
            const { error } = await supabase
                .from('themes')
                .update({
                    name: editName,
                    hsl_values: editHslValues
                })
                .eq('id', editingTheme.id)

            if (error) throw error

            toast.success('Tema actualizado correctamente')
            setIsEditModalOpen(false)
            loadThemes()
            
            // Si el tema editado es el activo, reaplicar colores
            if (activeTheme === editingTheme.slug) {
                const html = document.documentElement
                Object.entries(editHslValues).forEach(([k, v]) => {
                    html.style.setProperty(`--${k}`, String(v))
                })
            }
        } catch (err: any) {
            toast.error('Error al actualizar: ' + err.message)
        } finally {
            setIsProcessing(false)
        }
    }

    const openEditModal = (theme: Theme, e: React.MouseEvent) => {
        e.stopPropagation()
        setEditingTheme(theme)
        setEditName(theme.name)
        setEditHslValues(theme.hsl_values)
        setIsEditModalOpen(true)
    }

    const handleEditColorChange = (key: string, hex: string) => {
        const hsl = hexToHsl(hex)
        setEditHslValues(prev => ({ ...prev, [key]: hsl }))
    }

    const handleDelete = async (theme: Theme, e: React.MouseEvent) => {
        e.stopPropagation()
        if (theme.is_default) {
            toast.error('No puedes eliminar el tema por defecto')
            return
        }
        if (!confirm(`¿Eliminar tema "${theme.name}"?`)) return

        setIsProcessing(true)
        try {
            // Si el tema a eliminar es el activo, cambiar al default primero
            if (activeTheme === theme.slug) {
                const defaultTheme = themes.find(t => t.is_default)
                if (defaultTheme) {
                    await handleThemeSelect(defaultTheme)
                }
            }

            const { error } = await supabase.from('themes').delete().eq('id', theme.id)
            if (error) {
                console.error('Error deleting theme:', error)
                throw new Error(error.message)
            }
            toast.success('Tema eliminado')
            await loadThemes()
        } catch (err: any) {
            console.error('Caught error during deletion:', err)
            toast.error('No se pudo eliminar el tema. Es posible que esté siendo usado como base por algún cliente.')
        } finally {
            setIsProcessing(false)
        }
    }

    const EDITABLE_VARS = [
        { key: 'primary', label: 'Principal' },
        { key: 'background', label: 'Fondo' },
        { key: 'foreground', label: 'Texto' },
        { key: 'card', label: 'Tarjetas' },
        { key: 'accent', label: 'Acentos' },
        { key: 'border', label: 'Bordes' },
        { key: 'muted', label: 'Muted' },
        { key: 'success', label: 'Éxito' },
        { key: 'warning', label: 'Advertencia' },
        { key: 'destructive', label: 'Error' },
    ]

    return (
        <div className="max-w-4xl mx-auto space-y-10 py-2">
            <div className="space-y-1">
                <div className="flex items-center justify-between">
                    <h1 className="text-2xl font-bold text-foreground flex items-center gap-3">
                        <Paintbrush size={24} className="text-primary-foreground opacity-70" />
                        Configuración
                    </h1>
                    <button 
                        onClick={() => setIsImportModalOpen(true)}
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

            {/* Modal de Importación */}
            <Modal
                isOpen={isImportModalOpen}
                onClose={() => setIsImportModalOpen(false)}
                title="Importar Tema a Supabase"
                maxWidth="max-w-xl"
            >
                <div className="space-y-4">
                    <div className="bg-secondary/50 rounded-xl p-4 border border-border/50 space-y-3">
                        <div className="flex items-center justify-between">
                            <div className="space-y-0.5">
                                <p className="text-[10px] font-black uppercase tracking-widest text-primary">Plantilla Maestra</p>
                                <p className="text-[9px] text-muted-foreground font-medium leading-tight max-w-[280px]">
                                    Copia este esquema y dáselo a la IA indicándole: "Genera un tema compatible con Aura OS usando exactamente estas variables en formato HSL (solo números y %). No omitas ninguna."
                                </p>
                            </div>
                            <button
                                onClick={() => {
                                    const template = `--background: 0 0% 100%;&#10;--foreground: 0 0% 0%;&#10;--primary: 220 100% 50%;&#10;--primary-foreground: 0 0% 100%;&#10;--card: 0 0% 100%;&#10;--card-foreground: 0 0% 0%;&#10;--popover: 0 0% 100%;&#10;--popover-foreground: 0 0% 0%;&#10;--secondary: 220 10% 95%;&#10;--secondary-foreground: 220 10% 10%;&#10;--muted: 220 10% 95%;&#10;--muted-foreground: 220 10% 40%;&#10;--accent: 220 10% 95%;&#10;--accent-foreground: 220 10% 10%;&#10;--destructive: 0 100% 50%;&#10;--destructive-foreground: 0 0% 100%;&#10;--border: 220 10% 90%;&#10;--input: 220 10% 90%;&#10;--ring: 220 100% 50%;&#10;--radius: 0.75rem;`
                                    navigator.clipboard.writeText(template.replace(/&#10;/g, '\n'))
                                    toast.success('Plantilla copiada')
                                }}
                                className="flex items-center gap-1 text-[9px] font-black uppercase tracking-wider text-muted-foreground hover:text-primary transition-colors bg-background/50 px-2 py-1.5 rounded-lg border border-border/50"
                            >
                                <Copy size={10} /> Copiar para IA
                            </button>
                        </div>
                        <pre className="text-[8px] font-mono font-bold text-muted-foreground leading-tight max-h-[100px] overflow-y-auto">
{`--background: ...; --foreground: ...;
--primary: ...; --primary-foreground: ...;
--card: ...; --card-foreground: ...;
--accent: ...; --accent-foreground: ...;
--muted: ...; --muted-foreground: ...;
--success: ...; --warning: ...;
--destructive: ...; --border: ...;
--radius: 0.75rem;`}
                        </pre>
                    </div>

                    <div className="space-y-2">
                        <label className="text-[10px] font-black uppercase tracking-wider text-muted-foreground ml-1">
                            Nombre del Tema (Opcional)
                        </label>
                        <input 
                            type="text"
                            value={importThemeName}
                            onChange={e => setImportThemeName(e.target.value)}
                            placeholder="Ej: Aura Dark, Midnight Blue..."
                            className="w-full px-4 py-3 rounded-xl border border-border bg-background text-sm font-bold focus:ring-2 focus:ring-primary outline-none transition-all"
                        />
                    </div>

                    <div className="space-y-2">
                        <label className="text-[10px] font-black uppercase tracking-wider text-muted-foreground ml-1">
                            Código CSS (Variables HSL)
                        </label>
                        <textarea
                            value={cssInput}
                            onChange={e => setCssInput(e.target.value)}
                            placeholder="Pega aquí tu CSS...&#10;--primary: 220 100% 50%;"
                            rows={6}
                            className="w-full px-4 py-3 rounded-xl border border-border bg-background text-[11px] font-mono font-bold text-foreground focus:ring-2 focus:ring-primary outline-none transition-all resize-none"
                        />
                    </div>
                    
                    <button
                        onClick={handleImportCss}
                        disabled={isProcessing}
                        className="w-full flex items-center justify-center gap-2 px-5 py-3 rounded-xl bg-primary text-primary-foreground text-xs font-black uppercase tracking-wider hover:bg-primary/90 transition-all disabled:opacity-50"
                    >
                        {isProcessing ? <Loader2 className="animate-spin" size={14} /> : 'Guardar en Supabase'}
                    </button>
                </div>
            </Modal>

            {/* Modal de Edición */}
            <Modal
                isOpen={isEditModalOpen}
                onClose={() => setIsEditModalOpen(false)}
                title={`Editar Tema: ${editingTheme?.name}`}
                maxWidth="max-w-2xl"
            >
                <div className="space-y-6">
                    <div className="space-y-2">
                        <label className="text-[10px] font-black uppercase tracking-wider text-muted-foreground ml-1">
                            Nombre del Tema
                        </label>
                        <input 
                            type="text"
                            value={editName}
                            onChange={e => setEditName(e.target.value)}
                            className="w-full px-4 py-3 rounded-xl border border-border bg-background text-sm font-bold focus:ring-2 focus:ring-primary outline-none transition-all"
                        />
                    </div>

                    <div className="space-y-4">
                        <p className="text-[10px] font-black uppercase tracking-wider text-primary ml-1">Paleta de Colores</p>
                        <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                            {EDITABLE_VARS.map(({ key, label }) => {
                                const currentHsl = editHslValues[key] || '0 0% 100%'
                                const currentHex = hslToHex(currentHsl)

                                return (
                                    <div key={key} className="space-y-1.5">
                                        <label className="text-[9px] font-bold text-muted-foreground ml-1">
                                            {label}
                                        </label>
                                        <div className="flex items-center gap-2 p-2 rounded-lg border border-border bg-secondary/30">
                                            <input
                                                type="color"
                                                value={currentHex}
                                                onChange={(e) => handleEditColorChange(key, e.target.value)}
                                                className="h-6 w-6 cursor-pointer rounded border-0 bg-transparent p-0"
                                            />
                                            <span className="text-[9px] font-mono font-bold text-foreground opacity-60">
                                                {currentHex.toUpperCase()}
                                            </span>
                                        </div>
                                    </div>
                                )
                            })}
                        </div>
                    </div>

                    <button
                        onClick={handleSaveEdit}
                        disabled={isProcessing}
                        className="w-full flex items-center justify-center gap-2 px-5 py-3 rounded-xl bg-primary text-primary-foreground text-xs font-black uppercase tracking-wider hover:bg-primary/90 transition-all disabled:opacity-50"
                    >
                        {isProcessing ? <Loader2 className="animate-spin" size={14} /> : 'Guardar Cambios'}
                    </button>
                </div>
            </Modal>

            <section className="rounded-2xl border border-border bg-card p-6 shadow-sm space-y-5">
                <div className="flex items-center gap-2">
                    <Palette size={18} className="text-muted-foreground" />
                    <h2 className="text-sm font-bold text-foreground uppercase tracking-widest">
                        Temas Disponibles
                    </h2>
                </div>

                {loading ? (
                    <div className="flex flex-col items-center justify-center py-12 space-y-3">
                        <Loader2 className="animate-spin text-primary" size={24} />
                        <p className="text-xs text-muted-foreground font-bold uppercase tracking-wider">Cargando Galería...</p>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                        {themes.map((theme: Theme) => {
                            const isActive = activeTheme === theme.slug
                            
                            // Colores para el preview (background, primary, card)
                            const previewColors = [
                                theme.hsl_values.background,
                                theme.hsl_values.primary,
                                theme.hsl_values.card
                            ].filter(Boolean)

                            return (
                                <div
                                    key={theme.id}
                                    onClick={() => handleThemeSelect(theme)}
                                    className={`
                                        group relative flex items-start gap-4 rounded-xl border p-5 text-left
                                        transition-all duration-200 hover:shadow-md cursor-pointer min-h-[88px]
                                        ${isActive
                                            ? 'border-primary bg-primary/10 shadow-sm ring-2 ring-primary/30'
                                            : 'border-border bg-background hover:border-primary/40 hover:bg-secondary'
                                        }
                                    `}
                                >
                                    <div className="flex shrink-0 flex-col gap-1.5 pt-0.5">
                                        {previewColors.map((hsl, i) => (
                                            <div
                                                key={i}
                                                className="h-4 w-4 rounded-full border border-black/10 shadow-inner"
                                                style={{ backgroundColor: `hsl(${hsl})` }}
                                            />
                                        ))}
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <p className="text-sm font-bold text-foreground leading-tight truncate">
                                            {theme.name}
                                        </p>
                                        <p className="mt-1 text-[10px] text-muted-foreground leading-relaxed line-clamp-2">
                                            {theme.description}
                                        </p>
                                    </div>
                                    
                                    {isActive && (
                                        <div className="flex items-center gap-1 shrink-0">
                                            <div className="h-6 w-6 rounded-full bg-primary flex items-center justify-center" title="Activo">
                                                <Check size={12} className="text-primary-foreground" strokeWidth={3} />
                                            </div>
                                            <button
                                                onClick={(e) => openEditModal(theme, e)}
                                                className="h-6 w-6 rounded-lg text-primary hover:bg-primary/20 transition-all flex items-center justify-center"
                                                title="Editar"
                                            >
                                                <Pencil size={12} />
                                            </button>
                                            {!theme.is_default && (
                                                <button
                                                    onClick={(e) => handleDelete(theme, e)}
                                                    className="h-6 w-6 rounded-lg text-destructive hover:bg-destructive/10 transition-all flex items-center justify-center"
                                                    title="Eliminar"
                                                >
                                                    <Trash2 size={12} />
                                                </button>
                                            )}
                                        </div>
                                    )}

                                    {!isActive && (
                                        <div className="flex items-center gap-1 shrink-0 opacity-0 group-hover:opacity-100 transition-opacity">
                                            <button
                                                onClick={(e) => openEditModal(theme, e)}
                                                className="h-6 w-6 rounded-lg text-muted-foreground hover:text-primary hover:bg-primary/10 transition-all flex items-center justify-center"
                                                title="Editar"
                                            >
                                                <Pencil size={12} />
                                            </button>
                                            {!theme.is_default && (
                                                <button
                                                    onClick={(e) => handleDelete(theme, e)}
                                                    className="h-6 w-6 rounded-lg text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-all flex items-center justify-center"
                                                    title="Eliminar"
                                                >
                                                    <Trash2 size={12} />
                                                </button>
                                            )}
                                        </div>
                                    )}
                                </div>
                            )
                        })}
                    </div>
                )}

                <div className="flex items-start gap-2 rounded-xl border border-border bg-muted/40 px-4 py-3 mt-6">
                    <Info size={14} className="mt-0.5 shrink-0 text-muted-foreground" />
                    <p className="text-xs text-muted-foreground">
                        Ahora puedes importar o editar temas directamente. Los cambios se sincronizan con Supabase para todos tus dispositivos.
                    </p>
                </div>
            </section>
        </div>
    )
}

