'use client'

import { useState, useEffect, useCallback } from 'react'
import { createClient } from '@/utils/supabase/client'
import { Theme, ClientTheme } from '@/types'
import {
    Palette,
    Upload,
    Type,
    Save,
    Loader2,
    X,
    Eye,
    ImageIcon,
    FileCode,
    Copy,
} from 'lucide-react'
import { Modal } from '@/components/ui/Modal'
import { toast } from 'sonner'

// ═══════════════════════════════════════════════════════════════
//  HELPERS: HEX ↔ HSL
// ═══════════════════════════════════════════════════════════════

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

const OVERRIDE_VARS = [
    { key: 'primary', label: 'Color Principal' },
    { key: 'primary-foreground', label: 'Texto sobre Principal' },
    { key: 'accent', label: 'Color de Acento' },
    { key: 'accent-foreground', label: 'Texto sobre Acento' },
    { key: 'background', label: 'Fondo' },
    { key: 'foreground', label: 'Texto' },
    { key: 'card', label: 'Tarjetas' },
    { key: 'card-foreground', label: 'Texto Tarjetas' },
    { key: 'popover', label: 'Popovers' },
    { key: 'popover-foreground', label: 'Texto Popovers' },
    { key: 'secondary', label: 'Secundario' },
    { key: 'secondary-foreground', label: 'Texto Secundario' },
    { key: 'muted', label: 'Muted' },
    { key: 'muted-foreground', label: 'Texto Muted' },
    { key: 'success', label: 'Éxito' },
    { key: 'success-foreground', label: 'Texto Éxito' },
    { key: 'warning', label: 'Advertencia' },
    { key: 'warning-foreground', label: 'Texto Advertencia' },
    { key: 'destructive', label: 'Error/Eliminar' },
    { key: 'destructive-foreground', label: 'Texto Error' },
    { key: 'border', label: 'Bordes' },
    { key: 'input', label: 'Inputs' },
    { key: 'ring', label: 'Anillo de Enfoque' },
    { key: 'radius', label: 'Radio de Bordes (rem)' },
]

const FONT_OPTIONS = ['Inter', 'Montserrat', 'Roboto', 'Open Sans', 'Lato', 'Poppins', 'Playfair Display', 'Merriweather']

interface ClientThemePanelProps {
    clientId: string
}

