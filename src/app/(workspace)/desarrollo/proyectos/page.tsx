'use client'

import { useState, useEffect, useMemo } from 'react'
import { PageHeader } from '@/components/ui/PageHeader'
import { createClient } from '@/utils/supabase/client'
import { Project, ProjectPhase, Client, ProjectStatus } from '@/types'
import { ProjectCard } from './components/ProjectCard'
import { NewProjectModal } from './components/NewProjectModal'
import { EditProjectModal } from './components/EditProjectModal'
import {
    Plus,
    Loader2,
    Search,
    X,
    FileText,
    Route,
    CheckCircle2,
    PauseCircle,
} from 'lucide-react'

// ------------------------------------------------------------------
// Tipos
// ------------------------------------------------------------------

interface ProjectWithPhases extends Project {
    client: Client | null
    phases: ProjectPhase[]
    opportunity?: { portal_token: string | null } | null
}

type FilterTab = 'all' | 'active' | 'completed' | 'paused'

const TAB_CONFIG: Record<
    FilterTab,
    { label: string; icon: React.ReactNode; statuses: ProjectStatus[] }
> = {
    all: {
        label: 'Todos',
        icon: <FileText size={12} />,
        statuses: [],
    },
    active: {
        label: 'En Progreso',
        icon: <Route size={12} />,
        statuses: ['planning', 'active', 'review'],
    },
    completed: {
        label: 'Completados',
        icon: <CheckCircle2 size={12} />,
        statuses: ['completed'],
    },
    paused: {
        label: 'Pausados',
        icon: <PauseCircle size={12} />,
        statuses: ['paused'],
    },
}

// ------------------------------------------------------------------
// Componente principal
// ------------------------------------------------------------------

