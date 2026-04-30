'use client'

import { useState, useEffect, useMemo, useCallback } from 'react'
import { Modal } from '@/components/ui/Modal'
import { createClient } from '@/utils/supabase/client'
import { PhaseTemplate, PhaseDefinition, Opportunity } from '@/types'
import { saveLeadRoadmapConfig } from '@/app/(workspace)/desarrollo/leads/actions'
import {
    ChevronRight,
    ChevronLeft,
    CheckCircle2,
    Clock,
    RotateCcw,
    Calendar,
    AlertCircle,
    Loader2,
    GitBranch,
    Layers,
    CalendarDays,
    Save,
} from 'lucide-react'

interface LeadPhaseConfigModalProps {
    leadId: string
    clientName: string
    isOpen: boolean
    onClose: () => void
    onSuccess: (opportunity: Opportunity) => void
}

interface EditablePhase extends PhaseDefinition {
    planned_start_date: string
    planned_end_date: string
    requiresClientApproval: boolean
}

// Date helpers
function addDays(dateStr: string, days: number): string {
    const date = new Date(dateStr + 'T00:00:00')
    date.setDate(date.getDate() + days)
    return date.toISOString().split('T')[0]
}

function formatDate(dateStr: string): string {
    const date = new Date(dateStr + 'T00:00:00')
    return date.toLocaleDateString('es-ES', { day: '2-digit', month: 'short', year: 'numeric' })
}

function today(): string {
    return new Date().toISOString().split('T')[0]
}

