'use client'

import { useState, useEffect, useRef, useCallback } from 'react'
import { useParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/utils/supabase/client'
import { usePitchStore } from '@/store/usePitchStore'
import { ClientPortalView } from '@/components/portal/ClientPortalView'
import { LeadPhaseConfigModal } from '@/components/leads/LeadPhaseConfigModal'
import { debounce } from '@/utils/debounce'
import {
    Layout, Target, FileCheck, Clock, CreditCard, ChevronDown, ChevronUp, ChevronLeft, ChevronRight,
    Loader2, Save, Rocket, Smartphone, Monitor, Coins, Route, CalendarDays, RotateCcw, Layers,
    Settings, TrendingUp, Lightbulb, Zap, AlertTriangle, Users, Search, ExternalLink, MessageSquare,
    CheckCircle2, CircleDot, Globe
} from 'lucide-react'

// ─── Sub-components ───

const Accordion = ({ title, icon: Icon, children, isOpen, onToggle }: { title: string; icon: any; children: React.ReactNode; isOpen: boolean; onToggle: () => void }) => (
    <div className="border-b border-border/40 overflow-hidden">
        <button onClick={onToggle} className="w-full flex items-center justify-between p-5 hover:bg-black/5 transition-all text-left">
            <div className="flex items-center gap-3">
                <div className={`p-2 rounded-lg ${isOpen ? 'bg-primary text-sky-950' : 'bg-secondary text-muted-foreground'}`}>
                    <Icon size={16} />
                </div>
                <span className="text-[10px] font-black uppercase tracking-[0.2em] text-foreground/80">{title}</span>
            </div>
            {isOpen ? <ChevronUp size={14} className="text-muted-foreground" /> : <ChevronDown size={14} className="text-muted-foreground" />}
        </button>
        {isOpen && (
            <div className="p-6 pt-0 space-y-5 animate-in slide-in-from-top-2 duration-300">
                {children}
            </div>
        )}
    </div>
)

const InputLabel = ({ label }: { label: string }) => (
    <label className="block text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1.5 ml-1">{label}</label>
)

const ReadonlyField = ({ label, value }: { label: string; value: string }) => (
    <div>
        <InputLabel label={label} />
        <div className="w-full rounded-xl border border-border/30 bg-slate-50/50 px-4 py-3 text-xs font-bold text-slate-700">
            {value || '—'}
        </div>
    </div>
)

// ─── Date helpers ───
function formatDateShort(dateStr: string) {
    if (!dateStr) return '—'
    return new Date(dateStr + 'T00:00:00').toLocaleDateString('es-PE', { day: '2-digit', month: 'short' })
}

// ─── Page Component ───

export default function LeadDetailPage() {
    const { id } = useParams() as { id: string }
    const router = useRouter()
    const {
        currentOpportunity: opp,
        catalog,
        loadOpportunity,
        fetchCatalog,
        updateCurrentOpportunity,
        saveToSupabase,
        updateClientInfo,
        saveClientToSupabase,
        isLoading: isStoreLoading
    } = usePitchStore()

    const [previewMode, setPreviewMode] = useState<'desktop' | 'mobile'>('desktop')
    const [sidebarTab, setSidebarTab] = useState<'propuesta' | 'roadmap'>('propuesta')
    const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false)
    const [openSection, setOpenSection] = useState<string | null>('strategy')
    const [isPublishing, setIsPublishing] = useState(false)
    const [lastSaved, setLastSaved] = useState<Date | null>(null)
    const [showConfigModal, setShowConfigModal] = useState(false)

    const supabase = createClient()

    useEffect(() => {
        fetchCatalog()
        loadOpportunity(id)
    }, [id])

    // Autosave
    const debouncedSave = useCallback(
        debounce(async () => {
            await saveToSupabase(true)
            setLastSaved(new Date())
        }, 2000),
        [saveToSupabase]
    )

    const lastSavedDraftRef = useRef<string>('')

    useEffect(() => {
        if (opp.id === id) {
            const currentPayload = JSON.stringify({
                portal_headline: opp.portal_headline,
                portal_subheadline: opp.portal_subheadline,
                strategy_jsonb: opp.strategy_jsonb,
                financials_jsonb: opp.financials_jsonb,
                discovery_jsonb: opp.discovery_jsonb,
                meeting_notes: opp.meeting_notes,
                internal_retro: opp.internal_retro,
                deliverables: opp.deliverables,
                delivery_time_text: opp.delivery_time_text,
                revision_rounds: opp.revision_rounds,
                not_included: opp.not_included,
            })
            if (lastSavedDraftRef.current && currentPayload !== lastSavedDraftRef.current) {
                debouncedSave()
            }
            lastSavedDraftRef.current = currentPayload
        }
    }, [opp, id, debouncedSave])

    const handleFieldChange = (field: string, value: any) => {
        updateCurrentOpportunity({ [field]: value } as any)
    }

    const handleJsonbChange = (field: string, subfield: string, value: any) => {
        const currentJsonb = (opp as any)[field] || {}
        updateCurrentOpportunity({ [field]: { ...currentJsonb, [subfield]: value } } as any)
    }

    const handleDiscoveryChange = (subfield: string, value: any) => {
        const currentDiscovery = opp.discovery_jsonb || { pain_points: [] }
        updateCurrentOpportunity({
            discovery_jsonb: { ...currentDiscovery, [subfield]: value }
        } as any)
    }

    const handlePainPointChange = (value: string) => {
        const currentDiscovery = opp.discovery_jsonb || { pain_points: [] }
        const painPoints = [...(currentDiscovery.pain_points || [])]
        if (painPoints.length === 0) {
            painPoints.push({ problem: value, impact: '', severity: '' as any })
        } else {
            painPoints[0] = { ...painPoints[0], problem: value }
        }
        handleDiscoveryChange('pain_points', painPoints)
    }

    const handlePublish = async () => {
        setIsPublishing(true)
        
        // 1. PIN Persistence: Generate if empty
        if (!opp.client?.pin_code) {
            const newPin = Math.floor(1000 + Math.random() * 9000).toString()
            updateClientInfo({ pin_code: newPin })
            // Save immediately to clients table
            await saveClientToSupabase()
        }

        // 2. Deploy opportunity
        updateCurrentOpportunity({ status: 'quoted', is_deployed: true, updated_at: new Date().toISOString() } as any)
        await saveToSupabase(true)
        
        setIsPublishing(false)
    }

    const isPublished = opp.is_deployed || !!opp.client?.pin_code

    const toggleSection = (section: string) => {
        setOpenSection(openSection === section ? null : section)
    }

    const handleRoadmapSaved = async (updatedOpp: any) => {
        // Reload opportunity to get fresh phases_plan_jsonb
        await loadOpportunity(id)
        setShowConfigModal(false)
    }

    const handleOpenConfig = () => {
        setShowConfigModal(true)
    }

    // Roadmap calculations
    const phases = opp.phases_plan_jsonb || []
    const totalDays = phases.reduce((s: number, p: any) => s + (p.duration_days || 0), 0)
    const totalRevisions = phases.reduce((s: number, p: any) => s + (p.revision_limit || 0), 0)
    const kickoffDate = phases[0]?.planned_start_date || '—'
    const deadlineDate = phases[phases.length - 1]?.planned_end_date || '—'

    const isOppMismatch = opp.id !== id
    const shouldShowLoading = isOppMismatch || isStoreLoading

    if (shouldShowLoading) {
        return (
            <div className="flex flex-col items-center justify-center py-48 bg-[#fdfbf7] min-h-screen">
                <Loader2 className="w-12 h-12 text-primary animate-spin" />
                <p className="mt-4 text-xs font-black uppercase tracking-[0.4em] text-muted-foreground">Sincronizando Live Editor...</p>
            </div>
        )
    }

    return (
        <div className="flex flex-col md:flex-row h-[calc(100vh-64px)] -m-8 bg-[#fdfbf7] overflow-hidden relative">

            {/* Back button */}
            <button
                onClick={() => router.back()}
                className="absolute top-4 left-4 z-50 p-2 rounded-full bg-white/80 backdrop-blur border border-border/50 text-slate-400 hover:text-slate-900 transition-all hover:scale-110 active:scale-95 shadow-lg group"
            >
                <ChevronLeft size={20} className="group-hover:-translate-x-0.5 transition-transform" />
            </button>

            {/* Sidebar toggle */}
            <button
                onClick={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
                className={`absolute top-1/2 -translate-y-1/2 z-50 p-2 rounded-r-2xl bg-slate-900 text-white shadow-2xl transition-all duration-500 hover:bg-primary hover:text-sky-950 flex items-center justify-center ${isSidebarCollapsed ? 'left-0' : 'left-full md:left-[400px]'}`}
            >
                {isSidebarCollapsed ? <ChevronRight size={20} /> : <ChevronLeft size={20} />}
            </button>

            {/* SIDEBAR (400px) */}
            <aside className={`border-r border-border/50 bg-white flex flex-col h-full shadow-2xl z-20 transition-all duration-500 ease-in-out ${isSidebarCollapsed ? 'w-0 opacity-0 -translate-x-full overflow-hidden' : 'w-full md:w-[400px] opacity-100 translate-x-0'}`}>

                {/* Header */}
                <div className="p-6 border-b border-border/50 space-y-4">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                            <div className="w-8 h-8 bg-slate-900 rounded-lg flex items-center justify-center">
                                <span className="text-white font-black text-xs">FX</span>
                            </div>
                            <div className="pl-3">
                                <h1 className="text-xs font-black uppercase tracking-tighter text-slate-900">Live Editor</h1>
                                <p className="text-[9px] text-slate-500 font-bold uppercase tracking-widest leading-none mt-0.5">Propuesta en Staging</p>
                            </div>
                        </div>
                        <div className="flex items-center gap-2">
                            {lastSaved && (
                                <div className="flex items-center gap-1 opacity-50">
                                    <CheckCircle2 size={10} className="text-emerald-500" />
                                    <span className="text-[8px] font-black uppercase tracking-widest">Sinc</span>
                                </div>
                            )}
                            <button
                                onClick={handlePublish}
                                disabled={isPublishing || isPublished}
                                className={`flex items-center gap-2 rounded-xl px-4 py-2 text-[10px] font-black uppercase tracking-wider transition-all disabled:opacity-50 ${isPublished ? 'bg-emerald-500 text-white' : 'bg-slate-900 text-white hover:bg-primary'}`}
                            >
                                {isPublishing ? <Loader2 size={14} className="animate-spin" /> : isPublished ? <CheckCircle2 size={14} /> : <Rocket size={14} />}
                                {isPublished ? 'Publicado' : 'Publicar'}
                            </button>
                        </div>
                    </div>

                    {isPublished && (
                        <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-100 space-y-3 animate-in fade-in slide-in-from-top-2 duration-300">
                            <div className="flex items-center justify-between">
                                <span className="text-[10px] font-black text-emerald-700 uppercase tracking-widest">Portal del Cliente Activo</span>
                                <div className="flex items-center gap-1.5 px-2 py-0.5 rounded-md bg-white border border-emerald-100">
                                    <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest">PIN:</span>
                                    <span className="text-[10px] font-black text-emerald-600 tracking-widest">{opp.client?.pin_code || '—'}</span>
                                </div>
                            </div>
                            <div className="flex items-center gap-2">
                                <input 
                                    readOnly 
                                    className="flex-1 bg-white border border-emerald-100 rounded-lg px-3 py-2 text-[10px] font-bold text-emerald-700 outline-none"
                                    value={typeof window !== 'undefined' ? `${window.location.origin}/p/${opp.client?.portal_token}` : ''}
                                />
                                <button 
                                    onClick={() => {
                                        navigator.clipboard.writeText(`${window.location.origin}/p/${opp.client?.portal_token}`)
                                    }}
                                    className="p-2 rounded-lg bg-white border border-emerald-100 text-emerald-600 hover:bg-emerald-100 transition-all active:scale-95"
                                >
                                    <Globe size={14} />
                                </button>
                            </div>
                        </div>
                    )}

                    {/* Tabs */}
                    <div className="flex bg-slate-100 p-1 rounded-xl">
                        <button
                            onClick={() => setSidebarTab('propuesta')}
                            className={`flex-1 flex items-center justify-center gap-2 py-2 rounded-lg text-[9px] font-black uppercase tracking-widest transition-all ${sidebarTab === 'propuesta' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-400 hover:text-slate-600'}`}
                        >
                            <Layout size={12} /> Propuesta
                        </button>
                        <button
                            onClick={() => setSidebarTab('roadmap')}
                            className={`flex-1 flex items-center justify-center gap-2 py-2 rounded-lg text-[9px] font-black uppercase tracking-widest transition-all ${sidebarTab === 'roadmap' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-400 hover:text-slate-600'}`}
                        >
                            <Route size={12} /> Roadmap
                            {opp.roadmap_configured && (
                                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                            )}
                        </button>
                    </div>
                </div>

                {/* Content */}
                <div className="flex-1 overflow-y-auto custom-scrollbar bg-[#fcfaf7]/30">

                    {/* ═════ TAB 1: PROPUESTA ═════ */}
                    {sidebarTab === 'propuesta' && (
                        <>
                            {/* Accordion 1: Resumen Ejecutivo */}
                            <Accordion
                                title="Resumen Ejecutivo"
                                icon={Zap}
                                isOpen={openSection === 'resumen'}
                                onToggle={() => toggleSection('resumen')}
                            >
                                <div className="space-y-4">
                                    <div className="flex items-center justify-between">
                                        <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">Información de Mercado</p>
                                        <button 
                                            onClick={() => router.push(`/clientes/${opp.client_id}`)}
                                            className="text-[10px] font-black text-primary hover:underline uppercase tracking-tighter"
                                        >
                                            Ir a Detalle del Cliente
                                        </button>
                                    </div>
                                    <div>
                                        <InputLabel label="Hallazgo Principal" />
                                        <textarea
                                            className="w-full h-20 rounded-xl border border-border/50 bg-white px-4 py-3 text-xs font-medium focus:border-primary outline-none resize-none transition-all"
                                            value={opp.discovery_jsonb?.key_finding || ''}
                                            onChange={e => handleDiscoveryChange('key_finding', e.target.value)}
                                            placeholder="Diagnóstico crítico del cliente..."
                                        />
                                    </div>
                                    <div>
                                        <InputLabel label="Propuesta de Valor" />
                                        <textarea
                                            className="w-full h-20 rounded-xl border border-border/50 bg-white px-4 py-3 text-xs font-medium focus:border-primary outline-none resize-none transition-all"
                                            value={opp.discovery_jsonb?.value_proposition || ''}
                                            onChange={e => handleDiscoveryChange('value_proposition', e.target.value)}
                                            placeholder="La promesa central para el cliente..."
                                        />
                                    </div>
                                    <div className="grid grid-cols-2 gap-3">
                                        <div>
                                            <InputLabel label="Industria" />
                                            <input
                                                className="w-full rounded-xl border border-border/50 bg-white px-3 py-2.5 text-xs font-bold focus:border-primary outline-none transition-all"
                                                value={opp.discovery_jsonb?.industry || ''}
                                                onChange={e => handleDiscoveryChange('industry', e.target.value)}
                                                placeholder="Ej: Retail, Salud..."
                                            />
                                        </div>
                                        <div>
                                            <InputLabel label="Mercado Actual" />
                                            <input
                                                className="w-full rounded-xl border border-border/50 bg-white px-3 py-2.5 text-xs font-bold focus:border-primary outline-none transition-all"
                                                value={opp.discovery_jsonb?.target_market || ''}
                                                onChange={e => handleDiscoveryChange('target_market', e.target.value)}
                                                placeholder="Segmentos actuales..."
                                            />
                                        </div>
                                    </div>
                                </div>
                            </Accordion>

                            {/* Accordion 2: Mercado e Inteligencia */}
                            <Accordion
                                title="Mercado e Inteligencia"
                                icon={TrendingUp}
                                isOpen={openSection === 'mercado'}
                                onToggle={() => toggleSection('mercado')}
                            >
                                <div className="space-y-4">
                                    <div className="p-4 rounded-xl bg-slate-50 border border-slate-100 text-center space-y-3">
                                        <div className="p-2 rounded-full bg-white w-fit mx-auto border border-slate-100 shadow-sm">
                                            <Users size={16} className="text-slate-400" />
                                        </div>
                                        <p className="text-[10px] font-medium text-slate-500 leading-relaxed">
                                            La inteligencia de mercado y competidores se gestiona desde el perfil maestro del cliente para mantener la coherencia en todas las oportunidades.
                                        </p>
                                        <Link
                                            href={`/desarrollo/clientes/${opp.client_id}`}
                                            className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-white border border-slate-200 text-[10px] font-black uppercase tracking-widest text-slate-600 hover:bg-slate-50 hover:text-primary transition-all active:scale-95"
                                        >
                                            <ExternalLink size={12} />
                                            Ver Detalle del Cliente
                                        </Link>
                                    </div>
                                </div>
                            </Accordion>

                            {/* Accordion 3: Estrategia Digital */}
                            <Accordion
                                title="Estrategia Digital"
                                icon={Target}
                                isOpen={openSection === 'strategy'}
                                onToggle={() => toggleSection('strategy')}
                            >
                                <div className="space-y-4">
                                    <div>
                                        <InputLabel label="Headline del Portal" />
                                        <input
                                            className="w-full rounded-xl border border-border/50 bg-white px-4 py-3 text-sm font-bold focus:border-primary outline-none transition-all"
                                            value={opp.portal_headline || ''}
                                            onChange={e => handleFieldChange('portal_headline', e.target.value)}
                                            placeholder="Ej: Transformación Digital para..."
                                        />
                                    </div>
                                    <div>
                                        <InputLabel label="Sub-Headline del Portal" />
                                        <textarea
                                            className="w-full h-16 rounded-xl border border-border/50 bg-white px-4 py-3 text-xs font-medium focus:border-primary outline-none resize-none transition-all"
                                            value={opp.portal_subheadline || ''}
                                            onChange={e => handleFieldChange('portal_subheadline', e.target.value)}
                                            placeholder="Resume el impacto del proyecto..."
                                        />
                                    </div>
                                    <div>
                                        <InputLabel label="Mensaje Clave (Estratégico)" />
                                        <textarea
                                            className="w-full h-16 rounded-xl border border-border/50 bg-white px-4 py-3 text-xs font-medium focus:border-primary outline-none resize-none transition-all"
                                            value={opp.strategy_jsonb?.key_message || ''}
                                            onChange={e => handleJsonbChange('strategy_jsonb', 'key_message', e.target.value)}
                                            placeholder="La propuesta de valor central..."
                                        />
                                    </div>
                                    <div>
                                        <InputLabel label="Usuario Objetivo (Target)" />
                                        <input
                                            className="w-full rounded-xl border border-border/50 bg-white px-4 py-3 text-xs font-bold focus:border-primary outline-none transition-all"
                                            value={opp.strategy_jsonb?.target_user || ''}
                                            onChange={e => handleJsonbChange('strategy_jsonb', 'target_user', e.target.value)}
                                            placeholder="Ej: Gerentes de Facility..."
                                        />
                                    </div>
                                    <div>
                                        <InputLabel label="Punto de Dolor Principal" />
                                        <textarea
                                            className="w-full h-16 rounded-xl border border-border/50 bg-white px-4 py-3 text-xs font-medium focus:border-primary outline-none resize-none transition-all"
                                            value={opp.discovery_jsonb?.pain_points?.[0]?.problem || ''}
                                            onChange={e => handlePainPointChange(e.target.value)}
                                            placeholder="¿Qué problema resolvemos primero?"
                                        />
                                    </div>
                                </div>
                            </Accordion>

                            {/* Accordion 4: Inversión y ROI */}
                            <Accordion
                                title="Inversión y ROI"
                                icon={Coins}
                                isOpen={openSection === 'financial'}
                                onToggle={() => toggleSection('financial')}
                            >
                                <div className="space-y-5">
                                    <div className="grid grid-cols-2 gap-3">
                                        <div>
                                            <InputLabel label="ROI Estimado" />
                                            <input
                                                className="w-full rounded-xl border border-border/50 bg-white px-3 py-2.5 text-xs font-bold focus:border-primary outline-none transition-all"
                                                value={opp.financials_jsonb?.roi_estimate || ''}
                                                onChange={e => handleJsonbChange('financials_jsonb', 'roi_estimate', e.target.value)}
                                                placeholder="Ej: 3-6 meses..."
                                            />
                                        </div>
                                        <div>
                                            <InputLabel label="Potencial de Ingresos" />
                                            <input
                                                className="w-full rounded-xl border border-border/50 bg-white px-3 py-2.5 text-xs font-bold focus:border-primary outline-none transition-all"
                                                value={opp.financials_jsonb?.revenue_potential || ''}
                                                onChange={e => handleJsonbChange('financials_jsonb', 'revenue_potential', e.target.value)}
                                                placeholder="Ej: Alto..."
                                            />
                                        </div>
                                    </div>
                                    <div>
                                        <InputLabel label="Términos de Pago" />
                                        <input
                                            className="w-full rounded-xl border border-border/50 bg-white px-4 py-3 text-xs font-bold focus:border-primary outline-none transition-all"
                                            value={opp.financials_jsonb?.payment_terms || ''}
                                            onChange={e => handleJsonbChange('financials_jsonb', 'payment_terms', e.target.value)}
                                            placeholder="Ej: 50% inicio / 50% entrega"
                                        />
                                    </div>

                                    <div className="h-px bg-slate-100 my-2" />

                                    {/* Bloques del proyecto */}
                                    <div>
                                        <InputLabel label="Desglose Técnico de Bloques" />
                                        <div className="space-y-2">
                                            {(() => {
                                                const blocks = opp.draft_jsonb?.blocks || []
                                                return blocks.length > 0 ? (
                                                    blocks.map((block: any, i: number) => {
                                                    const item = catalog.find((c: any) =>
                                                        c.id === (opp.dimension === 'landing' ? block.complexity_id : block.catalog_item_id)
                                                    )
                                                    const price = item?.base_price_pen || 0
                                                    return (
                                                        <div key={i} className="flex items-center justify-between rounded-xl border border-slate-100 bg-slate-50/30 p-3">
                                                            <span className="text-[10px] font-bold text-slate-800">{block.name || `Bloque ${i + 1}`}</span>
                                                            <span className="text-xs font-black text-slate-900">S/ {price.toLocaleString()}</span>
                                                        </div>
                                                    )
                                                    })
                                                ) : (
                                                    <p className="text-[10px] text-slate-400">No hay bloques configurados.</p>
                                                )
                                            })()}
                                        </div>
                                    </div>

                                    {/* Totales */}
                                    <div className="rounded-xl bg-slate-900 p-4 space-y-2 shadow-lg shadow-slate-900/10">
                                        <div className="flex justify-between text-[10px]">
                                            <span className="text-slate-400 font-medium uppercase tracking-widest">Inversión CAPEX</span>
                                            <span className="font-black text-primary italic">S/ {opp.draft_jsonb?.totalCapex?.toLocaleString() || '0'}</span>
                                        </div>
                                        <div className="flex justify-between text-[10px]">
                                            <span className="text-slate-400 font-medium uppercase tracking-widest">Suscripción OPEX</span>
                                            <span className="font-black text-primary italic">S/ {opp.draft_jsonb?.totalOpex?.toLocaleString() || '0'}</span>
                                        </div>
                                        <div className="h-px bg-white/10" />
                                        <div className="flex justify-between text-[10px]">
                                            <span className="text-white font-black uppercase tracking-widest">Total S/ IGV</span>
                                            <span className="font-black text-primary text-sm italic">S/ {opp.draft_jsonb?.totalCalculated?.toLocaleString() || '0'}</span>
                                        </div>
                                    </div>
                                </div>
                            </Accordion>
                        </>
                    )}

                    {/* ═════ TAB 2: ROADMAP ═════ */}
                    {sidebarTab === 'roadmap' && (
                        <div className="p-6 space-y-5">
                            {opp.roadmap_configured && phases.length > 0 ? (
                                <>
                                    {/* Summary bar */}
                                    <div className="rounded-2xl border border-primary/20 bg-primary/5 p-4 space-y-3">
                                        <div className="flex items-center gap-2">
                                            <Route size={14} className="text-primary" />
                                            <span className="text-[10px] font-black uppercase tracking-widest text-primary">Resumen del Roadmap</span>
                                        </div>
                                        <div className="grid grid-cols-2 gap-2">
                                            <div className="rounded-lg bg-white border border-border/40 p-2.5 text-center">
                                                <p className="text-lg font-black text-foreground">{totalDays}</p>
                                                <p className="text-[9px] font-bold text-muted-foreground uppercase tracking-wider">días totales</p>
                                            </div>
                                            <div className="rounded-lg bg-white border border-border/40 p-2.5 text-center">
                                                <p className="text-lg font-black text-foreground">{totalRevisions}</p>
                                                <p className="text-[9px] font-bold text-muted-foreground uppercase tracking-wider">revisiones</p>
                                            </div>
                                            <div className="rounded-lg bg-white border border-border/40 p-2.5 text-center">
                                                <p className="text-sm font-black text-foreground">{formatDateShort(kickoffDate)}</p>
                                                <p className="text-[9px] font-bold text-muted-foreground uppercase tracking-wider">inicio</p>
                                            </div>
                                            <div className="rounded-lg bg-white border border-border/40 p-2.5 text-center">
                                                <p className="text-sm font-black text-foreground">{formatDateShort(deadlineDate)}</p>
                                                <p className="text-[9px] font-bold text-muted-foreground uppercase tracking-wider">entrega</p>
                                            </div>
                                        </div>
                                        <button
                                            onClick={handleOpenConfig}
                                            className="w-full flex items-center justify-center gap-2 rounded-xl bg-primary px-4 py-3 text-[10px] font-black uppercase tracking-widest text-primary-foreground hover:bg-primary/90 transition-all"
                                        >
                                            <Settings size={12} /> Editar Configuración
                                        </button>
                                    </div>

                                    {/* Timeline */}
                                    <div className="space-y-0">
                                        {phases.map((phase: any, i: number) => {
                                            const isLast = i === phases.length - 1
                                            const isPending = !phase.status || phase.status === 'pending'
                                            const isActive = phase.status === 'in_progress' || phase.status === 'in_review'
                                            const isDone = phase.status === 'completed' || phase.status === 'approved'

                                            return (
                                                <div key={phase.phase_key} className="flex gap-3">
                                                    <div className="flex flex-col items-center">
                                                        <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 text-[10px] font-black transition-all ${
                                                            isDone ? 'bg-emerald-500 text-white' :
                                                            isActive ? 'bg-[#D4A843] text-white ring-4 ring-[#D4A843]/30' :
                                                            'bg-slate-100 text-slate-400'
                                                        }`}>
                                                            {phase.phase_order}
                                                        </div>
                                                        {!isLast && (
                                                            <div className={`w-px flex-1 my-1 ${isDone ? 'bg-emerald-300' : 'bg-slate-100'}`} />
                                                        )}
                                                    </div>
                                                    <div className="pb-5 flex-1">
                                                        <div className="flex items-center justify-between">
                                                            <p className="text-xs font-black text-foreground">{phase.phase_name}</p>
                                                            {phase.requires_client_approval && (
                                                                <span className="px-1.5 py-0.5 rounded bg-warning/10 text-[9px] font-black text-warning-foreground">
                                                                    Aprob. cliente
                                                                </span>
                                                            )}
                                                        </div>
                                                        <div className="flex items-center gap-3 mt-1 text-[10px] text-muted-foreground">
                                                            <span className="flex items-center gap-1">
                                                                <CalendarDays size={10} />
                                                                {formatDateShort(phase.planned_start_date)} → {formatDateShort(phase.planned_end_date)}
                                                            </span>
                                                            <span className="flex items-center gap-1">
                                                                <Clock size={10} />
                                                                {phase.duration_days}d
                                                            </span>
                                                            <span className="flex items-center gap-1">
                                                                <RotateCcw size={10} />
                                                                {phase.revision_limit} rev
                                                            </span>
                                                        </div>
                                                    </div>
                                                </div>
                                            )
                                        })}
                                    </div>
                                </>
                            ) : (
                                <div className="text-center py-16 space-y-5">
                                    <div className="w-16 h-16 rounded-2xl bg-secondary flex items-center justify-center mx-auto">
                                        <Layers size={28} className="text-muted-foreground" />
                                    </div>
                                    <div className="space-y-1">
                                        <p className="text-xs font-black text-foreground uppercase tracking-widest">Sin Roadmap Configurado</p>
                                        <p className="text-[10px] text-muted-foreground font-medium max-w-[240px] mx-auto leading-relaxed">
                                            Define el cronograma de fases para que el cliente vea las etapas y entregas de su proyecto.
                                        </p>
                                    </div>
                                    <button
                                        onClick={handleOpenConfig}
                                        className="inline-flex items-center gap-2 rounded-xl bg-primary px-5 py-3 text-[10px] font-black uppercase tracking-widest text-primary-foreground hover:bg-primary/90 transition-all active:scale-[0.98]"
                                    >
                                        <Settings size={12} />
                                        Configurar Fases del Proyecto
                                    </button>
                                </div>
                            )}
                        </div>
                    )}
                </div>

                {/* Footer */}
                <div className="p-6 border-t border-border/50 bg-secondary/10">
                    <button
                        onClick={() => saveToSupabase(true)}
                        disabled={isStoreLoading}
                        className="w-full flex items-center justify-center gap-2 rounded-xl bg-primary/20 hover:bg-primary/30 py-4 text-[10px] font-black uppercase tracking-widest text-sky-950 transition-all active:scale-[0.98]"
                    >
                        <Save size={14} /> Guardar Borrador
                    </button>
                </div>
            </aside>

            {/* PREVIEW AREA */}
            <main className="flex-1 bg-secondary/30 relative flex flex-col items-center justify-center overflow-hidden">
                <div className="absolute top-6 left-1/2 -translate-x-1/2 z-10 flex items-center gap-1 bg-white/80 backdrop-blur-md p-1.5 rounded-2xl border border-border/50 shadow-xl">
                    <button
                        onClick={() => setPreviewMode('desktop')}
                        className={`p-2 rounded-xl transition-all ${previewMode === 'desktop' ? 'bg-slate-900 text-white shadow-lg' : 'text-slate-400 hover:bg-black/5'}`}
                    >
                        <Monitor size={18} />
                    </button>
                    <button
                        onClick={() => setPreviewMode('mobile')}
                        className={`p-2 rounded-xl transition-all ${previewMode === 'mobile' ? 'bg-slate-900 text-white shadow-lg' : 'text-slate-400 hover:bg-black/5'}`}
                    >
                        <Smartphone size={18} />
                    </button>
                </div>

                <div className="w-full h-full p-8 lg:p-16 overflow-y-auto flex justify-center custom-scrollbar">
                    <div className={`transition-all duration-700 ease-in-out ${previewMode === 'mobile' ? 'w-[375px]' : (isSidebarCollapsed ? 'w-full max-w-7xl' : 'w-full max-w-5xl')}`}>
                        <ClientPortalView
                            opportunity={opp}
                            client={opp.client}
                            catalog={catalog}
                            mode={previewMode}
                        />
                    </div>
                </div>

                <div className="absolute bottom-6 right-8 flex items-center gap-2 px-4 py-2 rounded-full bg-white/50 text-[10px] font-bold text-muted-foreground shadow-sm">
                    <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                    Sincronizado en tiempo real
                </div>
            </main>

            {/* Phase Config Modal */}
            {showConfigModal && (
                <LeadPhaseConfigModal
                    leadId={id}
                    clientName={opp.client?.razon_social || 'Cliente'}
                    isOpen={showConfigModal}
                    onClose={() => setShowConfigModal(false)}
                    onSuccess={handleRoadmapSaved}
                />
            )}

            <style jsx global>{`
                .custom-scrollbar::-webkit-scrollbar { width: 4px; }
                .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
                .custom-scrollbar::-webkit-scrollbar-thumb { background: rgba(0,0,0,0.05); border-radius: 10px; }
            `}</style>
        </div>
    )
}
