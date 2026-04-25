'use client'

import { useState, useTransition, useMemo } from 'react'
import { Plus, Tag, Layers, Trash2, Copy } from 'lucide-react'
import { CatalogItem, CatalogCategory } from '@/types'
import { Modal } from '@/components/ui/Modal'
import { PageHeader } from '@/components/ui/PageHeader'
import { FtxDatagrid } from '@/components/ui/FtxDatagrid'
import { FtxSelect } from '@/components/ui/FtxSelect'
import { createColumnHelper } from '@tanstack/react-table'
import { createCatalogItem } from './actions'

const CATEGORY_CONFIG: Record<CatalogCategory, { label: string; color: string }> = {
    setup: { label: 'Configuración Inicial', color: '#2f65ca' },
    page_tier: { label: 'Nivel de Página', color: '#7aa2f7' },
    integration: { label: 'Integración API', color: '#473E28' },
    domain: { label: 'Dominio y Hosting', color: '#b05a10' },
    app_feature: { label: 'Funcionalidad de App', color: '#2b7a40' },
    block_cognitive: { label: 'Bloque Cognitivo', color: '#c64343' },
    block_visual: { label: 'Identidad Visual', color: '#7A7261' },
    page_visual: { label: 'Visual de Página', color: '#bb9af7' },
    page_cognitive: { label: 'Cognitivo de Página', color: '#40414e' },
    seo_module: { label: 'Módulo SEO', color: '#2f65ca' },
    cro_strategy: { label: 'Estrategia CRO', color: '#c64343' },
    performance_module: { label: 'Performance', color: '#2b7a40' },
    landing_block: { label: 'Bloque de Landing', color: '#7aa2f7' },
    website_page: { label: 'Página Web', color: '#2f65ca' },
    hosting_external: { label: 'Hosting Externo', color: '#b05a10' },
    hosting_internal: { label: 'Fortex Hosting', color: '#2b7a40' },
}

const columnHelper = createColumnHelper<CatalogItem>()

