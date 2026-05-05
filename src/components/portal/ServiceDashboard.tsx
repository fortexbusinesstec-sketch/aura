'use client'

import {
    Search,
    TrendingUp,
    Zap,
    CheckCircle2,
    Clock,
    AlertCircle,
    ExternalLink,
} from 'lucide-react'
import { ProjectService } from '@/types'

// ------------------------------------------------------------------
// Helpers
// ------------------------------------------------------------------

const formatDateShort = (dateStr: string) => {
    if (!dateStr) return '-'
    try {
        const date = new Date(dateStr + (dateStr.includes('T') ? '' : 'T00:00:00'))
        return date.toLocaleDateString('es-PE', { day: '2-digit', month: 'short' })
    } catch (e) { return dateStr }
}

// ------------------------------------------------------------------
// Componente
// ------------------------------------------------------------------

interface ServiceDashboardProps {
    services: ProjectService[]
}

export function ServiceDashboard({ services }: ServiceDashboardProps) {
    if (!services || services.length === 0) {
        return (
            <div className="bg-card rounded-2xl border border-border/50 p-8 text-center">
                <Zap size={32} className="text-muted-foreground/30 mx-auto mb-3" />
                <p className="text-sm font-bold text-muted-foreground">No hay servicios adicionales contratados</p>
            </div>
        )
    }

    const serviceTypeLabel: Record<string, string> = {
        seo: '🔍 Optimización SEO',
        cro: '📈 Conversión y CRO',
        performance: '⚡ Performance y Web Vitals',
    }

    const serviceTypeIcon: Record<string, React.ElementType> = {
        seo: Search,
        cro: TrendingUp,
        performance: Zap,
    }

    return (
        <div className="space-y-6">
            {services.map((service) => {
                const Icon = serviceTypeIcon[service.service_type] || Zap
                const metrics = service.metrics_jsonb || {}
                const actions = service.actions_jsonb || []

                return (
                    <div key={service.id} className="bg-card rounded-2xl border border-border/50 p-5 sm:p-6">
                        {/* Header */}
                        <div className="flex items-center justify-between mb-5">
                            <div className="flex items-center gap-2">
                                <div className="p-1.5 rounded-lg bg-primary/10">
                                    <Icon size={16} className="text-primary" />
                                </div>
                                <h3 className="text-sm font-black uppercase tracking-tighter text-foreground">
                                    {serviceTypeLabel[service.service_type] || service.service_type}
                                </h3>
                            </div>
                            {service.service_level && (
                                <span className="px-2.5 py-1 rounded-lg bg-secondary text-[9px] font-black uppercase tracking-wider text-muted-foreground border border-border/50">
                                    Nivel: {service.service_level}
                                </span>
                            )}
                        </div>

                        {/* Métricas */}
                        {Object.keys(metrics).length > 0 && (
                            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 mb-5">
                                {Object.entries(metrics).map(([key, value]) => {
                                    if (Array.isArray(value)) return null
                                    const label = key
                                        .replace(/_/g, ' ')
                                        .replace(/lighthouse|seo|core web|pagespeed/gi, (m) => m.toUpperCase())
                                    return (
                                        <div key={key} className="bg-secondary/50 rounded-xl border border-border/50 p-3 text-center">
                                            <p className="text-[9px] font-black uppercase tracking-widest text-muted-foreground mb-1">
                                                {label}
                                            </p>
                                            <p className="text-lg font-black text-primary">{String(value)}</p>
                                        </div>
                                    )
                                })}
                            </div>
                        )}

                        {/* Acciones */}
                        {actions.length > 0 && (
                            <div>
                                <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground mb-3">
                                    Acciones Realizadas
                                </p>
                                <div className="space-y-2">
                                    {actions.map((action, idx) => {
                                        const isDone = action.status === 'done'
                                        const isInProgress = action.status === 'in_progress'
                                        return (
                                            <div
                                                key={idx}
                                                className={`flex items-start gap-3 p-3 rounded-xl border ${
                                                    isDone
                                                        ? 'bg-success/10 border-success/20'
                                                        : isInProgress
                                                        ? 'bg-warning/10 border-warning/20'
                                                        : 'bg-secondary/50 border-border/50'
                                                }`}
                                            >
                                                <div className={`mt-0.5 w-5 h-5 rounded-full flex items-center justify-center shrink-0 ${
                                                    isDone
                                                        ? 'bg-success text-success-foreground'
                                                        : isInProgress
                                                        ? 'bg-warning text-warning-foreground'
                                                        : 'bg-muted text-muted-foreground/40'
                                                }`}>
                                                    {isDone ? <CheckCircle2 size={12} /> : isInProgress ? <Clock size={12} /> : <AlertCircle size={12} />}
                                                </div>
                                                <div className="flex-1 min-w-0">
                                                    <p className="text-xs font-bold text-foreground/80">{action.action}</p>
                                                    <div className="flex items-center gap-2 mt-0.5">
                                                        <span className={`text-[9px] font-black uppercase tracking-wider ${
                                                            isDone ? 'text-success-foreground' : isInProgress ? 'text-warning-foreground' : 'text-muted-foreground/40'
                                                        }`}>
                                                            {isDone ? 'Completado' : isInProgress ? 'En Progreso' : 'Pendiente'}
                                                        </span>
                                                        {action.completed_at && (
                                                            <span className="text-[9px] text-muted-foreground/60">
                                                                {formatDateShort(action.completed_at)}
                                                            </span>
                                                        )}
                                                    </div>
                                                </div>
                                                {action.evidence_url && (
                                                    <a
                                                        href={action.evidence_url}
                                                        target="_blank"
                                                        rel="noopener noreferrer"
                                                        className="shrink-0 text-muted-foreground/40 hover:text-primary transition-colors"
                                                    >
                                                        <ExternalLink size={14} />
                                                    </a>
                                                )}
                                            </div>
                                        )
                                    })}
                                </div>
                            </div>
                        )}
                    </div>
                )
            })}
        </div>
    )
}
