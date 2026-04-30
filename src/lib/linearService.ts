/**
 * ===================================================================
 * Linear.app Integration Service for Aura OS
 * ===================================================================
 *
 * Este módulo proporciona integración opcional con Linear.app mediante
 * su API GraphQL. Si Linear falla o no está configurado, Aura OS
 * continúa funcionando normalmente — todos los errores se capturan
 * y loguean sin interrumpir el flujo principal.
 *
 * Requiere variables de entorno:
 *   LINEAR_API_KEY  – API key de Linear (obligatorio para usar el servicio)
 *   LINEAR_TEAM_ID  – ID del equipo de Linear (opcional)
 *
 * Nota sobre projectId de Linear:
 *   Linear usa IDs internos UUID para GraphQL (ej. 590234c6-…).
 *   Guardamos `linear_project_id` en Supabase cuando es posible.
 *   Si la columna no existe en la tabla `projects`, el servicio
 *   realiza un fallback buscando el proyecto en Linear por nombre.
 * ===================================================================
 */

import { createClient } from '@/utils/supabase/server'

// ------------------------------------------------------------------
// Configuración
// ------------------------------------------------------------------

const LINEAR_API_KEY = process.env.LINEAR_API_KEY
const LINEAR_TEAM_ID = process.env.LINEAR_TEAM_ID
const LINEAR_GRAPHQL_ENDPOINT = 'https://api.linear.app/graphql'

// ------------------------------------------------------------------
// Tipos GraphQL (respuestas de Linear)
// ------------------------------------------------------------------

interface LinearProjectPayload {
    id: string
    name: string
    url: string
    state: string
}

interface LinearIssuePayload {
    id: string
    identifier: string
    url: string
    title: string
    state: {
        name: string
    }
}

interface LinearGraphQLError {
    message: string
    extensions?: Record<string, unknown>
}

interface LinearApiResponse<T> {
    data?: T
    errors?: LinearGraphQLError[]
}

// ------------------------------------------------------------------
// Helper privado: ejecutar query/mutation GraphQL contra Linear
// ------------------------------------------------------------------

async function linearRequest<T>(
    query: string,
    variables?: Record<string, unknown>
): Promise<T | null> {
    if (!LINEAR_API_KEY) {
        console.warn('[Linear] LINEAR_API_KEY no configurado. Omitiendo llamada a Linear.')
        return null
    }

    try {
        const response = await fetch(LINEAR_GRAPHQL_ENDPOINT, {
            method: 'POST',
            headers: {
                Authorization: LINEAR_API_KEY,
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ query, variables }),
        })

        if (!response.ok) {
            const text = await response.text()
            console.error(`[Linear] HTTP ${response.status}:`, text)
            return null
        }

        const json = (await response.json()) as LinearApiResponse<T>

        if (json.errors && json.errors.length > 0) {
            console.error('[Linear] GraphQL errors:', json.errors)
            return null
        }

        return json.data ?? null
    } catch (err) {
        console.error('[Linear] Error en fetch:', err)
        return null
    }
}

// ------------------------------------------------------------------
// Helper privado: obtener projectId de Linear para un proyecto de Aura
// ------------------------------------------------------------------

/**
 * Retorna el linear_project_id asociado a un proyecto de Aura.
 * Primero intenta leerlo de Supabase; si no existe, hace fallback
 * buscando en Linear por nombre del proyecto.
 */
async function resolveLinearProjectId(auraProjectId: string): Promise<string | null> {
    const supabase = await createClient()

    const { data: project, error } = await supabase
        .from('projects')
        .select('linear_project_id, linear_project_url, name')
        .eq('id', auraProjectId)
        .single()

    if (error || !project) {
        console.error('[Linear] No se encontró el proyecto en Aura:', error)
        return null
    }

    // 1. Si ya tenemos el ID guardado, úsalo directamente
    if ((project as any).linear_project_id) {
        return (project as any).linear_project_id as string
    }

    // 2. Fallback: buscar en Linear por nombre del proyecto
    const query = `
    query SearchProject($name: String!) {
      projects(filter: { name: { eq: $name } }) {
        nodes {
          id
          name
        }
      }
    }`

    const data = await linearRequest<{ projects: { nodes: Array<{ id: string; name: string }> } }>(
        query,
        { name: project.name }
    )

    const matched = data?.projects?.nodes?.[0]
    if (matched) {
        // Intentar persistir el ID para futuras llamadas (best-effort)
        await supabase
            .from('projects')
            .update({ linear_project_id: matched.id } as any)
            .eq('id', auraProjectId)
            .then(({ error: updErr }) => {
                if (updErr) {
                    // Columna probablemente no existe; ignorar silenciosamente
                    console.log('[Linear] linear_project_id no persistido (columna puede no existir)')
                }
            })
        return matched.id
    }

    console.warn('[Linear] No se encontró proyecto en Linear con nombre:', project.name)
    return null
}

