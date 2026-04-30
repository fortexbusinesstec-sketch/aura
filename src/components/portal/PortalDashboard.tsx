'use client'

import { useState } from 'react'
import { PortalHeader } from './PortalHeader'
import { CommentModal } from './CommentModal'
import { ClientPortalView, TabId } from './ClientPortalView'

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

    return (
        <div className="min-h-screen bg-[#F9FAFB] text-slate-900 font-sans">
            <PortalHeader
                client={client}
                project={project}
                onLogout={onLogout}
                onOpenComment={() => setShowComment(true)}
            />

            <main className="max-w-[1440px] mx-auto py-6 px-4">
                <ClientPortalView 
                    opportunity={project} 
                    client={client}
                    phases={phases}
                    catalog={catalog}
                    activeTab={activeTab}
                    onTabChange={setActiveTab}
                    hideHeader={true}
                />
            </main>

            {/* Footer Unificado Aura OS */}
            <footer className="border-t border-slate-100 bg-white py-12 text-center mt-12">
                <div className="flex flex-col items-center gap-6">
                    <div className="flex items-center gap-2.5 opacity-20 hover:opacity-40 transition-opacity">
                        <div className="w-8 h-8 bg-slate-900 rounded-xl flex items-center justify-center">
                            <span className="text-white font-black text-[12px]">A</span>
                        </div>
                        <span className="font-black text-xs uppercase tracking-tighter text-slate-900">Aura OS</span>
                    </div>
                    <div className="space-y-1.5">
                        <p className="text-[10px] font-black uppercase tracking-[0.25em] text-slate-300">
                            © FORTEX DIGITAL SOLUTIONS • PROPIEDAD INTELECTUAL
                        </p>
                        <p className="text-[9px] text-slate-300 font-medium max-w-xs mx-auto leading-relaxed">
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
        </div>
    )
}
