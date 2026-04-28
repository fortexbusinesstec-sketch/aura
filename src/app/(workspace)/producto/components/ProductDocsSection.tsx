'use client'

import React, { useState, useRef, useCallback } from 'react'
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import remarkBreaks from 'remark-breaks'
import rehypeHighlight from 'rehype-highlight'
import 'highlight.js/styles/github-dark.css'
import { Card } from '@/components/ui/Card'
import {
    Plus, X, ShieldCheck, Database, Cpu, BookOpen, FileText,
    History, ExternalLink, Save, Eye, EyeOff, Maximize2, Layers
} from 'lucide-react'
import { ProductDocumentation, DocFragmentType } from '@/types'
import { createProductDocumentationAction } from '../actions'
import { toast } from 'sonner'
import { ArrowLeft } from 'lucide-react'

const DOC_TYPE_ICONS: Record<DocFragmentType, any> = {
    architecture: Cpu,
    database_schema: Database,
    business_logic: ShieldCheck,
    api_endpoint: ExternalLink,
    workflow: Layers,
}

const DOC_TYPES: { value: DocFragmentType; label: string; description: string }[] = [
    { value: 'architecture', label: 'Arquitectura', description: 'Arquitectura general del sistema, infraestructura y stack tecnológico.' },
    { value: 'database_schema', label: 'Esquema / DB', description: 'Diccionario de datos, tablas, vistas y relaciones de base de datos.' },
    { value: 'business_logic', label: 'Lógica / Reglas', description: 'Reglas de negocio, máquinas de estado y validaciones críticas.' },
    { value: 'api_endpoint', label: 'API Endpoint', description: 'Contratos de API, endpoints y documentación de servicios.' },
    { value: 'workflow', label: 'Flujo Operativo', description: 'Procesos y flujos paso a paso (ej. mantenimiento o logística).' },
]

interface Props {
    productId: string
    docs: ProductDocumentation[]
}

// Bloques para insertar rápidamente
const BLOCK_SNIPPETS = [
    { label: '# H1', icon: 'H1', snippet: '# Título Principal\n' },
    { label: '## H2', icon: 'H2', snippet: '## Subtítulo\n' },
    { label: '### H3', icon: 'H3', snippet: '### Sección\n' },
    { label: 'SQL', icon: '{}', snippet: '```sql\n-- Escribe tu query aquí\nSELECT * FROM tabla;\n```\n' },
    { label: 'TypeScript', icon: 'TS', snippet: '```typescript\n// Lógica técnica\nconst ejemplo = () => {};\n```\n' },
    { label: 'JSON', icon: '{}', snippet: '```json\n{\n  "clave": "valor"\n}\n```\n' },
    { label: 'Código', icon: '</>', snippet: '```bash\n# Comando o script\n```\n' },
    { label: 'Lista', icon: '•—', snippet: '- Elemento 1\n- Elemento 2\n- Elemento 3\n' },
    { label: 'Numerada', icon: '1.', snippet: '1. Primer paso\n2. Segundo paso\n3. Tercer paso\n' },
    { label: 'Tabla', icon: '⊞', snippet: '| Campo | Tipo | Descripción |\n|-------|------|-------------|\n| id | UUID | Clave primaria |\n| name | TEXT | Nombre del registro |\n' },
    { label: 'Nota', icon: '💡', snippet: '> **Nota:** Escribe aquí una aclaración importante.\n' },
    { label: 'Negrita', icon: 'B', snippet: '**texto en negrita**' },
    { label: 'Code inline', icon: '`', snippet: '`código`' },
    { label: 'Separador', icon: '—', snippet: '\n---\n' },
]

