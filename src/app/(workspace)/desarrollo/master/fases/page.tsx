import { PhaseTemplateRepository } from '@/lib/repositories/PhaseTemplateRepository'
import { PhaseTemplateManager } from '@/components/master/PhaseTemplateManager'
import { PageHeader } from '@/components/ui/PageHeader'

export default async function FasesPage() {
    const templates = await PhaseTemplateRepository.getAll()

    return (
        <div className="space-y-8">
            <PhaseTemplateManager initialTemplates={templates} />
        </div>
    )
}
