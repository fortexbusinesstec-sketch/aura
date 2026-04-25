'use client'

import { useState } from 'react'
import { LogOut, Check } from 'lucide-react'
import { logout } from '@/app/login/logout_action'
import { useRouter } from 'next/navigation'

const DICT = {
    es: {
        account: 'Cuenta',
        language: 'Idioma',
        logout: 'Salir del Sistema'
    },
    en: {
        account: 'Account',
        language: 'Language',
        logout: 'Sign Out'
    }
}

export function UserMenu({ firstName, initialLang = 'es' }: { firstName: string, initialLang?: 'es' | 'en' }) {
    const router = useRouter()
    const [isOpen, setIsOpen] = useState(false)
    const [lang, setLang] = useState<'es' | 'en'>(initialLang)

    const t = DICT[lang]

    const changeLang = (newLang: 'es' | 'en') => {
        setLang(newLang)
        document.cookie = `aura-lang=${newLang}; path=/; max-age=31536000`
        router.refresh()
    }

    const handleLogout = async () => {
        await logout()
    }

    return (
        <div className="relative">
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="h-10 w-10 overflow-hidden rounded-full border border-primary/40 bg-primary/20 flex items-center justify-center text-primary-foreground font-bold transition-all hover:scale-110 active:scale-95"
            >
                {firstName[0]}
            </button>

            {isOpen && (
                <>
                    <div className="fixed inset-0 z-10" onClick={() => setIsOpen(false)} />
                    <div className="absolute right-0 mt-2 z-20 w-64 transform overflow-hidden rounded-2xl border border-border bg-card p-2 shadow-lg">
                        <div className="px-4 py-3 border-b border-border mb-2">
                            <p className="text-xs font-bold text-muted-foreground uppercase tracking-widest">{t.account}</p>
                            <p className="text-sm font-bold text-foreground truncate">{firstName}</p>
                        </div>

                        {/* Selector de Idioma */}
                        <div className="px-2 mb-2">
                            <p className="px-2 py-1 text-[10px] font-bold text-muted-foreground uppercase tracking-widest mb-1">{t.language}</p>
                            <div className="grid grid-cols-2 gap-1 p-1 bg-muted rounded-xl">
                                <button
                                    onClick={() => changeLang('es')}
                                    className={`flex items-center justify-center gap-2 px-2 py-1.5 text-xs rounded-lg transition-all ${lang === 'es' ? 'bg-primary text-primary-foreground font-bold shadow-sm' : 'text-foreground hover:bg-accent'}`}
                                >
                                    ES {lang === 'es' && <Check size={12} />}
                                </button>
                                <button
                                    onClick={() => changeLang('en')}
                                    className={`flex items-center justify-center gap-2 px-2 py-1.5 text-xs rounded-lg transition-all ${lang === 'en' ? 'bg-primary text-primary-foreground font-bold shadow-sm' : 'text-foreground hover:bg-accent'}`}
                                >
                                    EN {lang === 'en' && <Check size={12} />}
                                </button>
                            </div>
                        </div>

                        <div className="h-px bg-border my-2" />

                        <button
                            onClick={handleLogout}
                            className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-bold text-destructive transition-colors hover:bg-destructive/10"
                        >
                            <LogOut size={16} />
                            <span>{t.logout}</span>
                        </button>
                    </div>
                </>
            )}
        </div>
    )
}
