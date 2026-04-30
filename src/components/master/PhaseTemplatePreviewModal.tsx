'use client'

import { Modal } from '@/components/ui/Modal'
import { PhaseTemplate } from '@/types'
import { Clock, RotateCcw } from 'lucide-react'

interface PhaseTemplatePreviewModalProps {
    template: PhaseTemplate | null
    isOpen: boolean
    onClose: () => void
}

export function PhaseTemplatePreviewModal({ template, isOpen, onClose }: PhaseTemplatePreviewModalProps) {
    if (!template) return null

    const sortedPhases = [...template.phases_definition].sort((a, b) => a.order - b.order)
    const totalDays = sortedPhases.reduce((sum, p) => sum + (p.default_duration_days || 0), 0)
    const totalRevisions = sortedPhases.reduce((sum, p) => sum + (p.revision_limit || 0), 0)

    return (
        <Modal isOpen={isOpen} onClose={onClose} title={`Vista Previa: ${template.name}`} maxWidth="max-w-4xl">
            <div className="space-y-8">
                {/* Summary bar */}
                <div className="flex flex-wrap items-center gap-4 rounded-2xl border border-border/50 bg-background/60 p-4">
                    <div className="flex items-center gap-2 text-sm">
                        <span className="text-muted-foreground font-medium">Fases:</span>
                        <span className="font-black text-foreground">{sortedPhases.length}</span>
                    </div>
                    <div className="h-4 w-px bg-border hidden sm:block" />
                    <div className="flex items-center gap-2 text-sm">
                        <Clock size={14} className="text-muted-foreground" />
                        <span className="text-muted-foreground font-medium">Duración total:</span>
                        <span className="font-black text-foreground">{totalDays} días</span>
                    </div>
                    <div className="h-4 w-px bg-border hidden sm:block" />
                    <div className="flex items-center gap-2 text-sm">
                        <RotateCcw size={14} className="text-muted-foreground" />
                        <span className="text-muted-foreground font-medium">Revisiones totales:</span>
                        <span className="font-black text-foreground">{totalRevisions}</span>
                    </div>
                </div>

                {/* Timeline */}
                <div className="relative overflow-x-auto pb-2">
                    <div className="min-w-[600px]">
                        {/* Connector line */}
                        <div className="absolute top-[22px] left-8 right-8 h-0.5 bg-border" />

                        <div className="relative flex justify-between">
                            {sortedPhases.map((phase, index) => (
                                <div key={phase.key} className="relative flex flex-col items-center text-center" style={{ width: `${100 / sortedPhases.length}%` }}>
                                    {/* Node */}
                                    <div
                                        className="relative z-10 flex h-11 w-11 items-center justify-center rounded-full border-2 bg-card shadow-sm"
                                        style={{
                                            borderColor: index === 0 ? 'hsl(var(--primary))' : 'hsl(var(--border))',
                                        }}
                                    >
                                        <span className="text-xs font-black text-foreground">{phase.order}</span>
                                    </div>

                                    {/* Phase info */}
                                    <div className="mt-4 space-y-1 px-1">
                                        <h4 className="text-[11px] font-black text-foreground tracking-tight leading-tight">
                                            {phase.name}
                                        </h4>
                                        <div className="space-y-0.5">
                                            <div className="flex items-center justify-center gap-1 text-[10px] text-muted-foreground">
                                                <Clock size={10} />
                                                <span>{phase.default_duration_days}d</span>
                                            </div>
                                            {phase.revision_limit > 0 && (
                                                <div className="flex items-center justify-center gap-1 text-[10px] text-muted-foreground">
                                                    <RotateCcw size={10} />
                                                    <span>{phase.revision_limit} rev</span>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Phase list detail */}
                <div className="space-y-2">
                    <h4 className="text-[11px] font-black uppercase text-muted-foreground tracking-[0.2em]">
                        Detalle de Fases
                    </h4>
                    <div className="rounded-2xl border border-border/50 divide-y divide-border/40 overflow-hidden">
                        {sortedPhases.map((phase) => (
                            <div key={phase.key} className="flex items-center gap-4 px-4 py-3 bg-card/50">
                                <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary-foreground font-black text-xs">
                                    {phase.order}
                                </div>
                                <div className="flex-1 min-w-0">
                                    <p className="text-xs font-bold text-foreground truncate">{phase.name}</p>
                                    <p className="text-[10px] text-muted-foreground font-mono">{phase.key}</p>
                                </div>
                                <div className="flex items-center gap-4 text-[10px] text-muted-foreground">
                                    <span className="flex items-center gap-1">
                                        <Clock size={10} />
                                        {phase.default_duration_days}d
                                    </span>
                                    <span className="flex items-center gap-1">
                                        <RotateCcw size={10} />
                                        {phase.revision_limit} rev
                                    </span>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </Modal>
    )
}
