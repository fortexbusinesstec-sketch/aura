import { CatalogRepository } from '@/lib/repositories/CatalogRepository'
import { CatalogList } from '@/app/(workspace)/desarrollo/master/CatalogList'
import { BackButton } from '@/components/ui/BackButton'

export default async function AuraMasterPage() {
    const items = await CatalogRepository.getAll()

    return (
        <div className="space-y-8">
            <CatalogList initialItems={items} />
        </div>
    )
}
