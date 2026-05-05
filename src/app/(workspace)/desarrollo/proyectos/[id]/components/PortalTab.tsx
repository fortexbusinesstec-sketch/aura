'use client'

import { Globe, ExternalLink } from 'lucide-react'

interface PortalTabProps {
    portalToken: string | null
    pinCode?: string | null
}

export function PortalTab({ portalToken, pinCode }: PortalTabProps) {
    if (!portalToken) {
        return (
            <div className="bg-card border border-border rounded-2xl sm:rounded-3xl p-8 text-center space-y-4">
                <div className="w-16 h-16 rounded-full bg-slate-100 flex items-center justify-center mx-auto">
                    <Globe size={28} className="text-muted-foreground" />
                </div>
                <div className="space-y-1">
                    <p className="text-sm font-black text-foreground uppercase tracking-tight">
                        Portal no disponible
                    </p>
                    <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest max-w-md mx-auto leading-relaxed">
                        Este proyecto no tiene un portal de cliente configurado. Asegúrate de que la oportunidad haya sido publicada.
                    </p>
                </div>
            </div>
        )
    }

    const portalUrl = `/p/${portalToken}`

    return (
        <div className="space-y-6">
            <div className="bg-card border border-border rounded-2xl sm:rounded-3xl p-6 sm:p-10 text-center space-y-5">
                <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mx-auto">
                    <Globe size={28} className="text-primary" />
                </div>
                <div className="space-y-1">
                    <p className="text-sm font-black text-foreground uppercase tracking-tight">
                        Portal del Cliente Activo
                    </p>
                    <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest max-w-md mx-auto leading-relaxed">
                        El cliente tiene acceso a su portal personalizado donde puede revisar fases, entregables y la propuesta original.
                    </p>
                </div>

                {pinCode && (
                    <div className="bg-primary/10 border border-primary/20 rounded-2xl p-4 max-w-xs mx-auto">
                        <p className="text-[10px] font-black text-primary/60 uppercase tracking-widest mb-1">PIN DE ACCESO</p>
                        <p className="text-2xl font-black text-primary tracking-[0.2em]">{pinCode}</p>
                    </div>
                )}

                <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
                    <a
                        href={portalUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-2 px-6 py-3.5 bg-primary hover:bg-primary/90 transition-all rounded-2xl border border-border active:scale-95 text-[10px] font-black uppercase tracking-widest text-primary-foreground shadow-lg shadow-primary/10 w-full sm:w-auto justify-center"
                    >
                        <ExternalLink size={14} />
                        Abrir Portal
                    </a>
                    <button
                        onClick={() => {
                            navigator.clipboard.writeText(`${window.location.origin}${portalUrl}`)
                            alert('Copiado al portapapeles')
                        }}
                        className="inline-flex items-center gap-2 px-6 py-3.5 bg-card hover:bg-accent transition-all rounded-2xl border border-border active:scale-95 text-[10px] font-black uppercase tracking-widest text-foreground w-full sm:w-auto justify-center"
                    >
                        Copiar Enlace
                    </button>
                </div>
            </div>
        </div>
    )
}
