'use client'

import { useState } from 'react'
import Link from 'next/link'
import { Users, Database, Calculator, Box, Settings, Cpu, FileText, GitBranch, Search, Briefcase } from 'lucide-react'

const spaces = [
    {
        title: 'DevProjects',
        icon: Box,
        blocks: [
            {
                title: 'Gestión de Clientes',
                description: 'CRM para administración de prospectos y socios.',
                href: '/desarrollo/clientes',
                icon: Users,
                color: '#2f65ca',
            },
            {
                title: 'Gestión de Leads',
                description: 'Administración de oportunidades y despliegue del portal.',
                href: '/desarrollo/leads',
                icon: FileText,
                color: '#10b981',
            },
            {
                title: 'Gestión de Proyectos',
                description: 'Seguimiento de hitos, tareas y cronogramas de ejecución.',
                href: '/desarrollo/proyectos',
                icon: Briefcase,
                color: '#3b82f6',
            },
        ],
    },
    {
        title: 'DevMaster',
        icon: Settings,
        blocks: [
            {
                title: 'Catálogo de Servicios',
                description: 'Parámetros maestros y gestión de precios core.',
                href: '/desarrollo/master',
                icon: Database,
                color: '#7a60b8',
            },
            {
                title: 'Fases del Proyecto',
                description: 'Plantillas de fases para proyectos de Desarrollo y Productos SaaS.',
                href: '/desarrollo/master/fases',
                icon: GitBranch,
                color: '#059669',
            },
        ],
    },
    {
        title: 'DevTools',
        icon: Cpu,
        blocks: [
            {
                title: 'Calculadora de Precios',
                description: 'Simulador de cotizaciones y márgenes operativos.',
                href: '/desarrollo/calculadora',
                icon: Calculator,
                color: '#b05a10',
            },
        ],
    },
]

export default function DesarrolloPage() {
    const [searchTerms, setSearchTerms] = useState<Record<string, string>>({})

    const handleSearchChange = (title: string, value: string) => {
        setSearchTerms(prev => ({ ...prev, [title]: value }))
    }

    return (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 items-start">
            {spaces.map((space) => {
                const searchTerm = searchTerms[space.title] || ''
                const filteredBlocks = space.blocks.filter(block => 
                    block.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                    block.description.toLowerCase().includes(searchTerm.toLowerCase())
                )

                return (
                    <section key={space.title} className="flex flex-col gap-6">
                        {/* Header de sección */}
                        <div className="flex items-center justify-between border-l-2 border-primary pl-4">
                            <div className="flex items-center gap-3">
                                <space.icon size={18} className="text-muted-foreground" />
                                <h2 className="text-xs font-bold uppercase tracking-[0.2em] text-muted-foreground">
                                    {space.title}
                                </h2>
                            </div>
                            <span className="text-[10px] font-medium px-2 py-0.5 rounded-full bg-primary/10 text-primary">
                                {filteredBlocks.length}
                            </span>
                        </div>

                        {/* Buscador por columna */}
                        <div className="relative group">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground group-focus-within:text-primary transition-colors" size={14} />
                            <input
                                type="text"
                                placeholder={`Buscar en ${space.title}...`}
                                value={searchTerm}
                                onChange={(e) => handleSearchChange(space.title, e.target.value)}
                                className="w-full bg-card border border-border rounded-xl py-2 pl-9 pr-4 text-xs focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all placeholder:text-muted-foreground/50"
                            />
                        </div>

                        {/* Lista de bloques en la columna */}
                        <div className="flex flex-col gap-4">
                            {filteredBlocks.map((block) => {
                                const Icon = block.icon
                                return (
                                    <Link
                                        key={block.title}
                                        href={block.href}
                                        className="group relative overflow-hidden rounded-2xl border border-border bg-card p-4 transition-all hover:border-primary/60 hover:shadow-[0_0_25px_hsl(var(--primary)/0.4)] active:scale-[0.98]"
                                    >
                                        <div className="flex items-start gap-3">
                                            <div
                                                className="rounded-xl p-2.5 transition-colors flex-shrink-0"
                                                style={{ backgroundColor: `${block.color}18`, color: block.color }}
                                            >
                                                <Icon size={20} />
                                            </div>
                                            <div className="min-w-0">
                                                <h3 className="font-bold text-sm text-foreground transition-colors truncate">
                                                    {block.title}
                                                </h3>
                                                <p className="mt-0.5 text-[11px] leading-relaxed text-muted-foreground line-clamp-2">
                                                    {block.description}
                                                </p>
                                            </div>
                                        </div>
                                    </Link>
                                )
                            })}
                            {filteredBlocks.length === 0 && (
                                <div className="text-center py-8 px-4 rounded-2xl border border-dashed border-border bg-muted/5">
                                    <p className="text-[10px] text-muted-foreground italic">No se encontraron resultados</p>
                                </div>
                            )}
                        </div>
                    </section>
                )
            })}
        </div>
    )
}