export function CatalogList({ initialItems }: { initialItems: CatalogItem[] }) {
    const [isModalOpen, setIsModalOpen] = useState(false)
    const [isPending, startTransition] = useTransition()
    const [selectedCategory, setSelectedCategory] = useState<string>('')

    const columns = useMemo(() => [
        columnHelper.accessor('category', {
            header: 'Categoría',
            cell: info => {
                const config = CATEGORY_CONFIG[info.getValue()] || { label: info.getValue(), color: '#7A7261' }
                return (
                    <span
                        className="inline-flex items-center rounded-lg px-2.5 py-1 text-[11px] font-bold tracking-tight border whitespace-nowrap"
                        style={{
                            backgroundColor: `${config.color}18`,
                            color: config.color,
                            borderColor: `${config.color}30`
                        }}
                    >
                        {config.label}
                    </span>
                )
            },
        }),
        columnHelper.accessor('name', {
            header: 'Descripción del Servicio',
            cell: info => <span className="font-bold text-foreground tracking-tight">{info.getValue()}</span>,
        }),
        columnHelper.accessor('base_price_pen', {
            header: 'Precio Base',
            meta: { align: 'right' },
            cell: info => (
                <span className="text-primary-foreground font-mono font-black tabular-nums tracking-tighter">
                    {new Intl.NumberFormat('es-PE', { style: 'currency', currency: 'PEN' }).format(info.getValue())}
                </span>
            ),
        }),
    ], [])

    const handleAdd = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault()
        const formData = new FormData(e.currentTarget)

        const data = {
            name: formData.get('name') as string,
            category: selectedCategory as CatalogCategory,
            base_price_pen: Number(formData.get('price')),
        }

        if (!data.category) {
            alert('Por favor selecciona una categoría')
            return
        }

        startTransition(async () => {
            const result = await createCatalogItem(data)
            if (result.success) {
                setIsModalOpen(false)
                setSelectedCategory('')
            } else {
                alert('Error: ' + result.error)
            }
        })
    }

    const renderBulkActions = (selectedRows: CatalogItem[]) => (
        <>
            <button
                onClick={() => console.log('Duplicar', selectedRows)}
                className="flex items-center gap-2 px-4 py-2 rounded-xl hover:bg-accent text-[10px] font-black uppercase tracking-widest text-foreground transition-all active:scale-95 border border-border bg-card"
            >
                <Copy size={14} className="text-muted-foreground" />
                Duplicar
            </button>
            <button
                onClick={() => console.log('Eliminar', selectedRows)}
                className="flex items-center gap-2 px-4 py-2 rounded-xl hover:bg-destructive/10 text-[10px] font-black uppercase tracking-widest text-destructive transition-all active:scale-95 border border-destructive/30 bg-destructive/5"
            >
                <Trash2 size={14} className="text-destructive" />
                Eliminar
            </button>
        </>
    )

    const categoryOptions = Object.entries(CATEGORY_CONFIG).map(([key, config]) => ({
        label: config.label,
        value: key,
    }))

    return (
        <div className="space-y-8">
            <PageHeader
                title="Master Services"
                subtitle="Ecosistema de Valor & Gestión Core"
                showBack={false}
                action={
                    <button
                        onClick={() => setIsModalOpen(true)}
                        className="flex items-center gap-2 rounded-2xl bg-primary px-6 py-3.5 text-xs font-black text-primary-foreground transition-all hover:bg-primary/90 active:scale-95 shadow-sm uppercase tracking-widest"
                    >
                        <Plus size={20} strokeWidth={4} />
                        Alta de Ítem
                    </button>
                }
            />

            <FtxDatagrid
                data={initialItems}
                columns={columns}
                enableGlobalFilter={true}
                enableColumnVisibility={true}
                enableRowSelection={true}
                renderBulkActions={renderBulkActions}
            />

            <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title="Protocolo de Alta de Ítem">
                <form onSubmit={handleAdd} className="space-y-6">
                    <div className="space-y-3">
                        <label className="text-[11px] font-black uppercase text-muted-foreground tracking-[0.2em] ml-1">Identificador del Servicio</label>
                        <div className="relative group">
                            <Tag className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground group-focus-within:text-foreground transition-colors" size={18} />
                            <input
                                name="name"
                                required
                                placeholder="Ej. Diseño de Identidad Visual"
                                className="w-full rounded-2xl border border-border bg-background pl-12 pr-4 py-4 text-sm text-foreground outline-none focus:border-primary/50 focus:ring-4 focus:ring-primary/10 transition-all placeholder:text-muted-foreground/40 font-bold"
                            />
                        </div>
                    </div>

                    <FtxSelect
                        label="Clasificación Estructural"
                        options={categoryOptions}
                        value={selectedCategory}
                        onChange={setSelectedCategory}
                        placeholder="Seleccionar categoría..."
                        icon={<Layers size={18} />}
                    />

                    <div className="space-y-3">
                        <label className="text-[11px] font-black uppercase text-muted-foreground tracking-[0.2em] ml-1">Precio Base Consolidado</label>
                        <div className="relative group">
                            <div className="absolute left-5 top-1/2 -translate-y-1/2 text-muted-foreground group-focus-within:text-foreground font-black text-sm transition-colors">S/</div>
                            <input
                                name="price"
                                type="number"
                                step="0.01"
                                required
                                placeholder="0.00"
                                className="w-full rounded-2xl border border-border bg-background pl-14 pr-4 py-4 text-lg text-foreground font-mono font-black outline-none focus:border-primary/50 focus:ring-4 focus:ring-primary/10 transition-all placeholder:text-muted-foreground/40"
                            />
                        </div>
                    </div>

                    <div className="pt-6">
                        <button
                            type="submit"
                            disabled={isPending}
                            className="w-full rounded-2xl bg-primary py-4 text-[11px] font-black uppercase tracking-[0.3em] text-primary-foreground hover:bg-primary/90 disabled:opacity-50 transition-all active:scale-[0.98] shadow-sm"
                        >
                            {isPending ? 'Sincronizando Core...' : 'Confirmar Alta en Catálogo'}
                        </button>
                    </div>
                </form>
            </Modal>
        </div>
    )
}
