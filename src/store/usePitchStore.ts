import { create } from 'zustand'
import { Client, CatalogItem, Opportunity, PitchDraft, OpportunityDimension, PitchBlock, SelectedModule } from '@/types'
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

    // UI State
    togglePricePanel: (isOpen: boolean) => void
    toggleRightPanel: (isOpen: boolean) => void

    // Logic
    calculateTotal: () => void
    saveToSupabase: () => Promise<void>
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
        internal_retro: ''
    },
    isPricePanelOpen: false,
    isRightPanelOpen: false,
    isLoading: false,
    lastSaved: null,
    clientOpportunities: [],

    fetchClients: async () => {
        const supabase = createClient()
        const { data } = await supabase.from('clients').select('*').order('razon_social')
        if (data) set({ clients: data })
    },

    fetchCatalog: async () => {
        const supabase = createClient()
        const { data } = await supabase.from('catalog_items').select('*').order('category')
        if (data) set({ catalog: data })
    },

    loadOpportunity: async (id) => {
        const supabase = createClient()
        const { data } = await supabase.from('opportunities').select('*, client:clients(*)').eq('id', id).single()
        if (data) set({ currentOpportunity: data })
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
                internal_retro: ''
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

        // Sum Infrastructure
        draft.selectedInfrastructureIds.forEach(id => {
            const item = catalog.find(i => i.id === id)
            if (item) {
                if (item.category === 'hosting_internal') {
                    subtotalOpex += item.base_price_pen
                } else {
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
                    totalCalculated: totalCapex + totalOpex
                }
            }
        }))
    },

    saveToSupabase: async () => {
        const { currentOpportunity } = get()
        if (!currentOpportunity.client_id) {
            console.warn('Cannot save: No client selected')
            return
        }

        set({ isLoading: true })
        const supabase = createClient()

        // Limpiar datos que no pertenecen a la tabla
        const { client, ...saveData } = currentOpportunity as any

        console.log('Sincronizando Core Aura OS...', saveData)

        const { data, error } = await supabase
            .from('opportunities')
            .upsert({
                ...saveData,
                updated_at: new Date().toISOString()
            })
            .select()
            .single()

        if (error) {
            console.error('Error en Sincronización Core:', error.message, error.details)
        } else {
            console.log('Sincronización Exitosa:', data.id)
            set({
                currentOpportunity: { ...currentOpportunity, ...data },
                lastSaved: new Date()
            })
        }
        set({ isLoading: false })
    }
}))
