'use server'

import { createClient } from '@/utils/supabase/server'

export type AuthResult = {
    error: string | null
    success: boolean
}

export async function login(prevState: AuthResult | null, formData: FormData): Promise<AuthResult> {
    const email = formData.get('email') as string
    const password = formData.get('password') as string
    const supabase = await createClient()

    const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
    })

    if (error) {
        let message = 'Error inesperado en el núcleo.'

        if (error.message.includes('Invalid login credentials')) {
            message = 'El correo o la contraseña son incorrectos.'
        } else if (error.status === 400 && error.message.includes('email')) {
            message = 'Ingresa un formato de correo válido.'
        } else if (error.message.toLowerCase().includes('timeout') || error.message.toLowerCase().includes('fetch')) {
            message = 'Error de conexión con el núcleo. Intenta de nuevo.'
        } else {
            message = error.message // Fallback to raw message if not mapped
        }

        return { error: message, success: false }
    }

    return { error: null, success: true }
}
