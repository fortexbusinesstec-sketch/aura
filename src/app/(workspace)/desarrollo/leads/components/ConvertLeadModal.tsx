'use client'

import { useState } from 'react'
import { Opportunity } from '@/types'
import { convertLeadToProject } from '../actions'
import { Loader2, AlertTriangle, Rocket, X } from 'lucide-react'

// ------------------------------------------------------------------
// Tipos
// ------------------------------------------------------------------

interface ConvertLeadModalProps {
    lead: Opportunity
    isOpen: boolean
    onClose: () => void
    onSuccess: (projectId: string) => void
}

// ------------------------------------------------------------------
// Componente
// ------------------------------------------------------------------

export function ConvertLeadModal({ lead, isOpen, onClose, onSuccess }: ConvertLeadModalProps) {
    const [isConverting, setIsConverting] = useState(false)
    const [error, setError] = useState('')

    if (!isOpen) return null

    const handleConvert = async () => {
        setIsConverting(true)
        setError('')

        const res = await convertLeadToProject(lead.id)

        setIsConverting(false)

        if (res.success && res.projectId) {
            onSuccess(res.projectId)
            onClose()
        } else {
            setError(res.error || 'Error al convertir el lead')
        }
    }

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            {/* Backdrop */}
            <div
                className="absolute inset-0 bg-black/40 backdrop-blur-sm"
                onClick={!isConverting ? onClose : undefined}
            />

            {/* Modal */}
            <div className="relative bg-card border border-border rounded-2xl sm:rounded-3xl shadow-2xl w-full max-w-md p-6 sm:p-8 space-y-6 animate-in fade-in zoom-in-95 duration-200">
                {/* Close button */}
                <button
                    onClick={onClose}
                    disabled={isConverting}
                    className="absolute top-4 right-4 text-muted-foreground hover:text-foreground disabled:opacity-30"
                >
                    <X size={18} />
                </button>

                {/* Header */}
                <div className="text-center space-y-3">
                    <div className="w-14 h-14 rounded-2xl bg-amber-50 border border-amber-100 flex items-center justify-center mx-auto">
                        <AlertTriangle size={28} className="text-amber-600" />
                    </div>
                    <div className="space-y-1">
                        <p className="text-sm font-black text-foreground uppercase tracking-tight">
                            Convertir a Proyecto
                        </p>
                        <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest max-w-xs mx-auto leading-relaxed">
                            Se creará el proyecto, fases reales y conexión con Linear. ¿Continuar?
                        </p>
                    </div>
                </div>

                {/* Lead info */}
                <div className="bg-secondary/30 rounded-xl border border-border/40 p-4 space-y-2">
                    <div className="flex justify-between items-center">
                        <span className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Cliente</span>
                        <span className="text-xs font-bold text-foreground">{lead.client?.razon_social || '—'}</span>
                    </div>
                    <div className="flex justify-between items-center">
                        <span className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Dimensión</span>
                        <span className="text-xs font-bold text-foreground capitalize">{lead.dimension || '—'}</span>
                    </div>
                    <div className="flex justify-between items-center">
                        <span className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Inversión</span>
                        <span className="text-xs font-bold text-foreground">
                            S/ {lead.draft_jsonb?.totalCalculated?.toLocaleString() || '0'}
                        </span>
                    </div>
                    <div className="flex justify-between items-center">
                        <span className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Fases</span>
                        <span className="text-xs font-bold text-foreground">
                            {lead.phases_plan_jsonb?.length || 0} configuradas
                        </span>
                    </div>
                </div>

                {/* Error */}
                {error && (
                    <div className="flex items-start gap-2 px-3 py-2.5 rounded-xl bg-red-50 text-red-700 border border-red-200 text-[10px] font-bold uppercase tracking-wider">
                        <AlertTriangle size={14} className="shrink-0 mt-0.5" />
                        <span className="leading-tight">{error}</span>
                    </div>
                )}

                {/* Actions */}
                <div className="flex gap-3">
                    <button
                        onClick={onClose}
                        disabled={isConverting}
                        className="flex-1 px-4 py-3 bg-secondary/40 hover:bg-secondary transition-all rounded-xl border border-border/40 active:scale-95 text-[10px] font-black uppercase tracking-widest text-foreground disabled:opacity-50"
                    >
                        Cancelar
                    </button>
                    <button
                        onClick={handleConvert}
                        disabled={isConverting}
                        className="flex-1 px-4 py-3 bg-primary hover:bg-primary/90 transition-all rounded-xl border border-border active:scale-95 text-[10px] font-black uppercase tracking-widest text-primary-foreground disabled:opacity-50 flex items-center justify-center gap-2"
                    >
                        {isConverting ? (
                            <>
                                <Loader2 size={14} className="animate-spin" />
                                Convirtiendo...
                            </>
                        ) : (
                            <>
                                <Rocket size={14} />
                                Convertir
                            </>
                        )}
                    </button>
                </div>
            </div>
        </div>
    )
}
