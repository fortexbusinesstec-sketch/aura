import { notFound } from 'next/navigation'
import Link from 'next/link'
import { getProductProjectByIdAction, getProductDocumentationAction } from '../actions'
import { PageHeader } from '@/components/ui/PageHeader'
import { Card } from '@/components/ui/Card'
import {
    ArrowLeft, ExternalLink, GitFork, Star, AlertCircle,
    GitCommit, Layout, Code2, Database, Server, Package,
    Clock, Calendar, Layers, GitBranch, History, FileText
} from 'lucide-react'
import { ProductStatus } from '@/types'
import { ProductDocsSection } from '../components/ProductDocsSection'

const STATUS_CONFIG: Record<ProductStatus, { label: string; color: string; bg: string }> = {
    planning: { label: 'Planeación', color: 'text-sky-500', bg: 'bg-sky-500/10 border-sky-500/30' },
    development: { label: 'Desarrollo', color: 'text-amber-500', bg: 'bg-amber-500/10 border-amber-500/30' },
    staging: { label: 'Staging / QA', color: 'text-violet-500', bg: 'bg-violet-500/10 border-violet-500/30' },
    production: { label: 'Producción', color: 'text-emerald-500', bg: 'bg-emerald-500/10 border-emerald-500/30' },
}

interface Props {
    params: Promise<{ id: string }>
}

