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
        tone: string;
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
    ruc?: string
    persona_contacto?: string
    email?: string
    portal_token?: string
    pin_code?: string | null
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
export type OpportunityStatus = 'draft' | 'discovery' | 'proposal' | 'published' | 'approved' | 'in_progress' | 'won' | 'lost' | 'converted'

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
    key_finding?: string;
    value_proposition?: string;
    industry?: string;
    target_market?: string;
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
    pin_code?: string | null
    phase_template_id?: string | null
    phases_plan_jsonb?: Array<{
        phase_key: string
        phase_name: string
        phase_order: number
        duration_days: number
        revision_limit: number
        planned_start_date: string
        planned_end_date: string
        requires_client_approval: boolean
    }> | null
    roadmap_configured?: boolean
    project_converted_id?: string | null
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

// --- PROJECT MANAGEMENT TYPES ---

export type ProjectType = 'develop' | 'product';
export type ProjectStatus = 'planning' | 'active' | 'paused' | 'review' | 'completed' | 'cancelled' | 'maintenance';

export interface Project {
    id: string;
    project_type: ProjectType;
    opportunity_id?: string | null;
    product_project_id?: string | null;
    code: string;
    name: string;
    description?: string | null;
    client_id?: string | null;
    status: ProjectStatus;
    phase_template_id?: string | null;
    current_cycle_number: number;
    cycle_duration_days: number;
    kickoff_date?: string | null;
    deadline_date?: string | null;
    completed_at?: string | null;
    discord_channel_id?: string | null;
    discord_webhook_url?: string | null;
    lead_dev_id?: string | null;
    project_manager_id?: string | null;
    budget_allocated?: number | null;
    budget_consumed: number;
    linear_project_url?: string | null;
    portal_view_mode?: 'proposal' | 'execution' | null;
    contract_amount?: number | null;
    amount_paid?: number | null;
    amount_pending?: number | null;
    staging_url?: string | null;
    portal_token?: string;
    pin_code?: string | null;
    created_at: string;
    updated_at: string;
}

export interface PhaseDefinition {
    key: string;
    name: string;
    order: number;
    revision_limit: number;
    default_duration_days: number;
}

export interface PhaseTemplate {
    id: string;
    name: string;
    project_type: ProjectType;
    phases_definition: PhaseDefinition[];
    is_default: boolean;
    created_at: string;
}

export type NewPhaseTemplate = Omit<PhaseTemplate, 'id' | 'created_at'>

export type PhaseStatus = 'pending' | 'in_progress' | 'in_review' | 'client_review' | 'approved' | 'blocked' | 'completed' | 'skipped';
export type DelayResponsibility = 'client' | 'internal' | 'external_factor';

export interface ProjectPhase {
    id: string;
    project_id: string;
    phase_key: string;
    phase_name: string;
    phase_order: number;
    planned_start_date?: string | null;
    planned_end_date?: string | null;
    actual_start_date?: string | null;
    actual_end_date?: string | null;
    status: PhaseStatus;
    revision_limit: number;
    revision_count: number;
    revision_extra_count: number;
    client_approved_at?: string | null;
    client_approved_by?: string | null;
    internal_approved_at?: string | null;
    delay_days: number;
    delay_reason?: string | null;
    delay_responsibility?: DelayResponsibility | null;
    deliverables: any[];
    internal_notes?: string | null;
    client_visible_notes?: string | null;
    created_at: string;
    updated_at: string;
}

export type TaskStatus = 'backlog' | 'todo' | 'in_progress' | 'review' | 'blocked' | 'done' | 'cancelled';
export type TaskPriority = 'critical' | 'high' | 'medium' | 'low';
export type TaskType = 'feature' | 'bug' | 'refactor' | 'design' | 'meeting' | 'research' | 'documentation' | 'deploy';

