'use server'

import { ClientRepository } from '@/lib/repositories/ClientRepository'
import { NewClient } from '@/types'
import { revalidatePath } from 'next/cache'

export async function createClientAction(data: NewClient) {
    const payload = {
        ...data,
        portal_token: crypto.randomUUID(),
        pin_code: null,
    }

    const { error } = await ClientRepository.create(payload)

    if (!error) {
        revalidatePath('/desarrollo/clientes')
        return { success: true }
    }

    return { success: false, error: error.message }
}