export function ProductDocsSection({ productId, docs }: Props) {
    const [isModalOpen, setIsModalOpen] = useState(false)
    const [showPreview, setShowPreview] = useState(true)
    const [isSaving, setIsSaving] = useState(false)
    const [formData, setFormData] = useState({
        title: '',
        doc_type: 'business_logic' as DocFragmentType,
        content_md: '',
        version_tag: 'v1.0.0',
    })
    const textareaRef = useRef<HTMLTextAreaElement>(null)

    const currentDocType = DOC_TYPES.find(d => d.value === formData.doc_type)

    const insertBlock = useCallback((snippet: string) => {
        const ta = textareaRef.current
        if (!ta) return
        const start = ta.selectionStart
        const end = ta.selectionEnd
        const before = formData.content_md.slice(0, start)
        const after = formData.content_md.slice(end)
        const newContent = before + snippet + after
        setFormData(prev => ({ ...prev, content_md: newContent }))
        // Restore cursor after insert
        requestAnimationFrame(() => {
            ta.focus()
            ta.selectionStart = start + snippet.length
            ta.selectionEnd = start + snippet.length
        })
    }, [formData.content_md])

    const handleSubmit = async (e?: React.FormEvent) => {
        if (e) e.preventDefault()
        if (!formData.title || !formData.content_md) {
            toast.error('El título y contenido son obligatorios.')
            return
        }

        setIsSaving(true)
        try {
            const result = await createProductDocumentationAction({
                ...formData,
                product_id: productId,
            })

            if (result?.success) {
                toast.success('Documento guardado con éxito.')
                setIsModalOpen(false)
                setFormData({
                    title: '',
                    doc_type: 'business_logic',
                    content_md: '',
                    version_tag: 'v1.0.0',
                })
            } else {
                toast.error('Error al guardar: Base de datos no respondió correctamente.')
            }
        } catch (error) {
            console.error('Error in handleSubmit:', error)
            toast.error('Ocurrió un fallo en el sistema al intentar guardar.')
        } finally {
            setIsSaving(false)
        }
    }

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between px-1">
                <div className="flex items-center gap-3">
                    <div className="w-1.5 h-6 bg-primary rounded-full" />
                    <h2 className="text-lg font-black uppercase tracking-tighter text-foreground">Documentación Técnica</h2>
                </div>
                <div className="flex items-center gap-4">
                    <span className="text-[10px] font-bold text-muted-foreground bg-secondary/50 px-3 py-1 rounded-full uppercase tracking-widest">
                        {docs.length} Fragmentos
                    </span>
                    <button
                        onClick={() => {
                            setFormData({ title: '', doc_type: 'business_logic', content_md: '', version_tag: 'v1.0.0' })
                            setIsModalOpen(true)
                        }}
                        className="flex items-center gap-2 px-4 py-2 rounded-xl bg-primary !text-black text-[10px] font-black uppercase tracking-widest hover:scale-105 active:scale-95 transition-all shadow-lg"
                    >
                        <Plus size={14} /> Nuevo Registro
                    </button>
                </div>
            </div>

            {docs.length === 0 ? (
                <Card className="p-12 border-dashed border-border/60 bg-transparent flex flex-col items-center justify-center text-center">
                    <BookOpen size={40} className="text-muted-foreground opacity-20 mb-4" />
                    <p className="text-sm font-bold text-muted-foreground uppercase tracking-widest truncate">Aún no hay documentación registrada</p>
                </Card>
            ) : (
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-start">
                    {docs.map((doc) => {
                        const Icon = DOC_TYPE_ICONS[doc.doc_type] || FileText
                        return (
                            <Card
                                key={doc.id}
                                onClick={() => {
                                    setFormData({
                                        title: doc.title,
                                        doc_type: doc.doc_type,
                                        content_md: doc.content_md,
                                        version_tag: doc.version_tag || 'v1.0.0'
                                    })
                                    setIsModalOpen(true)
                                }}
                                className="group flex flex-col h-[400px] border-border/40 bg-card/50 hover:bg-card transition-all overflow-hidden cursor-pointer active:scale-[0.98]"
                            >
                                <div className="p-6 border-b border-border/10 bg-secondary/20 flex items-center justify-between">
                                    <div className="flex items-center gap-3">
                                        <div className="p-2 rounded-xl bg-background border border-border/60 text-black shadow-sm">
                                            <Icon size={16} />
                                        </div>
                                        <div>
                                            <h3 className="text-sm font-black text-foreground uppercase tracking-tight leading-tight">{doc.title}</h3>
                                            <div className="flex items-center gap-2 mt-1">
                                                <span className="text-[9px] font-black uppercase tracking-widest text-black/60">{doc.doc_type}</span>
                                                <span className="text-[9px] font-bold text-muted-foreground opacity-30">•</span>
                                                <span className="text-[9px] font-black text-muted-foreground uppercase tracking-widest">{doc.version_tag}</span>
                                            </div>
                                        </div>
                                    </div>
                                    <ExternalLink size={14} className="text-muted-foreground opacity-40 group-hover:opacity-100 transition-opacity" />
                                </div>

                                <div className="p-6 flex-grow overflow-hidden bg-background/20">
                                    <div className="prose prose-sm prose-invert max-w-none text-foreground/70 font-medium text-[12px] leading-relaxed whitespace-pre-wrap font-mono line-clamp-[12]">
                                        {doc.content_md}
                                    </div>
                                </div>

                                <div className="px-6 py-4 bg-secondary/10 border-t border-border/10 flex items-center justify-between">
                                    <div className="flex items-center gap-2">
                                        <History size={10} className="text-muted-foreground" />
                                        <span className="text-[9px] font-black text-muted-foreground/60 uppercase tracking-widest">Sinc: {new Date(doc.updated_at).toLocaleDateString()}</span>
                                    </div>
                                    <span className="text-[9px] font-bold text-black opacity-30 uppercase group-hover:opacity-100 transition-opacity">Ver Documento Completo</span>
                                </div>
                            </Card>
                        )
                    })}
                </div>
            )}

            {/* MODAL CREACIÓN / EDICIÓN FULL SCREEN */}
            {isModalOpen && (
                <div className="fixed inset-0 z-[200] bg-background flex flex-col animate-in slide-in-from-bottom duration-500">
                    <div className="min-h-[80px] h-auto py-4 md:py-0 border-b border-border/40 flex flex-wrap md:flex-nowrap items-center justify-between px-4 md:px-8 bg-card/50 backdrop-blur-md gap-4">
                        <div className="flex items-center gap-2 md:gap-6 min-w-0">
                            <button
                                onClick={() => setIsModalOpen(false)}
                                className="flex-shrink-0 flex items-center gap-1 md:gap-2 text-[10px] font-black uppercase tracking-widest text-muted-foreground hover:text-black transition-colors px-2 md:px-3 py-2 rounded-xl hover:bg-secondary/40"
                            >
                                <ArrowLeft size={16} /> <span className="hidden sm:inline">Volver</span>
                            </button>
                            <div className="w-[1px] h-8 bg-border/40 hidden sm:block flex-shrink-0" />
                            <div className="flex items-center gap-3 md:gap-4 overflow-hidden min-w-0">
                                <div className="hidden sm:flex flex-shrink-0 w-10 h-10 rounded-2xl bg-secondary items-center justify-center border border-border/20 shadow-inner">
                                    <FileText size={20} className="text-black" />
                                </div>
                                <div className="min-w-0">
                                    <p className="text-[8px] md:text-[10px] font-black uppercase tracking-[0.2em] text-black/60 mb-0.5 truncate">Gestión de Documentos</p>
                                    <h2 className="text-sm md:text-lg font-black uppercase tracking-tighter text-foreground truncate max-w-[200px] sm:max-w-xs md:max-w-full">
                                        {formData.title || 'Registrar Nuevo Fragmento'}
                                    </h2>
                                </div>
                            </div>
                        </div>
                        <div className="flex items-center justify-end gap-2 md:gap-4 w-full md:w-auto overflow-x-auto pb-1 md:pb-0 hide-scrollbar flex-shrink-0">
                            <button
                                onClick={() => setShowPreview(!showPreview)}
                                className={`flex-shrink-0 flex items-center gap-2 px-3 md:px-4 py-2.5 rounded-xl text-[9px] md:text-[10px] font-black uppercase tracking-widest transition-all ${showPreview ? 'bg-secondary text-foreground' : 'bg-primary !text-black shadow-lg shadow-primary/20'
                                    }`}
                            >
                                {showPreview ? <><EyeOff size={14} /> <span className="hidden sm:inline">Ocultar Preview</span></> : <><Eye size={14} /> <span className="hidden sm:inline">Mostrar Preview</span></>}
                            </button>
                            <button
                                type="button"
                                onClick={() => setIsModalOpen(false)}
                                className="hidden sm:block flex-shrink-0 px-4 py-2.5 md:px-6 md:py-3 rounded-xl text-[9px] md:text-[10px] font-black uppercase tracking-widest text-muted-foreground hover:bg-secondary transition-all"
                            >
                                Cancelar
                            </button>
                            <button
                                onClick={() => handleSubmit()}
                                disabled={isSaving || !formData.title || !formData.content_md}
                                className="flex-shrink-0 flex items-center gap-2 px-4 md:px-8 py-2.5 md:py-3 rounded-xl bg-primary !text-black text-[9px] md:text-[10px] font-black uppercase tracking-widest hover:scale-105 active:scale-95 transition-all shadow-xl disabled:opacity-50 disabled:scale-100"
                            >
                                {isSaving ? 'Guardando...' : <><Save size={16} /> <span className="hidden sm:inline">Guardar Documento</span><span className="sm:hidden">Guardar</span></>}
                            </button>
                        </div>
                    </div>

                    {/* Split Layout Body */}
                    <div className="flex-grow flex flex-col lg:flex-row overflow-hidden">
                        {/* LEFT: FORM/EDITOR */}
                        <div className={`${showPreview ? 'hidden lg:flex w-full lg:w-[45%]' : 'flex w-full'} h-full border-b lg:border-b-0 lg:border-r border-border/20 flex-col p-6 md:p-10 space-y-8 overflow-y-auto bg-card/20 transition-all duration-500`}>
                            <div className="space-y-6 max-w-5xl mx-auto w-full">
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black uppercase tracking-widest text-black/60 px-1">Título del Fragmento</label>
                                    <input
                                        required
                                        value={formData.title}
                                        onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                                        placeholder="Ej. Diccionario: Tabla work_orders"
                                        className="w-full bg-background border border-border/40 rounded-2xl px-6 py-4 text-base font-bold outline-none focus:border-primary/60 transition-all text-foreground"
                                    />
                                </div>

                                <div className="grid grid-cols-2 gap-6">
                                    <div className="space-y-4">
                                        <div className="space-y-2">
                                            <label className="text-[10px] font-black uppercase tracking-widest text-black/60 px-1">Tipo de Documento</label>
                                            <select
                                                value={formData.doc_type}
                                                onChange={(e) => setFormData({ ...formData, doc_type: e.target.value as DocFragmentType })}
                                                className="w-full bg-background border border-border/40 rounded-2xl px-6 py-4 text-sm font-bold outline-none appearance-none text-foreground"
                                            >
                                                {DOC_TYPES.map(t => (
                                                    <option key={t.value} value={t.value}>{t.label}</option>
                                                ))}
                                            </select>
                                        </div>
                                        {currentDocType && (
                                            <p className="text-[11px] font-medium text-black px-4 leading-relaxed bg-black/5 py-3 rounded-xl border border-black/10">
                                                💡 <strong className="uppercase">Info:</strong> {currentDocType.description}
                                            </p>
                                        )}
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-[10px] font-black uppercase tracking-widest text-black/60 px-1">Versión / Etiqueta</label>
                                        <input
                                            value={formData.version_tag}
                                            onChange={(e) => setFormData({ ...formData, version_tag: e.target.value })}
                                            className="w-full bg-background border border-border/40 rounded-2xl px-6 py-4 text-sm font-bold outline-none text-foreground"
                                        />
                                    </div>
                                </div>

                                <div className="space-y-2 flex-grow flex flex-col">
                                    <div className="flex items-center justify-between px-1">
                                        <label className="text-[10px] font-black uppercase tracking-widest text-black/60">Contenido Técnico (Markdown)</label>
                                        <span className="text-[9px] text-black/30 font-bold uppercase tracking-widest">Usa los bloques ↓ para insertar</span>
                                    </div>

                                    {/* TOOLBAR DE BLOQUES */}
                                    <div className="flex flex-wrap gap-1.5 p-3 bg-background border border-border/30 rounded-2xl">
                                        {BLOCK_SNIPPETS.map((block) => (
                                            <button
                                                key={block.label}
                                                type="button"
                                                onClick={() => insertBlock(block.snippet)}
                                                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-secondary/60 hover:bg-primary hover:!text-black text-foreground text-[11px] font-bold transition-all active:scale-95 border border-border/20 hover:border-primary"
                                                title={block.snippet.slice(0, 60)}
                                            >
                                                <span className="font-mono text-[10px] opacity-60">{block.icon}</span>
                                                {block.label}
                                            </button>
                                        ))}
                                    </div>

                                    <textarea
                                        ref={textareaRef}
                                        required
                                        value={formData.content_md}
                                        onChange={(e) => setFormData({ ...formData, content_md: e.target.value })}
                                        placeholder="Escribe aquí o usa los bloques de arriba para insertar Markdown..."
                                        className="flex-grow w-full bg-background border border-border/40 rounded-3xl px-8 py-8 text-[15px] font-mono leading-relaxed outline-none focus:border-primary/60 transition-all resize-none min-h-[400px]"
                                    />
                                </div>
                            </div>
                        </div>

                        {/* RIGHT: PREVIEW */}
                        {showPreview && (
                            <div className="flex-grow w-full lg:w-auto h-full bg-background overflow-y-auto p-4 sm:p-8 md:p-12 lg:p-20 relative animate-in slide-in-from-right duration-500">
                                {/* Paper Effect */}
                                <div className="max-w-4xl mx-auto bg-card border border-border/20 shadow-2xl p-6 sm:p-10 md:p-16 min-h-full lg:min-h-[140%] rounded-sm relative overflow-hidden">
                                    <div className="absolute top-0 left-0 w-full h-1.5 bg-black/20" />

                                    <div className="flex items-center justify-between mb-8 md:mb-12 opacity-40 text-black font-black">
                                        <span className="text-[8px] md:text-[10px] uppercase tracking-[0.3em]">Aura Technical Asset</span>
                                        <span className="text-[8px] md:text-[10px] uppercase tracking-[0.3em]">{formData.version_tag}</span>
                                    </div>

                                    <h1 className="text-2xl sm:text-3xl md:text-4xl font-black uppercase tracking-tighter text-foreground mb-4 leading-tight break-words">{formData.title || 'Título del Fragmento'}</h1>
                                    <div className="flex flex-wrap items-center gap-2 md:gap-4 mb-10 md:mb-16 text-black/60 border-b border-border/20 pb-6 md:pb-8">
                                        <span className="text-[11px] font-black uppercase tracking-widest bg-black/5 px-3 py-1 rounded-md border border-black/10 text-black">{formData.doc_type}</span>
                                        <div className="w-1 h-1 rounded-full bg-black/20" />
                                        <span className="text-[11px] font-bold">PROYECTO: {productId.slice(0, 8)}</span>
                                    </div>

                                    {/* MARKDOWN RENDERER */}
                                    <div className="text-foreground/80 leading-relaxed space-y-4">
                                        {formData.content_md ? (
                                            <ReactMarkdown
                                                remarkPlugins={[remarkGfm, remarkBreaks]}
                                                rehypePlugins={[rehypeHighlight]}
                                                components={{
                                                    h1: ({ children }) => <h1 className="text-3xl md:text-4xl font-black uppercase tracking-tighter text-foreground mt-8 md:mt-10 mb-4 leading-tight border-b border-border/20 pb-4 break-words">{children}</h1>,
                                                    h2: ({ children }) => <h2 className="text-xl md:text-2xl font-black uppercase tracking-tight text-foreground mt-6 md:mt-8 mb-3 leading-snug break-words">{children}</h2>,
                                                    h3: ({ children }) => <h3 className="text-lg font-bold uppercase tracking-wide text-foreground/90 mt-6 mb-2">{children}</h3>,
                                                    h4: ({ children }) => <h4 className="text-base font-bold text-foreground/80 mt-4 mb-1">{children}</h4>,
                                                    p: ({ children }) => <p className="text-base text-foreground/75 leading-relaxed my-3">{children}</p>,
                                                    ul: ({ children }) => <ul className="list-disc list-inside space-y-1.5 my-3 pl-2 text-foreground/75">{children}</ul>,
                                                    ol: ({ children }) => <ol className="list-decimal list-inside space-y-1.5 my-3 pl-2 text-foreground/75">{children}</ol>,
                                                    li: ({ children }) => <li className="text-base leading-relaxed">{children}</li>,
                                                    blockquote: ({ children }) => <blockquote className="border-l-4 border-primary pl-4 my-4 text-foreground/60 italic">{children}</blockquote>,
                                                    code: ({ className, children, ...props }: any) => {
                                                        const isInline = !className
                                                        return isInline
                                                            ? <code className="text-sky-600 bg-slate-100 dark:bg-slate-900 dark:text-sky-400 px-1.5 py-0.5 rounded text-[13px] font-mono">{children}</code>
                                                            : <code className={`${className ?? ''} font-mono text-sm`} {...props}>{children}</code>
                                                    },
                                                    pre: ({ children }) => <pre className="bg-[#1e1e2e] border border-black/10 rounded-2xl p-6 overflow-x-auto my-6 shadow-2xl text-sm leading-relaxed">{children}</pre>,
                                                    table: ({ children }) => <div className="overflow-x-auto my-6"><table className="w-full text-sm border-collapse">{children}</table></div>,
                                                    th: ({ children }) => <th className="text-left px-4 py-2 bg-black/5 border border-border/20 font-black uppercase text-xs tracking-widest text-foreground">{children}</th>,
                                                    td: ({ children }) => <td className="px-4 py-2 border border-border/20 text-foreground/75">{children}</td>,
                                                    strong: ({ children }) => <strong className="font-black text-foreground">{children}</strong>,
                                                    em: ({ children }) => <em className="italic text-foreground/70">{children}</em>,
                                                    hr: () => <hr className="border-border/30 my-8" />,
                                                    a: ({ href, children }) => <a href={href} className="text-sky-600 underline underline-offset-2 hover:text-sky-800 transition-colors" target="_blank" rel="noopener noreferrer">{children}</a>,
                                                }}
                                            >
                                                {formData.content_md}
                                            </ReactMarkdown>
                                        ) : (
                                            <span className="text-foreground/20 italic text-base">Esperando contenido técnico...</span>
                                        )}
                                    </div>

                                    <div className="mt-32 pt-12 border-t border-border/40 flex items-center justify-between opacity-30 text-black">
                                        <div className="space-y-1">
                                            <p className="text-[9px] font-black uppercase tracking-widest">Firmado Digitalmente</p>
                                            <p className="text-[11px] font-mono tracking-tighter uppercase">Aura_Internal_Registry</p>
                                        </div>
                                        <div className="w-24 h-24 bg-black/5 rounded-2xl flex items-center justify-center">
                                            <Database size={40} className="opacity-10" />
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            )}
        </div>
    )
}
