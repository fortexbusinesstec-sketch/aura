'use client'

import React, { useState } from 'react'
import { Opportunity, CatalogItem } from '@/types'
import {
    Zap,
    Building2,
    Target,
    BarChart3,
    FileText,
    Clock,
    CheckCircle2,
    AlertTriangle,
    TrendingUp,
    Globe,
    ShieldCheck,
    CreditCard,
    ArrowRight,
    Download,
    MessageSquare,
    Check,
    ChevronRight,
    Lock,
    Unlock,
    Smartphone,
    Search,
    Megaphone,
    Users,
    Lightbulb,
    AlertCircle,
    Calendar,
    Rocket,
    XCircle,
    Briefcase,
    Layers,
    Code2,
    TestTube2,
    Radio
} from 'lucide-react'

/* ═══════════════════════════════════════════════════════════════
   CLIENT PORTAL VIEW — DASHBOARD ESTRATÉGICO INTERACTIVO
   Aura OS v2.0 | Portal de Propuestas para Clientes B2B
   ═══════════════════════════════════════════════════════════════ */

const formatDateShort = (dateStr: string) => {
    if (!dateStr) return '-'
    try {
        const date = new Date(dateStr + (dateStr.includes('T') ? '' : 'T00:00:00'))
        return date.toLocaleDateString('es-PE', { day: '2-digit', month: 'short' })
    } catch (e) { return dateStr }
}

interface Props {
    opportunity: Partial<Opportunity> | null
    client: any
    catalog: CatalogItem[]
    phases?: any[]
    mode?: 'desktop' | 'mobile'
    activeTab?: TabId
    onTabChange?: (tab: TabId) => void
    hideHeader?: boolean
    onApproveProposal?: () => void
}

export type TabId = 'resumen' | 'inteligencia' | 'estrategia' | 'tecnica' | 'inversion' | 'roadmap'

/* ─────────────────── DATOS DE EJEMPLO (CLIENTE) ───────────────────
   Estos valores se usan como fallback cuando opportunity no tiene
   datos completos. En producción, todo viene del store/API.          */

const FALLBACK_CLIENT = {
    razon_social: 'Empresa Cliente S.A.C.',
    ruc: '20565993390',
    industry: 'Facility Management / Servicios Integrados de Mantenimiento y Limpieza',
    business_model: 'B2B' as const,
    value_proposition: 'Outsourcing operativo integral con eficiencia de costos',
    target_market: 'Grandes y medianas empresas con infraestructura física (retail, salud, financiero, corporativo, industrial)',
    digital_presence: {
        website: { quality: 'medium' as const, observations: 'Diseño genérico, sin blog, calidad media' },
        social: { status: 'inactive' as const, observations: 'Última publicación 2025, completamente inactiva' },
        seo: { status: 'basic' as const, observations: 'Solo marca propia, tráfico orgánico mínimo' },
        ads: { status: 'not_detected' as const, observations: 'Sin presencia publicitaria detectada' }
    }
}

const FALLBACK_INSIGHTS = {
    key_finding: 'El cliente tiene una operación sólida en su sector pero su presencia digital es limitada frente a competidores que capturan leads activamente. El riesgo principal es la invisibilidad digital en el ecosistema actual.',
    diagnosis: 'Operador B2B tradicional en un mercado que se digitaliza. No compite contra limpiadoras locales; compite contra la irrelevancia digital.',
    competitors: [
        { name: 'Sodexo Perú', segment: 'Premium' as const, strength: 'Command Center, +12k colaboradores', threat: 'high' as const },
        { name: 'Grupo EULEN', segment: 'Premium' as const, strength: 'Presencia en 11 países', threat: 'high' as const },
        { name: 'Tgestiona', segment: 'Medio' as const, strength: 'SEO agresivo y captación digital', threat: 'medium' as const },
        { name: 'Operadores locales A', segment: 'Low-cost' as const, strength: 'Precio competitivo, cercanía', threat: 'low' as const },
        { name: 'Operadores locales B', segment: 'Low-cost' as const, strength: 'Relaciones personales', threat: 'low' as const },
        { name: 'Nuevos entrantes digitales', segment: 'Medio' as const, strength: 'Plataformas tech-first', threat: 'medium' as const }
    ],
    trends: [
        { title: 'Digitalización obligatoria', icon: 'globe', impact: 'Los clientes B2B esperan cotizar y contratar vía web. Sin canal digital, se pierde el 60% de oportunidades.' },
        { title: 'Contratos por Resultados', icon: 'target', impact: 'El modelo de pago por hora/hombre está siendo reemplazado por KPIs medibles y SLA basados en outcomes.' },
        { title: 'ESG como requisito', icon: 'shield', impact: 'Empresas grandes exigen certificaciones ambientales y sociales. Es un diferenciador obligatorio en RFPs.' },
        { title: 'Espacios híbridos', icon: 'building', impact: 'Post-pandemia, los edificios requieren protocolos flexibles de limpieza y mantenimiento adaptativos.' },
        { title: 'Escasez de Talento Técnico', icon: 'users', impact: 'La rotación de personal operativo supera el 30% anual. La retención depende de capacitación y tecnología.' }
    ],
    opportunities: [
        { action: 'Activar SEO técnico', detail: 'Indexar servicios por vertical (retail, salud, industrial) para captar tráfico B2B orgánico.' },
        { action: 'Digitalizar oferta con CMMS cloud', detail: 'Ofrecer dashboard al cliente con tickets, reportes y métricas en tiempo real.' },
        { action: 'Redefinir SLA a outcome-based', detail: 'Cambiar contratos de "limpieza diaria" a "95% uptime de espacios certificados".' },
        { action: 'Pivotar staffing a talento técnico certificado', detail: 'Certificar al personal en normativas ISO y ESG para competir en RFPs grandes.' }
    ]
}

const FALLBACK_OPPORTUNITY = {
    headline: 'Propuesta Estratégica Aura OS',
    subheadline: 'Transformación digital estratégica para potenciar el crecimiento.',
    totalCapex: 705,
    totalOpex: 150,
    investment: 705,
    timeline: '2 semanas',
    revision_rounds: '2 rondas',
    dimension: 'landing' as const,
    deliverables: 'Landing Page con 5 bloques estratégicos:\n• Hero de impacto con propuesta de valor\n• Sección Nosotros (historia + fortaleza operativa)\n• Servicios (Facility, Limpieza, Mantenimiento)\n• Productos / Diferenciadores\n• Footer con CTA de contacto y datos',
    payment_terms: '50% inicio / 50% entrega',
    roi_estimate: '3-6 meses',
    revenue_potential: 'Alto — captación directa de leads B2B calificados',
    meeting_notes: 'Mencionaron que debemos centrarnos en las ventas del negocio. Enfocado directamente en los servicios de limpieza.',
    status: 'discovery' as const,
    blocks: [
        { name: 'Hero', complexity: 'Base', price: 120 },
        { name: 'Nosotros', complexity: 'Base', price: 120 },
        { name: 'Servicios', complexity: 'Complejo', price: 168 },
        { name: 'Productos', complexity: 'Base', price: 120 },
        { name: 'Footer + CTA', complexity: 'Base', price: 120 }
    ],
    modules: [
        { name: 'Optimización SEO On-Page', active: true },
        { name: 'Core Web Vitals', active: true },
        { name: 'Formulario de Contacto Inteligente', active: true },
        { name: 'Analytics + Pixel Tracking', active: true }
    ],
    exclusions: [
        'Copywriting profesional especializado (se entrega guía de contenido)',
        'Fotografía premium de locales y equipos',
        'Integraciones con CRM/ERP no especificadas',
        'Mantenimiento post-lanzamiento (cotizable aparte)'
    ]
}

const PHASES = [
    { id: 'discovery', label: 'Discovery', active: true, completed: false },
    { id: 'wireframes', label: 'Wireframes', active: false, completed: false },
    { id: 'diseno', label: 'Diseño', active: false, completed: false },
    { id: 'desarrollo', label: 'Desarrollo', active: false, completed: false },
    { id: 'qa', label: 'QA', active: false, completed: false },
    { id: 'live', label: 'Live', active: false, completed: false }
]

