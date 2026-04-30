import { createClient } from '@/utils/supabase/server'
import { PhaseTemplate, NewPhaseTemplate } from '@/types'
import { PostgrestError } from '@supabase/supabase-js'

export const PhaseTemplateRepository = {
    async getAll(): Promise<PhaseTemplate[]> {
        const supabase = await createClient()
        const { data, error } = await supabase
            .from('phase_templates')
            .select('*')
            .order('created_at', { ascending: false })

        if (error) {
            console.error('Error fetching phase templates:', error)
            return []
        }

        return (data || []).map(item => ({
            ...item,
            phases_definition: item.phases_definition || [],
        })) as PhaseTemplate[]
    },

    async getByProjectType(projectType: 'develop' | 'product'): Promise<PhaseTemplate[]> {
        const supabase = await createClient()
        const { data, error } = await supabase
            .from('phase_templates')
            .select('*')
            .eq('project_type', projectType)
            .order('created_at', { ascending: false })

        if (error) {
            console.error('Error fetching phase templates by type:', error)
            return []
        }

        return (data || []).map(item => ({
            ...item,
            phases_definition: item.phases_definition || [],
        })) as PhaseTemplate[]
    },

    async create(template: NewPhaseTemplate): Promise<{ data: PhaseTemplate | null; error: PostgrestError | null }> {
        const supabase = await createClient()
        const { data, error } = await supabase
            .from('phase_templates')
            .insert([template])
            .select()
            .single()

        return { data, error }
    },

    async update(id: string, template: Partial<NewPhaseTemplate>): Promise<{ data: PhaseTemplate | null; error: PostgrestError | null }> {
        const supabase = await createClient()
        const { data, error } = await supabase
            .from('phase_templates')
            .update(template)
            .eq('id', id)
            .select()
            .single()

        return { data, error }
    },

    async delete(id: string): Promise<{ error: PostgrestError | null }> {
        const supabase = await createClient()
        const { error } = await supabase
            .from('phase_templates')
            .delete()
            .eq('id', id)

        return { error }
    },

    async unsetDefaultByProjectType(projectType: 'develop' | 'product', excludeId?: string): Promise<{ error: PostgrestError | null }> {
        const supabase = await createClient()
        let query = supabase
            .from('phase_templates')
            .update({ is_default: false })
            .eq('project_type', projectType)
            .eq('is_default', true)

        if (excludeId) {
            query = query.neq('id', excludeId)
        }

        const { error } = await query

        return { error }
    },
}
