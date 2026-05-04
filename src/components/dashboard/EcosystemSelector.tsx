'use client'

import { useRouter, usePathname } from 'next/navigation'
import { ChevronDown, Terminal, FlaskConical, LineChart, Package, Settings } from 'lucide-react'
import { useState, useMemo } from 'react'

const ecosystems = [
    { id: 'desarrollo', label: 'Developer', icon: Terminal, href: '/desarrollo' },
    { id: 'laboratorio', label: 'Laboratory', icon: FlaskConical, href: '/laboratorio' },
    { id: 'finanzas', label: 'Finance', icon: LineChart, href: '/finanzas' },
    { id: 'producto', label: 'Product', icon: Package, href: '/producto' },
]

const settingsItem = { id: 'configuracion', label: 'Configuración', icon: Settings, href: '/configuracion' }

const allItems = [...ecosystems, settingsItem]

export function EcosystemSelector() {
    const router = useRouter()
    const pathname = usePathname()
    const [isOpen, setIsOpen] = useState(false)

    const currentItem = useMemo(() => {
        return allItems.find(e => pathname.startsWith(e.href)) || ecosystems[0]
    }, [pathname])

    const Icon = currentItem.icon

    return (
        <div className="relative">
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="flex items-center gap-3 rounded-xl border border-border bg-card px-4 py-2 text-sm font-medium text-foreground transition-all hover:border-primary/50 hover:bg-secondary"
            >
                <Icon size={18} className="text-foreground/70" />
                <span>{currentItem.label}</span>
                <ChevronDown size={14} className={`transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`} />
            </button>

            {isOpen && (
                <>
                    <div className="fixed inset-0 z-10" onClick={() => setIsOpen(false)} />
                    <div className="absolute left-0 mt-2 z-20 w-56 transform overflow-hidden rounded-xl border border-border/50 bg-background p-1 shadow-2xl animate-in fade-in slide-in-from-top-2">
                        {/* Entornos */}
                        {ecosystems.map((eco) => {
                            const EcoIcon = eco.icon
                            return (
                                <button
                                    key={eco.id}
                                    onClick={() => {
                                        router.push(eco.href)
                                        setIsOpen(false)
                                    }}
                                    className={`flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm transition-colors ${pathname.startsWith(eco.href)
                                        ? 'bg-primary/40 text-primary-foreground font-bold'
                                        : 'text-foreground hover:bg-secondary'
                                        }`}
                                >
                                    <EcoIcon size={16} />
                                    <span>{eco.label}</span>
                                </button>
                            )
                        })}

                        {/* Divisor */}
                        <div className="my-1 h-px bg-border/60" />

                        {/* Configuración */}
                        <button
                            onClick={() => {
                                router.push(settingsItem.href)
                                setIsOpen(false)
                            }}
                            className={`flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm transition-colors ${pathname.startsWith(settingsItem.href)
                                ? 'bg-primary/40 text-primary-foreground font-bold'
                                : 'text-foreground hover:bg-secondary'
                                }`}
                        >
                            <Settings size={16} />
                            <span>{settingsItem.label}</span>
                        </button>
                    </div>
                </>
            )}
        </div>
    )
}
