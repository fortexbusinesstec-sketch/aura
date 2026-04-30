'use client'

import { useState } from 'react'
import { Project } from '@/types'
import {
    Loader2,
    AlertCircle,
    CheckCircle2,
    Unlink,
} from 'lucide-react'
import { connectLinearProject, createIssuesFromPhases } from '../actions'

// ------------------------------------------------------------------
// Tipos
// ------------------------------------------------------------------

interface LinearConnectorProps {
    project: Project
    onProjectUpdated: (linearProjectUrl: string) => void
}

interface ToastMessage {
    type: 'success' | 'error'
    text: string
}

// ------------------------------------------------------------------
// Componente
// ------------------------------------------------------------------

export function LinearConnector({ project, onProjectUpdated }: LinearConnectorProps) {
    const [isConnecting, setIsConnecting] = useState(false)
    const [isCreatingIssues, setIsCreatingIssues] = useState(false)
    const [message, setMessage] = useState<ToastMessage | null>(null)

    const isConnected = !!project.linear_project_url

    // --------------------------------------------------------------
    // Handlers
    // --------------------------------------------------------------

    const handleConnect = async () => {
        setIsConnecting(true)
        setMessage(null)

        try {
            const res = await connectLinearProject(project.id)

            if (res.success && res.linearProjectUrl) {
                setMessage({ type: 'success', text: 'Proyecto conectado con Linear exitosamente' })
                onProjectUpdated(res.linearProjectUrl)
            } else {
                setMessage({ type: 'error', text: res.error || 'Error al conectar con Linear' })
            }
        } catch (err) {
            setMessage({ type: 'error', text: 'Error inesperado al conectar con Linear' })
            console.error(err)
        } finally {
            setIsConnecting(false)
        }
    }

    const handleCreateIssues = async () => {
        setIsCreatingIssues(true)
        setMessage(null)

        try {
            const res = await createIssuesFromPhases(project.id)

            if (res.success && res.createdCount) {
                setMessage({ type: 'success', text: `${res.createdCount} issues creados en Linear` })
            } else if (res.success) {
                setMessage({ type: 'success', text: 'Issues creados en Linear' })
            } else {
                setMessage({ type: 'error', text: res.error || 'Error al crear issues en Linear' })
            }
        } catch (err) {
            setMessage({ type: 'error', text: 'Error inesperado al crear issues' })
            console.error(err)
        } finally {
            setIsCreatingIssues(false)
        }
    }

    // --------------------------------------------------------------
    // Render
    // --------------------------------------------------------------

    return (
        <div className="bg-card border border-border rounded-2xl sm:rounded-3xl p-5 space-y-4">
            {/* Header */}
            <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground border-b border-border/40 pb-3">
                Conexión Linear
            </p>

            {!isConnected ? (
                <div className="space-y-4">
                    {/* Estado: no conectado */}
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-secondary/50 border border-border/50 flex items-center justify-center text-muted-foreground">
                            <Unlink size={18} />
                        </div>
                        <div>
                            <p className="text-xs font-bold text-foreground uppercase tracking-tight">
                                No conectado
                            </p>
                            <p className="text-[9px] font-black text-muted-foreground uppercase tracking-widest">
                                Linear no vinculado
                            </p>
                        </div>
                    </div>

                    <button
                        onClick={handleConnect}
                        disabled={isConnecting}
                        className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-primary hover:bg-primary/90 transition-all rounded-xl border border-border active:scale-95 text-[10px] font-black uppercase tracking-widest text-primary-foreground disabled:opacity-50 disabled:pointer-events-none"
                    >
                        {isConnecting ? (
                            <Loader2 size={14} className="animate-spin" />
                        ) : (
                            <span>🔗</span>
                        )}
                        Conectar a Linear
                    </button>
                </div>
            ) : (
                <div className="space-y-4">
                    {/* Estado: conectado */}
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-emerald-50 border border-emerald-100 flex items-center justify-center text-emerald-600">
                            <CheckCircle2 size={18} />
                        </div>
                        <div className="min-w-0">
                            <p className="text-xs font-bold text-foreground uppercase tracking-tight">
                                Conectado
                            </p>
                            <a
                                href={project.linear_project_url!}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-[9px] font-black text-primary uppercase tracking-widest truncate block hover:underline"
                            >
                                {project.linear_project_url}
                            </a>
                        </div>
                    </div>

                    {/* Abrir en Linear */}
                    <a
                        href={project.linear_project_url!}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-secondary/40 hover:bg-secondary transition-all rounded-xl border border-border/40 active:scale-95 text-[10px] font-black uppercase tracking-widest text-foreground"
                    >
                        <span>↗</span>
                        Abrir en Linear
                    </a>

                    {/* Crear issues desde fases */}
                    <button
                        onClick={handleCreateIssues}
                        disabled={isCreatingIssues}
                        className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-secondary/40 hover:bg-secondary transition-all rounded-xl border border-border/40 active:scale-95 text-[10px] font-black uppercase tracking-widest text-foreground disabled:opacity-50 disabled:pointer-events-none"
                    >
                        {isCreatingIssues ? (
                            <Loader2 size={14} className="animate-spin" />
                        ) : (
                            <span>📝</span>
                        )}
                        Crear Issues desde Fases
                    </button>
                </div>
            )}

            {/* Mensaje de feedback */}
            {message && (
                <div
                    className={`flex items-start gap-2 px-3 py-2.5 rounded-xl text-[10px] font-bold uppercase tracking-wider ${
                        message.type === 'success'
                            ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                            : 'bg-red-50 text-red-700 border border-red-200'
                    }`}
                >
                    {message.type === 'success' ? (
                        <CheckCircle2 size={14} className="shrink-0 mt-0.5" />
                    ) : (
                        <AlertCircle size={14} className="shrink-0 mt-0.5" />
                    )}
                    <span className="leading-tight">{message.text}</span>
                </div>
            )}
        </div>
    )
}