export interface Task {
    id: string;
    project_id: string;
    phase_id?: string | null;
    code: string;
    title: string;
    description?: string | null;
    cycle_number?: number | null;
    cycle_start_date?: string | null;
    cycle_end_date?: string | null;
    status: TaskStatus;
    priority: TaskPriority;
    task_type: TaskType;
    assignee_id?: string | null;
    reporter_id?: string | null;
    estimated_hours?: number | null;
    actual_hours: number;
    due_date?: string | null;
    started_at?: string | null;
    completed_at?: string | null;
    parent_task_id?: string | null;
    blocked_by_task_id?: string | null;
    discord_message_id?: string | null;
    comments_count: number;
    tags: string[];
    created_at: string;
    updated_at: string;
}

export type CommentType = 'text' | 'voice_note' | 'video' | 'screenshot' | 'file' | 'system';

export interface TaskComment {
    id: string;
    task_id: string;
    author_id?: string | null;
    author_name?: string | null;
    comment_type: CommentType;
    content?: string | null;
    file_url?: string | null;
    file_name?: string | null;
    transcription?: string | null;
    is_internal: boolean;
    created_at: string;
}

export type MeetingStatus = 'scheduled' | 'confirmed' | 'in_progress' | 'completed' | 'cancelled' | 'no_show';

export interface Meeting {
    id: string;
    project_id: string;
    title: string;
    meeting_type: string;
    scheduled_at: string;
    duration_minutes: number;
    timezone: string;
    status: MeetingStatus;
    attendees: any[];
    agenda?: string | null;
    meeting_notes?: string | null;
    decisions: string[];
    action_items: any[];
    meet_link?: string | null;
    recording_url?: string | null;
    client_satisfaction?: number | null;
    internal_retro?: string | null;
    created_at: string;
}

export type ApprovalStatus = 'pending' | 'approved' | 'rejected' | 'expired';

export interface ProjectApproval {
    id: string;
    project_id: string;
    phase_id?: string | null;
    approval_type: string;
    status: ApprovalStatus;
    scope_snapshot: Record<string, any>;
    requested_at: string;
    requested_by?: string | null;
    approved_at?: string | null;
    approved_by_client_name?: string | null;
    approved_by_client_email?: string | null;
    client_digital_signature?: string | null;
    change_request_reason?: string | null;
    additional_cost: number;
    additional_days: number;
    original_approval_id?: string | null;
    pdf_url?: string | null;
    created_at: string;
}


// --- PROJECT SERVICES TYPES ---

export type ServiceType = 'seo' | 'cro' | 'performance';
export type ServiceLevel = 'basic' | 'intermediate' | 'advanced';
export type ServiceStatus = 'pending' | 'in_progress' | 'completed';

export interface ServiceAction {
    action: string;
    status: 'done' | 'in_progress' | 'pending';
    completed_at?: string | null;
    started_at?: string | null;
    evidence_url?: string | null;
}

export interface ProjectService {
    id: string;
    project_id: string;
    service_type: ServiceType;
    service_level: ServiceLevel | null;
    status: ServiceStatus;
    metrics_jsonb: Record<string, any>;
    actions_jsonb: ServiceAction[];
    created_at: string;
    updated_at: string;
}


// --- THEME SYSTEM TYPES ---

export interface HslValues {
    background: string
    foreground: string
    card: string
    'card-foreground': string
    popover: string
    'popover-foreground': string
    primary: string
    'primary-foreground': string
    secondary: string
    'secondary-foreground': string
    muted: string
    'muted-foreground': string
    accent: string
    'accent-foreground': string
    destructive: string
    'destructive-foreground': string
    success: string
    'success-foreground': string
    warning: string
    'warning-foreground': string
    border: string
    input: string
    ring: string
    radius: string
    [key: string]: string
}

export interface Theme {
    id: string
    name: string
    slug: string
    description: string | null
    hsl_values: HslValues
    is_default: boolean
    is_active: boolean
    created_at: string
}

export interface ClientTheme {
    id: string
    client_id: string
    base_theme_id: string | null
    custom_hsl_overrides: Partial<HslValues>
    logo_url: string | null
    favicon_url: string | null
    font_heading: string
    font_body: string
    is_active: boolean
    created_at: string
    updated_at: string
    base_theme?: Theme | null
}
