import { ClientRepository } from '@/lib/repositories/ClientRepository'
import { ClientTable } from '@/app/(workspace)/desarrollo/clientes/ClientTable'
import { PageHeader } from '@/components/ui/PageHeader'

export default async function ClientesPage() {
    const clients = await ClientRepository.getAll()

    return (
        <div className="space-y-8">
            <PageHeader
                title="Gestión de Clientes"
                subtitle="CRM Administrativo del ecosistema Aura OS"
            />

            <ClientTable initialData={clients || []} />
        </div>
    )
}
