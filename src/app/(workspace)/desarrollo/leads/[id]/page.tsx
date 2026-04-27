'use client'

import React, { useState, useEffect, useMemo, useRef, useCallback } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { PageHeader } from '@/components/ui/PageHeader'
import { createClient } from '@/utils/supabase/client'
import { Opportunity, CatalogItem } from '@/types'
import { usePitchStore } from '@/store/usePitchStore'
import { ClientPortalView } from '@/components/portal/ClientPortalView'
import { debounce } from '@/utils/debounce'
import {
    Layout,
    Target,
    FileCheck,
    Clock,
    CreditCard,
    ChevronDown,
    ChevronUp,
    ChevronLeft,
    ChevronRight,
    Loader2,
    Save,
    Rocket,
    Smartphone,
    Monitor,
    Brain,
    Coins,
    X,
    Plus,
    CheckCircle2,
    Building2,
    Briefcase,
    Globe,
    Zap as ZapIcon,
    Users
} from 'lucide-react'

// Sub-component for Accordion
const Accordion = ({ title, icon: Icon, children, isOpen, onToggle }: { title: string, icon: any, children: React.ReactNode, isOpen: boolean, onToggle: () => void }) => (
    <div className="border-b border-border/40 overflow-hidden">
        <button
            onClick={onToggle}
            className="w-full flex items-center justify-between p-5 hover:bg-black/5 transition-all text-left"
        >
            <div className="flex items-center gap-3">
                <div className={`p-2 rounded-lg ${isOpen ? 'bg-primary text-sky-950' : 'bg-secondary text-muted-foreground'}`}>
                    <Icon size={16} />
                </div>
                <span className="text-[10px] font-black uppercase tracking-[0.2em] text-foreground/80">{title}</span>
            </div>
            {isOpen ? <ChevronUp size={14} className="text-muted-foreground" /> : <ChevronDown size={14} className="text-muted-foreground" />}
        </button>
        {isOpen && (
            <div className="p-6 pt-0 space-y-6 animate-in slide-in-from-top-2 duration-300">
                {children}
            </div>
        )}
    </div>
)

