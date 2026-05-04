'use client'

import { useState } from 'react'
import { ProjectPhase, Project } from '@/types'
import {
    updatePhaseStatus,
    addDeliverable,
    updatePhaseClientNotes,
    PhaseStatusAction,
} from '../actions'
import {
    Play,
    Send,
    CheckCircle2,
    Upload,
    AlertTriangle,
    Lock,
    Clock,
    RotateCcw,
    CalendarDays,
    MessageSquare,
    X,
    Loader2,
} from 'lucide-react'

// ------------------------------------------------------------------
// Tipos
// ------------------------------------------------------------------

interface PhasesTabProps {
    phases: ProjectPhase[]
    project: Project
}

interface DeliverableForm {
    name: string
    url: string
    type: string
}

// ------------------------------------------------------------------
// Helpers
// ------------------------------------------------------------------

function formatDate(dateStr: string | null | undefined): string {
    if (!dateStr) return '—'
    const d = new Date(dateStr)
    return d.toLocaleDateString('es-PE', {
        day: 'numeric',
        month: 'short',
    })
}

const PHASE_STATUS_CONFIG: Record<string, { label: string; bg: string; text: string; border: string }> = {
    pending: { label: 'Pendiente', bg: 'bg-secondary', text: 'text-muted-foreground', border: 'border-border/50' },
    in_progress: { label: 'En Progreso', bg: 'bg-primary/10', text: 'text-primary', border: 'border-primary/20' },
    in_review: { label: 'En Revisión', bg: 'bg-indigo-500/10', text: 'text-indigo-500', border: 'border-indigo-500/20' },
    client_review: { label: 'Esperando Cliente', bg: 'bg-amber-500/10', text: 'text-amber-500', border: 'border-amber-500/20' },
    approved: { label: 'Aprobada', bg: 'bg-emerald-500/10', text: 'text-emerald-500', border: 'border-emerald-500/20' },
    blocked: { label: 'Bloqueado', bg: 'bg-destructive/10', text: 'text-destructive', border: 'border-destructive/20' },
    completed: { label: 'Completada', bg: 'bg-teal-500/10', text: 'text-teal-500', border: 'border-teal-500/20' },
    skipped: { label: 'Omitida', bg: 'bg-secondary/50', text: 'text-muted-foreground/40', border: 'border-border/30' },
}

function getPhaseIcon(status: string) {
    switch (status) {
        case 'completed':
        case 'approved':
            return <CheckCircle2 size={14} />
        case 'in_progress':
            return <Play size={14} />
        case 'blocked':
            return <AlertTriangle size={14} />
        case 'client_review':
            return <Clock size={14} />
        default:
            return <div className="w-2 h-2 rounded-full bg-current" />
    }
}

// ------------------------------------------------------------------
// Componente
// ------------------------------------------------------------------

