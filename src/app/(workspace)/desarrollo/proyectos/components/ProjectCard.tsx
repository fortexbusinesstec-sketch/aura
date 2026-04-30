'use client'

import { Project, ProjectPhase, Client, ProjectStatus } from '@/types'
import {
    ExternalLink,
    Eye,
    Settings,
    CheckCircle2,
    Clock,
    AlertCircle,
    PauseCircle,
    XCircle,
    Wrench,
    Route,
    Globe,
} from 'lucide-react'

// ------------------------------------------------------------------
// Tipos
// ------------------------------------------------------------------

interface ProjectWithPhases extends Project {
    client: Client | null
    phases: ProjectPhase[]
    opportunity?: { portal_token: string | null } | null
}

interface ProjectCardProps {
    project: ProjectWithPhases
    onView: (project: ProjectWithPhases) => void
    onConfig: (project: ProjectWithPhases) => void
}

// ------------------------------------------------------------------
// Helpers
// ------------------------------------------------------------------

const STATUS_CONFIG: Record<
    ProjectStatus,
    { label: string; bg: string; text: string; border: string; icon: React.ReactNode }
> = {
    planning: {
        label: 'Planificación',
        bg: 'bg-slate-100',
        text: 'text-slate-700',
        border: 'border-slate-200',
        icon: <Clock size={10} />,
    },
    active: {
        label: 'En Progreso',
        bg: 'bg-emerald-50',
        text: 'text-emerald-700',
        border: 'border-emerald-200',
        icon: <Route size={10} />,
    },
    paused: {
        label: 'Pausado',
        bg: 'bg-amber-50',
        text: 'text-amber-700',
        border: 'border-amber-200',
        icon: <PauseCircle size={10} />,
    },
    review: {
        label: 'En Revisión',
        bg: 'bg-sky-50',
        text: 'text-sky-700',
        border: 'border-sky-200',
        icon: <AlertCircle size={10} />,
    },
    completed: {
        label: 'Completado',
        bg: 'bg-teal-50',
        text: 'text-teal-700',
        border: 'border-teal-200',
        icon: <CheckCircle2 size={10} />,
    },
    cancelled: {
        label: 'Cancelado',
        bg: 'bg-red-50',
        text: 'text-red-700',
        border: 'border-red-200',
        icon: <XCircle size={10} />,
    },
    maintenance: {
        label: 'Mantenimiento',
        bg: 'bg-violet-50',
        text: 'text-violet-700',
        border: 'border-violet-200',
        icon: <Wrench size={10} />,
    },
}

function formatDate(dateStr: string | null | undefined): string {
    if (!dateStr) return '—'
    const d = new Date(dateStr)
    return d.toLocaleDateString('es-PE', {
        day: 'numeric',
        month: 'short',
        year: 'numeric',
    })
}

function getCurrentPhase(phases: ProjectPhase[]): {
    name: string
    completedCount: number
    totalCount: number
} {
    const sorted = [...phases].sort((a, b) => a.phase_order - b.phase_order)
    const totalCount = sorted.length
    const completedCount = sorted.filter(
        (p) => p.status === 'completed' || p.status === 'approved' || p.status === 'skipped'
    ).length

    const inProgress = sorted.find((p) => p.status === 'in_progress')
    if (inProgress) {
        return { name: inProgress.phase_name, completedCount, totalCount }
    }

    const nextPending = sorted.find(
        (p) => p.status === 'pending' || p.status === 'blocked'
    )
    if (nextPending) {
        return { name: nextPending.phase_name, completedCount, totalCount }
    }

    return {
        name: totalCount > 0 ? 'Todas completadas' : 'Sin fases',
        completedCount,
        totalCount,
    }
}

// ------------------------------------------------------------------
// Componente
// ------------------------------------------------------------------

