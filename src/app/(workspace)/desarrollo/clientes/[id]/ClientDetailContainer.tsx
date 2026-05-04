'use client'

import React, { useState, useTransition, KeyboardEvent } from 'react'
import { Client, Opportunity, ClientProfile, ClientInsights } from '@/types'
import { PageHeader } from '@/components/ui/PageHeader'
import { FtxSelect } from '@/components/ui/FtxSelect'
import {
    Save,
    Building2,
    Mail,
    Briefcase,
    Globe,
    Search,
    Zap,
    TrendingUp,
    AlertCircle,
    ArrowRight,
    Copy,
    CheckCircle2,
    LucideIcon,
    X,
    Plus,
    Trash2,
    ChevronDown,
    UserPlus,
    RefreshCw,
    ShieldCheck
} from 'lucide-react'
import { updateClientAction, convertCompetitorAction } from './actions'
import { useRouter } from 'next/navigation'
import { Modal } from '@/components/ui/Modal'
import Link from 'next/link'

interface ClientDetailContainerProps {
    initialClient: Client
    opportunities: Opportunity[]
}

const SectionTitle = ({ icon: Icon, title }: { icon: LucideIcon, title: string }) => (
    <div className="flex items-center gap-2 mb-6 border-b border-border/50 pb-3 font-montserrat">
        <Icon size={20} className="text-primary" />
        <h2 className="text-lg font-black uppercase tracking-wider text-foreground">{title}</h2>
    </div>
)

const Card = ({ children, className = "" }: { children: React.ReactNode, className?: string }) => (
    <div className={`rounded-3xl border border-border/50 bg-card p-8 shadow-sm animate-in fade-in duration-500 font-montserrat ${className}`}>
        {children}
    </div>
)

const TagInput = ({ tags, onUpdate, placeholder, label }: { tags: string[], onUpdate: (newTags: string[]) => void, placeholder: string, label: string }) => {
    const [inputValue, setInputValue] = useState('')

    const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
        if (e.key === 'Enter' && inputValue.trim()) {
            e.preventDefault()
            if (!tags.includes(inputValue.trim())) {
                onUpdate([...tags, inputValue.trim()])
            }
            setInputValue('')
        }
    }

    const removeTag = (tagToRemove: string) => {
        onUpdate(tags.filter(tag => tag !== tagToRemove))
    }

    return (
        <div className="space-y-2">
            <label className="text-[10px] font-black uppercase tracking-widest text-foreground/40 ml-1">{label}</label>
            <div className="flex flex-wrap gap-2 min-h-[3rem] p-3 rounded-2xl border border-border/50 bg-background/30 focus-within:border-primary transition-all">
                {tags.map(tag => (
                    <span key={tag} className="flex items-center gap-1.5 rounded-lg bg-primary/10 px-2.5 py-1 text-xs font-bold text-primary border border-primary/20">
                        {tag}
                        <button onClick={() => removeTag(tag)} className="hover:text-destructive transition-colors">
                            <X size={12} />
                        </button>
                    </span>
                ))}
                <input
                    value={inputValue}
                    onChange={e => setInputValue(e.target.value)}
                    onKeyDown={handleKeyDown}
                    className="flex-1 min-w-[120px] bg-transparent text-sm font-bold outline-none placeholder:font-medium placeholder:text-foreground/20"
                    placeholder={placeholder}
                />
            </div>
        </div>
    )
}

const PresenceRow = ({
    label,
    value,
    observations,
    options,
    onStatusChange,
    onObsChange,
    placeholder
}: {
    label: string,
    value: string,
    observations: string,
    options: { label: string, value: string }[],
    onStatusChange: (val: string) => void,
    onObsChange: (val: string) => void,
    placeholder: string
}) => (
    <div className="p-5 rounded-2xl border border-border/20 bg-background/20 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <span className="text-xs font-black uppercase tracking-widest text-foreground/60">{label}</span>
            <div className="w-full sm:w-64">
                <FtxSelect
                    value={value}
                    onChange={onStatusChange}
                    options={options}
                />
            </div>
        </div>
        <textarea
            className="w-full h-16 rounded-xl border border-border/50 bg-card px-4 py-2 text-xs focus:border-primary outline-none transition-all resize-none shadow-sm"
            placeholder={placeholder}
            value={observations}
            onChange={e => onObsChange(e.target.value)}
        />
    </div>
)