// ------------------------------------------------------------------
// 1. createLinearProject
// ------------------------------------------------------------------

export interface CreateLinearProjectResult {
    success: boolean
    linearProjectId?: string
    linearProjectUrl?: string
    error?: string
}

/**
 * Crea un proyecto en Linear.app a partir de un proyecto de Aura OS.
 * Guarda `linear_project_url` (y opcionalmente `linear_project_id`) en Supabase.
 * Si Linear falla, retorna error pero NO bloquea el flujo de Aura.
 */
export async function createLinearProject(
    projectId: string
): Promise<CreateLinearProjectResult> {
    const supabase = await createClient()

    // 1.1 Leer proyecto de Aura
    const { data: project, error } = await supabase
        .from('projects')
        .select('id, code, name, description, status, budget_allocated, client_id')
        .eq('id', projectId)
        .single()

    if (error || !project) {
        const msg = `No se encontró el proyecto ${projectId} en Aura`
        console.error('[Linear]', msg, error)
        return { success: false, error: msg }
    }

    // 1.2 Leer cliente (para enriquecer descripción)
    let clientName = ''
    if (project.client_id) {
        const { data: client } = await supabase
            .from('clients')
            .select('razon_social')
            .eq('id', project.client_id)
            .single()
        if (client) clientName = client.razon_social
    }

    // 1.3 Preparar payload para Linear
    const linearName = `${project.code} | ${project.name}`
    const linearDescription = [
        project.description || '',
        clientName ? `Cliente: ${clientName}` : '',
        project.budget_allocated ? `Presupuesto: S/ ${project.budget_allocated}` : '',
    ]
        .filter(Boolean)
        .join(' \u2022 ')

    const input: Record<string, unknown> = {
        name: linearName,
        description: linearDescription || undefined,
        state: 'planned',
    }

    if (LINEAR_TEAM_ID) {
        input.teamIds = [LINEAR_TEAM_ID]
    }

    const mutation = `
    mutation CreateLinearProject($input: ProjectCreateInput!) {
      projectCreate(input: $input) {
        success
        project {
          id
          name
          url
          state
        }
      }
    }`

    // 1.4 Llamar a Linear
    const data = await linearRequest<{
        projectCreate: {
            success: boolean
            project: LinearProjectPayload
        }
    }>(mutation, { input })

    if (!data?.projectCreate?.success || !data.projectCreate.project) {
        const msg = 'Linear respondió sin éxito al crear el proyecto'
        console.error('[Linear]', msg, data)
        return { success: false, error: msg }
    }

    const created = data.projectCreate.project

    // 1.5 Persistir en Aura (best-effort: no bloquear si falla)
    const updatePayload: Record<string, unknown> = {
        linear_project_url: created.url,
    }
    // Intentar guardar también el ID interno de Linear (opcional)
    if (created.id) {
        ;(updatePayload as any).linear_project_id = created.id
    }

    const { error: updateError } = await supabase
        .from('projects')
        .update(updatePayload as any)
        .eq('id', projectId)

    if (updateError) {
        console.warn(
            '[Linear] No se pudo guardar linear_project_url/linear_project_id:',
            updateError.message
        )
    }

    console.log('[Linear] Proyecto creado:', created.url)
    return {
        success: true,
        linearProjectId: created.id,
        linearProjectUrl: created.url,
    }
}

// ------------------------------------------------------------------
// 2. syncPhaseToLinearIssue
// ------------------------------------------------------------------

export interface SyncPhaseResult {
    success: boolean
    issueUrl?: string
    issueIdentifier?: string
    error?: string
}

/**
 * Crea un Issue en Linear vinculado al proyecto de Linear correspondiente
 * a una fase de proyecto de Aura.
 */