const TECH_PHASES = [
    { name: 'Wireframes', revisions: 1, status: 'pending', date: 'Semana 1' },
    { name: 'Diseño UI', revisions: 2, status: 'pending', date: 'Semana 1-2' },
    { name: 'Desarrollo', revisions: 1, status: 'pending', date: 'Semana 2' },
    { name: 'QA & Lanzamiento', revisions: 1, status: 'pending', date: 'Semana 2' }
]

const ROADMAP_ITEMS = [
    { phase: 'past', title: 'Discovery Completado', date: '15 Abr 2026', description: 'Investigación de mercado, análisis de competencia y entrevista con stakeholders finalizada.', icon: Search },
    { phase: 'present', title: 'Propuesta Enviada', date: '28 Abr 2026', description: 'Esperando aprobación del cliente para iniciar fase de diseño.', icon: FileText },
    { phase: 'future', title: 'Wireframes', date: '05 May 2026', description: 'Estructura visual de los 5 bloques de la landing.', icon: Layers },
    { phase: 'future', title: 'Diseño UI', date: '12 May 2026', description: 'Aplicación de identidad visual y diseño de interfaz.', icon: Target },
    { phase: 'future', title: 'Desarrollo', date: '19 May 2026', description: 'Codificación frontend con Next.js y despliegue en Aura OS.', icon: Code2 },
    { phase: 'future', title: 'QA & Revisión', date: '26 May 2026', description: 'Testing, correcciones y rondas de revisión incluidas.', icon: TestTube2 },
    { phase: 'future', title: 'Go Live', date: '02 Jun 2026', description: 'Lanzamiento oficial y entrega de documentación.', icon: Rocket }
]

/* ─────────────────── UTILIDADES ─────────────────── */

const formatCurrency = (val: number) =>
    `S/ ${val.toLocaleString('es-PE', { minimumFractionDigits: 0, maximumFractionDigits: 0 })}`

const statusConfig: Record<string, { label: string; bg: string; text: string; border: string }> = {
    discovery: { label: 'En Discovery', bg: 'bg-primary/15', text: 'text-primary', border: 'border-primary/30' },
    quoted: { label: 'Propuesta Enviada', bg: 'bg-emerald-500/15', text: 'text-emerald-500', border: 'border-emerald-500/30' },
    published: { label: 'Publicado', bg: 'bg-success/15', text: 'text-success-foreground', border: 'border-success/30' },
    won: { label: 'Aprobado', bg: 'bg-emerald-500/20', text: 'text-emerald-500', border: 'border-emerald-500/40' },
    lost: { label: 'Cerrado', bg: 'bg-destructive/15', text: 'text-destructive', border: 'border-destructive/30' }
}

const segmentColors: Record<string, string> = {
    'Premium': 'bg-primary/10 text-primary border-primary/20',
    'Medio-Alto': 'bg-orange-500/10 text-orange-500 border-orange-500/20',
    'Medio': 'bg-amber-500/10 text-amber-500 border-amber-500/20',
    'Low-cost': 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20'
}

const threatIcon = (level: string) => {
    if (level === 'high') return <AlertTriangle size={14} className="text-destructive" />
    if (level === 'medium') return <AlertCircle size={14} className="text-orange-500" />
    return <CheckCircle2 size={14} className="text-emerald-500" />
}

const scoreColor = (score: number) => {
    if (score >= 7) return 'bg-emerald-500'
    if (score >= 4) return 'bg-amber-400'
    return 'bg-[#DF7B71]'
}

const scoreLabel = (score: number) => {
    if (score >= 7) return 'Buena'
    if (score >= 4) return 'Regular'
    return 'Crítica'
}

/* ═══════════════════════════════════════════════════════════════
   SUB-COMPONENTES
   ═══════════════════════════════════════════════════════════════ */

function DashboardHeader({ opp, client, status, onApprove }: { opp: any; client: any; status: string; onApprove?: () => void }) {
    const cfg = statusConfig[status] || statusConfig.discovery
    const razonSocial = client?.razon_social || FALLBACK_CLIENT.razon_social
    const ruc = client?.ruc || FALLBACK_CLIENT.ruc

    return (
        <header className="sticky top-0 z-30 bg-background/80 backdrop-blur-md border-b border-border/50">
            <div className="flex items-center justify-between px-5 py-3 gap-4">
                {/* Logo */}
                <div className="flex items-center gap-2.5 shrink-0">
                    <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
                        <span className="text-primary-foreground font-black text-[10px]">FX</span>
                    </div>
                    <span className="hidden sm:block font-extrabold tracking-tighter text-xs uppercase text-foreground">Aura OS</span>
                </div>

                {/* Centro: Info Cliente */}
                <div className="flex-1 min-w-0 flex flex-col items-center">
                    <div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground">
                        <span>Propuesta Estratégica</span>
                    </div>
                    <div className="flex items-center gap-2 mt-0.5">
                        <span className="text-sm font-bold text-foreground truncate max-w-[200px] sm:max-w-sm">{razonSocial}</span>
                        <span className="hidden sm:inline text-[10px] text-muted-foreground font-bold">RUC {ruc}</span>
                    </div>
                </div>

                {/* Derecha: Estado + Botones */}
                <div className="flex items-center gap-2 shrink-0">
                    <span className={`hidden md:inline-flex items-center px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-wider border ${cfg.bg} ${cfg.text} ${cfg.border}`}>
                        {cfg.label}
                    </span>
                    <div className="hidden lg:flex items-center gap-1.5">
                        <button className="flex items-center gap-1.5 px-3 py-2 rounded-lg border border-border text-[10px] font-black uppercase tracking-wider text-muted-foreground hover:bg-secondary transition-colors">
                            <Download size={12} /> PDF
                        </button>
                        <button 
                            onClick={onApprove}
                            className="flex items-center gap-1.5 px-3 py-2 rounded-lg bg-primary/20 text-primary border border-primary/30 text-[10px] font-black uppercase tracking-wider hover:bg-primary/30 transition-colors"
                        >
                            <CheckCircle2 size={12} /> Aprobar
                        </button>
                        <button className="flex items-center gap-1.5 px-3 py-2 rounded-lg bg-foreground text-background text-[10px] font-black uppercase tracking-wider hover:bg-foreground/80 transition-colors">
                            <MessageSquare size={12} /> Comentar
                        </button>
                    </div>
                </div>
            </div>
        </header>
    )
}

