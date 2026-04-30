'use client'

import { useRouter } from 'next/navigation'
import { ArrowLeft } from 'lucide-react'
import Link from 'next/link'

interface BackButtonProps {
    href?: string
}

export function BackButton({ href }: BackButtonProps) {
    const router = useRouter()

    const content = (
        <div className="group flex items-center gap-2 text-sm font-medium text-foreground/80 transition-colors hover:text-foreground">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg border border-border bg-card transition-all group-hover:border-primary/60 group-hover:bg-secondary">
                <ArrowLeft size={16} />
            </div>
            <span>Volver</span>
        </div>
    )

    if (href) {
        return <Link href={href}>{content}</Link>
    }

    return (
        <button
            onClick={() => {
                if (typeof window !== 'undefined' && router) {
                    try {
                        router.back()
                    } catch (e) {
                        console.error('Navigation error:', e)
                        window.history.back()
                    }
                }
            }}
        >
            {content}
        </button>
    )
}
