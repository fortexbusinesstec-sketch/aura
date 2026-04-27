'use server'

import { ProductRepository } from '@/lib/repositories/ProductRepository'
import { ProductProject, ProductDocumentation } from '@/types'
import { revalidatePath } from 'next/cache'
export async function createProductDocumentationAction(data: Partial<ProductDocumentation>) {
    const result = await ProductRepository.createDocumentation(data)

    if (result) {
        revalidatePath(`/producto/${data.product_id}`)
        return { success: true, data: result }
    }

    return { success: false, data: null }
}

export async function getProductProjectsAction(): Promise<ProductProject[]> {
    return ProductRepository.getAll()
}

export async function getProductProjectByIdAction(id: string): Promise<ProductProject | null> {
    return ProductRepository.getById(id)
}

export async function createProductProjectAction(data: Partial<ProductProject>) {
    const result = await ProductRepository.create(data)

    if (result) {
        revalidatePath('/producto')
        return { success: true, data: result }
    }

    return { success: false, data: null }
}

export async function updateProductProjectAction(id: string, data: Partial<ProductProject>) {
    const result = await ProductRepository.update(id, data)

    if (result) {
        revalidatePath('/producto')
        return { success: true, data: result }
    }

    return { success: false, data: null }
}

export async function getProductDocumentationAction(productId: string) {
    return ProductRepository.getDocumentation(productId)
}
