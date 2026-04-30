'use server'

import { createClient } from '@/utils/supabase/server'
import { revalidatePath } from 'next/cache'
import { createProjectFromLead } from '../proyectos/actions'

interface RoadmapPhase {
    phase_key: string
    phase_name: string
    phase_order: number
    duration_days: number
    revision_limit: number
    planned_start_date: string
    planned_end_date: string
    requires_client_approval: boolean
    status: 'pending' | 'in_progress' | 'in_review' | 'completed' | 'approved'
}

interface SaveRoadmapInput {
    opportunityId: string
    templateId: string
    phases: RoadmapPhase[]
}

export async function saveLeadRoadmapConfig(input: SaveRoadmapInput) {
    const supabase = await createClient()

    // Verify opportunity exists
    const { data: opp, error: oppError } = await supabase
        .from('opportunities')
        .select('id, client_id, status')
        .eq('id', input.opportunityId)
        .single()

    if (oppError || !opp) {
        return { success: false, error: 'Lead no encontrado' }
    }

    // Calculate total days from phases
    const totalDays = input.phases.reduce((sum, p) => sum + (p.duration_days || 0), 0)
    const kickoffDate = input.phases[0]?.planned_start_date || null
    const deadlineDate = input.phases[input.phases.length - 1]?.planned_end_date || null

    // Update opportunity with roadmap configuration
    const { data: updatedOpp, error: updateError } = await supabase
        .from('opportunities')
        .update({
            phase_template_id: input.templateId,
            phases_plan_jsonb: input.phases,
            roadmap_configured: true,
            delivery_time_text: `${totalDays} días`,
            updated_at: new Date().toISOString(),
        })
        .eq('id', input.opportunityId)
        .select()
        .single()

    if (updateError || !updatedOpp) {
        return { success: false, error: updateError?.message || 'Error guardando configuración de fases' }
    }

    revalidatePath('/desarrollo/leads')
    revalidatePath(`/desarrollo/leads/${input.opportunityId}`)

    return { success: true, opportunity: updatedOpp }
}


// ------------------------------------------------------------------
// 2. Convertir lead a proyecto (flujo automático desde lista de leads)
// ------------------------------------------------------------------

export async function convertLeadToProject(
    opportunityId: string
): Promise<{ success: boolean; projectId?: string; error?: string }> {
    const supabase = await createClient()

    // 2.1 Validar lead
    const { data: lead, error: leadError } = await supabase
        .from('opportunities')
        .select('*, client:clients(*)')
        .eq('id', opportunityId)
        .single()

    if (leadError || !lead) {
        return { success: false, error: 'Lead no encontrado' }
    }

    // 2.2 Validar que sea convertible
    const convertibleStatuses = ['approved', 'contract_signed', 'paid']
    if (!convertibleStatuses.includes(lead.status)) {
        return { success: false, error: 'El lead no está en estado convertible' }
    }

    if (lead.project_converted_id) {
        return { success: false, error: 'Este lead ya fue convertido a proyecto' }
    }

    if (!Array.isArray(lead.phases_plan_jsonb) || lead.phases_plan_jsonb.length === 0) {
        return { success: false, error: 'El lead no tiene un roadmap configurado' }
    }

    // 2.3 Preparar datos automáticos
    const clientName = lead.client?.razon_social || 'Cliente'
    const projectName = `Proyecto Web - ${clientName}`
    const kickoffDate = new Date().toISOString().split('T')[0]

    // 2.4 Llamar a la creación de proyecto
    const result = await createProjectFromLead({
        opportunityId: lead.id,
        name: projectName,
        kickoffDate,
        leadDevId: null,
        projectManagerId: null,
    })

    if (!result.success || !result.project) {
        return { success: false, error: result.error || 'Error creando proyecto' }
    }

    revalidatePath('/desarrollo/leads')
    revalidatePath('/desarrollo/proyectos')

    return { success: true, projectId: result.project.id }
}
