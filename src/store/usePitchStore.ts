import { create } from 'zustand'
import { Client, CatalogItem, Opportunity, PitchDraft, OpportunityDimension, PitchBlock, SelectedModule, DiscoveryData, StrategyData, FinancialsData } from '@/types'
import { createClient } from '@/utils/supabase/client'

interface PitchState {
    clients: Client[]
    catalog: CatalogItem[]
    currentOpportunity: Partial<Opportunity>
    isPricePanelOpen: boolean
    isRightPanelOpen: boolean
    isLoading: boolean
    lastSaved: Date | null
    clientOpportunities: Opportunity[]
    saveResult: { success: boolean, message: string } | null

    // Fetching
    fetchClients: () => Promise<void>
    fetchCatalog: () => Promise<void>
    loadOpportunity: (id: string) => Promise<void>
    fetchClientOpportunities: (clientId: string) => Promise<void>

    // Mutations
    resetCurrentOpportunity: () => void
    setCurrentOpportunity: (opportunity: Opportunity) => void
    setClient: (client: Client | null) => void
    setDimension: (dimension: OpportunityDimension) => void
    addBlock: () => void
    updateBlock: (blockId: string, updates: Partial<PitchBlock>) => void
    removeBlock: (blockId: string) => void

    // Infrastructure
    setInfrastructureModel: (model: 'external' | 'internal') => void
    toggleInfrastructureItem: (itemId: string) => void

    // Modules
    toggleModule: (moduleId: string) => void
    updateModuleComment: (moduleId: string, comment: string) => void

    setNotes: (notes: string) => void
    setRetro: (retro: string) => void
    setDiscount: (discount: number) => void

    // Custom updates
    updateCurrentOpportunity: (updates: Partial<Opportunity>) => void

    // UI State
    updateDiscoveryData: (data: Partial<DiscoveryData>) => void
    updateStrategyData: (data: Partial<StrategyData>) => void
    updateFinancialsData: (data: Partial<FinancialsData>) => void
    updateClientInfo: (data: any) => void
    togglePricePanel: (isOpen: boolean) => void
    toggleRightPanel: (isOpen: boolean) => void

    // Logic
    calculateTotal: () => void
    saveToSupabase: (showPopup?: boolean) => Promise<boolean>
    saveClientToSupabase: () => Promise<boolean>
    setSaveResult: (result: { success: boolean, message: string } | null) => void
}

const defaultDiscovery: DiscoveryData = {
    pain_points: [],
    urgency: '',
    decision_maker: '',
    budget_range: ''
}

const defaultStrategy: StrategyData = {
    target_user: '',
    key_message: '',
    value_proposition: ''
}

const defaultFinancials: FinancialsData = {
    roi_estimate: '',
    revenue_potential: '',
    payment_terms: ''
}