const InputLabel = ({ label }: { label: string }) => (
    <label className="block text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1.5 ml-1">{label}</label>
)

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
        isLoading: isStoreLoading
    } = usePitchStore()

    const [previewMode, setPreviewMode] = useState<'desktop' | 'mobile'>('desktop')
    const [sidebarTab, setSidebarTab] = useState<'propuesta' | 'socio'>('propuesta')
    const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false)
    const [openSection, setOpenSection] = useState<string | null>('strategy')
    const [isPublishing, setIsPublishing] = useState(false)
    const [lastSaved, setLastSaved] = useState<Date | null>(null)
    const [showCopyToast, setShowCopyToast] = useState(false)

    useEffect(() => {
        fetchCatalog()
        loadOpportunity(id)
    }, [id])

    // Debounced autosave
    // eslint-disable-next-line react-hooks/exhaustive-deps
    const debouncedSave = useCallback(
        debounce(async () => {
            await saveToSupabase(true)
            setLastSaved(new Date())
        }, 2000),
        [saveToSupabase]
    )

    const lastSavedDraftRef = useRef<string>('')

    useEffect(() => {
        // Auto-save logic
        if (opp.id === id) {
            const currentPayload = JSON.stringify({
                portal_headline: opp.portal_headline,
                portal_subheadline: opp.portal_subheadline,
                discovery_jsonb: opp.discovery_jsonb,
                strategy_jsonb: opp.strategy_jsonb,
                financials_jsonb: opp.financials_jsonb,
                deliverables: opp.deliverables,
                delivery_time_text: opp.delivery_time_text,
                revision_rounds: opp.revision_rounds,
                not_included: opp.not_included,
                // Client data too!
                client: {
                    razon_social: opp.client?.razon_social,
                    ruc: opp.client?.ruc,
                    client_profile_jsonb: opp.client?.client_profile_jsonb,
                    client_insights_jsonb: opp.client?.client_insights_jsonb
                }
            })

            if (lastSavedDraftRef.current && currentPayload !== lastSavedDraftRef.current) {
                debouncedSave()
                // If client changed, save client too
                if (sidebarTab === 'socio') {
                    usePitchStore.getState().saveClientToSupabase()
                }
            }
            lastSavedDraftRef.current = currentPayload
        }
    }, [opp, id, debouncedSave, sidebarTab])

    const handleFieldChange = (field: keyof Opportunity, value: any) => {
        updateCurrentOpportunity({ [field]: value })
    }

    const handleJsonbChange = (field: string, subfield: string, value: any) => {
        const currentJsonb = (opp as any)[field] || {}
        updateCurrentOpportunity({
            [field]: { ...currentJsonb, [subfield]: value }
        } as any)
    }

    const addPainPoint = () => {
        const current = opp.discovery_jsonb?.pain_points || []
        handleJsonbChange('discovery_jsonb', 'pain_points', [...current, { problem: '', impact: '', severity: 'Media' }])
    }

    const updatePainPoint = (index: number, field: string, value: string) => {
        const current = [...(opp.discovery_jsonb?.pain_points || [])]
        current[index] = { ...current[index], [field]: value }
        handleJsonbChange('discovery_jsonb', 'pain_points', current)
    }

    const removePainPoint = (index: number) => {
        const current = opp.discovery_jsonb?.pain_points || []
        handleJsonbChange('discovery_jsonb', 'pain_points', current.filter((_, i) => i !== index))
    }

    const handleClientChange = (field: string, value: any) => {
        usePitchStore.getState().updateClientInfo({ [field]: value })
    }

    const handleClientJsonbChange = (field: 'client_profile_jsonb' | 'client_insights_jsonb', subfield: string, value: any) => {
        const current = (opp.client as any)?.[field] || {}
        usePitchStore.getState().updateClientInfo({
            [field]: { ...current, [subfield]: value }
        })
    }

    const handleNestedClientChange = (field: 'client_profile_jsonb', subfield: 'digital_presence', key: string, nestedKey: string, value: any) => {
        const current = (opp.client as any)?.[field] || {}
        const section = current[subfield] || {}
        const item = section[key] || {}

        usePitchStore.getState().updateClientInfo({
            [field]: {
                ...current,
                [subfield]: {
                    ...section,
                    [key]: { ...item, [nestedKey]: value }
                }
            }
        })
    }

    const handlePublish = async () => {
        setIsPublishing(true)
        updateCurrentOpportunity({
            status: 'quoted',
            is_deployed: true,
            updated_at: new Date().toISOString()
        })
        await saveToSupabase(true)
        setIsPublishing(false)
    }

    const toggleSection = (section: string) => {
        setOpenSection(openSection === section ? null : section)
    }

    const isOppMismatch = opp.id !== id
    const shouldShowLoading = isOppMismatch || isStoreLoading

    if (shouldShowLoading) {
        return (
            <div className="flex flex-col items-center justify-center py-48 bg-[#fdfbf7] min-h-screen">
                <Loader2 className="w-12 h-12 text-primary animate-spin" />
                <p className="mt-4 text-xs font-black uppercase tracking-[0.4em] text-muted-foreground">Sincronizando Live Editor...</p>
                <p className="mt-2 text-[10px] text-muted-foreground font-bold uppercase tracking-widest opacity-40">Asegurando integridad de datos</p>
            </div>
        )
    }

    return (
        <div className="flex flex-col lg:flex-row h-screen -m-8 bg-[#fdfbf7] overflow-hidden relative">

            {/* BOTON DE RETORNO (FLOTANTE O CABECERA) */}
            <button
                onClick={() => router.back()}
                className="absolute top-6 left-6 z-50 p-2 rounded-full bg-white/80 backdrop-blur border border-border/50 text-slate-400 hover:text-slate-900 transition-all hover:scale-110 active:scale-95 shadow-lg group"
            >
                <ChevronLeft size={20} className="group-hover:-translate-x-0.5 transition-transform" />
            </button>

            {/* TOGGLE SIDEBAR (Para ver full preview) */}
            <button
                onClick={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
                className={`absolute top-1/2 -translate-y-1/2 z-50 p-2 rounded-r-2xl bg-slate-900 text-white shadow-2xl transition-all duration-500 hover:bg-primary hover:text-sky-950 flex items-center justify-center ${isSidebarCollapsed ? 'left-0' : 'left-[400px]'}`}
                title={isSidebarCollapsed ? "Expandir Editor" : "Contraer Editor"}
            >
                {isSidebarCollapsed ? <ChevronRight size={20} /> : <ChevronLeft size={20} />}
            </button>

            {/* SIDEBAR: CONFIGURADOR (400px) */}
            <aside className={`border-r border-border/50 bg-white flex flex-col h-full shadow-2xl z-20 transition-all duration-500 ease-in-out ${isSidebarCollapsed ? 'w-0 opacity-0 -translate-x-full overflow-hidden' : 'w-full lg:w-[400px] opacity-100 translate-x-0'}`}>

                {/* SIDEBAR HEADER */}
                <div className="p-6 border-b border-border/50 space-y-4">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                            <div className="w-8 h-8 bg-slate-900 rounded-lg flex items-center justify-center">
                                <span className="text-white font-black text-xs">FX</span>
                            </div>
                            <div className="flex items-center gap-4 pl-8">
                                <div>
                                    <h1 className="text-xs font-black uppercase tracking-tighter text-slate-900">Live Editor</h1>
                                    <p className="text-[9px] text-slate-500 font-bold uppercase tracking-widest leading-none mt-0.5">Propuesta en Staging</p>
                                </div>
                            </div>
                        </div>
                        <div className="flex items-center gap-2">
                            {isStoreLoading ? (
                                <Loader2 size={12} className="text-primary animate-spin" />
                            ) : lastSaved && (
                                <div className="flex items-center gap-1 opacity-50">
                                    <CheckCircle2 size={10} className="text-emerald-500" />
                                    <span className="text-[8px] font-black uppercase tracking-widest">Sinc</span>
                                </div>
                            )}
                            <button
                                onClick={handlePublish}
                                disabled={isPublishing}
                                className="flex items-center gap-2 rounded-xl bg-slate-900 px-4 py-2 text-[10px] font-black uppercase tracking-wider text-white hover:bg-primary transition-all disabled:opacity-50"
                            >
                                {isPublishing ? <Loader2 size={14} className="animate-spin" /> : <Rocket size={14} />}
                                Publicar
                            </button>
                        </div>
                    </div>

                    {/* TABS SWITCHER */}
                    <div className="flex bg-slate-100 p-1 rounded-xl">
                        <button
                            onClick={() => setSidebarTab('propuesta')}
                            className={`flex-1 flex items-center justify-center gap-2 py-2 rounded-lg text-[9px] font-black uppercase tracking-widest transition-all ${sidebarTab === 'propuesta' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-400 hover:text-slate-600'}`}
                        >
                            <Layout size={12} /> Proyección
                        </button>
                        <button
                            onClick={() => setSidebarTab('socio')}
                            className={`flex-1 flex items-center justify-center gap-2 py-2 rounded-lg text-[9px] font-black uppercase tracking-widest transition-all ${sidebarTab === 'socio' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-400 hover:text-slate-600'}`}
                        >
                            <Building2 size={12} /> Estrategia Socio
                        </button>
                    </div>
                </div>

                {/* ACCORDIONS AREA */}
                <div className="flex-1 overflow-y-auto custom-scrollbar bg-[#fcfaf7]/30">

                    {sidebarTab === 'propuesta' ? (
                        <>
                            {/* 1. ESTRATEGIA DE VENTA */}
                            <Accordion
                                title="Estrategia de Venta"
                                icon={Layout}
                                isOpen={openSection === 'strategy'}
                                onToggle={() => toggleSection('strategy')}
                            >
                                <div className="space-y-4">
                                    <div>
                                        <InputLabel label="Titular del Portal" />
                                        <input
                                            className="w-full rounded-xl border border-border/50 bg-white px-4 py-3 text-sm font-bold focus:border-primary outline-none"
                                            value={opp.portal_headline || ''}
                                            onChange={e => handleFieldChange('portal_headline', e.target.value)}
                                            placeholder="Ej: Transformación Digital para..."
                                        />
                                    </div>
                                    <div>
                                        <InputLabel label="Sub-titular de Valor" />
                                        <textarea
                                            className="w-full h-24 rounded-xl border border-border/50 bg-white px-4 py-3 text-sm font-medium focus:border-primary outline-none resize-none"
                                            value={opp.portal_subheadline || ''}
                                            onChange={e => handleFieldChange('portal_subheadline', e.target.value)}
                                            placeholder="Resume el impacto del proyecto..."
                                        />
                                    </div>
                                    <div className="h-px bg-border/30 my-2" />
                                    <div>
                                        <InputLabel label="Usuario Objetivo (Target)" />
                                        <input
                                            className="w-full rounded-xl border border-border/50 bg-white px-4 py-3 text-xs font-bold focus:border-primary outline-none"
                                            value={opp.strategy_jsonb?.target_user || ''}
                                            onChange={e => handleJsonbChange('strategy_jsonb', 'target_user', e.target.value)}
                                        />
                                    </div>
                                    <div>
                                        <InputLabel label="Mensaje Clave" />
                                        <textarea
                                            className="w-full h-20 rounded-xl border border-border/50 bg-white px-4 py-3 text-xs font-medium focus:border-primary outline-none resize-none"
                                            value={opp.strategy_jsonb?.key_message || ''}
                                            onChange={e => handleJsonbChange('strategy_jsonb', 'key_message', e.target.value)}
                                        />
                                    </div>
                                </div>
                            </Accordion>

                            {/* 2. INVESTIGACIÓN (DISCOVERY) */}
                            <Accordion
                                title="Investigación (Discovery)"
                                icon={Brain}
                                isOpen={openSection === 'discovery'}
                                onToggle={() => toggleSection('discovery')}
                            >
                                <div className="space-y-6">
                                    <div className="space-y-4">
                                        <div className="flex items-center justify-between">
                                            <InputLabel label="Puntos de Dolor" />
                                            <button onClick={addPainPoint} className="text-[10px] font-black text-primary uppercase flex items-center gap-1 hover:underline">
                                                <Plus size={12} /> Agregar
                                            </button>
                                        </div>

                                        {opp.discovery_jsonb?.pain_points.map((point, i) => (
                                            <div key={i} className="p-4 rounded-2xl border border-border/30 bg-white space-y-3 relative group">
                                                <button
                                                    onClick={() => removePainPoint(i)}
                                                    className="absolute top-2 right-2 text-slate-300 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-all"
                                                >
                                                    <X size={14} />
                                                </button>
                                                <div>
                                                    <InputLabel label="Problema" />
                                                    <input
                                                        className="w-full bg-transparent border-b border-border/50 focus:border-primary outline-none text-xs font-bold py-1"
                                                        value={point.problem}
                                                        onChange={e => updatePainPoint(i, 'problem', e.target.value)}
                                                    />
                                                </div>
                                                <div>
                                                    <InputLabel label="Impacto" />
                                                    <textarea
                                                        className="w-full bg-transparent border-b border-border/50 focus:border-primary outline-none text-[11px] font-medium py-1 resize-none h-12"
                                                        value={point.impact}
                                                        onChange={e => updatePainPoint(i, 'impact', e.target.value)}
                                                    />
                                                </div>
                                                <div>
                                                    <InputLabel label="Severidad" />
                                                    <select
                                                        className="w-full bg-slate-50 rounded-lg py-1.5 px-2 text-[10px] font-black uppercase outline-none"
                                                        value={point.severity}
                                                        onChange={e => updatePainPoint(i, 'severity', e.target.value as any)}
                                                    >
                                                        <option value="Alta">Alta</option>
                                                        <option value="Media">Media</option>
                                                        <option value="Baja">Baja</option>
                                                    </select>
                                                </div>
                                            </div>
                                        ))}
                                    </div>

                                    <div className="h-px bg-border/30" />

                                    <div className="space-y-4">
                                        <div>
                                            <InputLabel label="Urgencia de Resolución" />
                                            <input
                                                className="w-full rounded-xl border border-border/50 bg-white px-4 py-3 text-xs font-bold focus:border-primary outline-none"
                                                value={opp.discovery_jsonb?.urgency || ''}
                                                onChange={e => handleJsonbChange('discovery_jsonb', 'urgency', e.target.value)}
                                                placeholder="Ej: Crítica / Próximo Q"
                                            />
                                        </div>
                                        <div className="grid grid-cols-2 gap-3">
                                            <div>
                                                <InputLabel label="Decisor" />
                                                <input
                                                    className="w-full rounded-xl border border-border/50 bg-white px-4 py-3 text-xs font-bold focus:border-primary outline-none"
                                                    value={opp.discovery_jsonb?.decision_maker || ''}
                                                    onChange={e => handleJsonbChange('discovery_jsonb', 'decision_maker', e.target.value)}
                                                />
                                            </div>
                                            <div>
                                                <InputLabel label="Presupuesto" />
                                                <input
                                                    className="w-full rounded-xl border border-border/50 bg-white px-4 py-3 text-xs font-bold focus:border-primary outline-none"
                                                    value={opp.discovery_jsonb?.budget_range || ''}
                                                    onChange={e => handleJsonbChange('discovery_jsonb', 'budget_range', e.target.value)}
                                                />
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </Accordion>

                            {/* 3. PROPUESTA TÉCNICA */}
                            <Accordion
                                title="Propuesta Técnica (Alcance)"
                                icon={FileCheck}
                                isOpen={openSection === 'proposal'}
                                onToggle={() => toggleSection('proposal')}
                            >
                                <div className="space-y-4">
                                    <div>
                                        <InputLabel label="Entregables Principales" />
                                        <textarea
                                            className="w-full h-24 rounded-xl border border-border/50 bg-white px-4 py-3 text-xs font-medium focus:border-primary outline-none resize-none"
                                            value={opp.deliverables || ''}
                                            onChange={e => handleFieldChange('deliverables', e.target.value)}
                                        />
                                    </div>
                                    <div className="grid grid-cols-2 gap-3">
                                        <div>
                                            <InputLabel label="Tiempo Estimado" />
                                            <input
                                                className="w-full rounded-xl border border-border/50 bg-white px-4 py-3 text-xs font-bold focus:border-primary outline-none"
                                                value={opp.delivery_time_text || ''}
                                                onChange={e => handleFieldChange('delivery_time_text', e.target.value)}
                                                placeholder="4 semanas"
                                            />
                                        </div>
                                        <div>
                                            <InputLabel label="Revisiones" />
                                            <input
                                                className="w-full rounded-xl border border-border/50 bg-white px-4 py-3 text-xs font-bold focus:border-primary outline-none"
                                                value={opp.revision_rounds || ''}
                                                onChange={e => handleFieldChange('revision_rounds', e.target.value)}
                                                placeholder="2 rondas"
                                            />
                                        </div>
                                    </div>
                                </div>
                            </Accordion>

                            {/* 4. ANÁLISIS FINANCIERO */}
                            <Accordion
                                title="Análisis Financiero"
                                icon={Coins}
                                isOpen={openSection === 'financial'}
                                onToggle={() => toggleSection('financial')}
                            >
                                <div className="space-y-4">
                                    <div>
                                        <InputLabel label="Retorno Estimado (ROI)" />
                                        <input
                                            className="w-full rounded-xl border border-border/50 bg-white px-4 py-3 text-xs font-bold focus:border-primary outline-none"
                                            value={opp.financials_jsonb?.roi_estimate || ''}
                                            onChange={e => handleJsonbChange('financials_jsonb', 'roi_estimate', e.target.value)}
                                            placeholder="Ej: 3-6 meses"
                                        />
                                    </div>
                                    <div>
                                        <InputLabel label="Potencial de Ingresos" />
                                        <input
                                            className="w-full rounded-xl border border-border/50 bg-white px-4 py-3 text-xs font-bold focus:border-primary outline-none"
                                            value={opp.financials_jsonb?.revenue_potential || ''}
                                            onChange={e => handleJsonbChange('financials_jsonb', 'revenue_potential', e.target.value)}
                                        />
                                    </div>
                                    <div>
                                        <InputLabel label="Términos de Pago" />
                                        <input
                                            className="w-full rounded-xl border border-border/50 bg-white px-4 py-3 text-xs font-bold focus:border-primary outline-none"
                                            value={opp.financials_jsonb?.payment_terms || ''}
                                            onChange={e => handleJsonbChange('financials_jsonb', 'payment_terms', e.target.value)}
                                            placeholder="50% Inicio - 50% Final"
                                        />
                                    </div>
                                </div>
                            </Accordion>
                        </>
                    ) : (
                        <>
                            {/* TAB SOCIO: PERFIL Y INTELIGENCIA */}
                            <Accordion
                                title="Identidad Corporativa"
                                icon={Building2}
                                isOpen={openSection === 'client_identity'}
                                onToggle={() => toggleSection('client_identity')}
                            >
                                <div className="space-y-4">
                                    <div>
                                        <InputLabel label="Razón Social" />
                                        <input
                                            className="w-full rounded-xl border border-border/50 bg-white px-4 py-3 text-xs font-bold focus:border-primary outline-none"
                                            value={opp.client?.razon_social || ''}
                                            onChange={e => handleClientChange('razon_social', e.target.value)}
                                        />
                                    </div>
                                    <div className="grid grid-cols-2 gap-3">
                                        <div>
                                            <InputLabel label="RUC" />
                                            <input
                                                className="w-full rounded-xl border border-border/50 bg-white px-4 py-3 text-xs font-bold focus:border-primary outline-none"
                                                value={opp.client?.ruc || ''}
                                                onChange={e => handleClientChange('ruc', e.target.value)}
                                            />
                                        </div>
                                        <div>
                                            <InputLabel label="Industria" />
                                            <input
                                                className="w-full rounded-xl border border-border/50 bg-white px-4 py-3 text-xs font-bold focus:border-primary outline-none"
                                                value={opp.client?.client_profile_jsonb?.industry || ''}
                                                onChange={e => handleClientJsonbChange('client_profile_jsonb', 'industry', e.target.value)}
                                            />
                                        </div>
                                    </div>
                                    <div>
                                        <InputLabel label="Propuesta de Valor Socio" />
                                        <textarea
                                            className="w-full h-24 rounded-xl border border-border/50 bg-white px-4 py-3 text-xs font-medium focus:border-primary outline-none resize-none"
                                            value={opp.client?.client_profile_jsonb?.value_proposition || ''}
                                            onChange={e => handleClientJsonbChange('client_profile_jsonb', 'value_proposition', e.target.value)}
                                        />
                                    </div>
                                </div>
                            </Accordion>

                            <Accordion
                                title="Presencia y Mercado"
                                icon={Globe}
                                isOpen={openSection === 'client_market'}
                                onToggle={() => toggleSection('client_market')}
                            >
                                <div className="space-y-4">
                                    <div>
                                        <InputLabel label="Mercado Objetivo" />
                                        <input
                                            className="w-full rounded-xl border border-border/50 bg-white px-4 py-3 text-xs font-bold focus:border-primary outline-none"
                                            value={opp.client?.client_profile_jsonb?.target_market || ''}
                                            onChange={e => handleClientJsonbChange('client_profile_jsonb', 'target_market', e.target.value)}
                                        />
                                    </div>
                                    <div>
                                        <InputLabel label="Calidad Web Actual" />
                                        <select
                                            className="w-full bg-slate-50 rounded-lg py-1.5 px-2 text-[10px] font-black uppercase outline-none"
                                            value={opp.client?.client_profile_jsonb?.digital_presence.website.quality || ''}
                                            onChange={e => handleNestedClientChange('client_profile_jsonb', 'digital_presence', 'website', 'quality', e.target.value)}
                                        >
                                            <option value="">Seleccionar...</option>
                                            <option value="low">Baja / Legacy</option>
                                            <option value="medium">Media / Estándar</option>
                                            <option value="high">Alta / Pro</option>
                                        </select>
                                    </div>
                                </div>
                            </Accordion>

                            <Accordion
                                title="Insights Estratégicos"
                                icon={ZapIcon}
                                isOpen={openSection === 'client_insights'}
                                onToggle={() => toggleSection('client_insights')}
                            >
                                <div className="space-y-6">
                                    <div>
                                        <InputLabel label="Hallazgo Principal" />
                                        <textarea
                                            className="w-full h-24 rounded-xl border border-border/50 bg-white px-4 py-3 text-xs font-medium focus:border-primary outline-none resize-none"
                                            value={opp.client?.client_insights_jsonb?.initial_observations.key_finding || ''}
                                            onChange={e => {
                                                const current = opp.client?.client_insights_jsonb || {}
                                                handleClientJsonbChange('client_insights_jsonb', 'initial_observations', { key_finding: e.target.value })
                                            }}
                                        />
                                    </div>
                                    <div className="space-y-4">
                                        <div className="flex items-center justify-between">
                                            <InputLabel label="Notas de Mercado (Tendencias)" />
                                            <button
                                                onClick={() => {
                                                    const current = opp.client?.client_insights_jsonb?.market_notes || []
                                                    handleClientJsonbChange('client_insights_jsonb', 'market_notes', [...current, { trend: '', impact: '' }])
                                                }}
                                                className="text-[10px] font-black text-primary uppercase flex items-center gap-1 hover:underline"
                                            >
                                                <Plus size={12} /> Agregar
                                            </button>
                                        </div>

                                        {(opp.client?.client_insights_jsonb?.market_notes || []).map((note, i) => (
                                            <div key={i} className="p-4 rounded-xl border border-border/30 bg-white space-y-2 relative group">
                                                <button
                                                    onClick={() => {
                                                        const current = opp.client?.client_insights_jsonb?.market_notes || []
                                                        handleClientJsonbChange('client_insights_jsonb', 'market_notes', current.filter((_, idx) => idx !== i))
                                                    }}
                                                    className="absolute top-2 right-2 text-slate-300 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-all"
                                                >
                                                    <X size={14} />
                                                </button>
                                                <input
                                                    className="w-full text-xs font-bold border-b border-border/50 outline-none py-1"
                                                    value={note.trend || ''}
                                                    placeholder="Tendencia..."
                                                    onChange={e => {
                                                        const current = [...(opp.client?.client_insights_jsonb?.market_notes || [])]
                                                        current[i] = { ...current[i], trend: e.target.value }
                                                        handleClientJsonbChange('client_insights_jsonb', 'market_notes', current)
                                                    }}
                                                />
                                                <textarea
                                                    className="w-full text-[10px] font-medium text-slate-500 outline-none resize-none h-12"
                                                    value={note.impact || ''}
                                                    placeholder="Impacto / Observación..."
                                                    onChange={e => {
                                                        const current = [...(opp.client?.client_insights_jsonb?.market_notes || [])]
                                                        current[i] = { ...current[i], impact: e.target.value }
                                                        handleClientJsonbChange('client_insights_jsonb', 'market_notes', current)
                                                    }}
                                                />
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </Accordion>
                        </>
                    )}
                </div>

                {/* FOOTER ACTIONS */}
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

            {/* PREVIEW AREA: PORTAL (Flexible) */}
            <main className="flex-1 bg-secondary/30 relative flex flex-col items-center justify-center overflow-hidden">

                {/* DEVICE TOGGLE */}
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

                {/* LIVE PREVIEW CONTAINER */}
                <div className="w-full h-full p-8 lg:p-16 overflow-y-auto flex justify-center custom-scrollbar">
                    <div className={`transition-all duration-700 ease-in-out ${previewMode === 'mobile' ? 'w-[375px]' : (isSidebarCollapsed ? 'w-full max-w-7xl' : 'w-full max-w-5xl')}`}>
                        <ClientPortalView
                            opportunity={opp}
                            catalog={catalog}
                            mode={previewMode}
                        />
                    </div>
                </div>

                {/* INDICADOR DE CAMBIOS NO GUARDADOS */}
                <div className="absolute bottom-6 right-8 flex items-center gap-2 px-4 py-2 rounded-full bg-white/50 text-[10px] font-bold text-muted-foreground shadow-sm">
                    <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                    Sincronizado en tiempo real
                </div>
            </main>

            <style jsx global>{`
                .custom-scrollbar::-webkit-scrollbar { width: 4px; }
                .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
                .custom-scrollbar::-webkit-scrollbar-thumb { background: rgba(0,0,0,0.05); border-radius: 10px; }
            `}</style>
        </div>
    )
}
