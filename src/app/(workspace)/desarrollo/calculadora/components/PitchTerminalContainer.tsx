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
import { Modal } from '@/components/ui/Modal'
import { Calculator, Cloud, Save, CheckCircle2, Loader2, ChevronLeft, X } from 'lucide-react'
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
        isLoading,
        clientOpportunities,
        fetchClientOpportunities,
        resetCurrentOpportunity,
        setCurrentOpportunity,
        saveResult,
        setSaveResult
    } = usePitchStore()

    const [activeTab, setActiveTab] = React.useState<'new' | 'edit'>('new')

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

    const lastSavedDraftRef = React.useRef<string>('')

    useEffect(() => {
        // Al cargar o cambiar de oportunidad, inicializar el ref para evitar auto-save inmediato
        if (currentOpportunity.id) {
            lastSavedDraftRef.current = JSON.stringify(currentOpportunity.draft_jsonb)
        } else {
            lastSavedDraftRef.current = ''
        }
    }, [currentOpportunity.id])

    useEffect(() => {
        // Auto-save solo si ya existe el ID (estamos editando)
        if (currentOpportunity.client_id && currentOpportunity.id) {
            const currentDraftStr = JSON.stringify(currentOpportunity.draft_jsonb)

            // Solo disparar si el borrador ha cambiado realmente
            if (currentDraftStr !== lastSavedDraftRef.current) {
                debouncedSave()
                lastSavedDraftRef.current = currentDraftStr
            }
        }
    }, [currentOpportunity, debouncedSave])

    useEffect(() => {
        if (currentOpportunity.client_id) {
            fetchClientOpportunities(currentOpportunity.client_id)
        }
    }, [currentOpportunity.client_id, fetchClientOpportunities])

    return (
        <div className="fixed inset-0 bg-background flex overflow-hidden pt-16 selection:bg-primary/30 selection:text-sky-950">
            {/* Action Bar (Top Floating) */}
            <div className="absolute top-20 right-8 z-50 flex items-center gap-4">
                {(isLoading || lastSaved) && (
                    <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-card/40 border border-white/5 backdrop-blur-md">
                        {isLoading ? (
                            <Loader2 size={12} className="text-sky-950 animate-spin" />
                        ) : (
                            <CheckCircle2 size={12} className="text-sky-950" />
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
                        title="Aura Calculate"
                        subtitle="Terminal de Venta & Arquitectura B2B"
                    />

                    <div className="space-y-16">
                        <div className="space-y-12">
                            <ClientSelector />

                            {currentOpportunity.client_id && (
                                <div className="space-y-12 animate-in fade-in slide-in-from-top-4 duration-500">
                                    <div className="flex items-center gap-2 p-1.5 bg-card/40 border border-border rounded-2xl w-fit">
                                        <button
                                            onClick={() => {
                                                setActiveTab('new')
                                                resetCurrentOpportunity()
                                            }}
                                            className={`px-6 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${activeTab === 'new'
                                                ? 'bg-primary text-primary-foreground shadow-lg shadow-primary/20'
                                                : 'text-foreground/40 hover:text-foreground hover:bg-accent'
                                                }`}
                                        >
                                            Nueva Oportunidad
                                        </button>
                                        <button
                                            onClick={() => setActiveTab('edit')}
                                            className={`px-6 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${activeTab === 'edit'
                                                ? 'bg-primary text-primary-foreground shadow-lg shadow-primary/20'
                                                : 'text-foreground/40 hover:text-foreground hover:bg-accent'
                                                }`}
                                        >
                                            Editar Oportunidad
                                        </button>
                                    </div>

                                    {activeTab === 'edit' && (
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 animate-in fade-in zoom-in-95 duration-300">
                                            {clientOpportunities.length > 0 ? (
                                                clientOpportunities.map((op) => (
                                                    <button
                                                        key={op.id}
                                                        onClick={() => setCurrentOpportunity(op)}
                                                        className={`flex flex-col gap-2 p-6 rounded-2xl border transition-all text-left group ${currentOpportunity.id === op.id
                                                            ? 'bg-primary/10 border-primary shadow-inner'
                                                            : 'bg-card/40 border-border hover:border-primary/40 hover:bg-card'
                                                            }`}
                                                    >
                                                        <div className="flex items-center justify-between">
                                                            <span className="text-[10px] font-black uppercase text-primary tracking-widest">
                                                                {op.dimension || 'Sin dimensión'}
                                                            </span>
                                                            <span className="text-[9px] font-bold text-muted-foreground tabular-nums">
                                                                {new Date(op.created_at).toLocaleDateString('es-PE', {
                                                                    day: '2-digit',
                                                                    month: 'short',
                                                                    year: 'numeric',
                                                                    hour: '2-digit',
                                                                    minute: '2-digit'
                                                                })}
                                                            </span>
                                                        </div>
                                                        <span className="text-xs font-bold text-foreground">
                                                            S/ {op.draft_jsonb.totalCalculated.toLocaleString()} • {op.draft_jsonb.blocks.length} Bloques
                                                        </span>
                                                    </button>
                                                ))
                                            ) : (
                                                <div className="col-span-full p-8 rounded-2xl border border-dashed border-border flex flex-col items-center justify-center text-center gap-2">
                                                    <p className="text-[10px] font-black uppercase text-muted-foreground tracking-widest">Sin oportunidades previas</p>
                                                    <p className="text-[9px] font-medium text-muted-foreground/60 italic">Este cliente aún no tiene registros en el Core</p>
                                                </div>
                                            )}
                                        </div>
                                    )}

                                    <div className="h-px bg-border/40" />

                                    {(activeTab === 'new' || currentOpportunity.id) && (
                                        <div className="space-y-8 animate-in fade-in duration-500">
                                            <label className="text-[11px] font-black uppercase text-foreground/60 tracking-[0.2em] ml-1">
                                                Estructura del Desafío
                                            </label>
                                            <DimensionSelector />
                                        </div>
                                    )}
                                </div>
                            )}
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

            {/* Notification Modal */}
            <Modal
                isOpen={!!saveResult}
                onClose={() => setSaveResult(null)}
                title={saveResult?.success ? "Protocolo Exitoso" : "Falla en el Sistema"}
            >
                <div className="flex flex-col items-center text-center gap-6">
                    <div className={`w-16 h-16 rounded-full flex items-center justify-center ${saveResult?.success ? 'bg-success/20 text-success' : 'bg-destructive/20 text-destructive'}`}>
                        {saveResult?.success ? <CheckCircle2 size={32} /> : <X size={32} />}
                    </div>
                    <div className="space-y-2">
                        <p className="text-sm font-bold text-foreground">
                            {saveResult?.message}
                        </p>
                        {saveResult?.success && (
                            <p className="text-[10px] text-muted-foreground uppercase tracking-widest font-black">
                                El Core ha sido actualizado correctamente
                            </p>
                        )}
                    </div>
                    <button
                        onClick={() => setSaveResult(null)}
                        className={`w-full py-4 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all active:scale-95 ${saveResult?.success ? 'bg-primary text-primary-foreground hover:bg-primary/90' : 'bg-destructive text-destructive-foreground hover:bg-destructive/90'}`}
                    >
                        Entendido
                    </button>
                </div>
            </Modal>

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
