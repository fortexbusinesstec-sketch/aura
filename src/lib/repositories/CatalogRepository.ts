import { createClient } from '@/utils/supabase/server'
import { CatalogItem, NewCatalogItem } from '@/types'

import { PostgrestError } from '@supabase/supabase-js'

export const CatalogRepository = {
    async getAll(): Promise<CatalogItem[]> {
        const supabase = await createClient()
        const { data, error } = await supabase
            .from('catalog_items')
            .select('*')
            .order('category', { ascending: true })

        if (error) {
            console.error('Error fetching catalog items:', error)
            return []
        }

        return data as CatalogItem[]
    },

    async create(item: NewCatalogItem): Promise<{ data: CatalogItem | null; error: PostgrestError | null }> {
        const supabase = await createClient()
        const { data, error } = await supabase
            .from('catalog_items')
            .insert([item])
            .select()
            .single()

        return { data, error }
    }
}
