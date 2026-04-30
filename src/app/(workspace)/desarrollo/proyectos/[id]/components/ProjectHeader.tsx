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
        bg: 'bg-slate-100',
        text: 'text-slate-700',
        border: 'border-slate-200',
        icon: <Clock size={14} />,
    },
    active: {
        label: 'En Progreso',
        bg: 'bg-emerald-50',
        text: 'text-emerald-700',
        border: 'border-emerald-200',
        icon: <Route size={14} />,
    },
    paused: {
        label: 'Pausado',
        bg: 'bg-amber-50',
        text: 'text-amber-700',
        border: 'border-amber-200',
        icon: <Pause size={14} />,
    },
    review: {
        label: 'En Revisión',
        bg: 'bg-sky-50',
        text: 'text-sky-700',
        border: 'border-sky-200',
        icon: <AlertCircle size={14} />,
    },
    completed: {
        label: 'Completado',
        bg: 'bg-teal-50',
        text: 'text-teal-700',
        border: 'border-teal-200',
        icon: <CheckCircle2 size={14} />,
    },
    cancelled: {
        label: 'Cancelado',
        bg: 'bg-red-50',
        text: 'text-red-700',
        border: 'border-red-200',
        icon: <XCircle size={14} />,
    },
    maintenance: {
        label: 'Mantenimiento',
        bg: 'bg-violet-50',
        text: 'text-violet-700',
        border: 'border-violet-200',
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
                        <p className={`text-xs font-bold ${daysRemaining !== null && daysRemaining < 0 ? 'text-red-600' : 'text-foreground'}`}>
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
                        className="flex items-center gap-2 px-4 py-2.5 bg-card hover:bg-accent/50 transition-all rounded-xl border border-border/60 active:scale-95"
                    >
                        <ExternalLink size={14} className="text-muted-foreground" />
                        <span className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">
                            Ver en Linear
                        </span>
                    </a>
                )}

                <button
                    onClick={() => { /* TODO: implementar vista de contrato */ }}
                    className="flex items-center gap-2 px-4 py-2.5 bg-card hover:bg-accent/50 transition-all rounded-xl border border-border/60 active:scale-95"
                >
                    <FileText size={14} className="text-muted-foreground" />
                    <span className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">
                        Ver Contrato
                    </span>
                </button>

                {canPause && (
                    <button
                        onClick={() => onStatusChange('paused')}
                        className="flex items-center gap-2 px-4 py-2.5 bg-amber-50 hover:bg-amber-100 transition-all rounded-xl border border-amber-200 active:scale-95"
                    >
                        <Pause size={14} className="text-amber-700" />
                        <span className="text-[10px] font-black uppercase tracking-widest text-amber-700">
                            Pausar Proyecto
                        </span>
                    </button>
                )}

                {isPaused && (
                    <button
                        onClick={() => onStatusChange('active')}
                        className="flex items-center gap-2 px-4 py-2.5 bg-emerald-50 hover:bg-emerald-100 transition-all rounded-xl border border-emerald-200 active:scale-95"
                    >
                        <Play size={14} className="text-emerald-700" />
                        <span className="text-[10px] font-black uppercase tracking-widest text-emerald-700">
                            Reanudar
                        </span>
                    </button>
                )}

                {canComplete && (
                    <button
                        onClick={() => onStatusChange('completed')}
                        className="flex items-center gap-2 px-4 py-2.5 bg-teal-50 hover:bg-teal-100 transition-all rounded-xl border border-teal-200 active:scale-95"
                    >
                        <CheckCircle2 size={14} className="text-teal-700" />
                        <span className="text-[10px] font-black uppercase tracking-widest text-teal-700">
                            Marcar Completado
                        </span>
                    </button>
                )}

                {(isCompleted || isCancelled) && (
                    <button
                        onClick={() => onStatusChange('active')}
                        className="flex items-center gap-2 px-4 py-2.5 bg-secondary hover:bg-accent/50 transition-all rounded-xl border border-border active:scale-95"
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
