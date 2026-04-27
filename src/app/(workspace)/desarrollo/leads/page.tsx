'use client'

import { useState, useEffect, useMemo } from 'react'
import { PageHeader } from '@/components/ui/PageHeader'
import { createClient } from '@/utils/supabase/client'
import { Opportunity } from '@/types'
import { useRouter } from 'next/navigation'
import { FileText, Rocket, User, Layout, Activity, ChevronRight, Loader2, Search, X } from 'lucide-react'

export default function LeadsPage() {
    const [opportunities, setOpportunities] = useState<Opportunity[]>([])
    const [isLoading, setIsLoading] = useState(true)
    const [searchTerm, setSearchTerm] = useState('')
    const router = useRouter()

    const supabase = createClient()

    const fetchLeads = async () => {
        setIsLoading(true)
        const { data, error } = await supabase
            .from('opportunities')
            .select('*, client:clients(*)')
            .eq('status', 'discovery')
            .order('created_at', { ascending: false })

        if (data) setOpportunities(data)
        setIsLoading(false)
    }

    useEffect(() => {
        fetchLeads()
    }, [])

    const filteredOpportunities = useMemo(() => {
        return opportunities.filter(op =>
            op.client?.razon_social.toLowerCase().includes(searchTerm.toLowerCase()) ||
            op.client?.ruc?.includes(searchTerm)
        )
    }, [opportunities, searchTerm])

    const handleManage = (op: Opportunity) => {
        router.push(`/desarrollo/leads/${op.id}`)
    }

    return (
        <div className="space-y-8 animate-in fade-in duration-700">
            <PageHeader
                title="Gestión de Leads"
                subtitle="Administración de oportunidades y despliegue estratégico"
                action={
                    <div className="relative group">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground group-focus-within:text-primary transition-colors" size={16} />
                        <input
                            type="text"
                            placeholder="Filtrar por cliente o RUC..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="bg-card border border-border rounded-2xl pl-10 pr-10 py-3 text-xs font-bold outline-none focus:ring-4 focus:ring-primary/10 focus:border-primary/50 transition-all w-64 uppercase tracking-tighter"
                        />
                        {searchTerm && (
                            <button
                                onClick={() => setSearchTerm('')}
                                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                            >
                                <X size={14} />
                            </button>
                        )}
                    </div>
                }
            />

            {isLoading ? (
                <div className="flex flex-col items-center justify-center py-24 space-y-4">
                    <Loader2 className="w-10 h-10 text-primary animate-spin" />
                    <p className="text-xs font-bold uppercase tracking-widest text-muted-foreground">Sincronizando con el Ecosistema...</p>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {filteredOpportunities.length > 0 ? (
                        filteredOpportunities.map((op) => (
                            <div
                                key={op.id}
                                className="group relative bg-card border border-border rounded-3xl p-6 transition-all hover:border-primary/50 hover:shadow-2xl hover:shadow-primary/5 cursor-default overflow-hidden"
                            >
                                {/* Decorative Gradient */}
                                <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 rounded-full -mr-16 -mt-16 blur-3xl group-hover:bg-primary/10 transition-colors" />

                                <div className="space-y-6 relative z-10">
                                    {/* Client Header */}
                                    <div className="flex items-start justify-between">
                                        <div className="flex items-center gap-3">
                                            <div className="w-10 h-10 rounded-2xl bg-primary/10 flex items-center justify-center text-primary">
                                                <User size={20} />
                                            </div>
                                            <div>
                                                <h3 className="text-sm font-black text-foreground uppercase tracking-tight line-clamp-1">
                                                    {op.client?.razon_social || 'Socio Estratégico'}
                                                </h3>
                                                <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">
                                                    RUC: {op.client?.ruc || '-'}
                                                </p>
                                            </div>
                                        </div>
                                        <div className="px-2 py-1 rounded-lg bg-secondary/50 text-[9px] font-black uppercase text-secondary-foreground border border-border">
                                            {op.status}
                                        </div>
                                    </div>

                                    {/* Info Grid */}
                                    <div className="grid grid-cols-2 gap-4 pt-4 border-t border-border/50">
                                        <div className="space-y-1">
                                            <div className="flex items-center gap-1.5 text-[9px] font-black text-muted-foreground uppercase tracking-tighter">
                                                <Layout size={10} /> Dimensión
                                            </div>
                                            <p className="text-xs font-bold text-foreground capitalize italic">
                                                {op.dimension || 'Sin Definir'}
                                            </p>
                                        </div>
                                        <div className="space-y-1 text-right">
                                            <div className="flex items-center justify-end gap-1.5 text-[9px] font-black text-muted-foreground uppercase tracking-tighter">
                                                <Activity size={10} /> Ticket
                                            </div>
                                            <div className="mt-1 flex justify-end">
                                                <p className="px-3 py-1 rounded-lg bg-slate-900 text-[11px] font-black text-primary italic shadow-lg shadow-slate-900/20">
                                                    S/ {op.draft_jsonb?.totalCalculated?.toLocaleString() || '0.00'}
                                                </p>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Action Button */}
                                    <button
                                        onClick={() => handleManage(op)}
                                        className="w-full mt-4 group/btn relative flex items-center justify-between px-5 py-3.5 bg-secondary hover:bg-primary transition-all rounded-2xl border border-border active:scale-95"
                                    >
                                        <span className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-foreground group-hover/btn:text-sky-950">
                                            <Rocket size={14} className="group-hover/btn:animate-bounce" />
                                            Gestionar Despliegue
                                        </span>
                                        <ChevronRight size={14} className="text-muted-foreground group-hover/btn:text-sky-950" />
                                    </button>
                                </div>
                            </div>
                        ))
                    ) : (
                        <div className="col-span-full py-24 text-center border-2 border-dashed border-border rounded-3xl space-y-4">
                            <FileText className="w-12 h-12 text-muted-foreground/30 mx-auto" />
                            <p className="text-xs font-black uppercase tracking-[0.3em] text-muted-foreground/50">
                                {searchTerm ? 'No hay coincidencias para tu búsqueda' : 'No se encontraron leads en fase de descubrimiento'}
                            </p>
                        </div>
                    )}
                </div>
            )}

        </div>
    )
}
