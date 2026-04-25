'use client'

import React, { useState, useRef, useEffect } from 'react'
import { ChevronDown, Check } from 'lucide-react'

interface Option {
    label: string
    value: string
}

interface GroupedOption {
    group: string
    options: Option[]
}

interface FtxSelectProps {
    options?: Option[]
    groups?: GroupedOption[]
    value: string
    onChange: (value: string) => void
    placeholder?: string
    icon?: React.ReactNode
    label?: string
    name?: string
}

export function FtxSelect({ options = [], groups, value, onChange, placeholder = 'Seleccionar...', icon, label, name }: FtxSelectProps) {
    const [isOpen, setIsOpen] = useState(false)
    const containerRef = useRef<HTMLDivElement>(null)

    const allOptions = groups ? groups.flatMap(g => g.options) : options
    const selectedOption = allOptions.find(opt => opt.value === value)

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
                setIsOpen(false)
            }
        }
        document.addEventListener('mousedown', handleClickOutside)
        return () => document.removeEventListener('mousedown', handleClickOutside)
    }, [])

    const renderOption = (option: Option) => (
        <button
            key={option.value}
            type="button"
            onClick={() => {
                onChange(option.value)
                setIsOpen(false)
            }}
            className={`w-full flex items-center justify-between px-4 py-3 rounded-xl text-sm font-bold transition-all text-left group ${value === option.value
                ? 'bg-primary/20 text-primary-foreground'
                : 'hover:bg-accent text-foreground'
                }`}
        >
            {option.label}
            {value === option.value && <Check size={16} className="text-primary-foreground" />}
        </button>
    )

    return (
        <div className="space-y-2.5 w-full" ref={containerRef}>
            {label && (
                <label className="text-[11px] font-black uppercase text-foreground/60 tracking-[0.2em] ml-1">
                    {label}
                </label>
            )}
            <div className="relative">
                {/* Hidden input for form data */}
                <input type="hidden" name={name} value={value} required />

                <button
                    type="button"
                    onClick={() => setIsOpen(!isOpen)}
                    className={`w-full flex items-center justify-between rounded-2xl border bg-card pl-4 pr-5 py-4 text-sm text-foreground outline-none transition-all font-bold ${isOpen
                        ? 'border-primary/60 ring-4 ring-primary/10'
                        : 'border-border'
                        }`}
                >
                    <div className="flex items-center gap-3">
                        {icon && <span className={isOpen ? 'text-primary' : 'text-foreground/40'}>{icon}</span>}
                        <span className={!selectedOption ? 'text-foreground/40 font-medium' : ''}>
                            {selectedOption ? selectedOption.label : placeholder}
                        </span>
                    </div>
                    <ChevronDown size={18} className={`text-foreground/40 transition-transform duration-300 ${isOpen ? 'rotate-180 text-foreground' : ''}`} />
                </button>

                {isOpen && (
                    <div className="absolute top-full left-0 mt-2 w-full bg-card border border-border rounded-2xl shadow-lg z-[110] overflow-hidden animate-in fade-in zoom-in-95 duration-200 origin-top">
                        <div className="max-h-80 overflow-auto p-2">
                            {groups ? groups.map((group, groupIdx) => (
                                <div key={groupIdx} className="space-y-1 mb-4 last:mb-0">
                                    <div className="px-4 py-2">
                                        <span className="text-[10px] font-black uppercase text-foreground/30 tracking-[0.2em]">{group.group}</span>
                                    </div>
                                    <div className="space-y-0.5">
                                        {group.options.map(option => renderOption(option))}
                                    </div>
                                </div>
                            )) : options.map((option) => renderOption(option))}
                        </div>
                    </div>
                )}
            </div>
        </div>
    )
}
