'use client'

import { ProjectPhase } from '@/types'
import { FileText, ExternalLink, FolderOpen } from 'lucide-react'

// ------------------------------------------------------------------
// Tipos
// ------------------------------------------------------------------

interface FilesTabProps {
    phases: ProjectPhase[]
}

interface DeliverableItem {
    name: string
    url: string
    type: string
    uploaded_by?: string
    uploaded_at?: string
}

// ------------------------------------------------------------------
// Helpers
// ------------------------------------------------------------------

function formatDateTime(iso: string | undefined): string {
    if (!iso) return '—'
    const d = new Date(iso)
    return d.toLocaleDateString('es-PE', {
        day: 'numeric',
        month: 'short',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
    })
}

function getFileIcon(type: string) {
    switch (type?.toLowerCase()) {
        case 'figma':
        case 'design':
            return <div className="w-8 h-8 rounded-lg bg-purple-50 text-purple-600 flex items-center justify-center text-[10px] font-black">FIG</div>
        case 'pdf':
            return <div className="w-8 h-8 rounded-lg bg-red-50 text-red-600 flex items-center justify-center text-[10px] font-black">PDF</div>
        case 'video':
            return <div className="w-8 h-8 rounded-lg bg-orange-50 text-orange-600 flex items-center justify-center text-[10px] font-black">MP4</div>
        case 'image':
        case 'img':
            return <div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center text-[10px] font-black">IMG</div>
        default:
            return <div className="w-8 h-8 rounded-lg bg-secondary text-muted-foreground flex items-center justify-center"><FileText size={14} /></div>
    }
}

// ------------------------------------------------------------------
// Componente
// ------------------------------------------------------------------

export function FilesTab({ phases }: FilesTabProps) {
    const allDeliverables: Array<DeliverableItem & { phaseName: string; phaseOrder: number }> = []

    phases.forEach((phase) => {
        if (Array.isArray(phase.deliverables)) {
            phase.deliverables.forEach((d: any) => {
                allDeliverables.push({
                    name: d.name || 'Sin nombre',
                    url: d.url || '#',
                    type: d.type || 'file',
                    uploaded_by: d.uploaded_by,
                    uploaded_at: d.uploaded_at,
                    phaseName: phase.phase_name,
                    phaseOrder: phase.phase_order,
                })
            })
        }
    })

    // Ordenar por fase y luego por fecha
    allDeliverables.sort((a, b) => {
        if (a.phaseOrder !== b.phaseOrder) return a.phaseOrder - b.phaseOrder
        return new Date(b.uploaded_at || 0).getTime() - new Date(a.uploaded_at || 0).getTime()
    })

    return (
        <div className="space-y-6">
            {allDeliverables.length === 0 ? (
                <div className="text-center py-16 border-2 border-dashed border-border rounded-3xl space-y-3">
                    <FolderOpen size={32} className="mx-auto text-muted-foreground/30" />
                    <p className="text-xs font-black uppercase tracking-widest text-muted-foreground/50">
                        No hay archivos ni entregables registrados
                    </p>
                    <p className="text-[10px] text-muted-foreground/40 max-w-xs mx-auto">
                        Los entregables se agregan desde la pestaña Fases en cada etapa del proyecto
                    </p>
                </div>
            ) : (
                <div className="bg-card border border-border rounded-2xl sm:rounded-3xl overflow-hidden">
                    <div className="px-5 sm:px-6 py-4 border-b border-border/40 flex items-center justify-between">
                        <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">
                            Archivos y Entregables
                        </p>
                        <span className="text-[10px] font-black text-muted-foreground">
                            {allDeliverables.length} item{allDeliverables.length !== 1 ? 's' : ''}
                        </span>
                    </div>
                    <div className="divide-y divide-border/40">
                        {allDeliverables.map((item, index) => (
                            <div
                                key={index}
                                className="flex items-center gap-4 px-5 sm:px-6 py-4 hover:bg-secondary/20 transition-colors"
                            >
                                {getFileIcon(item.type)}
                                <div className="flex-1 min-w-0">
                                    <p className="text-xs font-bold text-foreground truncate">
                                        {item.name}
                                    </p>
                                    <div className="flex items-center gap-2 mt-0.5 text-[9px] font-black text-muted-foreground uppercase tracking-widest">
                                        <span>{item.phaseName}</span>
                                        <span className="text-border">|</span>
                                        <span>{formatDateTime(item.uploaded_at)}</span>
                                    </div>
                                </div>
                                <a
                                    href={item.url}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="shrink-0 p-2 rounded-xl bg-secondary/40 hover:bg-secondary transition-colors text-muted-foreground hover:text-foreground"
                                    title="Abrir archivo"
                                >
                                    <ExternalLink size={14} />
                                </a>
                            </div>
                        ))}
                    </div>
                </div>
            )}
        </div>
    )
}