export default function ProyectosPage() {
    const [projects, setProjects] = useState<ProjectWithPhases[]>([])
    const [isLoading, setIsLoading] = useState(true)
    const [searchTerm, setSearchTerm] = useState('')
    const [activeTab, setActiveTab] = useState<FilterTab>('all')
    const [isModalOpen, setIsModalOpen] = useState(false)
    const [isEditModalOpen, setIsEditModalOpen] = useState(false)
    const [editingProject, setEditingProject] = useState<ProjectWithPhases | null>(null)
    const [successProjectId, setSuccessProjectId] = useState<string | null>(null)

    const supabase = createClient()

    // ------------------------------------------------------------------
    // Carga de proyectos desde Supabase
    // ------------------------------------------------------------------

    const fetchProjects = async () => {
        setIsLoading(true)
        const { data, error } = await supabase
            .from('projects')
            .select('*, client:clients(*), phases:project_phases(*), opportunity:opportunities(portal_token)')
            .order('created_at', { ascending: false })

        if (error) {
            console.error('Error fetching projects:', error)
        }

        if (data) {
            setProjects(data as ProjectWithPhases[])
        }
        setIsLoading(false)
    }

    useEffect(() => {
        fetchProjects()
    }, [])

    // ------------------------------------------------------------------
    // Filtros
    // ------------------------------------------------------------------

    const filteredProjects = useMemo(() => {
        let result = projects

        // Filtro por tab de estado
        if (activeTab !== 'all') {
            const allowed = TAB_CONFIG[activeTab].statuses
            result = result.filter((p) => allowed.includes(p.status))
        }

        // Filtro por búsqueda
        if (searchTerm.trim()) {
            const term = searchTerm.toLowerCase()
            result = result.filter(
                (p) =>
                    p.code.toLowerCase().includes(term) ||
                    p.name.toLowerCase().includes(term) ||
                    p.client?.razon_social?.toLowerCase().includes(term) ||
                    p.client?.ruc?.includes(term)
            )
        }

        return result
    }, [projects, activeTab, searchTerm])

    // ------------------------------------------------------------------
    // Handlers
    // ------------------------------------------------------------------

    const handleViewProject = (project: ProjectWithPhases) => {
        window.location.href = `/desarrollo/proyectos/${project.id}`
    }

    const handleEditProject = (project: ProjectWithPhases) => {
        setEditingProject(project)
        setIsEditModalOpen(true)
    }

    const handleProjectCreated = (project: Project) => {
        setSuccessProjectId(project.id)
        fetchProjects()

        // Auto-dismiss toast after 5 seconds
        setTimeout(() => setSuccessProjectId(null), 5000)
    }

    // ------------------------------------------------------------------
    // Render
    // ------------------------------------------------------------------

    return (
        <div className="space-y-8 animate-in fade-in duration-700">
            {/* Header */}
            <PageHeader
                title="Proyectos Activos"
                subtitle="Gestión de ejecución y entregas"
                showBack={false}
                action={
                    <button
                        onClick={() => setIsModalOpen(true)}
                        className="flex items-center gap-2 px-5 py-3 bg-primary hover:bg-primary/90 transition-all rounded-2xl border border-border active:scale-95 text-[10px] font-black uppercase tracking-widest text-primary-foreground shadow-lg shadow-primary/10"
                    >
                        <Plus size={16} />
                        Nuevo Proyecto
                    </button>
                }
            />

            {/* Filtros y búsqueda */}
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                {/* Tabs */}
                <div className="flex items-center gap-1 bg-secondary/50 p-1 rounded-2xl border border-border/50">
                    {(Object.keys(TAB_CONFIG) as FilterTab[]).map((tab) => {
                        const cfg = TAB_CONFIG[tab]
                        const isActive = activeTab === tab
                        return (
                            <button
                                key={tab}
                                onClick={() => setActiveTab(tab)}
                                className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${
                                    isActive
                                        ? 'bg-card text-foreground shadow-sm border border-border/50'
                                        : 'text-muted-foreground hover:text-foreground hover:bg-accent/40'
                                }`}
                            >
                                {cfg.icon}
                                {cfg.label}
                            </button>
                        )
                    })}
                </div>

                {/* Search */}
                <div className="relative group w-full sm:w-auto">
                    <Search
                        className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground group-focus-within:text-primary transition-colors"
                        size={16}
                    />
                    <input
                        type="text"
                        placeholder="Buscar por código, nombre o cliente…"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="bg-card border border-border rounded-2xl pl-10 pr-10 py-3 text-xs font-bold outline-none focus:ring-4 focus:ring-primary/10 focus:border-primary/50 transition-all w-full sm:w-72 uppercase tracking-tighter"
                    />
                    {searchTerm && (
                        <button
                            onClick={() => setSearchTerm('')}
                            className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                        >
                            <X size={14} />
                        </button>
                    )}
                </div>
            </div>

            {/* Lista de proyectos */}
            {isLoading ? (
                <div className="flex flex-col items-center justify-center py-24 space-y-4 px-4">
                    <Loader2 className="w-10 h-10 text-primary animate-spin" />
                    <p className="text-xs font-bold uppercase tracking-widest text-muted-foreground text-center">
                        Sincronizando proyectos…
                    </p>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4 sm:gap-6">
                    {filteredProjects.length > 0 ? (
                        filteredProjects.map((project) => (
                            <ProjectCard
                                key={project.id}
                                project={project}
                                onView={handleViewProject}
                                onConfig={handleEditProject}
                            />
                        ))
                    ) : (
                        <div className="col-span-full py-24 text-center border-2 border-dashed border-border rounded-3xl space-y-4">
                            <FileText className="w-12 h-12 text-muted-foreground/30 mx-auto" />
                            <p className="text-xs font-black uppercase tracking-[0.3em] text-muted-foreground/50">
                                {searchTerm
                                    ? 'No hay coincidencias para tu búsqueda'
                                    : activeTab !== 'all'
                                    ? `No hay proyectos ${TAB_CONFIG[activeTab].label.toLowerCase()}`
                                    : 'No se encontraron proyectos en el sistema'}
                            </p>
                        </div>
                    )}
                </div>
            )}

            {/* Modal Nuevo Proyecto */}
            <NewProjectModal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                onSuccess={handleProjectCreated}
            />

            {/* Modal Editar Proyecto */}
            <EditProjectModal
                isOpen={isEditModalOpen}
                onClose={() => {
                    setIsEditModalOpen(false)
                    setEditingProject(null)
                }}
                project={editingProject}
                onSuccess={fetchProjects}
            />

            {/* Toast de éxito */}
            {successProjectId && (
                <div className="fixed bottom-6 right-6 z-[200] animate-in slide-in-from-bottom-4 fade-in duration-300">
                    <div className="rounded-2xl bg-emerald-600 text-white px-5 py-4 shadow-2xl flex items-start gap-3 max-w-sm">
                        <CheckCircle2 size={20} className="shrink-0 mt-0.5" />
                        <div>
                            <p className="text-xs font-black uppercase tracking-wider">
                                Proyecto Creado
                            </p>
                            <p className="text-[11px] font-medium mt-0.5 opacity-90">
                                El proyecto se ha creado y las fases han sido inicializadas.
                            </p>
                        </div>
                        <button
                            onClick={() => setSuccessProjectId(null)}
                            className="shrink-0 text-white/60 hover:text-white"
                        >
                            <X size={14} />
                        </button>
                    </div>
                </div>
            )}
        </div>
    )
}
