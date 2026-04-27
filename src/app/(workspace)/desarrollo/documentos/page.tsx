'use client'

import React, { useState } from 'react'
import dynamic from 'next/dynamic'
import { BackButton } from '@/components/ui/BackButton'
import { PageHeader } from '@/components/ui/PageHeader'
import { FileText, FileSignature, FileArchive } from 'lucide-react'

const ProposalAutomator = dynamic(
    () => import('./components/ProposalAutomator').then(mod => mod.ProposalAutomator),
    {
        ssr: false,
        loading: () => (
            <div className="flex-1 flex items-center justify-center p-12 text-foreground/40 font-black uppercase tracking-[0.2em] text-xs">
                Cargando Módulo de Propuestas...
            </div>
        )
    }
)

type TabType = 'cotizacion' | 'contrato' | 'archivo'

export default function DocumentosPage() {
    const [activeTab, setActiveTab] = useState<TabType>('cotizacion')

    return (
        <div className="space-y-8 h-full flex flex-col">
            <div className="flex-shrink-0">
                <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
                    <PageHeader
                        title="Aura Document System"
                        subtitle="Generación inteligente de propuestas y activos legales"
                    />

                    {/* Tab Navigation */}
                    <div className="flex items-center gap-2 p-1.5 bg-card/40 border border-border rounded-2xl w-fit h-fit">
                        <button
                            onClick={() => setActiveTab('cotizacion')}
                            className={`flex items-center gap-2 px-6 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${activeTab === 'cotizacion'
                                ? 'bg-primary text-sky-950 shadow-lg shadow-primary/20'
                                : 'text-foreground/40 hover:text-foreground hover:bg-accent'
                                }`}
                        >
                            <FileText size={14} />
                            Cotización
                        </button>
                        <button
                            onClick={() => setActiveTab('contrato')}
                            className={`flex items-center gap-2 px-6 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${activeTab === 'contrato'
                                ? 'bg-primary text-sky-950 shadow-lg shadow-primary/20'
                                : 'text-foreground/40 hover:text-foreground hover:bg-accent'
                                }`}
                        >
                            <FileSignature size={14} />
                            Contrato
                        </button>
                        <button
                            onClick={() => setActiveTab('archivo')}
                            className={`flex items-center gap-2 px-6 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${activeTab === 'archivo'
                                ? 'bg-primary text-sky-950 shadow-lg shadow-primary/20'
                                : 'text-foreground/40 hover:text-foreground hover:bg-accent'
                                }`}
                        >
                            <FileArchive size={14} />
                            Archivo
                        </button>
                    </div>
                </div>
            </div>

            <div className="flex-1 min-h-0">
                {activeTab === 'cotizacion' && <ProposalAutomator />}

                {activeTab === 'contrato' && (
                    <div className="flex flex-col items-center justify-center p-20 border-2 border-dashed border-border rounded-3xl opacity-40">
                        <FileSignature size={48} className="mb-4" />
                        <p className="text-xs font-black uppercase tracking-widest">Módulo en Desarrollo</p>
                    </div>
                )}

                {activeTab === 'archivo' && (
                    <div className="flex flex-col items-center justify-center p-20 border-2 border-dashed border-border rounded-3xl opacity-40">
                        <FileArchive size={48} className="mb-4" />
                        <p className="text-xs font-black uppercase tracking-widest">Historial de Documentos</p>
                    </div>
                )}
            </div>
        </div>
    )
}
