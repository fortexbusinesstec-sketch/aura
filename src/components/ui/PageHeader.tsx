'use client'

import React from 'react'
import { BackButton } from './BackButton'

interface PageHeaderProps {
    title: string
    subtitle: string
    action?: React.ReactNode
    showBack?: boolean
    backUrl?: string
}

export function PageHeader({ title, subtitle, action, showBack = true, backUrl }: PageHeaderProps) {
    return (
        <div className="space-y-8 mb-12">
            {showBack && <BackButton href={backUrl} />}

            <div className="flex items-center justify-between">
                <div className="flex items-center gap-5">
                    {/* Vertical Blue Indicator */}
                    <div className="w-1.5 h-14 bg-primary rounded-full shadow-[0_0_20px_rgba(255,232,190,0.5)]" />

                    <div className="space-y-1">
                        <h1 className="text-5xl font-black text-foreground italic uppercase tracking-tighter leading-none">
                            {title}
                        </h1>
                        <p className="text-[11px] font-bold text-muted-foreground uppercase tracking-[0.1em] pl-1">
                            {subtitle}
                        </p>
                    </div>
                </div>

                {action && (
                    <div className="animate-in fade-in slide-in-from-right-4 duration-500">
                        {action}
                    </div>
                )}
            </div>
        </div>
    )
}
