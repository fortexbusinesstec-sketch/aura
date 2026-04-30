'use client'

import { useState, useTransition, useMemo } from 'react'
import { Plus, Search, Layers, Rocket, LayoutGrid } from 'lucide-react'
import { PhaseTemplate, ProjectType } from '@/types'
import { PageHeader } from '@/components/ui/PageHeader'
import { PhaseTemplateCard } from './PhaseTemplateCard'
import { PhaseTemplateFormModal } from './PhaseTemplateFormModal'
import { PhaseTemplatePreviewModal } from './PhaseTemplatePreviewModal'
import { createPhaseTemplate, updatePhaseTemplate, deletePhaseTemplate } from '@/app/(workspace)/desarrollo/master/phaseActions'

type FilterTab = 'all' | 'develop' | 'product'

interface PhaseTemplateManagerProps {
    initialTemplates: PhaseTemplate[]
}

const TAB_CONFIG: Record<FilterTab, { label: string; icon: React.ElementType }> = {
    all: { label: 'Todas', icon: LayoutGrid },
    develop: { label: 'Desarrollo Web', icon: Layers },
    product: { label: 'Productos SaaS', icon: Rocket },
}

export function PhaseTemplateManager({ initialTemplates }: PhaseTemplateManagerProps) {
    const [templates, setTemplates] = useState<PhaseTemplate[]>(initialTemplates)
    const [activeTab, setActiveTab] = useState<FilterTab>('all')
    const [searchQuery, setSearchQuery] = useState('')

    const [isFormOpen, setIsFormOpen] = useState(false)
    const [editingTemplate, setEditingTemplate] = useState<PhaseTemplate | null>(null)

    const [previewTemplate, setPreviewTemplate] = useState<PhaseTemplate | null>(null)
    const [isPreviewOpen, setIsPreviewOpen] = useState(false)

    const [isPending, startTransition] = useTransition()

    const filteredTemplates = useMemo(() => {
        return templates.filter(template => {
            const matchesTab = activeTab === 'all' || template.project_type === activeTab
            const matchesSearch = template.name.toLowerCase().includes(searchQuery.toLowerCase())
            return matchesTab && matchesSearch
        })
    }, [templates, activeTab, searchQuery])

    const handleOpenCreate = () => {
        setEditingTemplate(null)
        setIsFormOpen(true)
    }

    const handleOpenEdit = (template: PhaseTemplate) => {
        setEditingTemplate(template)
        setIsFormOpen(true)
    }

    const handleOpenPreview = (template: PhaseTemplate) => {
        setPreviewTemplate(template)
        setIsPreviewOpen(true)
    }

    const handleDelete = (template: PhaseTemplate) => {
        if (!window.confirm(`¿Eliminar la plantilla "${template.name}"? Esta acción no se puede deshacer.`)) {
            return
        }

        startTransition(async () => {
            const result = await deletePhaseTemplate(template.id)
            if (result.success) {
                setTemplates(prev => prev.filter(t => t.id !== template.id))
            } else {
                alert('Error al eliminar: ' + result.error)
            }
        })
    }

    const handleSave = (data: {
        name: string
        project_type: ProjectType
        is_default: boolean
        phases_definition: PhaseTemplate['phases_definition']
    }) => {
        startTransition(async () => {
            if (editingTemplate) {
                // Update
                const result = await updatePhaseTemplate(editingTemplate.id, data)
                if (result.success) {
                    setTemplates(prev =>
                        prev.map(t =>
                            t.id === editingTemplate.id
                                ? { ...t, ...data }
                                : t
                        )
                    )
                    setIsFormOpen(false)
                    setEditingTemplate(null)
                } else {
                    alert('Error al actualizar: ' + result.error)
                }
            } else {
                // Create
                const result = await createPhaseTemplate(data as Omit<PhaseTemplate, 'id' | 'created_at'>)
                if (result.success && result.id) {
                    const newTemplate: PhaseTemplate = {
                        id: result.id,
                        name: data.name,
                        project_type: data.project_type,
                        is_default: data.is_default,
                        phases_definition: data.phases_definition,
                        created_at: new Date().toISOString(),
                    }
                    setTemplates(prev => [newTemplate, ...prev])
                    setIsFormOpen(false)
                } else {
                    alert('Error al crear: ' + result.error)
                }
            }
        })
    }

    return (
        <div className="space-y-8">
            <PageHeader
                title="Fases del Proyecto"
                subtitle="Plantillas maestras para Desarrollo y Productos SaaS"
                backUrl="/desarrollo"
                action={
                    <button
                        onClick={handleOpenCreate}
                        className="flex items-center gap-2 rounded-2xl bg-primary px-6 py-3.5 text-xs font-black text-primary-foreground transition-all hover:bg-primary/90 active:scale-95 shadow-sm uppercase tracking-widest"
                    >
                        <Plus size={20} strokeWidth={4} />
                        Nueva Plantilla
                    </button>
                }
            />

            {/* Filters */}
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                {/* Tabs */}
                <div className="flex items-center gap-1 rounded-2xl border border-border/50 bg-card p-1">
                    {(Object.entries(TAB_CONFIG) as [FilterTab, typeof TAB_CONFIG['all']][]).map(([key, config]) => {
                        const Icon = config.icon
                        const isActive = activeTab === key
                        return (
                            <button
                                key={key}
                                onClick={() => setActiveTab(key)}
                                className={`flex items-center gap-2 rounded-xl px-4 py-2.5 text-[11px] font-black uppercase tracking-widest transition-all ${
                                    isActive
                                        ? 'bg-primary text-primary-foreground shadow-sm'
                                        : 'text-muted-foreground hover:text-foreground hover:bg-accent/50'
                                }`}
                            >
                                <Icon size={14} />
                                {config.label}
                            </button>
                        )
                    })}
                </div>

                {/* Search */}
                <div className="relative group w-full sm:w-72">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground group-focus-within:text-foreground transition-colors" size={16} />
                    <input
                        type="text"
                        value={searchQuery}
                        onChange={e => setSearchQuery(e.target.value)}
                        placeholder="Buscar plantilla..."
                        className="w-full rounded-2xl border border-border bg-card pl-11 pr-4 py-3 text-xs text-foreground outline-none focus:border-primary/50 focus:ring-4 focus:ring-primary/10 transition-all placeholder:text-muted-foreground/40 font-bold"
                    />
                </div>
            </div>

            {/* Grid */}
            {filteredTemplates.length === 0 ? (
                <div className="flex flex-col items-center justify-center rounded-3xl border border-dashed border-border bg-card/50 py-20">
                    <LayoutGrid size={40} className="text-muted-foreground/30 mb-4" />
                    <p className="text-sm font-bold text-muted-foreground">
                        {searchQuery
                            ? 'No se encontraron plantillas con ese nombre'
                            : activeTab !== 'all'
                                ? 'No hay plantillas para esta categoría'
                                : 'No hay plantillas de fases creadas aún'
                        }
                    </p>
                    <button
                        onClick={handleOpenCreate}
                        className="mt-4 text-[11px] font-black uppercase tracking-widest text-primary-foreground bg-primary px-5 py-2.5 rounded-xl hover:bg-primary/90 transition-all"
                    >
                        Crear primera plantilla
                    </button>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
                    {filteredTemplates.map(template => (
                        <PhaseTemplateCard
                            key={template.id}
                            template={template}
                            onView={handleOpenPreview}
                            onEdit={handleOpenEdit}
                            onDelete={handleDelete}
                        />
                    ))}
                </div>
            )}

            {/* Form Modal */}
            <PhaseTemplateFormModal
                template={editingTemplate}
                isOpen={isFormOpen}
                onClose={() => {
                    setIsFormOpen(false)
                    setEditingTemplate(null)
                }}
                onSave={handleSave}
                isPending={isPending}
            />

            {/* Preview Modal */}
            <PhaseTemplatePreviewModal
                template={previewTemplate}
                isOpen={isPreviewOpen}
                onClose={() => {
                    setIsPreviewOpen(false)
                    setPreviewTemplate(null)
                }}
            />
        </div>
    )
}
