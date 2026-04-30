'use client'

import { useState, useRef, useEffect } from 'react'
import { createClient } from '@/utils/supabase/client'
import { Loader2, Shield } from 'lucide-react'

interface PinScreenProps {
    portalToken: string
    onSuccess: () => void
}

export function PinScreen({ portalToken, onSuccess }: PinScreenProps) {
    const [pin, setPin] = useState(['', '', '', ''])
    const [isSubmitting, setIsSubmitting] = useState(false)
    const [error, setError] = useState('')
    const inputRefs = useRef<(HTMLInputElement | null)[]>([])
    const supabase = createClient()

    useEffect(() => {
        inputRefs.current[0]?.focus()
    }, [])

    const handleChange = (index: number, value: string) => {
        if (!/^\d*$/.test(value)) return
        const next = [...pin]
        next[index] = value.slice(-1)
        setPin(next)
        setError('')

        if (value && index < 3) {
            inputRefs.current[index + 1]?.focus()
        }
    }

    const handleKeyDown = (index: number, e: React.KeyboardEvent) => {
        if (e.key === 'Backspace' && !pin[index] && index > 0) {
            inputRefs.current[index - 1]?.focus()
        }
        if (e.key === 'Enter') {
            handleSubmit()
        }
    }

    const handleSubmit = async () => {
        const enteredPin = pin.join('')
        if (enteredPin.length < 4) {
            setError('Ingresa los 4 dígitos')
            return
        }

        setIsSubmitting(true)
        setError('')

        const { data: client, error: clientError } = await supabase
            .from('clients')
            .select('id, pin_code')
            .eq('portal_token', portalToken)
            .single()

        if (clientError || !client) {
            setError('Portal no encontrado. Contacta a tu asesor.')
            setIsSubmitting(false)
            return
        }

        if (client.pin_code !== enteredPin) {
            setError('PIN incorrecto. Contacta a tu asesor.')
            setIsSubmitting(false)
            return
        }

        // Save session to localStorage
        localStorage.setItem(`aura_portal_${portalToken}`, JSON.stringify({
            pin: enteredPin,
            authenticated: true,
            timestamp: Date.now()
        }))

        setIsSubmitting(false)
        onSuccess()
    }

    return (
        <div className="min-h-screen bg-white flex items-center justify-center px-4">
            <div className="w-full max-w-sm space-y-8">
                {/* Logo */}
                <div className="text-center space-y-3">
                    <div className="w-16 h-16 bg-[#1E3A5F] rounded-2xl flex items-center justify-center mx-auto">
                        <span className="text-white font-black text-xl">A</span>
                    </div>
                    <div>
                        <h1 className="text-xl font-black text-slate-900 tracking-tight">Portal de Propuestas</h1>
                        <p className="text-sm text-muted-foreground mt-1">Aura OS • Fortex Digital</p>
                    </div>
                </div>

                {/* PIN Input */}
                <div className="space-y-4">
                    <p className="text-center text-xs font-bold text-muted-foreground uppercase tracking-widest">
                        Ingresa tu PIN de 4 dígitos
                    </p>

                    <div className="flex items-center justify-center gap-2">
                        {[0, 1, 2, 3].map((i) => (
                            <input
                                key={i}
                                ref={(el) => { inputRefs.current[i] = el }}
                                type="password"
                                inputMode="numeric"
                                maxLength={1}
                                value={pin[i]}
                                onChange={(e) => handleChange(i, e.target.value)}
                                onKeyDown={(e) => handleKeyDown(i, e)}
                                className={`w-12 h-14 rounded-xl border-2 text-center text-xl font-black text-slate-900 outline-none transition-all ${
                                    error
                                        ? 'border-red-300 bg-red-50 focus:border-red-500 focus:ring-4 focus:ring-red-100'
                                        : 'border-slate-200 bg-white focus:border-[#1E3A5F] focus:ring-4 focus:ring-[#1E3A5F]/10'
                                }`}
                            />
                        ))}
                    </div>

                    {error && (
                        <div className="flex items-center gap-2 justify-center text-red-600 text-xs font-bold">
                            <Shield size={14} />
                            {error}
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
                                Verificando...
                            </>
                        ) : (
                            'Acceder a mi Propuesta'
                        )}
                    </button>
                </div>

                <p className="text-center text-[10px] text-muted-foreground font-medium">
                    ¿No tienes PIN? Contacta a tu asesor comercial.
                </p>
            </div>
        </div>
    )
}
