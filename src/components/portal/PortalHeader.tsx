'use client'

import { Download, MessageSquare, LogOut } from 'lucide-react'

interface PortalHeaderProps {
    client: any
    project: any
    onLogout: () => void
    onOpenComment: () => void
}

const statusConfig: Record<string, { label: string; bg: string; text: string; border: string }> = {
    draft: { label: 'Borrador', bg: 'bg-muted', text: 'text-muted-foreground', border: 'border-border' },
    discovery: { label: 'En Discovery', bg: 'bg-warning/15', text: 'text-warning-foreground', border: 'border-warning/30' },
    proposal: { label: 'En Propuesta', bg: 'bg-accent/15', text: 'text-accent-foreground', border: 'border-accent/30' },
    published: { label: 'Publicado', bg: 'bg-success/15', text: 'text-success-foreground', border: 'border-success/30' },
    approved: { label: 'Aprobado', bg: 'bg-warning/20', text: 'text-warning-foreground', border: 'border-warning/40' },
    planning: { label: 'En Planificación', bg: 'bg-accent/10', text: 'text-accent-foreground', border: 'border-accent/20' },
    active: { label: 'En Desarrollo', bg: 'bg-warning/15', text: 'text-warning-foreground', border: 'border-warning/30' },
    review: { label: 'En Revisión', bg: 'bg-warning/15', text: 'text-warning-foreground', border: 'border-warning/30' },
    completed: { label: 'Completado', bg: 'bg-success/20', text: 'text-success-foreground', border: 'border-success/40' },
    cancelled: { label: 'Cancelado', bg: 'bg-destructive/15', text: 'text-destructive', border: 'border-destructive/30' },
    maintenance: { label: 'En Mantenimiento', bg: 'bg-muted', text: 'text-muted-foreground', border: 'border-border' },
}

export function PortalHeader({ client, project, onLogout, onOpenComment }: PortalHeaderProps) {
    const status = project?.status || 'draft'
    const cfg = statusConfig[status] || statusConfig.draft

    return (
        <header className="sticky top-0 z-30 bg-card/90 backdrop-blur-md border-b border-border/50">
            <div className="max-w-[1440px] mx-auto px-4 sm:px-6">
                <div className="flex items-center justify-between py-3 gap-4">
                    {/* Logo */}
                    <div className="flex items-center gap-2.5 shrink-0">
                        <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
                            <span className="text-primary-foreground font-black text-[10px]">A</span>
                        </div>
                        <span className="hidden sm:block font-extrabold tracking-tighter text-xs uppercase text-foreground">Aura OS</span>
                    </div>

                    {/* Centro: Info Cliente */}
                    <div className="flex-1 min-w-0 flex flex-col items-center">
                        <div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground">
                            <span>Propuesta Estratégica</span>
                        </div>
                        <div className="flex items-center gap-2 mt-0.5">
                            <span className="text-sm font-bold text-foreground truncate max-w-[200px] sm:max-w-sm">
                                {client?.razon_social || 'Cliente'}
                            </span>
                            <span className="hidden sm:inline text-[10px] text-muted-foreground font-bold">
                                RUC {client?.ruc || '-'}
                            </span>
                        </div>
                    </div>

                    {/* Derecha: Estado + Botones */}
                    <div className="flex items-center gap-2 shrink-0">
                        <span className={`hidden md:inline-flex items-center px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-wider border ${cfg.bg} ${cfg.text} ${cfg.border}`}>
                            {cfg.label}
                        </span>
                        <div className="hidden lg:flex items-center gap-1.5">
                            <button className="flex items-center gap-1.5 px-3 py-2 rounded-lg border border-border text-[10px] font-black uppercase tracking-wider text-muted-foreground hover:bg-secondary transition-colors">
                                <Download size={12} /> PDF
                            </button>
                            <button
                                onClick={onOpenComment}
                                className="flex items-center gap-1.5 px-3 py-2 rounded-lg bg-primary text-primary-foreground text-[10px] font-black uppercase tracking-wider hover:bg-primary/90 transition-colors"
                            >
                                <MessageSquare size={12} /> Comentar
                            </button>
                            <button
                                onClick={onLogout}
                                className="flex items-center gap-1.5 px-3 py-2 rounded-lg border border-border text-[10px] font-black uppercase tracking-wider text-muted-foreground/60 hover:text-muted-foreground hover:bg-secondary transition-colors"
                            >
                                <LogOut size={12} /> Salir
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </header>
    )
}
