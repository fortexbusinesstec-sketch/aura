'use client'

import { useState } from 'react'
import { X, Send, Loader2, MessageSquare, AlertCircle } from 'lucide-react'

interface CommentModalProps {
    onClose: () => void
    onSubmit: (comment: string, type: string) => void
}

const commentTypes = [
    { id: 'feedback', label: 'Feedback', color: 'bg-blue-50 text-blue-700 border-blue-200' },
    { id: 'question', label: 'Pregunta', color: 'bg-amber-50 text-amber-700 border-amber-200' },
    { id: 'urgent', label: 'Urgente', color: 'bg-red-50 text-red-700 border-red-200' },
]

export function CommentModal({ onClose, onSubmit }: CommentModalProps) {
    const [comment, setComment] = useState('')
    const [type, setType] = useState('feedback')
    const [isSubmitting, setIsSubmitting] = useState(false)
    const [error, setError] = useState('')

    const handleSubmit = async () => {
        if (!comment.trim()) {
            setError('Escribe un comentario')
            return
        }

        setIsSubmitting(true)
        setError('')

        // Simulate API delay
        await new Promise(resolve => setTimeout(resolve, 600))

        onSubmit(comment.trim(), type)
        setIsSubmitting(false)
        onClose()
    }

    return (
        <div className="fixed inset-0 z-[200] flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={onClose} />
            <div className="relative z-10 w-full max-w-md bg-white rounded-3xl shadow-2xl overflow-hidden">
                <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100">
                    <h3 className="text-sm font-black text-slate-900 uppercase tracking-tight">Dejar Comentario</h3>
                    <button onClick={onClose} className="text-slate-400 hover:text-slate-600 transition-colors">
                        <X size={18} />
                    </button>
                </div>

                <div className="p-6 space-y-5">
                    {/* Type selector */}
                    <div className="space-y-2">
                        <label className="text-[10px] font-black uppercase tracking-widest text-slate-400">Tipo de mensaje</label>
                        <div className="flex gap-2">
                            {commentTypes.map((t) => (
                                <button
                                    key={t.id}
                                    onClick={() => setType(t.id)}
                                    className={`px-3 py-2 rounded-xl text-[10px] font-black uppercase tracking-wider border transition-all ${
                                        type === t.id ? t.color + ' ring-2 ring-offset-1' : 'bg-white text-slate-400 border-slate-200 hover:border-slate-300'
                                    }`}
                                >
                                    {t.label}
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Comment textarea */}
                    <div className="space-y-1.5">
                        <label className="text-[10px] font-black uppercase tracking-widest text-slate-400">Tu mensaje</label>
                        <textarea
                            value={comment}
                            onChange={(e) => setComment(e.target.value)}
                            placeholder="Describe tu comentario, pregunta o solicitud..."
                            rows={4}
                            className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-xs font-bold text-slate-900 outline-none focus:border-[#1E3A5F] focus:ring-4 focus:ring-[#1E3A5F]/10 transition-all resize-none"
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
                        className="w-full flex items-center justify-center gap-2 rounded-2xl bg-[#1E3A5F] px-6 py-4 text-xs font-black uppercase tracking-widest text-white hover:bg-[#152d4a] disabled:opacity-50 transition-all active:scale-[0.98]"
                    >
                        {isSubmitting ? (
                            <>
                                <Loader2 size={14} className="animate-spin" />
                                Enviando...
                            </>
                        ) : (
                            <>
                                <Send size={14} />
                                Enviar Comentario
                            </>
                        )}
                    </button>
                </div>
            </div>
        </div>
    )
}