export function ClientThemePanel({ clientId }: ClientThemePanelProps) {
    const supabase = createClient()
    const [loading, setLoading] = useState(true)
    const [saving, setSaving] = useState(false)
    const [showPreview, setShowPreview] = useState(false)

    const [systemThemes, setSystemThemes] = useState<Theme[]>([])
    const [baseThemeId, setBaseThemeId] = useState<string>('')
    const [overrides, setOverrides] = useState<Record<string, string>>({})
    const [logoUrl, setLogoUrl] = useState('')
    const [faviconUrl, setFaviconUrl] = useState('')
    const [fontHeading, setFontHeading] = useState('Inter')
    const [fontBody, setFontBody] = useState('Inter')
    const [clientThemeId, setClientThemeId] = useState<string | null>(null)

    // CSS Import state
    const [isImportModalOpen, setIsImportModalOpen] = useState(false)
    const [cssInput, setCssInput] = useState('')

    // Cargar datos
    const loadData = useCallback(async () => {
        setLoading(true)

        // Temas del sistema
        const { data: themes } = await supabase
            .from('themes')
            .select('*')
            .eq('is_active', true)
            .order('name')
        setSystemThemes(themes || [])

        // Tema del cliente
        const { data: ct } = await supabase
            .from('client_themes')
            .select('*')
            .eq('client_id', clientId)
            .maybeSingle()

        if (ct) {
            setClientThemeId(ct.id)
            setBaseThemeId(ct.base_theme_id || '')
            setOverrides(ct.custom_hsl_overrides || {})
            setLogoUrl(ct.logo_url || '')
            setFaviconUrl(ct.favicon_url || '')
            setFontHeading(ct.font_heading || 'Inter')
            setFontBody(ct.font_body || 'Inter')
        }

        setLoading(false)
    }, [supabase, clientId])

    useEffect(() => {
        loadData()
    }, [loadData])

    // Subir archivo a Supabase Storage
    const uploadFile = async (file: File, bucket: string, path: string): Promise<string | null> => {
        const { error } = await supabase.storage.from(bucket).upload(path, file, { upsert: true })
        if (error) {
            toast.error('Error subiendo archivo: ' + error.message)
            return null
        }
        const { data: urlData } = supabase.storage.from(bucket).getPublicUrl(path)
        return urlData?.publicUrl || null
    }

    const handleLogoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0]
        if (!file) return
        const path = `clients/${clientId}/logo-${Date.now()}.${file.name.split('.').pop()}`
        const url = await uploadFile(file, 'client-assets', path)
        if (url) {
            setLogoUrl(url)
            toast.success('Logo subido')
        }
    }

    const handleFaviconUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0]
        if (!file) return
        const path = `clients/${clientId}/favicon-${Date.now()}.${file.name.split('.').pop()}`
        const url = await uploadFile(file, 'client-assets', path)
        if (url) {
            setFaviconUrl(url)
            toast.success('Favicon subido')
        }
    }

    const handleOverrideChange = (key: string, hex: string) => {
        const hsl = hexToHsl(hex)
        setOverrides(prev => ({ ...prev, [key]: hsl }))
    }

    const handleRemoveOverride = (key: string) => {
        setOverrides(prev => {
            const next = { ...prev }
            delete next[key]
            return next
        })
    }

    const handleImportCss = () => {
        if (!cssInput.trim()) return

        const newOverrides = { ...overrides }
        const regex = /--([a-z-]+):\s*([^;]+);/g
        let match
        let found = 0

        while ((match = regex.exec(cssInput)) !== null) {
            const key = match[1]
            let value = match[2].trim()

            // Solo importar variables que manejamos en overrides
            if (OVERRIDE_VARS.some(v => v.key === key)) {
                const cleanValue = value.replace(/hsla?\(|\)/g, '').trim()
                newOverrides[key] = cleanValue
                found++
            }
        }

        if (found > 0) {
            setOverrides(newOverrides)
            setIsImportModalOpen(false)
            setCssInput('')
            toast.success(`Se importaron ${found} overrides correctamente`)
        } else {
            toast.error('No se encontraron variables CSS compatibles (ej: --primary: 0 0% 0%;)')
        }
    }

    const handleSave = async () => {
        setSaving(true)

        const payload = {
            client_id: clientId,
            base_theme_id: baseThemeId || null,
            custom_hsl_overrides: overrides,
            logo_url: logoUrl || null,
            favicon_url: faviconUrl || null,
            font_heading: fontHeading,
            font_body: fontBody,
            is_active: true,
            updated_at: new Date().toISOString(),
        }

        if (clientThemeId) {
            const { error } = await supabase
                .from('client_themes')
                .update(payload)
                .eq('id', clientThemeId)
            if (error) toast.error('Error guardando: ' + error.message)
            else toast.success('Configuración del portal guardada')
        } else {
            const { data, error } = await supabase
                .from('client_themes')
                .insert([payload])
                .select()
                .single()
            if (error) toast.error('Error creando: ' + error.message)
            else {
                setClientThemeId(data.id)
                toast.success('Configuración del portal creada')
            }
        }

        setSaving(false)
    }

    const baseTheme = systemThemes.find(t => t.id === baseThemeId)
    const mergedHsl = { ...(baseTheme?.hsl_values || {}), ...overrides }

    if (loading) {
        return (
            <div className="flex items-center justify-center py-12">
                <Loader2 size={24} className="text-primary animate-spin" />
            </div>
        )
    }

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center gap-2">
                <Palette size={16} className="text-primary" />
                <h3 className="text-sm font-black uppercase tracking-tighter text-foreground">Tema del Portal del Cliente</h3>
            </div>

            {/* Tema Base */}
            <div className="space-y-1.5">
                <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Tema Base del Sistema</label>
                <select
                    value={baseThemeId}
                    onChange={e => setBaseThemeId(e.target.value)}
                    className="w-full px-4 py-2.5 rounded-xl border border-border bg-background text-sm font-bold text-foreground focus:ring-2 focus:ring-primary outline-none transition-all"
                >
                    <option value="">Seleccionar tema base...</option>
                    {systemThemes.map(t => (
                        <option key={t.id} value={t.id}>{t.name}</option>
                    ))}
                </select>
                {baseTheme && (
                    <p className="text-[10px] text-muted-foreground font-medium">
                        {baseTheme.description || 'Sin descripción'}
                    </p>
                )}
            </div>

            {/* Overrides de colores */}
            <div className="space-y-3">
                <div className="flex items-center justify-between">
                    <div className="space-y-1">
                        <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Personalización de Colores (Overrides)</label>
                        <p className="text-[10px] text-muted-foreground/70 font-medium">
                            Solo los colores modificados se guardan. Los demás heredan del tema base.
                        </p>
                    </div>
                    <button
                        onClick={() => setIsImportModalOpen(true)}
                        className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-secondary text-[9px] font-black uppercase tracking-wider text-muted-foreground hover:bg-secondary/80 transition-all border border-border/50"
                    >
                        <FileCode size={12} /> Importar CSS
                    </button>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {OVERRIDE_VARS.map(({ key, label }) => {
                        const baseValue = baseTheme?.hsl_values?.[key] || ''
                        const overrideValue = overrides[key]
                        const currentValue = overrideValue || baseValue
                        const hexValue = currentValue ? hslToHex(currentValue) : '#ffffff'
                        const isOverridden = !!overrideValue

                        return (
                            <div key={key} className={`flex items-center gap-3 p-2.5 rounded-xl border ${
                                isOverridden ? 'border-primary/40 bg-primary/5' : 'border-border/50 bg-secondary/30'
                            }`}>
                                <input
                                    type="color"
                                    value={hexValue}
                                    onChange={e => handleOverrideChange(key, e.target.value)}
                                    className="h-8 w-8 shrink-0 cursor-pointer rounded-lg border-0 bg-transparent p-0"
                                />
                                <div className="flex-1 min-w-0">
                                    <div className="flex items-center gap-1.5">
                                        <span className="text-[10px] font-bold text-foreground">{label}</span>
                                        {isOverridden && (
                                            <span className="text-[8px] font-black uppercase tracking-wider text-primary bg-primary/10 px-1 py-0.5 rounded">
                                                Override
                                            </span>
                                        )}
                                    </div>
                                    <span className="text-[9px] font-mono text-muted-foreground/60">{currentValue}</span>
                                </div>
                                {isOverridden && (
                                    <button
                                        onClick={() => handleRemoveOverride(key)}
                                        className="p-1 rounded-md text-muted-foreground/40 hover:text-destructive hover:bg-destructive/10 transition-colors"
                                        title="Restaurar valor del tema base"
                                    >
                                        <X size={12} />
                                    </button>
                                )}
                            </div>
                        )
                    })}
                </div>
            </div>

            {/* Assets Visuales */}
            <div className="space-y-3">
                <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Assets Visuales</label>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {/* Logo */}
                    <div className="space-y-2">
                        <div className="flex items-center gap-2">
                            <ImageIcon size={12} className="text-muted-foreground" />
                            <span className="text-[10px] font-bold text-foreground uppercase tracking-wider">Logo del Portal</span>
                        </div>
                        {logoUrl ? (
                            <div className="relative rounded-xl border border-border/50 bg-secondary/30 p-3">
                                <img src={logoUrl} alt="Logo" className="h-12 w-auto object-contain mx-auto" />
                                <button
                                    onClick={() => setLogoUrl('')}
                                    className="absolute top-1 right-1 p-1 rounded-md text-muted-foreground/40 hover:text-destructive transition-colors"
                                >
                                    <X size={12} />
                                </button>
                            </div>
                        ) : (
                            <label className="flex flex-col items-center justify-center gap-2 p-4 rounded-xl border border-dashed border-border/50 bg-secondary/20 cursor-pointer hover:bg-secondary/40 transition-colors">
                                <Upload size={16} className="text-muted-foreground" />
                                <span className="text-[10px] font-bold text-muted-foreground">Subir logo</span>
                                <input type="file" accept="image/*" className="hidden" onChange={handleLogoUpload} />
                            </label>
                        )}
                    </div>

                    {/* Favicon */}
                    <div className="space-y-2">
                        <div className="flex items-center gap-2">
                            <ImageIcon size={12} className="text-muted-foreground" />
                            <span className="text-[10px] font-bold text-foreground uppercase tracking-wider">Favicon</span>
                        </div>
                        {faviconUrl ? (
                            <div className="relative rounded-xl border border-border/50 bg-secondary/30 p-3 flex items-center justify-center">
                                <img src={faviconUrl} alt="Favicon" className="h-8 w-8 object-contain" />
                                <button
                                    onClick={() => setFaviconUrl('')}
                                    className="absolute top-1 right-1 p-1 rounded-md text-muted-foreground/40 hover:text-destructive transition-colors"
                                >
                                    <X size={12} />
                                </button>
                            </div>
                        ) : (
                            <label className="flex flex-col items-center justify-center gap-2 p-4 rounded-xl border border-dashed border-border/50 bg-secondary/20 cursor-pointer hover:bg-secondary/40 transition-colors">
                                <Upload size={16} className="text-muted-foreground" />
                                <span className="text-[10px] font-bold text-muted-foreground">Subir favicon</span>
                                <input type="file" accept="image/*" className="hidden" onChange={handleFaviconUpload} />
                            </label>
                        )}
                    </div>
                </div>
            </div>

            {/* Tipografía */}
            <div className="space-y-3">
                <div className="flex items-center gap-2">
                    <Type size={12} className="text-muted-foreground" />
                    <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Tipografía</label>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-1">
                        <span className="text-[9px] font-bold text-muted-foreground">Fuente Títulos</span>
                        <select
                            value={fontHeading}
                            onChange={e => setFontHeading(e.target.value)}
                            className="w-full px-3 py-2 rounded-lg border border-border bg-background text-xs font-bold text-foreground focus:ring-2 focus:ring-primary outline-none"
                        >
                            {FONT_OPTIONS.map(f => <option key={f} value={f}>{f}</option>)}
                        </select>
                    </div>
                    <div className="space-y-1">
                        <span className="text-[9px] font-bold text-muted-foreground">Fuente Cuerpo</span>
                        <select
                            value={fontBody}
                            onChange={e => setFontBody(e.target.value)}
                            className="w-full px-3 py-2 rounded-lg border border-border bg-background text-xs font-bold text-foreground focus:ring-2 focus:ring-primary outline-none"
                        >
                            {FONT_OPTIONS.map(f => <option key={f} value={f}>{f}</option>)}
                        </select>
                    </div>
                </div>
            </div>

            {/* Preview del portal */}
            <div className="rounded-xl border border-border/50 p-4 space-y-3">
                <div className="flex items-center justify-between">
                    <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Preview del Portal</p>
                    <button
                        onClick={() => setShowPreview(!showPreview)}
                        className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-secondary text-[9px] font-black uppercase tracking-wider text-muted-foreground hover:bg-secondary/80 transition-all"
                    >
                        <Eye size={10} /> {showPreview ? 'Ocultar' : 'Ver'}
                    </button>
                </div>

                {showPreview && (
                    <div
                        className="rounded-lg p-4 space-y-3 border"
                        style={{
                            background: `hsl(${mergedHsl.background})`,
                            color: `hsl(${mergedHsl.foreground})`,
                            borderColor: `hsl(${mergedHsl.border})`,
                            borderRadius: mergedHsl.radius,
                            fontFamily: fontBody,
                        }}
                    >
                        {/* Header simulado */}
                        <div
                            className="flex items-center justify-between px-4 py-3 rounded-lg border"
                            style={{
                                background: `hsl(${mergedHsl.card})`,
                                borderColor: `hsl(${mergedHsl.border})`,
                            }}
                        >
                            <div className="flex items-center gap-2">
                                {logoUrl ? (
                                    <img src={logoUrl} alt="Logo" className="h-6 w-auto object-contain" />
                                ) : (
                                    <div
                                        className="w-6 h-6 rounded-md"
                                        style={{ background: `hsl(${mergedHsl.primary})` }}
                                    />
                                )}
                                <span
                                    className="text-xs font-black"
                                    style={{
                                        color: `hsl(${mergedHsl['card-foreground']})`,
                                        fontFamily: fontHeading,
                                    }}
                                >
                                    Portal del Cliente
                                </span>
                            </div>
                            <span
                                className="px-2 py-0.5 rounded text-[9px] font-black uppercase"
                                style={{ background: `hsl(${mergedHsl.primary})`, color: `hsl(${mergedHsl['primary-foreground']})` }}
                            >
                                Activo
                            </span>
                        </div>

                        <div
                            className="p-3 rounded-lg border text-[10px] font-bold"
                            style={{
                                background: `hsl(${mergedHsl.card})`,
                                color: `hsl(${mergedHsl['card-foreground']})`,
                                borderColor: `hsl(${mergedHsl.border})`,
                            }}
                        >
                            Contenido de ejemplo con tipografía personalizada
                        </div>

                        <div className="flex items-center gap-2">
                            <span style={{ color: `hsl(${mergedHsl.success})` }}>✓ Aprobado</span>
                            <span style={{ color: `hsl(${mergedHsl.warning})` }}>⚠ Pendiente</span>
                        </div>
                    </div>
                )}
            </div>

            {/* Guardar */}
            <button
                onClick={handleSave}
                disabled={saving}
                className="w-full flex items-center justify-center gap-2 px-5 py-3 rounded-xl bg-primary text-primary-foreground text-xs font-black uppercase tracking-wider hover:bg-primary/90 disabled:opacity-50 transition-all active:scale-95"
            >
                {saving ? <Loader2 size={14} className="animate-spin" /> : <Save size={14} />}
                Guardar Configuración del Portal
            </button>

            {/* Modal Importar CSS */}
            <Modal
                isOpen={isImportModalOpen}
                onClose={() => setIsImportModalOpen(false)}
                title="Importar Overrides desde CSS"
                maxWidth="max-w-xl"
            >
                <div className="space-y-4">
                    <div className="bg-secondary/50 rounded-xl p-4 border border-border/50 space-y-3">
                        <div className="flex items-center justify-between">
                            <p className="text-[10px] font-black uppercase tracking-widest text-primary">Estructura de Overrides</p>
                            <button
                                onClick={() => {
                                    const template = `--background: 198 67% 95%;&#10;--foreground: 206 57% 12%;&#10;--card: 0 0% 100%;&#10;--card-foreground: 206 57% 12%;&#10;--popover: 0 0% 100%;&#10;--popover-foreground: 206 57% 12%;&#10;--primary: 199 89% 48%;&#10;--primary-foreground: 0 0% 100%;&#10;--secondary: 198 40% 90%;&#10;--secondary-foreground: 206 57% 12%;&#10;--muted: 198 30% 88%;&#10;--muted-foreground: 206 20% 40%;&#10;--accent: 199 80% 92%;&#10;--accent-foreground: 199 89% 48%;&#10;--destructive: 0 84% 60%;&#10;--destructive-foreground: 0 0% 100%;&#10;--success: 142 70% 45%;&#10;--success-foreground: 142 80% 15%;&#10;--warning: 38 92% 50%;&#10;--warning-foreground: 38 90% 10%;&#10;--border: 198 30% 85%;&#10;--input: 198 30% 85%;&#10;--ring: 199 89% 48%;&#10;--radius: 0.75rem;`
                                    navigator.clipboard.writeText(template.replace(/&#10;/g, '\n'))
                                    toast.success('Plantilla completa copiada')
                                }}
                                className="flex items-center gap-1 text-[9px] font-black uppercase tracking-wider text-muted-foreground hover:text-primary transition-colors"
                            >
                                <Copy size={10} /> Copiar Plantilla Completa
                            </button>
                        </div>
                        <pre className="text-[8px] font-mono font-bold text-muted-foreground leading-tight max-h-[120px] overflow-y-auto pr-2">
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

                    <p className="text-[11px] text-muted-foreground font-medium leading-relaxed">
                        Pega aquí las variables CSS que deseas sobrescribir. Solo se procesarán variables de color compatibles.
                    </p>
                    <textarea
                        value={cssInput}
                        onChange={e => setCssInput(e.target.value)}
                        placeholder="--primary: 43 89% 38%;&#10;--accent: 48 40% 89%;"
                        rows={6}
                        className="w-full px-4 py-3 rounded-xl border border-border bg-background text-[11px] font-mono font-bold text-foreground focus:ring-2 focus:ring-primary outline-none transition-all resize-none"
                    />
                    <div className="flex items-center gap-3 pt-2">
                        <button
                            onClick={handleImportCss}
                            className="flex-1 flex items-center justify-center gap-2 px-5 py-3 rounded-xl bg-primary text-primary-foreground text-xs font-black uppercase tracking-wider hover:bg-primary/90 transition-all active:scale-95"
                        >
                            Aplicar Overrides
                        </button>
                        <button
                            onClick={() => setIsImportModalOpen(false)}
                            className="px-5 py-3 rounded-xl border border-border text-xs font-black uppercase tracking-wider text-muted-foreground hover:bg-secondary transition-all"
                        >
                            Cancelar
                        </button>
                    </div>
                </div>
            </Modal>
        </div>
    )
}