export default async function ProductDetailPage({ params }: Props) {
    const { id } = await params
    const project = await getProductProjectByIdAction(id)

    if (!project) notFound()

    const docs = await getProductDocumentationAction(id)
    const status = STATUS_CONFIG[project.status] ?? STATUS_CONFIG.planning
    const hasGithub = Boolean(project.github_repo_url)
    const langs = project.github_metadata?.languages ?? {}
    const totalBytes = Object.values(langs).reduce((a, b) => a + b, 0)

    return (
        <div className="space-y-8 animate-in fade-in duration-700">

            {/* HEADER */}
            <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
                <div className="space-y-4">
                    <PageHeader
                        title={project.name}
                        subtitle="Detalles del Activo Digital"
                    />
                    <span className={`inline-flex items-center px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-widest border ${status.bg} ${status.color}`}>
                        {status.label}
                    </span>
                </div>

                {/* CTA GITHUB */}
                {hasGithub && (
                    <a
                        href={project.github_repo_url!}
                        target="_blank"
                        rel="noreferrer"
                        className="flex-shrink-0 inline-flex items-center gap-2.5 px-6 py-3.5 rounded-2xl bg-foreground text-background text-[10px] font-black uppercase tracking-[0.15em] hover:scale-105 active:scale-95 transition-all shadow-lg"
                    >
                        <GitBranch size={16} />
                        Abrir en GitHub
                        <ExternalLink size={12} className="opacity-60" />
                    </a>
                )}
            </div>

            {/* DESCRIPTION CARD */}
            <Card className="p-8 border-border/40 bg-card/30 backdrop-blur-sm relative overflow-hidden group">
                <div className="absolute top-0 right-0 w-64 h-64 bg-primary/5 blur-3xl rounded-full translate-x-32 -translate-y-32" />
                <div className="relative z-10 space-y-4">
                    <div className="flex items-center gap-2 text-black">
                        <FileText size={18} />
                        <h3 className="text-[10px] font-black uppercase tracking-widest">Propósito del Negocio</h3>
                    </div>
                    <p className="text-base font-bold text-black leading-relaxed max-w-4xl opacity-90">
                        {project.description || 'Sin descripción registrada para este producto.'}
                    </p>
                </div>
            </Card>

            {/* STATS RÁPIDOS DE GITHUB */}
            {hasGithub && (
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                    {[
                        { icon: Star, label: 'Stars', value: project.github_metadata?.stars ?? 0 },
                        { icon: GitFork, label: 'Forks', value: project.github_metadata?.forks ?? 0 },
                        { icon: AlertCircle, label: 'Open Issues', value: project.github_metadata?.open_issues ?? 0 },
                        { icon: Clock, label: 'Last Sync', value: project.last_github_sync ? new Date(project.last_github_sync).toLocaleDateString('es-PE') : 'Never' },
                    ].map(({ icon: Icon, label, value }) => (
                        <Card key={label} className="p-5 border-border/40 bg-card/50 flex flex-col gap-2">
                            <div className="flex items-center gap-2 text-muted-foreground">
                                <Icon size={14} />
                                <span className="text-[9px] font-black uppercase tracking-widest">{label}</span>
                            </div>
                            <span className="text-xl font-black tracking-tighter text-foreground">{value}</span>
                        </Card>
                    ))}
                </div>
            )}

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

                {/* COLUMNA PRINCIPAL */}
                <div className="lg:col-span-2 space-y-8">

                    {/* DOCUMENTACIÓN SECTION */}
                    <ProductDocsSection productId={id} docs={docs} />

                    {/* LAST COMMIT */}
                    {project.github_metadata?.last_commit_msg && (
                        <Card className="p-8 border-border/40 bg-card/50">
                            <div className="flex items-center gap-2 mb-4 text-muted-foreground">
                                <GitCommit size={14} />
                                <span className="text-[9px] font-black uppercase tracking-widest">Último Commit en Master</span>
                            </div>
                            <p className="text-sm font-bold text-foreground font-mono leading-relaxed bg-background/30 p-4 rounded-xl border border-border/20">
                                {project.github_metadata.last_commit_msg}
                            </p>
                        </Card>
                    )}
                </div>

                {/* COLUMNA LATERAL */}
                <div className="space-y-6">

                    {/* ARQUITECTURA TÉCNICA */}
                    <Card className="p-6 border-border/40 bg-card/50 space-y-5">
                        <div className="flex items-center gap-2 text-sky-500">
                            <Layers size={16} />
                            <h3 className="text-[10px] font-black uppercase tracking-widest text-foreground/70">Arquitectura Técnica</h3>
                        </div>
                        <div className="space-y-3">
                            {[
                                { icon: Layout, label: 'Frontend', value: project.tech_stack?.frontend },
                                { icon: Code2, label: 'Backend', value: project.tech_stack?.backend },
                                { icon: Database, label: 'Base de Datos', value: project.tech_stack?.db },
                                { icon: Server, label: 'Infraestructura', value: project.tech_stack?.infrastructure },
                            ].map(({ icon: Icon, label, value }) => value ? (
                                <div key={label} className="flex items-start gap-3 p-4 rounded-2xl bg-background/50 border border-border/30">
                                    <Icon size={14} className="text-sky-500 mt-0.5 flex-shrink-0" />
                                    <div>
                                        <p className="text-[8px] font-black uppercase tracking-widest text-muted-foreground mb-1">{label}</p>
                                        <p className="text-xs font-bold text-foreground">{value}</p>
                                    </div>
                                </div>
                            ) : null)}
                        </div>
                        {project.tech_stack?.other && project.tech_stack.other.length > 0 && (
                            <div className="flex flex-wrap gap-2 pt-2">
                                {project.tech_stack.other.map((tech) => (
                                    <span key={tech} className="px-2 py-1 rounded-lg bg-background border border-border/40 text-[9px] font-bold text-muted-foreground uppercase">
                                        {tech}
                                    </span>
                                ))}
                            </div>
                        )}
                    </Card>

                    {/* LENGUAJES DEL REPO */}
                    {totalBytes > 0 && (
                        <Card className="p-6 border-border/40 bg-card/50 space-y-4">
                            <div className="flex items-center gap-2">
                                <Code2 size={14} className="text-violet-500" />
                                <h3 className="text-[10px] font-black uppercase tracking-widest text-foreground/70">Lenguajes</h3>
                            </div>
                            <div className="flex h-2 rounded-full overflow-hidden gap-0.5">
                                {Object.entries(langs).map(([lang, bytes]) => (
                                    <div
                                        key={lang}
                                        style={{ width: `${(bytes / totalBytes) * 100}%` }}
                                        className="h-full bg-primary first:rounded-l-full last:rounded-r-full opacity-80"
                                        title={`${lang}: ${((bytes / totalBytes) * 100).toFixed(1)}%`}
                                    />
                                ))}
                            </div>
                            <div className="flex flex-wrap gap-3">
                                {Object.entries(langs).map(([lang, bytes]) => (
                                    <div key={lang} className="flex items-center gap-1.5">
                                        <div className="w-2 h-2 rounded-full bg-primary/80" />
                                        <span className="text-[9px] font-bold text-muted-foreground uppercase">{lang}</span>
                                        <span className="text-[9px] font-black text-foreground">{((bytes / totalBytes) * 100).toFixed(1)}%</span>
                                    </div>
                                ))}
                            </div>
                        </Card>
                    )}

                    {/* METADATA DEL REPO */}
                    <Card className="p-6 border-border/40 bg-card/50 space-y-4">
                        <div className="flex items-center gap-2">
                            <GitBranch size={14} className="text-muted-foreground" />
                            <h3 className="text-[10px] font-black uppercase tracking-widest text-foreground/70">Source Control</h3>
                        </div>
                        <div className="space-y-3">
                            {project.github_owner && (
                                <div>
                                    <p className="text-[8px] font-black uppercase tracking-widest text-muted-foreground mb-0.5">Owner</p>
                                    <p className="text-xs font-bold text-foreground font-mono truncate">{project.github_owner}</p>
                                </div>
                            )}
                            {project.github_repo_name && (
                                <div>
                                    <p className="text-[8px] font-black uppercase tracking-widest text-muted-foreground mb-0.5">Repositorio</p>
                                    <p className="text-xs font-bold text-foreground font-mono truncate">{project.github_repo_name}</p>
                                </div>
                            )}
                        </div>
                        {hasGithub && (
                            <a
                                href={project.github_repo_url!}
                                target="_blank"
                                rel="noreferrer"
                                className="w-full flex items-center justify-center gap-2 py-3 rounded-xl bg-foreground/5 border border-border/40 text-[9px] font-black uppercase tracking-widest text-muted-foreground hover:text-foreground hover:border-foreground/20 transition-all"
                            >
                                <ExternalLink size={12} /> Ver Repo
                            </a>
                        )}
                    </Card>

                    {/* TIMESTAMPS */}
                    <Card className="p-6 border-border/40 bg-card/50 space-y-4">
                        <div className="flex items-center gap-2">
                            <Calendar size={14} className="text-muted-foreground" />
                            <h3 className="text-[10px] font-black uppercase tracking-widest text-foreground/70">Trazabilidad</h3>
                        </div>
                        <div className="space-y-3">
                            <div>
                                <p className="text-[8px] font-black uppercase tracking-widest text-muted-foreground mb-0.5">Creado</p>
                                <p className="text-xs font-bold text-foreground text-[11px]">
                                    {new Date(project.created_at).toLocaleDateString('es-PE', { day: '2-digit', month: 'long', year: 'numeric' })}
                                </p>
                            </div>
                            <div>
                                <p className="text-[8px] font-black uppercase tracking-widest text-muted-foreground mb-0.5">Última Modificación</p>
                                <p className="text-xs font-bold text-foreground text-[11px]">
                                    {new Date(project.updated_at).toLocaleDateString('es-PE', { day: '2-digit', month: 'long', year: 'numeric' })}
                                </p>
                            </div>
                        </div>
                    </Card>
                </div>
            </div>
        </div>
    )
}
