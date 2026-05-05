import { ClientRepository } from '@/lib/repositories/ClientRepository'
import { OpportunityRepository } from '@/lib/repositories/OpportunityRepository'
import { ClientDetailContainer } from './ClientDetailContainer'
import { ClientThemePanel } from '@/components/clients/ClientThemePanel'
import { notFound } from 'next/navigation'

interface PageProps {
    params: Promise<{ id: string }>
}

export default async function ClientDetailPage({ params }: PageProps) {
    const { id } = await params

    // Fetch client data
    const client = await ClientRepository.getById(id)
    if (!client) {
        notFound()
    }

    // Fetch client opportunities
    const opportunities = await OpportunityRepository.getByClientId(id)

    return (
        <div className="space-y-8 pb-12">
            <ClientDetailContainer
                initialClient={client}
                opportunities={opportunities}
            />

            {/* ═══════════════════════════════════════════════════
                PANEL DE TEMA DEL CLIENTE
                ═══════════════════════════════════════════════════ */}
            <section className="max-w-4xl mx-auto rounded-2xl border border-border/50 bg-card p-6 sm:p-8">
                <ClientThemePanel clientId={id} />
            </section>
        </div>
    )
}
