'use server'

import { createClient } from '@/utils/supabase/server'
import { revalidatePath } from 'next/cache'
import { Opportunity, Project, ProjectPhase } from '@/types'
import { createLinearProject, syncAllPhasesToLinear } from '@/lib/linearService'

// ------------------------------------------------------------------
// Tipos de entrada / salida
// ------------------------------------------------------------------

interface PhasePlanItem {
    phase_key: string
    phase_name: string
    phase_order: number
    duration_days: number
    revision_limit: number
    planned_start_date: string
    planned_end_date: string
    requires_client_approval: boolean
}

export interface CreateProjectInput {
    opportunityId: string
    name: string
    kickoffDate: string
    leadDevId?: string | null
    projectManagerId?: string | null
}

// ------------------------------------------------------------------
// 1. Leads disponibles para convertir en proyecto
// ------------------------------------------------------------------

export async function getAvailableLeads(): Promise<{
    success: boolean
    data?: Opportunity[]
    error?: string
}> {
    const supabase = await createClient()

    const { data, error } = await supabase
        .from('opportunities')
        .select('*, client:clients(*)')
        .in('status', ['approved', 'in_progress', 'won'])
        .order('created_at', { ascending: false })

    if (error) {
        console.error('Error fetching available leads:', error)
        return { success: false, error: error.message }
    }

    return { success: true, data: data || [] }
}

// ------------------------------------------------------------------
// 2. Perfiles del equipo (para asignar Lead Dev / PM)
// ------------------------------------------------------------------

export async function getProfiles(): Promise<{
    success: boolean
    data?: Array<{ id: string; full_name: string; role: string }>
    error?: string
}> {
    const supabase = await createClient()

    const { data, error } = await supabase
        .from('profiles')
        .select('id, full_name, role')
        .order('full_name', { ascending: true })

    if (error) {
        console.error('Error fetching profiles:', error)
        return { success: false, error: error.message }
    }

    return { success: true, data: data || [] }
}

// ------------------------------------------------------------------
// 3. Generar código secuencial AURA-DEV-XXX
// ------------------------------------------------------------------

export async function getNextProjectCode(): Promise<{
    success: boolean
    code?: string
    error?: string
}> {
    const supabase = await createClient()

    const { data, error } = await supabase
        .from('projects')
        .select('code')
        .ilike('code', 'AURA-DEV-%')
        .order('code', { ascending: false })
        .limit(1)

    if (error) {
        console.error('Error fetching last project code:', error)
        return { success: false, error: error.message }
    }

    let nextNumber = 1
    if (data && data.length > 0 && data[0].code) {
        const match = data[0].code.match(/AURA-DEV-(\d+)/)
        if (match) {
            nextNumber = parseInt(match[1], 10) + 1
        }
    }

    const code = `AURA-DEV-${String(nextNumber).padStart(3, '0')}`
    return { success: true, code }
}

// ------------------------------------------------------------------
// 4. Crear proyecto completo desde lead
// ------------------------------------------------------------------

