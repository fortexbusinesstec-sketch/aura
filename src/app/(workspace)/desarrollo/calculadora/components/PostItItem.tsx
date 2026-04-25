'use client'

import React, { useState } from 'react'
import { ChevronDown } from 'lucide-react'

interface PostItItemProps {
    title: string
    icon: React.ReactNode
    children: React.ReactNode
    isOpen?: boolean
    onToggle?: (isOpen: boolean) => void
    badge?: string | number
}

export function PostItItem({ title, icon, children, isOpen: forcedIsOpen, onToggle, badge }: PostItItemProps) {
    const [localIsOpen, setLocalIsOpen] = useState(false)
    const isOpen = forcedIsOpen !== undefined ? forcedIsOpen : localIsOpen

    const handleToggle = () => {
        const next = !isOpen
        if (onToggle) onToggle(next)
        else setLocalIsOpen(next)
    }

    return (
        <div className="border-b border-border last:border-0 group/postit">
            <button
                onClick={handleToggle}
                className={`w-full flex items-center justify-between p-6 transition-all ${isOpen ? 'bg-accent/40' : 'hover:bg-accent/20'
                    }`}
            >
                <div className="flex items-center gap-4">
                    <div className={`p-2.5 rounded-xl transition-all duration-500 ${isOpen
                        ? 'bg-primary text-primary-foreground shadow-[0_0_20px_rgba(255,232,190,0.5)]'
                        : 'bg-muted text-muted-foreground group-hover/postit:text-foreground'
                        }`}>
                        {icon}
                    </div>
                    <div className="flex flex-col items-start">
                        <span className={`text-[11px] font-black uppercase tracking-[0.2em] transition-colors ${isOpen ? 'text-foreground' : 'text-muted-foreground group-hover/postit:text-foreground'
                            }`}>
                            {title}
                        </span>
                        {badge && (
                            <span className="text-[10px] font-black tabular-nums text-foreground/70">
                                {badge}
                            </span>
                        )}
                    </div>
                </div>
                <ChevronDown size={18} className={`text-muted-foreground transition-transform duration-500 ${isOpen ? 'rotate-180 text-foreground' : ''}`} />
            </button>

            {isOpen && (
                <div className="p-6 pt-0 animate-in fade-in slide-in-from-top-2 duration-300">
                    <div className="pt-4 border-t border-border">
                        {children}
                    </div>
                </div>
            )}
        </div>
    )
}