export async function syncPhaseToLinearIssue(
    phaseId: string
): Promise<SyncPhaseResult> {
    const supabase = await createClient()

    // 2.1 Leer fase
    const { data: phase, error: phaseError } = await supabase
        .from('project_phases')
        .select('id, project_id, phase_name, phase_order, status, revision_limit, planned_start_date, planned_end_date')
        .eq('id', phaseId)
        .single()

    if (phaseError || !phase) {
        const msg = `No se encontró la fase ${phaseId} en Aura`
        console.error('[Linear]', msg, phaseError)
        return { success: false, error: msg }
    }

    // 2.2 Resolver linearProjectId del proyecto padre
    const linearProjectId = await resolveLinearProjectId(phase.project_id)
    if (!linearProjectId) {
        const msg = 'No se pudo resolver el projectId de Linear para esta fase'
        console.error('[Linear]', msg)
        return { success: false, error: msg }
    }

    // 2.3 Preparar payload
    const title = `Fase: ${phase.phase_name}`
    const description = [
        `Orden: ${phase.phase_order}`,
        `Revisiones permitidas: ${phase.revision_limit || 0}`,
        `Estado Aura: ${phase.status}`,
        phase.planned_start_date ? `Inicio planificado: ${phase.planned_start_date}` : '',
        phase.planned_end_date ? `Fin planificado: ${phase.planned_end_date}` : '',
    ]
        .filter(Boolean)
        .join(' \u2022 ')

    const input: Record<string, unknown> = {
        title,
        description,
        projectId: linearProjectId,
    }

    if (LINEAR_TEAM_ID) {
        input.teamId = LINEAR_TEAM_ID
    }

    const mutation = `
    mutation CreateLinearIssue($input: IssueCreateInput!) {
      issueCreate(input: $input) {
        success
        issue {
          id
          identifier
          url
          title
        }
      }
    }`

    // 2.4 Llamar a Linear
    const data = await linearRequest<{
        issueCreate: {
            success: boolean
            issue: LinearIssuePayload
        }
    }>(mutation, { input })

    if (!data?.issueCreate?.success || !data.issueCreate.issue) {
        const msg = 'Linear respondió sin éxito al crear el issue'
        console.error('[Linear]', msg, data)
        return { success: false, error: msg }
    }

    const created = data.issueCreate.issue
    console.log('[Linear] Issue creado:', created.identifier, created.url)

    return {
        success: true,
        issueUrl: created.url,
        issueIdentifier: created.identifier,
    }
}

// ------------------------------------------------------------------
// 3. updateLinearProjectStatus
// ------------------------------------------------------------------

export interface UpdateStatusResult {
    success: boolean
    error?: string
}

/**
 * Mapeo de estados Aura OS → Linear
 */
const AURA_TO_LINEAR_STATUS: Record<string, string> = {
    planning: 'planned',
    active: 'started',
    paused: 'paused',
    review: 'started',   // Linear no tiene "review" como estado de proyecto
    completed: 'completed',
    cancelled: 'canceled',
    maintenance: 'started',
}

/**
 * Actualiza el estado de un proyecto en Linear para reflejar
 * el estado actual del proyecto en Aura OS.
 */
export async function updateLinearProjectStatus(
    projectId: string,
    status: string
): Promise<UpdateStatusResult> {
    const linearState = AURA_TO_LINEAR_STATUS[status]
    if (!linearState) {
        const msg = `Estado de Aura "${status}" no tiene mapeo a Linear`
        console.warn('[Linear]', msg)
        return { success: false, error: msg }
    }

    const linearProjectId = await resolveLinearProjectId(projectId)
    if (!linearProjectId) {
        const msg = 'No se pudo resolver el projectId de Linear para actualizar estado'
        console.error('[Linear]', msg)
        return { success: false, error: msg }
    }

    const mutation = `
    mutation UpdateLinearProject($id: String!, $input: ProjectUpdateInput!) {
      projectUpdate(id: $id, input: $input) {
        success
        project {
          id
          state
        }
      }
    }`

    const data = await linearRequest<{
        projectUpdate: {
            success: boolean
            project: { id: string; state: string }
        }
    }>(mutation, { id: linearProjectId, input: { state: linearState } })

    if (!data?.projectUpdate?.success) {
        const msg = 'Linear respondió sin éxito al actualizar el estado'
        console.error('[Linear]', msg, data)
        return { success: false, error: msg }
    }

    console.log('[Linear] Estado actualizado:', data.projectUpdate.project.state)
    return { success: true }
}

// ------------------------------------------------------------------
// 4. getLinearProjectIssues
// ------------------------------------------------------------------

export interface LinearIssueViewModel {
    id: string
    identifier: string
    url: string
    title: string
    stateName: string
}

/**
 * Obtiene los issues asociados a un proyecto de Linear.
 * Útil para mostrar sincronización en la UI de Aura OS.
 */
