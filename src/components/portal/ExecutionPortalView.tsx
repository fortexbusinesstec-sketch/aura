'use client'

import { useState } from 'react'
import {
    Globe,
    Code2,
    Briefcase,
    FileText,
    Clock,
    CheckCircle2,
    ExternalLink,
    Smartphone,
    MessageSquare,
    LogOut,
    Search,
    Layers,
    Target,
    TestTube2,
    Rocket,
    Calendar,
    ChevronRight,
    Download,
    AlertCircle,
    TrendingUp,
    Zap,
    BarChart3,
    ShieldCheck,
    Building2,
    Users,
    Lightbulb,
    XCircle,
    Lock,
    Unlock,
    CreditCard,
} from 'lucide-react'

// ------------------------------------------------------------------
// Tipos
// ------------------------------------------------------------------

type ExecutionTabId = 'desarrollo' | 'servicios' | 'archivos' | 'info' | 'roadmap'

interface ExecutionPortalViewProps {
    client: any
    project: any
    opportunity: any
    phases: any[]
    projectServices: any[]
    onLogout: () => void
    portalToken: string
}

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

const statusLabel = (status: string) => {
    const map: Record<string, string> = {
        pending: 'Pendiente',
        in_progress: 'En Progreso',
        in_review: 'En Revisión',
        client_review: 'Revisión Cliente',
        approved: 'Aprobado',
        completed: 'Completado',
        blocked: 'Bloqueado',
        skipped: 'Omitido',
    }
    return map[status] || status
}

const statusColor = (status: string) => {
    const map: Record<string, string> = {
        pending: 'bg-slate-100 text-slate-600 border-slate-200',
        in_progress: 'bg-amber-50 text-amber-700 border-amber-200',
        in_review: 'bg-sky-50 text-sky-700 border-sky-200',
        client_review: 'bg-violet-50 text-violet-700 border-violet-200',
        approved: 'bg-emerald-50 text-emerald-700 border-emerald-200',
        completed: 'bg-emerald-50 text-emerald-700 border-emerald-200',
        blocked: 'bg-red-50 text-red-700 border-red-200',
        skipped: 'bg-slate-50 text-slate-400 border-slate-100',
    }
    return map[status] || 'bg-slate-100 text-slate-600 border-slate-200'
}

const phaseIcon = (key: string) => {
    if (key?.includes('discovery')) return Search
    if (key?.includes('wireframe')) return Layers
    if (key?.includes('design') || key?.includes('diseno')) return Target
    if (key?.includes('develop') || key?.includes('desarrollo')) return Code2
    if (key?.includes('qa') || key?.includes('review')) return TestTube2
    if (key?.includes('launch') || key?.includes('live')) return Rocket
    return Calendar
}

// ------------------------------------------------------------------
// Componente principal
// ------------------------------------------------------------------

