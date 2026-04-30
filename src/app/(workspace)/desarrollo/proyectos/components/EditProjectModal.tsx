'use client'

import { useState, useEffect } from 'react'
import { Modal } from '@/components/ui/Modal'
import { Project, ProjectStatus } from '@/types'
import { updateProject, getProfiles } from '../actions'
import { 
    Loader2, 
    Save, 
    X, 
    Rocket, 
    FileText, 
    User, 
    Calendar, 
    Clock,
    Activity,
    Globe
} from 'lucide-react'

interface ProfileOption {
    id: string
    full_name: string
    role: string
}

interface EditProjectModalProps {
    isOpen: boolean
    onClose: () => void
    project: Project | null
    onSuccess: () => void
}

const STATUS_OPTIONS: { value: ProjectStatus; label: string }[] = [
    { value: 'planning', label: 'Planificación' },
    { value: 'active', label: 'En Progreso' },
    { value: 'review', label: 'En Revisión' },
    { value: 'paused', label: 'Pausado' },
    { value: 'completed', label: 'Completado' },
    { value: 'cancelled', label: 'Cancelado' },
    { value: 'maintenance', label: 'Mantenimiento' },
]

export function EditProjectModal({ isOpen, onClose, project, onSuccess }: EditProjectModalProps) {
    const [isLoading, setIsLoading] = useState(false)
    const [profiles, setProfiles] = useState<ProfileOption[]>([])
    const [errorMsg, setErrorMsg] = useState('')

    // Form state
    const [name, setName] = useState('')
    const [description, setDescription] = useState('')
    const [status, setStatus] = useState<ProjectStatus>('planning')
    const [kickoffDate, setKickoffDate] = useState('')
    const [deadlineDate, setDeadlineDate] = useState('')
    const [leadDevId, setLeadDevId] = useState('')
    const [projectManagerId, setProjectManagerId] = useState('')
    const [stagingUrl, setStagingUrl] = useState('')

    useEffect(() => {
        if (isOpen && project) {
            setName(project.name || '')
            setDescription(project.description || '')
            setStatus(project.status || 'planning')
            setKickoffDate(project.kickoff_date || '')
            setDeadlineDate(project.deadline_date || '')
            setLeadDevId(project.lead_dev_id || '')
            setProjectManagerId(project.project_manager_id || '')
            setStagingUrl(project.staging_url || '')
            setErrorMsg('')

            // Load profiles if not loaded
            getProfiles().then(res => {
                if (res.success && res.data) setProfiles(res.data)
            })
        }
    }, [isOpen, project])

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        if (!project) return

        setIsLoading(true)
        setErrorMsg('')

        const res = await updateProject(project.id, {
            name,
            description,
            status,
            kickoff_date: kickoffDate || null,
            deadline_date: deadlineDate || null,
            lead_dev_id: leadDevId || null,
            project_manager_id: projectManagerId || null,
            staging_url: stagingUrl || null,
        })

        setIsLoading(false)

        if (res.success) {
            onSuccess()
            onClose()
        } else {
            setErrorMsg(res.error || 'Error al actualizar el proyecto')
        }
    }

    return (
        <Modal
            isOpen={isOpen}
            onClose={onClose}
            title="Editar Proyecto"
            maxWidth="max-w-[600px]"
        >
            <form onSubmit={handleSubmit} className="space-y-6">
                {errorMsg && (
                    <div className="p-3 rounded-xl bg-red-50 border border-red-200 text-red-600 text-[11px] font-bold uppercase tracking-tight">
                        {errorMsg}
                    </div>
                )}

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {/* Nombre */}
                    <div className="space-y-1.5 md:col-span-2">
                        <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground flex items-center gap-2">
                            <Rocket size={12} /> Nombre del Proyecto
                        </label>
                        <input
                            type="text"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            required
                            className="w-full bg-card border border-border rounded-2xl px-4 py-3 text-xs font-bold focus:ring-4 focus:ring-primary/10 outline-none transition-all uppercase tracking-tighter"
                        />
                    </div>

                    {/* Descripción */}
                    <div className="space-y-1.5 md:col-span-2">
                        <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground flex items-center gap-2">
                            <FileText size={12} /> Descripción / Entregables
                        </label>
                        <textarea
                            value={description}
                            onChange={(e) => setDescription(e.target.value)}
                            rows={3}
                            className="w-full bg-card border border-border rounded-2xl px-4 py-3 text-xs font-bold focus:ring-4 focus:ring-primary/10 outline-none transition-all uppercase tracking-tighter resize-none"
                        />
                    </div>

                    {/* Estado */}
                    <div className="space-y-1.5">
                        <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground flex items-center gap-2">
                            <Activity size={12} /> Estado Actual
                        </label>
                        <select
                            value={status}
                            onChange={(e) => setStatus(e.target.value as ProjectStatus)}
                            className="w-full bg-card border border-border rounded-2xl px-4 py-3 text-xs font-bold focus:ring-4 focus:ring-primary/10 outline-none transition-all uppercase tracking-tighter"
                        >
                            {STATUS_OPTIONS.map(opt => (
                                <option key={opt.value} value={opt.value}>{opt.label}</option>
                            ))}
                        </select>
                    </div>

                    {/* Deadline */}
                    <div className="space-y-1.5">
                        <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground flex items-center gap-2">
                            <Clock size={12} /> Deadline
                        </label>
                        <input
                            type="date"
                            value={deadlineDate}
                            onChange={(e) => setDeadlineDate(e.target.value)}
                            className="w-full bg-card border border-border rounded-2xl px-4 py-3 text-xs font-bold focus:ring-4 focus:ring-primary/10 outline-none transition-all uppercase tracking-tighter"
                        />
                    </div>

                    {/* Lead Dev */}
                    <div className="space-y-1.5">
                        <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground flex items-center gap-2">
                            <User size={12} /> Lead Developer
                        </label>
                        <select
                            value={leadDevId}
                            onChange={(e) => setLeadDevId(e.target.value)}
                            className="w-full bg-card border border-border rounded-2xl px-4 py-3 text-xs font-bold focus:ring-4 focus:ring-primary/10 outline-none transition-all uppercase tracking-tighter"
                        >
                            <option value="">No asignado</option>
                            {profiles.map(p => (
                                <option key={p.id} value={p.id}>{p.full_name} ({p.role})</option>
                            ))}
                        </select>
                    </div>

                    {/* PM */}
                    <div className="space-y-1.5">
                        <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground flex items-center gap-2">
                            <User size={12} /> Project Manager
                        </label>
                        <select
                            value={projectManagerId}
                            onChange={(e) => setProjectManagerId(e.target.value)}
                            className="w-full bg-card border border-border rounded-2xl px-4 py-3 text-xs font-bold focus:ring-4 focus:ring-primary/10 outline-none transition-all uppercase tracking-tighter"
                        >
                            <option value="">No asignado</option>
                            {profiles.map(p => (
                                <option key={p.id} value={p.id}>{p.full_name} ({p.role})</option>
                            ))}
                        </select>
                    </div>

                    {/* Staging URL */}
                    <div className="space-y-1.5 md:col-span-2">
                        <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground flex items-center gap-2">
                            <Globe size={12} /> URL de Staging (Cloudflare Pages)
                        </label>
                        <input
                            type="url"
                            value={stagingUrl}
                            onChange={(e) => setStagingUrl(e.target.value)}
                            placeholder="https://tu-proyecto.pages.dev"
                            className="w-full bg-card border border-border rounded-2xl px-4 py-3 text-xs font-bold focus:ring-4 focus:ring-primary/10 outline-none transition-all uppercase tracking-tighter"
                        />
                    </div>
                </div>

                <div className="flex items-center justify-end gap-3 pt-4 border-t border-border/50">
                    <button
                        type="button"
                        onClick={onClose}
                        className="px-6 py-3 rounded-2xl border border-border text-[10px] font-black uppercase tracking-widest hover:bg-accent transition-all"
                    >
                        Cancelar
                    </button>
                    <button
                        type="submit"
                        disabled={isLoading}
                        className="flex items-center gap-2 px-6 py-3 bg-primary text-primary-foreground rounded-2xl border border-border text-[10px] font-black uppercase tracking-widest hover:bg-primary/90 transition-all disabled:opacity-50"
                    >
                        {isLoading ? <Loader2 size={14} className="animate-spin" /> : <Save size={14} />}
                        Guardar Cambios
                    </button>
                </div>
            </form>
        </Modal>
    )
}
