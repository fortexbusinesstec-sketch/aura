'use client'

import { Download, MessageSquare, LogOut } from 'lucide-react'

interface PortalHeaderProps {
    client: any
    project: any
    onLogout: () => void
    onOpenComment: () => void
}

const statusConfig: Record<string, { label: string; bg: string; text: string; border: string }> = {
    discovery: { label: 'En Discovery', bg: 'bg-[#F2C272]/15', text: 'text-[#B45309]', border: 'border-[#F2C272]/30' },
    planning: { label: 'En Planificación', bg: 'bg-blue-50', text: 'text-blue-700', border: 'border-blue-200' },
    active: { label: 'En Desarrollo', bg: 'bg-[#A7C7A3]/15', text: 'text-[#166534]', border: 'border-[#A7C7A3]/30' },
    review: { label: 'En Revisión', bg: 'bg-[#F2C272]/15', text: 'text-[#B45309]', border: 'border-[#F2C272]/30' },
    completed: { label: 'Completado', bg: 'bg-[#A7C7A3]/20', text: 'text-[#166534]', border: 'border-[#A7C7A3]/40' },
    cancelled: { label: 'Cancelado', bg: 'bg-[#DF7B71]/15', text: 'text-[#991B1B]', border: 'border-[#DF7B71]/30' },
    maintenance: { label: 'En Mantenimiento', bg: 'bg-slate-100', text: 'text-slate-600', border: 'border-slate-200' },
}

export function PortalHeader({ client, project, onLogout, onOpenComment }: PortalHeaderProps) {
    const status = project?.status || 'discovery'
    const cfg = statusConfig[status] || statusConfig.discovery

    return (
        <header className="sticky top-0 z-30 bg-white/90 backdrop-blur-md border-b border-slate-200/60">
            <div className="max-w-[1440px] mx-auto px-4 sm:px-6">
                <div className="flex items-center justify-between py-3 gap-4">
                    {/* Logo */}
                    <div className="flex items-center gap-2.5 shrink-0">
                        <div className="w-8 h-8 bg-[#1E3A5F] rounded-lg flex items-center justify-center">
                            <span className="text-white font-black text-[10px]">A</span>
                        </div>
                        <span className="hidden sm:block font-extrabold tracking-tighter text-xs uppercase text-slate-900">Aura OS</span>
                    </div>

                    {/* Centro: Info Cliente */}
                    <div className="flex-1 min-w-0 flex flex-col items-center">
                        <div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">
                            <span>Propuesta Estratégica</span>
                        </div>
                        <div className="flex items-center gap-2 mt-0.5">
                            <span className="text-sm font-bold text-slate-900 truncate max-w-[200px] sm:max-w-sm">
                                {client?.razon_social || 'Cliente'}
                            </span>
                            <span className="hidden sm:inline text-[10px] text-slate-400 font-bold">
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
                            <button className="flex items-center gap-1.5 px-3 py-2 rounded-lg border border-slate-200 text-[10px] font-black uppercase tracking-wider text-slate-600 hover:bg-slate-50 transition-colors">
                                <Download size={12} /> PDF
                            </button>
                            <button
                                onClick={onOpenComment}
                                className="flex items-center gap-1.5 px-3 py-2 rounded-lg bg-[#1E3A5F] text-white text-[10px] font-black uppercase tracking-wider hover:bg-[#152d4a] transition-colors"
                            >
                                <MessageSquare size={12} /> Comentar
                            </button>
                            <button
                                onClick={onLogout}
                                className="flex items-center gap-1.5 px-3 py-2 rounded-lg border border-slate-200 text-[10px] font-black uppercase tracking-wider text-slate-400 hover:text-slate-600 hover:bg-slate-50 transition-colors"
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
