'use client'

import React from 'react'
import { usePitchStore } from '@/store/usePitchStore'
import { CatalogCategory } from '@/types'
import { ShieldCheck, HardDrive, Zap, Search, Layout, Repeat, MessageSquarePlus, Globe, Cpu } from 'lucide-react'

const GROUP_CONFIG: Record<string, { label: string; icon: any; color: string }> = {
    'cro_strategy': { label: 'Estrategia CRO', icon: Layout, color: '#C2911D' },
    'seo_module': { label: 'Módulo SEO', icon: Search, color: '#5A8E0E' },
    'performance_module': { label: 'Performance Core', icon: Zap, color: '#B47814' },
    'integration': { label: 'Integraciones Tecnológicas', icon: Repeat, color: '#1E40AF' },
    'setup': { label: 'Configuración Core', icon: HardDrive, color: '#5B21B6' },
    'domain': { label: 'Dominio & Hosting', icon: Globe, color: '#9A3412' },
    'app_feature': { label: 'Funcionalidades App', icon: Cpu, color: '#C2410C' }
}

export function CrossModuleSelector() {
    const { catalog, currentOpportunity, toggleModule, updateModuleComment } = usePitchStore()

    const selectedModules = currentOpportunity.draft_jsonb?.selectedModules || []

    const renderGroup = (category: CatalogCategory) => {
        const items = catalog.filter(i => i.category === category)
        if (items.length === 0) return null

        const config = GROUP_CONFIG[category] || { label: category, icon: Zap, color: '#7A7261' }
        const Icon = config.icon

        return (
            <div key={category} className="space-y-4 pt-8 border-t border-border first:border-0 first:pt-0">
                <div className="flex items-center gap-2">
                    <div className="w-1 h-4 rounded-full" style={{ backgroundColor: config.color }} />
                    <Icon size={14} style={{ color: config.color }} />
                    <h4 className="text-[10px] font-black uppercase tracking-[0.2em]" style={{ color: config.color }}>{config.label}</h4>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {items.map((item) => {
                        const selection = selectedModules.find(m => m.id === item.id)
                        const isSelected = !!selection

                        return (
                            <div key={item.id} className="space-y-3">
                                <button
                                    onClick={() => toggleModule(item.id)}
                                    className={`w-full flex items-center justify-between p-5 rounded-2xl border transition-all duration-300 text-left group ${isSelected
                                        ? 'bg-primary/15 border-primary/50 shadow-sm ring-1 ring-primary/20'
                                        : 'bg-card border-border hover:border-primary/30 hover:bg-accent/60'
                                        }`}
                                >
                                    <div className="flex flex-col">
                                        <span className={`text-[11px] font-black uppercase tracking-tight leading-none mb-1.5 ${isSelected
                                            ? 'text-foreground'
                                            : 'text-muted-foreground group-hover:text-foreground'
                                            }`}>
                                            {item.name}
                                        </span>
                                        <div className="flex items-center gap-2">
                                            <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest tabular-nums">
                                                {new Intl.NumberFormat('es-PE', { style: 'currency', currency: 'PEN', maximumFractionDigits: 0 }).format(item.base_price_pen)}
                                            </span>
                                        </div>
                                    </div>
                                    <div className={`w-6 h-6 rounded-lg border transition-all flex items-center justify-center ${isSelected
                                        ? 'bg-primary border-primary text-primary-foreground scale-110'
                                        : 'border-border group-hover:border-primary/50'
                                        }`}>
                                        {isSelected && <Zap size={14} strokeWidth={2.5} />}
                                    </div>
                                </button>

                                {isSelected && (
                                    <div className="relative group/comment animate-in slide-in-from-top-2 duration-300">
                                        <div className="absolute left-3 top-3 p-1 rounded bg-primary/15">
                                            <MessageSquarePlus className="text-primary-foreground group-focus-within/comment:scale-110 transition-transform" size={12} />
                                        </div>
                                        <textarea
                                            value={selection.comment}
                                            onChange={(e) => updateModuleComment(item.id, e.target.value)}
                                            placeholder={`Comentario adicional para ${item.name}...`}
                                            className="w-full bg-background border border-border rounded-2xl pl-11 pr-4 py-4 text-[11px] font-bold text-foreground outline-none focus:border-primary/50 placeholder:text-muted-foreground/40 min-h-[90px] shadow-inner"
                                        />
                                    </div>
                                )}
                            </div>
                        )
                    })}
                </div>
            </div>
        )
    }

    const categories: CatalogCategory[] = ['cro_strategy', 'seo_module', 'performance_module', 'integration', 'setup', 'domain', 'app_feature']

    return (
        <div className="space-y-8 bg-card/80 p-8 rounded-[2rem] border border-border shadow-sm">
            {categories.map(cat => renderGroup(cat))}

            {catalog.filter(i => categories.includes(i.category)).length === 0 && (
                <div className="py-12 flex flex-col items-center justify-center gap-4 opacity-30 border-2 border-dashed border-border rounded-[2rem] text-muted-foreground">
                    <Zap size={48} strokeWidth={1} />
                    <p className="text-[10px] font-black uppercase tracking-[0.4em]">No hay módulos transversales disponibles</p>
                </div>
            )}
        </div>
    )
}
