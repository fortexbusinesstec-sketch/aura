'use client'

import React from 'react'
import { usePitchStore } from '@/store/usePitchStore'
import { OpportunityDimension } from '@/types'
import { Rocket, Monitor, Globe, Smartphone } from 'lucide-react'

const DIMENSIONS: { id: OpportunityDimension; label: string; icon: React.ElementType }[] = [
    { id: 'landing', label: 'Landing Page', icon: Rocket },
    { id: 'website', label: 'Página Web', icon: Globe },
    { id: 'webapp', label: 'Aplicación Web', icon: Monitor },
    { id: 'mobileapp', label: 'Aplicación Móvil', icon: Smartphone },
]

export function DimensionSelector() {
    const { currentOpportunity, setDimension } = usePitchStore()

    return (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-6">
            {DIMENSIONS.map((dim) => {
                const Icon = dim.icon
                const isActive = currentOpportunity.dimension === dim.id

                return (
                    <button
                        key={dim.id}
                        onClick={() => setDimension(dim.id)}
                        className={`flex flex-col items-center gap-4 p-8 rounded-[2.5rem] border transition-all duration-500 group ${isActive
                            ? 'bg-primary/10 border-primary/40 shadow-[0_20px_50px_-10px_hsl(var(--primary)/0.2)] ring-1 ring-primary/20'
                            : 'bg-card border-border hover:border-primary/40 hover:bg-white hover:shadow-xl hover:-translate-y-1'
                            }`}
                    >
                        <div className={`p-5 rounded-2xl transition-all duration-500 ${isActive ? 'bg-primary text-primary-foreground scale-110 shadow-lg' : 'bg-muted text-muted-foreground group-hover:bg-primary group-hover:text-primary-foreground group-hover:scale-110 group-hover:rotate-3'
                            }`}>
                            <Icon size={28} strokeWidth={2.5} />
                        </div>
                        <span className={`text-[12px] font-black uppercase tracking-[0.2em] transition-colors duration-500 ${isActive ? 'text-foreground' : 'text-foreground/40 group-hover:text-foreground'
                            }`}>
                            {dim.label}
                        </span>
                    </button>
                )
            })}
        </div>
    )
}
