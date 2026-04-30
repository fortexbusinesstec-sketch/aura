import { CatalogRepository } from '@/lib/repositories/CatalogRepository'
import { CatalogList } from './CatalogList'

export default async function AuraMasterPage() {
    const items = await CatalogRepository.getAll()

    return (
        <div className="space-y-8">
            <CatalogList initialItems={items} />
        </div>
    )
}
