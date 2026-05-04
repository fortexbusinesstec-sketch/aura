'use client'

import { useState, useEffect, useMemo } from 'react'
import { PageHeader } from '@/components/ui/PageHeader'
import { createClient } from '@/utils/supabase/client'
import { Opportunity } from '@/types'
import { useRouter } from 'next/navigation'
import { LeadPhaseConfigModal } from '@/components/leads/LeadPhaseConfigModal'
import { ConvertLeadModal } from './components/ConvertLeadModal'
import {
    FileText, Rocket, User, Layout, Activity, ChevronRight, Loader2, Search, X, Settings, CheckCircle2, Route, Clock, RotateCcw
} from 'lucide-react'

export default function LeadsPage() {
    const [opportunities, setOpportunities] = useState<Opportunity[]>([])
    const [isLoading, setIsLoading] = useState(true)
    const [searchTerm, setSearchTerm] = useState('')
    const router = useRouter()

    const supabase = createClient()

    const fetchLeads = async () => {
        setIsLoading(true)
        const { data, error } = await supabase
            .from('opportunities')
            .select('*, client:clients(*)')
            // Mostramos todos los leads activos (excluimos solo 'lost' si prefieres)
            .order('created_at', { ascending: false })

        if (error) {
            console.error('Error fetching leads:', error)
        }

        if (data) {
            console.log('Leads fetched:', data.length, data)
            setOpportunities(data)
        }
        setIsLoading(false)
    }

    useEffect(() => {
        fetchLeads()
    }, [])

    const filteredOpportunities = useMemo(() => {
        return opportunities
            .filter(op => !op.project_converted_id && op.status !== 'converted')
            .filter(op =>
                op.client?.razon_social.toLowerCase().includes(searchTerm.toLowerCase()) ||
                op.client?.ruc?.includes(searchTerm)
            )
    }, [opportunities, searchTerm])

    const [configLead, setConfigLead] = useState<Opportunity | null>(null)
    const [convertLead, setConvertLead] = useState<Opportunity | null>(null)
    const [savedLeadId, setSavedLeadId] = useState<string | null>(null)
    const [convertedProjectId, setConvertedProjectId] = useState<string | null>(null)

    const handleManage = (op: Opportunity) => {
        router.push(`/desarrollo/leads/${op.id}`)
    }

    const handleOpenConfig = (op: Opportunity) => {
        setConfigLead(op)
    }

    const handleRoadmapSaved = (opportunity: Opportunity) => {
        setSavedLeadId(opportunity.id)
        setConfigLead(null)
        // Update lead in list instead of removing it
        setOpportunities(prev => prev.map(o => o.id === opportunity.id ? { ...o, ...opportunity } : o))

        // Auto-dismiss toast after 4 seconds
        setTimeout(() => setSavedLeadId(null), 4000)
    }

    const handleConversionSuccess = (projectId: string) => {
        const leadId = convertLead?.id
        setConvertedProjectId(projectId)
        setConvertLead(null)
        // Remove converted lead from list
        if (leadId) {
            setOpportunities(prev => prev.filter(o => o.id !== leadId))
        }

        setTimeout(() => setConvertedProjectId(null), 5000)
    }

    return (
        <div className="space-y-8 animate-in fade-in duration-700">
            <PageHeader
                title="Gestión de Leads"
                subtitle="Administración de oportunidades y despliegue estratégico"
                action={
                    <div className="relative group w-full sm:w-auto">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground group-focus-within:text-primary transition-colors" size={16} />
                        <input
                            type="text"
                            placeholder="Filtrar por cliente o RUC..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="bg-card border border-border rounded-2xl pl-10 pr-10 py-3 text-xs font-bold outline-none focus:ring-4 focus:ring-primary/10 focus:border-primary/50 transition-all w-full sm:w-64 uppercase tracking-tighter"
                        />
                        {searchTerm && (
                            <button
                                onClick={() => setSearchTerm('')}
                                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                            >
                                <X size={14} />
                            </button>
                        )}
                    </div>
                }
            />

            {isLoading ? (
                <div className="flex flex-col items-center justify-center py-24 space-y-4 px-4">
                    <Loader2 className="w-10 h-10 text-primary animate-spin" />
                    <p className="text-xs font-bold uppercase tracking-widest text-muted-foreground text-center">Sincronizando con el Ecosistema...</p>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4 sm:gap-6">
                    {filteredOpportunities.length > 0 ? (
                        filteredOpportunities.map((op) => {
                            const phases = op.phases_plan_jsonb || []
                            const totalDays = phases.reduce((sum, p) => sum + (p.duration_days || 0), 0)
                            const totalRevisions = phases.reduce((sum, p) => sum + (p.revision_limit || 0), 0)

                            return (
                                <div
                                    key={op.id}
                                    className="group relative bg-card border border-border rounded-2xl sm:rounded-3xl p-4 sm:p-6 transition-all hover:border-primary/50 hover:shadow-2xl hover:shadow-primary/5 cursor-default overflow-hidden"
                                >
                                    {/* Decorative Gradient */}
                                    <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 rounded-full -mr-16 -mt-16 blur-3xl group-hover:bg-primary/10 transition-colors" />

                                    <div className="space-y-6 relative z-10">
                                        {/* Client Header */}
                                        <div className="flex items-start justify-between">
                                            <div className="flex items-center gap-3">
                                                <div className="w-10 h-10 rounded-2xl bg-primary/10 flex items-center justify-center text-primary">
                                                    <User size={20} />
                                                </div>
                                                <div>
                                                    <h3 className="text-sm font-black text-foreground uppercase tracking-tight line-clamp-1">
                                                        {op.client?.razon_social || 'Socio Estratégico'}
                                                    </h3>
                                                    <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">
                                                        RUC: {op.client?.ruc || '-'}
                                                    </p>
                                                </div>
                                            </div>
                                            <div className="flex flex-col items-end gap-1.5">
                                                <div className="px-2 py-1 rounded-lg bg-secondary/50 text-[9px] font-black uppercase text-secondary-foreground border border-border">
                                                    {op.status}
                                                </div>
                                                {op.roadmap_configured && (
                                                    <div className="px-2 py-1 rounded-lg bg-emerald-50 text-[9px] font-black uppercase text-emerald-700 border border-emerald-200 flex items-center gap-1">
                                                        <Route size={10} />
                                                        Roadmap OK
                                                    </div>
                                                )}
                                                {['approved', 'contract_signed', 'paid'].includes(op.status) && (
                                                    <div className="px-2 py-1 rounded-lg bg-sky-50 text-[9px] font-black uppercase text-sky-700 border border-sky-200 flex items-center gap-1">
                                                        <CheckCircle2 size={10} />
                                                        Contrato Firmado
                                                    </div>
                                                )}
                                            </div>
                                        </div>

                                        {/* Info Grid */}
                                        <div className="grid grid-cols-2 gap-4 pt-4 border-t border-border/50">
                                            <div className="space-y-1">
                                                <div className="flex items-center gap-1.5 text-[9px] font-black text-muted-foreground uppercase tracking-tighter">
                                                    <Layout size={10} /> Dimensión
                                                </div>
                                                <p className="text-xs font-bold text-foreground capitalize italic">
                                                    {op.dimension || 'Sin Definir'}
                                                </p>
                                            </div>
                                            <div className="space-y-1 text-right">
                                                <div className="flex items-center justify-end gap-1.5 text-[9px] font-black text-muted-foreground uppercase tracking-tighter">
                                                    <Activity size={10} /> Inversión
                                                </div>
                                                <div className="mt-1 flex flex-col items-end gap-1">
                                                    <p className="px-3 py-1 rounded-lg bg-slate-900 text-[11px] font-black text-primary italic shadow-lg shadow-slate-900/20">
                                                        S/ {op.draft_jsonb?.totalCapex?.toLocaleString() || '0.00'}
                                                    </p>
                                                    {(op.draft_jsonb?.totalOpex || 0) > 0 && (
                                                        <span className="text-[9px] font-bold text-muted-foreground">
                                                            + S/ {op.draft_jsonb?.totalOpex?.toLocaleString()}/mes opcional
                                                        </span>
                                                    )}
                                                </div>
                                            </div>
                                        </div>

                                        {/* Roadmap Summary - Optimized for Admin Mobile */}
                                        {op.roadmap_configured && phases.length > 0 && (
                                            <div className="rounded-xl bg-secondary/30 border border-border/40 p-3 space-y-2 group/roadmap">
                                                <div className="flex items-center justify-between">
                                                    <div className="flex items-center gap-1.5 text-[9px] font-black text-muted-foreground uppercase tracking-widest">
                                                        <Route size={10} /> Roadmap
                                                    </div>
                                                    <div className="hidden sm:flex items-center gap-1.5 text-[9px] font-bold text-muted-foreground">
                                                        Estructura de fases
                                                    </div>
                                                </div>
                                                
                                                <div className="flex items-center gap-3 text-[10px] font-bold text-foreground">
                                                    <span className="flex items-center gap-1 bg-background/50 px-2 py-0.5 rounded-md">
                                                        <Clock size={10} className="text-muted-foreground" />
                                                        {phases.length} fases · {totalDays}d
                                                    </span>
                                                    <span className="text-border/40">|</span>
                                                    <span className="flex items-center gap-1">
                                                        <RotateCcw size={10} className="text-muted-foreground" />
                                                        {totalRevisions} rev.
                                                    </span>
                                                </div>
                                                
                                                {/* Phase badges - Hidden on mobile for admins */}
                                                <div className="hidden sm:flex flex-wrap gap-1 pt-1">
                                                    {phases.slice(0, 3).map((phase) => (
                                                        <span
                                                            key={phase.phase_key}
                                                            className="px-1.5 py-0.5 rounded bg-background border border-border/50 text-[9px] font-bold text-foreground"
                                                        >
                                                            {phase.phase_name}
                                                        </span>
                                                    ))}
                                                    {phases.length > 3 && (
                                                        <span className="px-1.5 py-0.5 rounded bg-background border border-border/50 text-[9px] font-bold text-muted-foreground">
                                                            +{phases.length - 3}
                                                        </span>
                                                    )}
                                                </div>
                                            </div>
                                        )}

                                        {/* Action Buttons */}
                                        <div className="mt-4 space-y-2">
                                            {['approved', 'contract_signed', 'paid'].includes(op.status) && !op.project_converted_id ? (
                                                <button
                                                    onClick={() => setConvertLead(op)}
                                                    className="w-full group/btn relative flex items-center justify-between px-5 py-3.5 bg-primary hover:bg-primary/90 transition-all rounded-2xl border border-border active:scale-95"
                                                >
                                                    <span className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-primary-foreground">
                                                        <Rocket size={14} />
                                                        🚀 Convertir a Proyecto
                                                    </span>
                                                    <ChevronRight size={14} className="text-primary-foreground/70" />
                                                </button>
                                            ) : (
                                                <button
                                                    onClick={() => handleManage(op)}
                                                    className="w-full group/btn relative flex items-center justify-between px-5 py-3.5 bg-secondary hover:bg-primary transition-all rounded-2xl border border-border active:scale-95"
                                                >
                                                    <span className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-foreground group-hover/btn:text-sky-950">
                                                        <Rocket size={14} className="group-hover/btn:animate-bounce" />
                                                        Gestionar Despliegue
                                                    </span>
                                                    <ChevronRight size={14} className="text-muted-foreground group-hover/btn:text-sky-950" />
                                                </button>
                                            )}

                                            {(op.status === 'discovery' || op.status === 'proposal') && !op.project_converted_id && (
                                                <button
                                                    onClick={() => handleOpenConfig(op)}
                                                    className="w-full group/btn relative flex items-center justify-between px-5 py-3 bg-card hover:bg-accent/50 transition-all rounded-2xl border border-border/60 active:scale-95"
                                                >
                                                    <span className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-muted-foreground group-hover/btn:text-foreground">
                                                        <Settings size={14} />
                                                        {op.roadmap_configured ? 'Editar Fases' : 'Configurar Fases'}
                                                    </span>
                                                    <ChevronRight size={14} className="text-muted-foreground/50 group-hover/btn:text-foreground" />
                                                </button>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            )
                        })
                    ) : (
                        <div className="col-span-full py-24 text-center border-2 border-dashed border-border rounded-3xl space-y-4">
                            <FileText className="w-12 h-12 text-muted-foreground/30 mx-auto" />
                            <p className="text-xs font-black uppercase tracking-[0.3em] text-muted-foreground/50">
                                {searchTerm ? 'No hay coincidencias para tu búsqueda' : 'No se encontraron leads en el sistema'}
                            </p>
                        </div>
                    )}
                </div>
            )}

            {/* Phase Config Modal */}
            {configLead && (
                <LeadPhaseConfigModal
                    leadId={configLead.id}
                    clientName={configLead.client?.razon_social || 'Cliente'}
                    isOpen={!!configLead}
                    onClose={() => setConfigLead(null)}
                    onSuccess={handleRoadmapSaved}
                />
            )}

            {/* Convert Lead Modal */}
            {convertLead && (
                <ConvertLeadModal
                    lead={convertLead}
                    isOpen={!!convertLead}
                    onClose={() => setConvertLead(null)}
                    onSuccess={handleConversionSuccess}
                />
            )}

            {/* Success toast for saved roadmap */}
            {savedLeadId && (
                <div className="fixed bottom-6 right-6 z-[200] animate-in slide-in-from-bottom-4 fade-in duration-300">
                    <div className="rounded-2xl bg-emerald-600 text-white px-5 py-4 shadow-2xl flex items-start gap-3 max-w-sm">
                        <CheckCircle2 size={20} className="shrink-0 mt-0.5" />
                        <div>
                            <p className="text-xs font-black uppercase tracking-wider">Roadmap Guardado</p>
                            <p className="text-[11px] font-medium mt-0.5 opacity-90">
                                La configuración de fases se guardó en el lead.
                            </p>
                        </div>
                        <button
                            onClick={() => setSavedLeadId(null)}
                            className="shrink-0 text-white/60 hover:text-white"
                        >
                            <X size={14} />
                        </button>
                    </div>
                </div>
            )}

            {/* Success toast for converted lead */}
            {convertedProjectId && (
                <div className="fixed bottom-6 right-6 z-[200] animate-in slide-in-from-bottom-4 fade-in duration-300">
                    <div className="rounded-2xl bg-emerald-600 text-white px-5 py-4 shadow-2xl flex items-start gap-3 max-w-sm">
                        <CheckCircle2 size={20} className="shrink-0 mt-0.5" />
                        <div>
                            <p className="text-xs font-black uppercase tracking-wider">Proyecto Creado</p>
                            <p className="text-[11px] font-medium mt-0.5 opacity-90">
                                El lead fue convertido exitosamente. Redirigiendo...
                            </p>
                        </div>
                        <button
                            onClick={() => setConvertedProjectId(null)}
                            className="shrink-0 text-white/60 hover:text-white"
                        >
                            <X size={14} />
                        </button>
                    </div>
                </div>
            )}

        </div>
    )
}
