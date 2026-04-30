'use server'

import { createClient } from '@/utils/supabase/server'
import { revalidatePath } from 'next/cache'
import { ProjectStatus } from '@/types'
import { createLinearProject, syncAllPhasesToLinear } from '@/lib/linearService'

// ------------------------------------------------------------------
// Tipos
// ------------------------------------------------------------------

export type PhaseStatusAction =
    | 'start'
    | 'send_to_client'
    | 'approve_internal'
    | 'complete'
    | 'block'
    | 'unblock'

interface DeliverableItem {
    name: string
    url: string
    type: string
    uploaded_by?: string
    uploaded_at?: string
}

// ------------------------------------------------------------------
// 1. Actualizar estado de una fase
// ------------------------------------------------------------------

export async function updatePhaseStatus(
    phaseId: string,
    action: PhaseStatusAction,
    delayReason?: string
): Promise<{ success: boolean; error?: string }> {
    const supabase = await createClient()

    // Leer fase actual
    const { data: phase, error: fetchError } = await supabase
        .from('project_phases')
        .select('id, status, project_id')
        .eq('id', phaseId)
        .single()

    if (fetchError || !phase) {
        return { success: false, error: 'Fase no encontrada' }
    }

    const statusMap: Record<PhaseStatusAction, string> = {
        start: 'in_progress',
        send_to_client: 'client_review',
        approve_internal: 'approved',
        complete: 'completed',
        block: 'blocked',
        unblock: 'in_progress',
    }

    const newStatus = statusMap[action]
    if (!newStatus) {
        return { success: false, error: 'Acción no válida' }
    }

    const updatePayload: Record<string, unknown> = {
        status: newStatus,
        updated_at: new Date().toISOString(),
    }

    if (action === 'start') {
        updatePayload.actual_start_date = new Date().toISOString().split('T')[0]
    }

    if (action === 'complete') {
        updatePayload.actual_end_date = new Date().toISOString().split('T')[0]
    }

    if (action === 'block' && delayReason) {
        updatePayload.delay_reason = delayReason
    }

    if (action === 'unblock') {
        updatePayload.delay_reason = null
    }

    const { error } = await supabase
        .from('project_phases')
        .update(updatePayload)
        .eq('id', phaseId)

    if (error) {
        console.error('Error updating phase:', error)
        return { success: false, error: error.message }
    }

    revalidatePath(`/proyectos/${phase.project_id}`)
    return { success: true }
}

// ------------------------------------------------------------------
// 5. Conectar proyecto a Linear
// ------------------------------------------------------------------

export async function connectLinearProject(
    projectId: string
): Promise<{ success: boolean; linearProjectUrl?: string; error?: string }> {
    const result = await createLinearProject(projectId)
    if (result.success && result.linearProjectUrl) {
        revalidatePath(`/proyectos/${projectId}`)
    }
    return result
}

// ------------------------------------------------------------------
// 6. Crear issues en Linear desde fases del proyecto
// ------------------------------------------------------------------

export async function createIssuesFromPhases(
    projectId: string
): Promise<{ success: boolean; createdCount?: number; error?: string }> {
    const result = await syncAllPhasesToLinear(projectId)
    if (result.success) {
        revalidatePath(`/proyectos/${projectId}`)
    }
    return result
}

// ------------------------------------------------------------------
// 2. Subir entregable a una fase
// ------------------------------------------------------------------

export async function addDeliverable(
    phaseId: string,
    deliverable: DeliverableItem
): Promise<{ success: boolean; error?: string }> {
    const supabase = await createClient()

    const { data: phase, error: fetchError } = await supabase
        .from('project_phases')
        .select('id, project_id, deliverables')
        .eq('id', phaseId)
        .single()

    if (fetchError || !phase) {
        return { success: false, error: 'Fase no encontrada' }
    }

    const current: DeliverableItem[] = Array.isArray(phase.deliverables)
        ? phase.deliverables
        : []

    const enriched = {
        ...deliverable,
        uploaded_at: new Date().toISOString(),
    }

    const { error } = await supabase
        .from('project_phases')
        .update({
            deliverables: [...current, enriched],
            updated_at: new Date().toISOString(),
        })
        .eq('id', phaseId)

    if (error) {
        console.error('Error adding deliverable:', error)
        return { success: false, error: error.message }
    }

    revalidatePath(`/proyectos/${phase.project_id}`)
    return { success: true }
}

// ------------------------------------------------------------------
// 3. Actualizar estado macro del proyecto
// ------------------------------------------------------------------

export async function updateProjectStatus(
    projectId: string,
    status: ProjectStatus
): Promise<{ success: boolean; error?: string }> {
    const supabase = await createClient()

    const { error } = await supabase
        .from('projects')
        .update({
            status,
            updated_at: new Date().toISOString(),
        })
        .eq('id', projectId)

    if (error) {
        console.error('Error updating project status:', error)
        return { success: false, error: error.message }
    }

    revalidatePath(`/proyectos/${projectId}`)
    revalidatePath('/proyectos')
    return { success: true }
}

// ------------------------------------------------------------------
// 4. Guardar notas visibles para el cliente
// ------------------------------------------------------------------

export async function updatePhaseClientNotes(
    phaseId: string,
    notes: string
): Promise<{ success: boolean; error?: string }> {
    const supabase = await createClient()

    const { data: phase, error: fetchError } = await supabase
        .from('project_phases')
        .select('id, project_id')
        .eq('id', phaseId)
        .single()

    if (fetchError || !phase) {
        return { success: false, error: 'Fase no encontrada' }
    }

    const { error } = await supabase
        .from('project_phases')
        .update({
            client_visible_notes: notes,
            updated_at: new Date().toISOString(),
        })
        .eq('id', phaseId)

    if (error) {
        return { success: false, error: error.message }
    }

    revalidatePath(`/proyectos/${phase.project_id}`)
    return { success: true }
}