export function PhasesTab({ phases, project }: PhasesTabProps) {
    const sortedPhases = [...phases].sort((a, b) => a.phase_order - b.phase_order)
    const [loadingPhaseId, setLoadingPhaseId] = useState<string | null>(null)
    const [uploadPhaseId, setUploadPhaseId] = useState<string | null>(null)
    const [delayReasonInput, setDelayReasonInput] = useState<string>('')
    const [blockPhaseId, setBlockPhaseId] = useState<string | null>(null)
    const [notesEdit, setNotesEdit] = useState<Record<string, string>>({})
    const [savingNotes, setSavingNotes] = useState<string | null>(null)

    const [deliverableForm, setDeliverableForm] = useState<DeliverableForm>({
        name: '',
        url: '',
        type: 'file',
    })

    const handleAction = async (phaseId: string, action: PhaseStatusAction) => {
        setLoadingPhaseId(phaseId)
        const res = await updatePhaseStatus(
            phaseId,
            action,
            action === 'block' ? delayReasonInput : undefined
        )
        setLoadingPhaseId(null)
        setBlockPhaseId(null)
        setDelayReasonInput('')
        if (!res.success) {
            alert(res.error || 'Error actualizando fase')
        }
        // Recargar página para reflejar cambios (simple approach)
        window.location.reload()
    }

    const handleUpload = async (phaseId: string) => {
        if (!deliverableForm.name.trim() || !deliverableForm.url.trim()) return
        setLoadingPhaseId(phaseId)
        const res = await addDeliverable(phaseId, {
            name: deliverableForm.name.trim(),
            url: deliverableForm.url.trim(),
            type: deliverableForm.type,
        })
        setLoadingPhaseId(null)
        setUploadPhaseId(null)
        setDeliverableForm({ name: '', url: '', type: 'file' })
        if (!res.success) {
            alert(res.error || 'Error subiendo entregable')
        } else {
            window.location.reload()
        }
    }

    const handleSaveNotes = async (phaseId: string) => {
        const notes = notesEdit[phaseId]
        if (notes === undefined) return
        setSavingNotes(phaseId)
        const res = await updatePhaseClientNotes(phaseId, notes)
        setSavingNotes(null)
        if (!res.success) {
            alert(res.error || 'Error guardando notas')
        }
    }

    return (
        <div className="space-y-6">
            {sortedPhases.length === 0 ? (
                <div className="text-center py-16 border-2 border-dashed border-border rounded-3xl space-y-3">
                    <Clock size={32} className="mx-auto text-muted-foreground/30" />
                    <p className="text-xs font-black uppercase tracking-widest text-muted-foreground/50">
                        No hay fases configuradas para este proyecto
                    </p>
                </div>
            ) : (
                <div className="relative pl-4 sm:pl-6">
                    {/* Línea vertical del timeline */}
                    <div className="absolute left-[19px] sm:left-[27px] top-3 bottom-3 w-px bg-border" />

                    <div className="space-y-6">
                        {sortedPhases.map((phase, index) => {
                            const cfg = PHASE_STATUS_CONFIG[phase.status] || PHASE_STATUS_CONFIG.pending
                            const isLoading = loadingPhaseId === phase.id
                            const isUploadOpen = uploadPhaseId === phase.id
                            const isBlockOpen = blockPhaseId === phase.id
                            const isLast = index === sortedPhases.length - 1

                            return (
                                <div key={phase.id} className="relative flex gap-4 sm:gap-5">
                                    {/* Nodo circular */}
                                    <div className="relative z-10 shrink-0">
                                        <div
                                            className={`w-10 h-10 sm:w-14 sm:h-14 rounded-full flex items-center justify-center text-[10px] sm:text-xs font-black border-2 transition-all ${cfg.bg} ${cfg.text} ${cfg.border}`}
                                        >
                                            {isLoading ? (
                                                <Loader2 size={16} className="animate-spin" />
                                            ) : (
                                                getPhaseIcon(phase.status)
                                            )}
                                        </div>
                                    </div>

                                    {/* Card de fase */}
                                    <div className="flex-1 min-w-0">
                                        <div className="bg-card border border-border rounded-2xl p-4 sm:p-5 space-y-4">
                                            {/* Header de la fase */}
                                            <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-2">
                                                <div>
                                                    <div className="flex items-center gap-2 flex-wrap">
                                                        <h3 className="text-sm font-black text-foreground uppercase tracking-tight">
                                                            {phase.phase_name}
                                                        </h3>
                                                        <span
                                                            className={`px-2 py-0.5 rounded-lg ${cfg.bg} ${cfg.text} border ${cfg.border} text-[9px] font-black uppercase`}
                                                        >
                                                            {cfg.label}
                                                        </span>
                                                        {phase.client_approved_at && (
                                                            <span className="px-2 py-0.5 rounded-lg bg-emerald-500/10 text-emerald-500 border border-emerald-500/20 text-[9px] font-black uppercase flex items-center gap-1">
                                                                <CheckCircle2 size={10} />
                                                                Cliente OK
                                                            </span>
                                                        )}
                                                    </div>
                                                    <div className="flex items-center gap-3 mt-1.5 text-[10px] font-bold text-muted-foreground uppercase tracking-widest">
                                                        <span className="flex items-center gap-1">
                                                            <CalendarDays size={10} />
                                                            {formatDate(phase.planned_start_date)} → {formatDate(phase.planned_end_date)}
                                                        </span>
                                                        {phase.actual_start_date && (
                                                            <span className="flex items-center gap-1 text-primary">
                                                                <Play size={10} />
                                                                Real: {formatDate(phase.actual_start_date)}
                                                            </span>
                                                        )}
                                                        {phase.actual_end_date && (
                                                            <span className="flex items-center gap-1 text-emerald-500">
                                                                <CheckCircle2 size={10} />
                                                                Fin: {formatDate(phase.actual_end_date)}
                                                            </span>
                                                        )}
                                                    </div>
                                                </div>

                                                <div className="flex items-center gap-2 shrink-0">
                                                    <span className="flex items-center gap-1 text-[10px] font-black text-muted-foreground uppercase tracking-widest">
                                                        <RotateCcw size={10} />
                                                        {phase.revision_count || 0} / {phase.revision_limit || 0}
                                                    </span>
                                                </div>
                                            </div>

                                            {/* Bloqueado / delay */}
                                            {phase.status === 'blocked' && phase.delay_reason && (
                                                <div className="rounded-xl bg-destructive/10 border border-destructive/20 px-4 py-3 flex items-start gap-2">
                                                    <AlertTriangle size={14} className="text-destructive shrink-0 mt-0.5" />
                                                    <div>
                                                        <p className="text-[10px] font-black text-destructive uppercase tracking-widest">
                                                            Bloqueado
                                                        </p>
                                                        <p className="text-[11px] font-medium text-destructive/80 mt-0.5">
                                                            {phase.delay_reason}
                                                        </p>
                                                    </div>
                                                </div>
                                            )}

                                            {/* Entregables */}
                                            {Array.isArray(phase.deliverables) && phase.deliverables.length > 0 && (
                                                <div className="space-y-2">
                                                    <p className="text-[9px] font-black uppercase tracking-widest text-muted-foreground">
                                                        Entregables
                                                    </p>
                                                    <div className="flex flex-wrap gap-2">
                                                        {phase.deliverables.map((d: any, i: number) => (
                                                            <a
                                                                key={i}
                                                                href={d.url}
                                                                target="_blank"
                                                                rel="noopener noreferrer"
                                                                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-secondary/40 border border-border/40 text-[10px] font-bold text-foreground hover:bg-secondary transition-colors"
                                                            >
                                                                <Upload size={10} className="text-muted-foreground" />
                                                                {d.name}
                                                            </a>
                                                        ))}
                                                    </div>
                                                </div>
                                            )}

                                            {/* Notas visibles para cliente */}
                                            <div className="space-y-2">
                                                <div className="flex items-center justify-between">
                                                    <p className="text-[9px] font-black uppercase tracking-widest text-muted-foreground flex items-center gap-1">
                                                        <MessageSquare size={10} />
                                                        Notas para el cliente
                                                    </p>
                                                </div>
                                                <textarea
                                                    defaultValue={phase.client_visible_notes || ''}
                                                    onChange={(e) =>
                                                        setNotesEdit((prev) => ({
                                                            ...prev,
                                                            [phase.id]: e.target.value,
                                                        }))
                                                    }
                                                    placeholder="Notas visibles para el cliente en su portal…"
                                                    className="w-full h-16 rounded-xl border border-border/50 bg-secondary/20 px-3 py-2 text-[11px] font-medium text-foreground outline-none focus:border-primary/50 resize-none transition-all"
                                                />
                                                {(notesEdit[phase.id] !== undefined) && (
                                                    <button
                                                        onClick={() => handleSaveNotes(phase.id)}
                                                        disabled={savingNotes === phase.id}
                                                        className="text-[9px] font-black uppercase tracking-widest text-primary hover:text-primary/80 transition-colors disabled:opacity-50"
                                                    >
                                                        {savingNotes === phase.id ? 'Guardando…' : 'Guardar notas'}
                                                    </button>
                                                )}
                                            </div>

                                            {/* Acciones */}
                                            <div className="flex flex-wrap items-center gap-2 pt-1">
                                                {phase.status === 'pending' && (
                                                    <button
                                                        onClick={() => handleAction(phase.id, 'start')}
                                                        disabled={isLoading}
                                                        className="flex items-center gap-1.5 px-3 py-2 bg-primary/10 hover:bg-primary/20 transition-all rounded-xl border border-primary/30 text-[9px] font-black uppercase tracking-widest text-primary active:scale-95 disabled:opacity-50"
                                                    >
                                                        <Play size={12} />
                                                        Iniciar Fase
                                                    </button>
                                                )}

                                                {phase.status === 'in_progress' && (
                                                    <>
                                                        <button
                                                            onClick={() => handleAction(phase.id, 'send_to_client')}
                                                            disabled={isLoading}
                                                            className="flex items-center gap-1.5 px-3 py-2 bg-amber-500/10 hover:bg-amber-500/20 transition-all rounded-xl border border-amber-500/30 text-[9px] font-black uppercase tracking-widest text-amber-500 active:scale-95 disabled:opacity-50"
                                                        >
                                                            <Send size={12} />
                                                            Enviar a Cliente
                                                        </button>

                                                        <button
                                                            onClick={() => setUploadPhaseId(isUploadOpen ? null : phase.id)}
                                                            className="flex items-center gap-1.5 px-3 py-2 bg-secondary/40 hover:bg-secondary transition-all rounded-xl border border-border/40 text-[9px] font-black uppercase tracking-widest text-foreground active:scale-95"
                                                        >
                                                            <Upload size={12} />
                                                            {isUploadOpen ? 'Cancelar' : 'Subir Entregable'}
                                                        </button>

                                                        <button
                                                            onClick={() => setBlockPhaseId(isBlockOpen ? null : phase.id)}
                                                            className="flex items-center gap-1.5 px-3 py-2 bg-destructive/10 hover:bg-destructive/20 transition-all rounded-xl border border-destructive/30 text-[9px] font-black uppercase tracking-widest text-destructive active:scale-95"
                                                        >
                                                            <Lock size={12} />
                                                            Bloquear
                                                        </button>
                                                    </>
                                                )}

                                                {phase.status === 'in_review' && (
                                                    <button
                                                        onClick={() => handleAction(phase.id, 'approve_internal')}
                                                        disabled={isLoading}
                                                        className="flex items-center gap-1.5 px-3 py-2 bg-emerald-500/10 hover:bg-emerald-500/20 transition-all rounded-xl border border-emerald-500/30 text-[9px] font-black uppercase tracking-widest text-emerald-500 active:scale-95 disabled:opacity-50"
                                                    >
                                                        <CheckCircle2 size={12} />
                                                        Aprobar Internamente
                                                    </button>
                                                )}

                                                {phase.status === 'blocked' && (
                                                    <button
                                                        onClick={() => handleAction(phase.id, 'unblock')}
                                                        disabled={isLoading}
                                                        className="flex items-center gap-1.5 px-3 py-2 bg-primary/10 hover:bg-primary/20 transition-all rounded-xl border border-primary/30 text-[9px] font-black uppercase tracking-widest text-primary active:scale-95 disabled:opacity-50"
                                                    >
                                                        <Play size={12} />
                                                        Desbloquear
                                                    </button>
                                                )}

                                                {(phase.status === 'approved' || phase.status === 'client_review') && (
                                                    <button
                                                        onClick={() => handleAction(phase.id, 'complete')}
                                                        disabled={isLoading}
                                                        className="flex items-center gap-1.5 px-3 py-2 bg-teal-500/10 hover:bg-teal-500/20 transition-all rounded-xl border border-teal-500/30 text-[9px] font-black uppercase tracking-widest text-teal-500 active:scale-95 disabled:opacity-50"
                                                    >
                                                        <CheckCircle2 size={12} />
                                                        Completar Fase
                                                    </button>
                                                )}
                                            </div>

                                            {/* Form bloquear */}
                                            {isBlockOpen && (
                                                <div className="rounded-xl bg-destructive/10 border border-destructive/20 p-3 space-y-2 animate-in fade-in slide-in-from-top-2 duration-200">
                                                    <p className="text-[10px] font-black text-destructive uppercase tracking-widest">
                                                        Motivo del bloqueo
                                                    </p>
                                                    <input
                                                        type="text"
                                                        value={delayReasonInput}
                                                        onChange={(e) => setDelayReasonInput(e.target.value)}
                                                        placeholder="Ej: Cliente demoró 5 días en feedback…"
                                                        className="w-full rounded-lg border border-destructive/30 bg-card px-3 py-2 text-xs font-bold text-foreground outline-none focus:border-destructive/50"
                                                    />
                                                    <div className="flex items-center gap-2">
                                                        <button
                                                            onClick={() => handleAction(phase.id, 'block')}
                                                            disabled={!delayReasonInput.trim() || isLoading}
                                                            className="px-3 py-2 bg-destructive text-destructive-foreground rounded-lg text-[9px] font-black uppercase tracking-widest hover:bg-destructive/90 transition-colors disabled:opacity-50"
                                                        >
                                                            Confirmar Bloqueo
                                                        </button>
                                                        <button
                                                            onClick={() => { setBlockPhaseId(null); setDelayReasonInput('') }}
                                                            className="px-3 py-2 bg-secondary text-foreground border border-border/50 rounded-lg text-[9px] font-black uppercase tracking-widest hover:bg-accent transition-colors"
                                                        >
                                                            Cancelar
                                                        </button>
                                                    </div>
                                                </div>
                                            )}

                                            {/* Form subir entregable */}
                                            {isUploadOpen && (
                                                <div className="rounded-xl bg-secondary/30 border border-border/50 p-3 space-y-2 animate-in fade-in slide-in-from-top-2 duration-200">
                                                    <div className="flex items-center justify-between">
                                                        <p className="text-[10px] font-black text-foreground uppercase tracking-widest">
                                                            Nuevo Entregable
                                                        </p>
                                                        <button
                                                            onClick={() => { setUploadPhaseId(null); setDeliverableForm({ name: '', url: '', type: 'file' }) }}
                                                            className="text-muted-foreground hover:text-foreground"
                                                        >
                                                            <X size={14} />
                                                        </button>
                                                    </div>
                                                    <input
                                                        type="text"
                                                        value={deliverableForm.name}
                                                        onChange={(e) => setDeliverableForm(prev => ({ ...prev, name: e.target.value }))}
                                                        placeholder="Nombre del archivo"
                                                        className="w-full rounded-lg border border-border bg-card px-3 py-2 text-xs font-bold text-foreground outline-none focus:border-primary/50"
                                                    />
                                                    <input
                                                        type="text"
                                                        value={deliverableForm.url}
                                                        onChange={(e) => setDeliverableForm(prev => ({ ...prev, url: e.target.value }))}
                                                        placeholder="URL del archivo (Figma, Drive, etc.)"
                                                        className="w-full rounded-lg border border-border bg-card px-3 py-2 text-xs font-bold text-foreground outline-none focus:border-primary/50"
                                                    />
                                                    <button
                                                        onClick={() => handleUpload(phase.id)}
                                                        disabled={!deliverableForm.name.trim() || !deliverableForm.url.trim() || isLoading}
                                                        className="w-full px-3 py-2 bg-primary hover:bg-primary/90 transition-colors rounded-lg text-[9px] font-black uppercase tracking-widest text-primary-foreground disabled:opacity-50"
                                                    >
                                                        {isLoading ? 'Subiendo…' : 'Guardar Entregable'}
                                                    </button>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            )
                        })}
                    </div>
                </div>
            )}
        </div>
    )
}
