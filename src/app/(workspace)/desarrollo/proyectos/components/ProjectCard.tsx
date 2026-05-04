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
        bg: 'bg-secondary',
        text: 'text-muted-foreground',
        border: 'border-border/50',
        icon: <Clock size={10} />,
    },
    active: {
        label: 'En Progreso',
        bg: 'bg-primary/10',
        text: 'text-primary',
        border: 'border-primary/20',
        icon: <Route size={10} />,
    },
    paused: {
        label: 'Pausado',
        bg: 'bg-amber-500/10',
        text: 'text-amber-500',
        border: 'border-amber-500/20',
        icon: <PauseCircle size={10} />,
    },
    review: {
        label: 'En Revisión',
        bg: 'bg-indigo-500/10',
        text: 'text-indigo-500',
        border: 'border-indigo-500/20',
        icon: <AlertCircle size={10} />,
    },
    completed: {
        label: 'Completado',
        bg: 'bg-emerald-500/10',
        text: 'text-emerald-500',
        border: 'border-emerald-500/20',
        icon: <CheckCircle2 size={10} />,
    },
    cancelled: {
        label: 'Cancelado',
        bg: 'bg-destructive/10',
        text: 'text-destructive',
        border: 'border-destructive/20',
        icon: <XCircle size={10} />,
    },
    maintenance: {
        label: 'Mantenimiento',
        bg: 'bg-violet-500/10',
        text: 'text-violet-500',
        border: 'border-violet-500/20',
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

import { useState } from 'react'

// ... (rest of imports remains the same)

export function ProjectCard({ project, onView, onConfig }: ProjectCardProps) {
    const [showDetails, setShowDetails] = useState(false)
    const statusCfg = STATUS_CONFIG[project.status] || STATUS_CONFIG.planning
    const { name: currentPhaseName, completedCount, totalCount } = getCurrentPhase(
        project.phases || []
    )
    const progressPct = totalCount > 0 ? Math.round((completedCount / totalCount) * 100) : 0

    return (
        <div className="group relative bg-card border border-border rounded-2xl sm:rounded-3xl p-4 transition-all hover:border-primary/50 hover:shadow-2xl hover:shadow-primary/5 cursor-default overflow-hidden">
            {/* Decorative Gradient */}
            <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 rounded-full -mr-16 -mt-16 blur-3xl group-hover:bg-primary/10 transition-colors" />

            <div className="space-y-4 relative z-10">
                {/* Header: Code + Status */}
                <div className="flex items-start justify-between gap-4">
                    <div className="flex-1 min-w-0">
                        <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">
                            {project.code}
                        </p>
                        <h3 className="text-sm font-black text-foreground uppercase tracking-tight truncate mt-0.5" title={project.name}>
                            {project.name}
                        </h3>
                        <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest truncate mt-0.5">
                            {project.client?.razon_social || 'Cliente no asignado'}
                        </p>
                    </div>
                    <div className="flex flex-col items-end gap-1 shrink-0">
                        <div
                            className={`px-2 py-0.5 rounded-lg ${statusCfg.bg} ${statusCfg.text} border ${statusCfg.border} text-[9px] font-black uppercase flex items-center gap-1`}
                        >
                            {statusCfg.icon}
                            {statusCfg.label}
                        </div>
                        {project.portal_view_mode === 'execution' && (
                            <div className="px-2 py-0.5 rounded-lg bg-emerald-500/10 text-[9px] font-black uppercase text-emerald-500 border border-emerald-500/20 flex items-center gap-1">
                                <Globe size={10} />
                                <span className="hidden xs:inline">Portal Activo</span>
                            </div>
                        )}
                    </div>
                </div>

                {/* Collapsible Details */}
                {showDetails && (
                    <div className="space-y-4 pt-3 border-t border-border/50 animate-in fade-in slide-in-from-top-2 duration-300">
                        {/* Phase + Progress */}
                        <div className="space-y-2.5">
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
                                <div className="h-1.5 w-full bg-secondary rounded-full overflow-hidden">
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
                                <p className="text-[11px] font-bold text-foreground italic">
                                    {formatDate(project.deadline_date)}
                                </p>
                            </div>
                            <div className="space-y-1 text-right">
                                <div className="flex items-center justify-end gap-1.5 text-[9px] font-black text-muted-foreground uppercase tracking-tighter">
                                    Tipo
                                </div>
                                <p className="text-[11px] font-bold text-foreground italic capitalize">
                                    {project.project_type === 'develop' ? 'Desarrollo' : 'Producto'}
                                </p>
                            </div>
                        </div>
                    </div>
                )}

                {/* Actions Section */}
                <div className="flex flex-wrap items-center gap-2 pt-2">
                    <button
                        onClick={() => onView(project)}
                        className="flex-1 min-w-[120px] group/btn flex items-center justify-center gap-2 px-3 py-2.5 bg-secondary hover:bg-primary transition-all rounded-xl border border-border active:scale-95 shadow-sm"
                    >
                        <Eye size={14} className="text-foreground group-hover/btn:text-sky-950" />
                        <span className="text-[10px] font-black uppercase tracking-widest text-foreground group-hover/btn:text-sky-950">
                            Ver Proyecto
                        </span>
                    </button>

                    <button
                        onClick={() => setShowDetails(!showDetails)}
                        className={`flex items-center justify-center gap-2 px-3 py-2.5 transition-all rounded-xl border active:scale-95 ${
                            showDetails 
                                ? 'bg-primary/10 border-primary/20 text-primary' 
                                : 'bg-card border-border/60 text-muted-foreground hover:bg-accent/40'
                        }`}
                        title={showDetails ? "Ocultar detalles" : "Ver detalles"}
                    >
                        <Route size={14} className={showDetails ? 'animate-pulse' : ''} />
                        <span className="text-[10px] font-black uppercase tracking-widest">
                            {showDetails ? 'Cerrar' : 'Detalles'}
                        </span>
                    </button>

                    <div className="flex items-center gap-1.5 ml-auto">
                        {project.client?.portal_token && (
                            <a
                                href={`/p/${project.client.portal_token}`}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="flex items-center justify-center w-10 h-10 bg-card hover:bg-accent/50 transition-all rounded-xl border border-border/60 active:scale-95"
                                title="Ver Portal del Cliente"
                            >
                                <Globe size={14} className="text-muted-foreground" />
                            </a>
                        )}

                        {project.linear_project_url && (
                            <a
                                href={project.linear_project_url}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="flex items-center justify-center w-10 h-10 bg-card hover:bg-accent/50 transition-all rounded-xl border border-border/60 active:scale-95"
                                title="Abrir en Linear"
                            >
                                <ExternalLink size={14} className="text-muted-foreground" />
                            </a>
                        )}

                        <button
                            onClick={() => onConfig(project)}
                            className="flex items-center justify-center w-10 h-10 bg-card hover:bg-accent/50 transition-all rounded-xl border border-border/60 active:scale-95"
                            title="Configuración"
                        >
                            <Settings size={14} className="text-muted-foreground" />
                        </button>
                    </div>
                </div>
            </div>
        </div>
    )
}
