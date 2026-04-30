'use client'

import { Project } from '@/types'
import { Coins, TrendingDown, TrendingUp, Wallet } from 'lucide-react'

// ------------------------------------------------------------------
// Tipos
// ------------------------------------------------------------------

interface FinancesTabProps {
    project: Project
    opportunityDraft?: { totalCalculated?: number; totalCapex?: number; totalOpex?: number } | null
}

// ------------------------------------------------------------------
// Helpers
// ------------------------------------------------------------------

function formatCurrency(value: number | null | undefined): string {
    if (value === null || value === undefined) return 'S/ 0.00'
    return `S/ ${value.toLocaleString('es-PE', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
}

// ------------------------------------------------------------------
// Componente
// ------------------------------------------------------------------

export function FinancesTab({ project, opportunityDraft }: FinancesTabProps) {
    const allocated = project.budget_allocated || 0
    const consumed = project.budget_consumed || 0
    const remaining = allocated - consumed
    const pctConsumed = allocated > 0 ? Math.round((consumed / allocated) * 100) : 0

    return (
        <div className="space-y-6">
            {/* Resumen financiero */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="bg-card border border-border rounded-2xl p-5 space-y-3">
                    <div className="flex items-center gap-2 text-[9px] font-black uppercase tracking-widest text-muted-foreground">
                        <Wallet size={12} />
                        Presupuesto Total
                    </div>
                    <p className="text-2xl font-black text-foreground italic tracking-tight">
                        {formatCurrency(allocated)}
                    </p>
                    {opportunityDraft?.totalCalculated && (
                        <p className="text-[10px] font-bold text-muted-foreground">
                            Según propuesta original
                        </p>
                    )}
                </div>

                <div className="bg-card border border-border rounded-2xl p-5 space-y-3">
                    <div className="flex items-center gap-2 text-[9px] font-black uppercase tracking-widest text-muted-foreground">
                        <TrendingDown size={12} />
                        Consumido
                    </div>
                    <p className="text-2xl font-black text-foreground italic tracking-tight">
                        {formatCurrency(consumed)}
                    </p>
                    <div className="h-2 w-full bg-secondary rounded-full overflow-hidden">
                        <div
                            className={`h-full rounded-full transition-all ${
                                pctConsumed > 90 ? 'bg-red-500' : pctConsumed > 70 ? 'bg-amber-500' : 'bg-emerald-500'
                            }`}
                            style={{ width: `${Math.min(pctConsumed, 100)}%` }}
                        />
                    </div>
                    <p className="text-[10px] font-bold text-muted-foreground">
                        {pctConsumed}% ejecutado
                    </p>
                </div>

                <div className="bg-card border border-border rounded-2xl p-5 space-y-3">
                    <div className="flex items-center gap-2 text-[9px] font-black uppercase tracking-widest text-muted-foreground">
                        <TrendingUp size={12} />
                        Pendiente
                    </div>
                    <p className={`text-2xl font-black italic tracking-tight ${remaining < 0 ? 'text-red-600' : 'text-foreground'}`}>
                        {formatCurrency(remaining)}
                    </p>
                    <p className="text-[10px] font-bold text-muted-foreground">
                        {remaining < 0 ? 'Sobre presupuesto' : 'Disponible'}
                    </p>
                </div>
            </div>

            {/* Detalle de oportunidad original */}
            {opportunityDraft && (
                <div className="bg-card border border-border rounded-2xl p-5 space-y-4">
                    <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground border-b border-border/40 pb-3">
                        Datos de la Propuesta Original
                    </p>
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                        <div className="space-y-1">
                            <p className="text-[9px] font-black text-muted-foreground uppercase tracking-widest">Inversión CAPEX</p>
                            <p className="text-sm font-bold text-foreground">{formatCurrency(opportunityDraft.totalCapex)}</p>
                        </div>
                        <div className="space-y-1">
                            <p className="text-[9px] font-black text-muted-foreground uppercase tracking-widest">Suscripción OPEX</p>
                            <p className="text-sm font-bold text-foreground">{formatCurrency(opportunityDraft.totalOpex)}</p>
                        </div>
                        <div className="space-y-1">
                            <p className="text-[9px] font-black text-muted-foreground uppercase tracking-widest">Total Calculado</p>
                            <p className="text-sm font-bold text-foreground">{formatCurrency(opportunityDraft.totalCalculated)}</p>
                        </div>
                    </div>
                </div>
            )}

            {/* Placeholder costo por fase */}
            <div className="bg-card border border-border rounded-2xl p-5 space-y-4">
                <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground border-b border-border/40 pb-3">
                    Costo por Fase
                </p>
                <div className="text-center py-8 border-2 border-dashed border-border rounded-xl">
                    <Coins size={24} className="mx-auto text-muted-foreground/30 mb-2" />
                    <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground/60">
                        Tracking de horas reales por fase en desarrollo
                    </p>
                    <p className="text-[10px] text-muted-foreground/40 mt-1">
                        Conecta con Linear para importar horas logueadas
                    </p>
                </div>
            </div>
        </div>
    )
}
