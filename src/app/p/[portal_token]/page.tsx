'use client'

import { useState, useEffect } from 'react'
import { useParams } from 'next/navigation'
import { createClient } from '@/utils/supabase/client'
import { PinScreen } from '@/components/portal/PinScreen'
import { PortalDashboard } from '@/components/portal/PortalDashboard'
import { ExecutionPortalView } from '@/components/portal/ExecutionPortalView'
import { PortalThemePicker } from '@/components/portal/PortalThemePicker'
import { ThemeInjector } from '@/components/providers/ThemeInjector'
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

            // ═══════════════════════════════════════════════════════════════
            // PASO 1: Buscar en opportunities (vista propuesta)
            // Solo mostrar si status IN ('published', 'approved')
            // ═══════════════════════════════════════════════════════════════
            const { data: oppData } = await supabase
                .from('opportunities')
                .select('*, client:clients(*)')
                .eq('portal_token', portal_token)
                .in('status', ['published', 'approved'])
                .maybeSingle()

            if (oppData) {
                setClientData(oppData.client)
                setViewMode('proposal')
                setProjectData(oppData)
                setOpportunityData(oppData)

                // Load catalog for price calculations/names
                const { data: catalogData } = await supabase.from('catalog_items').select('*')
                setCatalog(catalogData || [])

                setIsLoading(false)
                return
            }

            // ═══════════════════════════════════════════════════════════════
            // PASO 2: Buscar en projects (vista ejecución)
            // Cualquier proyecto con este portal_token es válido
            // ═══════════════════════════════════════════════════════════════
            const { data: projData } = await supabase
                .from('projects')
                .select('*, opportunity:opportunities(*), client:clients(*)')
                .eq('portal_token', portal_token)
                .maybeSingle()

            if (projData) {
                setClientData(projData.client)
                setViewMode('execution')
                setProjectData(projData)
                setOpportunityData(projData.opportunity || null)

                // Fetch project phases
                const { data: phasesData } = await supabase
                    .from('project_phases')
                    .select('*')
                    .eq('project_id', projData.id)
                    .order('phase_order', { ascending: true })
                setPhases(phasesData || [])

                // Fetch project services
                const { data: servicesData } = await supabase
                    .from('project_services')
                    .select('*')
                    .eq('project_id', projData.id)
                setProjectServices(servicesData || [])

                setIsLoading(false)
                return
            }

            // ═══════════════════════════════════════════════════════════════
            // PASO 3: No encontrado en ninguna tabla
            // ═══════════════════════════════════════════════════════════════
            setError('Portal no encontrado. Contacta a tu asesor.')
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

    const clientId = clientData?.id

    // Render execution view
    if (viewMode === 'execution' && projectData) {
        return (
            <ThemeInjector source="client" clientId={clientId}>
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
            </ThemeInjector>
        )
    }

    // Render proposal view
    return (
        <ThemeInjector source="client" clientId={clientId}>
            <PortalThemePicker portalToken={portal_token} />
            <PortalDashboard
                client={clientData}
                project={projectData}
                phases={phases}
                catalog={catalog}
                onLogout={handleLogout}
                portalToken={portal_token}
            />
        </ThemeInjector>
    )
}
