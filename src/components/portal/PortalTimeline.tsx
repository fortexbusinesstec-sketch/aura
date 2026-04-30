'use client'

import { useState } from 'react'
import {
    CheckCircle2,
    Clock,
    CircleDot,
    FileText,
    RotateCcw,
    CalendarDays,
    ChevronRight,
} from 'lucide-react'
import { ApprovePhaseModal } from './ApprovePhaseModal'

interface PortalTimelineProps {
    phases: any[]
    projectId: string
    onPhaseApproved: () => void
}

const statusMap: Record<string, { label: string; color: string }> = {
    pending: { label: 'Pendiente', color: 'text-slate-400' },
    in_progress: { label: 'En progreso', color: 'text-[#D4A843]' },
    in_review: { label: 'En revisión', color: 'text-[#D4A843]' },
    approved: { label: 'Aprobada', color: 'text-[#059669]' },
    completed: { label: 'Completada', color: 'text-[#059669]' },
    blocked: { label: 'Bloqueada', color: 'text-red-500' },
    skipped: { label: 'Omitida', color: 'text-slate-400' },
}

function formatDate(dateStr: string) {
    if (!dateStr) return '-'
    return new Date(dateStr + 'T00:00:00').toLocaleDateString('es-PE', {
        day: '2-digit',
        month: 'short',
        year: 'numeric',
    })
}

export function PortalTimeline({ phases, projectId, onPhaseApproved }: PortalTimelineProps) {
    const [selectedPhase, setSelectedPhase] = useState<any>(null)

    const getPhaseVisualState = (phase: any, index: number) => {
        const status = phase.status
        if (status === 'completed' || status === 'approved') return 'past'
        if (status === 'in_progress' || status === 'in_review') return 'present'
        return 'future'
    }

    return (
        <div className="space-y-5 animate-in fade-in duration-300">
            <div className="bg-white rounded-2xl border border-slate-100 p-5">
                <div className="flex items-center gap-2 mb-6">
                    <CalendarDays size={16} className="text-[#D4A843]" />
                    <h3 className="text-xs font-black uppercase tracking-tighter text-slate-900">
                        Cronograma del Proyecto
                    </h3>
                </div>

                {phases.length === 0 ? (
                    <div className="text-center py-12">
                        <p className="text-sm text-slate-400 font-medium">
                            No hay fases configuradas para este proyecto.
                        </p>
                    </div>
                ) : (
                    <div className="space-y-0">
                        {phases.map((phase, i) => {
                            const visualState = getPhaseVisualState(phase, i)
                            const isPast = visualState === 'past'
                            const isPresent = visualState === 'present'
                            const isFuture = visualState === 'future'
                            const statusInfo = statusMap[phase.status] || statusMap.pending
                            const deliverables = phase.deliverables || []
                            const isLast = i === phases.length - 1

                            return (
                                <div key={phase.id} className="flex gap-4">
                                    {/* Timeline node */}
                                    <div className="flex flex-col items-center">
                                        <div
                                            className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 transition-all ${
                                                isPast
                                                    ? 'bg-[#059669] text-white'
                                                    : isPresent
                                                        ? 'bg-[#D4A843] text-white ring-4 ring-[#D4A843]/30 animate-pulse'
                                                        : 'bg-slate-100 text-slate-300'
                                            }`}
                                        >
                                            {isPast ? (
                                                <CheckCircle2 size={16} />
                                            ) : isPresent ? (
                                                <CircleDot size={16} />
                                            ) : (
                                                <Clock size={16} />
                                            )}
                                        </div>
                                        {!isLast && (
                                            <div
                                                className={`w-0.5 flex-1 my-1 ${
                                                    isPast ? 'bg-[#059669]/40' : 'bg-slate-100'
                                                }`}
                                            />
                                        )}
                                    </div>

                                    {/* Content */}
                                    <div className={`pb-6 flex-1 ${isFuture ? 'opacity-60' : ''}`}>
                                        <div className="flex items-center gap-2 mb-1 flex-wrap">
                                            <span
                                                className={`text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded-full ${
                                                    isPast
                                                        ? 'bg-[#059669]/10 text-[#059669]'
                                                        : isPresent
                                                            ? 'bg-[#D4A843]/15 text-[#B45309]'
                                                            : 'bg-slate-100 text-slate-400'
                                                }`}
                                            >
                                                {statusInfo.label}
                                            </span>
                                            <span className="text-[10px] font-bold text-slate-400">
                                                {formatDate(phase.planned_start_date)}
                                            </span>
                                        </div>

                                        <h4 className="text-sm font-black text-slate-800">
                                            {phase.phase_name}
                                        </h4>

                                        <div className="flex items-center gap-3 mt-1 text-[10px] text-slate-500">
                                            <span className="flex items-center gap-1">
                                                <CalendarDays size={10} />
                                                {formatDate(phase.planned_start_date)} →{' '}
                                                {formatDate(phase.planned_end_date)}
                                            </span>
                                            <span className="flex items-center gap-1">
                                                <RotateCcw size={10} />
                                                {phase.revision_limit} revisión
                                                {phase.revision_limit !== 1 ? 'es' : ''}
                                            </span>
                                        </div>

                                        {phase.client_visible_notes && (
                                            <p className="mt-2 text-xs text-slate-500 leading-relaxed bg-slate-50 rounded-lg p-2.5">
                                                {phase.client_visible_notes}
                                            </p>
                                        )}

                                        {/* Deliverables */}
                                        {deliverables.length > 0 && (
                                            <div className="flex flex-wrap gap-2 mt-2">
                                                {deliverables.map((d: any, idx: number) => (
                                                    <a
                                                        key={idx}
                                                        href={d.url}
                                                        target="_blank"
                                                        rel="noopener noreferrer"
                                                        className="inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-slate-50 border border-slate-100 text-[10px] font-bold text-[#1E3A5F] hover:bg-slate-100 transition-colors"
                                                    >
                                                        <FileText size={10} />
                                                        {d.name}
                                                    </a>
                                                ))}
                                            </div>
                                        )}

                                        {/* Approve button for in_review phases */}
                                        {phase.status === 'in_review' && !phase.client_approved_at && (
                                            <button
                                                onClick={() => setSelectedPhase(phase)}
                                                className="mt-3 inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-[#059669] text-white text-[10px] font-black uppercase tracking-wider hover:bg-[#047857] transition-all active:scale-[0.98]"
                                            >
                                                <CheckCircle2 size={12} />
                                                Aprobar esta Fase
                                                <ChevronRight size={12} />
                                            </button>
                                        )}

                                        {phase.client_approved_at && (
                                            <div className="mt-2 inline-flex items-center gap-1.5 text-[10px] font-black text-[#059669]">
                                                <CheckCircle2 size={12} />
                                                Aprobado el {formatDate(phase.client_approved_at)}
                                            </div>
                                        )}
                                    </div>
                                </div>
                            )
                        })}
                    </div>
                )}
            </div>

            {selectedPhase && (
                <ApprovePhaseModal
                    phase={selectedPhase}
                    projectId={projectId}
                    onClose={() => setSelectedPhase(null)}
                    onApproved={onPhaseApproved}
                />
            )}
        </div>
    )
}
