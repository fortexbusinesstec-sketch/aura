'use client'

import React from 'react'
import { Opportunity, CatalogItem } from '@/types'
import {
    CheckCircle2,
    ArrowRight,
    Zap,
    ShieldCheck,
    Clock,
    Target,
    BarChart3,
    FileText,
    Building2,
    Users,
    Lightbulb,
    Globe
} from 'lucide-react'

interface Props {
    opportunity: Partial<Opportunity>
    catalog: CatalogItem[]
    mode?: 'desktop' | 'mobile'
}

export function ClientPortalView({ opportunity, catalog, mode = 'desktop' }: Props) {
    const client = opportunity.client
    const profile = client?.client_profile_jsonb
    const insights = client?.client_insights_jsonb
    const draft = opportunity.draft_jsonb
    const strategy = opportunity.strategy_jsonb

    // Fallback content
    const headline = opportunity.portal_headline || `Propuesta Estratégica Aura OS`
    const subheadline = opportunity.portal_subheadline || `Solución de alto rendimiento para ${client?.razon_social || 'su empresa'}`

    const getCatalogItem = (id: string | null) => catalog.find(i => i.id === id)

    // Helper for list conversion (nl2br equivalent)
    const renderList = (text: string | null) => {
        if (!text) return null
        return text.split('\n').filter(t => t.trim()).map((t, i) => (
            <div key={i} className="flex items-start gap-3 mb-4">
                <div className="mt-1.5 h-1.5 w-1.5 rounded-full bg-primary shrink-0" />
                <p className="text-sm leading-relaxed text-slate-600">{t}</p>
            </div>
        ))
    }

    return (
        <div className={`w-full mx-auto bg-white min-h-screen text-slate-900 transition-all duration-500 overflow-hidden ${mode === 'mobile' ? 'max-w-[375px] shadow-2xl rounded-[40px] border-[8px] border-slate-800' : 'w-full shadow-lg'}`}>

            {/* VIRTUAL BROWSER HEADER */}
            {mode === 'desktop' && (
                <div className="h-10 bg-slate-100 border-b flex items-center px-4 gap-2">
                    <div className="flex gap-1.5">
                        <div className="w-3 h-3 rounded-full bg-slate-300" />
                        <div className="w-3 h-3 rounded-full bg-slate-300" />
                        <div className="w-3 h-3 rounded-full bg-slate-300" />
                    </div>
                </div>
            )}

            {/* NAVBAR */}
            <nav className="p-6 flex items-center justify-between border-b border-slate-100 sticky top-0 bg-white/80 backdrop-blur-md z-10">
                <div className="flex items-center gap-2">
                    <div className="w-8 h-8 bg-slate-900 rounded-lg flex items-center justify-center">
                        <span className="text-white font-black text-xs">FX</span>
                    </div>
                    <span className="font-extrabold tracking-tighter text-sm uppercase">Fortex Portal</span>
                </div>
                <div className="flex gap-4 items-center">
                    <div className="px-3 py-1 rounded-full bg-slate-100 text-[9px] font-black uppercase tracking-widest text-slate-400">Pórtico Privado</div>
                </div>
            </nav>

            {/* HERO SECTION */}
            <section className="px-6 py-12 md:px-8 md:py-24 text-center space-y-6">
                <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-primary/10 text-primary text-[10px] font-black uppercase tracking-[0.2em]">
                    <Zap size={14} /> Solución Aura OS
                </div>
                <h1 className="text-2xl md:text-5xl font-black tracking-tighter text-slate-900 leading-[1.1] px-2">
                    {headline}
                </h1>
                <div className="flex flex-col gap-2">
                    <p className="text-sm md:text-xl text-slate-500 max-w-2xl mx-auto font-medium leading-relaxed px-4">
                        {subheadline}
                    </p>
                    {profile?.industry && (
                        <div className="flex items-center justify-center gap-2 text-[10px] font-black uppercase tracking-widest text-slate-400 mt-2">
                            <Building2 size={12} /> {profile.industry} • {profile.business_model}
                        </div>
                    )}
                </div>
            </section>

            {/* CORE CONTENT */}
            <div className="px-6 md:px-8 space-y-12 md:space-y-20 pb-32">

                {/* SOCIO ESTRATÉGICO & ESTRATEGIA (Encapsulated Info) */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    <section className="col-span-1 lg:col-span-1 bg-slate-50 rounded-[32px] p-8 border border-slate-100 space-y-6">
                        <div className="flex items-center gap-3 border-b border-slate-200 pb-4">
                            <Building2 size={20} className="text-primary" />
                            <h2 className="text-sm font-black uppercase tracking-tighter">Socio Estratégico</h2>
                        </div>
                        <div className="space-y-6">
                            <div>
                                <p className="text-[9px] font-black uppercase text-slate-400 tracking-widest mb-2">Propuesta de Valor Colectiva</p>
                                <p className="text-xs font-medium leading-relaxed text-slate-600 italic">
                                    "{profile?.value_proposition || 'Identidad orientada al crecimiento y la innovación digital.'}"
                                </p>
                            </div>
                            <div className="pt-4 border-t border-slate-100">
                                <div className="flex items-center justify-between mb-4">
                                    <div>
                                        <p className="text-[8px] font-black uppercase text-slate-400 mb-1">Presencia Web</p>
                                        <p className="text-[10px] font-bold text-slate-900 uppercase tracking-tighter">{profile?.digital_presence.website.quality || 'Pendiente'}</p>
                                    </div>
                                    <div className="text-right">
                                        <p className="text-[8px] font-black uppercase text-slate-400 mb-1">Socio ID</p>
                                        <p className="text-[10px] font-bold text-slate-900">{client?.ruc || 'S/N'}</p>
                                    </div>
                                </div>

                                <div className="p-4 rounded-2xl bg-white border border-slate-100 shadow-inner group-hover:border-primary/20 transition-all">
                                    <div className="flex items-center gap-2 mb-2">
                                        <Globe size={12} className="text-primary" />
                                        <p className="text-[8px] font-black uppercase text-slate-400 tracking-widest">Enfoque de Mercado</p>
                                    </div>
                                    <p className="text-[11px] font-bold text-slate-900 leading-relaxed">
                                        {profile?.target_market || 'No especificado'}
                                    </p>
                                </div>
                            </div>
                        </div>
                    </section>

                    <section className="col-span-1 lg:col-span-2 bg-white rounded-[32px] p-8 border border-slate-100 shadow-sm relative overflow-hidden group">
                        <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 blur-3xl rounded-full" />
                        <div className="flex items-center gap-3 border-b border-slate-100 pb-4 mb-6">
                            <Lightbulb size={20} className="text-primary" />
                            <h2 className="text-sm font-black uppercase tracking-tighter">Estrategia de Despliegue</h2>
                        </div>
                        <div className="space-y-12">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                <div>
                                    <label className="text-[9px] font-black uppercase text-primary tracking-widest flex items-center gap-1.5 mb-1.5">
                                        <Users size={10} /> Usuario Objetivo
                                    </label>
                                    <p className="text-xs font-bold text-slate-800 leading-relaxed">
                                        {strategy?.target_user || 'Público general interesado en soluciones digitales.'}
                                    </p>
                                </div>
                                <div>
                                    <label className="text-[9px] font-black uppercase text-primary tracking-widest flex items-center gap-1.5 mb-1.5">
                                        <Zap size={10} /> Mensaje Core
                                    </label>
                                    <p className="text-xs font-bold text-slate-800 leading-relaxed">
                                        {strategy?.key_message || 'Innovación tecnológica para el siguiente nivel.'}
                                    </p>
                                </div>
                            </div>

                            <div className="bg-primary/10 border border-primary/20 rounded-[2rem] p-8 relative overflow-hidden group/item">
                                <div className="absolute -right-4 -bottom-4 w-24 h-24 bg-primary/20 blur-3xl rounded-full" />
                                <div className="relative z-10">
                                    <p className="text-[9px] font-black uppercase text-primary/60 tracking-widest mb-3">Propuesta de Valor Estratégica</p>
                                    <p className="text-sm font-bold leading-relaxed text-sky-950 italic">
                                        "{strategy?.value_proposition || 'Transformación digital integral basada en resultados.'}"
                                    </p>
                                </div>
                            </div>
                        </div>
                    </section>
                </div>

                {/* PROYECCIÓN DE VALOR (Financials) */}
                {opportunity.financials_jsonb?.roi_estimate && (
                    <section className="bg-primary rounded-[32px] md:rounded-[40px] p-8 md:p-12 text-sky-950 relative overflow-hidden group border border-primary-dark/10">
                        <div className="absolute top-0 right-0 w-64 h-64 bg-white/20 blur-[100px] rounded-full -mr-20 -mt-20 group-hover:bg-white/30 transition-all duration-1000" />
                        <div className="relative z-10 grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
                            <div className="space-y-4">
                                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-sky-950/10 text-sky-950 text-[9px] font-black uppercase tracking-widest border border-sky-950/5">
                                    <BarChart3 size={12} /> Proyección de Impacto
                                </div>
                                <h2 className="text-2xl md:text-3xl font-black uppercase tracking-tighter leading-tight">
                                    Retorno de Inversión <br className="hidden md:block" /> {opportunity.financials_jsonb.roi_estimate}
                                </h2>
                                <p className="text-sky-950/60 text-sm font-medium">
                                    Solución diseñada para maximizar la eficiencia operativa y habilitar nuevos canales de ingresos.
                                </p>
                            </div>
                            <div className="grid grid-cols-1 gap-4">
                                <div className="p-6 rounded-3xl bg-white/20 border border-white/30 backdrop-blur-sm shadow-inner">
                                    <p className="text-[9px] font-black uppercase text-sky-950/40 tracking-widest mb-1">Potencial Detectado</p>
                                    <p className="text-xl font-black text-sky-950">{opportunity.financials_jsonb.revenue_potential}</p>
                                </div>
                            </div>
                        </div>
                    </section>
                )}

                {/* DISCOVERY / PAIN POINTS */}
                {(opportunity.discovery_jsonb?.pain_points || []).length > 0 && (
                    <div className="space-y-8">
                        <div className="flex items-center gap-3">
                            <Target size={20} className="text-primary md:w-6 md:h-6" />
                            <h2 className="text-lg md:text-xl font-black uppercase tracking-tighter">Análisis de Desafíos Actuales</h2>
                        </div>
                        <div className="grid grid-cols-1 gap-4">
                            {opportunity.discovery_jsonb?.pain_points.map((point, i) => (
                                <div key={i} className="p-6 md:p-8 rounded-[32px] bg-slate-50 border border-slate-100 flex flex-col md:flex-row gap-6 items-start hover:border-primary/20 transition-all">
                                    <div className="flex-1 space-y-2">
                                        <div className="flex items-center gap-3 mb-2">
                                            <span className={`px-2 py-0.5 rounded text-[8px] font-black uppercase tracking-widest 
                                                ${point.severity === 'Alta' ? 'bg-red-100 text-red-600' :
                                                    point.severity === 'Baja' ? 'bg-emerald-100 text-emerald-600' :
                                                        'bg-amber-100 text-amber-600'}`}>
                                                {point.severity}
                                            </span>
                                            <span className="text-[10px] font-black text-slate-300">#0{i + 1}</span>
                                        </div>
                                        <h3 className="text-base font-black text-slate-900 leading-tight uppercase">{point.problem}</h3>
                                        <p className="text-sm text-slate-500 font-medium leading-relaxed italic">"{point.impact}"</p>
                                    </div>
                                    <div className="w-full md:w-px md:h-16 bg-slate-200 shrink-0" />
                                    <div className="w-full md:w-48 pt-1">
                                        <p className="text-[9px] font-black uppercase text-slate-400 tracking-widest mb-2">Estado Aura OS</p>
                                        <div className="flex items-center gap-2 text-emerald-600">
                                            <CheckCircle2 size={14} />
                                            <span className="text-[10px] font-black uppercase tracking-tight">Mitigación Planeada</span>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {/* MARKET CONTEXT (Trend Analysis) */}
                {(insights?.market_notes || []).length > 0 && (
                    <div className="space-y-8">
                        <div className="flex items-center gap-3">
                            <BarChart3 size={20} className="text-primary md:w-6 md:h-6" />
                            <h2 className="text-lg md:text-xl font-black uppercase tracking-tighter">Contexto de Mercado</h2>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            {insights?.market_notes.map((note, i) => (
                                <div key={i} className="p-6 rounded-[2rem] bg-slate-50 relative overflow-hidden border border-slate-100 hover:border-primary/30 transition-all group">
                                    <div className="absolute top-0 right-0 w-24 h-24 bg-primary/5 blur-2xl rounded-full" />
                                    <div className="flex items-center gap-2 mb-4">
                                        <div className="w-1.5 h-6 bg-primary rounded-full" />
                                        <h3 className="text-xs font-black uppercase tracking-widest text-slate-900">{note.trend}</h3>
                                    </div>
                                    <p className="text-xs leading-relaxed text-slate-500 font-medium italic relative z-10">
                                        {note.impact}
                                    </p>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {/* SOLUTION SCOPE */}
                <section className="space-y-6 md:space-y-8">
                    <div className="flex items-center gap-3">
                        <ShieldCheck size={20} className="text-primary md:w-6 md:h-6" />
                        <h2 className="text-lg md:text-xl font-black uppercase tracking-tighter">Alcance Técnico Aura OS</h2>
                    </div>

                    <div className="grid grid-cols-1 gap-4 md:gap-6">
                        {draft?.blocks.map((block, idx) => {
                            const item = getCatalogItem(opportunity.dimension === 'landing' ? block.complexity_id : block.catalog_item_id)
                            return (
                                <div key={idx} className="p-5 md:p-6 rounded-3xl border border-slate-100 bg-white hover:border-primary/30 transition-all shadow-sm group">
                                    <div className="flex justify-between items-start mb-4">
                                        <h3 className="font-black text-slate-900 text-base md:text-lg uppercase tracking-tight">{block.name || `Hito ${idx + 1}`}</h3>
                                        <CheckCircle2 size={18} className="text-primary opacity-40 group-hover:opacity-100 transition-all md:w-5 md:h-5" />
                                    </div>
                                    <p className="text-xs md:text-sm text-slate-500 font-medium mb-4 leading-relaxed">
                                        {item?.client_label || item?.description || 'Implementación técnica optimizada.'}
                                    </p>
                                    <div className="flex flex-wrap gap-2">
                                        <span className="px-2 py-1 rounded-lg bg-slate-50 text-[9px] md:text-[10px] font-black uppercase text-slate-400 border border-slate-200">High Performance</span>
                                        <span className="px-2 py-1 rounded-lg bg-slate-50 text-[9px] md:text-[10px] font-black uppercase text-slate-400 border border-slate-200">SEO Optimized</span>
                                    </div>
                                </div>
                            )
                        })}
                    </div>
                </section>

                {/* ENTREGABLES Y TIEMPOS */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8 md:gap-12">
                    <div className="space-y-6">
                        <div className="flex items-center gap-3">
                            <FileText size={20} className="text-primary md:w-[22px] md:h-[22px]" />
                            <h3 className="text-lg font-black uppercase tracking-tighter">Entregables Claros</h3>
                        </div>
                        <div className="px-1">
                            {renderList(opportunity.deliverables || '')}
                        </div>
                    </div>

                    <div className="space-y-6">
                        <div className="flex items-center gap-3">
                            <Clock size={20} className="text-primary md:w-[22px] md:h-[22px]" />
                            <h3 className="text-lg font-black uppercase tracking-tighter">Cronograma Proyectado</h3>
                        </div>
                        <div className="bg-primary/5 border border-primary/10 rounded-[32px] p-6 md:p-8">
                            <p className="text-xs md:text-sm font-bold text-slate-400 mb-1 md:mb-2 uppercase tracking-widest">Tiempo estimado:</p>
                            <p className="text-xl md:text-2xl font-black text-sky-950 mb-6">{opportunity.delivery_time_text || '4 Semanas'}</p>
                            <div className="space-y-4">
                                <div className="flex justify-between items-center pb-3 border-b border-primary/10 uppercase tracking-tighter text-[9px] md:text-[10px] font-black text-sky-950/60">
                                    <span>Revisiones</span>
                                    <span>{opportunity.revision_rounds || '2 Rondas'}</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* CALL TO ACTION */}
                <section className="bg-primary rounded-[32px] md:rounded-[40px] p-8 md:p-16 text-center text-primary-foreground">
                    <h2 className="text-xl md:text-3xl font-black tracking-tighter mb-3 md:mb-4 uppercase leading-tight">¿Coreografiamos el inicio?</h2>
                    <p className="text-primary-foreground/70 mb-8 max-w-md mx-auto text-xs md:text-sm font-bold">Inversión calculada según arquitectura seleccionada.</p>
                    <div className="flex flex-col items-center justify-center gap-6">
                        <button className="w-full md:w-auto px-10 py-5 bg-slate-900 text-white rounded-2xl font-black uppercase tracking-widest text-[11px] flex items-center justify-center gap-3 hover:scale-105 transition-all shadow-xl">
                            Aprobar y Sincronizar <ArrowRight size={16} />
                        </button>
                        <div className="space-y-1">
                            <p className="text-[10px] font-black uppercase opacity-60 tracking-widest">Inversión Final</p>
                            <p className="text-lg font-black tabular-nums">S/ {draft?.totalCalculated.toLocaleString()}</p>
                            {opportunity.financials_jsonb?.payment_terms && (
                                <p className="text-[9px] font-bold text-primary-foreground/50 uppercase mt-2 italic">
                                    {opportunity.financials_jsonb.payment_terms}
                                </p>
                            )}
                        </div>
                    </div>
                </section>
            </div>

            {/* FOOTER */}
            <footer className="p-8 border-t border-slate-100 text-center">
                <p className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-300">© FORTEX DIGITAL SOLUTIONS • AURA OS v2.0</p>
            </footer>

            <style jsx global>{`
                @import url('https://fonts.googleapis.com/css2?family=Montserrat:wght@400;500;700;900&display=swap');
                
                .font-montserrat {
                    font-family: 'Montserrat', sans-serif;
                }
                
                * {
                    font-family: 'Montserrat', sans-serif !important;
                }
            `}</style>
        </div>
    )
}
