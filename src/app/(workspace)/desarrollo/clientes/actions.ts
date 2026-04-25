'use server'

import { ClientRepository } from '@/lib/repositories/ClientRepository'
import { NewClient } from '@/types'
import { revalidatePath } from 'next/cache'

export async function createClientAction(data: NewClient) {
    const { error } = await ClientRepository.create(data)

    if (!error) {
        revalidatePath('/desarrollo/clientes')
        return { success: true }
    }

    return { success: false, error: error.message }
}
