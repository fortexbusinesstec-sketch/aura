'use client'

import React from 'react'
import { usePitchStore } from '@/store/usePitchStore'
import { Server, Globe, Check, Zap } from 'lucide-react'

export function InfrastructureSelector() {
    const {
        catalog,
        currentOpportunity,
        setInfrastructureModel,
        toggleInfrastructureItem
    } = usePitchStore()

    const draft = currentOpportunity.draft_jsonb
    if (!draft) return null

    const model = draft.infrastructureModel || 'external'
    const selectedIds = draft.selectedInfrastructureIds || []

    const externalItems = catalog.filter(i => i.category === 'hosting_external')
    const internalItems = catalog.filter(i => i.category === 'hosting_internal')

    return (
        <div className="space-y-6 md:space-y-8 bg-card/80 p-5 md:p-8 rounded-[1.5rem] md:rounded-[2rem] border border-border shadow-sm">
            {/* Toggle Model */}
            <div className="flex flex-col sm:flex-row bg-background/50 p-1.5 rounded-2xl border border-border gap-1 sm:gap-0">
                <button
                    onClick={() => setInfrastructureModel('external')}
                    className={`flex-1 flex items-center justify-center gap-3 py-2.5 sm:py-3 rounded-xl text-[10px] md:text-[11px] font-black uppercase tracking-widest transition-all ${model === 'external'
                        ? 'bg-primary text-primary-foreground shadow-lg'
                        : 'text-muted-foreground hover:text-foreground'
                        }`}
                >
                    <Globe size={14} />
                    Alojamiento Externo
                </button>
                <button
                    onClick={() => setInfrastructureModel('internal')}
                    className={`flex-1 flex items-center justify-center gap-3 py-2.5 sm:py-3 rounded-xl text-[10px] md:text-[11px] font-black uppercase tracking-widest transition-all ${model === 'internal'
                        ? 'bg-primary text-primary-foreground shadow-lg'
                        : 'text-muted-foreground hover:text-foreground'
                        }`}
                >
                    <Server size={14} />
                    Fortex Premium
                </button>
            </div>

            {/* Content based on model */}
            <div className="space-y-6">
                {model === 'external' ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {externalItems.length > 0 ? (
                            externalItems.map(item => {
                                const isSelected = selectedIds.includes(item.id)
                                return (
                                    <button
                                        key={item.id}
                                        onClick={() => toggleInfrastructureItem(item.id)}
                                        className={`flex items-center justify-between p-5 rounded-2xl border transition-all duration-300 text-left group ${isSelected
                                            ? 'bg-primary/15 border-primary/50 shadow-sm ring-1 ring-primary/20'
                                            : 'bg-card border-border hover:border-primary/30 hover:bg-accent/60'
                                            }`}
                                    >
                                        <div className="flex flex-col">
                                            <span className={`text-[11px] font-black uppercase tracking-tight mb-1.5 ${isSelected ? 'text-foreground' : 'text-muted-foreground group-hover:text-foreground'}`}>
                                                {item.name}
                                            </span>
                                            <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest tabular-nums font-mono">
                                                {new Intl.NumberFormat('es-PE', { style: 'currency', currency: 'PEN', maximumFractionDigits: 0 }).format(item.base_price_pen)}
                                            </span>
                                        </div>
                                        <div className={`w-6 h-6 rounded-lg border transition-all flex items-center justify-center ${isSelected ? 'bg-primary border-primary text-primary-foreground scale-110' : 'border-border group-hover:border-primary/50'
                                            }`}>
                                            {isSelected && <Check size={14} strokeWidth={3} />}
                                        </div>
                                    </button>
                                )
                            })
                        ) : (
                            <div className="col-span-full py-8 text-center text-[10px] font-bold text-muted-foreground uppercase tracking-widest opacity-50">
                                Sin opciones externas cargadas
                            </div>
                        )}
                    </div>
                ) : (
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 md:gap-6">
                        {internalItems.length > 0 ? (
                            internalItems.map(item => {
                                const isSelected = selectedIds.includes(item.id)
                                return (
                                    <button
                                        key={item.id}
                                        onClick={() => toggleInfrastructureItem(item.id)}
                                        className={`relative flex flex-col p-6 md:p-8 rounded-[2rem] md:rounded-[2.5rem] border transition-all duration-500 text-left group ${isSelected
                                            ? 'bg-primary/10 border-primary ring-1 ring-primary/30 shadow-2xl md:-translate-y-2'
                                            : 'bg-card border-border hover:border-primary/40 hover:shadow-xl'
                                            }`}
                                    >
                                        {isSelected && (
                                            <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-5 py-1.5 bg-primary text-primary-foreground text-[9px] font-black uppercase tracking-[0.25em] rounded-full shadow-lg">
                                                Plan Elegido
                                            </div>
                                        )}
                                        <div className="mb-6">
                                            <div className={`w-12 h-12 rounded-2xl flex items-center justify-center mb-6 transition-all duration-500 ${isSelected ? 'bg-primary text-primary-foreground rotate-6' : 'bg-accent text-muted-foreground group-hover:bg-primary/20'
                                                }`}>
                                                <Zap size={24} fill={isSelected ? "currentColor" : "none"} />
                                            </div>
                                            <h4 className={`text-base font-black uppercase tracking-tight mb-2 ${isSelected ? 'text-foreground' : 'text-muted-foreground'}`}>
                                                {item.name.replace(/ Plan Mantenimiento: /i, '').split(' ($')[0]}
                                            </h4>
                                            <div className="flex items-baseline gap-1">
                                                <span className="text-2xl font-black text-foreground tabular-nums">
                                                    {new Intl.NumberFormat('es-PE', { style: 'currency', currency: 'PEN', maximumFractionDigits: 0 }).format(item.base_price_pen)}
                                                </span>
                                                <span className="text-[10px] text-muted-foreground font-black uppercase tracking-widest">/ mes</span>
                                            </div>
                                        </div>
                                        <p className="text-[11px] font-bold text-muted-foreground/80 leading-relaxed min-h-[60px]">
                                            {item.description}
                                        </p>

                                        <div className={`mt-6 pt-6 border-t border-border flex items-center gap-2 text-[10px] font-black uppercase tracking-widest transition-colors ${isSelected ? 'text-primary' : 'text-muted-foreground'}`}>
                                            <div className={`w-4 h-4 rounded-full border-2 flex items-center justify-center transition-all ${isSelected ? 'border-primary bg-primary' : 'border-border group-hover:border-primary/50'
                                                }`}>
                                                {isSelected && <Check size={10} strokeWidth={4} className="text-primary-foreground" />}
                                            </div>
                                            {isSelected ? 'Seleccionado' : 'Elegir Plan'}
                                        </div>
                                    </button>
                                )
                            })
                        ) : (
                            <div className="col-span-full py-8 text-center text-[10px] font-bold text-muted-foreground uppercase tracking-widest opacity-50">
                                Sin planes internos cargados
                            </div>
                        )}
                    </div>
                )}
            </div>
        </div>
    )
}
