'use server'

import { ClientRepository } from '@/lib/repositories/ClientRepository'
import { Client } from '@/types'
import { revalidatePath } from 'next/cache'

export async function updateClientAction(id: string, updates: Partial<Client>) {
    const { data, error } = await ClientRepository.update(id, updates)

    if (!error) {
        revalidatePath(`/desarrollo/clientes/${id}`)
        revalidatePath('/desarrollo/clientes')
        return { success: true, data }
    }

    return { success: false, error: error.message }
}

export async function convertCompetitorAction(newClientData: Omit<Client, 'id' | 'created_at'>) {
    const { data, error } = await ClientRepository.create(newClientData)

    if (!error && data) {
        revalidatePath('/desarrollo/clientes')
        return { success: true, data }
    }

    return { success: false, error: error?.message || 'Error desconocido' }
}
