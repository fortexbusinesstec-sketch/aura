'use client'

import { useRouter } from 'next/navigation'
import { ArrowLeft } from 'lucide-react'

export function BackButton() {
    const router = useRouter()

    return (
        <button
            onClick={() => router.back()}
            className="group flex items-center gap-2 text-sm font-medium text-foreground/80 transition-colors hover:text-foreground"
        >
            <div className="flex h-8 w-8 items-center justify-center rounded-lg border border-border bg-card transition-all group-hover:border-primary/60 group-hover:bg-secondary">
                <ArrowLeft size={16} />
            </div>
            <span>Volver</span>
        </button>
    )
}
