import { ClientRepository } from '@/lib/repositories/ClientRepository'
import { OpportunityRepository } from '@/lib/repositories/OpportunityRepository'
import { ClientDetailContainer } from './ClientDetailContainer'
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
        <div className="h-full">
            <ClientDetailContainer
                initialClient={client}
                opportunities={opportunities}
            />
        </div>
    )
}
