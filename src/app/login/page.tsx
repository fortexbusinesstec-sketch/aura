'use client'

import { useActionState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { AlertCircle, Loader2 } from 'lucide-react'
import { login } from './actions'

export default function LoginPage() {
    const router = useRouter()
    const [state, formAction, isPending] = useActionState(login, null)

    useEffect(() => {
        if (state?.success) {
            router.push('/entorno')
        }
    }, [state, router])

    return (
        <div className="relative flex min-h-screen items-center justify-center overflow-hidden bg-background p-4 font-montserrat">
            {/* Fondo suave con destellos ambarinos */}
            <div className="absolute inset-0 overflow-hidden pointer-events-none">
                <div className="absolute top-[-20%] left-[-10%] w-[50%] h-[50%] rounded-full bg-primary/20 blur-[120px]" />
                <div className="absolute bottom-[-15%] right-[-10%] w-[40%] h-[40%] rounded-full bg-secondary/30 blur-[100px]" />
            </div>

            {/* Contenedor principal */}
            <div className="z-10 w-full max-w-md">
                <div className="relative overflow-hidden rounded-2xl border border-border bg-card p-8 shadow-lg">

                    {/* Marca / Branding */}
                    <div className="mb-10 text-center">
                        {/* Título con color de foreground oscuro — legible sobre blanco */}
                        <h1 className="text-4xl font-extrabold tracking-tighter text-foreground">
                            Aura <span className="text-primary-foreground">OS</span>
                        </h1>
                        <p className="mt-2 text-xs font-bold tracking-[0.3em] text-muted-foreground uppercase">
                            Ecosistema Operativo
                        </p>
                    </div>

                    {/* Indicador de Error */}
                    {state?.error && (
                        <div className="mb-6 flex items-center gap-3 rounded-lg border border-destructive/30 bg-destructive/10 p-4 text-sm text-destructive animate-in slide-in-from-top-2 duration-300">
                            <AlertCircle className="h-5 w-5 shrink-0" />
                            <p>{state.error}</p>
                        </div>
                    )}

                    {/* Formulario */}
                    <form action={formAction} className="space-y-6">
                        <div className="space-y-4">
                            <div className="space-y-1.5">
                                <label htmlFor="email" className="text-xs font-bold uppercase tracking-wider text-foreground">
                                    Terminal ID (Email)
                                </label>
                                <input
                                    id="email"
                                    name="email"
                                    type="email"
                                    required
                                    autoFocus
                                    className="block w-full rounded-xl border border-border bg-background px-4 py-3 text-foreground placeholder:text-muted-foreground transition-all outline-none focus:border-primary focus:ring-2 focus:ring-primary/20"
                                    placeholder="admin@aura.os"
                                />
                            </div>
                            <div className="space-y-1.5">
                                <label htmlFor="password" className="text-xs font-bold uppercase tracking-wider text-foreground">
                                    Código de Acceso
                                </label>
                                <input
                                    id="password"
                                    name="password"
                                    type="password"
                                    required
                                    className="block w-full rounded-xl border border-border bg-background px-4 py-3 text-foreground placeholder:text-muted-foreground transition-all outline-none focus:border-primary focus:ring-2 focus:ring-primary/20"
                                    placeholder="••••••••"
                                />
                            </div>
                        </div>

                        {/* Botón principal — usa foreground oscuro sobre primary dorado */}
                        <button
                            type="submit"
                            disabled={isPending}
                            className="group relative flex w-full items-center justify-center gap-2 overflow-hidden rounded-xl bg-foreground px-4 py-3 text-sm font-bold text-background transition-all hover:bg-foreground/90 active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-70"
                        >
                            {isPending ? (
                                <>
                                    <Loader2 className="h-4 w-4 animate-spin" />
                                    <span>Iniciando núcleo...</span>
                                </>
                            ) : (
                                <span>Sincronizar Terminal</span>
                            )}
                        </button>
                    </form>

                    <div className="mt-8 text-center border-t border-border pt-6">
                        <span className="text-[10px] text-muted-foreground uppercase tracking-widest font-bold">
                            Secure Interface v1.0.42
                        </span>
                    </div>
                </div>
            </div>
        </div>
    )
}
