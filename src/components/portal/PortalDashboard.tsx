'use client'

import { useState } from 'react'
import { createClient } from '@/utils/supabase/client'
import { PortalHeader } from './PortalHeader'
import { CommentModal } from './CommentModal'
import { ClientPortalView, TabId } from './ClientPortalView'
import { Loader2 } from 'lucide-react'

interface PortalDashboardProps {
    client: any
    project: any
    phases: any[]
    catalog: any
    onLogout: () => void
    portalToken: string
}

export function PortalDashboard({ client, project, phases, catalog, onLogout, portalToken }: PortalDashboardProps) {
    const [showComment, setShowComment] = useState(false)
    const [activeTab, setActiveTab] = useState<TabId>('resumen')
    const [isApproving, setIsApproving] = useState(false)
    const [approvalMessage, setApprovalMessage] = useState('')

    const supabase = createClient()

    const handleApproveProposal = async () => {
        if (!project?.id) return
        
        setIsApproving(true)
        setApprovalMessage('')

        // ═══════════════════════════════════════════════════════════════
        // Integración Supabase: Aprobar propuesta
        // UPDATE opportunities SET status = 'approved' WHERE id = project.id
        // ═══════════════════════════════════════════════════════════════
        const { error } = await supabase
            .from('opportunities')
            .update({ status: 'approved', updated_at: new Date().toISOString() })
            .eq('id', project.id)

        if (error) {
            console.error('Error approving proposal:', error)
            setApprovalMessage('Error al aprobar la propuesta. Intenta de nuevo.')
        } else {
            setApprovalMessage('✅ Propuesta aprobada correctamente.')
            // Actualizar estado local
            if (project) {
                project.status = 'approved'
            }
        }

        setIsApproving(false)
    }

    return (
        <div className="min-h-screen bg-background text-foreground font-sans">
            <PortalHeader
                client={client}
                project={project}
                onLogout={onLogout}
                onOpenComment={() => setShowComment(true)}
            />

            {approvalMessage && (
                <div className="max-w-[1440px] mx-auto px-4 pt-4">
                    <div className={`rounded-xl px-4 py-3 text-[10px] font-black uppercase tracking-wider ${
                        approvalMessage.includes('Error') 
                            ? 'bg-destructive/10 text-destructive border border-destructive/20'
                            : 'bg-success/10 text-success-foreground border border-success/20'
                    }`}>
                        {approvalMessage}
                    </div>
                </div>
            )}

            <main className="max-w-[1440px] mx-auto py-6 px-4">
                <ClientPortalView 
                    opportunity={project} 
                    client={client}
                    phases={phases}
                    catalog={catalog}
                    activeTab={activeTab}
                    onTabChange={setActiveTab}
                    hideHeader={true}
                    onApproveProposal={handleApproveProposal}
                />
            </main>

            {/* Footer Unificado Aura OS */}
            <footer className="border-t border-border/50 bg-card py-12 text-center mt-12">
                <div className="flex flex-col items-center gap-6">
                    <div className="flex items-center gap-2.5 opacity-40 hover:opacity-100 transition-opacity">
                        <div className="w-8 h-8 bg-primary rounded-xl flex items-center justify-center">
                            <span className="text-primary-foreground font-black text-[12px]">A</span>
                        </div>
                        <span className="font-black text-xs uppercase tracking-tighter text-foreground">Aura OS</span>
                    </div>
                    <div className="space-y-1.5">
                        <p className="text-[10px] font-black uppercase tracking-[0.25em] text-muted-foreground/60">
                            © FORTEX DIGITAL SOLUTIONS • PROPIEDAD INTELECTUAL
                        </p>
                        <p className="text-[9px] text-muted-foreground font-medium max-w-xs mx-auto leading-relaxed">
                            Este portal estratégico es confidencial y ha sido generado específicamente para {client?.razon_social || 'el cliente'}.
                        </p>
                    </div>
                </div>
            </footer>

            {showComment && (
                <CommentModal
                    onClose={() => setShowComment(false)}
                    onSubmit={(comment, type) => {
                        console.log('Comment submitted:', { comment, type, portalToken })
                    }}
                />
            )}

            {isApproving && (
                <div className="fixed inset-0 z-50 bg-background/80 backdrop-blur-sm flex items-center justify-center">
                    <div className="flex flex-col items-center gap-3">
                        <Loader2 size={32} className="text-primary animate-spin" />
                        <p className="text-xs font-black uppercase tracking-widest text-muted-foreground">Procesando aprobación...</p>
                    </div>
                </div>
            )}
        </div>
    )
}
