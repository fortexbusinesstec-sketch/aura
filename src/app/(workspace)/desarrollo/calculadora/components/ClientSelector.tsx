'use client'

import React, { useState, useMemo } from 'react'
import { usePitchStore } from '@/store/usePitchStore'
import { Search, User, Check, Building2, X } from 'lucide-react'

export function ClientSelector() {
    const { clients, setClient, currentOpportunity } = usePitchStore()
    const [search, setSearch] = useState('')
    const [isOpen, setIsOpen] = useState(false)

    const filteredClients = useMemo(() => {
        if (!search) return clients.slice(0, 5)
        return clients.filter(c =>
            c.razon_social.toLowerCase().includes(search.toLowerCase()) ||
            c.ruc.includes(search)
        ).slice(0, 8)
    }, [clients, search])

    const selectedClient = currentOpportunity.client

    return (
        <div className="relative group max-w-md">
            <label className="text-[11px] font-black uppercase text-foreground/60 tracking-[0.2em] ml-1 mb-3 block">
                Socio Estratégico <span className="text-sky-950/60">(Cliente)</span>
            </label>

            <div className={`relative flex items-center transition-all duration-300 rounded-2xl border ${isOpen ? 'bg-card border-primary/50 ring-4 ring-primary/5' : 'bg-card/40 border-border hover:border-primary/30'
                }`}>
                <div className="pl-4 flex items-center gap-3">
                    {selectedClient ? <Building2 size={16} className="text-foreground/60" /> : <Search size={16} className="text-foreground/40" />}
                </div>
                <input
                    value={selectedClient ? selectedClient.razon_social : search}
                    onChange={(e) => {
                        setSearch(e.target.value)
                        if (selectedClient) setClient(null)
                    }}
                    onFocus={() => setIsOpen(true)}
                    readOnly={!!selectedClient}
                    placeholder="Buscar empresa por razón social o RUC..."
                    className="w-full bg-transparent pl-2 pr-4 py-4 text-xs text-foreground outline-none font-black placeholder:text-foreground/20 uppercase tracking-tight"
                />
                {selectedClient && (
                    <button
                        onClick={(e) => {
                            e.stopPropagation();
                            setClient(null);
                            setSearch('');
                        }}
                        className="mr-3 p-1.5 rounded-lg hover:bg-black/5 text-foreground/40 hover:text-foreground transition-colors"
                    >
                        <X size={14} />
                    </button>
                )}
            </div>

            {isOpen && (
                <>
                    <div className="fixed inset-0 z-[60]" onClick={() => setIsOpen(false)} />
                    <div className="absolute top-full left-0 mt-2 w-full bg-card border border-border rounded-2xl shadow-2xl z-[70] overflow-hidden animate-in fade-in zoom-in-95 duration-200 origin-top ring-1 ring-black/5 backdrop-blur-3xl">
                        <div className="p-1.5 space-y-0.5">
                            {filteredClients.length > 0 ? (
                                filteredClients.map((client) => (
                                    <button
                                        key={client.id}
                                        onClick={() => {
                                            setClient(client)
                                            setIsOpen(false)
                                            setSearch('')
                                        }}
                                        className={`w-full flex flex-col gap-1 px-5 py-4 transition-all text-left group border-b border-border/50 last:border-0 ${selectedClient?.id === client.id ? 'bg-primary/15' : 'hover:bg-primary/10'
                                            }`}
                                    >
                                        <div className="flex items-center justify-between">
                                            <span className="text-sm font-black text-foreground tracking-tight transition-colors uppercase">
                                                {client.razon_social}
                                            </span>
                                            {selectedClient?.id === client.id && <Check size={14} className="text-sky-950" />}
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <span className="text-[10px] font-bold text-foreground/40 uppercase tracking-widest">RUC:</span>
                                            <span className="text-[10px] font-black text-foreground/60 tabular-nums">{client.ruc}</span>
                                        </div>
                                    </button>
                                ))
                            ) : (
                                <div className="px-5 py-10 text-center text-muted-foreground/60">
                                    <p className="text-[10px] font-black uppercase tracking-[0.2em]">Sin coincidencias en el Core</p>
                                </div>
                            )}
                        </div>
                    </div>
                </>
            )}
        </div>
    )
}
