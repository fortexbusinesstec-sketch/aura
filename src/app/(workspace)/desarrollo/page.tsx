import Link from 'next/link'
import { Users, Database, Calculator, Box, Settings, Cpu, FileText } from 'lucide-react'

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
                color: '#10b981', // Esmeralda/Verde para leads
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
                color: '#7a60b8',   // Púrpura medio legible
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
    return (
        <div className="space-y-12">
            {spaces.map((space) => (
                <section key={space.title} className="space-y-6">
                    {/* Header de sección — usa muted-foreground para contraste legible */}
                    <div className="flex items-center gap-3 border-l-2 border-primary pl-4">
                        <space.icon size={20} className="text-muted-foreground" />
                        <h2 className="text-sm font-bold uppercase tracking-[0.2em] text-muted-foreground">{space.title}</h2>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                        {space.blocks.map((block) => {
                            const Icon = block.icon
                            return (
                                <Link
                                    key={block.title}
                                    href={block.href}
                                    /* bg-card sólido (sin opacidad) para contraste limpio sobre fondo crema */
                                    className="group relative overflow-hidden rounded-2xl border border-border bg-card p-6 transition-all hover:border-primary/50 hover:shadow-md"
                                >
                                    <div className="flex items-start gap-4">
                                        <div
                                            className="rounded-xl p-3 transition-colors flex-shrink-0"
                                            style={{ backgroundColor: `${block.color}18`, color: block.color }}
                                        >
                                            <Icon size={24} />
                                        </div>
                                        <div>
                                            {/* Título: foreground oscuro, hover va a un tono más oscuro del primary-foreground */}
                                            <h3 className="font-bold text-foreground group-hover:text-primary-foreground transition-colors">{block.title}</h3>
                                            <p className="mt-1 text-xs leading-relaxed text-muted-foreground">{block.description}</p>
                                        </div>
                                    </div>
                                </Link>
                            )
                        })}
                    </div>
                </section>
            ))}
        </div>
    )
}
