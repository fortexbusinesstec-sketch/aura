CREATE TABLE projects (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    
    -- Origen del proyecto
    project_type VARCHAR(20) NOT NULL CHECK (project_type IN ('develop', 'product')),
    -- 'develop' = web para cliente externo (viene de opportunities)
    -- 'product' = SaaS propio (viene de product_projects)
    
    -- Relaciones (una sola será usada según type)
    opportunity_id UUID REFERENCES opportunities(id),
    product_project_id UUID REFERENCES product_projects(id),
    
    -- Identidad
    code VARCHAR(20) UNIQUE NOT NULL, -- 'AURA-DEV-001' o 'AURA-PROD-001'
    name VARCHAR(255) NOT NULL,
    description TEXT,
    
    -- Cliente (para develop, heredado de opportunities. Para product, puede ser null o interno)
    client_id UUID REFERENCES clients(id),
    
    -- Estado macro del proyecto
    status VARCHAR(30) NOT NULL DEFAULT 'planning',
    -- planning | active | paused | review | completed | cancelled | maintenance
    
    -- Configuración de fases (usa template)
    phase_template_id UUID REFERENCES phase_templates(id),
    
    -- Scrunban: Ciclo actual
    current_cycle_number INT DEFAULT 1,
    cycle_duration_days INT DEFAULT 3, -- Ustedes usan 3 días
    
    -- Fechas
    kickoff_date DATE,
    deadline_date DATE,
    completed_at TIMESTAMP,
    
    -- Comunicación
    discord_channel_id VARCHAR(100), -- ID del canal de Discord para este proyecto
    discord_webhook_url TEXT,
    
    -- Responsables
    lead_dev_id UUID REFERENCES profiles(id),
    project_manager_id UUID REFERENCES profiles(id),
    
    -- Presupuesto (para develop, heredado. Para product, costo interno)
    budget_allocated DECIMAL(12,2),
    budget_consumed DECIMAL(12,2) DEFAULT 0,
    
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE phase_templates (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(100) NOT NULL, -- 'Landing Page Estándar', 'SaaS MVP', 'E-commerce Pro'
    project_type VARCHAR(20) CHECK (project_type IN ('develop', 'product')),
    
    -- Las fases como JSON ordenado (permite crear templates sin mil tablas)
    phases_definition JSONB NOT NULL DEFAULT '[]',
    -- Ejemplo para develop:
    -- [
    --   {"key": "discovery", "name": "Discovery", "order": 1, "revision_limit": 0, "default_duration_days": 3},
    --   {"key": "wireframes", "name": "Wireframes", "order": 2, "revision_limit": 2, "default_duration_days": 3},
    --   {"key": "design", "name": "Diseño UI", "order": 3, "revision_limit": 3, "default_duration_days": 4},
    --   {"key": "development", "name": "Desarrollo", "order": 4, "revision_limit": 1, "default_duration_days": 7},
    --   {"key": "qa", "name": "QA & Revisión", "order": 5, "revision_limit": 1, "default_duration_days": 2},
    --   {"key": "launch", "name": "Lanzamiento", "order": 6, "revision_limit": 0, "default_duration_days": 1}
    -- ]
    
    -- Ejemplo para product (SaaS como Operate):
    -- [
    --   {"key": "architecture", "name": "Arquitectura Hexagonal", "order": 1, "revision_limit": 0},
    --   {"key": "mvp_core", "name": "MVP Core", "order": 2, "revision_limit": 0},
    --   {"key": "tenant_isolation", "name": "Multi-tenant & Turso", "order": 3, "revision_limit": 0},
    --   {"key": "workflows", "name": "Flujos de Trabajo", "order": 4, "revision_limit": 0},
    --   {"key": "beta", "name": "Beta Cerrada", "order": 5, "revision_limit": 0},
    --   {"key": "launch", "name": "Go to Market", "order": 6, "revision_limit": 0}
    -- ]
    
    is_default BOOLEAN DEFAULT false,
    created_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE project_phases (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    project_id UUID REFERENCES projects(id) ON DELETE CASCADE,
    
    -- Datos de la fase
    phase_key VARCHAR(50) NOT NULL,
    phase_name VARCHAR(100) NOT NULL,
    phase_order INT NOT NULL,
    
    -- Tiempos planificados vs reales
    planned_start_date DATE,
    planned_end_date DATE,
    actual_start_date DATE,
    actual_end_date DATE,
    
    -- Estado (alimenta el Roadmap visual)
    status VARCHAR(20) NOT NULL DEFAULT 'pending',
    -- pending | in_progress | in_review | client_review | approved | blocked | completed | skipped
    
    -- Revisiones (crítico para develop, menos para product)
    revision_limit INT DEFAULT 2,
    revision_count INT DEFAULT 0,
    revision_extra_count INT DEFAULT 0, -- Revisiones fuera de contrato (cobrar aparte)
    
    -- Aprobación
    client_approved_at TIMESTAMP, -- Solo para develop
    client_approved_by VARCHAR(255),
    internal_approved_at TIMESTAMP, -- Para product (aprobación interna)
    
    -- Delay tracking (esto te salvará la vida)
    delay_days INT DEFAULT 0,
    delay_reason TEXT, -- "Cliente demoró 5 días en feedback"
    delay_responsibility VARCHAR(20), -- 'client' | 'internal' | 'external_factor'
    
    -- Entregables de esta fase
    deliverables JSONB DEFAULT '[]',
    -- [{"name": "Wireframe v1.fig", "url": "...", "type": "figma", "uploaded_by": "...", "uploaded_at": "..."}]
    
    -- Notas
    internal_notes TEXT,
    client_visible_notes TEXT, -- Lo que el cliente ve en su portal
    
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE tasks (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    project_id UUID REFERENCES projects(id) ON DELETE CASCADE,
    phase_id UUID REFERENCES project_phases(id), -- Opcional: vincular a fase
    
    -- Identificación
    code VARCHAR(20) UNIQUE NOT NULL, -- 'TASK-001', 'OPRT-042'
    title VARCHAR(255) NOT NULL,
    description TEXT,
    
    -- Scrunban: Ciclo de 3 días
    cycle_number INT, -- Ciclo 1, 2, 3...
    cycle_start_date DATE,
    cycle_end_date DATE,
    
    -- Kanban
    status VARCHAR(20) NOT NULL DEFAULT 'backlog',
    -- backlog | todo | in_progress | review | blocked | done | cancelled
    
    -- Priorización
    priority VARCHAR(10) DEFAULT 'medium',
    -- critical | high | medium | low
    
    -- Categorización
    task_type VARCHAR(20) DEFAULT 'feature',
    -- feature | bug | refactor | design | meeting | research | documentation | deploy
    
    -- Responsables
    assignee_id UUID REFERENCES profiles(id),
    reporter_id UUID REFERENCES profiles(id),
    
    -- Tiempos estimados vs reales (para métricas)
    estimated_hours DECIMAL(5,2),
    actual_hours DECIMAL(5,2) DEFAULT 0,
    
    -- Fechas
    due_date DATE,
    started_at TIMESTAMP,
    completed_at TIMESTAMP,
    
    -- Relaciones
    parent_task_id UUID REFERENCES tasks(id), -- Subtareas
    blocked_by_task_id UUID REFERENCES tasks(id), -- "Esta tarea está bloqueada por..."
    
    -- Comunicación estructurada (adiós audios de WhatsApp)
    discord_message_id VARCHAR(100), -- Link al hilo en Discord
    comments_count INT DEFAULT 0,
    
    -- Metadata
    tags JSONB DEFAULT '[]', -- ["ui", "api", "urgent-client"]
    
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE task_comments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    task_id UUID REFERENCES tasks(id) ON DELETE CASCADE,
    
    author_id UUID REFERENCES profiles(id),
    author_name VARCHAR(100), -- Cache para mostrar rápido
    
    -- Tipo de comunicación
    comment_type VARCHAR(20) DEFAULT 'text',
    -- text | voice_note | video | screenshot | file | system
    
    -- Contenido
    content TEXT, -- Texto o transcripción del audio
    file_url TEXT, -- Si es archivo/voice/video
    file_name VARCHAR(255),
    
    -- Si es voice/video, transcripción obligatoria (regla de Aura)
    transcription TEXT,
    
    -- Visibilidad
    is_internal BOOLEAN DEFAULT false, -- true = solo equipo, false = cliente también ve (si es develop)
    
    created_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE meetings (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    project_id UUID REFERENCES projects(id) ON DELETE CASCADE,
    
    -- Datos básicos
    title VARCHAR(255) NOT NULL,
    meeting_type VARCHAR(30) NOT NULL,
    -- kickoff | discovery | wireframe_review | design_review | sprint_review | 
    -- client_update | internal_sync | retrospective | emergency
    
    -- Fechas
    scheduled_at TIMESTAMP NOT NULL,
    duration_minutes INT DEFAULT 30,
    timezone VARCHAR(50) DEFAULT 'America/Lima',
    
    -- Estado
    status VARCHAR(20) DEFAULT 'scheduled',
    -- scheduled | confirmed | in_progress | completed | cancelled | no_show
    
    -- Participantes
    attendees JSONB DEFAULT '[]',
    -- [{"name": "Carlos (Cliente)", "email": "...", "role": "client", "attended": true}]
    
    -- Agenda y resultados
    agenda TEXT, -- Lo que se planea hablar
    meeting_notes TEXT, -- Lo que realmente se habló (llenar obligatorio post-reunión)
    decisions JSONB DEFAULT '[]', -- ["Aprobar wireframe v2", "Cambiar paleta de colores"]
    action_items JSONB DEFAULT '[]', 
    -- [{"task": "Enviar wireframe v2", "assignee": "...", "due_date": "..."}]
    
    -- Grabación/Link
    meet_link VARCHAR(255),
    recording_url TEXT,
    
    -- Retroalimentación
    client_satisfaction INT, -- 1-5
    internal_retro TEXT, -- "Carlos no tenía claro el alcance, necesitamos mejorar discovery"
    
    created_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE project_approvals (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    project_id UUID REFERENCES projects(id) ON DELETE CASCADE,
    phase_id UUID REFERENCES project_phases(id),
    
    -- Qué se aprueba
    approval_type VARCHAR(30) NOT NULL,
    -- proposal | phase_wireframe | phase_design | phase_development | 
    -- change_request | extra_revision | maintenance_renewal
    
    -- Estado
    status VARCHAR(20) DEFAULT 'pending',
    -- pending | approved | rejected | expired
    
    -- Contenido aprobado
    scope_snapshot JSONB NOT NULL, -- Copia exacta del scope en el momento de aprobación
    -- {"blocks": [...], "modules": [...], "total": 855, "exclusions": [...]}
    
    -- Firmas
    requested_at TIMESTAMP DEFAULT NOW(),
    requested_by UUID REFERENCES profiles(id),
    
    approved_at TIMESTAMP,
    approved_by_client_name VARCHAR(255),
    approved_by_client_email VARCHAR(255),
    client_digital_signature TEXT, -- Hash o imagen
    
    -- Si es change request (lo que mató a tu socio)
    change_request_reason TEXT, -- "Cliente pidió agregar blog"
    additional_cost DECIMAL(12,2) DEFAULT 0,
    additional_days INT DEFAULT 0,
    original_approval_id UUID REFERENCES project_approvals(id), -- Link a la aprobación original
    
    -- Documento legal
    pdf_url TEXT,
    
    created_at TIMESTAMP DEFAULT NOW()
);

-- --- MIGRACIONES: opportunities ---
-- Nota: La tabla opportunities ya existe en tu base de datos.
-- Si necesitas agregar los campos de roadmap, ejecuta:
--
-- ALTER TABLE opportunities
--   ADD COLUMN IF NOT EXISTS phase_template_id UUID REFERENCES phase_templates(id),
--   ADD COLUMN IF NOT EXISTS phases_plan_jsonb JSONB DEFAULT NULL,
--   ADD COLUMN IF NOT EXISTS roadmap_configured BOOLEAN DEFAULT false;

-- NUEVO: Link a proyecto convertido
ALTER TABLE opportunities ADD COLUMN IF NOT EXISTS project_converted_id UUID REFERENCES projects(id);

-- NUEVO: Portal tokens y PIN para autenticación del cliente en cada oportunidad
ALTER TABLE opportunities ADD COLUMN IF NOT EXISTS portal_token UUID DEFAULT gen_random_uuid();
ALTER TABLE opportunities ADD COLUMN IF NOT EXISTS pin_code VARCHAR(10);

-- Crear índice único para búsqueda rápida por portal_token
CREATE UNIQUE INDEX IF NOT EXISTS idx_opportunities_portal_token ON opportunities(portal_token);

-- --- MIGRACIONES: projects ---
ALTER TABLE projects ADD COLUMN IF NOT EXISTS portal_view_mode VARCHAR(20) DEFAULT 'proposal';
ALTER TABLE projects ADD COLUMN IF NOT EXISTS contract_amount DECIMAL(12,2);
ALTER TABLE projects ADD COLUMN IF NOT EXISTS amount_paid DECIMAL(12,2) DEFAULT 0;
ALTER TABLE projects ADD COLUMN IF NOT EXISTS amount_pending DECIMAL(12,2);
ALTER TABLE projects ADD COLUMN IF NOT EXISTS staging_url VARCHAR(255);

-- NUEVO: Portal tokens y PIN independientes para cada proyecto (diferentes a la oportunidad origen)
ALTER TABLE projects ADD COLUMN IF NOT EXISTS portal_token UUID DEFAULT gen_random_uuid();
ALTER TABLE projects ADD COLUMN IF NOT EXISTS pin_code VARCHAR(10);

-- Crear índice único para búsqueda rápida por portal_token
CREATE UNIQUE INDEX IF NOT EXISTS idx_projects_portal_token ON projects(portal_token);

-- --- NUEVA TABLA: project_services ---
CREATE TABLE IF NOT EXISTS project_services (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    project_id UUID REFERENCES projects(id) ON DELETE CASCADE,
    service_type VARCHAR(20) NOT NULL, -- 'seo' | 'cro' | 'performance'
    service_level VARCHAR(20), -- 'basic' | 'intermediate' | 'advanced'
    status VARCHAR(20) DEFAULT 'pending', -- pending | in_progress | completed
    metrics_jsonb JSONB DEFAULT '{}',
    actions_jsonb JSONB DEFAULT '[]',
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

ALTER TABLE project_services ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Usuarios autenticados pueden ver project_services" ON project_services FOR SELECT TO authenticated USING (true);
CREATE POLICY "Usuarios autenticados pueden crear project_services" ON project_services FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "Usuarios autenticados pueden actualizar project_services" ON project_services FOR UPDATE TO authenticated USING (true);
CREATE POLICY "Usuarios autenticados pueden eliminar project_services" ON project_services FOR DELETE TO authenticated USING (true);

-- --- RLS POLICIES ---

-- Habilitar RLS en todas las tablas
ALTER TABLE projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE phase_templates ENABLE ROW LEVEL SECURITY;
ALTER TABLE project_phases ENABLE ROW LEVEL SECURITY;
ALTER TABLE tasks ENABLE ROW LEVEL SECURITY;
ALTER TABLE task_comments ENABLE ROW LEVEL SECURITY;
ALTER TABLE meetings ENABLE ROW LEVEL SECURITY;
ALTER TABLE project_approvals ENABLE ROW LEVEL SECURITY;

-- Políticas generales para usuarios autenticados (Full CRUD)
-- Si necesitas restringir por rol, puedes cambiar "USING (true)" por "USING (auth.uid() = user_id)" o similar

-- Projects
CREATE POLICY "Usuarios autenticados pueden ver proyectos" ON projects FOR SELECT TO authenticated USING (true);
CREATE POLICY "Usuarios autenticados pueden crear proyectos" ON projects FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "Usuarios autenticados pueden actualizar proyectos" ON projects FOR UPDATE TO authenticated USING (true);
CREATE POLICY "Usuarios autenticados pueden eliminar proyectos" ON projects FOR DELETE TO authenticated USING (true);

-- Phase Templates
CREATE POLICY "Usuarios autenticados pueden ver templates" ON phase_templates FOR SELECT TO authenticated USING (true);
CREATE POLICY "Usuarios autenticados pueden crear templates" ON phase_templates FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "Usuarios autenticados pueden actualizar templates" ON phase_templates FOR UPDATE TO authenticated USING (true);
CREATE POLICY "Usuarios autenticados pueden eliminar templates" ON phase_templates FOR DELETE TO authenticated USING (true);

-- Project Phases
CREATE POLICY "Usuarios autenticados pueden ver fases" ON project_phases FOR SELECT TO authenticated USING (true);
CREATE POLICY "Usuarios autenticados pueden crear fases" ON project_phases FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "Usuarios autenticados pueden actualizar fases" ON project_phases FOR UPDATE TO authenticated USING (true);
CREATE POLICY "Usuarios autenticados pueden eliminar fases" ON project_phases FOR DELETE TO authenticated USING (true);

-- Tasks
CREATE POLICY "Usuarios autenticados pueden ver tareas" ON tasks FOR SELECT TO authenticated USING (true);
CREATE POLICY "Usuarios autenticados pueden crear tareas" ON tasks FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "Usuarios autenticados pueden actualizar tareas" ON tasks FOR UPDATE TO authenticated USING (true);
CREATE POLICY "Usuarios autenticados pueden eliminar tareas" ON tasks FOR DELETE TO authenticated USING (true);

-- Task Comments
CREATE POLICY "Usuarios autenticados pueden ver comentarios" ON task_comments FOR SELECT TO authenticated USING (true);
CREATE POLICY "Usuarios autenticados pueden crear comentarios" ON task_comments FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "Usuarios autenticados pueden actualizar comentarios" ON task_comments FOR UPDATE TO authenticated USING (true);
CREATE POLICY "Usuarios autenticados pueden eliminar comentarios" ON task_comments FOR DELETE TO authenticated USING (true);

-- Meetings
CREATE POLICY "Usuarios autenticados pueden ver reuniones" ON meetings FOR SELECT TO authenticated USING (true);
CREATE POLICY "Usuarios autenticados pueden crear reuniones" ON meetings FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "Usuarios autenticados pueden actualizar reuniones" ON meetings FOR UPDATE TO authenticated USING (true);
CREATE POLICY "Usuarios autenticados pueden eliminar reuniones" ON meetings FOR DELETE TO authenticated USING (true);

-- Project Approvals
CREATE POLICY "Usuarios autenticados pueden ver aprobaciones" ON project_approvals FOR SELECT TO authenticated USING (true);
CREATE POLICY "Usuarios autenticados pueden crear aprobaciones" ON project_approvals FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "Usuarios autenticados pueden actualizar aprobaciones" ON project_approvals FOR UPDATE TO authenticated USING (true);
CREATE POLICY "Usuarios autenticados pueden eliminar aprobaciones" ON project_approvals FOR DELETE TO authenticated USING (true);

-- --- TEMAS DEL SISTEMA ---
CREATE TABLE IF NOT EXISTS themes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    
    -- Identificación
    name VARCHAR(50) NOT NULL,        -- Ej: 'Morning Light', 'Midnight Focus'
    slug VARCHAR(50) UNIQUE NOT NULL, -- Ej: 'morning', 'midnight', 'ocean'
    description VARCHAR(255),         -- Ej: 'Alto contraste para trabajo diurno'
    
    -- Todos los valores HSL en un solo JSONB (coincide con tu CSS)
    hsl_values JSONB NOT NULL DEFAULT '{
        "background": "50 40% 94%",
        "foreground": "40 25% 14%",
        "card": "0 0% 100%",
        "card-foreground": "40 25% 14%",
        "popover": "0 0% 100%",
        "popover-foreground": "40 25% 14%",
        "primary": "39 100% 87%",
        "primary-foreground": "39 28% 22%",
        "secondary": "48 30% 88%",
        "secondary-foreground": "40 25% 14%",
        "muted": "48 25% 86%",
        "muted-foreground": "40 11% 43%",
        "accent": "48 40% 89%",
        "accent-foreground": "40 25% 14%",
        "destructive": "6 62% 66%",
        "destructive-foreground": "0 0% 100%",
        "success": "113 23% 71%",
        "success-foreground": "113 40% 20%",
        "warning": "38 82% 70%",
        "warning-foreground": "38 50% 20%",
        "border": "45 18% 85%",
        "input": "45 18% 85%",
        "ring": "39 100% 87%",
        "radius": "0.75rem"
    }',
    
    -- Control
    is_default BOOLEAN DEFAULT false, -- El tema que se aplica si no hay preferencia
    is_active BOOLEAN DEFAULT true,
    
    created_at TIMESTAMP DEFAULT NOW()
);

-- RLS para Themes
ALTER TABLE themes ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Auth ver temas del sistema" ON themes FOR SELECT TO authenticated USING (true);
CREATE POLICY "Auth crear temas" ON themes FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "Auth actualizar temas" ON themes FOR UPDATE TO authenticated USING (true);

-- --- TEMAS PERSONALIZADOS POR CLIENTE ---
CREATE TABLE IF NOT EXISTS client_themes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    
    -- A quién pertenece el tema
    client_id UUID NOT NULL REFERENCES clients(id) ON DELETE CASCADE,
    
    -- Puede heredar de un tema base del catálogo (opcional)
    base_theme_id UUID REFERENCES themes(id),
    
    -- Override: solo los valores HSL que cambian respecto al base
    custom_hsl_overrides JSONB DEFAULT '{}',
    
    -- Assets visuales del portal
    logo_url TEXT,                    -- Logo del cliente en el header del portal
    favicon_url TEXT,               -- Favicon del cliente
    
    -- Tipografía
    font_heading VARCHAR(50) DEFAULT 'Inter',
    font_body VARCHAR(50) DEFAULT 'Inter',
    
    -- Estado
    is_active BOOLEAN DEFAULT true,
    
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW(),
    
    -- Un cliente solo tiene un tema activo
    UNIQUE(client_id)
);

-- RLS para Client Themes
ALTER TABLE client_themes ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Auth ver temas de clientes" ON client_themes FOR SELECT TO authenticated USING (true);
CREATE POLICY "Auth crear temas de clientes" ON client_themes FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "Auth actualizar temas de clientes" ON client_themes FOR UPDATE TO authenticated USING (true);


-- --- MIGRACIONES: profiles ---
-- Agregar preferencia de tema del usuario (referencia a themes.slug)
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS preferred_theme_slug VARCHAR(50) DEFAULT 'aura-warm';
