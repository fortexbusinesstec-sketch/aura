'use client'

import { Globe, ExternalLink } from 'lucide-react'

interface PortalTabProps {
    portalToken: string | null
}

export function PortalTab({ portalToken }: PortalTabProps) {
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
                        Este proyecto no tiene un portal de cliente configurado. El portal se genera desde la oportunidad asociada.
                    </p>
                </div>
            </div>
        )
    }

    const portalUrl = `/p/${portalToken}`

    return (
        <div className="space-y-6">
            <div className="bg-card border border-border rounded-2xl sm:rounded-3xl p-6 sm:p-10 text-center space-y-5">
                <div className="w-16 h-16 rounded-full bg-emerald-50 flex items-center justify-center mx-auto">
                    <Globe size={28} className="text-emerald-600" />
                </div>
                <div className="space-y-1">
                    <p className="text-sm font-black text-foreground uppercase tracking-tight">
                        Portal del Cliente Activo
                    </p>
                    <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest max-w-md mx-auto leading-relaxed">
                        El cliente tiene acceso a su portal personalizado donde puede revisar fases, entregables y la propuesta original.
                    </p>
                </div>
                <a
                    href={portalUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 px-6 py-3.5 bg-primary hover:bg-primary/90 transition-all rounded-2xl border border-border active:scale-95 text-[10px] font-black uppercase tracking-widest text-primary-foreground shadow-lg shadow-primary/10"
                >
                    <ExternalLink size={14} />
                    🌐 Abrir Portal del Cliente
                </a>
            </div>
        </div>
    )
}
