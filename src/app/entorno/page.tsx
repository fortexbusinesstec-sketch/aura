import Link from 'next/link'
import { Terminal, FlaskConical, LineChart, Box } from 'lucide-react'

const environments = [
    {
        title: 'Developer',
        description: 'Entorno de construcción y despliegue de sistemas.',
        icon: Terminal,
        href: '/desarrollo',
        color: '#ff9e64', // Naranja
        glowClass: 'hover:shadow-[0_0_30px_rgba(255,158,100,0.2)] hover:border-[#ff9e64]/30',
    },
    {
        title: 'Laboratory',
        description: 'Espacio de experimentación e investigación avanzada.',
        icon: FlaskConical,
        href: '/laboratorio',
        color: '#bb9af7', // Magenta
        glowClass: 'hover:shadow-[0_0_30px_rgba(187,154,247,0.2)] hover:border-[#bb9af7]/30',
    },
    {
        title: 'Finance',
        description: 'Control financiero y analítica de activos.',
        icon: LineChart,
        href: '/finanzas',
        color: '#7dcfff', // Cyan
        glowClass: 'hover:shadow-[0_0_30px_rgba(125,207,255,0.2)] hover:border-[#7dcfff]/30',
    },
    {
        title: 'Product',
        description: 'Gestión de ciclo de vida y diseño de productos.',
        icon: Box,
        href: '/producto',
        color: '#73daca', // Emerald
        glowClass: 'hover:shadow-[0_0_30px_rgba(115,218,202,0.2)] hover:border-[#73daca]/30',
    },
]

export default function EntornoPage() {
    return (
        <div className="flex min-h-screen items-center justify-center bg-background p-6 font-montserrat overflow-hidden relative">
            {/* Background ambient dots */}
            <div className="absolute inset-0 overflow-hidden pointer-events-none">
                <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] rounded-full bg-accent/5 blur-[120px]" />
                <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] rounded-full bg-secondary/5 blur-[120px]" />
            </div>

            <div className="z-10 w-full max-w-6xl">
                <div className="text-center mb-16">
                    <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight text-foreground mb-4">
                        Selecciona Tu Entorno
                    </h1>
                    <p className="text-foreground/50 text-lg uppercase tracking-widest font-medium">Sincronización de Conciencia Operativa</p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
                    {environments.map((env) => {
                        const Icon = env.icon
                        return (
                            <Link
                                key={env.title}
                                href={env.href}
                                className={`group relative flex flex-col items-center justify-center rounded-3xl border border-border/30 bg-background/40 p-10 transition-all duration-300 backdrop-blur-md hover:scale-105 ${env.glowClass}`}
                            >
                                <div
                                    className="mb-8 rounded-2xl p-6 transition-transform duration-300 group-hover:scale-110"
                                    style={{ backgroundColor: `${env.color}10`, color: env.color }}
                                >
                                    <Icon className="h-16 w-16" strokeWidth={1.5} />
                                </div>

                                <h2 className="text-2xl font-bold text-foreground mb-4 tracking-tight group-hover:text-foreground transition-colors">{env.title}</h2>
                                <p className="text-center text-sm text-foreground/60 leading-relaxed max-w-[200px] group-hover:text-foreground/80 transition-colors">
                                    {env.description}
                                </p>

                                {/* Subtle internal glow on hover */}
                                <div className="absolute inset-0 rounded-3xl bg-white/0 group-hover:bg-white/[0.02] transition-colors pointer-events-none" />
                            </Link>
                        )
                    })}
                </div>
            </div>
        </div>
    )
}
