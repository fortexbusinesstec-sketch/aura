'use client'

import { useState, useEffect } from 'react'
import { useParams } from 'next/navigation'
import { createClient } from '@/utils/supabase/client'
import { PinScreen } from '@/components/portal/PinScreen'
import { PortalDashboard } from '@/components/portal/PortalDashboard'
import { ExecutionPortalView } from '@/components/portal/ExecutionPortalView'
import { PortalThemePicker } from '@/components/portal/PortalThemePicker'
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

            // 2. Fetch both latest project and latest deployed opportunity
            const [projectRes, opportunityRes] = await Promise.all([
                supabase
                    .from('projects')
                    .select('*, opportunity:opportunities(*)')
                    .eq('client_id', client.id)
                    .order('updated_at', { ascending: false })
                    .limit(1)
                    .maybeSingle(),
                supabase
                    .from('opportunities')
                    .select('*')
                    .eq('client_id', client.id)
                    .order('updated_at', { ascending: false })
                    .limit(1)
                    .maybeSingle()
            ])

            const project = projectRes.data
            const opportunity = opportunityRes.data

            let finalData = null
            let oppData = null
            let activeMode: 'proposal' | 'execution' = 'proposal'

            // Determine which one is more recent or relevant
            const projectDate = project ? new Date(project.updated_at).getTime() : 0
            const opportunityDate = opportunity ? new Date(opportunity.updated_at).getTime() : 0

            // If project is more recent AND mode is execution, prioritize project
            if (project && projectDate >= opportunityDate && project.portal_view_mode === 'execution') {
                activeMode = 'execution'
                oppData = project.opportunity
                finalData = { ...project.opportunity, ...project }
            } else if (opportunity) {
                // Prioritize the latest deployed opportunity for proposal mode
                activeMode = 'proposal'
                oppData = opportunity
                // If there's a project linked to this opportunity, merge them but keep opportunity as base for proposal fields
                if (project && project.opportunity_id === opportunity.id) {
                    finalData = { ...project, ...opportunity }
                } else {
                    finalData = opportunity
                }
            } else if (project) {
                // Fallback to project if no standalone deployed opportunity exists
                activeMode = project.portal_view_mode === 'execution' ? 'execution' : 'proposal'
                oppData = project.opportunity
                finalData = { ...project.opportunity, ...project }
            }

            if (finalData) {
                setViewMode(activeMode)
                setProjectData(finalData)
                setOpportunityData(oppData)

                // Load project phases if it's a project
                if (finalData.id && activeMode === 'execution') {
                    const { data: phasesData } = await supabase
                        .from('project_phases')
                        .select('*')
                        .eq('project_id', finalData.id)
                        .order('phase_order', { ascending: true })
                    setPhases(phasesData || [])

                    const { data: servicesData } = await supabase
                        .from('project_services')
                        .select('*')
                        .eq('project_id', finalData.id)
                    setProjectServices(servicesData || [])
                }
            } else {
                setError('Aún no hay una propuesta publicada para este portal.')
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
            <div className="min-h-screen bg-background flex items-center justify-center">
                <div className="flex flex-col items-center gap-3">
                    <Loader2 size={32} className="text-primary animate-spin" />
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
            <div className="min-h-screen bg-background flex items-center justify-center px-4">
                <div className="text-center space-y-4">
                    <div className="w-16 h-16 rounded-full bg-destructive/10 flex items-center justify-center mx-auto">
                        <span className="text-2xl">🔒</span>
                    </div>
                    <h1 className="text-lg font-black text-foreground">Acceso Denegado</h1>
                    <p className="text-sm text-muted-foreground">{error}</p>
                </div>
            </div>
        )
    }

    // Render execution view
    if (viewMode === 'execution' && projectData) {
        return (
            <>
                <PortalThemePicker portalToken={portal_token} />
                <ExecutionPortalView
                    client={clientData}
                    project={projectData}
                    opportunity={opportunityData}
                    phases={phases}
                    projectServices={projectServices}
                    onLogout={handleLogout}
                    portalToken={portal_token}
                />
            </>
        )
    }

    // Render proposal view (existing)
    return (
        <>
            <PortalThemePicker portalToken={portal_token} />
            <PortalDashboard
                client={clientData}
                project={projectData}
                phases={phases}
                catalog={catalog}
                onLogout={handleLogout}
                portalToken={portal_token}
            />
        </>
    )
}
