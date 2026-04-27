import React from 'react'

interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
    children: React.ReactNode
    className?: string
}

export function Card({ children, className = '', ...props }: CardProps) {
    return (
        <div
            className={`rounded-3xl border border-border/50 bg-card shadow-sm ${className}`}
            {...props}
        >
            {children}
        </div>
    )
}
