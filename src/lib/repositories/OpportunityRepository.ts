import { createClient } from '@/utils/supabase/server'
import { Opportunity, NewOpportunity } from '@/types'
import { PostgrestError } from '@supabase/supabase-js'
import { generatePinCode } from '@/lib/portalTokens'

export const OpportunityRepository = {
    async getAll(): Promise<Opportunity[]> {
        const supabase = await createClient()
        const { data, error } = await supabase
            .from('opportunities')
            .select(`
                *,
                client:clients(*)
            `)
            .order('created_at', { ascending: false })

        if (error) {
            console.error('Error fetching opportunities:', error)
            return []
        }

        return data as Opportunity[]
    },

    async getById(id: string): Promise<Opportunity | null> {
        const supabase = await createClient()
        const { data, error } = await supabase
            .from('opportunities')
            .select(`
                *,
                client:clients(*)
            `)
            .eq('id', id)
            .single()

        if (error) {
            console.error('Error fetching opportunity:', error)
            return null
        }

        return data as Opportunity
    },

    async create(opportunity: NewOpportunity): Promise<{ data: Opportunity | null; error: PostgrestError | null }> {
        const supabase = await createClient()

        // Generar automáticamente portal_token y pin_code si no se proporcionan
        const enrichedOpportunity = {
            ...opportunity,
            pin_code: opportunity.pin_code || generatePinCode(),
        }

        const { data, error } = await supabase
            .from('opportunities')
            .insert([enrichedOpportunity])
            .select()
            .single()

        return { data, error }
    },

    async update(id: string, updates: Partial<Opportunity>): Promise<{ data: Opportunity | null; error: PostgrestError | null }> {
        const supabase = await createClient()
        const { data, error } = await supabase
            .from('opportunities')
            .update({ ...updates, updated_at: new Date().toISOString() })
            .eq('id', id)
            .select()
            .single()

        return { data, error }
    },

    async getByClientId(clientId: string): Promise<Opportunity[]> {
        const supabase = await createClient()
        const { data, error } = await supabase
            .from('opportunities')
            .select('*')
            .eq('client_id', clientId)
            .order('created_at', { ascending: false })

        if (error) {
            console.error('Error fetching opportunities by clientId:', error)
            return []
        }

        return data as Opportunity[]
    }
}
