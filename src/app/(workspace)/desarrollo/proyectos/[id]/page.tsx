'use client'

import { useState, useEffect, useMemo } from 'react'
import { useParams } from 'next/navigation'
import { createClient } from '@/utils/supabase/client'
import { Project, ProjectPhase, Client, ProjectStatus } from '@/types'
import { Profile } from '@/lib/repositories/ProfileRepository'
import { ProjectHeader } from './components/ProjectHeader'
import { SidebarPanel } from './components/SidebarPanel'
import { PhasesTab } from './components/PhasesTab'
import { LinearTab } from './components/LinearTab'
import { FinancesTab } from './components/FinancesTab'
import { FilesTab } from './components/FilesTab'
import { PortalTab } from './components/PortalTab'
import { LinearConnector } from './components/LinearConnector'
import { updateProjectStatus } from './actions'
import {
    Loader2,
    Route,
    Link2,
    Coins,
    FolderOpen,
    FileText,
    Globe,
} from 'lucide-react'

// ------------------------------------------------------------------
// Tipos locales
// ------------------------------------------------------------------

type TabKey = 'phases' | 'linear' | 'finances' | 'files' | 'portal'

interface ProjectDetail extends Project {
    client: Client | null
    lead_dev: Profile | null
    project_manager: Profile | null
    phases: ProjectPhase[]
}

// ------------------------------------------------------------------
// Config tabs
// ------------------------------------------------------------------

const TABS: { key: TabKey; label: string; icon: React.ReactNode }[] = [
    { key: 'phases', label: 'Fases', icon: <Route size={14} /> },
    { key: 'linear', label: 'Tareas', icon: <Link2 size={14} /> },
    { key: 'finances', label: 'Finanzas', icon: <Coins size={14} /> },
    { key: 'files', label: 'Archivos', icon: <FolderOpen size={14} /> },
    { key: 'portal', label: 'Portal', icon: <Globe size={14} /> },
]

// ------------------------------------------------------------------
// Helpers
// ------------------------------------------------------------------

function calcDaysRemaining(deadline: string | null | undefined): number | null {
    if (!deadline) return null
    const today = new Date()
    today.setHours(0, 0, 0, 0)
    const d = new Date(deadline)
    d.setHours(0, 0, 0, 0)
    const diff = d.getTime() - today.getTime()
    return Math.ceil(diff / (1000 * 60 * 60 * 24))
}

// ------------------------------------------------------------------
// Página
// ------------------------------------------------------------------

