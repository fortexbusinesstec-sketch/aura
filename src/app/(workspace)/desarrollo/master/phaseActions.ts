'use server'

import { PhaseTemplateRepository } from '@/lib/repositories/PhaseTemplateRepository'
import { NewPhaseTemplate, PhaseTemplate } from '@/types'
import { revalidatePath } from 'next/cache'

export async function createPhaseTemplate(data: NewPhaseTemplate) {
    // Si es default, desmarcar las demás del mismo tipo primero
    if (data.is_default) {
        await PhaseTemplateRepository.unsetDefaultByProjectType(data.project_type)
    }

    const { data: created, error } = await PhaseTemplateRepository.create(data)

    if (!error && created) {
        revalidatePath('/desarrollo/master')
        return { success: true, id: created.id }
    }

    return { success: false, error: error?.message || 'Error desconocido' }
}

export async function updatePhaseTemplate(id: string, data: Partial<NewPhaseTemplate>) {
    // Si se está marcando como default, desmarcar las demás del mismo tipo
    if (data.is_default && data.project_type) {
        await PhaseTemplateRepository.unsetDefaultByProjectType(data.project_type, id)
    }

    const { error } = await PhaseTemplateRepository.update(id, data)

    if (!error) {
        revalidatePath('/desarrollo/master')
        return { success: true }
    }

    return { success: false, error: error.message }
}

export async function deletePhaseTemplate(id: string) {
    const { error } = await PhaseTemplateRepository.delete(id)

    if (!error) {
        revalidatePath('/desarrollo/master')
        return { success: true }
    }

    return { success: false, error: error.message }
}