export function ClientDetailContainer({ initialClient, opportunities }: ClientDetailContainerProps) {
    const router = useRouter()
    const [isPending, startTransition] = useTransition()
    const [showSuccessModal, setShowSuccessModal] = useState(false)
    const [showCopyToast, setShowCopyToast] = useState(false)
    const [isConverting, setIsConverting] = useState(false)
    const [competitorToConvert, setCompetitorToConvert] = useState<{ index: number; name: string } | null>(null)
    const [conversionOptions, setConversionOptions] = useState({
        syncNetwork: true,
        copyIndustry: true
    })

    // Robust data migration / initialization
    const sanitizeProfile = (raw?: any): ClientProfile => {
        const d = raw || {}
        return {
            industry: d.industry || '',
            business_model: d.business_model || '',
            target_market: d.target_market || '',
            value_proposition: d.value_proposition || '',
            website: d.website || '',
            social_links: d.social_links || '',
            digital_presence: {
                website: { quality: d.digital_presence?.website?.quality || '', observations: d.digital_presence?.website?.observations || '' },
                ads: { status: d.digital_presence?.ads?.status || '', observations: d.digital_presence?.ads?.observations || '' },
                seo: { status: d.digital_presence?.seo?.status || '', observations: d.digital_presence?.seo?.observations || '' },
                social: { status: d.digital_presence?.social?.status || '', observations: d.digital_presence?.social?.observations || '' }
            },
            brand_positioning: {
                tone: Array.isArray(d.brand_positioning?.tone) ? d.brand_positioning.tone : [],
                colors: Array.isArray(d.brand_positioning?.colors) ? d.brand_positioning.colors : [],
                perceived_level: {
                    level: d.brand_positioning?.perceived_level?.level || '',
                    observations: d.brand_positioning?.perceived_level?.observations || ''
                }
            }
        }
    }

    const sanitizeInsights = (raw?: any): ClientInsights => {
        const d = raw || {}
        return {
            initial_observations: {
                key_finding: typeof d.initial_observations === 'object' ? d.initial_observations?.key_finding || '' : (typeof d.initial_observations === 'string' ? d.initial_observations : '')
            },
            competitors_detected: Array.isArray(d.competitors_detected) ? d.competitors_detected : [],
            market_notes: Array.isArray(d.market_notes) ? d.market_notes : [],
            technical_conclusion: {
                diagnosis: typeof d.technical_conclusion === 'object' ? d.technical_conclusion?.diagnosis || '' : (typeof d.technical_conclusion === 'string' ? d.technical_conclusion : ''),
                immediate_opportunities: Array.isArray(d.technical_conclusion?.immediate_opportunities) ? d.technical_conclusion.immediate_opportunities : []
            }
        }
    }

    const [client, setClient] = useState<Client>({
        ...initialClient,
        client_profile_jsonb: sanitizeProfile(initialClient.client_profile_jsonb),
        client_insights_jsonb: sanitizeInsights(initialClient.client_insights_jsonb)
    })

    const profile = client.client_profile_jsonb as ClientProfile
    const insights = client.client_insights_jsonb as ClientInsights

    const handleSave = async () => {
        startTransition(async () => {
            const result = await updateClientAction(client.id, {
                razon_social: client.razon_social,
                ruc: client.ruc,
                persona_contacto: client.persona_contacto,
                email: client.email,
                client_profile_jsonb: client.client_profile_jsonb,
                client_insights_jsonb: client.client_insights_jsonb
            })

            if (result.success) {
                setShowSuccessModal(true)
            } else {
                alert('Error al guardar: ' + result.error)
            }
        })
    }

    const updateProfile = (updates: Partial<ClientProfile>) => {
        setClient(prev => ({
            ...prev,
            client_profile_jsonb: { ...(prev.client_profile_jsonb as ClientProfile), ...updates }
        }))
    }

    const updateInsights = (updates: Partial<ClientInsights>) => {
        setClient(prev => ({
            ...prev,
            client_insights_jsonb: { ...(prev.client_insights_jsonb as ClientInsights), ...updates }
        }))
    }

    const handleConvertCompetitor = async () => {
        if (!competitorToConvert) return
        setIsConverting(true)

        const sourceCompetitor = insights.competitors_detected[competitorToConvert.index]
        
        // 1. Prepare profile
        const newProfile: ClientProfile = {
            industry: conversionOptions.copyIndustry ? profile.industry : '',
            business_model: conversionOptions.copyIndustry ? profile.business_model : '',
            target_market: conversionOptions.copyIndustry ? profile.target_market : '',
            value_proposition: conversionOptions.copyIndustry ? profile.value_proposition : '',
            website: '',
            social_links: '',
            digital_presence: {
                website: { quality: '', observations: '' },
                ads: { status: '', observations: '' },
                seo: { status: '', observations: '' },
                social: { status: '', observations: '' }
            },
            brand_positioning: {
                tone: [],
                colors: [],
                perceived_level: {
                    level: sourceCompetitor.segment.toLowerCase() === 'premium' ? 'premium' : 
                           sourceCompetitor.segment.toLowerCase() === 'medio-alto' ? 'mid' : 'low' as any,
                    observations: `Convertido desde competidor de ${client.razon_social}.`
                }
            }
        }

        // 2. Prepare insights
        const newInsights: ClientInsights = {
            initial_observations: {
                key_finding: `Cliente detectado como competidor estratégico de ${client.razon_social}. Fortaleza detectada: ${sourceCompetitor.strength}`
            },
            competitors_detected: [],
            market_notes: [],
            technical_conclusion: {
                diagnosis: '',
                immediate_opportunities: []
            }
        }

        if (conversionOptions.syncNetwork) {
            // Add current client
            newInsights.competitors_detected.push({
                name: client.razon_social,
                segment: profile.brand_positioning.perceived_level.level === 'premium' ? 'Premium' : 'Medio' as any,
                strength: 'Cliente origen de esta inteligencia.'
            })
            // Add other competitors
            insights.competitors_detected.forEach((c, idx) => {
                if (idx !== competitorToConvert.index) {
                    newInsights.competitors_detected.push({ ...c })
                }
            })
        }

        const newClientData = {
            razon_social: competitorToConvert.name,
            ruc: '',
            persona_contacto: '',
            email: '',
            client_profile_jsonb: newProfile,
            client_insights_jsonb: newInsights,
            portal_token: Math.random().toString(36).substring(2, 15),
            pin_code: null
        }

        const result = await convertCompetitorAction(newClientData)
        setIsConverting(false)

        if (result.success && result.data) {
            setCompetitorToConvert(null)
            router.push(`/desarrollo/clientes/${result.data.id}`)
        } else {
            alert('Error al convertir: ' + result.error)
        }
    }

    const addCompetitor = () => {
        const newCompetitors = [...insights.competitors_detected, { name: '', segment: '' as any, strength: '' }]
        updateInsights({ competitors_detected: newCompetitors })
    }

    const removeCompetitor = (index: number) => {
        const newCompetitors = insights.competitors_detected.filter((_, i) => i !== index)
        updateInsights({ competitors_detected: newCompetitors })
    }

    const updateCompetitor = (index: number, updates: any) => {
        const newCompetitors = [...insights.competitors_detected]
        newCompetitors[index] = { ...newCompetitors[index], ...updates }
        updateInsights({ competitors_detected: newCompetitors })
    }

    const addMarketNote = () => {
        const newNotes = [...insights.market_notes, { trend: '', impact: '' }]
        updateInsights({ market_notes: newNotes })
    }

    const removeMarketNote = (index: number) => {
        const newNotes = insights.market_notes.filter((_, i) => i !== index)
        updateInsights({ market_notes: newNotes })
    }

    const updateMarketNote = (index: number, updates: any) => {
        const newNotes = [...insights.market_notes]
        newNotes[index] = { ...newNotes[index], ...updates }
        updateInsights({ market_notes: newNotes })
    }

    const addTechOpportunity = () => {
        const newOpps = [...insights.technical_conclusion.immediate_opportunities, { action: '', detail: '' }]
        updateInsights({ technical_conclusion: { ...insights.technical_conclusion, immediate_opportunities: newOpps } })
    }

    const removeTechOpportunity = (index: number) => {
        const newOpps = insights.technical_conclusion.immediate_opportunities.filter((_, i) => i !== index)
        updateInsights({ technical_conclusion: { ...insights.technical_conclusion, immediate_opportunities: newOpps } })
    }

    const updateTechOpportunity = (index: number, updates: any) => {
        const newOpps = [...insights.technical_conclusion.immediate_opportunities]
        newOpps[index] = { ...newOpps[index], ...updates }
        updateInsights({ technical_conclusion: { ...insights.technical_conclusion, immediate_opportunities: newOpps } })
    }

    const copyIntelligencePrompt = () => {
        const prompt = `Actúa como un experto en inteligencia competitiva y estrategia de mercado senior. Necesito un peritaje profundo sobre la empresa "${client.razon_social}" y su impacto en el sector donde opera.

Tu objetivo es proporcionarme datos estructurados que pueda mapear directamente a los campos de Inteligencia Interna de mi sistema Aura OS. Responde siguiendo esta estructura técnica exacta:

1. HALLAZGO CLAVE (key_finding): Un párrafo técnico y potente sobre la posición de dominio o debilidad de "${client.razon_social}" en el mercado actual.

2. ANÁLISIS DE COMPETIDOR (Para la lista de competidores):
   - Nombre: [NOMBRE_COMPETIDOR_DETECTADO]
   - Segmento: (Premium / Medio-Alto / Medio / Low-cost)
   - Fortaleza Detectada: (Qué los hace líderes o qué diferencial están explotando mejor)

3. TENDENCIAS Y NOTAS DE MERCADO:
   - Tendencia Detectada: (Nombre de la tendencia. Ej: Tokenización Inmobiliaria) + Impacto: (Cómo esta tendencia capitalizada por la competencia afecta a ${client.razon_social})

4. DIAGNÓSTICO TÉCNICO: Un análisis comparativo de brecha digital de "${client.razon_social}" frente a sus competidores principales. ¿Dónde está perdiendo terreno el cliente?

5. OPORTUNIDADES ESTRATÉGICAS (Acciones inmediatas para superar o diferenciarse):
   - Acción: (Nombre de la acción técnica) + Detalle: (Explicación estratégica de por qué esta acción neutraliza la ventaja de la competencia)

Sé quirúrgico en el análisis, utiliza datos reales que encuentres en el ecosistema digital de "${client.razon_social}" y sus competidores, y mantén un lenguaje de alta dirección.`

        navigator.clipboard.writeText(prompt)
        setShowCopyToast(true)
        setTimeout(() => setShowCopyToast(false), 3000)
    }

    const copyResearchPrompt = () => {
        const prompt = `Actúa como un analista de mercado y estrategia digital senior. Necesito investigar a profundidad a la empresa: ${client.razon_social}.

Fuentes de información:
- Web: ${profile.website || 'No especificada'}
- Redes/Info: ${profile.social_links || 'No especificadas'}
- Contexto preliminar: ${insights.initial_observations.key_finding || 'Sin observaciones previas'}

Tu objetivo es analizar su ecosistema digital y modelo de negocio. Responde siguiendo esta estructura técnica exacta para que pueda mapear los datos a mi sistema Aura OS:

1. PERFIL CORE:
   - Industria: (Sector detallado)
   - Modelo de Negocio: (B2B, B2C o Híbrido)
   - Mercado Objetivo: (Quién es exactamente su cliente ideal)
   - Propuesta de Valor: (Atributo diferenciador real)

2. PRESENCIA DIGITAL (Calificación + Observación Técnica Breve):
   - Sitio Web: (low/medium/high) + (Escribe una observación sobre UX/UI y performance)
   - Ads: (active/inactive/not_detected) + (Indica si ves campañas activas y en qué redes)
   - SEO: (none/basic/advanced) + (Indica si tiene arquitectura para buscador o solo marca)
   - Social: (inactive/moderate/high) + (Indica redes activas y calidad de engagement)

3. IDENTIDAD Y POSICIONAMIENTO:
   - Tono de Voz: (Lista de adjetivos para su comunicación)
   - Colores: (Colores principales de su identidad visual)
   - Nivel Percibido: (low/mid/premium) + (Análisis breve de su jerarquía en el mercado)

4. INTELIGENCIA COMPETITIVA:
   - Competidores: (Nombra al menos 3 competidores directos)
   - Tendencia: (Una nota sobre el mercado actual que les afecte)
   - Oportunidad Estratégica: (Punto de dolor clave donde una solución digital de alto nivel les aportaría valor)

Sé objetivo, técnico y directo. Evita introducciones innecesarias.`

        navigator.clipboard.writeText(prompt)
        setShowCopyToast(true)
        setTimeout(() => setShowCopyToast(false), 3000)
    }

    return (
        <div className="space-y-8 pb-32">
            <div className="sticky top-0 z-50 flex items-center justify-between bg-background/80 py-4 backdrop-blur-md">
                <PageHeader
                    title={client.razon_social}
                    subtitle="Gestión de Perfil Estratégico y Peritaje de Cliente"
                    showBack={true}
                />
                <button
                    onClick={handleSave}
                    disabled={isPending}
                    className="flex items-center gap-2 rounded-2xl bg-primary px-8 py-4 text-sm font-black uppercase tracking-widest text-primary-foreground shadow-lg transition-all hover:bg-primary/90 active:scale-95 disabled:opacity-50"
                >
                    <Save size={18} />
                    {isPending ? 'Sincronizando...' : 'Guardar Cambios'}
                </button>

                {showCopyToast && (
                    <div className="fixed bottom-8 left-1/2 -translate-x-1/2 z-[100] flex items-center gap-3 rounded-2xl bg-foreground px-6 py-4 text-background shadow-2xl animate-in fade-in slide-in-from-bottom-4 duration-300">
                        <CheckCircle2 size={20} className="text-primary" />
                        <span className="text-sm font-bold uppercase tracking-wider">Prompt copiado al portapapeles</span>
                    </div>
                )}
            </div>

            <div className="grid grid-cols-1 gap-8 lg:grid-cols-12 leading-relaxed">
                {/* COLUMNA IZQUIERDA (60%) */}
                <div className="space-y-8 lg:col-span-7">
                    <Card>
                        <SectionTitle icon={Building2} title="Información Fiscal y Contacto" />
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="space-y-2">
                                <label className="text-[10px] font-black uppercase tracking-widest text-foreground/40 ml-1">Razón Social</label>
                                <input
                                    className="w-full rounded-2xl border border-border/50 bg-background/50 px-4 py-3 text-sm font-bold focus:border-primary outline-none transition-all"
                                    value={client.razon_social}
                                    onChange={e => setClient({ ...client, razon_social: e.target.value })}
                                />
                            </div>
                            <div className="space-y-2">
                                <label className="text-[10px] font-black uppercase tracking-widest text-foreground/40 ml-1">RUC</label>
                                <input
                                    className="w-full rounded-2xl border border-border/50 bg-background/50 px-4 py-3 text-sm font-mono focus:border-primary outline-none transition-all"
                                    value={client.ruc}
                                    onChange={e => setClient({ ...client, ruc: e.target.value })}
                                />
                            </div>
                            <div className="space-y-2">
                                <label className="text-[10px] font-black uppercase tracking-widest text-foreground/40 ml-1">Email</label>
                                <input
                                    className="w-full rounded-2xl border border-border/50 bg-background/50 px-4 py-3 text-sm font-bold focus:border-primary outline-none transition-all"
                                    value={client.email}
                                    onChange={e => setClient({ ...client, email: e.target.value })}
                                />
                            </div>
                            <div className="space-y-2">
                                <label className="text-[10px] font-black uppercase tracking-widest text-foreground/40 ml-1">Sitio Web</label>
                                <input
                                    className="w-full rounded-2xl border border-border/50 bg-background/50 px-4 py-3 text-sm font-bold focus:border-primary outline-none transition-all"
                                    placeholder="https://"
                                    value={profile.website || ''}
                                    onChange={e => updateProfile({ website: e.target.value })}
                                />
                            </div>
                            <div className="space-y-2 md:col-span-2">
                                <label className="text-[10px] font-black uppercase tracking-widest text-foreground/40 ml-1">Redes Sociales / Otras Fuentes</label>
                                <input
                                    className="w-full rounded-2xl border border-border/50 bg-background/50 px-4 py-3 text-sm font-bold focus:border-primary outline-none transition-all"
                                    placeholder="LinkedIn, Instagram, etc."
                                    value={profile.social_links || ''}
                                    onChange={e => updateProfile({ social_links: e.target.value })}
                                />
                            </div>
                        </div>
                    </Card>

                    <Card>
                        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8 border-b border-border/50 pb-4">
                            <div className="flex items-center gap-2">
                                <Briefcase size={20} className="text-primary" />
                                <h2 className="text-lg font-black uppercase tracking-wider text-foreground">Perfil de Negocio</h2>
                            </div>
                            <button
                                onClick={copyResearchPrompt}
                                className="flex items-center gap-2 rounded-xl border-2 border-indigo-500/20 px-4 py-2 text-xs font-black uppercase tracking-widest text-indigo-600 transition-all hover:bg-indigo-50 hover:border-indigo-500/40 active:scale-95"
                            >
                                <Copy size={14} />
                                Copiar Prompt de Investigación
                            </button>
                        </div>
                        <div className="space-y-8">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black uppercase tracking-widest text-foreground/40 ml-1">Industria</label>
                                    <input
                                        className="w-full rounded-2xl border border-border/50 bg-background/50 px-4 py-3 text-sm font-bold focus:border-primary outline-none transition-all"
                                        placeholder="Ej: Inmobiliaria, Retail, SaaS"
                                        value={profile.industry || ''}
                                        onChange={e => updateProfile({ industry: e.target.value })}
                                    />
                                </div>
                                <div className="space-y-2">
                                    <FtxSelect
                                        label="Modelo de Negocio"
                                        value={profile.business_model || ''}
                                        onChange={val => updateProfile({ business_model: val as any })}
                                        options={[
                                            { label: 'Business to Business (B2B)', value: 'B2B' },
                                            { label: 'Business to Consumer (B2C)', value: 'B2C' },
                                            { label: 'Modelo Híbrido', value: 'Híbrido' },
                                        ]}
                                    />
                                </div>
                            </div>

                            <div className="space-y-2">
                                <label className="text-[10px] font-black uppercase tracking-widest text-foreground/40 ml-1">Propuesta de Valor</label>
                                <textarea
                                    className="w-full h-24 rounded-2xl border border-border/50 bg-background/50 px-4 py-3 text-sm focus:border-primary outline-none transition-all resize-none font-medium"
                                    placeholder="¿Qué problema resuelven de forma única?"
                                    value={profile.value_proposition || ''}
                                    onChange={e => updateProfile({ value_proposition: e.target.value })}
                                />
                            </div>

                            <div className="space-y-2">
                                <label className="text-[10px] font-black uppercase tracking-widest text-foreground/40 ml-1">Target Market / Clientes Ideal</label>
                                <textarea
                                    className="w-full h-24 rounded-2xl border border-border/50 bg-background/50 px-4 py-3 text-sm focus:border-primary outline-none transition-all resize-none font-medium"
                                    placeholder="Perfil demográfico y psicográfico"
                                    value={profile.target_market || ''}
                                    onChange={e => updateProfile({ target_market: e.target.value })}
                                />
                            </div>

                            <div className="p-6 rounded-3xl bg-secondary/30 border border-border/30 space-y-6">
                                <h3 className="text-xs font-black uppercase tracking-widest text-foreground/60 flex items-center gap-2 mb-4">
                                    <Globe size={14} /> Presencia Digital
                                </h3>
                                <div className="grid grid-cols-1 gap-4">
                                    <PresenceRow
                                        label="Sitio Web"
                                        value={profile.digital_presence.website.quality}
                                        observations={profile.digital_presence.website.observations}
                                        onStatusChange={val => updateProfile({ digital_presence: { ...profile.digital_presence, website: { ...profile.digital_presence.website, quality: val as any } } })}
                                        onObsChange={val => updateProfile({ digital_presence: { ...profile.digital_presence, website: { ...profile.digital_presence.website, observations: val } } })}
                                        options={[
                                            { label: 'Calidad Baja / Obsoleta', value: 'low' },
                                            { label: 'Calidad Media / Funcional', value: 'medium' },
                                            { label: 'Calidad Alta / Benchmarck', value: 'high' }
                                        ]}
                                        placeholder="Ej: Lentitud en móviles, diseño no cohesivo..."
                                    />
                                    <PresenceRow
                                        label="Publicidad (Ads)"
                                        value={profile.digital_presence.ads.status}
                                        observations={profile.digital_presence.ads.observations}
                                        onStatusChange={val => updateProfile({ digital_presence: { ...profile.digital_presence, ads: { ...profile.digital_presence.ads, status: val as any } } })}
                                        onObsChange={val => updateProfile({ digital_presence: { ...profile.digital_presence, ads: { ...profile.digital_presence.ads, observations: val } } })}
                                        options={[
                                            { label: 'Activos', value: 'active' },
                                            { label: 'Inactivos', value: 'inactive' },
                                            { label: 'No detectados', value: 'not_detected' }
                                        ]}
                                        placeholder="Ej: Campañas en Meta activas pero sin landing optimizada..."
                                    />
                                    <PresenceRow
                                        label="SEO / Posicionamiento"
                                        value={profile.digital_presence.seo.status}
                                        observations={profile.digital_presence.seo.observations}
                                        onStatusChange={val => updateProfile({ digital_presence: { ...profile.digital_presence, seo: { ...profile.digital_presence.seo, status: val as any } } })}
                                        onObsChange={val => updateProfile({ digital_presence: { ...profile.digital_presence, seo: { ...profile.digital_presence.seo, observations: val } } })}
                                        options={[
                                            { label: 'Nulo / No indexado', value: 'none' },
                                            { label: 'Básico / Branding', value: 'basic' },
                                            { label: 'Avanzado / Keyword Focus', value: 'advanced' }
                                        ]}
                                        placeholder="Ej: Posiciona solo por nombre de marca..."
                                    />
                                    <PresenceRow
                                        label="Estrategia Social"
                                        value={profile.digital_presence.social.status}
                                        observations={profile.digital_presence.social.observations}
                                        onStatusChange={val => updateProfile({ digital_presence: { ...profile.digital_presence, social: { ...profile.digital_presence.social, status: val as any } } })}
                                        onObsChange={val => updateProfile({ digital_presence: { ...profile.digital_presence, social: { ...profile.digital_presence.social, observations: val } } })}
                                        options={[
                                            { label: 'Inactivo', value: 'inactive' },
                                            { label: 'Moderado / Constante', value: 'moderate' },
                                            { label: 'Alto / Engagement focused', value: 'high' }
                                        ]}
                                        placeholder="Ej: Muy fuerte en LinkedIn, débil en Instagram..."
                                    />
                                </div>
                            </div>

                            <div className="space-y-6">
                                <h3 className="text-xs font-black uppercase tracking-widest text-foreground/60 flex items-center gap-2 mb-4">
                                    <Zap size={14} /> Posicionamiento de Marca
                                </h3>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <TagInput
                                        label="Tono de Voz"
                                        tags={profile.brand_positioning.tone}
                                        onUpdate={tags => updateProfile({ brand_positioning: { ...profile.brand_positioning, tone: tags } })}
                                        placeholder="Escribe y presiona Enter..."
                                    />
                                    <TagInput
                                        label="Colores de Identidad"
                                        tags={profile.brand_positioning.colors}
                                        onUpdate={tags => updateProfile({ brand_positioning: { ...profile.brand_positioning, colors: tags } })}
                                        placeholder="Ej: Azul #003366..."
                                    />
                                </div>
                                <div className="space-y-4">
                                    <FtxSelect
                                        label="Nivel Percibido"
                                        value={profile.brand_positioning.perceived_level.level}
                                        onChange={val => updateProfile({ brand_positioning: { ...profile.brand_positioning, perceived_level: { ...profile.brand_positioning.perceived_level, level: val as any } } })}
                                        options={[
                                            { label: 'Económico / Low Cost', value: 'low' },
                                            { label: 'Gama Media / Estándar', value: 'mid' },
                                            { label: 'Premium / Lujo / Líder', value: 'premium' },
                                        ]}
                                    />
                                    <input
                                        className="w-full rounded-2xl border border-border/50 bg-background/50 px-4 py-3 text-sm font-medium focus:border-primary outline-none transition-all"
                                        placeholder="Observaciones sobre el nivel percibido..."
                                        value={profile.brand_positioning.perceived_level.observations}
                                        onChange={e => updateProfile({ brand_positioning: { ...profile.brand_positioning, perceived_level: { ...profile.brand_positioning.perceived_level, observations: e.target.value } } })}
                                    />
                                </div>
                            </div>
                        </div>
                    </Card>
                </div>

                {/* COLUMNA DERECHA (40%) */}
                <div className="space-y-8 lg:col-span-5">
                    <Card className="border-accent/30 bg-accent/5">
                        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8 border-b border-border/50 pb-4">
                            <div className="flex items-center gap-2">
                                <Zap size={20} className="text-primary" />
                                <h2 className="text-lg font-black uppercase tracking-wider text-foreground">Inteligencia Interna</h2>
                            </div>
                            <button
                                onClick={copyIntelligencePrompt}
                                className="flex items-center gap-2 rounded-xl border-2 border-primary/20 px-4 py-2 text-xs font-black uppercase tracking-widest text-primary transition-all hover:bg-primary/10 active:scale-95"
                            >
                                <Search size={14} />
                                Prompt de Competencia
                            </button>
                        </div>
                        <div className="space-y-8">
                            <div className="space-y-2">
                                <label className="text-[10px] font-black uppercase tracking-widest text-foreground/40 ml-1 flex items-center gap-1">
                                    <AlertCircle size={12} /> Observaciones Iniciales
                                </label>
                                <textarea
                                    className="w-full h-32 rounded-2xl border border-border/50 bg-card px-4 py-3 text-sm focus:border-primary outline-none transition-all resize-none shadow-sm font-medium"
                                    placeholder="Hallazgo clave del ecosistema del cliente..."
                                    value={insights.initial_observations.key_finding}
                                    onChange={e => updateInsights({ initial_observations: { key_finding: e.target.value } })}
                                />
                            </div>

                            {/* COMPETIDORES */}
                            <div className="space-y-4">
                                <div className="flex items-center justify-between">
                                    <label className="text-[10px] font-black uppercase tracking-widest text-foreground/40 ml-1">Competidores Detectados</label>
                                    <button
                                        onClick={addCompetitor}
                                        className="flex items-center gap-1 text-[10px] font-black uppercase tracking-widest text-primary hover:opacity-70 transition-all"
                                    >
                                        <Plus size={12} /> Añadir Competidor
                                    </button>
                                </div>
                                <div className="space-y-4">
                                    {insights.competitors_detected.map((comp, i) => (
                                        <div key={i} className="p-4 rounded-2xl border border-border/30 bg-card/50 space-y-3 relative group">
                                            <button
                                                onClick={() => removeCompetitor(i)}
                                                className="absolute top-4 right-4 text-foreground/20 hover:text-destructive transition-colors"
                                            >
                                                <Trash2 size={14} />
                                            </button>
                                                <div className="flex items-center gap-2">
                                                    <input
                                                        className="flex-1 bg-transparent text-sm font-bold outline-none border-b border-border/30 pb-2 focus:border-primary transition-all pr-8"
                                                        placeholder="Nombre del competidor"
                                                        value={comp.name}
                                                        onChange={e => updateCompetitor(i, { name: e.target.value })}
                                                    />
                                                    <button
                                                        onClick={() => setCompetitorToConvert({ index: i, name: comp.name })}
                                                        disabled={!comp.name}
                                                        className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-primary/10 text-primary hover:bg-primary hover:text-white transition-all text-[10px] font-black uppercase tracking-widest disabled:opacity-30"
                                                        title="Convertir en Perfil de Cliente"
                                                    >
                                                        <UserPlus size={12} />
                                                        Perfil
                                                    </button>
                                                </div>
                                            <FtxSelect
                                                value={comp.segment}
                                                onChange={val => updateCompetitor(i, { segment: val })}
                                                placeholder="Segmento de mercado"
                                                options={[
                                                    { label: 'Premium', value: 'Premium' },
                                                    { label: 'Medio-Alto', value: 'Medio-Alto' },
                                                    { label: 'Medio', value: 'Medio' },
                                                    { label: 'Low-cost', value: 'Low-cost' },
                                                ]}
                                            />
                                            <textarea
                                                className="w-full h-16 bg-transparent text-xs outline-none border border-border/30 rounded-lg p-2 focus:border-primary transition-all resize-none"
                                                placeholder="Fortaleza detectada..."
                                                value={comp.strength}
                                                onChange={e => updateCompetitor(i, { strength: e.target.value })}
                                            />
                                        </div>
                                    ))}
                                </div>
                            </div>

                            {/* NOTAS DE MERCADO */}
                            <div className="space-y-4 pt-4 border-t border-border/20">
                                <div className="flex items-center justify-between">
                                    <label className="text-[10px] font-black uppercase tracking-widest text-foreground/40 ml-1">Notas del Mercado (Tendencias)</label>
                                    <button
                                        onClick={addMarketNote}
                                        className="flex items-center gap-1 text-[10px] font-black uppercase tracking-widest text-primary hover:opacity-70 transition-all"
                                    >
                                        <Plus size={12} /> Añadir Tendencia
                                    </button>
                                </div>
                                <div className="space-y-4">
                                    {insights.market_notes.map((note, i) => (
                                        <div key={i} className="p-4 rounded-2xl border border-border/30 bg-card/50 space-y-3 relative">
                                            <button
                                                onClick={() => removeMarketNote(i)}
                                                className="absolute top-4 right-4 text-foreground/20 hover:text-destructive transition-colors"
                                            >
                                                <Trash2 size={14} />
                                            </button>
                                            <input
                                                className="w-full bg-transparent text-sm font-bold outline-none border-b border-border/30 pb-2 focus:border-primary transition-all pr-8"
                                                placeholder="Tendencia (Ej: Digitalización)"
                                                value={note.trend}
                                                onChange={e => updateMarketNote(i, { trend: e.target.value })}
                                            />
                                            <textarea
                                                className="w-full h-16 bg-transparent text-xs outline-none border border-border/30 rounded-lg p-2 focus:border-primary transition-all resize-none"
                                                placeholder="Impacto en el cliente..."
                                                value={note.impact}
                                                onChange={e => updateMarketNote(i, { impact: e.target.value })}
                                            />
                                        </div>
                                    ))}
                                </div>
                            </div>

                            {/* CONCLUSION TECNICA */}
                            <div className="space-y-4 pt-6 border-t font-bold border-border/40">
                                <div className="space-y-2">
                                    <label className="text-xs font-black uppercase tracking-widest text-primary flex items-center gap-1">
                                        <AlertCircle size={14} /> Diagnóstico Técnico
                                    </label>
                                    <textarea
                                        className="w-full h-32 rounded-2xl border-2 border-primary/10 bg-card px-5 py-4 text-sm font-bold text-foreground focus:border-primary outline-none transition-all resize-none shadow-md"
                                        placeholder="Punto de dolor clave y cómo la solución de Aura lo resuelve..."
                                        value={insights.technical_conclusion.diagnosis}
                                        onChange={e => updateInsights({ technical_conclusion: { ...insights.technical_conclusion, diagnosis: e.target.value } })}
                                    />
                                </div>

                                <div className="space-y-4 pt-4">
                                    <div className="flex items-center justify-between">
                                        <label className="text-[10px] font-black uppercase tracking-widest text-foreground/60 ml-1">Oportunidades Inmediatas</label>
                                        <button
                                            onClick={addTechOpportunity}
                                            className="flex items-center gap-1 text-[10px] font-black uppercase tracking-widest text-primary hover:opacity-70 transition-all font-black"
                                        >
                                            <Plus size={12} /> Añadir Oportunidad
                                        </button>
                                    </div>
                                    <div className="space-y-4">
                                        {insights.technical_conclusion.immediate_opportunities.map((opp, i) => (
                                            <div key={i} className="p-4 rounded-2xl border-2 border-primary/5 bg-primary/5 space-y-3 relative">
                                                <button
                                                    onClick={() => removeTechOpportunity(i)}
                                                    className="absolute top-4 right-4 text-primary/20 hover:text-destructive transition-colors"
                                                >
                                                    <Trash2 size={14} />
                                                </button>
                                                <input
                                                    className="w-full bg-transparent text-sm font-black outline-none border-b border-primary/10 pb-2 focus:border-primary transition-all pr-8 text-foreground"
                                                    placeholder="Acción (Ej: Optimización Core Web Vitals)"
                                                    value={opp.action}
                                                    onChange={e => updateTechOpportunity(i, { action: e.target.value })}
                                                />
                                                <textarea
                                                    className="w-full h-20 bg-transparent text-xs font-bold outline-none border border-primary/10 rounded-lg p-2 focus:border-primary transition-all resize-none text-foreground/80"
                                                    placeholder="Detalle estratégico..."
                                                    value={opp.detail}
                                                    onChange={e => updateTechOpportunity(i, { detail: e.target.value })}
                                                />
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        </div>
                    </Card>

                    <Card>
                        <SectionTitle icon={TrendingUp} title="Historial de Oportunidades" />
                        <div className="space-y-4">
                            {opportunities.length === 0 ? (
                                <p className="text-sm text-foreground/40 text-center py-8 font-medium">Este cliente no tiene oportunidades registradas.</p>
                            ) : (
                                opportunities.map(opp => (
                                    <div key={opp.id} className="flex items-center justify-between p-4 rounded-2xl border border-border/30 bg-background/30 hover:border-primary/40 transition-all group">
                                        <div>
                                            <div className="flex items-center gap-2 mb-1">
                                                <span className={`w-2 h-2 rounded-full ${opp.status === 'won' ? 'bg-success' :
                                                    opp.status === 'lost' ? 'bg-destructive' : 'bg-warning'
                                                    }`} />
                                                <span className="text-sm font-black uppercase tracking-widest text-foreground/60">{opp.dimension}</span>
                                            </div>
                                            <p className="text-xs text-foreground/40 font-mono">{new Date(opp.created_at).toLocaleDateString()}</p>
                                        </div>
                                        <Link
                                            href={`/desarrollo/leads/${opp.id}`}
                                            className="p-2 rounded-xl bg-secondary text-foreground/60 hover:bg-primary hover:text-primary-foreground transition-all"
                                        >
                                            <ArrowRight size={18} />
                                        </Link>
                                    </div>
                                ))
                            )}
                        </div>
                    </Card>
                </div>
            </div>

            {/* MODAL DE ÉXITO PERSONALIZADO */}
            {showSuccessModal && (
                <div className="fixed inset-0 z-[200] flex items-center justify-center p-6">
                    <div className="absolute inset-0 bg-background/60 backdrop-blur-md" onClick={() => setShowSuccessModal(false)} />
                    <div className="relative w-full max-w-md rounded-[40px] border border-border bg-card p-10 shadow-2xl animate-in zoom-in-95 fade-in duration-300">
                        <div className="mb-8 flex h-20 w-20 items-center justify-center rounded-3xl bg-primary/20 text-primary mx-auto">
                            <CheckCircle2 size={40} />
                        </div>
                        <h3 className="mb-2 text-center text-2xl font-black uppercase tracking-tight text-foreground">Sincronización Exitosa</h3>
                        <p className="mb-10 text-center text-foreground/60">El registro del cliente ha sido coreografiado y guardado en el núcleo de Aura OS con éxito.</p>

                        <button
                            onClick={() => setShowSuccessModal(false)}
                            className="w-full rounded-2xl bg-foreground py-4 text-sm font-black uppercase tracking-widest text-background transition-all hover:bg-foreground/90 active:scale-[0.98]"
                        >
                            Entendido
                        </button>
                    </div>
                </div>
            )}

            {/* MODAL DE CONVERSIÓN DE COMPETIDOR */}
            <Modal
                isOpen={!!competitorToConvert}
                onClose={() => setCompetitorToConvert(null)}
                title="Convertir Competidor en Perfil"
                maxWidth="max-w-lg"
            >
                <div className="space-y-6">
                    <div className="flex items-center gap-4 p-6 rounded-3xl bg-primary/5 border border-primary/10">
                        <div className="h-12 w-12 rounded-2xl bg-primary/20 flex items-center justify-center text-primary">
                            <UserPlus size={24} />
                        </div>
                        <div>
                            <p className="text-[10px] font-black uppercase tracking-widest text-primary/60">Nuevo Cliente</p>
                            <h4 className="text-lg font-black text-foreground uppercase truncate max-w-[250px]">{competitorToConvert?.name}</h4>
                        </div>
                    </div>

                    <div className="space-y-4">
                        <p className="text-xs font-bold text-foreground/60 italic">
                            Esta acción creará un nuevo perfil de cliente en Aura OS utilizando la inteligencia detectada hasta ahora.
                        </p>

                        <div className="space-y-3">
                            {/* Opción 1: Sincronizar Red */}
                            <div 
                                onClick={() => setConversionOptions(prev => ({ ...prev, syncNetwork: !prev.syncNetwork }))}
                                className={`flex items-center justify-between p-4 rounded-2xl border transition-all cursor-pointer ${
                                    conversionOptions.syncNetwork ? 'bg-primary/5 border-primary/20' : 'bg-background border-border/50 opacity-60'
                                }`}
                            >
                                <div className="flex items-center gap-3">
                                    <RefreshCw size={18} className={conversionOptions.syncNetwork ? 'text-primary' : 'text-muted-foreground'} />
                                    <div>
                                        <h5 className="text-[11px] font-black uppercase tracking-widest">Sincronizar Red de Competencia</h5>
                                        <p className="text-[10px] font-medium text-foreground/40 mt-0.5">Incluye a {client.razon_social} y otros competidores.</p>
                                    </div>
                                </div>
                                <div className={`h-5 w-10 rounded-full transition-all flex items-center px-1 ${conversionOptions.syncNetwork ? 'bg-primary' : 'bg-muted-foreground/30'}`}>
                                    <div className={`h-3 w-3 rounded-full bg-white transition-all ${conversionOptions.syncNetwork ? 'translate-x-5' : 'translate-x-0'}`} />
                                </div>
                            </div>

                            {/* Opción 2: Copiar ADN Industria */}
                            <div 
                                onClick={() => setConversionOptions(prev => ({ ...prev, copyIndustry: !prev.copyIndustry }))}
                                className={`flex items-center justify-between p-4 rounded-2xl border transition-all cursor-pointer ${
                                    conversionOptions.copyIndustry ? 'bg-primary/5 border-primary/20' : 'bg-background border-border/50 opacity-60'
                                }`}
                            >
                                <div className="flex items-center gap-3">
                                    <ShieldCheck size={18} className={conversionOptions.copyIndustry ? 'text-primary' : 'text-muted-foreground'} />
                                    <div>
                                        <h5 className="text-[11px] font-black uppercase tracking-widest">Copiar ADN de Industria</h5>
                                        <p className="text-[10px] font-medium text-foreground/40 mt-0.5">Heredar Industria, Modelo y Segmento de mercado.</p>
                                    </div>
                                </div>
                                <div className={`h-5 w-10 rounded-full transition-all flex items-center px-1 ${conversionOptions.copyIndustry ? 'bg-primary' : 'bg-muted-foreground/30'}`}>
                                    <div className={`h-3 w-3 rounded-full bg-white transition-all ${conversionOptions.copyIndustry ? 'translate-x-5' : 'translate-x-0'}`} />
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="flex gap-3 pt-4">
                        <button
                            onClick={() => setCompetitorToConvert(null)}
                            className="flex-1 py-4 rounded-2xl border border-border text-[10px] font-black uppercase tracking-widest hover:bg-secondary transition-all"
                        >
                            Cancelar
                        </button>
                        <button
                            onClick={handleConvertCompetitor}
                            disabled={isConverting}
                            className="flex-[2] py-4 rounded-2xl bg-primary text-primary-foreground text-[10px] font-black uppercase tracking-widest shadow-lg shadow-primary/20 hover:bg-primary/90 transition-all flex items-center justify-center gap-2"
                        >
                            {isConverting ? (
                                <RefreshCw size={16} className="animate-spin" />
                            ) : (
                                <UserPlus size={16} />
                            )}
                            {isConverting ? 'Coreografiando...' : 'Confirmar Creación'}
                        </button>
                    </div>
                </div>
            </Modal>
        </div>
    )
}
