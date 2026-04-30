'use client'

import { useState } from 'react'
import { createClient } from '@/utils/supabase/client'
import { X, CheckCircle2, Loader2, FileText, AlertCircle } from 'lucide-react'

interface ApprovePhaseModalProps {
    phase: any
    projectId: string
    onClose: () => void
    onApproved: () => void
}

export function ApprovePhaseModal({ phase, projectId, onClose, onApproved }: ApprovePhaseModalProps) {
    const [approvedBy, setApprovedBy] = useState('')
    const [confirmed, setConfirmed] = useState(false)
    const [isSubmitting, setIsSubmitting] = useState(false)
    const [error, setError] = useState('')

    const supabase = createClient()

    const handleSubmit = async () => {
        if (!confirmed) {
            setError('Debes confirmar que revisaste la fase')
            return
        }
        if (!approvedBy.trim()) {
            setError('Ingresa tu nombre')
            return
        }

        setIsSubmitting(true)
        setError('')

        const now = new Date().toISOString()

        // Update phase approval
        const { error: updateError } = await supabase
            .from('project_phases')
            .update({
                client_approved_at: now,
                status: 'approved',
                updated_at: now,
            })
            .eq('id', phase.id)

        if (updateError) {
            setError(updateError.message)
            setIsSubmitting(false)
            return
        }

        // Create approval record
        await supabase.from('project_approvals').insert({
            project_id: projectId,
            phase_id: phase.id,
            approval_type: `phase_${phase.phase_key}`,
            status: 'approved',
            scope_snapshot: {},
            approved_at: now,
            approved_by_client_name: approvedBy.trim(),
            additional_cost: 0,
            additional_days: 0,
        })

        setIsSubmitting(false)
        onApproved()
        onClose()
    }

    const deliverables = phase?.deliverables || []

    return (
        <div className="fixed inset-0 z-[200] flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={onClose} />
            <div className="relative z-10 w-full max-w-md bg-white rounded-3xl shadow-2xl overflow-hidden">
                <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100">
                    <h3 className="text-sm font-black text-slate-900 uppercase tracking-tight">Aprobar Fase</h3>
                    <button onClick={onClose} className="text-slate-400 hover:text-slate-600 transition-colors">
                        <X size={18} />
                    </button>
                </div>

                <div className="p-6 space-y-5">
                    {/* Phase info */}
                    <div className="rounded-xl bg-slate-50 border border-slate-100 p-4">
                        <p className="text-xs font-black text-slate-900">{phase.phase_name}</p>
                        <p className="text-[10px] text-slate-500 mt-1">
                            {phase.planned_start_date} → {phase.planned_end_date}
                        </p>
                    </div>

                    {/* Deliverables / Notes */}
                    {phase.client_visible_notes && (
                        <div className="space-y-2">
                            <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">Notas del entregable</p>
                            <p className="text-xs text-slate-600 leading-relaxed">{phase.client_visible_notes}</p>
                        </div>
                    )}

                    {deliverables.length > 0 && (
                        <div className="space-y-2">
                            <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">Archivos entregados</p>
                            <div className="space-y-1.5">
                                {deliverables.map((d: any, i: number) => (
                                    <a
                                        key={i}
                                        href={d.url}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="flex items-center gap-2 rounded-lg border border-slate-100 bg-white px-3 py-2 text-xs font-bold text-[#1E3A5F] hover:bg-slate-50 transition-colors"
                                    >
                                        <FileText size={12} />
                                        {d.name}
                                    </a>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Checkbox */}
                    <label className="flex items-start gap-3 cursor-pointer">
                        <input
                            type="checkbox"
                            checked={confirmed}
                            onChange={(e) => setConfirmed(e.target.checked)}
                            className="mt-0.5 w-4 h-4 rounded border-slate-300 text-[#1E3A5F] focus:ring-[#1E3A5F]"
                        />
                        <span className="text-xs text-slate-700 font-medium leading-relaxed">
                            He revisado y apruebo esta fase para continuar con el siguiente paso del proyecto.
                        </span>
                    </label>

                    {/* Name input */}
                    <div className="space-y-1.5">
                        <label className="text-[10px] font-black uppercase tracking-widest text-slate-400">Nombre de quien aprueba</label>
                        <input
                            type="text"
                            value={approvedBy}
                            onChange={(e) => setApprovedBy(e.target.value)}
                            placeholder="Ej: Carlos Mendoza"
                            className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-xs font-bold text-slate-900 outline-none focus:border-[#1E3A5F] focus:ring-4 focus:ring-[#1E3A5F]/10 transition-all"
                        />
                    </div>

                    {error && (
                        <div className="flex items-center gap-2 rounded-xl bg-red-50 border border-red-100 px-4 py-3 text-red-700">
                            <AlertCircle size={14} />
                            <p className="text-xs font-bold">{error}</p>
                        </div>
                    )}

                    <button
                        onClick={handleSubmit}
                        disabled={isSubmitting}
                        className="w-full flex items-center justify-center gap-2 rounded-2xl bg-[#059669] px-6 py-4 text-xs font-black uppercase tracking-widest text-white hover:bg-[#047857] disabled:opacity-50 transition-all active:scale-[0.98]"
                    >
                        {isSubmitting ? (
                            <>
                                <Loader2 size={14} className="animate-spin" />
                                Procesando...
                            </>
                        ) : (
                            <>
                                <CheckCircle2 size={14} />
                                Confirmar Aprobación
                            </>
                        )}
                    </button>
                </div>
            </div>
        </div>
    )
}