function TabNavigation({ activeTab, onTabChange }: { activeTab: TabId; onTabChange: (t: TabId) => void }) {
    const tabs: { id: TabId; label: string; icon: any }[] = [
        { id: 'resumen', label: 'Resumen', icon: BarChart3 },
        { id: 'inteligencia', label: 'Mercado', icon: Globe },
        { id: 'estrategia', label: 'Estrategia', icon: Target },
        { id: 'tecnica', label: 'Técnica', icon: FileText },
        { id: 'inversion', label: 'Inversión', icon: CreditCard },
        { id: 'roadmap', label: 'Roadmap', icon: Calendar }
    ]

    return (
        <nav className="px-4 py-3 bg-card border-b border-border/50">
            <div className="flex items-center gap-1 overflow-x-auto no-scrollbar">
                {tabs.map(tab => {
                    const Icon = tab.icon
                    const isActive = activeTab === tab.id
                    return (
                        <button
                            key={tab.id}
                            onClick={() => onTabChange(tab.id)}
                            className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-[10px] font-black uppercase tracking-wider whitespace-nowrap transition-all shrink-0
                                ${isActive
                                    ? 'bg-primary text-primary-foreground shadow-lg shadow-primary/20'
                                    : 'text-muted-foreground hover:text-foreground hover:bg-secondary'
                                }`}
                        >
                            <Icon size={13} />
                            {tab.label}
                        </button>
                    )
                })}
            </div>
        </nav>
    )
}

/* ─────────── TAB 1: RESUMEN EJECUTIVO ─────────── */

function TabResumenEjecutivo({ opp, client, phases: phasesProp }: { opp: any; client: any; phases: any[] }) {
    const phases = phasesProp && phasesProp.length > 0 ? phasesProp : PHASES
    // DATA_API: opp.draft_jsonb.totalCalculated, opp.delivery_time_text, opp.revision_rounds, opp.dimension
    const investment = opp.draft_jsonb?.totalCalculated || FALLBACK_OPPORTUNITY.investment
    const timeline = opp.delivery_time_text || FALLBACK_OPPORTUNITY.timeline
    const revisions = opp.revision_rounds || FALLBACK_OPPORTUNITY.revision_rounds
    const dimension = opp.dimension || FALLBACK_OPPORTUNITY.dimension
    const dimensionLabel = dimension === 'landing' ? 'Landing Page' : dimension === 'website' ? 'Website' : 'Web App'

    // DATA_API: client.client_profile_jsonb.value_proposition, target_market, industry, business_model
    const profile = client?.client_profile_jsonb
    const valueProp = profile?.value_proposition || FALLBACK_CLIENT.value_proposition
    const targetMarket = profile?.target_market || FALLBACK_CLIENT.target_market
    const industry = profile?.industry || FALLBACK_CLIENT.industry
    const b2b = profile?.business_model || FALLBACK_CLIENT.business_model

    // DATA_API: client.client_insights_jsonb.initial_observations.key_finding
    const insights = client?.client_insights_jsonb
    const keyFinding = insights?.initial_observations?.key_finding || FALLBACK_INSIGHTS.key_finding

    const blockCount = opp.draft_jsonb?.blocks?.length || 0
    const kpis = [
        { label: 'Inversión Propuesta', value: formatCurrency(investment), icon: CreditCard, color: 'text-foreground' },
        { label: 'Tipo de Proyecto', value: `${dimensionLabel} (${blockCount} bloques)`, icon: Layers, color: 'text-foreground' }
    ]

    return (
        <div className="space-y-5 animate-in fade-in duration-300">
            {/* KPI Cards */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
                {kpis.map((kpi, i) => {
                    const Icon = kpi.icon
                    return (
                        <div key={i} className="bg-card rounded-2xl border border-border/50 p-4 hover:border-primary/30 hover:shadow-sm transition-all group">
                            <div className="flex items-center gap-2 mb-2">
                                <div className="p-1.5 rounded-lg bg-primary/10 group-hover:bg-primary/20 transition-colors">
                                    <Icon size={14} className="text-primary" />
                                </div>
                                <span className="text-[9px] font-black uppercase tracking-widest text-muted-foreground">{kpi.label}</span>
                            </div>
                            <p className={`text-lg font-black ${kpi.color} tracking-tight`}>{kpi.value}</p>
                        </div>
                    )
                })}
            </div>

            {/* Grid 60/40 */}
            <div className="grid grid-cols-1 lg:grid-cols-5 gap-4">
                {/* Propuesta de Valor — 60% */}
                <div className="lg:col-span-3 bg-card rounded-2xl border border-border/50 p-5">
                    <div className="flex items-center gap-2 mb-4">
                        <Zap size={16} className="text-primary" />
                        <h3 className="text-xs font-black uppercase tracking-tighter text-foreground">Propuesta de Valor</h3>
                    </div>
                    <p className="text-sm font-bold text-foreground/90 leading-relaxed mb-4">{valueProp}</p>
                    <div className="flex flex-wrap gap-2 mb-4">
                        <span className="px-2.5 py-1 rounded-full bg-secondary text-[10px] font-black uppercase tracking-wider text-muted-foreground">{industry}</span>
                        <span className="px-2.5 py-1 rounded-full bg-primary/20 text-[10px] font-black uppercase tracking-wider text-primary">{b2b}</span>
                    </div>
                    <p className="text-xs text-muted-foreground leading-relaxed">{targetMarket}</p>
                </div>

                {/* Hallazgo Principal — 40% */}
                <div className="lg:col-span-2 bg-card rounded-2xl border border-border/50 p-5 relative overflow-hidden">
                    <div className="absolute top-0 right-0 w-24 h-24 bg-destructive/5 rounded-full blur-2xl" />
                    <div className="flex items-center gap-2 mb-3">
                        <div className="p-1.5 rounded-lg bg-destructive/10">
                            <AlertTriangle size={16} className="text-destructive" />
                        </div>
                        <h3 className="text-xs font-black uppercase tracking-tighter text-foreground">Hallazgo Principal</h3>
                    </div>
                    <p className="text-xs font-medium text-muted-foreground leading-relaxed italic">&ldquo;{keyFinding}&rdquo;</p>
                    <div className="mt-4 flex items-center gap-1.5 text-[10px] font-bold text-primary hover:underline cursor-pointer">
                        <ChevronRight size={12} /> Ver diagnóstico completo
                    </div>
                </div>
            </div>

            {/* Barra de Progreso */}
            <div className="bg-card rounded-2xl border border-border/50 p-5">
                <div className="flex items-center gap-2 mb-4">
                    <Rocket size={16} className="text-primary" />
                    <h3 className="text-xs font-black uppercase tracking-tighter text-foreground">Progreso del Proyecto</h3>
                </div>
                <div className="flex items-center gap-2">
                    {phases.map((phase, i) => (
                        <div key={phase.id || phase.phase_key || i} className="flex-1 flex flex-col items-center gap-2">
                            <div className={`w-full h-2 rounded-full transition-all ${
                                phase.status === 'completed' || phase.status === 'approved' ? 'bg-emerald-500' :
                                phase.status === 'in_progress' || phase.status === 'in_review' ? 'bg-primary' : 'bg-secondary'
                            }`} />
                            <span className={`text-[9px] font-black uppercase tracking-wider text-center ${
                                phase.status === 'in_progress' || phase.status === 'in_review' ? 'text-primary' :
                                phase.status === 'completed' || phase.status === 'approved' ? 'text-emerald-500' : 'text-muted-foreground/40'
                            }`}>
                                {phase.phase_name || phase.label}
                            </span>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    )
}

/* ─────────── TAB 2: INTELIGENCIA DE MERCADO ─────────── */

function TabInteligenciaMercado({ client }: { client: any }) {
    // DATA_API: client.client_insights_jsonb
    const insights = client?.client_insights_jsonb
    const diagnosis = insights?.technical_conclusion?.diagnosis || FALLBACK_INSIGHTS.diagnosis
    const competitors = insights?.competitors_detected || FALLBACK_INSIGHTS.competitors
    const trends = insights?.market_notes?.length > 0
        ? insights.market_notes.map((n: any, i: number) => ({
            title: n.trend || FALLBACK_INSIGHTS.trends[i]?.title,
            impact: n.impact || FALLBACK_INSIGHTS.trends[i]?.impact,
            icon: FALLBACK_INSIGHTS.trends[i]?.icon || 'globe'
        }))
        : FALLBACK_INSIGHTS.trends
    const opportunities = insights?.technical_conclusion?.immediate_opportunities?.length > 0
        ? insights.technical_conclusion.immediate_opportunities.map((o: any) => ({ action: o.action, detail: o.detail }))
        : FALLBACK_INSIGHTS.opportunities

    const trendIcons: Record<string, any> = { globe: Globe, target: Target, shield: ShieldCheck, building: Building2, users: Users }

    return (
        <div className="space-y-5 animate-in fade-in duration-300">
            {/* Diagnóstico Técnico */}
            <div className="bg-card rounded-2xl border border-destructive/20 p-5 relative overflow-hidden">
                <div className="absolute top-0 right-0 w-32 h-32 bg-destructive/5 rounded-full blur-3xl" />
                <div className="flex items-start gap-3 relative z-10">
                    <div className="p-2 rounded-xl bg-destructive/10 shrink-0">
                        <AlertTriangle size={18} className="text-destructive" />
                    </div>
                    <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                            <h3 className="text-xs font-black uppercase tracking-tighter text-foreground">Diagnóstico Técnico</h3>
                            <span className="px-2 py-0.5 rounded-full bg-destructive/10 text-[10px] font-black uppercase tracking-wider text-destructive border border-destructive/20">
                                Crítico — Riesgo de irrelevancia digital
                            </span>
                        </div>
                        <p className="text-xs font-medium text-muted-foreground leading-relaxed">{diagnosis}</p>
                    </div>
                </div>
            </div>

            {/* Competidores */}
            <div className="bg-card rounded-2xl border border-border/50 p-5">
                <div className="flex items-center gap-2 mb-4">
                    <Users size={16} className="text-primary" />
                    <h3 className="text-xs font-black uppercase tracking-tighter text-foreground">Mapa de Competidores</h3>
                </div>
                <div className="overflow-x-auto">
                    <table className="w-full min-w-[500px]">
                        <thead>
                            <tr className="border-b border-border/50">
                                <th className="text-left text-[9px] font-black uppercase tracking-widest text-muted-foreground py-2 pr-4">Competidor</th>
                                <th className="text-left text-[9px] font-black uppercase tracking-widest text-muted-foreground py-2 pr-4">Segmento</th>
                                <th className="text-left text-[9px] font-black uppercase tracking-widest text-muted-foreground py-2 pr-4">Fortaleza Clave</th>
                            </tr>
                        </thead>
                        <tbody>
                            {competitors.map((c: any, i: number) => (
                                <tr key={i} className="border-b border-border/20 hover:bg-secondary/50 transition-colors">
                                    <td className="py-3 pr-4 text-xs font-bold text-foreground/90">{c.name}</td>
                                    <td className="py-3 pr-4">
                                        <span className={`inline-block px-2 py-0.5 rounded-full text-[9px] font-black uppercase tracking-wider border ${segmentColors[c.segment] || segmentColors.Medio}`}>
                                            {c.segment}
                                        </span>
                                    </td>
                                    <td className="py-3 pr-4 text-[11px] text-muted-foreground font-medium">{c.strength}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Tendencias */}
            <div>
                <div className="flex items-center gap-2 mb-3 px-1">
                    <TrendingUp size={16} className="text-primary" />
                    <h3 className="text-xs font-black uppercase tracking-tighter text-foreground">Tendencias del Mercado</h3>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                    {trends.map((t: any, i: number) => {
                        const IconComp = trendIcons[t.icon] || Globe
                        return (
                            <div key={i} className="bg-card rounded-2xl border border-border/50 p-4 hover:border-primary/50 hover:shadow-sm transition-all">
                                <div className="flex items-center gap-2 mb-2">
                                    <div className="p-1.5 rounded-lg bg-primary/10">
                                        <IconComp size={13} className="text-primary" />
                                    </div>
                                    <h4 className="text-[11px] font-black uppercase tracking-tight text-foreground/90">{t.title}</h4>
                                </div>
                                <p className="text-[11px] text-muted-foreground font-medium leading-relaxed">{t.impact}</p>
                            </div>
                        )
                    })}
                </div>
            </div>

            {/* Oportunidades */}
            <div className="bg-card rounded-2xl border border-border/50 p-5">
                <div className="flex items-center gap-2 mb-4">
                    <Lightbulb size={16} className="text-primary" />
                    <h3 className="text-xs font-black uppercase tracking-tighter text-foreground">Oportunidades Inmediatas</h3>
                </div>
                <div className="space-y-3">
                    {opportunities.map((o: any, i: number) => (
                        <div key={i} className="flex items-start gap-3 p-3 rounded-xl bg-secondary/30 border border-border/30">
                            <div className="mt-0.5 shrink-0 w-5 h-5 rounded-md border-2 border-emerald-500/50 bg-emerald-500/10 flex items-center justify-center">
                                <Check size={12} className="text-emerald-500" />
                            </div>
                            <div>
                                <p className="text-xs font-bold text-foreground/90">{o.action}</p>
                                <p className="text-[11px] text-muted-foreground font-medium leading-relaxed mt-0.5">{o.detail}</p>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    )
}

/* ─────────── TAB 3: ESTRATEGIA DIGITAL ─────────── */

function TabEstrategiaDigital({ opp, client }: { opp: any; client: any }) {
    // DATA_API: client.client_profile_jsonb.digital_presence
    const dp = client?.client_profile_jsonb?.digital_presence || FALLBACK_CLIENT.digital_presence

    const scores = [
        {
            label: 'Website',
            score: dp.website.quality === 'high' ? 8 : dp.website.quality === 'medium' ? 6 : dp.website.quality === 'low' ? 3 : 5,
            obs: dp.website.observations || 'Calidad media, sin blog'
        },
        {
            label: 'Social Media',
            score: dp.social.status === 'high' ? 8 : dp.social.status === 'moderate' ? 5 : dp.social.status === 'inactive' ? 2 : 3,
            obs: dp.social.observations || 'Inactiva, última pub 2025'
        },
        {
            label: 'SEO',
            score: dp.seo.status === 'advanced' ? 8 : dp.seo.status === 'basic' ? 4 : dp.seo.status === 'none' ? 1 : 3,
            obs: dp.seo.observations || 'Solo marca propia'
        },
        {
            label: 'Publicidad ADS',
            score: dp.ads.status === 'active' ? 8 : dp.ads.status === 'inactive' ? 2 : 0,
            obs: dp.ads.observations || 'Sin presencia publicitaria'
        }
    ]

    // DATA_API: opp.strategy_jsonb
    const strategy = opp.strategy_jsonb
    const headline = opp.portal_headline || 'Portal digital B2B para captación de leads cualificados'
    const subheadline = opp.portal_subheadline || 'Presencia web que refleje los 40+ años de experiencia operativa y genere confianza en grandes cuentas.'
    const keyMessage = strategy?.key_message || 'La limpieza y mantenimiento de tu infraestructura en manos de expertos con cuatro décadas de trayectoria.'
    const targetUser = strategy?.target_user || 'Gerentes de Facility, Jefes de compras B2B y Directores de Operaciones en retail, salud y corporativo.'
    const techValueProp = strategy?.value_proposition || 'Landing de alta conversión con mensaje sectorial, prueba social y CTA claro para solicitar cotización.'

    // DATA_API: opp.discovery_jsonb
    const discovery = opp.discovery_jsonb
    const painPoint = discovery?.pain_points?.[0]?.problem || 'Invisibilidad digital frente a competidores con presencia activa'
    const urgency = discovery?.urgency || 'Alta — perdiendo RFPs por falta de presencia web profesional'
    const decisionMaker = discovery?.decision_maker || 'Pendiente de definir'

    return (
        <div className="space-y-5 animate-in fade-in duration-300">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                {/* Estado Actual */}
                <div className="bg-card rounded-2xl border border-border/50 p-5">
                    <div className="flex items-center gap-2 mb-4">
                        <Search size={16} className="text-primary" />
                        <h3 className="text-xs font-black uppercase tracking-tighter text-foreground">Estado Digital Actual</h3>
                    </div>
                    <div className="space-y-4">
                        {scores.map((s, i) => (
                            <div key={i}>
                                <div className="flex items-center justify-between mb-1.5">
                                    <span className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">{s.label}</span>
                                    <span className="text-[10px] font-black text-muted-foreground/60">{s.score}/10 — {scoreLabel(s.score)}</span>
                                </div>
                                <div className="h-2 w-full bg-secondary rounded-full overflow-hidden">
                                    <div className={`h-full rounded-full ${scoreColor(s.score)}`} style={{ width: `${s.score * 10}%` }} />
                                </div>
                                <p className="mt-1 text-[10px] text-muted-foreground/60 font-medium">{s.obs}</p>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Dirección Propuesta */}
                <div className="bg-card rounded-2xl border border-border/50 p-5">
                    <div className="flex items-center gap-2 mb-4">
                        <Target size={16} className="text-primary" />
                        <h3 className="text-xs font-black uppercase tracking-tighter text-foreground">Dirección Propuesta</h3>
                    </div>
                    <div className="space-y-3">
                        {[
                            { label: 'Usuario Objetivo', value: targetUser },
                            { label: 'Propuesta de Valor Técnica', value: techValueProp }
                        ].map((field, i) => (
                            <div key={i}>
                                <label className="block text-[9px] font-black uppercase tracking-widest text-muted-foreground mb-1">{field.label}</label>
                                <div className="w-full rounded-xl border border-border/50 bg-background/50 px-3 py-2.5 text-xs font-bold text-foreground/90">
                                    {field.value}
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {/* Grid 2 cols: Dolor, Urgencia */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {[
                    { title: 'Punto de Dolor', value: painPoint, icon: AlertCircle },
                    { title: 'Urgencia', value: urgency, icon: Clock }
                ].map((item, i) => {
                    const Icon = item.icon
                    const isPending = item.value.toLowerCase().includes('pendiente') || item.value.toLowerCase().includes('definir')
                    return (
                        <div key={i} className="bg-card rounded-2xl border border-border/50 p-4">
                            <div className="flex items-center gap-2 mb-2">
                                <Icon size={14} className="text-muted-foreground/60" />
                                <h4 className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">{item.title}</h4>
                            </div>
                            <p className={`text-xs font-bold leading-relaxed ${isPending ? 'text-muted-foreground/40' : 'text-foreground/90'}`}>
                                {item.value}
                            </p>
                            {isPending && (
                                <span className="inline-block mt-2 px-2 py-0.5 rounded-md bg-secondary text-[9px] font-black uppercase tracking-wider text-muted-foreground/40">
                                    Pendiente de definir
                                </span>
                            )}
                        </div>
                    )
                })}
            </div>
        </div>
    )
}

/* ─────────── TAB 4: PROPUESTA TÉCNICA ─────────── */

function TabPropuestaTecnica({ opp, catalog, phases: realPhases = [] }: { opp: any; catalog: CatalogItem[]; phases?: any[] }) {
    // DATA_API: opp.draft_jsonb.blocks + catalog para precios y nombres
    const draft = opp.draft_jsonb
    const blocks = draft?.blocks?.length > 0
        ? draft.blocks.map((b: any, i: number) => {
            const item = catalog.find((c: CatalogItem) => c.id === (opp.dimension === 'landing' ? b.complexity_id : b.catalog_item_id))
            const isComplex = b.complexity_id !== null && b.complexity_id !== b.catalog_item_id
            const price = item?.base_price_pen || FALLBACK_OPPORTUNITY.blocks[i]?.price || 120
            return {
                name: b.name || FALLBACK_OPPORTUNITY.blocks[i]?.name || `Bloque ${i + 1}`,
                complexity: isComplex ? 'Complejo' : 'Base',
                price,
                isComplex
            }
        })
        : FALLBACK_OPPORTUNITY.blocks

    // DATA_API: opp.draft_jsonb.selectedModules
    const modules = draft?.selectedModules?.length > 0
        ? draft.selectedModules.map((sm: any) => {
            const item = catalog.find((c: CatalogItem) => c.id === sm.id)
            return { 
                name: item?.name || sm.comment || 'Módulo', 
                active: true,
                price: item?.base_price_pen || 0
            }
        })
        : FALLBACK_OPPORTUNITY.modules.map(m => ({ ...m, price: 0 }))

    // DATA_API: opp.not_included
    const exclusions = opp.not_included
        ? opp.not_included.split('\n').filter((l: string) => l.trim())
        : FALLBACK_OPPORTUNITY.exclusions

    return (
        <div className="space-y-5 animate-in fade-in duration-300">
            {/* Alcance del Proyecto */}
            <div className="bg-card rounded-2xl border border-border/50 p-5">
                <div className="flex items-center gap-2 mb-4">
                    <Layers size={16} className="text-primary" />
                    <h3 className="text-xs font-black uppercase tracking-tighter text-foreground">Alcance del Proyecto</h3>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                    {blocks.map((b: any, i: number) => (
                        <div key={i} className={`rounded-xl border p-4 transition-all hover:shadow-sm ${
                            b.isComplex ? 'border-primary/40 bg-primary/5' : 'border-border/50 bg-secondary/30'
                        }`}>
                            <div className="flex items-center justify-between mb-2">
                                <span className="text-xs font-black text-foreground/90">{b.name}</span>
                                {b.isComplex && (
                                    <span className="px-1.5 py-0.5 rounded-md bg-primary/20 text-[9px] font-black uppercase tracking-wider text-primary">
                                        +40%
                                    </span>
                                )}
                            </div>
                            <div className="flex items-center justify-between">
                                <span className={`text-[10px] font-bold uppercase tracking-wider ${b.isComplex ? 'text-primary' : 'text-muted-foreground/40'}`}>
                                    {b.complexity}
                                </span>
                                <span className="text-sm font-black text-foreground">{formatCurrency(b.price)}</span>
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                {/* Módulos Adicionales */}
                <div className="bg-card rounded-2xl border border-border/50 p-5">
                    <div className="flex items-center gap-2 mb-4">
                        <CheckCircle2 size={16} className="text-primary" />
                        <h3 className="text-xs font-black uppercase tracking-tighter text-foreground">Módulos Activos</h3>
                    </div>
                    <div className="space-y-2">
                        {modules.map((m: any, i: number) => (
                            <div key={i} className="flex items-center justify-between py-2 border-b border-border/20 last:border-0">
                                <div>
                                    <p className="text-xs font-bold text-foreground/80">{m.name}</p>
                                    {m.price > 0 && <p className="text-[9px] text-muted-foreground/60 font-mono">Inversión única</p>}
                                </div>
                                <div className="flex items-center gap-3">
                                    {m.price > 0 && <span className="text-[11px] font-black text-foreground/70">{formatCurrency(m.price)}</span>}
                                    {m.active && <CheckCircle2 size={14} className="text-emerald-500" />}
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Lo que NO incluye */}
                <div className="bg-secondary rounded-2xl border border-border/50 p-5">
                    <div className="flex items-center gap-2 mb-4">
                        <XCircle size={16} className="text-muted-foreground/60" />
                        <h3 className="text-xs font-black uppercase tracking-tighter text-muted-foreground">Lo que NO incluye</h3>
                    </div>
                    <div className="space-y-2">
                        {exclusions.map((ex: string, i: number) => (
                            <div key={i} className="flex items-start gap-2">
                                <div className="mt-1 w-1 h-1 rounded-full bg-border shrink-0" />
                                <p className="text-[11px] text-muted-foreground font-medium leading-relaxed">{ex}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {/* Timeline Vertical de Fases */}
            <div className="bg-card rounded-2xl border border-border/50 p-5">
                <div className="flex items-center gap-2 mb-5">
                    <Clock size={16} className="text-primary" />
                    <h3 className="text-xs font-black uppercase tracking-tighter text-foreground">Fases del Proyecto</h3>
                </div>
                <div className="space-y-0">
                    {(() => {
                        const phases = realPhases.length > 0
                            ? realPhases.map((p: any) => ({
                                name: p.phase_name,
                                revisions: p.revision_limit,
                                date: p.planned_start_date ? `${formatDateShort(p.planned_start_date)} → ${formatDateShort(p.planned_end_date)}` : 'Pendiente',
                                status: p.status || 'planned',
                                requiresApproval: p.requires_client_approval,
                            }))
                            : TECH_PHASES.map((p, idx) => ({
                                ...p,
                                status: idx === 0 ? 'pending' as const : 'locked' as const,
                                requiresApproval: false,
                            }))
                        return phases.map((phase: any, i: number, arr: any[]) => {
                            const isPending = phase.status === 'pending' || phase.status === 'planned'
                            const isDone = phase.status === 'completed' || phase.status === 'approved'
                            const isActive = phase.status === 'in_progress' || phase.status === 'in_review'
                            const isLocked = phase.status === 'locked' || (!isDone && !isActive && !isPending)
                            
                            return (
                                <div key={i} className="flex gap-4">
                                    <div className="flex flex-col items-center">
                                        <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 ${
                                            isDone ? 'bg-emerald-500 text-white' :
                                            isActive ? 'bg-primary text-primary-foreground' :
                                            'bg-secondary text-muted-foreground/40'
                                        }`}>
                                            {isDone ? <Check size={12} /> : isLocked ? <Lock size={12} /> : <Unlock size={12} />}
                                        </div>
                                        {i < arr.length - 1 && (
                                            <div className={`w-px flex-1 ${isDone ? 'bg-emerald-500/50' : 'bg-border'} my-1`} />
                                        )}
                                    </div>
                                    <div className={`pb-5 flex-1 ${isLocked ? 'opacity-50' : ''}`}>
                                        <div className="flex items-center justify-between">
                                            <h4 className="text-xs font-black text-foreground/90">{phase.name}</h4>
                                            <span className="text-[10px] font-bold text-muted-foreground/60">{phase.date}</span>
                                        </div>
                                        <div className="flex items-center gap-3 mt-1">
                                            <span className="text-[10px] text-muted-foreground/60 font-medium">{phase.revisions} revisión{phase.revisions > 1 ? 'es' : ''} incluida</span>
                                            {phase.requiresApproval && (
                                                <span className="text-[9px] font-black uppercase tracking-wider px-1.5 py-0.5 rounded bg-primary/15 text-primary">
                                                    Aprobación cliente
                                                </span>
                                            )}
                                            <span className={`text-[9px] font-black uppercase tracking-wider px-1.5 py-0.5 rounded ${
                                                isDone ? 'bg-emerald-500/20 text-emerald-500' :
                                                isActive ? 'bg-primary/20 text-primary' :
                                                'bg-secondary text-muted-foreground/40'
                                            }`}>
                                                {isDone ? 'Completado' : isActive ? 'En Curso' : 'Pendiente'}
                                            </span>
                                        </div>
                                    </div>
                                </div>
                            )
                        })
                    })()}
                </div>
            </div>
        </div>
    )
}