export function ExecutionPortalView({
    client,
    project,
    opportunity,
    phases,
    projectServices,
    onLogout,
}: ExecutionPortalViewProps) {
    const [activeTab, setActiveTab] = useState<ExecutionTabId>('desarrollo')
    const [showComment, setShowComment] = useState(false)

    const hasServices = projectServices && projectServices.length > 0

    const tabs = [
        { id: 'desarrollo' as const, label: 'Desarrollo', icon: Code2 },
        { id: 'servicios' as const, label: 'Servicios Adicionales', icon: Zap, hidden: !hasServices },
        { id: 'archivos' as const, label: 'Archivos', icon: FileText },
        { id: 'info' as const, label: 'Información', icon: Briefcase },
        { id: 'roadmap' as const, label: 'Roadmap', icon: Calendar },
    ].filter(t => !t.hidden)

    const projectStatusLabel = project.status === 'completed'
        ? 'COMPLETADO'
        : project.status === 'review'
        ? 'EN REVISIÓN'
        : 'EN DESARROLLO'

    const projectStatusColor = project.status === 'completed'
        ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
        : project.status === 'review'
        ? 'bg-sky-50 text-sky-700 border-sky-200'
        : 'bg-amber-50 text-amber-700 border-amber-200'

    return (
        <div className="min-h-screen bg-[#F9FAFB] text-slate-900 font-sans">
            {/* Header */}
            <header className="sticky top-0 z-30 bg-white/90 backdrop-blur-md border-b border-slate-200/60">
                <div className="max-w-5xl mx-auto px-4 sm:px-6">
                    <div className="flex items-center justify-between py-3 gap-4">
                        {/* Logo */}
                        <div className="flex items-center gap-2.5 shrink-0">
                            <div className="w-8 h-8 bg-[#1E3A5F] rounded-lg flex items-center justify-center">
                                <span className="text-white font-black text-[10px]">A</span>
                            </div>
                            <span className="hidden sm:block font-extrabold tracking-tighter text-xs uppercase text-[#1E3A5F]">Aura OS</span>
                        </div>

                        {/* Center: Project Info */}
                        <div className="flex-1 min-w-0 flex flex-col items-center">
                            <div className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">
                                Portal de Proyecto
                            </div>
                            <div className="flex items-center gap-2 mt-0.5">
                                <span className="text-sm font-bold text-slate-900 truncate max-w-[200px] sm:max-w-sm">
                                    {project.name}
                                </span>
                            </div>
                        </div>

                        {/* Right: Status + Actions */}
                        <div className="flex items-center gap-2 shrink-0">
                            <span className={`hidden md:inline-flex items-center px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-wider border ${projectStatusColor}`}>
                                {projectStatusLabel}
                            </span>
                            <button
                                onClick={() => setShowComment(true)}
                                className="flex items-center gap-1.5 px-3 py-2 rounded-lg border border-slate-200 text-[10px] font-black uppercase tracking-wider text-slate-600 hover:bg-slate-50 transition-colors"
                            >
                                <MessageSquare size={12} /> 💬 Comentar
                            </button>
                            {opportunity && (
                                <button
                                    onClick={() => setActiveTab('info')}
                                    className="hidden lg:flex items-center gap-1.5 px-3 py-2 rounded-lg bg-slate-100 text-[10px] font-black uppercase tracking-wider text-slate-600 hover:bg-slate-200 transition-colors"
                                >
                                    <FileText size={12} /> 📄 Ver Propuesta
                                </button>
                            )}
                            <button
                                onClick={onLogout}
                                className="flex items-center gap-1.5 px-3 py-2 rounded-lg text-[10px] font-black uppercase tracking-wider text-slate-400 hover:text-slate-600 transition-colors"
                                title="Cerrar sesión"
                            >
                                <LogOut size={12} />
                            </button>
                        </div>
                    </div>
                </div>

                {/* Tabs */}
                <nav className="border-t border-slate-100">
                    <div className="max-w-5xl mx-auto px-4 sm:px-6">
                        <div className="flex items-center gap-1 overflow-x-auto no-scrollbar py-2">
                            {tabs.map(tab => {
                                const Icon = tab.icon
                                const isActive = activeTab === tab.id
                                return (
                                    <button
                                        key={tab.id}
                                        onClick={() => setActiveTab(tab.id)}
                                        className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-[10px] font-black uppercase tracking-wider whitespace-nowrap transition-all shrink-0
                                            ${isActive
                                                ? 'bg-[#1E3A5F] text-white shadow-sm'
                                                : 'text-slate-400 hover:text-slate-600 hover:bg-slate-50'
                                            }`}
                                    >
                                        <Icon size={13} />
                                        {tab.label}
                                    </button>
                                )
                            })}
                        </div>
                    </div>
                </nav>
            </header>

            {/* Main Content */}
            <main className="max-w-5xl mx-auto py-6 px-4 sm:px-6">
                {activeTab === 'desarrollo' && (
                    <DesarrolloTab project={project} phases={phases} />
                )}
                {activeTab === 'servicios' && (
                    <ServiciosTab projectServices={projectServices} />
                )}
                {activeTab === 'archivos' && (
                    <ArchivosTab phases={phases} />
                )}
                {activeTab === 'info' && (
                    <InfoTab opportunity={opportunity} />
                )}
                {activeTab === 'roadmap' && (
                    <RoadmapTab phases={phases} />
                )}
            </main>

            {/* Footer */}
            <footer className="border-t border-slate-100 bg-white py-12 text-center mt-12">
                <div className="flex flex-col items-center gap-6">
                    <div className="flex items-center gap-2.5 opacity-20 hover:opacity-40 transition-opacity">
                        <div className="w-8 h-8 bg-[#1E3A5F] rounded-xl flex items-center justify-center">
                            <span className="text-white font-black text-[12px]">A</span>
                        </div>
                        <span className="font-black text-xs uppercase tracking-tighter text-[#1E3A5F]">Aura OS</span>
                    </div>
                    <div className="space-y-1.5">
                        <p className="text-[10px] font-black uppercase tracking-[0.25em] text-slate-300">
                            © FORTEX DIGITAL SOLUTIONS • PROPIEDAD INTELECTUAL
                        </p>
                        <p className="text-[9px] text-slate-300 font-medium max-w-xs mx-auto leading-relaxed">
                            Este portal es confidencial y ha sido generado específicamente para {client?.razon_social || 'el cliente'}.
                        </p>
                    </div>
                </div>
            </footer>
        </div>
    )
}


// ------------------------------------------------------------------
// TAB 1: DESARROLLO
// ------------------------------------------------------------------

function DesarrolloTab({ project, phases }: { project: any; phases: any[] }) {
    const stagingUrl = project.staging_url

    return (
        <div className="space-y-6 animate-in fade-in duration-300">
            {/* Fases Activas */}
            <div className="bg-white rounded-2xl border border-slate-200 p-5 sm:p-6">
                <div className="flex items-center gap-2 mb-5">
                    <Layers size={16} className="text-[#1E3A5F]" />
                    <h3 className="text-xs font-black uppercase tracking-tighter text-slate-900">Fases Activas</h3>
                </div>

                {phases.length === 0 ? (
                    <div className="text-center py-8 text-slate-400 text-sm">No hay fases configuradas</div>
                ) : (
                    <div className="space-y-0">
                        {phases.map((phase, i) => {
                            const Icon = phaseIcon(phase.phase_key)
                            const isDone = phase.status === 'completed' || phase.status === 'approved'
                            const isActive = phase.status === 'in_progress' || phase.status === 'in_review' || phase.status === 'client_review'
                            const isLast = i === phases.length - 1
                            const hasDeliverables = phase.deliverables && phase.deliverables.length > 0
                            const isClientApproved = !!phase.client_approved_at

                            return (
                                <div key={phase.id} className="flex gap-4">
                                    {/* Timeline line */}
                                    <div className="flex flex-col items-center">
                                        <div className={`w-9 h-9 rounded-full flex items-center justify-center shrink-0 border-2 ${
                                            isDone
                                                ? 'bg-emerald-500 border-emerald-500 text-white'
                                                : isActive
                                                ? 'bg-amber-50 border-amber-400 text-amber-700'
                                                : 'bg-slate-100 border-slate-200 text-slate-300'
                                        }`}>
                                            {isDone ? <CheckCircle2 size={16} /> : <Icon size={14} />}
                                        </div>
                                        {!isLast && (
                                            <div className={`w-0.5 flex-1 ${isDone ? 'bg-emerald-300' : 'bg-slate-200'} my-1`} />
                                        )}
                                    </div>

                                    {/* Content */}
                                    <div className="pb-6 flex-1 min-w-0">
                                        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-1">
                                            <h4 className="text-sm font-bold text-slate-900">{phase.phase_name}</h4>
                                            <div className="flex items-center gap-2">
                                                <span className={`px-2 py-0.5 rounded-lg text-[9px] font-black uppercase tracking-wider border ${statusColor(phase.status)}`}>
                                                    {statusLabel(phase.status).toUpperCase()}
                                                </span>
                                                {phase.planned_end_date && (
                                                    <span className="text-[10px] font-bold text-slate-400">
                                                        {formatDateShort(phase.planned_end_date)}
                                                    </span>
                                                )}
                                            </div>
                                        </div>

                                        {isClientApproved && (
                                            <div className="flex items-center gap-1.5 mt-1.5">
                                                <CheckCircle2 size={12} className="text-emerald-500" />
                                                <span className="text-[10px] font-bold text-emerald-600">
                                                    Aprobado el {formatDateShort(phase.client_approved_at)}
                                                </span>
                                            </div>
                                        )}

                                        {hasDeliverables && (
                                            <div className="flex flex-wrap gap-2 mt-2">
                                                {phase.deliverables.map((d: any, idx: number) => (
                                                    <a
                                                        key={idx}
                                                        href={d.url}
                                                        target="_blank"
                                                        rel="noopener noreferrer"
                                                        className="inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-slate-50 border border-slate-200 text-[10px] font-bold text-slate-600 hover:bg-slate-100 transition-colors"
                                                    >
                                                        <Download size={10} />
                                                        {d.name}
                                                    </a>
                                                ))}
                                            </div>
                                        )}
                                    </div>
                                </div>
                            )
                        })}
                    </div>
                )}
            </div>

            {/* Preview del sitio web */}
            {stagingUrl && (
                <div className="bg-white rounded-2xl border border-slate-200 p-5 sm:p-6">
                    <div className="flex items-center gap-2 mb-4">
                        <Globe size={16} className="text-[#1E3A5F]" />
                        <h3 className="text-xs font-black uppercase tracking-tighter text-slate-900">Vista Previa del Sitio</h3>
                    </div>
                    <div className="bg-slate-50 rounded-xl border border-slate-200 p-4 sm:p-6 text-center space-y-4">
                        <div className="w-14 h-14 rounded-2xl bg-[#1E3A5F]/10 flex items-center justify-center mx-auto">
                            <Code2 size={28} className="text-[#1E3A5F]" />
                        </div>
                        <div>
                            <p className="text-sm font-bold text-slate-900">URL de Staging</p>
                            <p className="text-xs text-slate-500 font-medium mt-1 break-all">{stagingUrl}</p>
                        </div>
                        <div className="flex items-center justify-center gap-3">
                            <a
                                href={stagingUrl}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="inline-flex items-center gap-2 px-5 py-2.5 bg-[#1E3A5F] text-white rounded-xl text-[10px] font-black uppercase tracking-wider hover:bg-[#1E3A5F]/90 transition-colors active:scale-95"
                            >
                                <ExternalLink size={12} />
                                🔍 Abrir Staging
                            </a>
                            <a
                                href={stagingUrl}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="inline-flex items-center gap-2 px-5 py-2.5 bg-slate-100 text-slate-700 border border-slate-200 rounded-xl text-[10px] font-black uppercase tracking-wider hover:bg-slate-200 transition-colors active:scale-95"
                            >
                                <Smartphone size={12} />
                                📱 Vista Mobile
                            </a>
                        </div>
                    </div>
                </div>
            )}
        </div>
    )
}


// ------------------------------------------------------------------
// TAB 2: SERVICIOS ADICIONALES
// ------------------------------------------------------------------

function ServiciosTab({ projectServices }: { projectServices: any[] }) {
    if (!projectServices || projectServices.length === 0) {
        return (
            <div className="bg-white rounded-2xl border border-slate-200 p-8 text-center animate-in fade-in duration-300">
                <Zap size={32} className="text-slate-300 mx-auto mb-3" />
                <p className="text-sm font-bold text-slate-400">No hay servicios adicionales contratados</p>
            </div>
        )
    }

    const serviceTypeLabel: Record<string, string> = {
        seo: '🔍 Optimización SEO',
        cro: '📈 Conversión y CRO',
        performance: '⚡ Performance y Web Vitals',
    }

    const serviceTypeIcon: Record<string, any> = {
        seo: Search,
        cro: TrendingUp,
        performance: Zap,
    }

    return (
        <div className="space-y-6 animate-in fade-in duration-300">
            {projectServices.map((service) => {
                const Icon = serviceTypeIcon[service.service_type] || Zap
                const metrics = service.metrics_jsonb || {}
                const actions: any[] = service.actions_jsonb || []

                return (
                    <div key={service.id} className="bg-white rounded-2xl border border-slate-200 p-5 sm:p-6">
                        {/* Header */}
                        <div className="flex items-center justify-between mb-5">
                            <div className="flex items-center gap-2">
                                <div className="p-1.5 rounded-lg bg-[#1E3A5F]/10">
                                    <Icon size={16} className="text-[#1E3A5F]" />
                                </div>
                                <h3 className="text-sm font-black uppercase tracking-tighter text-slate-900">
                                    {serviceTypeLabel[service.service_type] || service.service_type}
                                </h3>
                            </div>
                            {service.service_level && (
                                <span className="px-2.5 py-1 rounded-lg bg-slate-100 text-[9px] font-black uppercase tracking-wider text-slate-500 border border-slate-200">
                                    Nivel: {service.service_level}
                                </span>
                            )}
                        </div>

                        {/* Métricas */}
                        {Object.keys(metrics).length > 0 && (
                            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 mb-5">
                                {Object.entries(metrics).map(([key, value]: [string, any]) => {
                                    if (Array.isArray(value)) return null
                                    const label = key
                                        .replace(/_/g, ' ')
                                        .replace(/lighthouse|seo|core web|pagespeed/gi, (m) => m.toUpperCase())
                                    return (
                                        <div key={key} className="bg-slate-50 rounded-xl border border-slate-100 p-3 text-center">
                                            <p className="text-[9px] font-black uppercase tracking-widest text-slate-400 mb-1">
                                                {label}
                                            </p>
                                            <p className="text-lg font-black text-[#1E3A5F]">{String(value)}</p>
                                        </div>
                                    )
                                })}
                            </div>
                        )}

                        {/* Acciones */}
                        {actions.length > 0 && (
                            <div>
                                <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-3">
                                    Acciones Realizadas
                                </p>
                                <div className="space-y-2">
                                    {actions.map((action: any, idx: number) => {
                                        const isDone = action.status === 'done'
                                        const isInProgress = action.status === 'in_progress'
                                        return (
                                            <div
                                                key={idx}
                                                className={`flex items-start gap-3 p-3 rounded-xl border ${
                                                    isDone
                                                        ? 'bg-emerald-50/50 border-emerald-100'
                                                        : isInProgress
                                                        ? 'bg-amber-50/50 border-amber-100'
                                                        : 'bg-slate-50 border-slate-100'
                                                }`}
                                            >
                                                <div className={`mt-0.5 w-5 h-5 rounded-full flex items-center justify-center shrink-0 ${
                                                    isDone
                                                        ? 'bg-emerald-500 text-white'
                                                        : isInProgress
                                                        ? 'bg-amber-400 text-white'
                                                        : 'bg-slate-200 text-slate-400'
                                                }`}>
                                                    {isDone ? <CheckCircle2 size={12} /> : isInProgress ? <Clock size={12} /> : <AlertCircle size={12} />}
                                                </div>
                                                <div className="flex-1 min-w-0">
                                                    <p className="text-xs font-bold text-slate-800">{action.action}</p>
                                                    <div className="flex items-center gap-2 mt-0.5">
                                                        <span className={`text-[9px] font-black uppercase tracking-wider ${
                                                            isDone ? 'text-emerald-600' : isInProgress ? 'text-amber-600' : 'text-slate-400'
                                                        }`}>
                                                            {isDone ? 'Completado' : isInProgress ? 'En Progreso' : 'Pendiente'}
                                                        </span>
                                                        {action.completed_at && (
                                                            <span className="text-[9px] text-slate-400">
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
                                                        className="shrink-0 text-slate-400 hover:text-[#1E3A5F]"
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


// ------------------------------------------------------------------
// TAB 3: ARCHIVOS Y ENTREGABLES
// ------------------------------------------------------------------

function ArchivosTab({ phases }: { phases: any[] }) {
    const [activeFilter, setActiveFilter] = useState<string>('todos')

    const allDeliverables = phases.flatMap((phase) =>
        (phase.deliverables || []).map((d: any) => ({
            ...d,
            phase_name: phase.phase_name,
            phase_key: phase.phase_key,
        }))
    )

    const phaseNames = ['todos', ...new Set(phases.map(p => p.phase_name))]

    const filtered = activeFilter === 'todos'
        ? allDeliverables
        : allDeliverables.filter(d => d.phase_name === activeFilter)

    return (
        <div className="space-y-5 animate-in fade-in duration-300">
            <div className="bg-white rounded-2xl border border-slate-200 p-5 sm:p-6">
                <div className="flex items-center gap-2 mb-4">
                    <FileText size={16} className="text-[#1E3A5F]" />
                    <h3 className="text-xs font-black uppercase tracking-tighter text-slate-900">Archivos y Entregables</h3>
                </div>

                {/* Filters */}
                <div className="flex flex-wrap gap-2 mb-5">
                    {phaseNames.map(name => (
                        <button
                            key={name}
                            onClick={() => setActiveFilter(name)}
                            className={`px-3 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-wider transition-all ${
                                activeFilter === name
                                    ? 'bg-[#1E3A5F] text-white'
                                    : 'bg-slate-50 text-slate-500 border border-slate-200 hover:bg-slate-100'
                            }`}
                        >
                            {name === 'todos' ? 'Todos' : name}
                        </button>
                    ))}
                </div>

                {filtered.length === 0 ? (
                    <div className="text-center py-8 text-slate-400 text-sm">No hay archivos disponibles</div>
                ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        {filtered.map((file, idx) => (
                            <a
                                key={idx}
                                href={file.url}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="flex items-center gap-3 p-4 rounded-xl bg-slate-50 border border-slate-200 hover:border-[#1E3A5F]/30 hover:shadow-sm transition-all"
                            >
                                <div className="w-10 h-10 rounded-xl bg-white border border-slate-200 flex items-center justify-center shrink-0">
                                    <Download size={16} className="text-[#1E3A5F]" />
                                </div>
                                <div className="flex-1 min-w-0">
                                    <p className="text-xs font-bold text-slate-800 truncate">{file.name}</p>
                                    <p className="text-[9px] font-bold text-slate-400 uppercase tracking-wider mt-0.5">
                                        {file.phase_name} • {file.type || 'Archivo'}
                                    </p>
                                </div>
                                <ChevronRight size={14} className="text-slate-300 shrink-0" />
                            </a>
                        ))}
                    </div>
                )}
            </div>
        </div>
    )
}

// ------------------------------------------------------------------
// TAB 4: INFORMACIÓN DEL PROYECTO (Propuesta Original)
// ------------------------------------------------------------------

function InfoTab({ opportunity }: { opportunity: any }) {
    const [openSection, setOpenSection] = useState<string | null>(null)

    if (!opportunity) {
        return (
            <div className="bg-white rounded-2xl border border-slate-200 p-8 text-center animate-in fade-in duration-300">
                <Briefcase size={32} className="text-slate-300 mx-auto mb-3" />
                <p className="text-sm font-bold text-slate-400">Información de la propuesta no disponible</p>
            </div>
        )
    }

    const sections = [
        {
            id: 'resumen',
            label: 'Resumen Ejecutivo',
            icon: BarChart3,
            content: (
                <div className="space-y-3">
                    <p className="text-xs text-slate-600 leading-relaxed">
                        <strong className="text-slate-900">Propuesta de valor:</strong>{' '}
                        {opportunity.draft_jsonb?.value_proposition || 'No especificado'}
                    </p>
                    <p className="text-xs text-slate-600 leading-relaxed">
                        <strong className="text-slate-900">Hallazgo principal:</strong>{' '}
                        {opportunity.discovery_jsonb?.key_finding || 'No especificado'}
                    </p>
                    <p className="text-xs text-slate-600 leading-relaxed">
                        <strong className="text-slate-900">Industria:</strong>{' '}
                        {opportunity.discovery_jsonb?.industry || 'No especificado'}
                    </p>
                </div>
            ),
        },
        {
            id: 'mercado',
            label: 'Mercado e Inteligencia',
            icon: Globe,
            content: (
                <div className="space-y-3">
                    <p className="text-xs text-slate-600 leading-relaxed">
                        <strong className="text-slate-900">Diagnóstico:</strong>{' '}
                        {opportunity.research_jsonb?.diagnosis || 'No especificado'}
                    </p>
                    <p className="text-xs text-slate-600 leading-relaxed">
                        <strong className="text-slate-900">Target:</strong>{' '}
                        {opportunity.strategy_jsonb?.target_user || 'No especificado'}
                    </p>
                </div>
            ),
        },
        {
            id: 'estrategia',
            label: 'Estrategia Digital',
            icon: Target,
            content: (
                <div className="space-y-3">
                    <p className="text-xs text-slate-600 leading-relaxed">
                        <strong className="text-slate-900">Mensaje clave:</strong>{' '}
                        {opportunity.strategy_jsonb?.key_message || 'No especificado'}
                    </p>
                    <p className="text-xs text-slate-600 leading-relaxed">
                        <strong className="text-slate-900">Propuesta técnica:</strong>{' '}
                        {opportunity.strategy_jsonb?.value_proposition || 'No especificado'}
                    </p>
                </div>
            ),
        },
        {
            id: 'inversion',
            label: 'Inversión Original',
            icon: CreditCard,
            content: (
                <div className="space-y-3">
                    <div className="grid grid-cols-2 gap-3">
                        <div className="bg-slate-50 rounded-xl p-3">
                            <p className="text-[9px] font-black uppercase tracking-widest text-slate-400">Inversión Total</p>
                            <p className="text-lg font-black text-slate-900 mt-1">
                                S/ {opportunity.draft_jsonb?.totalCalculated?.toLocaleString() || '0'}
                            </p>
                        </div>
                        <div className="bg-slate-50 rounded-xl p-3">
                            <p className="text-[9px] font-black uppercase tracking-widest text-slate-400">Timeline</p>
                            <p className="text-lg font-black text-slate-900 mt-1">
                                {opportunity.delivery_time_text || 'No especificado'}
                            </p>
                        </div>
                    </div>
                    {opportunity.financials_jsonb && (
                        <div className="space-y-2">
                            <p className="text-xs text-slate-600">
                                <strong>ROI:</strong> {opportunity.financials_jsonb.roi_estimate || '—'}
                            </p>
                            <p className="text-xs text-slate-600">
                                <strong>Potencial:</strong> {opportunity.financials_jsonb.revenue_potential || '—'}
                            </p>
                            <p className="text-xs text-slate-600">
                                <strong>Términos:</strong> {opportunity.financials_jsonb.payment_terms || '—'}
                            </p>
                        </div>
                    )}
                </div>
            ),
        },
    ]

    return (
        <div className="space-y-4 animate-in fade-in duration-300">
            <div className="bg-amber-50 rounded-xl border border-amber-200 px-4 py-3 flex items-center gap-2">
                <AlertCircle size={14} className="text-amber-600 shrink-0" />
                <p className="text-[10px] font-bold text-amber-700 uppercase tracking-wider">
                    Información histórica de la propuesta
                </p>
            </div>

            {sections.map(section => {
                const Icon = section.icon
                const isOpen = openSection === section.id
                return (
                    <div key={section.id} className="bg-white rounded-2xl border border-slate-200 overflow-hidden">
                        <button
                            onClick={() => setOpenSection(isOpen ? null : section.id)}
                            className="w-full flex items-center justify-between px-5 py-4 text-left hover:bg-slate-50 transition-colors"
                        >
                            <div className="flex items-center gap-2">
                                <Icon size={16} className="text-[#1E3A5F]" />
                                <span className="text-xs font-black uppercase tracking-tighter text-slate-900">
                                    {section.label}
                                </span>
                            </div>
                            <ChevronRight
                                size={14}
                                className={`text-slate-400 transition-transform ${isOpen ? 'rotate-90' : ''}`}
                            />
                        </button>
                        {isOpen && (
                            <div className="px-5 pb-5 border-t border-slate-100 pt-4">
                                {section.content}
                            </div>
                        )}
                    </div>
                )
            })}
        </div>
    )
}

// ------------------------------------------------------------------
// TAB 5: ROADMAP
// ------------------------------------------------------------------

function RoadmapTab({ phases }: { phases: any[] }) {
    return (
        <div className="space-y-5 animate-in fade-in duration-300">
            <div className="bg-white rounded-2xl border border-slate-200 p-5 sm:p-6">
                <div className="flex items-center gap-2 mb-6">
                    <Calendar size={16} className="text-[#1E3A5F]" />
                    <h3 className="text-xs font-black uppercase tracking-tighter text-slate-900">Roadmap del Proyecto</h3>
                </div>

                {phases.length === 0 ? (
                    <div className="text-center py-8 text-slate-400 text-sm">No hay fases configuradas</div>
                ) : (
                    <div className="space-y-0">
                        {phases.map((phase, i) => {
                            const Icon = phaseIcon(phase.phase_key)
                            const isLast = i === phases.length - 1
                            const isDone = phase.status === 'completed' || phase.status === 'approved'
                            const isActive = phase.status === 'in_progress' || phase.status === 'in_review'

                            return (
                                <div key={phase.id} className="flex gap-4">
                                    <div className="flex flex-col items-center">
                                        <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 ${
                                            isDone
                                                ? 'bg-emerald-500 text-white'
                                                : isActive
                                                ? 'bg-amber-400 text-white'
                                                : 'bg-slate-200 text-slate-400'
                                        }`}>
                                            <Icon size={14} />
                                        </div>
                                        {!isLast && (
                                            <div className={`w-0.5 flex-1 ${isDone ? 'bg-emerald-300' : 'bg-slate-200'} my-1`} />
                                        )}
                                    </div>
                                    <div className="pb-6 flex-1">
                                        <h4 className="text-sm font-bold text-slate-900">{phase.phase_name}</h4>
                                        <div className="flex items-center gap-2 mt-1">
                                            <span className={`px-2 py-0.5 rounded-lg text-[9px] font-black uppercase tracking-wider border ${statusColor(phase.status)}`}>
                                                {statusLabel(phase.status)}
                                            </span>
                                            {phase.planned_start_date && phase.planned_end_date && (
                                                <span className="text-[10px] text-slate-400 font-medium">
                                                    {formatDateShort(phase.planned_start_date)} – {formatDateShort(phase.planned_end_date)}
                                                </span>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            )
                        })}
                    </div>
                )}
            </div>
        </div>
    )
}