export const usePitchStore = create<PitchState>((set, get) => ({
    clients: [],
    catalog: [],
    currentOpportunity: {
        status: 'discovery',
        draft_jsonb: {
            blocks: [],
            selectedModules: [],
            infrastructureModel: 'external',
            selectedInfrastructureIds: [],
            totalCalculated: 0,
            totalCapex: 0,
            totalOpex: 0
        },
        discount_applied: 0,
        meeting_notes: '',
        internal_retro: '',
        discovery_jsonb: defaultDiscovery,
        research_jsonb: {},
        strategy_jsonb: defaultStrategy,
        visual_direction_jsonb: {},
        insights_jsonb: {},
        financials_jsonb: defaultFinancials
    },
    isPricePanelOpen: false,
    isRightPanelOpen: false,
    isLoading: false,
    lastSaved: null,
    clientOpportunities: [],
    saveResult: null,

    fetchClients: async () => {
        const supabase = createClient()
        const { data } = await supabase.from('clients').select('*').order('razon_social')
        if (data) set({ clients: data })
    },

    fetchCatalog: async () => {
        const { data } = await createClient().from('catalog_items').select('*')
        if (data) set({ catalog: data })
    },

    loadOpportunity: async (id) => {
        set({ isLoading: true })
        try {
            const supabase = createClient()
            const { data, error } = await supabase.from('opportunities').select('*, client:clients(*)').eq('id', id).single()

            if (error) {
                console.error('Error loading opportunity:', error)
                return
            }

            if (data) {
                const rawDiscovery = data.discovery_jsonb as any || {}
                const rawStrategy = data.strategy_jsonb as any || {}
                const rawFinancials = data.financials_jsonb as any || {}

                set({
                    currentOpportunity: {
                        ...data,
                        discovery_jsonb: {
                            ...defaultDiscovery,
                            ...rawDiscovery,
                            pain_points: Array.isArray(rawDiscovery.pain_points) ? rawDiscovery.pain_points : []
                        },
                        strategy_jsonb: {
                            ...defaultStrategy,
                            ...rawStrategy
                        },
                        financials_jsonb: {
                            ...defaultFinancials,
                            ...rawFinancials
                        }
                    }
                })
            }
        } finally {
            set({ isLoading: false })
        }
    },

    fetchClientOpportunities: async (clientId) => {
        const supabase = createClient()
        const { data } = await supabase
            .from('opportunities')
            .select('*')
            .eq('client_id', clientId)
            .order('created_at', { ascending: false })
        if (data) set({ clientOpportunities: data })
    },

    resetCurrentOpportunity: () => {
        const clientId = get().currentOpportunity.client_id
        const client = get().currentOpportunity.client
        set({
            currentOpportunity: {
                client_id: clientId,
                client: client,
                status: 'discovery',
                draft_jsonb: {
                    blocks: [],
                    selectedModules: [],
                    infrastructureModel: 'external',
                    selectedInfrastructureIds: [],
                    totalCalculated: 0,
                    totalCapex: 0,
                    totalOpex: 0
                },
                discount_applied: 0,
                meeting_notes: '',
                internal_retro: '',
                discovery_jsonb: defaultDiscovery,
                research_jsonb: {},
                strategy_jsonb: defaultStrategy,
                visual_direction_jsonb: {},
                insights_jsonb: {},
                financials_jsonb: defaultFinancials
            },
            lastSaved: null
        })
    },

    setCurrentOpportunity: (opportunity) => {
        set({
            currentOpportunity: opportunity,
            lastSaved: new Date(opportunity.updated_at)
        })
    },

    setClient: (client) => {
        set((state) => ({
            currentOpportunity: {
                ...state.currentOpportunity,
                client_id: client?.id || '',
                client: client || undefined
            }
        }))
    },

    setDimension: (dimension) => {
        const { catalog } = get()
        let initialModules: SelectedModule[] = []

        if (dimension === 'landing' || dimension === 'website') {
            const defaults = catalog.filter(item =>
                item.name.toLowerCase().includes('optimización para google (base)') ||
                item.name.toLowerCase().includes('core web vitals')
            )
            initialModules = defaults.map(d => ({ id: d.id, comment: 'Base obligatoria Aura OS' }))
        }

        set((state) => ({
            currentOpportunity: {
                ...state.currentOpportunity,
                dimension,
                draft_jsonb: {
                    ...state.currentOpportunity.draft_jsonb!,
                    blocks: [],
                    selectedModules: initialModules
                }
            }
        }))
        get().calculateTotal()
    },

    addBlock: () => {
        const newBlock: PitchBlock = {
            id: crypto.randomUUID(),
            name: '',
            visual_level_id: null,
            cognitive_level_id: null,
            complexity_id: null,
            catalog_item_id: null
        }
        set((state) => ({
            currentOpportunity: {
                ...state.currentOpportunity,
                draft_jsonb: {
                    ...state.currentOpportunity.draft_jsonb!,
                    blocks: [...state.currentOpportunity.draft_jsonb!.blocks, newBlock]
                }
            }
        }))
        if (get().isPricePanelOpen) get().calculateTotal()
    },

    updateBlock: (blockId, updates) => {
        set((state) => ({
            currentOpportunity: {
                ...state.currentOpportunity,
                draft_jsonb: {
                    ...state.currentOpportunity.draft_jsonb!,
                    blocks: state.currentOpportunity.draft_jsonb!.blocks.map(b =>
                        b.id === blockId ? { ...b, ...updates } : b
                    )
                }
            }
        }))
        if (get().isPricePanelOpen) get().calculateTotal()
    },

    removeBlock: (blockId) => {
        set((state) => ({
            currentOpportunity: {
                ...state.currentOpportunity,
                draft_jsonb: {
                    ...state.currentOpportunity.draft_jsonb!,
                    blocks: state.currentOpportunity.draft_jsonb!.blocks.filter(b => b.id !== blockId)
                }
            }
        }))
        if (get().isPricePanelOpen) get().calculateTotal()
    },

    setInfrastructureModel: (model) => {
        set((state) => ({
            currentOpportunity: {
                ...state.currentOpportunity,
                draft_jsonb: {
                    ...state.currentOpportunity.draft_jsonb!,
                    infrastructureModel: model,
                    selectedInfrastructureIds: [] // Reset selection when model changes
                }
            }
        }))
        get().calculateTotal()
    },

    toggleInfrastructureItem: (itemId) => {
        set((state) => {
            const current = state.currentOpportunity.draft_jsonb!.selectedInfrastructureIds
            const model = state.currentOpportunity.draft_jsonb!.infrastructureModel

            let nextIds: string[] = []

            if (model === 'internal') {
                // Radio behavior (single selection)
                nextIds = [itemId]
            } else {
                // Checkbox behavior (multiple selection)
                const exists = current.includes(itemId)
                nextIds = exists
                    ? current.filter(id => id !== itemId)
                    : [...current, itemId]
            }

            return {
                currentOpportunity: {
                    ...state.currentOpportunity,
                    draft_jsonb: {
                        ...state.currentOpportunity.draft_jsonb!,
                        selectedInfrastructureIds: nextIds
                    }
                }
            }
        })
        get().calculateTotal()
    },

    toggleModule: (moduleId) => {
        set((state) => {
            const current = state.currentOpportunity.draft_jsonb!.selectedModules
            const exists = current.find(m => m.id === moduleId)

            const nextModules = exists
                ? current.filter(m => m.id !== moduleId)
                : [...current, { id: moduleId, comment: '' }]

            return {
                currentOpportunity: {
                    ...state.currentOpportunity,
                    draft_jsonb: {
                        ...state.currentOpportunity.draft_jsonb!,
                        selectedModules: nextModules
                    }
                }
            }
        })
        if (get().isPricePanelOpen) get().calculateTotal()
    },

    updateModuleComment: (moduleId, comment) => {
        set((state) => ({
            currentOpportunity: {
                ...state.currentOpportunity,
                draft_jsonb: {
                    ...state.currentOpportunity.draft_jsonb!,
                    selectedModules: state.currentOpportunity.draft_jsonb!.selectedModules.map(m =>
                        m.id === moduleId ? { ...m, comment } : m
                    )
                }
            }
        }))
    },

    setNotes: (meeting_notes) => {
        set((state) => ({
            currentOpportunity: { ...state.currentOpportunity, meeting_notes }
        }))
    },

    setRetro: (internal_retro) => {
        set((state) => ({
            currentOpportunity: { ...state.currentOpportunity, internal_retro }
        }))
    },

    setDiscount: (discount_applied) => {
        set((state) => ({
            currentOpportunity: { ...state.currentOpportunity, discount_applied }
        }))
        get().calculateTotal()
    },

    updateCurrentOpportunity: (updates) => {
        set((state) => ({
            currentOpportunity: { ...state.currentOpportunity, ...updates }
        }))
    },

    updateDiscoveryData: (data) => {
        const { currentOpportunity } = get()
        set({
            currentOpportunity: {
                ...currentOpportunity,
                discovery_jsonb: { ...currentOpportunity.discovery_jsonb, ...data } as any
            }
        })
    },

    updateStrategyData: (data) => {
        const { currentOpportunity } = get()
        set({
            currentOpportunity: {
                ...currentOpportunity,
                strategy_jsonb: { ...currentOpportunity.strategy_jsonb, ...data } as any
            }
        })
    },

    updateFinancialsData: (data) => {
        const { currentOpportunity } = get()
        set({
            currentOpportunity: {
                ...currentOpportunity,
                financials_jsonb: { ...currentOpportunity.financials_jsonb, ...data } as any
            }
        })
    },

    togglePricePanel: (isOpen) => {
        set({ isPricePanelOpen: isOpen })
        if (isOpen) get().calculateTotal()
    },

    toggleRightPanel: (isOpen) => set({ isRightPanelOpen: isOpen }),

    calculateTotal: () => {
        const { currentOpportunity, catalog } = get()

        let subtotalCapex = 0
        let subtotalOpex = 0
        const draft = currentOpportunity.draft_jsonb!

        // Sum Blocks (CAPEX)
        draft.blocks.forEach(block => {
            if (currentOpportunity.dimension === 'landing') {
                if (block.complexity_id) {
                    const item = catalog.find(i => i.id === block.complexity_id)
                    if (item) subtotalCapex += item.base_price_pen
                }
            } else if (currentOpportunity.dimension === 'website') {
                if (block.catalog_item_id) {
                    const item = catalog.find(i => i.id === block.catalog_item_id)
                    if (item) subtotalCapex += item.base_price_pen
                }
            } else {
                if (block.visual_level_id) {
                    const item = catalog.find(i => i.id === block.visual_level_id)
                    if (item) subtotalCapex += item.base_price_pen
                }
                if (block.cognitive_level_id) {
                    const item = catalog.find(i => i.id === block.cognitive_level_id)
                    if (item) subtotalCapex += item.base_price_pen
                }
            }
        })

        // Sum Modules (CAPEX)
        draft.selectedModules.forEach(sm => {
            const item = catalog.find(i => i.id === sm.id)
            if (item) subtotalCapex += item.base_price_pen
        })

        let infraCapex = 0
        // Sum Infrastructure
        draft.selectedInfrastructureIds.forEach(id => {
            const item = catalog.find(i => i.id === id)
            if (item) {
                if (item.category === 'hosting_internal') {
                    subtotalOpex += item.base_price_pen
                } else {
                    infraCapex += item.base_price_pen
                    subtotalCapex += item.base_price_pen
                }
            }
        })

        const discountAmount = (subtotalCapex * (currentOpportunity.discount_applied || 0)) / 100
        const totalCapex = Math.round(Math.max(0, subtotalCapex - discountAmount))
        const totalOpex = Math.round(subtotalOpex)

        set((state) => ({
            currentOpportunity: {
                ...state.currentOpportunity,
                draft_jsonb: {
                    ...state.currentOpportunity.draft_jsonb!,
                    totalCapex,
                    totalOpex,
                    totalInfraCapex: infraCapex,
                    totalCalculated: totalCapex + totalOpex
                }
            }
        }))
    },

    saveToSupabase: async (showPopup = false) => {
        get().calculateTotal()
        const { currentOpportunity, setSaveResult } = get()
        if (!currentOpportunity.client_id) {
            if (showPopup) setSaveResult({ success: false, message: 'Debe seleccionar un Cliente primero.' })
            return false
        }

        set({ isLoading: true })
        const supabase = createClient()

        const rawData = { ...currentOpportunity }
        delete (rawData as any).client
        delete (rawData as any).is_deployed // Remove non-existent column to prevent PGRST204 error

        if (rawData.id === "" || rawData.id === undefined) {
            delete rawData.id
        }

        const saveData = {
            ...rawData,
            updated_at: new Date().toISOString()
        }

        const { data, error } = await supabase
            .from('opportunities')
            .upsert(saveData)
            .select()
            .single()

        if (error) {
            console.error('Error en Sincronización Core:', error)
            setSaveResult({
                success: false,
                message: `Error al guardar: ${error.message}${error.details ? ' - ' + error.details : ''}`
            })
            set({ isLoading: false })
            return false
        } else {
            console.log('Sincronización Exitosa:', data.id)
            set({
                currentOpportunity: { ...currentOpportunity, ...data },
                lastSaved: new Date()
            })
            if (showPopup) {
                setSaveResult({ success: true, message: 'La oportunidad ha sido registrada exitosamente en el Core.' })
            }
            set({ isLoading: false })
            return true
        }
    },

    updateClientInfo: (data) => {
        const { currentOpportunity } = get()
        if (!currentOpportunity || !currentOpportunity.client) return

        set({
            currentOpportunity: {
                ...currentOpportunity,
                client: {
                    ...(currentOpportunity.client as any),
                    ...data
                }
            }
        })
    },

    saveClientToSupabase: async () => {
        const { currentOpportunity } = get()
        if (!currentOpportunity || !currentOpportunity.client) return false

        const supabase = createClient()
        const client = currentOpportunity.client

        try {
            const { error } = await supabase
                .from('clients')
                .update({
                    razon_social: client.razon_social,
                    ruc: client.ruc,
                    persona_contacto: client.persona_contacto,
                    email: client.email,
                    client_profile_jsonb: client.client_profile_jsonb,
                    client_insights_jsonb: client.client_insights_jsonb,
                    pin_code: client.pin_code
                })
                .eq('id', client.id)

            if (error) throw error
            return true
        } catch (error) {
            console.error('Error saving client:', error)
            return false
        }
    },

    setSaveResult: (saveResult) => set({ saveResult })
}))
