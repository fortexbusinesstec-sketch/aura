'use client'

import React, { useEffect, useState } from 'react'
import Link from 'next/link'
import { PageHeader } from '@/components/ui/PageHeader'
import { Box, Package, Layers, Sparkles, TrendingUp, Terminal, ExternalLink, Plus, X, Database, Layout, Code2, Save } from 'lucide-react'
import { Card } from '@/components/ui/Card'
import { getProductProjectsAction, createProductProjectAction } from './actions'
import { ProductProject, ProductStatus } from '@/types'

export default function ProductPage() {
    const [projects, setProjects] = useState<ProductProject[]>([])
    const [isLoading, setIsLoading] = useState(true)
    const [isModalOpen, setIsModalOpen] = useState(false)
    const [isSaving, setIsSaving] = useState(false)

    // Form State
    const [formData, setFormData] = useState({
        name: '',
        description: '',
        status: 'planning' as ProductStatus,
        github_repo_url: '',
        github_owner: '',
        github_repo_name: '',
        tech_stack: {
            frontend: '',
            backend: '',
            db: '',
        }
    })

    useEffect(() => {
        loadProjects()
    }, [])

    async function loadProjects() {
        setIsLoading(true)
        const data = await getProductProjectsAction()
        setProjects(data)
        setIsLoading(false)
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setIsSaving(true)
        const { success } = await createProductProjectAction(formData)
        if (success) {
            await loadProjects()
            setIsModalOpen(false)
            setFormData({
                name: '',
                description: '',
                status: 'planning',
                github_repo_url: '',
                github_owner: '',
                github_repo_name: '',
                tech_stack: { frontend: '', backend: '', db: '' }
            })
        }
        setIsSaving(false)
    }

    return (
        <div className="space-y-8 animate-in fade-in duration-700">
            <div className="flex items-center justify-between">
                <PageHeader
                    title="Product Ecosystem"
                    subtitle="Gestión de ciclo de vida, innovación y diseño de producto."
                />
                <button
                    onClick={() => setIsModalOpen(true)}
                    className="flex items-center gap-2 rounded-2xl bg-emerald-50 border border-emerald-200 px-8 py-4 text-[11px] font-black uppercase tracking-[0.15em] text-emerald-700 hover:bg-emerald-100 hover:scale-105 transition-all shadow-sm"
                >
                    <Plus size={18} /> Nuevo Producto
                </button>
            </div>

            {/* DASHBOARD STATS */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {[
                    { label: 'Productos Activos', value: projects.length.toString(), icon: Package, color: 'text-emerald-500' },
                    { label: 'En Desarrollo', value: projects.filter(p => p.status === 'development').length.toString(), icon: Layers, color: 'text-amber-500' },
                    { label: 'En Producción', value: projects.filter(p => p.status === 'production').length.toString(), icon: Sparkles, color: 'text-purple-500' },
                    { label: 'Versión Core', value: 'v2.4.0', icon: TrendingUp, color: 'text-sky-500' },
                ].map((stat, i) => (
                    <Card key={i} className="p-6 border-border/40 bg-card/50 backdrop-blur-sm group hover:border-emerald-500/30 transition-all">
                        <div className="flex items-center justify-between mb-4">
                            <div className={`p-2 rounded-lg bg-background border border-border/50 ${stat.color}`}>
                                <stat.icon size={20} />
                            </div>
                            <span className="text-[10px] font-black uppercase text-muted-foreground tracking-widest">Live Sync</span>
                        </div>
                        <h3 className="text-2xl font-black tracking-tighter text-foreground">{stat.value}</h3>
                        <p className="text-xs font-bold text-muted-foreground uppercase tracking-wider mt-1">{stat.label}</p>
                    </Card>
                ))}
            </div>

            {/* PROJECTS GRID */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                <div className="lg:col-span-2 space-y-6">
                    <h2 className="text-lg font-black uppercase tracking-tighter text-foreground px-1">Portfolio de Productos</h2>

                    {isLoading ? (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            {[1, 2, 3, 4].map(i => (
                                <div key={i} className="h-48 rounded-3xl bg-secondary/20 animate-pulse" />
                            ))}
                        </div>
                    ) : projects.length === 0 ? (
                        <Card className="p-12 border-dashed border-border/60 bg-transparent flex flex-col items-center justify-center text-center">
                            <Box size={40} className="text-muted-foreground opacity-20 mb-4" />
                            <p className="text-sm font-bold text-muted-foreground uppercase tracking-widest">No hay productos registrados</p>
                        </Card>
                    ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            {projects.map((project) => (
                                <Card key={project.id} className="p-6 border-border/40 bg-card/50 backdrop-blur-sm hover:border-emerald-500/30 transition-all group overflow-hidden relative">
                                    <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-500/5 blur-3xl rounded-full translate-x-16 -translate-y-16" />
                                    <div className="flex justify-between items-start mb-4 relative z-10">
                                        <div className="space-y-1">
                                            <div className="flex items-center gap-2">
                                                <h3 className="text-base font-black tracking-tight text-foreground uppercase">{project.name}</h3>
                                                <span className={`px-2 py-0.5 rounded text-[8px] font-black uppercase tracking-widest bg-emerald-500/10 text-emerald-500`}>
                                                    {project.status}
                                                </span>
                                            </div>
                                            <p className="text-[10px] font-medium text-muted-foreground line-clamp-2">{project.description}</p>
                                        </div>
                                        {project.github_repo_url && (
                                            <a href={project.github_repo_url} target="_blank" rel="noreferrer" className="p-2 rounded-lg bg-secondary/50 text-muted-foreground hover:text-foreground transition-colors">
                                                <Terminal size={16} />
                                            </a>
                                        )}
                                    </div>

                                    <div className="space-y-4 pt-4 border-t border-border/10 relative z-10">
                                        <div className="flex flex-wrap gap-2">
                                            {project.tech_stack?.frontend && (
                                                <span className="px-2 py-1 rounded bg-background border border-border/40 text-[9px] font-bold text-muted-foreground uppercase">{project.tech_stack.frontend}</span>
                                            )}
                                            {project.tech_stack?.backend && (
                                                <span className="px-2 py-1 rounded bg-background border border-border/40 text-[9px] font-bold text-muted-foreground uppercase">{project.tech_stack.backend}</span>
                                            )}
                                            {project.tech_stack?.db && (
                                                <span className="px-2 py-1 rounded bg-background border border-border/40 text-[9px] font-bold text-muted-foreground uppercase">{project.tech_stack.db}</span>
                                            )}
                                        </div>

                                        <div className="flex items-center justify-between">
                                            <span className="text-[9px] font-black text-muted-foreground uppercase tracking-widest">Last Sync: {project.last_github_sync ? new Date(project.last_github_sync).toLocaleDateString() : 'Never'}</span>
                                            <Link
                                                href={`/producto/${project.id}`}
                                                className="text-[9px] font-black text-emerald-500 uppercase tracking-widest flex items-center gap-1 hover:underline"
                                            >
                                                Detalles <ExternalLink size={10} />
                                            </Link>
                                        </div>
                                    </div>
                                </Card>
                            ))}
                        </div>
                    )}
                </div>

                <div className="space-y-8">
                    <Card className="p-8 border-border/40 bg-emerald-500/5 backdrop-blur-sm flex flex-col justify-center items-center text-center space-y-6">
                        <div className="w-20 h-20 rounded-3xl bg-emerald-500/20 flex items-center justify-center text-emerald-500">
                            <Box size={40} strokeWidth={1.5} />
                        </div>
                        <div>
                            <h2 className="text-xl font-black uppercase tracking-tighter text-foreground">Aura Genesis</h2>
                            <p className="text-xs font-medium text-muted-foreground mt-2 px-4 italic">
                                "Sincronizando el diccionario de datos con la lógica de negocio."
                            </p>
                        </div>
                        <button className="w-full py-4 rounded-xl bg-emerald-500 text-sky-950 font-black uppercase tracking-widest text-[10px] hover:scale-105 transition-all shadow-xl shadow-emerald-500/20">
                            Genesis Logic Sync
                        </button>
                    </Card>
                </div>
            </div>

            {/* LARGE CREATION MODAL */}
            {isModalOpen && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 sm:p-12 overflow-hidden">
                    <div className="absolute inset-0 bg-background/60 backdrop-blur-xl animate-in fade-in duration-500" onClick={() => setIsModalOpen(false)} />

                    <div className="relative z-10 w-full max-w-4xl max-h-[90vh] overflow-y-auto bg-card border border-border/50 rounded-[40px] shadow-2xl animate-in zoom-in-95 fade-in duration-300 custom-scrollbar">
                        <form onSubmit={handleSubmit}>
                            <div className="sticky top-0 z-20 bg-card/80 backdrop-blur-md px-10 py-8 border-b border-border/30 flex items-center justify-between">
                                <div>
                                    <div className="flex items-center gap-2 mb-1">
                                        <div className="w-2 h-2 rounded-full bg-emerald-500" />
                                        <p className="text-[10px] font-black uppercase tracking-[0.2em] text-emerald-500">Nuevo Activo Digital</p>
                                    </div>
                                    <h2 className="text-2xl font-black uppercase tracking-tighter text-foreground">Registrar Producto</h2>
                                </div>
                                <button
                                    type="button"
                                    onClick={() => setIsModalOpen(false)}
                                    className="p-3 rounded-2xl bg-secondary text-muted-foreground hover:text-foreground transition-all hover:rotate-90"
                                >
                                    <X size={20} />
                                </button>
                            </div>

                            <div className="p-10 space-y-12">
                                {/* SECTION: BASIC INFO */}
                                <section className="space-y-6">
                                    <div className="flex items-center gap-3 px-1">
                                        <Package className="text-emerald-500" size={18} />
                                        <h3 className="text-xs font-black uppercase tracking-widest text-foreground/70">Identidad del Producto</h3>
                                    </div>

                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                        <div className="space-y-2">
                                            <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground px-1">Nombre del Proyecto</label>
                                            <input
                                                required
                                                value={formData.name}
                                                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                                placeholder="Ej. Operate, Aura OS, Helix"
                                                className="w-full bg-background/50 border border-border/50 rounded-2xl px-6 py-4 text-sm font-bold focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500/50 outline-none transition-all placeholder:text-muted-foreground/30"
                                            />
                                        </div>
                                        <div className="space-y-2">
                                            <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground px-1">Estado de Ciclo</label>
                                            <select
                                                value={formData.status}
                                                onChange={(e) => setFormData({ ...formData, status: e.target.value as ProductStatus })}
                                                className="w-full bg-background/50 border border-border/50 rounded-2xl px-6 py-4 text-sm font-bold focus:ring-2 focus:ring-emerald-500/20 outline-none transition-all appearance-none"
                                            >
                                                <option value="planning">Planeación</option>
                                                <option value="development">Desarrollo</option>
                                                <option value="staging">Staging / QA</option>
                                                <option value="production">Producción</option>
                                            </select>
                                        </div>
                                        <div className="md:col-span-2 space-y-2">
                                            <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground px-1">Propósito del Negocio</label>
                                            <textarea
                                                rows={3}
                                                value={formData.description}
                                                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                                placeholder="Describe el impacto y el objetivo de este producto..."
                                                className="w-full bg-background/50 border border-border/50 rounded-2xl px-6 py-4 text-sm font-bold focus:ring-2 focus:ring-emerald-500/20 outline-none transition-all resize-none placeholder:text-muted-foreground/30"
                                            />
                                        </div>
                                    </div>
                                </section>

                                {/* SECTION: TECH STACK */}
                                <section className="space-y-6">
                                    <div className="flex items-center gap-3 px-1 text-sky-500">
                                        <Database size={18} />
                                        <h3 className="text-xs font-black uppercase tracking-widest text-foreground/70">Arquitectura Técnica</h3>
                                    </div>

                                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                        <div className="space-y-2">
                                            <label className="text-[9px] font-black uppercase tracking-widest text-muted-foreground flex items-center gap-1.5 px-1">
                                                <Layout size={10} /> Frontend
                                            </label>
                                            <input
                                                value={formData.tech_stack.frontend}
                                                onChange={(e) => setFormData({ ...formData, tech_stack: { ...formData.tech_stack, frontend: e.target.value } })}
                                                placeholder="Next.js / React"
                                                className="w-full bg-background/50 border border-border/50 rounded-xl px-4 py-3 text-xs font-bold outline-none focus:border-sky-500/40 transition-all"
                                            />
                                        </div>
                                        <div className="space-y-2">
                                            <label className="text-[9px] font-black uppercase tracking-widest text-muted-foreground flex items-center gap-1.5 px-1">
                                                <Code2 size={10} /> Backend
                                            </label>
                                            <input
                                                value={formData.tech_stack.backend}
                                                onChange={(e) => setFormData({ ...formData, tech_stack: { ...formData.tech_stack, backend: e.target.value } })}
                                                placeholder="FastAPI / Node.js"
                                                className="w-full bg-background/50 border border-border/50 rounded-xl px-4 py-3 text-xs font-bold outline-none focus:border-sky-500/40 transition-all"
                                            />
                                        </div>
                                        <div className="space-y-2">
                                            <label className="text-[9px] font-black uppercase tracking-widest text-muted-foreground flex items-center gap-1.5 px-1">
                                                <Database size={10} /> Base de Datos
                                            </label>
                                            <input
                                                value={formData.tech_stack.db}
                                                onChange={(e) => setFormData({ ...formData, tech_stack: { ...formData.tech_stack, db: e.target.value } })}
                                                placeholder="Postgres / Turso"
                                                className="w-full bg-background/50 border border-border/50 rounded-xl px-4 py-3 text-xs font-bold outline-none focus:border-sky-500/40 transition-all"
                                            />
                                        </div>
                                    </div>
                                </section>

                                {/* SECTION: GITHUB INTEGRATION */}
                                <section className="space-y-6">
                                    <div className="flex items-center gap-3 px-1 text-slate-400">
                                        <Terminal size={18} />
                                        <h3 className="text-xs font-black uppercase tracking-widest text-foreground/70">Sincronización GitHub</h3>
                                    </div>

                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                        <div className="md:col-span-2 space-y-2">
                                            <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground px-1">Repo URL</label>
                                            <input
                                                value={formData.github_repo_url}
                                                onChange={(e) => setFormData({ ...formData, github_repo_url: e.target.value })}
                                                placeholder="https://github.com/usuario/repo"
                                                className="w-full bg-background/50 border border-border/50 rounded-2xl px-6 py-4 text-sm font-bold focus:ring-2 focus:ring-slate-500/20 outline-none transition-all placeholder:text-muted-foreground/30"
                                            />
                                        </div>
                                        <div className="space-y-2">
                                            <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground px-1">GitHub Owner</label>
                                            <input
                                                value={formData.github_owner}
                                                onChange={(e) => setFormData({ ...formData, github_owner: e.target.value })}
                                                placeholder="ej. fortex-labs"
                                                className="w-full bg-background/50 border border-border/50 rounded-2xl px-6 py-4 text-sm font-bold outline-none transition-all"
                                            />
                                        </div>
                                        <div className="space-y-2">
                                            <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground px-1">Repo Name</label>
                                            <input
                                                value={formData.github_repo_name}
                                                onChange={(e) => setFormData({ ...formData, github_repo_name: e.target.value })}
                                                placeholder="ej. operate-fsm"
                                                className="w-full bg-background/50 border border-border/50 rounded-2xl px-6 py-4 text-sm font-bold outline-none transition-all"
                                            />
                                        </div>
                                    </div>
                                </section>
                            </div>

                            <div className="sticky bottom-0 bg-card/80 backdrop-blur-md px-10 py-8 border-t border-border/30 flex justify-end gap-4">
                                <button
                                    type="button"
                                    onClick={() => setIsModalOpen(false)}
                                    className="px-6 py-4 rounded-2xl text-[10px] font-black uppercase tracking-widest text-muted-foreground hover:bg-secondary transition-all"
                                >
                                    Cancelar
                                </button>
                                <button
                                    type="submit"
                                    disabled={isSaving}
                                    className="flex items-center gap-2 px-10 py-4 rounded-2xl bg-emerald-500 text-sky-950 text-[10px] font-black uppercase tracking-widest hover:scale-105 active:scale-95 transition-all shadow-xl shadow-emerald-500/20 disabled:opacity-50 disabled:grayscale"
                                >
                                    {isSaving ? 'Guardando...' : <><Save size={16} /> Finalizar Registro</>}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            <style jsx global>{`
                .custom-scrollbar::-webkit-scrollbar {
                    width: 6px;
                }
                .custom-scrollbar::-webkit-scrollbar-track {
                    background: transparent;
                }
                .custom-scrollbar::-webkit-scrollbar-thumb {
                    background: rgba(0, 0, 0, 0.1);
                    border-radius: 10px;
                }
                .custom-scrollbar::-webkit-scrollbar-thumb:hover {
                    background: rgba(0, 0, 0, 0.2);
                }
            `}</style>
        </div>
    )
}
