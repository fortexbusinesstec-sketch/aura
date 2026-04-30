'use client'

import { Eye, Pencil, Trash2, Layers, Rocket, Clock, GitBranch } from 'lucide-react'
import { PhaseTemplate } from '@/types'

interface PhaseTemplateCardProps {
    template: PhaseTemplate
    onView: (template: PhaseTemplate) => void
    onEdit: (template: PhaseTemplate) => void
    onDelete: (template: PhaseTemplate) => void
}

const TYPE_CONFIG = {
    develop: { label: 'Desarrollo Web', color: '#2f65ca', icon: Layers },
    product: { label: 'Producto SaaS', color: '#059669', icon: Rocket },
}

export function PhaseTemplateCard({ template, onView, onEdit, onDelete }: PhaseTemplateCardProps) {
    const typeConfig = TYPE_CONFIG[template.project_type] || TYPE_CONFIG.develop
    const TypeIcon = typeConfig.icon

    const totalDays = template.phases_definition.reduce(
        (sum, phase) => sum + (phase.default_duration_days || 0),
        0
    )

    return (
        <div className="group relative rounded-2xl border border-border/50 bg-card shadow-sm hover:shadow-md hover:border-primary/30 transition-all duration-300 overflow-hidden">
            {/* Default badge */}
            {template.is_default && (
                <div className="absolute top-0 right-0">
                    <div className="bg-primary text-primary-foreground text-[9px] font-black uppercase tracking-widest px-3 py-1 rounded-bl-xl">
                        Por Defecto
                    </div>
                </div>
            )}

            <div className="p-6 space-y-4">
                {/* Header */}
                <div className="flex items-start gap-4">
                    <div
                        className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl border"
                        style={{
                            backgroundColor: `${typeConfig.color}12`,
                            borderColor: `${typeConfig.color}25`,
                        }}
                    >
                        <TypeIcon size={22} style={{ color: typeConfig.color }} />
                    </div>
                    <div className="min-w-0 flex-1">
                        <h3 className="text-sm font-black text-foreground tracking-tight truncate">
                            {template.name}
                        </h3>
                        <span
                            className="inline-flex items-center rounded-md px-2 py-0.5 text-[10px] font-bold tracking-tight border mt-1.5"
                            style={{
                                backgroundColor: `${typeConfig.color}12`,
                                color: typeConfig.color,
                                borderColor: `${typeConfig.color}25`,
                            }}
                        >
                            {typeConfig.label}
                        </span>
                    </div>
                </div>

                {/* Stats */}
                <div className="flex items-center gap-4 text-[11px] text-muted-foreground">
                    <div className="flex items-center gap-1.5">
                        <GitBranch size={13} className="text-muted-foreground/60" />
                        <span className="font-bold text-foreground">{template.phases_definition.length}</span>
                        <span>fase{template.phases_definition.length !== 1 ? 's' : ''}</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                        <Clock size={13} className="text-muted-foreground/60" />
                        <span className="font-bold text-foreground">{totalDays}</span>
                        <span>día{totalDays !== 1 ? 's' : ''}</span>
                    </div>
                </div>
            </div>

            {/* Actions */}
            <div className="flex items-center border-t border-border/40 divide-x divide-border/40">
                <button
                    onClick={() => onView(template)}
                    className="flex flex-1 items-center justify-center gap-1.5 py-2.5 text-[10px] font-black uppercase tracking-widest text-muted-foreground hover:text-foreground hover:bg-accent/50 transition-all"
                >
                    <Eye size={13} />
                    Ver
                </button>
                <button
                    onClick={() => onEdit(template)}
                    className="flex flex-1 items-center justify-center gap-1.5 py-2.5 text-[10px] font-black uppercase tracking-widest text-muted-foreground hover:text-foreground hover:bg-accent/50 transition-all"
                >
                    <Pencil size={13} />
                    Editar
                </button>
                <button
                    onClick={() => onDelete(template)}
                    className="flex flex-1 items-center justify-center gap-1.5 py-2.5 text-[10px] font-black uppercase tracking-widest text-destructive/70 hover:text-destructive hover:bg-destructive/5 transition-all"
                >
                    <Trash2 size={13} />
                    Eliminar
                </button>
            </div>
        </div>
    )
}
