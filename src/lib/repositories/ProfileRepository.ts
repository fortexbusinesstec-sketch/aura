import { createClient } from '@/utils/supabase/server'

export interface Profile {
    id: string
    full_name: string
    role: 'architect' | 'admin'
    avatar_url: string | null
    preferred_theme_slug?: string | null
}

export const ProfileRepository = {
    async getCurrent(): Promise<Profile | null> {
        const supabase = await createClient()

        const { data: { user } } = await supabase.auth.getUser()
        if (!user) return null

        const { data, error } = await supabase
            .from('profiles')
            .select('*')
            .eq('id', user.id)
            .single()

        if (error) {
            console.error('Error fetching profile:', error)
            return null
        }

        return data as Profile
    }
}
