'use client'

import { Project, Client } from '@/types'
import { Profile } from '@/lib/repositories/ProfileRepository'
import {
    Mail,
    Calendar,
    Bug,
    User,
    Send,
    Briefcase,
    Globe,
} from 'lucide-react'

// ------------------------------------------------------------------
// Tipos
// ------------------------------------------------------------------

interface SidebarPanelProps {
    project: Project
    client: Client | null
    leadDev: Profile | null
    projectManager: Profile | null
    portalToken: string | null
}

// ------------------------------------------------------------------
// Helpers
// ------------------------------------------------------------------

function getInitials(name: string | null | undefined): string {
    if (!name) return '?'
    return name
        .split(' ')
        .map((w) => w[0])
        .slice(0, 2)
        .join('')
        .toUpperCase()
}

// ------------------------------------------------------------------
// Componente
// ------------------------------------------------------------------

export function SidebarPanel({ project, client, leadDev, projectManager, portalToken }: SidebarPanelProps) {
    return (
        <div className="space-y-6">
            {/* Equipo */}
            <div className="bg-card border border-border rounded-2xl sm:rounded-3xl p-5 space-y-4">
                <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground border-b border-border/40 pb-3">
                    Equipo Asignado
                </p>

                <div className="space-y-3">
                    {/* Lead Dev */}
                    <div className="flex items-center gap-3">
                        {leadDev?.avatar_url ? (
                            <img
                                src={leadDev.avatar_url}
                                alt={leadDev.full_name}
                                className="w-10 h-10 rounded-xl object-cover border border-border/50"
                            />
                        ) : (
                            <div className="w-10 h-10 rounded-xl bg-primary/10 border border-border/50 flex items-center justify-center text-primary text-[10px] font-black">
                                {getInitials(leadDev?.full_name || 'LD')}
                            </div>
                        )}
                        <div>
                            <p className="text-xs font-bold text-foreground uppercase tracking-tight">
                                {leadDev?.full_name || 'Sin asignar'}
                            </p>
                            <p className="text-[9px] font-black text-muted-foreground uppercase tracking-widest">
                                Lead Developer
                            </p>
                        </div>
                    </div>

                    {/* PM */}
                    <div className="flex items-center gap-3">
                        {projectManager?.avatar_url ? (
                            <img
                                src={projectManager.avatar_url}
                                alt={projectManager.full_name}
                                className="w-10 h-10 rounded-xl object-cover border border-border/50"
                            />
                        ) : (
                            <div className="w-10 h-10 rounded-xl bg-primary/10 border border-border/50 flex items-center justify-center text-primary text-[10px] font-black">
                                {getInitials(projectManager?.full_name || 'PM')}
                            </div>
                        )}
                        <div>
                            <p className="text-xs font-bold text-foreground uppercase tracking-tight">
                                {projectManager?.full_name || 'Sin asignar'}
                            </p>
                            <p className="text-[9px] font-black text-muted-foreground uppercase tracking-widest">
                                Project Manager
                            </p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Cliente */}
            <div className="bg-card border border-border rounded-2xl sm:rounded-3xl p-5 space-y-4">
                <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground border-b border-border/40 pb-3">
                    Cliente
                </p>

                <div className="space-y-3">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-primary/10 border border-border/20 flex items-center justify-center text-primary">
                            <Briefcase size={18} />
                        </div>
                        <div>
                            <p className="text-xs font-bold text-foreground uppercase tracking-tight">
                                {client?.razon_social || '—'}
                            </p>
                            <p className="text-[9px] font-black text-muted-foreground uppercase tracking-widest">
                                {client?.ruc ? `RUC ${client.ruc}` : ''}
                            </p>
                        </div>
                    </div>

                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-secondary/50 border border-border/50 flex items-center justify-center text-muted-foreground">
                            <User size={18} />
                        </div>
                        <div>
                            <p className="text-xs font-bold text-foreground uppercase tracking-tight">
                                {client?.persona_contacto || '—'}
                            </p>
                            <p className="text-[9px] font-black text-muted-foreground uppercase tracking-widest">
                                Contacto Principal
                            </p>
                        </div>
                    </div>

                    {client?.email && (
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-xl bg-secondary/50 border border-border/50 flex items-center justify-center text-muted-foreground">
                                <Mail size={18} />
                            </div>
                            <div>
                                <p className="text-xs font-bold text-foreground truncate max-w-[180px]">
                                    {client.email}
                                </p>
                                <p className="text-[9px] font-black text-muted-foreground uppercase tracking-widest">
                                    Email
                                </p>
                            </div>
                        </div>
                    )}
                </div>
            </div>

            {/* Acciones rápidas */}
            <div className="bg-card border border-border rounded-2xl sm:rounded-3xl p-5 space-y-3">
                <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground border-b border-border/40 pb-3">
                    Acciones Rápidas
                </p>

                <div className="space-y-3">
                    {portalToken && (
                        <div className="pt-2 border-t border-border/40 mb-3">
                            <p className="text-[9px] font-black uppercase tracking-widest text-muted-foreground mb-2">
                                Acceso al Portal
                            </p>
                            <div className="bg-secondary/30 rounded-xl p-3 border border-border/30 space-y-2">
                                <div className="flex items-center justify-between">
                                    <span className="text-[10px] font-bold text-muted-foreground uppercase">PIN</span>
                                    <span className="text-xs font-black text-foreground tracking-widest">{project.pin_code || '—'}</span>
                                </div>
                                <a
                                    href={`/p/${portalToken}`}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="w-full flex items-center justify-center gap-2 px-3 py-2 bg-primary/10 hover:bg-primary/20 transition-all rounded-lg text-[9px] font-black uppercase tracking-widest text-primary border border-primary/20"
                                >
                                    <Globe size={12} />
                                    Abrir Portal
                                </a>
                            </div>
                        </div>
                    )}

                    <button
                        onClick={() => {
                            /* TODO: Implementar envío de actualización */
                        }}
                        className="w-full flex items-center gap-3 px-4 py-3 bg-secondary/40 hover:bg-secondary transition-all rounded-xl border border-border/40 active:scale-95 text-left"
                    >
                        <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center text-primary shrink-0">
                            <Send size={14} />
                        </div>
                        <span className="text-[10px] font-black uppercase tracking-widest text-foreground">
                            Enviar actualización
                        </span>
                    </button>

                    <button
                        onClick={() => {
                            /* TODO: Implementar agendamiento */
                        }}
                        className="w-full flex items-center gap-3 px-4 py-3 bg-secondary/40 hover:bg-secondary transition-all rounded-xl border border-border/40 active:scale-95 text-left"
                    >
                        <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center text-primary shrink-0">
                            <Calendar size={14} />
                        </div>
                        <span className="text-[10px] font-black uppercase tracking-widest text-foreground">
                            Agendar reunión
                        </span>
                    </button>

                    <button
                        onClick={() => {
                            /* TODO: Implementar reporte de bug */
                        }}
                        className="w-full flex items-center gap-3 px-4 py-3 bg-secondary/40 hover:bg-secondary transition-all rounded-xl border border-border/40 active:scale-95 text-left"
                    >
                        <div className="w-8 h-8 rounded-lg bg-destructive/10 flex items-center justify-center text-destructive shrink-0">
                            <Bug size={14} />
                        </div>
                        <span className="text-[10px] font-black uppercase tracking-widest text-foreground">
                            Reportar bug interno
                        </span>
                    </button>
                </div>
            </div>
        </div>
    )
}
