'use client'

import { X } from 'lucide-react'
import { useEffect, useRef } from 'react'

interface ModalProps {
    isOpen: boolean
    onClose: () => void
    title: string
    children: React.ReactNode
    maxWidth?: string
}

export function Modal({ isOpen, onClose, title, children, maxWidth = 'max-w-[500px]' }: ModalProps) {
    const dialogRef = useRef<HTMLDialogElement>(null)

    useEffect(() => {
        if (isOpen) {
            dialogRef.current?.showModal()
        } else {
            dialogRef.current?.close()
        }
    }, [isOpen])

    if (!isOpen) return null

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            {/* Backdrop con Blur Claro */}
            <div
                className="absolute inset-0 bg-background/20 backdrop-blur-sm animate-in fade-in duration-300"
                onClick={onClose}
            />

            <div className={`relative z-20 w-full ${maxWidth} transform overflow-hidden rounded-3xl border border-border/50 bg-card/80 backdrop-blur-xl shadow-2xl animate-in fade-in zoom-in duration-200 ring-1 ring-border/20`}>
                <div className="flex items-center justify-between border-b border-border/30 px-6 py-4">
                    <h3 className="text-lg font-black text-foreground tracking-tight underline decoration-primary/50 decoration-4 underline-offset-4">{title}</h3>
                    <button
                        onClick={onClose}
                        className="text-muted-foreground transition-colors hover:text-foreground hover:bg-secondary p-2 rounded-xl"
                    >
                        <X size={20} />
                    </button>
                </div>
                <div className="p-8">
                    {children}
                </div>
            </div>
        </div>
    )
}
