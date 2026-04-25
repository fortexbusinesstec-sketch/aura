import { cookies } from 'next/headers'
import { ProfileRepository } from '@/lib/repositories/ProfileRepository'
import { EcosystemSelector } from '@/components/dashboard/EcosystemSelector'
import { UserMenu } from '@/components/dashboard/UserMenu'

export async function Header() {
    const cookieStore = await cookies()
    const lang = (cookieStore.get('aura-lang')?.value as 'es' | 'en') || 'es'
    const profile = await ProfileRepository.getCurrent()
    const firstName = profile?.full_name?.split(' ')[0] || 'Usuario'

    return (
        <header className="sticky top-0 z-50 w-full border-b border-border/30 bg-background/80 backdrop-blur-md">
            <div className="container mx-auto flex h-20 items-center justify-between px-6">
                <div className="flex items-center gap-6">
                    <h2 className="text-xl font-medium text-foreground/80">
                        Bienvenido, <span className="font-bold text-foreground">{firstName}</span>
                    </h2>

                    <div className="h-6 w-px bg-border/40" />

                    <EcosystemSelector />
                </div>

                <div className="flex items-center gap-4">
                    <UserMenu firstName={firstName} initialLang={lang} />
                </div>
            </div>
        </header>
    )
}
