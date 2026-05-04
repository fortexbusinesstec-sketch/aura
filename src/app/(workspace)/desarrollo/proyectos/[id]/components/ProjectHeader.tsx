'use client'

import { Project, Client, ProjectStatus } from '@/types'
import {
    ExternalLink,
    FileText,
    Pause,
    Play,
    CheckCircle2,
    Clock,
    AlertCircle,
    Route,
    XCircle,
    Wrench,
    Calendar,
    Flag,
} from 'lucide-react'

// ------------------------------------------------------------------
// Tipos
// ------------------------------------------------------------------

interface ProjectHeaderProps {
    project: Project
    client: Client | null
    daysRemaining: number | null
    onStatusChange: (status: ProjectStatus) => void
}

// ------------------------------------------------------------------
// Config de estados
// ------------------------------------------------------------------

const STATUS_CONFIG: Record<
    ProjectStatus,
    { label: string; bg: string; text: string; border: string; icon: React.ReactNode }
> = {
    planning: {
        label: 'Planificación',
        bg: 'bg-muted/50',
        text: 'text-muted-foreground',
        border: 'border-border',
        icon: <Clock size={14} />,
    },
    active: {
        label: 'En Progreso',
        bg: 'bg-primary/10',
        text: 'text-primary',
        border: 'border-primary/20',
        icon: <Route size={14} />,
    },
    paused: {
        label: 'Pausado',
        bg: 'bg-amber-500/10',
        text: 'text-amber-600',
        border: 'border-amber-500/20',
        icon: <Pause size={14} />,
    },
    review: {
        label: 'En Revisión',
        bg: 'bg-blue-500/10',
        text: 'text-blue-600',
        border: 'border-blue-500/20',
        icon: <AlertCircle size={14} />,
    },
    completed: {
        label: 'Completado',
        bg: 'bg-emerald-500/10',
        text: 'text-emerald-600',
        border: 'border-emerald-500/20',
        icon: <CheckCircle2 size={14} />,
    },
    cancelled: {
        label: 'Cancelado',
        bg: 'bg-destructive/10',
        text: 'text-destructive',
        border: 'border-destructive/20',
        icon: <XCircle size={14} />,
    },
    maintenance: {
        label: 'Mantenimiento',
        bg: 'bg-indigo-500/10',
        text: 'text-indigo-600',
        border: 'border-indigo-500/20',
        icon: <Wrench size={14} />,
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

// ------------------------------------------------------------------
// Componente
// ------------------------------------------------------------------

export function ProjectHeader({ project, client, daysRemaining, onStatusChange }: ProjectHeaderProps) {
    const statusCfg = STATUS_CONFIG[project.status] || STATUS_CONFIG.planning
    const isPaused = project.status === 'paused'
    const isCompleted = project.status === 'completed'
    const isCancelled = project.status === 'cancelled'
    const canPause = project.status === 'active' || project.status === 'planning' || project.status === 'review'
    const canComplete = project.status === 'active' || project.status === 'review'

    return (
        <div className="bg-card border border-border rounded-2xl sm:rounded-3xl p-5 sm:p-8 space-y-6">
            {/* Top row: code + status badge */}
            <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
                <div className="space-y-1">
                    <div className="flex items-center gap-2">
                        <span className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">
                            {project.code}
                        </span>
                        <span className="text-border">|</span>
                        <span className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">
                            {project.project_type === 'develop' ? 'Desarrollo' : 'Producto'}
                        </span>
                    </div>
                    <h1 className="text-2xl sm:text-3xl font-black text-foreground italic uppercase tracking-tighter">
                        {project.name}
                    </h1>
                    <p className="text-xs font-bold text-muted-foreground uppercase tracking-widest">
                        {client?.razon_social || 'Cliente no asignado'}
                        {client?.ruc ? ` · RUC ${client.ruc}` : ''}
                    </p>
                </div>

                <div
                    className={`self-start px-3 py-1.5 rounded-xl ${statusCfg.bg} ${statusCfg.text} border ${statusCfg.border} text-[11px] font-black uppercase flex items-center gap-1.5`}
                >
                    {statusCfg.icon}
                    {statusCfg.label}
                </div>
            </div>

            {/* Dates + Days remaining */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="flex items-center gap-3 rounded-2xl bg-secondary/40 border border-border/40 px-4 py-3">
                    <div className="w-9 h-9 rounded-xl bg-primary/10 flex items-center justify-center text-primary shrink-0">
                        <Calendar size={16} />
                    </div>
                    <div>
                        <p className="text-[9px] font-black text-muted-foreground uppercase tracking-widest">Inicio</p>
                        <p className="text-xs font-bold text-foreground">{formatDate(project.kickoff_date)}</p>
                    </div>
                </div>

                <div className="flex items-center gap-3 rounded-2xl bg-secondary/40 border border-border/40 px-4 py-3">
                    <div className="w-9 h-9 rounded-xl bg-primary/10 flex items-center justify-center text-primary shrink-0">
                        <Flag size={16} />
                    </div>
                    <div>
                        <p className="text-[9px] font-black text-muted-foreground uppercase tracking-widest">Entrega</p>
                        <p className="text-xs font-bold text-foreground">{formatDate(project.deadline_date)}</p>
                    </div>
                </div>

                <div className="flex items-center gap-3 rounded-2xl bg-secondary/40 border border-border/40 px-4 py-3">
                    <div className="w-9 h-9 rounded-xl bg-primary/10 flex items-center justify-center text-primary shrink-0">
                        <Clock size={16} />
                    </div>
                    <div>
                        <p className="text-[9px] font-black text-muted-foreground uppercase tracking-widest">Días Restantes</p>
                        <p className={`text-xs font-bold ${daysRemaining !== null && daysRemaining < 0 ? 'text-destructive' : 'text-foreground'}`}>
                            {daysRemaining !== null
                                ? daysRemaining < 0
                                    ? `${Math.abs(daysRemaining)} días de retraso`
                                    : `${daysRemaining} días`
                                : '—'}
                        </p>
                    </div>
                </div>
            </div>

            {/* Action buttons */}
            <div className="flex flex-wrap items-center gap-2 pt-2">
                {project.linear_project_url && (
                    <a
                        href={project.linear_project_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-2 px-4 py-2.5 bg-background hover:bg-secondary transition-all rounded-xl border border-border active:scale-95"
                    >
                        <ExternalLink size={14} className="text-muted-foreground" />
                        <span className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">
                            Ver en Linear
                        </span>
                    </a>
                )}

                {canPause && (
                    <button
                        onClick={() => onStatusChange('paused')}
                        className="flex items-center gap-2 px-4 py-2.5 bg-amber-500/10 hover:bg-amber-500/20 transition-all rounded-xl border border-amber-500/20 active:scale-95"
                    >
                        <Pause size={14} className="text-amber-600" />
                        <span className="text-[10px] font-black uppercase tracking-widest text-amber-600">
                            Pausar Proyecto
                        </span>
                    </button>
                )}

                {isPaused && (
                    <button
                        onClick={() => onStatusChange('active')}
                        className="flex items-center gap-2 px-4 py-2.5 bg-emerald-500/10 hover:bg-emerald-500/20 transition-all rounded-xl border border-emerald-500/20 active:scale-95"
                    >
                        <Play size={14} className="text-emerald-600" />
                        <span className="text-[10px] font-black uppercase tracking-widest text-emerald-600">
                            Reanudar
                        </span>
                    </button>
                )}

                {canComplete && (
                    <button
                        onClick={() => onStatusChange('completed')}
                        className="flex items-center gap-2 px-4 py-2.5 bg-emerald-500/10 hover:bg-emerald-500/20 transition-all rounded-xl border border-emerald-500/20 active:scale-95"
                    >
                        <CheckCircle2 size={14} className="text-emerald-600" />
                        <span className="text-[10px] font-black uppercase tracking-widest text-emerald-600">
                            Marcar Completado
                        </span>
                    </button>
                )}

                {(isCompleted || isCancelled) && (
                    <button
                        onClick={() => onStatusChange('active')}
                        className="flex items-center gap-2 px-4 py-2.5 bg-secondary hover:bg-accent transition-all rounded-xl border border-border active:scale-95"
                    >
                        <Play size={14} className="text-muted-foreground" />
                        <span className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">
                            Reabrir Proyecto
                        </span>
                    </button>
                )}
            </div>
        </div>
    )
}