export function ProjectCard({ project, onView, onConfig }: ProjectCardProps) {
    const statusCfg = STATUS_CONFIG[project.status] || STATUS_CONFIG.planning
    const { name: currentPhaseName, completedCount, totalCount } = getCurrentPhase(
        project.phases || []
    )
    const progressPct = totalCount > 0 ? Math.round((completedCount / totalCount) * 100) : 0

    return (
        <div className="group relative bg-card border border-border rounded-2xl sm:rounded-3xl p-4 sm:p-6 transition-all hover:border-primary/50 hover:shadow-2xl hover:shadow-primary/5 cursor-default overflow-hidden">
            {/* Decorative Gradient */}
            <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 rounded-full -mr-16 -mt-16 blur-3xl group-hover:bg-primary/10 transition-colors" />

            <div className="space-y-5 relative z-10">
                {/* Header: Code + Status */}
                <div className="flex items-start justify-between">
                    <div>
                        <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">
                            {project.code}
                        </p>
                        <h3 className="text-sm font-black text-foreground uppercase tracking-tight line-clamp-1 mt-0.5">
                            {project.name}
                        </h3>
                        <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest mt-0.5">
                            {project.client?.razon_social || 'Cliente no asignado'}
                        </p>
                    </div>
                    <div className="flex flex-col items-end gap-1">
                        <div
                            className={`px-2 py-1 rounded-lg ${statusCfg.bg} ${statusCfg.text} border ${statusCfg.border} text-[9px] font-black uppercase flex items-center gap-1`}
                        >
                            {statusCfg.icon}
                            {statusCfg.label}
                        </div>
                        {project.portal_view_mode === 'execution' && (
                            <div className="px-2 py-1 rounded-lg bg-emerald-50 text-[9px] font-black uppercase text-emerald-700 border border-emerald-200 flex items-center gap-1">
                                <Globe size={10} />
                                Portal Activo
                            </div>
                        )}
                    </div>
                </div>

                {/* Phase + Progress */}
                <div className="space-y-3 pt-4 border-t border-border/50">
                    <div className="flex items-center justify-between">
                        <span className="text-[9px] font-black text-muted-foreground uppercase tracking-widest">
                            Fase Actual
                        </span>
                        <span className="text-[10px] font-bold text-foreground uppercase tracking-tight">
                            {currentPhaseName}
                        </span>
                    </div>

                    <div className="space-y-1.5">
                        <div className="flex items-center justify-between text-[9px] font-black uppercase tracking-widest">
                            <span className="text-muted-foreground">Progreso</span>
                            <span className="text-foreground">
                                {completedCount} de {totalCount} fases
                            </span>
                        </div>
                        <div className="h-2 w-full bg-secondary rounded-full overflow-hidden">
                            <div
                                className="h-full bg-primary rounded-full transition-all duration-500"
                                style={{ width: `${progressPct}%` }}
                            />
                        </div>
                    </div>
                </div>

                {/* Deadline + Type */}
                <div className="grid grid-cols-2 gap-3 pt-3 border-t border-border/50">
                    <div className="space-y-1">
                        <div className="flex items-center gap-1.5 text-[9px] font-black text-muted-foreground uppercase tracking-tighter">
                            <Clock size={10} /> Deadline
                        </div>
                        <p className="text-xs font-bold text-foreground italic">
                            {formatDate(project.deadline_date)}
                        </p>
                    </div>
                    <div className="space-y-1 text-right">
                        <div className="flex items-center justify-end gap-1.5 text-[9px] font-black text-muted-foreground uppercase tracking-tighter">
                            Tipo
                        </div>
                        <p className="text-xs font-bold text-foreground italic capitalize">
                            {project.project_type === 'develop' ? 'Desarrollo' : 'Producto'}
                        </p>
                    </div>
                </div>

                {/* Actions */}
                <div className="flex items-center gap-2 pt-2">
                    <button
                        onClick={() => onView(project)}
                        className="flex-1 group/btn flex items-center justify-center gap-2 px-4 py-3 bg-secondary hover:bg-primary transition-all rounded-2xl border border-border active:scale-95"
                    >
                        <Eye size={14} className="text-foreground group-hover/btn:text-sky-950" />
                        <span className="text-[10px] font-black uppercase tracking-widest text-foreground group-hover/btn:text-sky-950">
                            Ver Proyecto
                        </span>
                    </button>

                    {project.opportunity?.portal_token && (
                        <a
                            href={`/p/${project.opportunity.portal_token}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex items-center justify-center gap-2 px-4 py-3 bg-card hover:bg-accent/50 transition-all rounded-2xl border border-border/60 active:scale-95"
                            title="Ver Portal del Cliente"
                        >
                            <Globe size={14} className="text-muted-foreground" />
                            <span className="text-[10px] font-black uppercase tracking-widest text-muted-foreground hidden sm:inline">
                                Portal
                            </span>
                        </a>
                    )}

                    {project.linear_project_url && (
                        <a
                            href={project.linear_project_url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex items-center justify-center gap-2 px-4 py-3 bg-card hover:bg-accent/50 transition-all rounded-2xl border border-border/60 active:scale-95"
                            title="Abrir en Linear"
                        >
                            <ExternalLink size={14} className="text-muted-foreground" />
                            <span className="text-[10px] font-black uppercase tracking-widest text-muted-foreground hidden sm:inline">
                                Linear
                            </span>
                        </a>
                    )}

                    <button
                        onClick={() => onConfig(project)}
                        className="flex items-center justify-center w-11 h-11 bg-card hover:bg-accent/50 transition-all rounded-2xl border border-border/60 active:scale-95"
                        title="Configuración"
                    >
                        <Settings size={14} className="text-muted-foreground" />
                    </button>
                </div>
            </div>
        </div>
    )
}
