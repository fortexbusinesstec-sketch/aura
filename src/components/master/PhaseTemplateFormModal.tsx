'use client'

import { useState, useEffect, useCallback } from 'react'
import { Modal } from '@/components/ui/Modal'
import { PhaseTemplate, PhaseDefinition, ProjectType } from '@/types'
import { Plus, Trash2, ArrowUp, ArrowDown, AlertCircle } from 'lucide-react'

interface PhaseTemplateFormModalProps {
    template: PhaseTemplate | null
    isOpen: boolean
    onClose: () => void
    onSave: (data: {
        name: string
        project_type: ProjectType
        is_default: boolean
        phases_definition: PhaseDefinition[]
    }) => void
    isPending?: boolean
}

const SNAKE_CASE_REGEX = /^[a-z0-9]+(_[a-z0-9]+)*$/

function createEmptyPhase(order: number): PhaseDefinition {
    return {
        key: '',
        name: '',
        order,
        revision_limit: 2,
        default_duration_days: 3,
    }
}

export function PhaseTemplateFormModal({ template, isOpen, onClose, onSave, isPending }: PhaseTemplateFormModalProps) {
    const [name, setName] = useState('')
    const [projectType, setProjectType] = useState<ProjectType>('develop')
    const [isDefault, setIsDefault] = useState(false)
    const [phases, setPhases] = useState<PhaseDefinition[]>([createEmptyPhase(1)])
    const [errors, setErrors] = useState<Record<string, string>>({})

    const isEditing = !!template

    useEffect(() => {
        if (template) {
            setName(template.name)
            setProjectType(template.project_type)
            setIsDefault(template.is_default)
            setPhases(
                template.phases_definition.length > 0
                    ? [...template.phases_definition].sort((a, b) => a.order - b.order)
                    : [createEmptyPhase(1)]
            )
        } else {
            setName('')
            setProjectType('develop')
            setIsDefault(false)
            setPhases([createEmptyPhase(1)])
        }
        setErrors({})
    }, [template, isOpen])

    const validate = useCallback((): boolean => {
        const newErrors: Record<string, string> = {}

        if (!name.trim()) {
            newErrors.name = 'El nombre de la plantilla es obligatorio'
        }

        if (projectType !== 'develop' && projectType !== 'product') {
            newErrors.project_type = 'El tipo de proyecto debe ser Desarrollo Web o Producto SaaS'
        }

        const keys = new Set<string>()
        phases.forEach((phase, index) => {
            if (!phase.name.trim()) {
                newErrors[`phase_${index}_name`] = 'Nombre obligatorio'
            }
            if (!phase.key.trim()) {
                newErrors[`phase_${index}_key`] = 'Key obligatoria'
            } else if (!SNAKE_CASE_REGEX.test(phase.key)) {
                newErrors[`phase_${index}_key`] = 'Usa snake_case (ej: wireframes_lofi)'
            } else if (keys.has(phase.key)) {
                newErrors[`phase_${index}_key`] = 'Key duplicada'
            } else {
                keys.add(phase.key)
            }
            if (phase.default_duration_days < 1) {
                newErrors[`phase_${index}_days`] = 'Mínimo 1 día'
            }
            if (phase.revision_limit < 0) {
                newErrors[`phase_${index}_revisions`] = 'No puede ser negativo'
            }
        })

        // Validate sequential orders
        const sortedOrders = [...phases].map(p => p.order).sort((a, b) => a - b)
        for (let i = 0; i < sortedOrders.length; i++) {
            if (sortedOrders[i] !== i + 1) {
                newErrors.order = 'Los órdenes deben ser secuenciales (1, 2, 3...)'
                break
            }
        }

        setErrors(newErrors)
        return Object.keys(newErrors).length === 0
    }, [name, projectType, phases])

    const handleSave = () => {
        if (!validate()) return

        onSave({
            name: name.trim(),
            project_type: projectType,
            is_default: isDefault,
            phases_definition: phases.map((p, i) => ({ ...p, order: i + 1 })).sort((a, b) => a.order - b.order),
        })
    }

    const addPhase = () => {
        setPhases(prev => [...prev, createEmptyPhase(prev.length + 1)])
    }

    const removePhase = (index: number) => {
        setPhases(prev => {
            const next = prev.filter((_, i) => i !== index)
            // Reassign orders
            return next.map((p, i) => ({ ...p, order: i + 1 }))
        })
    }

    const movePhase = (index: number, direction: 'up' | 'down') => {
        if (direction === 'up' && index === 0) return
        if (direction === 'down' && index === phases.length - 1) return

        setPhases(prev => {
            const next = [...prev]
            const swapIndex = direction === 'up' ? index - 1 : index + 1
            const temp = next[index]
            next[index] = next[swapIndex]
            next[swapIndex] = temp
            // Reassign orders
            return next.map((p, i) => ({ ...p, order: i + 1 }))
        })
    }

    const updatePhase = (index: number, field: keyof PhaseDefinition, value: string | number) => {
        setPhases(prev =>
            prev.map((p, i) =>
                i === index ? { ...p, [field]: value } : p
            )
        )
    }

    return (
        <Modal
            isOpen={isOpen}
            onClose={onClose}
            title={isEditing ? 'Editar Plantilla de Fases' : 'Nueva Plantilla de Fases'}
            maxWidth="max-w-3xl"
        >
            <div className="space-y-6 max-h-[70vh] overflow-y-auto pr-1">
                {/* Basic info */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                        <label className="text-[11px] font-black uppercase text-muted-foreground tracking-[0.2em] ml-1">
                            Nombre de Plantilla
                        </label>
                        <input
                            value={name}
                            onChange={e => setName(e.target.value)}
                            placeholder="Ej. Landing Page Estándar"
                            className="w-full rounded-2xl border border-border bg-background px-4 py-3 text-sm text-foreground outline-none focus:border-primary/50 focus:ring-4 focus:ring-primary/10 transition-all placeholder:text-muted-foreground/40 font-bold"
                        />
                        {errors.name && (
                            <p className="text-[10px] font-bold text-destructive flex items-center gap-1">
                                <AlertCircle size={10} /> {errors.name}
                            </p>
                        )}
                    </div>

                    <div className="space-y-2">
                        <label className="text-[11px] font-black uppercase text-muted-foreground tracking-[0.2em] ml-1">
                            Tipo de Proyecto
                        </label>
                        <select
                            value={projectType}
                            onChange={e => setProjectType(e.target.value as ProjectType)}
                            className="w-full rounded-2xl border border-border bg-background px-4 py-3 text-sm text-foreground outline-none focus:border-primary/50 focus:ring-4 focus:ring-primary/10 transition-all font-bold appearance-none cursor-pointer"
                        >
                            <option value="develop">Desarrollo Web</option>
                            <option value="product">Producto SaaS</option>
                        </select>
                    </div>
                </div>

                {/* Default checkbox */}
                <label className="flex items-center gap-3 cursor-pointer group">
                    <div className="relative">
                        <input
                            type="checkbox"
                            checked={isDefault}
                            onChange={e => setIsDefault(e.target.checked)}
                            className="peer sr-only"
                        />
                        <div className="h-5 w-5 rounded-md border-2 border-border bg-background peer-checked:bg-primary peer-checked:border-primary transition-all" />
                        <svg
                            className="absolute inset-0 m-auto h-3 w-3 text-primary-foreground opacity-0 peer-checked:opacity-100 transition-opacity pointer-events-none"
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                            strokeWidth={4}
                        >
                            <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                        </svg>
                    </div>
                    <span className="text-xs font-bold text-foreground group-hover:text-foreground/80 transition-colors">
                        ¿Es plantilla por defecto?
                    </span>
                </label>

                {/* Phases section */}
                <div className="space-y-3">
                    <div className="flex items-center justify-between">
                        <h4 className="text-[11px] font-black uppercase text-muted-foreground tracking-[0.2em]">
                            Fases de la Plantilla
                        </h4>
                        {errors.order && (
                            <p className="text-[10px] font-bold text-destructive flex items-center gap-1">
                                <AlertCircle size={10} /> {errors.order}
                            </p>
                        )}
                    </div>

                    <div className="space-y-2">
                        {phases.map((phase, index) => (
                            <div
                                key={index}
                                className="rounded-2xl border border-border/50 bg-background/60 p-3 space-y-2"
                            >
                                <div className="flex items-center gap-2">
                                    <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary-foreground font-black text-[10px]">
                                        {phase.order}
                                    </div>
                                    <div className="flex-1 grid grid-cols-1 sm:grid-cols-2 gap-2">
                                        <input
                                            value={phase.name}
                                            onChange={e => updatePhase(index, 'name', e.target.value)}
                                            placeholder="Nombre de fase"
                                            className="w-full rounded-xl border border-border bg-card px-3 py-2 text-xs text-foreground outline-none focus:border-primary/50 focus:ring-2 focus:ring-primary/10 transition-all placeholder:text-muted-foreground/40 font-bold"
                                        />
                                        <input
                                            value={phase.key}
                                            onChange={e => updatePhase(index, 'key', e.target.value)}
                                            placeholder="key_tecnico"
                                            className="w-full rounded-xl border border-border bg-card px-3 py-2 text-xs text-foreground outline-none focus:border-primary/50 focus:ring-2 focus:ring-primary/10 transition-all placeholder:text-muted-foreground/40 font-mono"
                                        />
                                    </div>
                                    <div className="flex items-center gap-1">
                                        <button
                                            type="button"
                                            onClick={() => movePhase(index, 'up')}
                                            disabled={index === 0}
                                            className="p-1.5 rounded-lg text-muted-foreground hover:text-foreground hover:bg-accent disabled:opacity-30 disabled:hover:bg-transparent transition-all"
                                        >
                                            <ArrowUp size={14} />
                                        </button>
                                        <button
                                            type="button"
                                            onClick={() => movePhase(index, 'down')}
                                            disabled={index === phases.length - 1}
                                            className="p-1.5 rounded-lg text-muted-foreground hover:text-foreground hover:bg-accent disabled:opacity-30 disabled:hover:bg-transparent transition-all"
                                        >
                                            <ArrowDown size={14} />
                                        </button>
                                        <button
                                            type="button"
                                            onClick={() => removePhase(index)}
                                            className="p-1.5 rounded-lg text-destructive/60 hover:text-destructive hover:bg-destructive/10 transition-all"
                                        >
                                            <Trash2 size={14} />
                                        </button>
                                    </div>
                                </div>

                                {(errors[`phase_${index}_name`] || errors[`phase_${index}_key`]) && (
                                    <div className="flex flex-wrap gap-3 pl-9">
                                        {errors[`phase_${index}_name`] && (
                                            <p className="text-[10px] font-bold text-destructive flex items-center gap-1">
                                                <AlertCircle size={10} /> {errors[`phase_${index}_name`]}
                                            </p>
                                        )}
                                        {errors[`phase_${index}_key`] && (
                                            <p className="text-[10px] font-bold text-destructive flex items-center gap-1">
                                                <AlertCircle size={10} /> {errors[`phase_${index}_key`]}
                                            </p>
                                        )}
                                    </div>
                                )}

                                <div className="flex items-center gap-3 pl-9">
                                    <div className="space-y-1">
                                        <label className="text-[9px] font-black uppercase text-muted-foreground tracking-wider">Revisiones</label>
                                        <input
                                            type="number"
                                            min={0}
                                            value={phase.revision_limit}
                                            onChange={e => updatePhase(index, 'revision_limit', parseInt(e.target.value) || 0)}
                                            className="w-20 rounded-xl border border-border bg-card px-3 py-2 text-xs text-foreground outline-none focus:border-primary/50 focus:ring-2 focus:ring-primary/10 transition-all font-mono font-bold"
                                        />
                                    </div>
                                    <div className="space-y-1">
                                        <label className="text-[9px] font-black uppercase text-muted-foreground tracking-wider">Días</label>
                                        <input
                                            type="number"
                                            min={1}
                                            value={phase.default_duration_days}
                                            onChange={e => updatePhase(index, 'default_duration_days', parseInt(e.target.value) || 1)}
                                            className="w-20 rounded-xl border border-border bg-card px-3 py-2 text-xs text-foreground outline-none focus:border-primary/50 focus:ring-2 focus:ring-primary/10 transition-all font-mono font-bold"
                                        />
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>

                    <button
                        type="button"
                        onClick={addPhase}
                        className="flex items-center gap-2 rounded-xl border border-dashed border-border hover:border-primary/40 hover:bg-primary/5 px-4 py-2.5 text-[11px] font-black uppercase tracking-widest text-muted-foreground hover:text-foreground transition-all"
                    >
                        <Plus size={14} />
                        Agregar Fase
                    </button>
                </div>

                {/* Actions */}
                <div className="flex items-center gap-3 pt-2">
                    <button
                        type="button"
                        onClick={onClose}
                        className="flex-1 rounded-2xl border border-border bg-card py-3.5 text-[11px] font-black uppercase tracking-[0.2em] text-foreground hover:bg-accent transition-all"
                    >
                        Cancelar
                    </button>
                    <button
                        type="button"
                        onClick={handleSave}
                        disabled={isPending}
                        className="flex-1 rounded-2xl bg-primary py-3.5 text-[11px] font-black uppercase tracking-[0.2em] text-primary-foreground hover:bg-primary/90 disabled:opacity-50 transition-all active:scale-[0.98] shadow-sm"
                    >
                        {isPending ? 'Guardando...' : isEditing ? 'Guardar Cambios' : 'Guardar Plantilla'}
                    </button>
                </div>
            </div>
        </Modal>
    )
}
