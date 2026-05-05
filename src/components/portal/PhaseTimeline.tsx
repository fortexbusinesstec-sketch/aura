'use client'

import {
    CheckCircle2,
    Clock,
    CircleDot,
    CalendarDays,
    ChevronRight,
    Lock,
    Unlock,
    Search,
    Layers,
    Target,
    Code2,
    TestTube2,
    Rocket,
    Download,
} from 'lucide-react'

// ------------------------------------------------------------------
// Tipos
// ------------------------------------------------------------------

interface TimelinePhase {
    id?: string
    phase_key?: string
    phase_name: string
    phase_order?: number
    planned_start_date?: string | null
    planned_end_date?: string | null
    status?: string
    revision_limit?: number
    revision_count?: number
    client_approved_at?: string | null
    deliverables?: any[]
    client_visible_notes?: string | null
    requires_client_approval?: boolean
}

type TimelineMode = 'proposal' | 'execution'

interface PhaseTimelineProps {
    phases: TimelinePhase[]
    mode: TimelineMode
    projectId?: string
    onPhaseApproved?: () => void
}

// ------------------------------------------------------------------
// Helpers
// ------------------------------------------------------------------

const formatDate = (dateStr: string | null | undefined) => {
    if (!dateStr) return '-'
    return new Date(dateStr + 'T00:00:00').toLocaleDateString('es-PE', {
        day: '2-digit',
        month: 'short',
        year: 'numeric',
    })
}

const statusMap: Record<string, { label: string; colorClass: string }> = {
    pending: { label: 'Pendiente', colorClass: 'bg-muted text-muted-foreground border-border' },
    in_progress: { label: 'En progreso', colorClass: 'bg-warning/15 text-warning-foreground border-warning/30' },
    in_review: { label: 'En revisión', colorClass: 'bg-accent/15 text-accent-foreground border-accent/30' },
    client_review: { label: 'Esperando tu revisión', colorClass: 'bg-primary/15 text-primary border-primary/30' },
    approved: { label: 'Aprobada', colorClass: 'bg-success/15 text-success-foreground border-success/30' },
    completed: { label: 'Completada', colorClass: 'bg-success/20 text-success-foreground border-success/40' },
    blocked: { label: 'Bloqueada', colorClass: 'bg-destructive/15 text-destructive border-destructive/30' },
    skipped: { label: 'Omitida', colorClass: 'bg-muted/50 text-muted-foreground/50 border-border/50' },
    planned: { label: 'Planificada', colorClass: 'bg-muted text-muted-foreground border-border' },
    locked: { label: 'Bloqueada', colorClass: 'bg-muted/50 text-muted-foreground/40 border-border/50' },
}

const phaseIcon = (key?: string) => {
    if (key?.includes('discovery')) return Search
    if (key?.includes('wireframe')) return Layers
    if (key?.includes('design') || key?.includes('diseno')) return Target
    if (key?.includes('develop') || key?.includes('desarrollo')) return Code2
    if (key?.includes('qa') || key?.includes('review')) return TestTube2
    if (key?.includes('launch') || key?.includes('live')) return Rocket
    return CalendarDays
}

// ------------------------------------------------------------------
// Componente
// ------------------------------------------------------------------

