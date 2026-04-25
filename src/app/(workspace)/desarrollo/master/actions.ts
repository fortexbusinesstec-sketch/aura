'use server'

import { CatalogRepository } from '@/lib/repositories/CatalogRepository'
import { NewCatalogItem } from '@/types'
import { revalidatePath } from 'next/cache'

export async function createCatalogItem(data: NewCatalogItem) {
    const { error } = await CatalogRepository.create(data)

    if (!error) {
        revalidatePath('/desarrollo/master')
        return { success: true }
    }

    return { success: false, error: error.message }
}