export async function getLinearProjectIssues(
    linearProjectId: string
): Promise<LinearIssueViewModel[] | null> {
    const query = `
    query GetProjectIssues($projectId: String!) {
      issues(filter: { project: { id: { eq: $projectId } } }) {
        nodes {
          id
          identifier
          url
          title
          state {
            name
          }
        }
      }
    }`

    const data = await linearRequest<{
        issues: {
            nodes: Array<{
                id: string
                identifier: string
                url: string
                title: string
                state: { name: string }
            }>
        }
    }>(query, { projectId: linearProjectId })

    if (!data?.issues?.nodes) {
        console.warn('[Linear] No se pudieron obtener issues para proyecto:', linearProjectId)
        return null
    }

    return data.issues.nodes.map((issue) => ({
        id: issue.id,
        identifier: issue.identifier,
        url: issue.url,
        title: issue.title,
        stateName: issue.state?.name ?? 'Unknown',
    }))
}

// ------------------------------------------------------------------
// Helper privado: obtener o crear un label en Linear
// ------------------------------------------------------------------

async function getOrCreateLabel(name: string): Promise<string | null> {
    const query = `
    query GetLabel($name: String!) {
      issueLabels(filter: { name: { eq: $name } }) {
        nodes {
          id
          name
        }
      }
    }`

    const data = await linearRequest<{
        issueLabels: { nodes: Array<{ id: string; name: string }> }
    }>(query, { name })

    const existing = data?.issueLabels?.nodes?.[0]
    if (existing) return existing.id

    const mutation = `
    mutation CreateLabel($input: IssueLabelCreateInput!) {
      issueLabelCreate(input: $input) {
        success
        issueLabel {
          id
          name
        }
      }
    }`

    const created = await linearRequest<{
        issueLabelCreate: {
            success: boolean
            issueLabel: { id: string; name: string }
        }
    }>(mutation, { input: { name } })

    return created?.issueLabelCreate?.success ? created.issueLabelCreate.issueLabel.id : null
}

// ------------------------------------------------------------------
// 5. syncAllPhasesToLinear
// ------------------------------------------------------------------

export interface SyncAllPhasesResult {
    success: boolean
    createdCount?: number
    error?: string
}

/**
 * Crea un Issue en Linear por cada fase del proyecto de Aura.
 * Requiere que el proyecto ya esté vinculado a Linear.
 * Asigna label "fase:{phase_key}" a cada issue.
 */
export async function syncAllPhasesToLinear(
    projectId: string
): Promise<SyncAllPhasesResult> {
    const supabase = await createClient()

    // 5.1 Leer proyecto
    const { data: project, error: projError } = await supabase
        .from('projects')
        .select('id, code, name')
        .eq('id', projectId)
        .single()

    if (projError || !project) {
        return { success: false, error: 'Proyecto no encontrado' }
    }

    // 5.2 Resolver linearProjectId
    const linearProjectId = await resolveLinearProjectId(projectId)
    if (!linearProjectId) {
        return { success: false, error: 'El proyecto no está vinculado a Linear' }
    }

    // 5.3 Leer fases
    const { data: phases, error: phasesError } = await supabase
        .from('project_phases')
        .select('id, phase_name, phase_key')
        .eq('project_id', projectId)
        .order('phase_order', { ascending: true })

    if (phasesError) {
        console.error('[Linear] Error fetching phases:', phasesError)
        return { success: false, error: phasesError.message }
    }

    if (!phases || phases.length === 0) {
        return { success: false, error: 'No hay fases para sincronizar' }
    }

    // 5.4 Crear issue por cada fase
    let createdCount = 0
    const errors: string[] = []

    for (const phase of phases) {
        const labelName = `fase:${phase.phase_key}`
        const labelId = await getOrCreateLabel(labelName)

        const input: Record<string, unknown> = {
            title: `Fase: ${phase.phase_name}`,
            description: `Proyecto Aura: ${project.code}`,
            projectId: linearProjectId,
        }

        if (labelId) {
            input.labelIds = [labelId]
        }

        if (LINEAR_TEAM_ID) {
            input.teamId = LINEAR_TEAM_ID
        }

        const mutation = `
        mutation CreateLinearIssue($input: IssueCreateInput!) {
          issueCreate(input: $input) {
            success
            issue {
              id
              identifier
              url
              title
            }
          }
        }`

        const data = await linearRequest<{
            issueCreate: {
                success: boolean
                issue: LinearIssuePayload
            }
        }>(mutation, { input })

        if (data?.issueCreate?.success && data.issueCreate.issue) {
            createdCount++
        } else {
            errors.push(`Fase "${phase.phase_name}": ${data?.issueCreate ? 'Error desconocido' : 'Sin respuesta'}`)
        }
    }

    if (createdCount === 0) {
        return {
            success: false,
            error: `No se pudo crear ningún issue. ${errors.join('; ')}`,
        }
    }

    console.log(`[Linear] ${createdCount}/${phases.length} issues creados`)
    return {
        success: true,
        createdCount,
    }
}