/* ─────────── TAB 5: INVERSIÓN ─────────── */

function TabInversion({ opp, catalog }: { opp: any; catalog: any[] }) {
    // DATA_API: opp.draft_jsonb totalCapex (desarrollo), totalOpex (suscripción), discount_applied
    const draft = opp.draft_jsonb
    const model = draft?.infrastructureModel || 'internal'
    const totalCapex = draft?.totalCapex || FALLBACK_OPPORTUNITY.totalCapex
    const infraCapex = draft?.totalInfraCapex || 0
    const softwareCapex = totalCapex - infraCapex

    const opex = model === 'internal' ? (draft?.totalOpex || 0) : 0
    const domainItem = catalog?.find(item => 
        item.category === 'domain' || 
        item.category === 'hosting_external' || 
        item.name?.toLowerCase().includes('dominio')
    )
    const domainPrice = domainItem?.base_price_pen || 40

    // Si es externo, el dominio se paga aparte y no entra en el CAPEX de desarrollo
    const displayInfraCapex = infraCapex > 0 ? infraCapex : 0
    const displayTotalCapex = softwareCapex + displayInfraCapex


    const discountPct = opp.discount_applied || 0
    const discountAmount = Math.round(displayTotalCapex * discountPct / 100)
    const subtotal = displayTotalCapex - discountAmount
    const igv = Math.round(subtotal * 0.18)
    const finalTotal = subtotal + igv

    const fin = opp.financials_jsonb || {}
    const roi = fin.roi_estimate || FALLBACK_OPPORTUNITY.roi_estimate
    const revenue = fin.revenue_potential || FALLBACK_OPPORTUNITY.revenue_potential
    const terms = fin.payment_terms || FALLBACK_OPPORTUNITY.payment_terms

    return (
        <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
            {/* Header Inversión */}
            <div className="bg-card rounded-3xl border border-border/50 p-8 shadow-sm overflow-hidden relative">
                <div className="absolute top-0 right-0 w-64 h-64 bg-primary/5 rounded-full blur-3xl -mr-32 -mt-32 opacity-50" />
                <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 relative z-10">
                    <div>
                        <h3 className="text-[10px] font-black uppercase tracking-[0.25em] text-muted-foreground mb-2">Presupuesto de Inversión</h3>
                        <div className="flex items-baseline gap-2">
                            <span className="text-5xl font-black text-foreground tracking-tighter">
                                {formatCurrency(finalTotal)}
                            </span>
                            <span className="text-sm font-bold text-muted-foreground/60 uppercase tracking-widest">S/ IGV</span>
                        </div>
                        <p className="text-[10px] font-bold text-muted-foreground/60 mt-2 uppercase tracking-widest">Pago único por concepto de desarrollo e infraestructura inicial</p>
                    </div>

                    <div className="h-px md:h-12 w-full md:w-px bg-border/50" />

                    <div>
                        <div className="flex items-center gap-2 mb-1">
                            <Clock size={14} className="text-primary" />
                            <span className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Tiempo de Entrega</span>
                        </div>
                        <p className="text-xl font-black text-foreground italic">
                            {opp.delivery_time_text || '25 - 35 días hábiles'}
                        </p>
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Desglose Detallado */}
                <div className="bg-card rounded-3xl border border-border/50 p-6 space-y-6">
                    <div className="flex items-center gap-2">
                        <div className="p-2 rounded-xl bg-foreground text-background">
                            <Code2 size={16} />
                        </div>
                        <h4 className="text-xs font-black uppercase tracking-widest text-foreground">Conceptos de Inversión</h4>
                    </div>

                    <div className="space-y-4">
                        {/* Listado Detallado de Bloques y Módulos */}
                        {(() => {
                            const blocks = draft?.blocks?.map((b: any, i: number) => {
                                const item = catalog?.find((c: any) => c.id === (opp.dimension === 'landing' ? b.complexity_id : b.catalog_item_id))
                                return { name: b.name || `Bloque ${i+1}`, price: item?.base_price_pen || 0, type: 'Bloque' }
                            }) || []
                            
                            const modules = draft?.selectedModules?.map((sm: any) => {
                                const item = catalog?.find((c: any) => c.id === sm.id)
                                return { name: item?.name || 'Módulo', price: item?.base_price_pen || 0, type: 'Módulo' }
                            }) || []

                            const allItems = [...blocks, ...modules]

                            if (allItems.length === 0) {
                                return (
                                    <div className="flex items-center justify-between py-2 border-b border-border/20">
                                        <div>
                                            <p className="text-[10px] font-black uppercase text-foreground/90">Desarrollo de Software</p>
                                            <p className="text-[9px] font-medium text-muted-foreground/60">Implementación de módulos Aura OS y lógica de negocio.</p>
                                        </div>
                                        <span className="text-sm font-black text-foreground">{formatCurrency(softwareCapex)}</span>
                                    </div>
                                )
                            }

                            return allItems.map((item, idx) => (
                                <div key={idx} className="flex items-center justify-between py-2 border-b border-border/20 last:border-0">
                                    <div>
                                        <p className="text-[10px] font-black uppercase text-foreground/90">{item.name}</p>
                                        <p className="text-[8px] font-bold text-muted-foreground/40 uppercase tracking-widest">{item.type}</p>
                                    </div>
                                    <span className="text-[11px] font-black text-foreground">{formatCurrency(item.price)}</span>
                                </div>
                            ))
                        })()}

                        {/* Infraestructura (Solo si no es external o si hay costos de aprovisionamiento) */}
                        {infraCapex > 0 && (
                            <div className="flex items-center justify-between py-2 border-b border-border/20">
                                <div>
                                    <p className="text-[10px] font-black uppercase text-foreground/90">Infraestructura & Servidor</p>
                                    <p className="text-[9px] font-medium text-muted-foreground/60">Aprovisionamiento de infraestructura optimizada.</p>
                                </div>
                                <div className="text-right">
                                    <span className="text-sm font-black text-foreground">{formatCurrency(infraCapex)}</span>
                                    <p className="text-[8px] font-bold text-muted-foreground/40 uppercase tracking-tighter">Pago Inicial</p>
                                </div>
                            </div>
                        )}

                        <div className="space-y-2 pt-4">
                            <div className="flex justify-between items-center text-[10px] font-black text-muted-foreground/60 uppercase tracking-wider">
                                <span>Subtotal</span>
                                <span>{formatCurrency(displayTotalCapex)}</span>
                            </div>
                            {discountPct > 0 && (
                                <div className="flex justify-between items-center text-[10px] font-black text-emerald-500 uppercase tracking-wider bg-emerald-500/10 px-3 py-1.5 rounded-lg border border-emerald-500/20">
                                    <span>Descuento aplicado ({discountPct}%)</span>
                                    <span>- {formatCurrency(discountAmount)}</span>
                                </div>
                            )}
                            <div className="flex justify-between items-center text-[10px] font-black text-muted-foreground/60 uppercase tracking-wider">
                                <span>IGV (18%)</span>
                                <span>{formatCurrency(igv)}</span>
                            </div>
                        </div>

                        <div className="h-px bg-border/20 my-2" />

                        <div className="flex justify-between items-center">
                            <div>
                                <span className="text-[10px] font-black text-foreground uppercase tracking-widest block">Inversión Final</span>
                                <span className="text-[8px] font-bold text-muted-foreground/40 uppercase">Incluye garantía técnica</span>
                            </div>
                            <span className="text-2xl font-black text-primary tracking-tighter italic">{formatCurrency(finalTotal)}</span>
                        </div>
                    </div>
                </div>

                {/* Modelo de Operación (OPEX) */}
                <div className="flex flex-col gap-6">
                    <div className={`rounded-3xl p-6 flex-1 flex flex-col transition-all border ${
                        model === 'internal' 
                            ? 'bg-foreground text-background border-foreground shadow-xl' 
                            : 'bg-card border-border/50'
                    }`}>
                        <div className="flex items-center justify-between mb-6">
                            <div className="flex items-center gap-2">
                                <div className={`p-2 rounded-xl ${model === 'internal' ? 'bg-primary/20 text-primary' : 'bg-secondary text-muted-foreground/60'}`}>
                                    <Zap size={16} />
                                </div>
                                <h4 className={`text-xs font-black uppercase tracking-widest ${model === 'internal' ? 'text-background' : 'text-foreground'}`}>
                                    Suscripción & Soporte
                                </h4>
                            </div>
                            <div className={`px-2 py-0.5 rounded text-[9px] font-black uppercase tracking-widest border ${
                                model === 'internal' 
                                    ? 'bg-primary/20 text-primary border-primary/30' 
                                    : 'bg-secondary text-muted-foreground/40 border-border/30'
                            }`}>
                                {model === 'internal' ? 'Plan Premium' : 'Gestión Externa'}
                            </div>
                        </div>

                        {model === 'internal' ? (
                            <div className="space-y-6 flex-1 flex flex-col justify-between">
                                <div className="space-y-3">
                                    {[
                                        'Alojamiento en nuestro servidor optimizado',
                                        'Gestión y pago de dominio incluido (anual)',
                                        'Resolución inmediata de errores técnicos',
                                        'Monitoreo proactivo de estabilidad',
                                        'Actualizaciones de seguridad constantes'
                                    ].map((b, i) => (
                                        <div key={i} className="flex items-center gap-3 text-[11px] font-medium opacity-80">
                                            <div className="w-1.5 h-1.5 rounded-full bg-primary" />
                                            {b}
                                        </div>
                                    ))}
                                </div>
                                <div className="pt-6 border-t border-background/10 flex justify-between items-end">
                                    <span className="text-[10px] font-black uppercase tracking-widest opacity-60">Suscripción Mensual</span>
                                    <div className="text-right">
                                        <p className="text-3xl font-black text-primary tracking-tighter italic leading-none">{formatCurrency(opex)}</p>
                                        <p className="text-[9px] font-bold opacity-60 uppercase mt-1">S/ IGV</p>
                                    </div>
                                </div>
                            </div>
                        ) : (
                            <div className="space-y-6 flex-1 flex flex-col justify-between">
                                <div className="space-y-3">
                                    <p className="text-[11px] text-muted-foreground/60 font-medium leading-relaxed">
                                        • El cliente asume la responsabilidad de su servidor.<br/>
                                        • Los pagos de dominio y hosting son externos.<br/>
                                        • Soporte técnico reactivo (tiempos de respuesta estándar).
                                    </p>
                                    <div className="p-3 rounded-xl bg-background/50 border border-border/30">
                                        <p className="text-[10px] text-muted-foreground/40 font-medium leading-relaxed italic">
                                            "Al alojarlo externamente, Fortex no interviene en caídas de servidor del proveedor tercero."
                                        </p>
                                    </div>
                                </div>
                                <div className="pt-6 border-t border-border/20 flex justify-between items-end">
                                    <span className="text-[10px] font-black uppercase tracking-widest text-muted-foreground/40">Mantenimiento Dominio</span>
                                    <div className="text-right">
                                        <p className="text-3xl font-black text-primary tracking-tighter italic leading-none">{formatCurrency(domainPrice)}</p>
                                        <p className="text-[9px] font-bold text-muted-foreground/40 uppercase mt-1">Pago Anual</p>
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* Resumen Financiero & Notas */}
            <div className="space-y-6">
                <div className="bg-card rounded-3xl border border-border/50 p-6 space-y-4">
                    <div className="flex items-center gap-2">
                        <div className="p-2 rounded-xl bg-primary/15 text-primary">
                            <BarChart3 size={16} />
                        </div>
                        <h4 className="text-xs font-black uppercase tracking-widest text-foreground">Proyección Financiera</h4>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                        <div className="p-4 rounded-2xl bg-secondary/50 border border-border/30">
                            <span className="text-[9px] font-black uppercase tracking-widest text-muted-foreground/40">ROI Estimado</span>
                            <p className="text-sm font-black text-foreground/90 mt-1">{roi}</p>
                        </div>
                        <div className="p-4 rounded-2xl bg-secondary/50 border border-border/30">
                            <span className="text-[9px] font-black uppercase tracking-widest text-muted-foreground/40">Potencial Revenue</span>
                            <p className="text-sm font-black text-foreground/90 mt-1">{revenue}</p>
                        </div>
                    </div>
                    <div className="p-4 rounded-2xl bg-primary/10 border border-primary/20">
                        <span className="text-[9px] font-black uppercase tracking-widest text-primary">Condiciones de Pago</span>
                        <p className="text-[11px] font-bold text-foreground/80 mt-1 leading-relaxed">{terms}</p>
                    </div>
                </div>

                {/* Notas */}
                {opp.meeting_notes && (
                    <div className="bg-card rounded-3xl border border-border/50 p-6">
                        <div className="flex items-center gap-2 mb-4">
                            <MessageSquare size={16} className="text-muted-foreground/40" />
                            <h4 className="text-xs font-black uppercase tracking-widest text-muted-foreground/40">Notas Estratégicas</h4>
                        </div>
                        <blockquote className="border-l-4 border-primary pl-4 py-1">
                            <p className="text-xs text-muted-foreground font-medium italic leading-relaxed">
                                &ldquo;{opp.meeting_notes}&rdquo;
                            </p>
                        </blockquote>
                    </div>
                )}
            </div>
        </div>
    )
}

