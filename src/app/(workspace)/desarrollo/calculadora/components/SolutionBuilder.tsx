'use client'

import React from 'react'
import { usePitchStore } from '@/store/usePitchStore'
import { Plus, Trash2, Box, FileText, Sparkles, Brain, Zap } from 'lucide-react'
import { FtxSelect } from '@/components/ui/FtxSelect'
import { CatalogCategory } from '@/types'

export function SolutionBuilder() {
    const {
        currentOpportunity,
        catalog,
        addBlock,
        updateBlock,
        removeBlock
    } = usePitchStore()

    const dimension = currentOpportunity.dimension
    if (!dimension) return null

    const isWebsite = dimension === 'website'
    const isLanding = dimension === 'landing'
    const label = isWebsite ? 'Página' : 'Bloque'
    const Icon = isWebsite ? FileText : Box

    // Categorías según dimensión
    const visualCat: CatalogCategory = isWebsite ? 'page_visual' : 'block_visual'
    const cognitiveCat: CatalogCategory = isWebsite ? 'page_cognitive' : 'block_cognitive'
    const complexityCat: CatalogCategory = 'landing_block'
    const websiteCat: CatalogCategory = 'website_page'

    const visualOptions = catalog
        .filter(item => item.category === visualCat)
        .sort((a, b) => a.base_price_pen - b.base_price_pen)
        .map(item => ({ label: item.name, value: item.id }))

    const cognitiveOptions = catalog
        .filter(item => item.category === cognitiveCat)
        .sort((a, b) => a.base_price_pen - b.base_price_pen)
        .map(item => ({ label: item.name, value: item.id }))

    const complexityOptions = catalog
        .filter(item => item.category === complexityCat)
        .sort((a, b) => a.base_price_pen - b.base_price_pen)
        .map(item => ({ label: item.name, value: item.id }))

    const websiteRaw = catalog
        .filter(item => item.category === websiteCat)
        .sort((a, b) => a.base_price_pen - b.base_price_pen)

    const websiteGroups = [
        {
            group: 'Rutas Generales',
            options: websiteRaw
                .filter(i => i.name.toLowerCase().includes('página'))
                .map(i => ({ label: `${i.name} • S/ ${i.base_price_pen.toLocaleString()}`, value: i.id }))
        },
        {
            group: 'Rutas de Formulario',
            options: websiteRaw
                .filter(i => i.name.toLowerCase().includes('formulario'))
                .map(i => ({ label: `${i.name} • S/ ${i.base_price_pen.toLocaleString()}`, value: i.id }))
        },
        {
            group: 'Rutas Plantilla',
            options: websiteRaw
                .filter(i => i.name.toLowerCase().includes('plantilla'))
                .map(i => ({ label: `${i.name} • S/ ${i.base_price_pen.toLocaleString()}`, value: i.id }))
        }
    ].filter(g => g.options.length > 0)

    const isCatalogEmpty = isLanding ? complexityOptions.length === 0 : (isWebsite ? websiteGroups.length === 0 : (visualOptions.length === 0 && cognitiveOptions.length === 0))

    const blocks = currentOpportunity.draft_jsonb?.blocks || []

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                    <div className="p-2 rounded-lg bg-primary text-primary-foreground">
                        <Icon size={18} />
                    </div>
                    <h3 className="text-sm font-black uppercase text-foreground tracking-[0.2em]">
                        Arquitectura de {isWebsite ? 'Páginas' : 'Bloques'}
                    </h3>
                </div>
                <button
                    onClick={addBlock}
                    className="flex items-center gap-2 px-5 py-2.5 bg-primary text-primary-foreground rounded-xl text-[10px] font-black uppercase tracking-[0.1em] hover:shadow-lg hover:shadow-primary/20 transition-all active:scale-95"
                >
                    <Plus size={14} strokeWidth={4} />
                    Añadir {label}
                </button>
            </div>

            <div className="space-y-4">
                {isCatalogEmpty && (
                    <div className="p-4 rounded-2xl bg-warning/10 border border-warning/30 text-[10px] font-bold text-warning-foreground uppercase tracking-widest text-center">
                        ⚠️ Catálogo pendiente{isLanding ? ` para "${complexityCat}"` : (isWebsite ? ` para "${websiteCat}"` : ` para "${visualCat}" y "${cognitiveCat}"`)}
                    </div>
                )}

                {blocks.map((block, index) => (
                    <div
                        key={block.id}
                        className="p-6 rounded-3xl bg-card border border-border space-y-6 animate-in slide-in-from-left-4 duration-300 shadow-sm"
                    >
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-4 flex-1">
                                <span className="text-[10px] font-black text-muted-foreground uppercase tracking-widest tabular-nums italic">#{String(index + 1).padStart(2, '0')}</span>
                                <input
                                    value={block.name}
                                    onChange={(e) => updateBlock(block.id, { name: e.target.value })}
                                    placeholder={isWebsite ? "Nombre de la ruta/página..." : `Nombre de la ${label}...`}
                                    className="bg-transparent text-lg font-black text-foreground outline-none border-b border-border focus:border-primary transition-colors w-full pb-1 placeholder:text-muted-foreground/40"
                                />
                            </div>
                            <button
                                onClick={() => removeBlock(block.id)}
                                className="p-2.5 rounded-xl text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-all"
                            >
                                <Trash2 size={18} />
                            </button>
                        </div>

                        {isLanding ? (
                            <div className="grid grid-cols-1 gap-6">
                                <FtxSelect
                                    label="Complejidad de Bloque"
                                    options={complexityOptions}
                                    value={block.complexity_id || ''}
                                    onChange={(val) => updateBlock(block.id, { complexity_id: val })}
                                    icon={<Zap size={16} />}
                                    placeholder="Seleccionar complejidad..."
                                />
                            </div>
                        ) : isWebsite ? (
                            <div className="grid grid-cols-1 gap-6">
                                <FtxSelect
                                    label="Tipo de Página / Ruta"
                                    groups={websiteGroups}
                                    value={block.catalog_item_id || ''}
                                    onChange={(val) => updateBlock(block.id, { catalog_item_id: val })}
                                    icon={<FileText size={16} />}
                                    placeholder="Seleccionar tipo de página..."
                                />
                            </div>
                        ) : (
                            <div className={`grid grid-cols-1 ${currentOpportunity.dimension === 'website' ? 'md:grid-cols-2' : ''} gap-6`}>
                                <FtxSelect
                                    label="Nivel Visual"
                                    options={visualOptions}
                                    value={block.visual_level_id || ''}
                                    onChange={(val) => updateBlock(block.id, { visual_level_id: val })}
                                    icon={<Sparkles size={16} />}
                                    placeholder="Estándar / Inmersivo..."
                                />
                                <FtxSelect
                                    label="Clasificación Estructural"
                                    options={cognitiveOptions}
                                    value={block.cognitive_level_id || ''}
                                    onChange={(val) => updateBlock(block.id, { cognitive_level_id: val })}
                                    icon={<Brain size={16} />}
                                    placeholder="Simplex / Dinámico..."
                                />
                            </div>
                        )}
                    </div>
                ))}

                {blocks.length === 0 && (
                    <div className="py-12 border-2 border-dashed border-border rounded-3xl flex flex-col items-center justify-center gap-4 opacity-40 text-muted-foreground">
                        <Icon size={48} strokeWidth={1} />
                        <p className="text-xs font-black uppercase tracking-[0.3em]">Sin estructura definida aún</p>
                    </div>
                )}
            </div>
        </div>
    )
}
