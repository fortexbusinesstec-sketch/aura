'use client'

import { useState, useEffect, useCallback } from 'react'
import { createClient } from '@/utils/supabase/client'
import { Modal } from '@/components/ui/Modal'
import { PageHeader } from '@/components/ui/PageHeader'
import { Theme } from '@/types'
import {
    Plus,
    Paintbrush,
    Trash2,
    Star,
    Check,
    Palette,
    Eye,
    Save,
    X,
    Loader2,
    Copy,
} from 'lucide-react'
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

function kebabCase(str: string): string {
    return str
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/^-+|-+$/g, '')
}

// ═══════════════════════════════════════════════════════════════
//  VARIABLES CSS EDITABLES
// ═══════════════════════════════════════════════════════════════

const EDITABLE_VARS = [
    { key: 'background', label: 'Fondo' },
    { key: 'foreground', label: 'Texto' },
    { key: 'card', label: 'Tarjetas' },
    { key: 'card-foreground', label: 'Texto Tarjetas' },
    { key: 'popover', label: 'Popover' },
    { key: 'popover-foreground', label: 'Texto Popover' },
    { key: 'primary', label: 'Principal' },
    { key: 'primary-foreground', label: 'Texto Principal' },
    { key: 'secondary', label: 'Secundario' },
    { key: 'secondary-foreground', label: 'Texto Secundario' },
    { key: 'muted', label: 'Muted' },
    { key: 'muted-foreground', label: 'Texto Muted' },
    { key: 'accent', label: 'Acento' },
    { key: 'accent-foreground', label: 'Texto Acento' },
    { key: 'destructive', label: 'Destructivo' },
    { key: 'destructive-foreground', label: 'Texto Destructivo' },
    { key: 'success', label: 'Éxito' },
    { key: 'success-foreground', label: 'Texto Éxito' },
    { key: 'warning', label: 'Advertencia' },
    { key: 'warning-foreground', label: 'Texto Advertencia' },
    { key: 'border', label: 'Bordes' },
    { key: 'input', label: 'Inputs' },
    { key: 'ring', label: 'Ring / Foco' },
    { key: 'radius', label: 'Radio (rem)' },
]

const DEFAULT_HSL: Record<string, string> = {
    background: '50 40% 94%',
    foreground: '40 25% 14%',
    card: '0 0% 100%',
    'card-foreground': '40 25% 14%',
    popover: '0 0% 100%',
    'popover-foreground': '40 25% 14%',
    primary: '43 89% 38%',
    'primary-foreground': '0 0% 100%',
    secondary: '48 30% 88%',
    'secondary-foreground': '40 25% 14%',
    muted: '48 25% 86%',
    'muted-foreground': '40 11% 43%',
    accent: '48 40% 89%',
    'accent-foreground': '40 25% 14%',
    destructive: '6 62% 66%',
    'destructive-foreground': '0 0% 100%',
    success: '113 23% 71%',
    'success-foreground': '113 40% 20%',
    warning: '38 58% 48%',
    'warning-foreground': '0 0% 100%',
    border: '45 18% 85%',
    input: '45 18% 85%',
    ring: '46 65% 52%',
    radius: '0.75rem',
}

// ═══════════════════════════════════════════════════════════════
//  COMPONENTE PRINCIPAL
// ═══════════════════════════════════════════════════════════════

