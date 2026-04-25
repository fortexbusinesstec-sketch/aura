'use client'

import React, { useEffect, useCallback } from 'react'
import { usePitchStore } from '@/store/usePitchStore'
import { ClientSelector } from './ClientSelector'
import { DimensionSelector } from './DimensionSelector'
import { SolutionBuilder } from './SolutionBuilder'
import { CrossModuleSelector } from './CrossModuleSelector'
import { InfrastructureSelector } from './InfrastructureSelector'
import { PostItContainer } from './PostItContainer'
import { debounce } from '@/utils/debounce'
import { Calculator, Cloud, Save, CheckCircle2, Loader2, ChevronLeft } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { PageHeader } from '@/components/ui/PageHeader'

export function PitchTerminalContainer() {
    const {
        fetchClients,
        fetchCatalog,
        isRightPanelOpen,
        toggleRightPanel,
        currentOpportunity,
        saveToSupabase,
        lastSaved,
        isLoading
    } = usePitchStore()

    const router = useRouter()

    useEffect(() => {
        fetchClients()
        fetchCatalog()
    }, [fetchClients, fetchCatalog])

    // Debounced autosave
    // eslint-disable-next-line react-hooks/exhaustive-deps
    const debouncedSave = useCallback(
        debounce(() => {
            saveToSupabase()
        }, 1500),
        [saveToSupabase]
    )

    useEffect(() => {
        if (currentOpportunity.client_id) {
            debouncedSave()
        }
    }, [currentOpportunity, debouncedSave])

    return (
        <div className="fixed inset-0 bg-background flex overflow-hidden pt-16 selection:bg-primary/30 selection:text-primary">
            {/* Action Bar (Top Floating) */}
            <div className="absolute top-20 right-8 z-50 flex items-center gap-4">
                {(isLoading || lastSaved) && (
                    <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-card/40 border border-white/5 backdrop-blur-md">
                        {isLoading ? (
                            <Loader2 size={12} className="text-primary animate-spin" />
                        ) : (
                            <CheckCircle2 size={12} className="text-primary" />
                        )}
                        <span className="text-[10px] font-black uppercase tracking-widest text-foreground/60">
                            {isLoading ? 'Sincronizando...' : lastSaved ? `Sincronizado ${lastSaved.toLocaleTimeString()}` : ''}
                        </span>
                    </div>
                )}
            </div>

            {/* Left Area (Workspace) */}
            <div className={`h-full overflow-y-auto custom-scrollbar transition-all duration-500 ease-in-out p-4 md:p-8 ${isRightPanelOpen ? 'w-0 md:w-[65%] lg:w-[70%] opacity-0 md:opacity-100' : 'w-full'}`}>
                <div className="max-w-4xl mx-auto py-12 space-y-20">
                    {/* Header Estandarizado */}
                    <PageHeader
                        title="Aura Live Pitch"
                        subtitle="Terminal de Venta & Arquitectura B2B"
                    />

                    <div className="space-y-16">
                        <ClientSelector />

                        <div className="h-px bg-border/40" />

                        <div className="space-y-8">
                            <label className="text-[11px] font-black uppercase text-foreground/60 tracking-[0.2em] ml-1">
                                Estructura del Desafío
                            </label>
                            <DimensionSelector />
                        </div>

                        {currentOpportunity.dimension && (
                            <>
                                <div className="h-px bg-border/40" />
                                <SolutionBuilder />

                                <div className="h-px bg-border/40" />
                                <div className="space-y-8">
                                    <label className="text-[11px] font-black uppercase text-foreground/60 tracking-[0.2em] ml-1">Módulos Transversales</label>
                                    <CrossModuleSelector />
                                </div>

                                <div className="h-px bg-border/40" />
                                <div className="space-y-8">
                                    <label className="text-[11px] font-black uppercase text-foreground/60 tracking-[0.2em] ml-1">Modelo de Infraestructura y Mantenimiento</label>
                                    <InfrastructureSelector />
                                </div>
                            </>
                        )}
                    </div>

                    {/* Ver Precios Trigger */}
                    {!isRightPanelOpen && (
                        <div className="pt-12 flex justify-center pb-24">
                            <button
                                onClick={() => toggleRightPanel(true)}
                                className="group relative px-8 py-4 bg-primary text-primary-foreground font-black uppercase tracking-[0.2em] rounded-2xl text-sm shadow-[0_20px_40px_-10px_hsl(var(--primary)/0.3)] hover:shadow-[0_20px_50px_-10px_hsl(var(--primary)/0.5)] hover:-translate-y-1 transition-all active:scale-95 overflow-hidden"
                            >
                                <div className="absolute inset-0 bg-white/20 translate-y-full group-hover:translate-y-0 transition-transform duration-300"></div>
                                <span className="relative flex items-center gap-3">
                                    Desplegar Resultados
                                    <Cloud size={18} className="animate-bounce" />
                                </span>
                            </button>
                        </div>
                    )}
                </div>
            </div>

            {/* Right Area (Post-Its) */}
            <div className={`h-full bg-card border-l border-border transition-all duration-500 ease-in-out ${isRightPanelOpen ? 'w-full md:w-[35%] lg:w-[30%]' : 'w-0 opacity-0 pointer-events-none'}`}>
                <PostItContainer />
            </div>

            <style jsx global>{`
                .custom-scrollbar::-webkit-scrollbar {
                    width: 4px;
                }
                .custom-scrollbar::-webkit-scrollbar-track {
                    background: transparent;
                }
                .custom-scrollbar::-webkit-scrollbar-thumb {
                    background: hsl(var(--primary) / 0.1);
                    border-radius: 10px;
                }
                .custom-scrollbar::-webkit-scrollbar-thumb:hover {
                    background: hsl(var(--primary) / 0.3);
                }
            `}</style>
        </div>
    )
}
