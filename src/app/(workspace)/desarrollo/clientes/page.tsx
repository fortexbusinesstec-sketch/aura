import { ClientRepository } from '@/lib/repositories/ClientRepository'
import { ClientTable } from '@/app/(workspace)/desarrollo/clientes/ClientTable'
import { BackButton } from '@/components/ui/BackButton'

export default async function ClientesPage() {
    const clients = await ClientRepository.getAll()

    return (
        <div className="space-y-8">
            <BackButton />
            <div>
                <h1 className="text-3xl font-bold text-foreground">Gestión de Clientes</h1>
                <p className="text-foreground/60 mt-1">CRM Administrativo del ecosistema Aura OS.</p>
            </div>

            <ClientTable initialData={clients || []} />
        </div>
    )
}
