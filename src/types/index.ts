export type ClientRole = 'lead' | 'client' | 'partner'

export interface ClientProfile {
    industry: string;
    business_model: 'B2B' | 'B2C' | 'Híbrido' | '';
    target_market: string;
    value_proposition: string;
    website?: string;
    social_links?: string;
    digital_presence: {
        website: { quality: 'low' | 'medium' | 'high' | ''; observations: string };
        ads: { status: 'active' | 'inactive' | 'not_detected' | ''; observations: string };
        seo: { status: 'none' | 'basic' | 'advanced' | ''; observations: string };
        social: { status: 'inactive' | 'moderate' | 'high' | ''; observations: string };
    };
    brand_positioning: {
        tone: string[];
        colors: string[];
        perceived_level: { level: 'low' | 'mid' | 'premium' | ''; observations: string };
    };
}

export interface ClientInsights {
    initial_observations: { key_finding: string };
    competitors_detected: Array<{ name: string; segment: 'Premium' | 'Medio-Alto' | 'Medio' | 'Low-cost' | ''; strength: string }>;
    market_notes: Array<{ trend: string; impact: string }>;
    technical_conclusion: {
        diagnosis: string;
        immediate_opportunities: Array<{ action: string; detail: string }>;
    };
}

export interface Client {
    id: string
    razon_social: string
    ruc: string
    persona_contacto: string
    email: string
    portal_token: string
    pin_code: string | null
    client_profile_jsonb?: ClientProfile
    client_insights_jsonb?: ClientInsights
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
    client_label?: string
    tech_bullet?: string
    base_price_pen: number
    created_at: string
}

export type NewClient = Omit<Client, 'id' | 'created_at' | 'portal_token' | 'pin_code'>
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

export interface DiscoveryData {
    pain_points: Array<{ problem: string; impact: string; severity: 'Alta' | 'Media' | 'Baja' | '' }>;
    urgency: string;
    decision_maker: string;
    budget_range: string;
}

export interface StrategyData {
    target_user: string;
    key_message: string;
    value_proposition: string;
}

export interface FinancialsData {
    roi_estimate: string;
    revenue_potential: string;
    payment_terms: string;
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
    portal_headline: string | null
    portal_subheadline: string | null
    deliverables: string | null
    delivery_time_text: string | null
    revision_rounds: string
    not_included: string | null
    payment_terms: string | null
    validity_days: number
    // Nuevos campos de inteligencia y estrategia
    discovery_jsonb?: DiscoveryData
    research_jsonb?: Record<string, any>
    strategy_jsonb?: StrategyData
    visual_direction_jsonb?: Record<string, any>
    insights_jsonb?: Record<string, any>
    financials_jsonb?: FinancialsData
    is_deployed?: boolean
    portal_token?: string
    created_at: string
    updated_at: string
    client?: Client
}

export type NewOpportunity = Omit<Opportunity, 'id' | 'created_at' | 'updated_at'>

// --- PRODUCT ECOSYSTEM TYPES ---

export type ProductStatus = 'planning' | 'development' | 'staging' | 'production'

export interface ProductProject {
    id: string
    name: string
    description: string | null
    github_repo_url: string | null
    status: ProductStatus
    tech_stack: {
        frontend?: string
        backend?: string
        db?: string
        infrastructure?: string
        other?: string[]
    }
    business_schema_ref: string | null
    lead_architect_id: string | null
    github_owner: string | null
    github_repo_name: string | null
    github_repo_id: string | null
    github_metadata: {
        stars?: number
        forks?: number
        open_issues?: number
        last_commit_msg?: string
        languages?: Record<string, number>
    }
    last_github_sync: string | null
    created_at: string
    updated_at: string
}

export type DocFragmentType = 'architecture' | 'database_schema' | 'business_logic' | 'api_endpoint' | 'workflow'

export interface ProductDocumentation {
    id: string
    product_id: string
    title: string
    doc_type: DocFragmentType
    content_md: string
    frontmatter: Record<string, any> | null
    author_id: string | null
    version_tag: string
    created_at: string
    updated_at: string
}