export function LeadPhaseConfigModal({ leadId, clientName, isOpen, onClose, onSuccess }: LeadPhaseConfigModalProps) {
    const [step, setStep] = useState<1 | 2 | 3>(1)
    const [templates, setTemplates] = useState<PhaseTemplate[]>([])
    const [isLoadingTemplates, setIsLoadingTemplates] = useState(false)
    const [selectedTemplateId, setSelectedTemplateId] = useState('')
    const [kickoffDate, setKickoffDate] = useState(today())
    const [editablePhases, setEditablePhases] = useState<EditablePhase[]>([])
    const [isSubmitting, setIsSubmitting] = useState(false)
    const [submitError, setSubmitError] = useState('')

    const supabase = createClient()

    // Fetch templates on open
    useEffect(() => {
        if (!isOpen) return

        const fetchTemplates = async () => {
            setIsLoadingTemplates(true)
            const { data, error } = await supabase
                .from('phase_templates')
                .select('*')
                .eq('project_type', 'develop')
                .order('is_default', { ascending: false })
                .order('name')

            if (data) setTemplates(data as PhaseTemplate[])
            setIsLoadingTemplates(false)
        }

        fetchTemplates()
        setStep(1)
        setSelectedTemplateId('')
        setEditablePhases([])
        setKickoffDate(today())
        setSubmitError('')
    }, [isOpen])

    const selectedTemplate = useMemo(
        () => templates.find(t => t.id === selectedTemplateId),
        [templates, selectedTemplateId]
    )

    // Generate phases from template
    const generatePhases = useCallback((template: PhaseTemplate, startDate: string): EditablePhase[] => {
        const sorted = [...template.phases_definition].sort((a, b) => a.order - b.order)
        let currentDate = startDate

        return sorted.map(phase => {
            const duration = phase.default_duration_days || 1
            const endDate = addDays(currentDate, duration - 1)
            const result: EditablePhase = {
                ...phase,
                planned_start_date: currentDate,
                planned_end_date: endDate,
                requiresClientApproval: false,
            }
            currentDate = addDays(endDate, 1)
            return result
        })
    }, [])

    // When template selected, generate phases
    useEffect(() => {
        if (selectedTemplate && step === 1) {
            setEditablePhases(generatePhases(selectedTemplate, kickoffDate))
        }
    }, [selectedTemplate, kickoffDate, step, generatePhases])

    // Recalculate dates from a specific index onwards
    const recalculateFromIndex = useCallback((phases: EditablePhase[], fromIndex: number) => {
        const next = [...phases]
        for (let i = fromIndex; i < next.length; i++) {
            if (i === 0) {
                // First phase keeps its start date, update end date
                const duration = next[i].default_duration_days || 1
                next[i] = { ...next[i], planned_end_date: addDays(next[i].planned_start_date, duration - 1) }
            } else {
                const prevEnd = next[i - 1].planned_end_date
                const start = addDays(prevEnd, 1)
                const duration = next[i].default_duration_days || 1
                next[i] = {
                    ...next[i],
                    planned_start_date: start,
                    planned_end_date: addDays(start, duration - 1),
                }
            }
        }
        return next
    }, [])

    const handleDurationChange = (index: number, newDuration: number) => {
        if (newDuration < 1) newDuration = 1
        const next = [...editablePhases]
        next[index] = { ...next[index], default_duration_days: newDuration }
        setEditablePhases(recalculateFromIndex(next, index))
    }

    const handleStartDateChange = (index: number, newDate: string) => {
        const next = [...editablePhases]
        next[index] = { ...next[index], planned_start_date: newDate }
        setEditablePhases(recalculateFromIndex(next, index))
    }

    const handleRevisionChange = (index: number, newLimit: number) => {
        if (newLimit < 0) newLimit = 0
        const next = [...editablePhases]
        next[index] = { ...next[index], revision_limit: newLimit }
        setEditablePhases(next)
    }

    const handleApprovalToggle = (index: number) => {
        const next = [...editablePhases]
        next[index] = { ...next[index], requiresClientApproval: !next[index].requiresClientApproval }
        setEditablePhases(next)
    }

    const totalDays = useMemo(() => {
        return editablePhases.reduce((sum, p) => sum + (p.default_duration_days || 0), 0)
    }, [editablePhases])

    const deadlineDate = useMemo(() => {
        if (editablePhases.length === 0) return ''
        return editablePhases[editablePhases.length - 1].planned_end_date
    }, [editablePhases])

    const handleSubmit = async () => {
        if (!selectedTemplate) return
        setIsSubmitting(true)
        setSubmitError('')

        const result = await saveLeadRoadmapConfig({
            opportunityId: leadId,
            templateId: selectedTemplate.id,
            phases: editablePhases.map((p, index) => ({
                phase_key: p.key,
                phase_name: p.name,
                phase_order: p.order,
                duration_days: p.default_duration_days || 1,
                revision_limit: p.revision_limit,
                planned_start_date: p.planned_start_date,
                planned_end_date: p.planned_end_date,
                requires_client_approval: p.requiresClientApproval,
                status: index === 0 ? 'completed' : index === 1 ? 'in_progress' : 'pending'
            })),
        })

        if (result.success && result.opportunity) {
            onSuccess(result.opportunity as Opportunity)
            onClose()
        } else {
            setSubmitError(result.error || 'Error desconocido')
        }

        setIsSubmitting(false)
    }

    // ─── STEP 1: SELECT TEMPLATE ───
    const renderStep1 = () => (
        <div className="space-y-6">
            <div className="space-y-2">
                <label className="text-[11px] font-black uppercase text-muted-foreground tracking-[0.2em] ml-1">
                    Plantilla de Fases
                </label>
                {isLoadingTemplates ? (
                    <div className="flex items-center gap-2 py-4 text-muted-foreground">
                        <Loader2 size={14} className="animate-spin" />
                        <span className="text-xs font-bold">Cargando plantillas...</span>
                    </div>
                ) : (
                    <div className="space-y-2 max-h-64 overflow-y-auto pr-1">
                        {templates.map(template => (
                            <button
                                key={template.id}
                                onClick={() => setSelectedTemplateId(template.id)}
                                className={`w-full flex items-center gap-3 rounded-2xl border p-4 text-left transition-all ${
                                    selectedTemplateId === template.id
                                        ? 'border-primary bg-primary/5 ring-1 ring-primary/20'
                                        : 'border-border bg-card hover:border-primary/30 hover:bg-accent/30'
                                }`}
                            >
                                <div className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border ${
                                    selectedTemplateId === template.id
                                        ? 'bg-primary text-primary-foreground'
                                        : 'bg-secondary text-muted-foreground'
                                }`}>
                                    <Layers size={18} />
                                </div>
                                <div className="flex-1 min-w-0">
                                    <h4 className="text-xs font-black text-foreground truncate">{template.name}</h4>
                                    <p className="text-[10px] text-muted-foreground">
                                        {template.phases_definition.length} fases ·{' '}
                                        {template.phases_definition.reduce((s, p) => s + (p.default_duration_days || 0), 0)} días
                                        {template.is_default && (
                                            <span className="ml-2 text-[9px] font-bold text-emerald-600">· Por defecto</span>
                                        )}
                                    </p>
                                </div>
                                {selectedTemplateId === template.id && (
                                    <CheckCircle2 size={18} className="text-primary shrink-0" />
                                )}
                            </button>
                        ))}
                    </div>
                )}
            </div>

            {/* Preview of selected template */}
            {selectedTemplate && (
                <div className="rounded-2xl border border-border/50 bg-background/60 p-4 space-y-3">
                    <h4 className="text-[11px] font-black uppercase text-muted-foreground tracking-[0.2em]">
                        Fases incluidas
                    </h4>
                    <div className="flex flex-wrap gap-2">
                        {[...selectedTemplate.phases_definition]
                            .sort((a, b) => a.order - b.order)
                            .map(phase => (
                                <div
                                    key={phase.key}
                                    className="flex items-center gap-1.5 rounded-lg bg-card border border-border px-2.5 py-1.5"
                                >
                                    <span className="text-[10px] font-black text-primary">{phase.order}</span>
                                    <span className="text-[10px] font-bold text-foreground">{phase.name}</span>
                                    <span className="text-[9px] text-muted-foreground">({phase.default_duration_days}d)</span>
                                </div>
                            ))}
                    </div>
                </div>
            )}

            {/* Kickoff date */}
            <div className="space-y-2">
                <label className="text-[11px] font-black uppercase text-muted-foreground tracking-[0.2em] ml-1">
                    Fecha de Inicio (Kickoff)
                </label>
                <input
                    type="date"
                    value={kickoffDate}
                    onChange={e => setKickoffDate(e.target.value)}
                    className="w-full rounded-2xl border border-border bg-background px-4 py-3 text-sm text-foreground outline-none focus:border-primary/50 focus:ring-4 focus:ring-primary/10 transition-all font-mono font-bold"
                />
            </div>
        </div>
    )

    // ─── STEP 2: CUSTOMIZE PHASES ───
    const renderStep2 = () => (
        <div className="space-y-4">
            <div className="flex items-center justify-between">
                <h4 className="text-[11px] font-black uppercase text-muted-foreground tracking-[0.2em]">
                    Personalizar Fases
                </h4>
                <div className="flex items-center gap-1 text-[10px] text-muted-foreground">
                    <CalendarDays size={12} />
                    <span className="font-bold">Inicio:</span>
                    <span>{formatDate(kickoffDate)}</span>
                </div>
            </div>

            <div className="rounded-2xl border border-border/50 overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-left">
                        <thead>
                            <tr className="bg-secondary/30 border-b border-border/50">
                                <th className="px-3 py-2.5 text-[9px] font-black uppercase tracking-widest text-muted-foreground">Orden</th>
                                <th className="px-3 py-2.5 text-[9px] font-black uppercase tracking-widest text-muted-foreground">Fase</th>
                                <th className="px-3 py-2.5 text-[9px] font-black uppercase tracking-widest text-muted-foreground text-center">Días</th>
                                <th className="px-3 py-2.5 text-[9px] font-black uppercase tracking-widest text-muted-foreground">Inicio</th>
                                <th className="px-3 py-2.5 text-[9px] font-black uppercase tracking-widest text-muted-foreground text-center">Rev</th>
                                <th className="px-3 py-2.5 text-[9px] font-black uppercase tracking-widest text-muted-foreground text-center">Aprob.</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-border/30">
                            {editablePhases.map((phase, index) => (
                                <tr key={phase.key} className="hover:bg-accent/20 transition-colors">
                                    <td className="px-3 py-2.5">
                                        <div className="flex h-6 w-6 items-center justify-center rounded-md bg-primary/10 text-primary-foreground font-black text-[10px]">
                                            {phase.order}
                                        </div>
                                    </td>
                                    <td className="px-3 py-2.5">
                                        <p className="text-xs font-bold text-foreground">{phase.name}</p>
                                        <p className="text-[9px] text-muted-foreground font-mono">{phase.key}</p>
                                    </td>
                                    <td className="px-3 py-2.5 text-center">
                                        <input
                                            type="number"
                                            min={1}
                                            value={phase.default_duration_days}
                                            onChange={e => handleDurationChange(index, parseInt(e.target.value) || 1)}
                                            className="w-14 rounded-lg border border-border bg-card px-1 py-1 text-xs text-center text-foreground outline-none focus:border-primary/50 focus:ring-2 focus:ring-primary/10 transition-all font-mono font-bold"
                                        />
                                    </td>
                                    <td className="px-3 py-2.5">
                                        <input
                                            type="date"
                                            value={phase.planned_start_date}
                                            onChange={e => handleStartDateChange(index, e.target.value)}
                                            className="w-28 rounded-lg border border-border bg-card px-1.5 py-1 text-[10px] text-foreground outline-none focus:border-primary/50 focus:ring-2 focus:ring-primary/10 transition-all font-mono"
                                        />
                                        <p className="text-[9px] text-muted-foreground mt-0.5">
                                            al {formatDate(phase.planned_end_date)}
                                        </p>
                                    </td>
                                    <td className="px-3 py-2.5 text-center">
                                        <input
                                            type="number"
                                            min={0}
                                            value={phase.revision_limit}
                                            onChange={e => handleRevisionChange(index, parseInt(e.target.value) || 0)}
                                            className="w-12 rounded-lg border border-border bg-card px-1 py-1 text-xs text-center text-foreground outline-none focus:border-primary/50 focus:ring-2 focus:ring-primary/10 transition-all font-mono font-bold"
                                        />
                                    </td>
                                    <td className="px-3 py-2.5 text-center">
                                        <label className="cursor-pointer flex items-center justify-center">
                                            <input
                                                type="checkbox"
                                                checked={phase.requiresClientApproval}
                                                onChange={() => handleApprovalToggle(index)}
                                                className="sr-only peer"
                                            />
                                            <div className="h-4 w-4 rounded border-2 border-border bg-background peer-checked:bg-primary peer-checked:border-primary transition-all flex items-center justify-center">
                                                {phase.requiresClientApproval && (
                                                    <svg className="h-2.5 w-2.5 text-primary-foreground" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={4}>
                                                        <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                                                    </svg>
                                                )}
                                            </div>
                                        </label>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    )

    // ─── STEP 3: SUMMARY ───
    const renderStep3 = () => (
        <div className="space-y-6">
            <div className="rounded-2xl border border-primary/20 bg-primary/5 p-5 space-y-4">
                <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary text-primary-foreground">
                        <GitBranch size={20} />
                    </div>
                    <div>
                        <h4 className="text-sm font-black text-foreground">{selectedTemplate?.name}</h4>
                        <p className="text-[10px] text-muted-foreground">
                            {editablePhases.length} fases · Roadmap para {clientName}
                        </p>
                    </div>
                </div>

                <div className="grid grid-cols-3 gap-3">
                    <div className="rounded-xl bg-card border border-border/50 p-3 text-center">
                        <Clock size={14} className="mx-auto mb-1 text-muted-foreground" />
                        <p className="text-lg font-black text-foreground">{totalDays}</p>
                        <p className="text-[9px] font-bold text-muted-foreground uppercase tracking-wider">días totales</p>
                    </div>
                    <div className="rounded-xl bg-card border border-border/50 p-3 text-center">
                        <Calendar size={14} className="mx-auto mb-1 text-muted-foreground" />
                        <p className="text-sm font-black text-foreground">{formatDate(kickoffDate)}</p>
                        <p className="text-[9px] font-bold text-muted-foreground uppercase tracking-wider">inicio</p>
                    </div>
                    <div className="rounded-xl bg-card border border-border/50 p-3 text-center">
                        <Calendar size={14} className="mx-auto mb-1 text-muted-foreground" />
                        <p className="text-sm font-black text-foreground">{formatDate(deadlineDate)}</p>
                        <p className="text-[9px] font-bold text-muted-foreground uppercase tracking-wider">entrega</p>
                    </div>
                </div>
            </div>

            <div className="space-y-2">
                <h4 className="text-[11px] font-black uppercase text-muted-foreground tracking-[0.2em]">
                    Fases Configuradas
                </h4>
                <div className="rounded-2xl border border-border/50 divide-y divide-border/30 overflow-hidden">
                    {editablePhases.map((phase, i) => (
                        <div key={phase.key} className="flex items-center gap-3 px-4 py-3 bg-card/50">
                            <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary-foreground font-black text-[10px]">
                                {phase.order}
                            </div>
                            <div className="flex-1 min-w-0">
                                <p className="text-xs font-bold text-foreground truncate">{phase.name}</p>
                                <p className="text-[9px] text-muted-foreground">
                                    {formatDate(phase.planned_start_date)} → {formatDate(phase.planned_end_date)}
                                </p>
                            </div>
                            <div className="flex items-center gap-3 text-[10px] text-muted-foreground">
                                <span className="flex items-center gap-1">
                                    <Clock size={10} />
                                    {phase.default_duration_days}d
                                </span>
                                <span className="flex items-center gap-1">
                                    <RotateCcw size={10} />
                                    {phase.revision_limit}
                                </span>
                                {phase.requiresClientApproval && (
                                    <span className="rounded-md bg-warning/10 text-warning-foreground px-1.5 py-0.5 text-[9px] font-black">
                                        Aprob.
                                    </span>
                                )}
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            {submitError && (
                <div className="flex items-center gap-2 rounded-xl bg-destructive/10 border border-destructive/20 px-4 py-3 text-destructive">
                    <AlertCircle size={14} />
                    <p className="text-xs font-bold">{submitError}</p>
                </div>
            )}
        </div>
    )

    const canProceed = step === 1 ? !!selectedTemplate : step === 2 ? editablePhases.length > 0 : true

    return (
        <Modal
            isOpen={isOpen}
            onClose={isSubmitting ? () => {} : onClose}
            title="Configurar Fases del Proyecto"
            maxWidth="max-w-4xl"
        >
            <div className="space-y-6">
                {/* Step indicator */}
                <div className="flex items-center gap-2">
                    {[1, 2, 3].map(s => (
                        <div key={s} className="flex items-center gap-2 flex-1">
                            <div className={`flex h-8 w-8 items-center justify-center rounded-full text-xs font-black transition-all ${
                                step >= s
                                    ? 'bg-primary text-primary-foreground'
                                    : 'bg-secondary text-muted-foreground'
                            }`}>
                                {s}
                            </div>
                            <div className={`flex-1 h-1 rounded-full transition-all ${
                                step > s ? 'bg-primary' : 'bg-border'
                            }`} />
                        </div>
                    ))}
                    <span className="text-[10px] font-black uppercase tracking-widest text-muted-foreground whitespace-nowrap">
                        {step === 1 ? 'Seleccionar' : step === 2 ? 'Personalizar' : 'Confirmar'}
                    </span>
                </div>

                {/* Content */}
                <div className="min-h-[300px]">
                    {step === 1 && renderStep1()}
                    {step === 2 && renderStep2()}
                    {step === 3 && renderStep3()}
                </div>

                {/* Actions */}
                <div className="flex items-center gap-3 pt-2 border-t border-border/30">
                    {step > 1 && (
                        <button
                            onClick={() => setStep((s => (s - 1) as 1 | 2 | 3))}
                            disabled={isSubmitting}
                            className="flex items-center gap-2 rounded-2xl border border-border bg-card px-5 py-3 text-[11px] font-black uppercase tracking-[0.2em] text-foreground hover:bg-accent transition-all disabled:opacity-50"
                        >
                            <ChevronLeft size={14} />
                            Anterior
                        </button>
                    )}

                    <div className="flex-1" />

                    {step < 3 ? (
                        <button
                            onClick={() => setStep((s => (s + 1) as 1 | 2 | 3))}
                            disabled={!canProceed}
                            className="flex items-center gap-2 rounded-2xl bg-primary px-6 py-3 text-[11px] font-black uppercase tracking-[0.2em] text-primary-foreground hover:bg-primary/90 disabled:opacity-50 transition-all active:scale-[0.98] shadow-sm"
                        >
                            Siguiente
                            <ChevronRight size={14} />
                        </button>
                    ) : (
                        <button
                            onClick={handleSubmit}
                            disabled={isSubmitting}
                            className="flex items-center gap-2 rounded-2xl bg-emerald-600 px-6 py-3 text-[11px] font-black uppercase tracking-[0.2em] text-white hover:bg-emerald-700 disabled:opacity-50 transition-all active:scale-[0.98] shadow-sm"
                        >
                            {isSubmitting ? (
                                <>
                                    <Loader2 size={14} className="animate-spin" />
                                    Guardando...
                                </>
                            ) : (
                                <>
                                    <Save size={14} />
                                    Guardar Configuración de Fases
                                </>
                            )}
                        </button>
                    )}
                </div>
            </div>
        </Modal>
    )
}
