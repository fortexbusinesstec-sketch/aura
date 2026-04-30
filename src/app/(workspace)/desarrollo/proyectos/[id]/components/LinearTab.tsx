'use client'

import { Project } from '@/types'
import { ExternalLink, Link2, AlertCircle } from 'lucide-react'

// ------------------------------------------------------------------
// Tipos
// ------------------------------------------------------------------

interface LinearTabProps {
    project: Project
}

// ------------------------------------------------------------------
// Componente
// ------------------------------------------------------------------

export function LinearTab({ project }: LinearTabProps) {
    const isConnected = !!project.linear_project_url

    return (
        <div className="space-y-6">
            <div className="bg-card border border-border rounded-2xl sm:rounded-3xl p-6 sm:p-10 text-center space-y-5">
                {isConnected ? (
                    <>
                        <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mx-auto">
                            <Link2 size={28} className="text-primary" />
                        </div>
                        <div className="space-y-1">
                            <p className="text-sm font-black text-foreground uppercase tracking-tight">
                                Tracking Técnico en Linear
                            </p>
                            <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest max-w-md mx-auto leading-relaxed">
                                El desarrollo, issues, sprints y revisiones técnicas de este proyecto se gestionan directamente en Linear.
                            </p>
                        </div>
                        <a
                            href={project.linear_project_url!}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-2 px-6 py-3.5 bg-primary hover:bg-primary/90 transition-all rounded-2xl border border-border active:scale-95 text-[10px] font-black uppercase tracking-widest text-primary-foreground shadow-lg shadow-primary/10"
                        >
                            <ExternalLink size={14} />
                            Abrir Proyecto en Linear
                        </a>
                    </>
                ) : (
                    <>
                        <div className="w-16 h-16 rounded-full bg-slate-100 flex items-center justify-center mx-auto">
                            <AlertCircle size={28} className="text-muted-foreground" />
                        </div>
                        <div className="space-y-1">
                            <p className="text-sm font-black text-foreground uppercase tracking-tight">
                                Linear no conectado
                            </p>
                            <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest max-w-md mx-auto leading-relaxed">
                                Este proyecto aún no está vinculado a Linear. Contacta al administrador del sistema para configurar la integración.
                            </p>
                        </div>
                    </>
                )}
            </div>
        </div>
    )
}
