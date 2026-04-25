export type ClientRole = 'lead' | 'client' | 'partner'

export interface Client {
    id: string
    razon_social: string
    ruc: string
    persona_contacto: string
    email: string
    created_at: string
}

export type CatalogCategory =
    | 'setup'
    | 'page_tier'
    | 'integration'
    | 'domain'
    | 'app_feature'
    | 'block_cognitive'
    | 'block_visual'
    | 'page_visual'
    | 'page_cognitive'
    | 'seo_module'
    | 'cro_strategy'
    | 'performance_module'
    | 'landing_block'
    | 'website_page'
    | 'hosting_external'
    | 'hosting_internal'

export interface CatalogItem {
    id: string
    category: CatalogCategory
    name: string
    description?: string
    base_price_pen: number
    created_at: string
}

export type NewClient = Omit<Client, 'id' | 'created_at'>
export type NewCatalogItem = Omit<CatalogItem, 'id' | 'created_at'>

export type OpportunityDimension = 'landing' | 'website' | 'webapp' | 'mobileapp'
export type OpportunityStatus = 'discovery' | 'quoted' | 'won' | 'lost'

export interface PitchBlock {
    id: string
    name: string
    visual_level_id: string | null
    cognitive_level_id: string | null
    complexity_id: string | null
    catalog_item_id: string | null
}

export interface SelectedModule {
    id: string
    comment: string
}

export interface PitchDraft {
    blocks: PitchBlock[]
    selectedModules: SelectedModule[]
    infrastructureModel: 'external' | 'internal'
    selectedInfrastructureIds: string[]
    totalCalculated: number
    totalCapex: number
    totalOpex: number
}

export interface Opportunity {
    id: string
    client_id: string
    dimension: OpportunityDimension | null
    status: OpportunityStatus
    draft_jsonb: PitchDraft
    meeting_notes: string | null
    internal_retro: string | null
    discount_applied: number
    created_at: string
    updated_at: string
    client?: Client
}

export type NewOpportunity = Omit<Opportunity, 'id' | 'created_at' | 'updated_at'>