/* ─────────── TAB 6: ROADMAP ─────────── */

function TabRoadmap({ opp, realPhases, hasRealPhases }: { opp: any, realPhases: any[], hasRealPhases: boolean }) {
    const phases = realPhases



    const phaseIcon = (key: string) => {
        if (key.includes('discovery')) return Search
        if (key.includes('wireframe')) return Layers
        if (key.includes('design') || key.includes('diseno')) return Target
        if (key.includes('develop') || key.includes('desarrollo')) return Code2
        if (key.includes('qa') || key.includes('review')) return TestTube2
        if (key.includes('launch') || key.includes('live')) return Rocket
        return Calendar
    }

    return (
        <div className="space-y-5 animate-in fade-in duration-300">
            <div className="bg-card rounded-2xl border border-border/50 p-5">
                <div className="flex items-center gap-2 mb-6">
                    <Calendar size={16} className="text-primary" />
                    <h3 className="text-xs font-black uppercase tracking-tighter text-foreground">Cronograma del Proyecto</h3>
                </div>

                {hasRealPhases ? (
                    <div className="space-y-0">
                        {phases.map((phase: any, i: number) => {
                            const Icon = phaseIcon(phase.phase_key)
                            const isLast = i === phases.length - 1
                            const dateRange = `${formatDateShort(phase.planned_start_date)} – ${formatDateShort(phase.planned_end_date)}`
                            
                            const isDone = phase.status === 'completed' || phase.status === 'approved'
                            const isActive = phase.status === 'in_progress' || phase.status === 'in_review'
                            const isPending = !isDone && !isActive

                            return (
                                <div key={phase.phase_key || i} className="flex gap-4">
                                    <div className="flex flex-col items-center">
                                        <div className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 ring-4 transition-all ${
                                            isDone ? 'bg-emerald-500 text-white ring-emerald-500/20' :
                                            isActive ? 'bg-primary text-primary-foreground ring-primary/20' :
                                            'bg-secondary text-muted-foreground/40 ring-secondary/50'
                                        }`}>
                                            <Icon size={16} />
                                        </div>
                                        {!isLast && (
                                            <div className={`w-0.5 flex-1 my-1 ${isDone ? 'bg-emerald-500/40' : 'bg-border'}`} />
                                        )}
                                    </div>
                                    <div className="pb-6 flex-1">
                                        <div className="flex items-center gap-2 mb-1">
                                            <span className={`text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded-full ${
                                                isDone ? 'bg-emerald-500/10 text-emerald-500' :
                                                isActive ? 'bg-primary/20 text-primary' :
                                                'bg-secondary text-muted-foreground/40'
                                            }`}>
                                                {isDone ? 'Completado' : isActive ? 'En Curso' : 'Pendiente'}
                                            </span>
                                            <span className="text-[10px] font-bold text-muted-foreground/40">{dateRange}</span>
                                        </div>
                                        <h4 className="text-sm font-black text-foreground/90">{phase.phase_name}</h4>
                                        <div className="flex items-center gap-3 mt-1">
                                            <span className="text-xs text-muted-foreground/60 font-medium">
                                                {phase.duration_days} día{phase.duration_days !== 1 ? 's' : ''}
                                            </span>
                                            <span className="text-xs text-muted-foreground/40">·</span>
                                            <span className="text-xs text-muted-foreground/60 font-medium">
                                                {phase.revision_limit} revisión{phase.revision_limit !== 1 ? 'es' : ''}
                                            </span>
                                            {phase.requires_client_approval && (
                                                <>
                                                    <span className="text-xs text-muted-foreground/40">·</span>
                                                    <span className="text-[10px] font-black uppercase tracking-wider px-1.5 py-0.5 rounded bg-primary/20 text-primary">
                                                        Requiere aprobación
                                                    </span>
                                                </>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            )
                        })}
                    </div>
                ) : (
                    <div className="space-y-0">
                        {ROADMAP_ITEMS.map((item, i) => {
                            const Icon = item.icon
                            const isPast = item.phase === 'past'
                            const isPresent = item.phase === 'present'
                            const isFuture = item.phase === 'future'

                            return (
                                <div key={i} className="flex gap-4">
                                    <div className="flex flex-col items-center">
                                        <div className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 transition-all ${
                                            isPast ? 'bg-emerald-500 text-white' :
                                            isPresent ? 'bg-primary text-primary-foreground ring-4 ring-primary/20' :
                                            'bg-secondary text-muted-foreground/40'
                                        }`}>
                                            <Icon size={16} />
                                        </div>
                                        {i < ROADMAP_ITEMS.length - 1 && (
                                            <div className={`w-0.5 flex-1 my-1 ${isPast ? 'bg-emerald-500/40' : 'bg-border'}`} />
                                        )}
                                    </div>
                                    <div className={`pb-6 flex-1 ${isFuture ? 'opacity-50' : ''}`}>
                                        <div className="flex items-center gap-2 mb-1">
                                            <span className={`text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded-full ${
                                                isPast ? 'bg-emerald-500/10 text-emerald-500' :
                                                isPresent ? 'bg-primary/20 text-primary' :
                                                'bg-secondary text-muted-foreground/40'
                                            }`}>
                                                {isPast ? 'Completado' : isPresent ? 'En curso' : 'Pendiente'}
                                            </span>
                                            <span className="text-[10px] font-bold text-muted-foreground/40">{item.date}</span>
                                        </div>
                                        <h4 className="text-sm font-black text-foreground/90">{item.title}</h4>
                                        <p className="text-xs text-muted-foreground/60 font-medium leading-relaxed mt-1">{item.description}</p>
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

/* ═══════════════════════════════════════════════════════════════
   COMPONENTE PRINCIPAL
   ═══════════════════════════════════════════════════════════════ */

export function ClientPortalView({ opportunity, client, catalog, phases: phasesProp, mode = 'desktop', activeTab: externalTab, onTabChange, hideHeader = false, onApproveProposal }: Props) {
    const [internalTab, setInternalTab] = useState<TabId>('resumen')
    
    const activeTab = externalTab || internalTab
    const setActiveTab = (tab: TabId) => {
        if (onTabChange) {
            onTabChange(tab)
        } else {
            setInternalTab(tab)
        }
    }

    // Usar datos reales o fallbacks
    const opp = opportunity || (FALLBACK_OPPORTUNITY as any)
    const status = opp.status || 'discovery'
    
    // Normalizar fases: si vienen por prop (proyectos), usarlas. Si no, usar las del JSONB (oportunidades).
    const realPhases = phasesProp || opp.phases_plan_jsonb || []
    const hasRealPhases = realPhases.length > 0

    return (
        <div className={`w-full mx-auto bg-background min-h-screen text-foreground transition-all duration-500 overflow-hidden ${
            mode === 'mobile' ? 'max-w-[375px] shadow-2xl rounded-[40px] border-[8px] border-foreground' : 'w-full shadow-lg'
        }`}>

            {/* Virtual browser header (solo desktop y si no se oculta el header real) */}
            {mode === 'desktop' && !hideHeader && (
                <div className="h-8 bg-secondary/50 border-b border-border/50 flex items-center px-4 gap-2">
                    <div className="flex gap-1.5">
                        <div className="w-2.5 h-2.5 rounded-full bg-slate-300" />
                        <div className="w-2.5 h-2.5 rounded-full bg-slate-300" />
                        <div className="w-2.5 h-2.5 rounded-full bg-slate-300" />
                    </div>
                </div>
            )}

            {/* Header Sticky del Portal (solo si no se oculta) */}
            {!hideHeader && <DashboardHeader opp={opp} client={client} status={status} onApprove={onApproveProposal} />}

            {/* Navegación por Tabs */}
            <TabNavigation activeTab={activeTab} onTabChange={setActiveTab} />

            {/* Contenido del Tab Activo */}
            <main className="px-4 py-5">
                {activeTab === 'resumen' && <TabResumenEjecutivo opp={opp} client={client} phases={realPhases} />}
                {activeTab === 'inteligencia' && <TabInteligenciaMercado client={client} />}
                {activeTab === 'estrategia' && <TabEstrategiaDigital opp={opp} client={client} />}
                {activeTab === 'tecnica' && <TabPropuestaTecnica opp={opp} catalog={catalog} phases={realPhases} />}
                {activeTab === 'inversion' && <TabInversion opp={opp} catalog={catalog} />}
                {activeTab === 'roadmap' && <TabRoadmap opp={opp} realPhases={realPhases} hasRealPhases={hasRealPhases} />}
            </main>

            {/* Footer */}
            <footer className="px-4 py-6 border-t border-border/50 bg-card text-center">
                <p className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground/40">© FORTEX DIGITAL SOLUTIONS • AURA OS v2.0</p>
                <p className="text-[9px] text-muted-foreground/40 mt-1 font-medium">Portal estratégico confidencial</p>
            </footer>

            <style jsx global>{`
                .no-scrollbar::-webkit-scrollbar { display: none; }
                .no-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
            `}</style>
        </div>
    )
}
