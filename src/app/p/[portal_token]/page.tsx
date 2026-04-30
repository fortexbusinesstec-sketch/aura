'use client'

import { useState, useEffect } from 'react'
import { useParams } from 'next/navigation'
import { createClient } from '@/utils/supabase/client'
import { PinScreen } from '@/components/portal/PinScreen'
import { PortalDashboard } from '@/components/portal/PortalDashboard'
import { ExecutionPortalView } from '@/components/portal/ExecutionPortalView'
import { Loader2 } from 'lucide-react'

export default function ClientPortalPage() {
    const { portal_token } = useParams() as { portal_token: string }
    const [isAuthenticated, setIsAuthenticated] = useState(false)
    const [isLoading, setIsLoading] = useState(true)
    const [clientData, setClientData] = useState<any>(null)
    const [projectData, setProjectData] = useState<any>(null)
    const [opportunityData, setOpportunityData] = useState<any>(null)
    const [phases, setPhases] = useState<any[]>([])
    const [catalog, setCatalog] = useState<any[]>([])
    const [projectServices, setProjectServices] = useState<any[]>([])
    const [viewMode, setViewMode] = useState<'proposal' | 'execution'>('proposal')
    const [error, setError] = useState('')

    const supabase = createClient()

    // Check localStorage for saved PIN
    useEffect(() => {
        const saved = localStorage.getItem(`aura_portal_${portal_token}`)
        if (saved) {
            try {
                const parsed = JSON.parse(saved)
                if (parsed.pin && parsed.authenticated) {
                    setIsAuthenticated(true)
                }
            } catch {
                localStorage.removeItem(`aura_portal_${portal_token}`)
            }
        }
        setIsLoading(false)
    }, [portal_token])

    // Load data once authenticated
    useEffect(() => {
        if (!isAuthenticated) return

        const loadData = async () => {
            setIsLoading(true)

            // 1. Find client by portal_token
            const { data: client, error: clientError } = await supabase
                .from('clients')
                .select('*')
                .eq('portal_token', portal_token)
                .single()

            if (clientError || !client) {
                setError('Portal no encontrado. Contacta a tu asesor.')
                setIsLoading(false)
                return
            }

            setClientData(client)

            // 2. Find project or opportunity
            let finalData = null
            let oppData = null
            let projectId = null

            const { data: project } = await supabase
                .from('projects')
                .select('*')
                .eq('client_id', client.id)
                .order('created_at', { ascending: false })
                .limit(1)
                .single()

            if (project) {
                projectId = project.id

                // If it's a project, we still need the pitch/opportunity data for the portal tabs
                if (project.opportunity_id) {
                    const { data: opp } = await supabase
                        .from('opportunities')
                        .select('*')
                        .eq('id', project.opportunity_id)
                        .single()

                    if (opp) {
                        oppData = opp
                        finalData = { ...opp, ...project }
                    } else {
                        finalData = project
                    }
                } else {
                    finalData = project
                }

                // Determine view mode
                const mode = project.portal_view_mode === 'execution' ? 'execution' : 'proposal'
                setViewMode(mode)
                setProjectData(finalData)
                setOpportunityData(oppData)

                // Load project phases
                const { data: phasesData } = await supabase
                    .from('project_phases')
                    .select('*')
                    .eq('project_id', project.id)
                    .order('phase_order', { ascending: true })
                setPhases(phasesData || [])

                // Load project services
                const { data: servicesData } = await supabase
                    .from('project_services')
                    .select('*')
                    .eq('project_id', project.id)
                setProjectServices(servicesData || [])
            } else {
                // Look for deployed opportunity
                const { data: opportunity } = await supabase
                    .from('opportunities')
                    .select('*')
                    .eq('client_id', client.id)
                    .eq('is_deployed', true)
                    .order('updated_at', { ascending: false })
                    .limit(1)
                    .maybeSingle()

                if (opportunity) {
                    setViewMode('proposal')
                    setProjectData(opportunity)
                    setOpportunityData(opportunity)
                }
            }

            // 3. Load catalog for price calculations/names if needed
            const { data: catalogData } = await supabase.from('catalog_items').select('*')
            setCatalog(catalogData || [])

            setIsLoading(false)
        }

        loadData()
    }, [isAuthenticated, portal_token])

    const handlePinSuccess = () => {
        setIsAuthenticated(true)
    }

    const handleLogout = () => {
        localStorage.removeItem(`aura_portal_${portal_token}`)
        setIsAuthenticated(false)
        setClientData(null)
        setProjectData(null)
        setOpportunityData(null)
        setPhases([])
        setProjectServices([])
    }

    if (isLoading) {
        return (
            <div className="min-h-screen bg-white flex items-center justify-center">
                <div className="flex flex-col items-center gap-3">
                    <Loader2 size={32} className="text-[#1E3A5F] animate-spin" />
                    <p className="text-xs font-black uppercase tracking-widest text-muted-foreground">Cargando Portal...</p>
                </div>
            </div>
        )
    }

    if (!isAuthenticated) {
        return <PinScreen portalToken={portal_token} onSuccess={handlePinSuccess} />
    }

    if (error) {
        return (
            <div className="min-h-screen bg-white flex items-center justify-center px-4">
                <div className="text-center space-y-4">
                    <div className="w-16 h-16 rounded-full bg-red-50 flex items-center justify-center mx-auto">
                        <span className="text-2xl">🔒</span>
                    </div>
                    <h1 className="text-lg font-black text-slate-900">Acceso Denegado</h1>
                    <p className="text-sm text-muted-foreground">{error}</p>
                </div>
            </div>
        )
    }

    // Render execution view
    if (viewMode === 'execution' && projectData) {
        return (
            <ExecutionPortalView
                client={clientData}
                project={projectData}
                opportunity={opportunityData}
                phases={phases}
                projectServices={projectServices}
                onLogout={handleLogout}
                portalToken={portal_token}
            />
        )
    }

    // Render proposal view (existing)
    return (
        <PortalDashboard
            client={clientData}
            project={projectData}
            phases={phases}
            catalog={catalog}
            onLogout={handleLogout}
            portalToken={portal_token}
        />
    )
}
