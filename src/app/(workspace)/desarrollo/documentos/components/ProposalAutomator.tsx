'use client'

import React, { useState, useEffect } from 'react'
import { usePitchStore } from '@/store/usePitchStore'
import { PDFViewer, pdf } from '@react-pdf/renderer'
import { createClient } from '@/utils/supabase/client'
import { Client, Opportunity, CatalogItem } from '@/types'
import { ExecutiveDocument } from './ExecutiveDocument'
import { Search, FileDown, CheckCircle2, Upload, Loader2, FileText, Copy, Sparkles, Monitor, Smartphone } from 'lucide-react'
import { OpportunityRepository } from '@/lib/repositories/OpportunityRepository'

export function ProposalAutomator() {
    const {
        currentOpportunity: selectedOpportunity,
        updateCurrentOpportunity,
        setCurrentOpportunity,
        isLoading: isStoreLoading
    } = usePitchStore()

    const [clients, setClients] = useState<Client[]>([])
    const [selectedClient, setSelectedClient] = useState<Client | null>(null)
    const [opportunities, setOpportunities] = useState<Opportunity[]>([])
    const [catalog, setCatalog] = useState<CatalogItem[]>([])

    const [isUpdating, setIsUpdating] = useState(false)
    const [searchTerm, setSearchTerm] = useState('')
    const [hasCopiedPrompt, setHasCopiedPrompt] = useState(false)

    const supabase = createClient()

    const handleJsonbChange = (field: string, subfield: string, value: any) => {
        const currentJsonb = (selectedOpportunity as any)[field] || {}
        updateCurrentOpportunity({
            [field]: { ...currentJsonb, [subfield]: value }
        } as any)
    }

    useEffect(() => {
        const fetchData = async () => {
            const { data: clientsData } = await supabase.from('clients').select('*').order('razon_social')
            const { data: catalogData } = await supabase.from('catalog_items').select('*')
            if (clientsData) setClients(clientsData)
            if (catalogData) setCatalog(catalogData)
        }
        fetchData()
    }, [])

    // Objective is meeting_notes in DB
    const objective = selectedOpportunity?.meeting_notes || ''
    const setObjective = (val: string) => updateCurrentOpportunity({ meeting_notes: val })

    // Payment terms mapping to financials_jsonb for consistency
    const paymentTerms = selectedOpportunity?.financials_jsonb?.payment_terms || ''
    const setPaymentTerms = (val: string) => handleJsonbChange('financials_jsonb', 'payment_terms', val)

    const portalHeadline = selectedOpportunity?.portal_headline || ''
    const setPortalHeadline = (val: string) => updateCurrentOpportunity({ portal_headline: val })

    const portalSubheadline = selectedOpportunity?.portal_subheadline || ''
    const setPortalSubheadline = (val: string) => updateCurrentOpportunity({ portal_subheadline: val })

    const deliverables = selectedOpportunity?.deliverables || ''
    const setDeliverables = (val: string) => updateCurrentOpportunity({ deliverables: val })

    const deliveryTimeText = selectedOpportunity?.delivery_time_text || ''
    const setDeliveryTimeText = (val: string) => updateCurrentOpportunity({ delivery_time_text: val })

    const revisionRounds = selectedOpportunity?.revision_rounds || '2 rondas de revisión incluidas'
    const setRevisionRounds = (val: string) => updateCurrentOpportunity({ revision_rounds: val })

    const notIncluded = selectedOpportunity?.not_included || ''
    const setNotIncluded = (val: string) => updateCurrentOpportunity({ not_included: val })

    const validity = selectedOpportunity?.validity_days || 7
    const setValidity = (val: number) => updateCurrentOpportunity({ validity_days: val })

    useEffect(() => {
        if (selectedClient) {
            const fetchOps = async () => {
                const { data } = await supabase
                    .from('opportunities')
                    .select('*, client:clients(*)')
                    .eq('client_id', selectedClient.id)
                    .eq('status', 'discovery')
                    .order('created_at', { ascending: false })
                if (data) setOpportunities(data)
            }
            fetchOps()
        } else {
            setOpportunities([])
        }
    }, [selectedClient])


    const markAsSent = async () => {
        if (!selectedOpportunity) return
        setIsUpdating(true)
        try {
            const { error } = await supabase
                .from('opportunities')
                .update({ status: 'proposal_sent' })
                .eq('id', selectedOpportunity.id)

            if (error) throw error
            alert('Oportunidad marcada como PROPUESTA ENVIADA')
            setCurrentOpportunity({ id: '' } as any)
        } catch (error) {
            console.error('Error updating status:', error)
        } finally {
            setIsUpdating(false)
        }
    }

    const handleCopyPrompt = async () => {
        if (!selectedOpportunity || !selectedClient) return

        const systemPrompt = `Eres el Director Comercial Estratégico de Fortex Digital Solutions, una agencia premium de desarrollo de software. Tu objetivo es traducir notas desordenadas de reuniones con clientes en 'Objetivos Estratégicos' ejecutivos, persuasivos y orientados al negocio (ROI, conversión, escalabilidad, autoridad).

REGLAS ESTRICTAS:
- NUNCA menciones tecnologías específicas (prohibido decir Next.js, React, Supabase, código, etc.).
- Habla sobre el dolor del negocio y cómo la solución lo resuelve.
- Devuelve ÚNICAMENTE 3 viñetas (bullet points) cortas y directas. Cero introducciones, cero despedidas.
- Tono: Corporativo, directo, analítico y seguro (estilo consultoría Big 4).
- Empieza cada viñeta con un verbo de acción en infinitivo (ej: Centralizar, Escalar, Optimizar, Automatizar, Posicionar)`

        const dimension = selectedOpportunity.dimension === 'landing' ? 'Landing Page' :
            selectedOpportunity.dimension === 'website' ? 'Página Web Corporativa' :
                selectedOpportunity.dimension === 'webapp' ? 'Aplicación Web' : 'Proyecto Digital'

        const userPrompt = `
Contexto del Proyecto:
- Empresa Cliente: ${selectedClient.razon_social}
- Servicio a Desarrollar: ${dimension}

Notas en bruto de la reunión (Meeting Notes):
"""
${selectedOpportunity.meeting_notes || 'Sin notas registradas.'}
"""

Basado en las notas anteriores, redacta los 3 Objetivos Estratégicos para el documento de cotización.`

        const fullPrompt = `${systemPrompt}\n\n${userPrompt}`

        try {
            await navigator.clipboard.writeText(fullPrompt)
            setHasCopiedPrompt(true)
            setTimeout(() => setHasCopiedPrompt(false), 2000)
        } catch (err) {
            console.error('Failed to copy:', err)
        }
    }

    const [isMounted, setIsMounted] = useState(false)

    useEffect(() => {
        setIsMounted(true)
    }, [])

    const filteredClients = clients.filter(c =>
        c.razon_social.toLowerCase().includes(searchTerm.toLowerCase()) ||
        c.ruc?.includes(searchTerm)
    )

    return (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 h-[calc(100vh-250px)]">
            {/* PANEL IZQUIERDO: CONFIGURADOR */}
            <div className="lg:col-span-4 space-y-6 overflow-y-auto pr-4 custom-scrollbar">

                {/* Paso 1: Selección */}
                <div className="p-6 rounded-2xl bg-card/40 border border-border space-y-4">
                    <div className="flex items-center gap-2 mb-2">
                        <div className="w-6 h-6 rounded-lg bg-primary/30 text-sky-950 flex items-center justify-center text-xs font-bold font-montserrat">1</div>
                        <h3 className="text-xs font-black uppercase tracking-widest text-foreground/70">Selección de Socio</h3>
                    </div>

                    <div className="relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" size={16} />
                        <input
                            type="text"
                            placeholder="Buscar Cliente / RUC..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full pl-10 pr-4 py-3 bg-secondary/50 border border-border rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all font-medium"
                        />
                    </div>

                    <div className="max-h-40 overflow-y-auto space-y-2 pr-2 custom-scrollbar">
                        {filteredClients.map(client => (
                            <button
                                key={client.id}
                                onClick={() => {
                                    setSelectedClient(client)
                                    setCurrentOpportunity({ id: '' } as any)
                                }}
                                className={`w-full text-left p-3 rounded-xl border transition-all text-[11px] font-bold ${selectedClient?.id === client.id
                                    ? 'bg-primary border-primary text-sky-950 shadow-md'
                                    : 'bg-secondary/20 border-transparent hover:border-border'}`}
                            >
                                {client.razon_social}
                            </button>
                        ))}
                    </div>

                    {selectedClient && (
                        <div className="pt-4 border-t border-border/50 space-y-3">
                            <label className="text-[10px] font-black uppercase text-muted-foreground tracking-wider">Oportunidades en Discovery</label>
                            {opportunities.length > 0 ? (
                                opportunities.map(op => (
                                    <button
                                        key={op.id}
                                        onClick={() => setCurrentOpportunity(op)}
                                        className={`w-full text-left p-3 rounded-xl border transition-all text-[11px] font-bold flex justify-between items-center ${selectedOpportunity?.id === op.id
                                            ? 'bg-accent border-primary text-foreground'
                                            : 'bg-secondary/40 border-border/50 hover:border-primary/50'}`}
                                    >
                                        <span>{op.dimension?.toUpperCase()}</span>
                                        <span className="text-[9px] opacity-60 tabular-nums">S/ {op.draft_jsonb?.totalCalculated.toLocaleString()}</span>
                                    </button>
                                ))
                            ) : (
                                <p className="text-[10px] italic text-muted-foreground">No hay oportunidades activas</p>
                            )}
                        </div>
                    )}
                </div>

                {/* Paso 2: Configurador */}
                {selectedOpportunity && (
                    <div className="p-6 rounded-2xl bg-card border border-border space-y-6 animate-in fade-in slide-in-from-bottom-4">
                        <div className="flex items-center gap-2">
                            <div className="w-6 h-6 rounded-lg bg-primary/30 text-sky-950 flex items-center justify-center text-xs font-bold font-montserrat">2</div>
                            <h3 className="text-xs font-black uppercase tracking-widest text-foreground/70">Diseño de Propuesta</h3>
                        </div>


                        {/* Objective */}
                        <div className="space-y-3">
                            <div className="flex items-center justify-between px-1">
                                <label className="text-[10px] font-black uppercase text-muted-foreground">Objetivo del Proyecto</label>
                                <button
                                    onClick={handleCopyPrompt}
                                    title="Copiar Prompt para IA"
                                    className={`flex items-center gap-1.5 px-2 py-1 rounded-lg border transition-all text-[9px] font-black uppercase tracking-tighter ${hasCopiedPrompt
                                        ? 'bg-success/20 border-success text-success'
                                        : 'bg-primary/10 border-primary/20 text-sky-950 hover:bg-primary/20'
                                        }`}
                                >
                                    {hasCopiedPrompt ? <CheckCircle2 size={12} /> : <Sparkles size={12} />}
                                    {hasCopiedPrompt ? 'Copiado' : 'Copiar Prompt'}
                                </button>
                            </div>
                            <textarea
                                value={objective}
                                onChange={(e) => setObjective(e.target.value)}
                                placeholder="Ej: Modernizar la presencia digital y optimizar captación de leads..."
                                className="w-full p-4 bg-secondary/50 border border-border rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-primary/20 min-h-[120px] font-medium leading-relaxed"
                            />
                        </div>

                        {/* Portal Headline & Subheadline */}
                        <div className="grid grid-cols-1 gap-4">
                            <div className="space-y-2">
                                <label className="text-[10px] font-black uppercase text-muted-foreground pl-1">Título Portal Cliente</label>
                                <input
                                    value={portalHeadline}
                                    onChange={(e) => setPortalHeadline(e.target.value)}
                                    placeholder="Ej. Transformación Digital para..."
                                    className="w-full p-3 bg-secondary/50 border border-border rounded-xl text-xs font-bold"
                                />
                            </div>
                            <div className="space-y-2">
                                <label className="text-[10px] font-black uppercase text-muted-foreground pl-1">Subtítulo Portal</label>
                                <input
                                    value={portalSubheadline}
                                    onChange={(e) => setPortalSubheadline(e.target.value)}
                                    placeholder="Ej. Escalabilidad y alto rendimiento"
                                    className="w-full p-3 bg-secondary/50 border border-border rounded-xl text-xs font-bold"
                                />
                            </div>
                        </div>

                        {/* Validity & Payment */}
                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <label className="text-[10px] font-black uppercase text-muted-foreground pl-1">Validez (Días)</label>
                                <input
                                    type="number"
                                    value={validity}
                                    onChange={(e) => setValidity(parseInt(e.target.value))}
                                    className="w-full p-3 bg-secondary/50 border border-border rounded-xl text-xs font-bold"
                                />
                            </div>
                            <div className="space-y-2">
                                <label className="text-[10px] font-black uppercase text-muted-foreground pl-1">Condiciones</label>
                                <select
                                    value={paymentTerms}
                                    onChange={(e) => setPaymentTerms(e.target.value)}
                                    className="w-full p-3 bg-secondary/50 border border-border rounded-xl text-[10px] font-bold"
                                >
                                    <option>50% Adelanto - 50% Contra-entrega</option>
                                    <option>100% Adelanto (Descuento 5%)</option>
                                    <option>30% Inicio - 40% Hito 1 - 30% Final</option>
                                    <option>Mensualidad recurrente</option>
                                </select>
                            </div>
                        </div>

                        {/* Deliverables & Delivery Time */}
                        <div className="space-y-4">
                            <div className="space-y-2">
                                <label className="text-[10px] font-black uppercase text-muted-foreground pl-1">Entregables Principales (PDF)</label>
                                <textarea
                                    value={deliverables}
                                    onChange={(e) => setDeliverables(e.target.value)}
                                    placeholder="Ej: Código fuente, Manual de Usuario..."
                                    className="w-full p-3 bg-secondary/50 border border-border rounded-xl text-xs font-medium min-h-[80px]"
                                />
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black uppercase text-muted-foreground pl-1">Tiempo de Entrega</label>
                                    <input
                                        value={deliveryTimeText}
                                        onChange={(e) => setDeliveryTimeText(e.target.value)}
                                        placeholder="Ej. 3-5 semanas"
                                        className="w-full p-3 bg-secondary/50 border border-border rounded-xl text-xs font-bold"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black uppercase text-muted-foreground pl-1">Rondas de Revisión</label>
                                    <input
                                        value={revisionRounds}
                                        onChange={(e) => setRevisionRounds(e.target.value)}
                                        placeholder="Ej. 2 rondas"
                                        className="w-full p-3 bg-secondary/50 border border-border rounded-xl text-xs font-bold"
                                    />
                                </div>
                            </div>
                            <div className="space-y-2">
                                <label className="text-[10px] font-black uppercase text-muted-foreground pl-1">No Incluido (Restricciones)</label>
                                <input
                                    value={notIncluded}
                                    onChange={(e) => setNotIncluded(e.target.value)}
                                    placeholder="Ej. Hosting externo, pasarela de pagos extra..."
                                    className="w-full p-3 bg-secondary/50 border border-border rounded-xl text-xs font-bold"
                                />
                            </div>
                        </div>
                    </div>
                )}
            </div>

            {/* PANEL DERECHO: VISOR PDF */}
            <div className="lg:col-span-8 bg-black/20 rounded-3xl border border-border/50 overflow-hidden flex flex-col">
                {selectedOpportunity?.id ? (
                    <>
                        <div className="flex items-center justify-between p-4 border-b border-border/50 bg-card/60 backdrop-blur-md">
                            <div className="flex items-center gap-4">
                                <span className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-sky-950 bg-primary px-3 py-1.5 rounded-full shadow-sm">
                                    <FileText size={12} />
                                    Previsualización
                                </span>
                            </div>
                            <button
                                onClick={markAsSent}
                                disabled={isUpdating}
                                className="flex items-center gap-2 px-4 py-2 bg-success text-success-foreground rounded-xl text-[10px] font-black uppercase tracking-widest hover:scale-105 transition-all shadow-lg shadow-success/20 disabled:opacity-50"
                            >
                                {isUpdating ? <Loader2 size={12} className="animate-spin" /> : <CheckCircle2 size={14} />}
                                Marcar como Enviado
                            </button>
                        </div>

                        <div className="flex-1 bg-secondary/50 p-8">
                            {isMounted ? (
                                <PDFViewer width="100%" height="100%" className="rounded-2xl border border-white/5 shadow-2xl overflow-hidden" showToolbar={true}>
                                    <ExecutiveDocument
                                        opportunity={selectedOpportunity as Opportunity}
                                        catalog={catalog}
                                        proposal={{
                                            objective: objective || "Sin objetivo definido.",
                                            validity,
                                            paymentTerms,
                                            portalHeadline,
                                            portalSubheadline,
                                            deliverables,
                                            deliveryTimeText,
                                            revisionRounds,
                                            notIncluded
                                        }}
                                    />
                                </PDFViewer>
                            ) : (
                                <div className="w-full h-full flex items-center justify-center">
                                    <Loader2 className="w-8 h-8 text-primary animate-spin" />
                                </div>
                            )}
                        </div>
                    </>
                ) : (
                    <div className="flex-1 flex flex-col items-center justify-center text-center p-12 space-y-6">
                        <div className="w-20 h-20 rounded-full bg-secondary/30 flex items-center justify-center text-muted-foreground animate-pulse">
                            <FileDown size={40} />
                        </div>
                        <div className="space-y-2">
                            <h3 className="text-sm font-bold text-foreground opacity-80 uppercase tracking-widest">Esperando Selección</h3>
                            <p className="max-w-[280px] text-xs text-muted-foreground/60 leading-relaxed mx-auto">Selecciona un Socio y una Oportunidad activa para generar el despliegue ejecutivo en PDF.</p>
                        </div>
                    </div>
                )}
            </div>

            <style jsx global>{`
                .custom-scrollbar::-webkit-scrollbar {
                    width: 4px;
                }
                .custom-scrollbar::-webkit-scrollbar-track {
                    background: transparent;
                }
                .custom-scrollbar::-webkit-scrollbar-thumb {
                    background: hsl(var(--primary) / 0.1);
                    border-radius: 10px;
                }
                .custom-scrollbar::-webkit-scrollbar-thumb:hover {
                    background: hsl(var(--primary) / 0.3);
                }
            `}</style>
        </div>
    )
}
