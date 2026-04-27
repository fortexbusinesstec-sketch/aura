import { createClient } from '@/utils/supabase/server'
import { Client } from '@/types'

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

    async create(client: Omit<Client, 'id' | 'created_at'>): Promise<{ data: Client | null; error: PostgrestError | null }> {
        const supabase = await createClient()
        const { data, error } = await supabase
            .from('clients')
            .insert([client])
            .select()
            .single()

        return { data, error }
    },

    async getById(id: string): Promise<Client | null> {
        const supabase = await createClient()
        const { data, error } = await supabase
            .from('clients')
            .select('*')
            .eq('id', id)
            .single()

        if (error) {
            console.error('Error fetching client:', error)
            return null
        }

        return data as Client
    },

    async update(id: string, updates: Partial<Client>): Promise<{ data: Client | null, error: PostgrestError | null }> {
        const supabase = await createClient()
        const { data, error } = await supabase
            .from('clients')
            .update(updates)
            .eq('id', id)
            .select()
            .single()

        return { data, error }
    }
}
