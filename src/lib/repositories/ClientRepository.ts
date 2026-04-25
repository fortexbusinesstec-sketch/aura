import { createClient } from '@/utils/supabase/server'
import { Client, NewClient } from '@/types'

import { PostgrestError } from '@supabase/supabase-js'

export const ClientRepository = {
    async getAll(): Promise<Client[]> {
        const supabase = await createClient()
        const { data, error } = await supabase
            .from('clients')
            .select('*')
            .order('created_at', { ascending: false })

        if (error) {
            console.error('Error fetching clients:', error)
            return []
        }

        return data as Client[]
    },

    async create(client: NewClient): Promise<{ data: Client | null; error: PostgrestError | null }> {
        const supabase = await createClient()
        const { data, error } = await supabase
            .from('clients')
            .insert([client])
            .select()
            .single()

        return { data, error }
    }
}
