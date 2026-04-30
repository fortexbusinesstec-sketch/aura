'use client'

import React, { useMemo } from 'react'
import { usePitchStore } from '@/store/usePitchStore'
import { PostItItem } from './PostItItem'
import {
    DollarSign,
    MessageSquare,
    History,
    Zap,
    TrendingUp,
    FileCheck2,
    Loader2,
    X,
} from 'lucide-react'

export function PostItContainer() {
    const {
        currentOpportunity,
        isPricePanelOpen,
        togglePricePanel,
        toggleRightPanel,
        setNotes,
        setRetro,
        setDiscount,
        catalog,
        saveToSupabase,
        isLoading
    } = usePitchStore()

    const draft = currentOpportunity.draft_jsonb!

    // Desglose de precios
    const priceBreakdown = useMemo(() => {
        const items: { label: string; price: number; detail?: string; comment?: string; isOpex?: boolean }[] = []

        draft.blocks.forEach(block => {
            if (currentOpportunity.dimension === 'landing') {
                const complexity = catalog.find(i => i.id === block.complexity_id)
                if (complexity) {
                    items.push({
                        label: block.name || 'Sin nombre',
                        price: complexity.base_price_pen,
                        detail: complexity.name
                    })
                }
            } else if (currentOpportunity.dimension === 'website') {
                const pageType = catalog.find(i => i.id === block.catalog_item_id)
                if (pageType) {
                    items.push({
                        label: block.name || 'Sin nombre',
                        price: pageType.base_price_pen,
                        detail: pageType.name
                    })
                }
            } else {
                const visual = catalog.find(i => i.id === block.visual_level_id)
                const cognitive = catalog.find(i => i.id === block.cognitive_level_id)

                if (visual || cognitive) {
                    const totalPrice = (visual?.base_price_pen || 0) + (cognitive?.base_price_pen || 0)
                    const levels = [visual?.name, cognitive?.name].filter(Boolean).join(' • ')

                    items.push({
                        label: block.name || 'Sin nombre',
                        price: totalPrice,
                        detail: levels
                    })
                }
            }
        })

        draft.selectedModules.forEach(sm => {
            const item = catalog.find(i => i.id === sm.id)
            if (item) items.push({ label: item.name, price: item.base_price_pen, comment: sm.comment })
        })

        draft.selectedInfrastructureIds.forEach(id => {
            const item = catalog.find(i => i.id === id)
            if (item) {
                items.push({
                    label: item.name,
                    price: item.base_price_pen,
                    detail: item.category === 'hosting_internal' ? 'Suscripción Mensual' : 'Costo de Infraestructura',
                    isOpex: item.category === 'hosting_internal'
                })
            }
        })

        return items
    }, [draft, catalog, currentOpportunity.dimension])

    return (
        <div className="h-full flex flex-col bg-card">
            <div className="flex items-center justify-between p-8 border-b border-border">
                <div className="flex items-center gap-3">
                    <TrendingUp size={18} className="text-primary" />
                    <h2 className="text-sm font-black uppercase text-foreground tracking-[0.3em]">Resultados</h2>
                </div>
                <button
                    onClick={() => toggleRightPanel(false)}
                    className="p-2 rounded-xl text-muted-foreground hover:text-foreground hover:bg-accent transition-all"
                >
                    <X size={20} />
                </button>
            </div>

            <div className="flex-1 overflow-y-auto">
                {/* 1. Precio Final */}
                <PostItItem
                    title="Precio Final"
                    icon={<DollarSign size={18} />}
                    isOpen={isPricePanelOpen}
                    onToggle={togglePricePanel}
                    badge={
                        draft.totalOpex > 0
                            ? `${new Intl.NumberFormat('es-PE', { style: 'currency', currency: 'PEN', maximumFractionDigits: 0 }).format(draft.totalCapex)} + ${new Intl.NumberFormat('es-PE', { style: 'currency', currency: 'PEN', maximumFractionDigits: 0 }).format(draft.totalOpex)}/mes`
                            : new Intl.NumberFormat('es-PE', { style: 'currency', currency: 'PEN', maximumFractionDigits: 0 }).format(draft.totalCapex)
                    }
                >
                    <div className="space-y-4">
                        <div className="space-y-4">
                            {priceBreakdown.map((item, i) => (
                                <div key={i} className="space-y-1.5 py-1">
                                    <div className="flex justify-between items-start gap-4 text-[11px]">
                                        <div className="flex flex-col flex-1">
                                            <span className="text-foreground font-black uppercase tracking-tight leading-none mb-1">{item.label}</span>
                                            {item.detail && (
                                                <span className="text-[8px] text-muted-foreground font-bold uppercase tracking-widest leading-none">{item.detail}</span>
                                            )}
                                        </div>
                                        <span className="text-foreground font-mono tabular-nums font-black tracking-widest whitespace-nowrap pt-0.5">S/ {item.price.toLocaleString()}</span>
                                    </div>
                                    {item.comment && (
                                        <p className="text-[9px] text-muted-foreground font-bold uppercase leading-tight pl-2 border-l border-border mt-1.5 py-0.5">
                                            {item.comment}
                                        </p>
                                    )}
                                </div>
                            ))}
                        </div>

                        <div className="pt-6 border-t border-border space-y-6">
                            <div className="flex flex-col gap-2">
                                <div className="flex justify-between items-center px-1">
                                    <label className="text-[9px] font-black uppercase text-muted-foreground tracking-widest">Incentivo Comercial (Dcto Desarrollo %)</label>
                                    <span className="text-[10px] font-black text-primary bg-primary/20 px-2 py-0.5 rounded-lg border border-primary/40">{currentOpportunity.discount_applied || 0}%</span>
                                </div>
                                <div className="relative group">
                                    <div className="absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground font-black text-sm group-focus-within:text-foreground transition-colors">%</div>
                                    <input
                                        type="number"
                                        min="0"
                                        max="100"
                                        value={currentOpportunity.discount_applied || ''}
                                        onChange={(e) => setDiscount(Math.min(100, Math.max(0, Number(e.target.value))))}
                                        className="w-full bg-background border border-border rounded-2xl pl-5 pr-10 py-4 text-lg font-mono font-black text-foreground focus:border-primary/50 outline-none transition-all placeholder:text-muted-foreground/40 shadow-inner"
                                        placeholder="0"
                                    />
                                </div>
                            </div>

                            <div className="bg-background/40 rounded-[2rem] p-8 border border-border space-y-8 shadow-inner">
                                <div className="flex flex-col items-center text-center gap-1">
                                    <span className="text-[10px] font-black uppercase text-primary tracking-[0.4em] mb-1">Inversión de Desarrollo</span>
                                    <span className="text-4xl font-black text-foreground italic tabular-nums tracking-tighter">
                                        {new Intl.NumberFormat('es-PE', { style: 'currency', currency: 'PEN', maximumFractionDigits: 0 }).format(draft.totalCapex)}
                                    </span>
                                    <span className="px-3 py-1 bg-primary text-primary-foreground text-[8px] font-black uppercase tracking-widest rounded-full mt-2">Pago Único</span>
                                </div>

                                {draft.totalOpex > 0 && (
                                    <div className="flex flex-col items-center text-center gap-1 pt-8 border-t border-border/50">
                                        <span className="text-[10px] font-black uppercase text-secondary-foreground tracking-[0.4em] mb-1">Suscripción de Mantenimiento</span>
                                        <span className="text-3xl font-black text-foreground italic tabular-nums tracking-tighter">
                                            {new Intl.NumberFormat('es-PE', { style: 'currency', currency: 'PEN', maximumFractionDigits: 0 }).format(draft.totalOpex)}
                                        </span>
                                        <div className="flex items-center gap-2 mt-2">
                                            <span className="px-3 py-1 bg-accent text-foreground text-[8px] font-black uppercase tracking-widest rounded-full">Mensual</span>
                                            <span className="text-[10px] font-bold text-muted-foreground italic">Facturado desde mes 01</span>
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </PostItItem>

                {/* 2. Resultado de Notas */}
                <PostItItem title="Resultado de Notas" icon={<MessageSquare size={18} />}>
                    <div className="space-y-3">
                        <div className="flex items-center justify-between">
                            <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">Feedback directo del lead</p>
                            {currentOpportunity.meeting_notes && (
                                <button
                                    onClick={() => setNotes('')}
                                    className="p-1.5 hover:bg-destructive/10 text-muted-foreground hover:text-destructive rounded-lg transition-all active:scale-90"
                                    title="Limpiar notas"
                                >
                                    <X size={14} />
                                </button>
                            )}
                        </div>
                        <textarea
                            value={currentOpportunity.meeting_notes || ''}
                            onChange={(e) => setNotes(e.target.value)}
                            className="w-full h-32 md:h-40 bg-background border border-border rounded-xl p-4 text-[11px] md:text-xs font-bold text-foreground outline-none focus:border-primary/50 transition-colors placeholder:text-muted-foreground/40"
                            placeholder="Ej. 'Dijo que necesita el MVP antes de fin de mes'..."
                        />
                    </div>
                </PostItItem>

                {/* 3. Retrospectiva Interna */}
                <PostItItem title="Internal Retro" icon={<History size={18} />}>
                    <div className="space-y-3">
                        <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">Observaciones técnicas / comerciales</p>
                        <textarea
                            value={currentOpportunity.internal_retro || ''}
                            onChange={(e) => setRetro(e.target.value)}
                            className="w-full h-32 bg-background border border-border rounded-xl p-4 text-xs font-bold text-foreground outline-none focus:border-primary/50 transition-colors placeholder:text-muted-foreground/40"
                            placeholder="Ej. 'Debí enfatizar más el ahorro en infraestructura'..."
                        />
                    </div>
                </PostItItem>

                {/* 4. Guardado */}
                <PostItItem title="Gestión de Oportunidad" icon={<Zap size={18} />}>
                    <div className="space-y-4">
                        <button
                            onClick={() => saveToSupabase(true)}
                            disabled={isLoading}
                            className="w-full relative group p-4 bg-primary rounded-2xl overflow-hidden transition-all active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            <div className="absolute inset-0 bg-foreground/10 translate-x-full group-hover:translate-x-0 transition-transform duration-500" />
                            <div className="relative flex items-center justify-center gap-3">
                                {isLoading ? (
                                    <Loader2 size={18} className="text-primary-foreground animate-spin" />
                                ) : (
                                    <FileCheck2 size={18} className="text-primary-foreground font-black" strokeWidth={3} />
                                )}
                                <span className="text-[10px] font-black uppercase tracking-[0.2em] text-primary-foreground">
                                    {isLoading ? 'Guardando...' : 'Guardar Oportunidad'}
                                </span>
                            </div>
                        </button>
                        <p className="text-[9px] font-bold text-muted-foreground text-center uppercase tracking-widest px-4">
                            Registra o actualiza esta oportunidad en el CRM de Aura OS.
                        </p>
                    </div>
                </PostItItem>
            </div>
        </div>
    )
}
