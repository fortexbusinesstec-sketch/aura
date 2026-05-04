'use client'

import { useState, useEffect, useMemo } from 'react'
import { Modal } from '@/components/ui/Modal'
import {
    getAvailableLeads,
    getProfiles,
    getNextProjectCode,
    createProjectFromLead,
    CreateProjectInput,
} from '../actions'
import { Opportunity, Project } from '@/types'
import {
    ChevronRight,
    ChevronLeft,
    Loader2,
    CheckCircle2,
    Rocket,
    User,
    Calendar,
    Code,
    Briefcase,
    ExternalLink,
    Search,
} from 'lucide-react'

// ------------------------------------------------------------------
// Tipos locales
// ------------------------------------------------------------------

interface ProfileOption {
    id: string
    full_name: string
    role: string
}

interface NewProjectModalProps {
    isOpen: boolean
    onClose: () => void
    onSuccess: (project: Project) => void
}

// ------------------------------------------------------------------
// Helpers
// ------------------------------------------------------------------

function formatCurrency(value: number): string {
    return `S/ ${value.toLocaleString('es-PE', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
}

function todayISO(): string {
    return new Date().toISOString().split('T')[0]
}

// ------------------------------------------------------------------
// Componente
// ------------------------------------------------------------------

export function NewProjectModal({ isOpen, onClose, onSuccess }: NewProjectModalProps) {
    // -- Wizard state
    const [step, setStep] = useState(1)
    const [isLoading, setIsLoading] = useState(false)
    const [isSubmitting, setIsSubmitting] = useState(false)

    // -- Data
    const [leads, setLeads] = useState<Opportunity[]>([])
    const [profiles, setProfiles] = useState<ProfileOption[]>([])
    const [code, setCode] = useState('')

    // -- Form
    const [selectedLeadId, setSelectedLeadId] = useState<string>('')
    const [projectName, setProjectName] = useState('')
    const [kickoffDate, setKickoffDate] = useState(todayISO())
    const [leadDevId, setLeadDevId] = useState('')
    const [projectManagerId, setProjectManagerId] = useState('')

    // -- Result
    const [createdProject, setCreatedProject] = useState<Project | null>(null)
    const [errorMsg, setErrorMsg] = useState('')
    const [leadSearch, setLeadSearch] = useState('')

    // -- Derived
    const selectedLead = useMemo(
        () => leads.find((l) => l.id === selectedLeadId) || null,
        [leads, selectedLeadId]
    )

    const totalCalculated = selectedLead?.draft_jsonb?.totalCalculated || 0
    const phasesCount = selectedLead?.phases_plan_jsonb?.length || 0
    const totalDays = useMemo(() => {
        if (!selectedLead?.phases_plan_jsonb) return 0
        return selectedLead.phases_plan_jsonb.reduce(
            (sum, p) => sum + (p.duration_days || 0),
            0
        )
    }, [selectedLead])

    // -- Init data when modal opens
    useEffect(() => {
        if (!isOpen) return

        setStep(1)
        setIsLoading(true)
        setErrorMsg('')
        setCreatedProject(null)
        setSelectedLeadId('')
        setLeadSearch('')
        setProjectName('')
        setKickoffDate(todayISO())
        setLeadDevId('')
        setProjectManagerId('')

        Promise.all([getAvailableLeads(), getProfiles(), getNextProjectCode()])
            .then(([leadsRes, profilesRes, codeRes]) => {
                if (leadsRes.success && leadsRes.data) setLeads(leadsRes.data)
                if (profilesRes.success && profilesRes.data) setProfiles(profilesRes.data)
                if (codeRes.success && codeRes.code) setCode(codeRes.code)
            })
            .catch((err) => {
                console.error('Error initializing modal:', err)
                setErrorMsg('Error cargando datos iniciales')
            })
            .finally(() => setIsLoading(false))
    }, [isOpen])

    const filteredLeads = useMemo(() => {
        if (!leadSearch.trim()) return leads
        const term = leadSearch.toLowerCase()
        return leads.filter(lead => 
            lead.client?.razon_social?.toLowerCase().includes(term) ||
            lead.dimension?.toLowerCase().includes(term) ||
            lead.draft_jsonb?.totalCalculated?.toString().includes(term)
        )
    }, [leads, leadSearch])

    // -- Auto-fill name when lead changes
    useEffect(() => {
        if (selectedLead?.client?.razon_social) {
            setProjectName(`Web - ${selectedLead.client.razon_social}`)
        }
    }, [selectedLead])

    // -- Navigation
    const canGoNext = useMemo(() => {
        if (step === 1) return !!selectedLeadId
        if (step === 2) return projectName.trim().length > 0 && !!kickoffDate
        return true
    }, [step, selectedLeadId, projectName, kickoffDate])

    const handleNext = () => {
        if (!canGoNext) return
        setErrorMsg('')
        if (step < 3) setStep((s) => (s + 1) as 1 | 2 | 3)
    }

    const handleBack = () => {
        setErrorMsg('')
        if (step > 1) setStep((s) => (s - 1) as 1 | 2 | 3)
    }

    const handleCreate = async () => {
        if (!selectedLeadId || !projectName || !kickoffDate) return
        setIsSubmitting(true)
        setErrorMsg('')

        const input: CreateProjectInput = {
            opportunityId: selectedLeadId,
            name: projectName.trim(),
            kickoffDate,
            leadDevId: leadDevId || null,
            projectManagerId: projectManagerId || null,
        }

        const res = await createProjectFromLead(input)
        setIsSubmitting(false)

        if (res.success && res.project) {
            setCreatedProject(res.project)
            onSuccess(res.project)
        } else {
            setErrorMsg(res.error || 'Error desconocido al crear el proyecto')
        }
    }

    const handleClose = () => {
        onClose()
    }

    // -- Render helpers
    const renderStepIndicator = () => (
        <div className="flex items-center justify-center gap-2 mb-6">
            {[1, 2, 3].map((s) => (
                <div key={s} className="flex items-center gap-2">
                    <div
                        className={`w-8 h-8 rounded-full flex items-center justify-center text-[10px] font-black uppercase transition-all ${
                            s === step
                                ? 'bg-primary text-primary-foreground shadow-lg shadow-primary/20'
                                : s < step
                                ? 'bg-emerald-100 text-emerald-700'
                                : 'bg-secondary text-muted-foreground'
                        }`}
                    >
                        {s < step ? <CheckCircle2 size={14} /> : s}
                    </div>
                    {s < 3 && (
                        <div
                            className={`w-8 h-0.5 rounded-full ${
                                s < step ? 'bg-emerald-200' : 'bg-border'
                            }`}
                        />
                    )}
                </div>
            ))}
        </div>
    )

    // ------------------------------------------------------------------
    // Paso 1: Seleccionar Lead
    // ------------------------------------------------------------------
    const renderStep1 = () => (
        <div className="space-y-4 animate-in fade-in duration-300">
            <div className="space-y-1.5">
                <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">
                    Lead Convertido Disponible
                </label>
            <div className="space-y-3">
                <div className="relative group">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground group-focus-within:text-primary transition-colors" size={14} />
                    <input
                        type="text"
                        placeholder="Buscar lead por nombre o dimensión..."
                        value={leadSearch}
                        onChange={(e) => setLeadSearch(e.target.value)}
                        className="w-full bg-card border border-border rounded-2xl py-2.5 pl-9 pr-4 text-[11px] font-bold outline-none focus:ring-4 focus:ring-primary/10 focus:border-primary/50 transition-all uppercase tracking-tighter"
                    />
                </div>

                <div className="relative">
                    <select
                        value={selectedLeadId}
                        onChange={(e) => setSelectedLeadId(e.target.value)}
                        className="w-full appearance-none bg-card border border-border rounded-2xl px-4 py-3 text-xs font-bold text-foreground outline-none focus:ring-4 focus:ring-primary/10 focus:border-primary/50 transition-all uppercase tracking-tighter"
                    >
                        <option value="">
                            {filteredLeads.length > 0 ? 'Seleccionar lead...' : 'No hay resultados'}
                        </option>
                        {filteredLeads.map((lead) => (
                            <option key={lead.id} value={lead.id}>
                                {lead.client?.razon_social || 'Sin nombre'} —{' '}
                                {lead.dimension || 'Sin dimensión'} —{' '}
                                S/ {lead.draft_jsonb?.totalCalculated?.toLocaleString() || '0'}
                            </option>
                        ))}
                    </select>
                    <ChevronRight
                        size={14}
                        className="absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground rotate-90 pointer-events-none"
                    />
                </div>
            </div>
            </div>

            {selectedLead && (
                <div className="rounded-2xl bg-secondary/40 border border-border/50 p-4 space-y-3 animate-in fade-in slide-in-from-bottom-2 duration-300">
                    <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-xl bg-primary/10 flex items-center justify-center text-primary">
                            <User size={18} />
                        </div>
                        <div>
                            <p className="text-xs font-black text-foreground uppercase tracking-tight">
                                {selectedLead.client?.razon_social}
                            </p>
                            <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">
                                RUC: {selectedLead.client?.ruc || '—'}
                            </p>
                        </div>
                    </div>
                    <div className="grid grid-cols-3 gap-2 pt-2 border-t border-border/40">
                        <div className="text-center">
                            <p className="text-[9px] font-black text-muted-foreground uppercase tracking-tighter">
                                Dimensión
                            </p>
                            <p className="text-[11px] font-bold text-foreground capitalize italic mt-0.5">
                                {selectedLead.dimension}
                            </p>
                        </div>
                        <div className="text-center border-x border-border/30">
                            <p className="text-[9px] font-black text-muted-foreground uppercase tracking-tighter">
                                Fases
                            </p>
                            <p className="text-[11px] font-bold text-foreground italic mt-0.5">
                                {phasesCount}
                            </p>
                        </div>
                        <div className="text-center">
                            <p className="text-[9px] font-black text-muted-foreground uppercase tracking-tighter">
                                Inversión
                            </p>
                            <p className="text-[11px] font-bold text-foreground italic mt-0.5">
                                {formatCurrency(totalCalculated)}
                            </p>
                        </div>
                    </div>
                </div>
            )}

            {leads.length === 0 && !isLoading && (
                <div className="text-center py-8 border-2 border-dashed border-border rounded-2xl">
                    <Briefcase size={24} className="mx-auto text-muted-foreground/30 mb-2" />
                    <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">
                        No hay leads disponibles para convertir
                    </p>
                    <p className="text-[10px] text-muted-foreground/60 mt-1">
                        Los leads deben estar publicados (portal activo) o aprobados, y tener roadmap configurado.
                    </p>
                </div>
            )}
        </div>
    )

    // ------------------------------------------------------------------
    // Paso 2: Confirmar Datos
    // ------------------------------------------------------------------
    const renderStep2 = () => (
        <div className="space-y-4 animate-in fade-in duration-300">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                    <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground flex items-center gap-1.5">
                        <Rocket size={10} /> Nombre del Proyecto
                    </label>
                    <input
                        type="text"
                        value={projectName}
                        onChange={(e) => setProjectName(e.target.value)}
                        className="w-full bg-card border border-border rounded-2xl px-4 py-3 text-xs font-bold text-foreground outline-none focus:ring-4 focus:ring-primary/10 focus:border-primary/50 transition-all uppercase tracking-tighter"
                        placeholder="Nombre del proyecto"
                    />
                </div>

                <div className="space-y-1.5">
                    <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground flex items-center gap-1.5">
                        <Code size={10} /> Código
                    </label>
                    <input
                        type="text"
                        value={code}
                        disabled
                        className="w-full bg-secondary/50 border border-border rounded-2xl px-4 py-3 text-xs font-bold text-muted-foreground outline-none uppercase tracking-tighter cursor-not-allowed"
                    />
                </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                    <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground flex items-center gap-1.5">
                        <Calendar size={10} /> Fecha de Inicio
                    </label>
                    <input
                        type="date"
                        value={kickoffDate}
                        onChange={(e) => setKickoffDate(e.target.value)}
                        className="w-full bg-card border border-border rounded-2xl px-4 py-3 text-xs font-bold text-foreground outline-none focus:ring-4 focus:ring-primary/10 focus:border-primary/50 transition-all uppercase tracking-tighter"
                    />
                </div>

                <div className="space-y-1.5">
                    <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">
                        Duración Estimada
                    </label>
                    <div className="w-full bg-secondary/50 border border-border rounded-2xl px-4 py-3 text-xs font-bold text-muted-foreground uppercase tracking-tighter flex items-center gap-2">
                        <ClockIcon size={12} />
                        {totalDays} días
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                    <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">
                        Lead Developer
                    </label>
                    <div className="relative">
                        <select
                            value={leadDevId}
                            onChange={(e) => setLeadDevId(e.target.value)}
                            className="w-full appearance-none bg-card border border-border rounded-2xl px-4 py-3 text-xs font-bold text-foreground outline-none focus:ring-4 focus:ring-primary/10 focus:border-primary/50 transition-all uppercase tracking-tighter"
                        >
                            <option value="">Seleccionar…</option>
                            {profiles.map((p) => (
                                <option key={p.id} value={p.id}>
                                    {p.full_name} ({p.role})
                                </option>
                            ))}
                        </select>
                        <ChevronRight
                            size={14}
                            className="absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground rotate-90 pointer-events-none"
                        />
                    </div>
                </div>

                <div className="space-y-1.5">
                    <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">
                        Project Manager
                    </label>
                    <div className="relative">
                        <select
                            value={projectManagerId}
                            onChange={(e) => setProjectManagerId(e.target.value)}
                            className="w-full appearance-none bg-card border border-border rounded-2xl px-4 py-3 text-xs font-bold text-foreground outline-none focus:ring-4 focus:ring-primary/10 focus:border-primary/50 transition-all uppercase tracking-tighter"
                        >
                            <option value="">Seleccionar…</option>
                            {profiles.map((p) => (
                                <option key={p.id} value={p.id}>
                                    {p.full_name} ({p.role})
                                </option>
                            ))}
                        </select>
                        <ChevronRight
                            size={14}
                            className="absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground rotate-90 pointer-events-none"
                        />
                    </div>
                </div>
            </div>
        </div>
    )

    // ------------------------------------------------------------------
    // Paso 3: Confirmar y Crear
    // ------------------------------------------------------------------
    const renderStep3 = () => (
        <div className="space-y-4 animate-in fade-in duration-300">
            {createdProject ? (
                <div className="text-center space-y-4 py-4 animate-in zoom-in duration-300">
                    <div className="w-16 h-16 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto">
                        <CheckCircle2 size={32} />
                    </div>
                    <div>
                        <p className="text-sm font-black text-foreground uppercase tracking-tight">
                            Proyecto Creado Exitosamente
                        </p>
                        <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest mt-1">
                            {createdProject.code} — {createdProject.name}
                        </p>
                    </div>
                    <div className="pt-2">
                        <a
                            href={`/desarrollo/proyectos/${createdProject.id}`}
                            className="inline-flex items-center gap-2 px-5 py-3 bg-primary hover:bg-primary/90 transition-all rounded-2xl border border-border text-[10px] font-black uppercase tracking-widest text-primary-foreground"
                        >
                            <ExternalLink size={14} />
                            Ir al Proyecto
                        </a>
                    </div>
                </div>
            ) : (
                <>
                    <div className="rounded-2xl bg-secondary/40 border border-border/50 p-4 space-y-3">
                        <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground border-b border-border/40 pb-2">
                            Resumen del Proyecto
                        </p>
                        <div className="space-y-2">
                            <div className="flex justify-between text-xs">
                                <span className="font-bold text-muted-foreground uppercase tracking-tighter">
                                    Lead
                                </span>
                                <span className="font-black text-foreground uppercase tracking-tight">
                                    {selectedLead?.client?.razon_social}
                                </span>
                            </div>
                            <div className="flex justify-between text-xs">
                                <span className="font-bold text-muted-foreground uppercase tracking-tighter">
                                    Nombre
                                </span>
                                <span className="font-black text-foreground uppercase tracking-tight text-right max-w-[60%]">
                                    {projectName}
                                </span>
                            </div>
                            <div className="flex justify-between text-xs">
                                <span className="font-bold text-muted-foreground uppercase tracking-tighter">
                                    Código
                                </span>
                                <span className="font-black text-foreground uppercase tracking-tight">
                                    {code}
                                </span>
                            </div>
                            <div className="flex justify-between text-xs">
                                <span className="font-bold text-muted-foreground uppercase tracking-tighter">
                                    Inicio
                                </span>
                                <span className="font-black text-foreground uppercase tracking-tight">
                                    {new Date(kickoffDate).toLocaleDateString('es-PE', {
                                        day: 'numeric',
                                        month: 'short',
                                        year: 'numeric',
                                    })}
                                </span>
                            </div>
                            <div className="flex justify-between text-xs">
                                <span className="font-bold text-muted-foreground uppercase tracking-tighter">
                                    Duración
                                </span>
                                <span className="font-black text-foreground uppercase tracking-tight">
                                    {totalDays} días · {phasesCount} fases
                                </span>
                            </div>
                            <div className="flex justify-between text-xs">
                                <span className="font-bold text-muted-foreground uppercase tracking-tighter">
                                    Presupuesto
                                </span>
                                <span className="font-black text-foreground uppercase tracking-tight">
                                    {formatCurrency(totalCalculated)}
                                </span>
                            </div>
                            {leadDevId && (
                                <div className="flex justify-between text-xs">
                                    <span className="font-bold text-muted-foreground uppercase tracking-tighter">
                                        Lead Dev
                                    </span>
                                    <span className="font-black text-foreground uppercase tracking-tight">
                                        {profiles.find((p) => p.id === leadDevId)?.full_name}
                                    </span>
                                </div>
                            )}
                            {projectManagerId && (
                                <div className="flex justify-between text-xs">
                                    <span className="font-bold text-muted-foreground uppercase tracking-tighter">
                                        PM
                                    </span>
                                    <span className="font-black text-foreground uppercase tracking-tight">
                                        {profiles.find((p) => p.id === projectManagerId)?.full_name}
                                    </span>
                                </div>
                            )}
                        </div>
                    </div>

                    {errorMsg && (
                        <div className="rounded-xl bg-red-50 border border-red-200 px-4 py-3 text-[11px] font-bold text-red-700">
                            {errorMsg}
                        </div>
                    )}

                    <button
                        onClick={handleCreate}
                        disabled={isSubmitting}
                        className="w-full flex items-center justify-center gap-2 px-5 py-4 bg-primary hover:bg-primary/90 disabled:opacity-60 disabled:cursor-not-allowed transition-all rounded-2xl border border-border active:scale-95"
                    >
                        {isSubmitting ? (
                            <Loader2 size={16} className="animate-spin text-primary-foreground" />
                        ) : (
                            <Rocket size={16} className="text-primary-foreground" />
                        )}
                        <span className="text-[11px] font-black uppercase tracking-widest text-primary-foreground">
                            {isSubmitting ? 'Creando Proyecto…' : 'Crear Proyecto'}
                        </span>
                    </button>
                </>
            )}
        </div>
    )

    return (
        <Modal
            isOpen={isOpen}
            onClose={handleClose}
            title="Nuevo Proyecto"
            maxWidth="max-w-[560px]"
        >
            <div className="space-y-4">
                {renderStepIndicator()}

                {isLoading ? (
                    <div className="flex flex-col items-center justify-center py-12 space-y-3">
                        <Loader2 size={24} className="animate-spin text-primary" />
                        <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">
                            Cargando datos…
                        </p>
                    </div>
                ) : (
                    <>
                        {step === 1 && renderStep1()}
                        {step === 2 && renderStep2()}
                        {step === 3 && renderStep3()}

                        {/* Footer nav buttons */}
                        {!createdProject && (
                            <div className="flex items-center justify-between pt-4 border-t border-border/30">
                                <button
                                    onClick={step === 1 ? handleClose : handleBack}
                                    className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl border border-border bg-card hover:bg-accent/50 transition-all text-[10px] font-black uppercase tracking-widest text-muted-foreground"
                                >
                                    {step > 1 && <ChevronLeft size={14} />}
                                    {step === 1 ? 'Cancelar' : 'Atrás'}
                                </button>

                                {step < 3 && (
                                    <button
                                        onClick={handleNext}
                                        disabled={!canGoNext}
                                        className="flex items-center gap-1.5 px-5 py-2.5 rounded-xl bg-primary hover:bg-primary/90 disabled:opacity-40 disabled:cursor-not-allowed transition-all text-[10px] font-black uppercase tracking-widest text-primary-foreground"
                                    >
                                        Siguiente
                                        <ChevronRight size={14} />
                                    </button>
                                )}
                            </div>
                        )}
                    </>
                )}
            </div>
        </Modal>
    )
}

// Lucide no exporta Clock directamente en algunos casos? Sí, pero lo usé como ClockIcon para evitar conflicto
function ClockIcon({ size = 14, className = '' }: { size?: number; className?: string }) {
    return (
        <svg
            xmlns="http://www.w3.org/2000/svg"
            width={size}
            height={size}
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            className={className}
        >
            <circle cx="12" cy="12" r="10" />
            <polyline points="12 6 12 12 16 14" />
        </svg>
    )
}