export function PhaseTimeline({ phases, mode, projectId, onPhaseApproved }: PhaseTimelineProps) {
    if (phases.length === 0) {
        return (
            <div className="bg-card rounded-2xl border border-border/50 p-5">
                <div className="text-center py-12">
                    <p className="text-sm text-muted-foreground font-medium">
                        No hay fases configuradas.
                    </p>
                </div>
            </div>
        )
    }

    return (
        <div className="bg-card rounded-2xl border border-border/50 p-5 sm:p-6">
            <div className="flex items-center gap-2 mb-6">
                <CalendarDays size={16} className="text-primary" />
                <h3 className="text-xs font-black uppercase tracking-tighter text-foreground">
                    {mode === 'proposal' ? 'Cronograma Estimado' : 'Cronograma del Proyecto'}
                </h3>
                {mode === 'proposal' && (
                    <span className="text-[9px] font-bold text-muted-foreground/60 ml-2">
                        Sujeto a aprobación
                    </span>
                )}
            </div>

            <div className="space-y-0">
                {phases.map((phase, i) => {
                    const Icon = phaseIcon(phase.phase_key)
                    const isLast = i === phases.length - 1
                    const status = phase.status || 'pending'
                    const statusInfo = statusMap[status] || statusMap.pending

                    const isDone = status === 'completed' || status === 'approved'
                    const isActive = status === 'in_progress' || status === 'in_review' || status === 'client_review'
                    const isPending = status === 'pending' || status === 'planned'
                    const isLocked = status === 'locked'

                    return (
                        <div key={phase.id || i} className="flex gap-4">
                            {/* Timeline node */}
                            <div className="flex flex-col items-center">
                                <div
                                    className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 transition-all border-2 ${
                                        isDone
                                            ? 'bg-success border-success text-success-foreground'
                                            : isActive
                                                ? 'bg-warning/20 border-warning text-warning-foreground'
                                                : isLocked
                                                    ? 'bg-muted border-border text-muted-foreground/30'
                                                    : 'bg-muted border-border text-muted-foreground/40'
                                    }`}
                                >
                                    {isDone ? (
                                        <CheckCircle2 size={16} />
                                    ) : isLocked ? (
                                        <Lock size={14} />
                                    ) : (
                                        <Icon size={14} />
                                    )}
                                </div>
                                {!isLast && (
                                    <div
                                        className={`w-0.5 flex-1 my-1 ${
                                            isDone ? 'bg-success/40' : 'bg-border'
                                        }`}
                                    />
                                )}
                            </div>

                            {/* Content */}
                            <div className={`pb-6 flex-1 ${isLocked ? 'opacity-50' : ''}`}>
                                <div className="flex items-center gap-2 mb-1 flex-wrap">
                                    <span
                                        className={`text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded-full border ${statusInfo.colorClass}`}
                                    >
                                        {statusInfo.label}
                                    </span>
                                    {phase.planned_start_date && (
                                        <span className="text-[10px] font-bold text-muted-foreground/60">
                                            {formatDate(phase.planned_start_date)}
                                        </span>
                                    )}
                                </div>

                                <h4 className="text-sm font-black text-foreground">
                                    {phase.phase_name}
                                </h4>

                                <div className="flex items-center gap-3 mt-1 text-[10px] text-muted-foreground/60">
                                    {phase.planned_start_date && phase.planned_end_date && (
                                        <span className="flex items-center gap-1">
                                            <CalendarDays size={10} />
                                            {formatDate(phase.planned_start_date)} →{' '}
                                            {formatDate(phase.planned_end_date)}
                                        </span>
                                    )}
                                    {(phase.revision_limit !== undefined && phase.revision_limit !== null) && (
                                        <span className="flex items-center gap-1">
                                            <Clock size={10} />
                                            {phase.revision_limit} revisión
                                            {phase.revision_limit !== 1 ? 'es' : ''} incluida
                                        </span>
                                    )}
                                </div>

                                {phase.client_visible_notes && (
                                    <p className="mt-2 text-xs text-muted-foreground leading-relaxed bg-secondary/50 rounded-lg p-2.5">
                                        {phase.client_visible_notes}
                                    </p>
                                )}

                                {/* Deliverables */}
                                {phase.deliverables && phase.deliverables.length > 0 && (
                                    <div className="flex flex-wrap gap-2 mt-2">
                                        {phase.deliverables.map((d: any, idx: number) => (
                                            <a
                                                key={idx}
                                                href={d.url}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className="inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-secondary/50 border border-border/50 text-[10px] font-bold text-primary hover:bg-secondary transition-colors"
                                            >
                                                <Download size={10} />
                                                {d.name}
                                            </a>
                                        ))}
                                    </div>
                                )}

                                {/* Botones de aprobación SOLO en modo ejecución */}
                                {mode === 'execution' && status === 'client_review' && !phase.client_approved_at && (
                                    <button
                                        onClick={() => {
                                            // TODO: Integrar con Supabase para aprobar fase
                                            // UPDATE project_phases SET client_approved_at = NOW(), status = 'approved' WHERE id = phase.id
                                            console.log('Aprobar fase:', phase.id, 'project:', projectId)
                                            onPhaseApproved?.()
                                        }}
                                        className="mt-3 inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-success text-success-foreground text-[10px] font-black uppercase tracking-wider hover:bg-success/90 transition-all active:scale-[0.98]"
                                    >
                                        <CheckCircle2 size={12} />
                                        ✅ Aprobar esta Fase
                                        <ChevronRight size={12} />
                                    </button>
                                )}

                                {phase.client_approved_at && (
                                    <div className="mt-2 inline-flex items-center gap-1.5 text-[10px] font-black text-success-foreground">
                                        <CheckCircle2 size={12} />
                                        Aprobado el {formatDate(phase.client_approved_at)}
                                    </div>
                                )}
                            </div>
                        </div>
                    )
                })}
            </div>
        </div>
    )
}