export default function TemasConfigPage() {
    const supabase = createClient()
    const [themes, setThemes] = useState<Theme[]>([])
    const [loading, setLoading] = useState(true)
    const [isModalOpen, setIsModalOpen] = useState(false)
    const [editingTheme, setEditingTheme] = useState<Theme | null>(null)
    const [previewTheme, setPreviewTheme] = useState<Theme | null>(null)

    // Form state
    const [formName, setFormName] = useState('')
    const [formSlug, setFormSlug] = useState('')
    const [formDesc, setFormDesc] = useState('')
    const [formHsl, setFormHsl] = useState<Record<string, string>>({ ...DEFAULT_HSL })
    const [saving, setSaving] = useState(false)
    
    // Import CSS state
    const [isImportModalOpen, setIsImportModalOpen] = useState(false)
    const [cssInput, setCssInput] = useState('')

    // Load themes
    const loadThemes = useCallback(async () => {
        setLoading(true)
        const { data, error } = await supabase
            .from('themes')
            .select('*')
            .order('created_at', { ascending: false })

        if (error) {
            toast.error('Error cargando temas: ' + error.message)
        } else {
            setThemes(data || [])
        }
        setLoading(false)
    }, [supabase])

    useEffect(() => {
        loadThemes()
    }, [loadThemes])

    // Abrir modal para crear
    const handleNew = () => {
        setEditingTheme(null)
        setFormName('')
        setFormSlug('')
        setFormDesc('')
        setFormHsl({ ...DEFAULT_HSL })
        setIsModalOpen(true)
    }

    // Abrir modal para editar
    const handleEdit = (theme: Theme) => {
        setEditingTheme(theme)
        setFormName(theme.name)
        setFormSlug(theme.slug)
        setFormDesc(theme.description || '')
        setFormHsl({ ...DEFAULT_HSL, ...theme.hsl_values })
        setIsModalOpen(true)
    }

    // Guardar tema
    const handleSave = async () => {
        if (!formName.trim() || !formSlug.trim()) {
            toast.error('Nombre y slug son obligatorios')
            return
        }

        setSaving(true)
        const payload = {
            name: formName.trim(),
            slug: formSlug.trim(),
            description: formDesc.trim() || null,
            hsl_values: formHsl,
        }

        if (editingTheme) {
            const { error } = await supabase
                .from('themes')
                .update(payload)
                .eq('id', editingTheme.id)
            if (error) toast.error('Error actualizando: ' + error.message)
            else toast.success('Tema actualizado')
        } else {
            const { error } = await supabase
                .from('themes')
                .insert([{ ...payload, is_active: true, is_default: false }])
            if (error) toast.error('Error creando: ' + error.message)
            else toast.success('Tema creado')
        }

        setSaving(false)
        setIsModalOpen(false)
        loadThemes()
    }

    // Eliminar tema
    const handleDelete = async (theme: Theme) => {
        if (theme.is_default) {
            toast.error('No puedes eliminar el tema por defecto')
            return
        }
        if (!confirm(`¿Eliminar tema "${theme.name}"?`)) return

        const { error } = await supabase.from('themes').delete().eq('id', theme.id)
        if (error) toast.error('Error eliminando: ' + error.message)
        else {
            toast.success('Tema eliminado')
            loadThemes()
        }
    }

    // Establecer como default
    const handleSetDefault = async (theme: Theme) => {
        // Desactivar todos los defaults
        await supabase.from('themes').update({ is_default: false }).neq('id', '00000000-0000-0000-0000-000000000000')
        // Activar este
        const { error } = await supabase.from('themes').update({ is_default: true }).eq('id', theme.id)
        if (error) toast.error('Error: ' + error.message)
        else {
            toast.success(`"${theme.name}" es ahora el tema por defecto`)
            loadThemes()
        }
    }

    // Toggle active
    const handleToggleActive = async (theme: Theme) => {
        const { error } = await supabase
            .from('themes')
            .update({ is_active: !theme.is_active })
            .eq('id', theme.id)
        if (error) toast.error('Error: ' + error.message)
        else loadThemes()
    }

    // Preview en vivo
    const handlePreview = (theme: Theme | null) => {
        setPreviewTheme(theme)
    }

    // Auto-generar slug desde nombre
    const handleNameChange = (val: string) => {
        setFormName(val)
        if (!editingTheme) {
            setFormSlug(kebabCase(val))
        }
    }

    // Cambiar color desde picker
    const handleColorChange = (key: string, hex: string) => {
        const hsl = hexToHsl(hex)
        setFormHsl(prev => ({ ...prev, [key]: hsl }))
    }

    // Cambiar color desde texto HSL
    const handleHslTextChange = (key: string, value: string) => {
        setFormHsl(prev => ({ ...prev, [key]: value }))
    }

    // Parsear CSS pegado
    const handleImportCss = () => {
        if (!cssInput.trim()) return

        const newHsl = { ...formHsl }
        const regex = /--([a-z-]+):\s*([^;]+);/g
        let match
        let found = 0

        while ((match = regex.exec(cssInput)) !== null) {
            const key = match[1]
            let value = match[2].trim()
            
            // Mapeo especial para variables que podrían tener nombres diferentes
            const mapping: Record<string, string> = {
                'primary-foreground': 'primary-foreground',
                'secondary-foreground': 'secondary-foreground',
                'card-foreground': 'card-foreground',
                'popover-foreground': 'popover-foreground',
                'muted-foreground': 'muted-foreground',
                'accent-foreground': 'accent-foreground',
                'destructive-foreground': 'destructive-foreground',
                'success-foreground': 'success-foreground',
                'warning-foreground': 'warning-foreground',
            }

            const targetKey = mapping[key] || key

            if (DEFAULT_HSL.hasOwnProperty(targetKey)) {
                // Limpiar hsl(), hsla() o espacios extra
                const cleanValue = value.replace(/hsla?\(|\)/g, '').trim()
                newHsl[targetKey] = cleanValue
                found++
            }
        }

        if (found > 0) {
            setFormHsl(newHsl)
            setIsImportModalOpen(false)
            setCssInput('')
            toast.success(`Se importaron ${found} variables correctamente`)
            
            // Si el nombre está vacío, intentar extraerlo de un comentario o clase
            if (!formName) {
                const nameMatch = cssInput.match(/\/\*\*\s*\n\s*\*\s*AURA OS — Tema "([^"]+)"/) || cssInput.match(/\.([a-z-]+)-theme/)
                if (nameMatch) {
                    const extracted = nameMatch[1]
                    setFormName(extracted)
                    setFormSlug(kebabCase(extracted))
                }
            }
        } else {
            toast.error('No se encontraron variables CSS válidas (ej: --primary: 0 0% 0%;)')
        }
    }

    return (
        <div className="max-w-6xl mx-auto space-y-8 py-2">
            <PageHeader
                title="Temas del Sistema"
                subtitle="Configura los temas visuales disponibles para el equipo y los portales de clientes"
                action={
                    <div className="flex items-center gap-3">
                        <button
                            onClick={() => {
                                handleNew()
                                setIsImportModalOpen(true)
                            }}
                            className="flex items-center gap-2 px-5 py-3 rounded-xl bg-secondary text-muted-foreground text-xs font-black uppercase tracking-wider hover:bg-secondary/80 transition-all active:scale-95 border border-border/50"
                        >
                            <Palette size={14} /> Importar Tema CSS
                        </button>
                        <button
                            onClick={handleNew}
                            className="flex items-center gap-2 px-5 py-3 rounded-xl bg-primary text-primary-foreground text-xs font-black uppercase tracking-wider hover:bg-primary/90 transition-all active:scale-95 shadow-lg shadow-primary/20"
                        >
                            <Plus size={14} /> Nuevo Tema
                        </button>
                    </div>
                }
            />

            {loading ? (
                <div className="flex items-center justify-center py-20">
                    <Loader2 size={32} className="text-primary animate-spin" />
                </div>
            ) : (
                <>
                    {/* Grid de Temas */}
                    <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                        {themes.map(theme => (
                            <ThemeCard
                                key={theme.id}
                                theme={theme}
                                onEdit={() => handleEdit(theme)}
                                onDelete={() => handleDelete(theme)}
                                onSetDefault={() => handleSetDefault(theme)}
                                onToggleActive={() => handleToggleActive(theme)}
                                onPreview={() => handlePreview(theme)}
                                isPreviewing={previewTheme?.id === theme.id}
                            />
                        ))}
                    </section>

                    {/* Preview en Vivo */}
                    {previewTheme && (
                        <LivePreview theme={previewTheme} onClose={() => handlePreview(null)} />
                    )}
                </>
            )}

            {/* Modal Crear/Editar */}
            <Modal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                title={editingTheme ? 'Editar Tema' : 'Nuevo Tema'}
                maxWidth="max-w-3xl"
            >
                <div className="space-y-6">
                    {/* Datos básicos */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div className="space-y-1.5">
                            <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Nombre del Tema</label>
                            <input
                                type="text"
                                value={formName}
                                onChange={e => handleNameChange(e.target.value)}
                                placeholder="Ej: Morning Light"
                                className="w-full px-4 py-2.5 rounded-xl border border-border bg-background text-sm font-bold text-foreground focus:ring-2 focus:ring-primary outline-none transition-all"
                            />
                        </div>
                        <div className="space-y-1.5">
                            <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Slug</label>
                            <input
                                type="text"
                                value={formSlug}
                                onChange={e => setFormSlug(kebabCase(e.target.value))}
                                placeholder="morning-light"
                                className="w-full px-4 py-2.5 rounded-xl border border-border bg-background text-sm font-bold text-foreground focus:ring-2 focus:ring-primary outline-none transition-all"
                            />
                        </div>
                    </div>

                    <div className="space-y-1.5">
                        <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Descripción</label>
                        <textarea
                            value={formDesc}
                            onChange={e => setFormDesc(e.target.value)}
                            placeholder="Describe el uso ideal de este tema..."
                            rows={2}
                            className="w-full px-4 py-2.5 rounded-xl border border-border bg-background text-sm font-bold text-foreground focus:ring-2 focus:ring-primary outline-none transition-all resize-none"
                        />
                    </div>

                    {/* Editor HSL */}
                    <div className="space-y-3">
                        <div className="flex items-center gap-2">
                            <Palette size={14} className="text-primary" />
                            <h4 className="text-xs font-black uppercase tracking-tighter text-foreground">Editor de Variables CSS</h4>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 max-h-[400px] overflow-y-auto pr-1">
                            {EDITABLE_VARS.map(({ key, label }) => {
                                const isRadius = key === 'radius'
                                const hslValue = formHsl[key] || ''
                                const hexValue = isRadius ? '' : hslToHex(hslValue)

                                return (
                                    <div key={key} className="flex items-center gap-3 p-2.5 rounded-xl border border-border/50 bg-secondary/30">
                                        {!isRadius && (
                                            <input
                                                type="color"
                                                value={hexValue}
                                                onChange={e => handleColorChange(key, e.target.value)}
                                                className="h-8 w-8 shrink-0 cursor-pointer rounded-lg border-0 bg-transparent p-0"
                                            />
                                        )}
                                        <div className="flex-1 min-w-0">
                                            <label className="block text-[9px] font-black uppercase tracking-widest text-muted-foreground mb-0.5">
                                                {label}
                                            </label>
                                            <input
                                                type="text"
                                                value={hslValue}
                                                onChange={e => handleHslTextChange(key, e.target.value)}
                                                className="w-full bg-transparent text-[10px] font-mono font-bold text-foreground outline-none border-b border-transparent focus:border-primary transition-colors"
                                            />
                                        </div>
                                    </div>
                                )
                            })}
                        </div>
                    </div>

                    {/* Preview del tema en edición */}
                    <div className="rounded-xl border border-border/50 p-4 space-y-3">
                        <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Vista previa del tema</p>
                        <div
                            className="rounded-lg p-4 space-y-2"
                            style={{
                                background: `hsl(${formHsl.background})`,
                                color: `hsl(${formHsl.foreground})`,
                                borderRadius: formHsl.radius,
                            }}
                        >
                            <div className="flex items-center gap-2">
                                <div
                                    className="px-3 py-1 rounded-md text-[10px] font-black"
                                    style={{
                                        background: `hsl(${formHsl.primary})`,
                                        color: `hsl(${formHsl['primary-foreground']})`,
                                    }}
                                >
                                    Botón Primario
                                </div>
                                <div
                                    className="px-3 py-1 rounded-md text-[10px] font-black"
                                    style={{
                                        background: `hsl(${formHsl.secondary})`,
                                        color: `hsl(${formHsl['secondary-foreground']})`,
                                    }}
                                >
                                    Secundario
                                </div>
                            </div>
                            <div
                                className="p-3 rounded-md text-[10px] font-bold"
                                style={{
                                    background: `hsl(${formHsl.card})`,
                                    color: `hsl(${formHsl['card-foreground']})`,
                                    border: `1px solid hsl(${formHsl.border})`,
                                }}
                            >
                                Tarjeta de ejemplo con borde
                            </div>
                            <div className="flex items-center gap-2 text-[10px] font-bold">
                                <span style={{ color: `hsl(${formHsl.success})` }}>✓ Éxito</span>
                                <span style={{ color: `hsl(${formHsl.warning})` }}>⚠ Advertencia</span>
                                <span style={{ color: `hsl(${formHsl.destructive})` }}>✕ Error</span>
                            </div>
                        </div>
                    </div>

                    {/* Acciones */}
                    <div className="flex items-center gap-3 pt-2">
                        <button
                            onClick={handleSave}
                            disabled={saving}
                            className="flex-1 flex items-center justify-center gap-2 px-5 py-3 rounded-xl bg-primary text-primary-foreground text-xs font-black uppercase tracking-wider hover:bg-primary/90 disabled:opacity-50 transition-all active:scale-95"
                        >
                            {saving ? <Loader2 size={14} className="animate-spin" /> : <Save size={14} />}
                            {editingTheme ? 'Guardar Cambios' : 'Crear Tema'}
                        </button>
                        <button
                            onClick={() => setIsModalOpen(false)}
                            className="px-5 py-3 rounded-xl border border-border text-xs font-black uppercase tracking-wider text-muted-foreground hover:bg-secondary transition-all"
                        >
                            Cancelar
                        </button>
                    </div>
                </div>
            </Modal>

            {/* Modal Importar CSS */}
            <Modal
                isOpen={isImportModalOpen}
                onClose={() => setIsImportModalOpen(false)}
                title="Importar Tema desde CSS"
                maxWidth="max-w-2xl"
            >
                <div className="space-y-4">
                    <div className="bg-secondary/50 rounded-xl p-4 border border-border/50 space-y-3">
                        <div className="flex items-center justify-between">
                            <p className="text-[10px] font-black uppercase tracking-widest text-primary">Plantilla Sugerida</p>
                            <button
                                onClick={() => {
                                    const template = `:root {
  --background: 50 40% 94%;
  --foreground: 40 25% 14%;
  --primary: 43 89% 38%;
  --primary-foreground: 0 0% 100%;
  --card: 0 0% 100%;
  --card-foreground: 40 25% 14%;
  --accent: 48 40% 89%;
  --accent-foreground: 43 89% 38%;
  --border: 45 18% 85%;
  --radius: 0.75rem;
}`
                                    navigator.clipboard.writeText(template)
                                    toast.success('Plantilla copiada al portapapeles')
                                }}
                                className="flex items-center gap-1 text-[9px] font-black uppercase tracking-wider text-muted-foreground hover:text-primary transition-colors"
                            >
                                <Copy size={10} /> Copiar Plantilla
                            </button>
                        </div>
                        <pre className="text-[9px] font-mono font-bold text-muted-foreground leading-tight overflow-x-auto">
{`--background: H S L%;
--foreground: H S L%;
--primary:    H S L%;
--card:       H S L%;
--accent:     H S L%;
--border:     H S L%;
--radius:     0.75rem;`}
                        </pre>
                    </div>

                    <p className="text-[11px] text-muted-foreground font-medium leading-relaxed">
                        Pega aquí las variables CSS. El sistema detectará automáticamente los valores HSL.
                    </p>
                    <textarea
                        value={cssInput}
                        onChange={e => setCssInput(e.target.value)}
                        placeholder=":root {&#10;  --primary: 43 89% 38%;&#10;  --background: 50 40% 94%;&#10;  ...&#10;}"
                        rows={8}
                        className="w-full px-4 py-3 rounded-xl border border-border bg-background text-[11px] font-mono font-bold text-foreground focus:ring-2 focus:ring-primary outline-none transition-all resize-none"
                    />
                    <div className="flex items-center gap-3 pt-2">
                        <button
                            onClick={handleImportCss}
                            className="flex-1 flex items-center justify-center gap-2 px-5 py-3 rounded-xl bg-primary text-primary-foreground text-xs font-black uppercase tracking-wider hover:bg-primary/90 transition-all active:scale-95"
                        >
                            Procesar y Aplicar
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

// ═══════════════════════════════════════════════════════════════
//  SUB-COMPONENTES
// ═══════════════════════════════════════════════════════════════

function ThemeCard({
    theme,
    onEdit,
    onDelete,
    onSetDefault,
    onToggleActive,
    onPreview,
    isPreviewing,
}: {
    theme: Theme
    onEdit: () => void
    onDelete: () => void
    onSetDefault: () => void
    onToggleActive: () => void
    onPreview: () => void
    isPreviewing: boolean
}) {
    const hsl = theme.hsl_values || {}
    const previewColors = [
        hsl.background || '50 40% 94%',
        hsl.primary || '43 89% 38%',
        hsl.accent || '48 40% 89%',
    ]

    return (
        <div className={`relative rounded-2xl border p-5 transition-all ${
            isPreviewing
                ? 'border-primary bg-primary/5 ring-2 ring-primary/30'
                : 'border-border/50 bg-card hover:border-primary/30 hover:shadow-md'
        }`}>
            {/* Badge default */}
            {theme.is_default && (
                <div className="absolute -top-2 -right-2 px-2 py-0.5 rounded-full bg-primary text-primary-foreground text-[9px] font-black uppercase tracking-wider shadow-sm">
                    Default
                </div>
            )}

            {/* Preview de colores */}
            <div className="flex items-center gap-3 mb-4">
                {previewColors.map((c, i) => (
                    <div
                        key={i}
                        className="w-8 h-8 rounded-lg border border-black/10 shadow-inner"
                        style={{ backgroundColor: `hsl(${c})` }}
                    />
                ))}
                <div className="flex-1 min-w-0">
                    <h3 className="text-sm font-black text-foreground truncate">{theme.name}</h3>
                    <p className="text-[10px] text-muted-foreground font-bold truncate">{theme.slug}</p>
                </div>
            </div>

            {theme.description && (
                <p className="text-[11px] text-muted-foreground font-medium mb-3 line-clamp-2">{theme.description}</p>
            )}

            {/* Badges */}
            <div className="flex items-center gap-2 mb-4">
                <span className={`px-2 py-0.5 rounded-full text-[9px] font-black uppercase tracking-wider border ${
                    theme.is_active
                        ? 'bg-success/10 text-success-foreground border-success/20'
                        : 'bg-muted text-muted-foreground border-border'
                }`}>
                    {theme.is_active ? 'Activo' : 'Inactivo'}
                </span>
            </div>

            {/* Acciones */}
            <div className="flex items-center gap-1.5">
                <button
                    onClick={onPreview}
                    className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-[10px] font-black uppercase tracking-wider transition-all ${
                        isPreviewing
                            ? 'bg-primary text-primary-foreground'
                            : 'bg-secondary text-muted-foreground hover:bg-secondary/80'
                    }`}
                >
                    <Eye size={12} /> {isPreviewing ? 'Previsualizando' : 'Preview'}
                </button>
                <button
                    onClick={onEdit}
                    className="flex items-center gap-1.5 px-3 py-2 rounded-lg bg-secondary text-muted-foreground text-[10px] font-black uppercase tracking-wider hover:bg-secondary/80 transition-all"
                >
                    <Paintbrush size={12} /> Editar
                </button>
                {!theme.is_default && (
                    <button
                        onClick={onSetDefault}
                        className="flex items-center gap-1.5 px-3 py-2 rounded-lg bg-secondary text-muted-foreground text-[10px] font-black uppercase tracking-wider hover:bg-warning/10 hover:text-warning-foreground transition-all"
                        title="Establecer como default"
                    >
                        <Star size={12} />
                    </button>
                )}
                <button
                    onClick={onToggleActive}
                    className="flex items-center gap-1.5 px-3 py-2 rounded-lg bg-secondary text-muted-foreground text-[10px] font-black uppercase tracking-wider hover:bg-secondary/80 transition-all"
                >
                    {theme.is_active ? <X size={12} /> : <Check size={12} />}
                </button>
                {!theme.is_default && (
                    <button
                        onClick={onDelete}
                        className="flex items-center gap-1.5 px-3 py-2 rounded-lg bg-secondary text-muted-foreground text-[10px] font-black uppercase tracking-wider hover:bg-destructive/10 hover:text-destructive transition-all ml-auto"
                    >
                        <Trash2 size={12} />
                    </button>
                )}
            </div>
        </div>
    )
}

function LivePreview({ theme, onClose }: { theme: Theme; onClose: () => void }) {
    const hsl = theme.hsl_values || {}

    return (
        <section className="rounded-2xl border border-primary/30 bg-primary/5 p-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                    <Eye size={16} className="text-primary" />
                    <h3 className="text-sm font-black text-foreground uppercase tracking-tighter">Preview en Vivo: {theme.name}</h3>
                </div>
                <button
                    onClick={onClose}
                    className="p-1.5 rounded-lg text-muted-foreground hover:text-foreground hover:bg-secondary transition-all"
                >
                    <X size={16} />
                </button>
            </div>

            <div
                className="rounded-xl p-6 space-y-4 border"
                style={{
                    background: `hsl(${hsl.background})`,
                    color: `hsl(${hsl.foreground})`,
                    borderColor: `hsl(${hsl.border})`,
                    borderRadius: hsl.radius,
                }}
            >
                {/* Header simulado */}
                <div
                    className="flex items-center justify-between px-4 py-3 rounded-lg border"
                    style={{
                        background: `hsl(${hsl.card})`,
                        borderColor: `hsl(${hsl.border})`,
                    }}
                >
                    <div className="flex items-center gap-2">
                        <div
                            className="w-6 h-6 rounded-md"
                            style={{ background: `hsl(${hsl.primary})` }}
                        />
                        <span className="text-xs font-black" style={{ color: `hsl(${hsl['card-foreground']})` }}>
                            Aura OS
                        </span>
                    </div>
                    <div className="flex items-center gap-2">
                        <span
                            className="px-2 py-0.5 rounded text-[9px] font-black uppercase"
                            style={{ background: `hsl(${hsl.muted})`, color: `hsl(${hsl['muted-foreground']})` }}
                        >
                            Admin
                        </span>
                    </div>
                </div>

                {/* Content simulado */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    <div
                        className="p-4 rounded-lg border space-y-2"
                        style={{
                            background: `hsl(${hsl.card})`,
                            borderColor: `hsl(${hsl.border})`,
                        }}
                    >
                        <p className="text-[9px] font-black uppercase tracking-widest" style={{ color: `hsl(${hsl['muted-foreground']})` }}>
                            Inversión
                        </p>
                        <p className="text-lg font-black" style={{ color: `hsl(${hsl['card-foreground']})` }}>
                            S/ 4,250
                        </p>
                    </div>
                    <div
                        className="p-4 rounded-lg border space-y-2"
                        style={{
                            background: `hsl(${hsl.card})`,
                            borderColor: `hsl(${hsl.border})`,
                        }}
                    >
                        <p className="text-[9px] font-black uppercase tracking-widest" style={{ color: `hsl(${hsl['muted-foreground']})` }}>
                            Estado
                        </p>
                        <p className="text-lg font-black" style={{ color: `hsl(${hsl.success})` }}>
                            Activo
                        </p>
                    </div>
                    <div
                        className="p-4 rounded-lg border space-y-2"
                        style={{
                            background: `hsl(${hsl.card})`,
                            borderColor: `hsl(${hsl.border})`,
                        }}
                    >
                        <p className="text-[9px] font-black uppercase tracking-widest" style={{ color: `hsl(${hsl['muted-foreground']})` }}>
                            Alerta
                        </p>
                        <p className="text-lg font-black" style={{ color: `hsl(${hsl.warning})` }}>
                            Revisar
                        </p>
                    </div>
                </div>

                {/* Botones */}
                <div className="flex items-center gap-2">
                    <button
                        className="px-4 py-2 rounded-lg text-[10px] font-black uppercase tracking-wider"
                        style={{ background: `hsl(${hsl.primary})`, color: `hsl(${hsl['primary-foreground']})` }}
                    >
                        Acción Principal
                    </button>
                    <button
                        className="px-4 py-2 rounded-lg text-[10px] font-black uppercase tracking-wider"
                        style={{ background: `hsl(${hsl.secondary})`, color: `hsl(${hsl['secondary-foreground']})` }}
                    >
                        Secundaria
                    </button>
                    <button
                        className="px-4 py-2 rounded-lg text-[10px] font-black uppercase tracking-wider"
                        style={{ background: `hsl(${hsl.destructive})`, color: `hsl(${hsl['destructive-foreground']})` }}
                    >
                        Peligro
                    </button>
                </div>
            </div>
        </section>
    )
}