export default function ProjectDetailPage() {
    const { id } = useParams() as { id: string }
    const [project, setProject] = useState<ProjectDetail | null>(null)
    const [opportunityDraft, setOpportunityDraft] = useState<any>(null)
    const [isLoading, setIsLoading] = useState(true)
    const [activeTab, setActiveTab] = useState<TabKey>('phases')
    const [isUpdatingStatus, setIsUpdatingStatus] = useState(false)

    const supabase = createClient()

    // ------------------------------------------------------------------
    // Carga de datos
    // ------------------------------------------------------------------

    useEffect(() => {
        const fetchProject = async () => {
            setIsLoading(true)

            const { data, error } = await supabase
                .from('projects')
                .select(
                    '*, client:clients(*), lead_dev:profiles!projects_lead_dev_id_fkey(*), project_manager:profiles!projects_project_manager_id_fkey(*), phases:project_phases(*)'
                )
                .eq('id', id)
                .single()

            if (error) {
                console.error('Error fetching project:', error)
                setIsLoading(false)
                return
            }

            if (data) {
                const detail = data as unknown as ProjectDetail
                setProject(detail)

                // Cargar opportunity para datos financieros
                if (detail.opportunity_id) {
                    const { data: opp } = await supabase
                        .from('opportunities')
                        .select('draft_jsonb')
                        .eq('id', detail.opportunity_id)
                        .single()
                    if (opp?.draft_jsonb) {
                        setOpportunityDraft(opp.draft_jsonb)
                    }
                }
            }

            setIsLoading(false)
        }

        fetchProject()
    }, [id])

    // ------------------------------------------------------------------
    // Handlers
    // ------------------------------------------------------------------

    const handleStatusChange = async (status: ProjectStatus) => {
        if (!project) return
        setIsUpdatingStatus(true)
        const res = await updateProjectStatus(project.id, status)
        setIsUpdatingStatus(false)
        if (res.success) {
            setProject((prev) => (prev ? { ...prev, status } : prev))
        } else {
            alert(res.error || 'Error actualizando estado')
        }
    }

    // ------------------------------------------------------------------
    // Derived
    // ------------------------------------------------------------------

    const daysRemaining = useMemo(() => calcDaysRemaining(project?.deadline_date), [project?.deadline_date])

    // ------------------------------------------------------------------
    // Render loading
    // ------------------------------------------------------------------

    if (isLoading) {
        return (
            <div className="flex flex-col items-center justify-center py-32 space-y-4 animate-in fade-in">
                <Loader2 className="w-10 h-10 text-primary animate-spin" />
                <p className="text-xs font-black uppercase tracking-widest text-muted-foreground">
                    Cargando proyecto…
                </p>
            </div>
        )
    }

    if (!project) {
        return (
            <div className="flex flex-col items-center justify-center py-32 space-y-4">
                <FileText size={40} className="text-muted-foreground/30" />
                <p className="text-xs font-black uppercase tracking-widest text-muted-foreground/50">
                    Proyecto no encontrado
                </p>
            </div>
        )
    }

    // ------------------------------------------------------------------
    // Render principal
    // ------------------------------------------------------------------

    return (
        <div className="space-y-6 animate-in fade-in duration-700">
            {/* Header */}
            <ProjectHeader
                project={project}
                client={project.client}
                daysRemaining={daysRemaining}
                onStatusChange={handleStatusChange}
            />

            {/* Tabs + Contenido + Sidebar */}
            <div className="flex flex-col xl:flex-row gap-6">
                {/* Columna principal */}
                <div className="flex-1 min-w-0 space-y-6">
                    {/* Tabs nav */}
                    <div className="flex items-center gap-1 bg-secondary/50 p-1 rounded-2xl border border-border/50 w-full overflow-x-auto">
                        {TABS.map((tab) => {
                            const isActive = activeTab === tab.key
                            return (
                                <button
                                    key={tab.key}
                                    onClick={() => setActiveTab(tab.key)}
                                    className={`flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all whitespace-nowrap flex-1 ${
                                        isActive
                                            ? 'bg-card text-foreground shadow-sm border border-border/50'
                                            : 'text-muted-foreground hover:text-foreground hover:bg-accent/40'
                                    }`}
                                >
                                    {tab.icon}
                                    {tab.label}
                                </button>
                            )
                        })}
                    </div>

                    {/* Contenido del tab activo */}
                    <div className="min-h-[400px]">
                        {activeTab === 'phases' && (
                            <PhasesTab phases={project.phases || []} project={project} />
                        )}
                        {activeTab === 'linear' && <LinearTab project={project} />}
                        {activeTab === 'finances' && (
                            <FinancesTab project={project} opportunityDraft={opportunityDraft} />
                        )}
                        {activeTab === 'files' && (
                            <FilesTab phases={project.phases || []} />
                        )}
                        {activeTab === 'portal' && (
                            <PortalTab portalToken={project.client?.portal_token || null} />
                        )}
                    </div>
                </div>

                {/* Sidebar derecho */}
                <div className="w-full xl:w-80 shrink-0 space-y-6">
                    <LinearConnector
                        project={project}
                        onProjectUpdated={(url) =>
                            setProject((prev) =>
                                prev ? { ...prev, linear_project_url: url } : prev
                            )
                        }
                    />
                    <SidebarPanel
                        project={project}
                        client={project.client}
                        leadDev={project.lead_dev}
                        projectManager={project.project_manager}
                        portalToken={project.client?.portal_token || null}
                    />
                </div>
            </div>
        </div>
    )
}