export async function createProjectFromLead(
    input: CreateProjectInput
): Promise<{
    success: boolean
    project?: Project
    error?: string
}> {
    const supabase = await createClient()

    // 4.1 Validar lead
    const { data: lead, error: leadError } = await supabase
        .from('opportunities')
        .select('*, client:clients(*)')
        .eq('id', input.opportunityId)
        .single()

    if (leadError || !lead) {
        return { success: false, error: 'Lead no encontrado' }
    }

    const phasesPlan: PhasePlanItem[] = Array.isArray(lead.phases_plan_jsonb)
        ? lead.phases_plan_jsonb
        : []

    if (phasesPlan.length === 0) {
        return { success: false, error: 'El lead no tiene un roadmap configurado' }
    }

    // 4.2 Generar código
    const codeResult = await getNextProjectCode()
    if (!codeResult.success || !codeResult.code) {
        return { success: false, error: codeResult.error || 'No se pudo generar el código del proyecto' }
    }
    const projectCode = codeResult.code

    // 4.3 Calcular fechas de fases desde kickoff_date
    const kickoff = new Date(input.kickoffDate)
    let cursor = new Date(kickoff)

    const computedPhases: Array<{
        phase_key: string
        phase_name: string
        phase_order: number
        planned_start_date: string
        planned_end_date: string
        status: ProjectPhase['status']
        revision_limit: number
    }> = phasesPlan.map((phase, index) => {
        const start = new Date(cursor)
        const end = new Date(cursor)
        // duration_days = 1 significa que ocupa 1 día (start === end)
        end.setDate(end.getDate() + (phase.duration_days || 1) - 1)

        // siguiente fase empieza al día siguiente
        cursor = new Date(end)
        cursor.setDate(cursor.getDate() + 1)

        return {
            phase_key: phase.phase_key,
            phase_name: phase.phase_name,
            phase_order: phase.phase_order,
            planned_start_date: start.toISOString().split('T')[0],
            planned_end_date: end.toISOString().split('T')[0],
            status: index === 0 ? 'in_progress' : 'pending',
            revision_limit: phase.revision_limit || 0,
        }
    })

    const deadlineDate = computedPhases[computedPhases.length - 1].planned_end_date

    // 4.4 Insertar proyecto
    const contractAmount = lead.draft_jsonb?.totalCalculated || 0

    const { data: newProject, error: projectError } = await supabase
        .from('projects')
        .insert({
            project_type: 'develop',
            opportunity_id: lead.id,
            product_project_id: null,
            code: projectCode,
            name: input.name,
            description: null,
            client_id: lead.client_id,
            status: 'planning',
            phase_template_id: lead.phase_template_id || null,
            kickoff_date: input.kickoffDate,
            deadline_date: deadlineDate,
            lead_dev_id: input.leadDevId || null,
            project_manager_id: input.projectManagerId || null,
            budget_allocated: contractAmount,
            budget_consumed: 0,
            portal_view_mode: 'execution',
            contract_amount: contractAmount,
            amount_paid: 0,
            amount_pending: contractAmount,
        })
        .select()
        .single()

    if (projectError || !newProject) {
        console.error('Error creating project:', projectError)
        return { success: false, error: projectError?.message || 'Error creando proyecto' }
    }

    // 4.5 Insertar fases
    const phasesToInsert = computedPhases.map((p) => ({
        ...p,
        project_id: newProject.id,
        deliverables: [],
    }))

    const { error: phasesError } = await supabase
        .from('project_phases')
        .insert(phasesToInsert)

    if (phasesError) {
        console.error('Error creating project phases:', phasesError)
        return {
            success: false,
            error: `Proyecto creado pero error en fases: ${phasesError.message}`,
        }
    }

    // 4.6 Actualizar lead a estado convertido y vincular proyecto
    const { error: updateLeadError } = await supabase
        .from('opportunities')
        .update({
            status: 'converted',
            project_converted_id: newProject.id,
            updated_at: new Date().toISOString(),
        })
        .eq('id', lead.id)

    if (updateLeadError) {
        console.error('Error updating lead status:', updateLeadError)
    }

    revalidatePath('/desarrollo/proyectos')
    revalidatePath('/desarrollo/leads')

    // 4.7 Sincronizar con Linear (fire-and-forget para no bloquear)
    createLinearProject(newProject.id)
        .then(() => {
            // Después de crear el proyecto en Linear, crear issues por fase
            return syncAllPhasesToLinear(newProject.id)
        })
        .catch((err) => {
            console.error('[Linear] Error en background sync:', err)
        })

    return { success: true, project: newProject }
}

// ------------------------------------------------------------------
// 5. Actualizar proyecto
// ------------------------------------------------------------------

export async function updateProject(
    projectId: string,
    input: Partial<{
        name: string
        description: string
        status: Project['status']
        kickoff_date: string | null
        deadline_date: string | null
        lead_dev_id: string | null
        project_manager_id: string | null
        linear_project_url: string | null
        staging_url: string | null
    }>
): Promise<{ success: boolean; error?: string }> {
    const supabase = await createClient()

    const { error } = await supabase
        .from('projects')
        .update(input)
        .eq('id', projectId)

    if (error) {
        console.error('Error updating project:', error)
        return { success: false, error: error.message }
    }

    revalidatePath('/desarrollo/proyectos')
    return { success: true }
}
