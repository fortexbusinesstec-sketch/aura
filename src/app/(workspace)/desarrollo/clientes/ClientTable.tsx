'use client'

import { useState, useTransition, useMemo } from 'react'
import { createColumnHelper } from '@tanstack/react-table'
import Link from 'next/link'
import { Plus, UserPlus, Phone, Mail, Building2, Hash, ExternalLink } from 'lucide-react'
import { Client, NewClient } from '@/types'
import { Modal } from '@/components/ui/Modal'
import { FtxDatagrid } from '@/components/ui/FtxDatagrid'
import { createClientAction } from './actions'

const columnHelper = createColumnHelper<Client>()

export function ClientTable({ initialData }: { initialData: Client[] }) {
    const [isModalOpen, setIsModalOpen] = useState(false)
    const [isPending, startTransition] = useTransition()

    const columns = useMemo(() => [
        columnHelper.accessor('razon_social', {
            header: 'Razón Social',
            cell: info => <span className="font-semibold text-foreground">{info.getValue() as React.ReactNode}</span>,
        }),
        columnHelper.accessor('ruc', {
            header: 'RUC',
            cell: info => <span className="font-mono text-foreground">{info.getValue()}</span>,
        }),
        columnHelper.accessor('persona_contacto', {
            header: 'Contacto',
            cell: info => info.getValue(),
        }),
        columnHelper.accessor('email', {
            header: 'Email',
            cell: info => <span className="text-foreground/70">{info.getValue()}</span>,
        }),
        columnHelper.display({
            id: 'actions',
            header: 'Acciones',
            cell: info => (
                <Link
                    href={`/desarrollo/clientes/${info.row.original.id}`}
                    className="flex items-center gap-2 rounded-lg bg-secondary/50 px-3 py-1.5 text-xs font-bold text-foreground/70 transition-all hover:bg-primary hover:text-primary-foreground shadow-sm"
                >
                    <ExternalLink size={14} />
                    Detalle
                </Link>
            )
        })
    ], [])

    const handleAdd = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault()
        const formData = new FormData(e.currentTarget)

        const data: NewClient = {
            razon_social: formData.get('razon_social') as string,
            ruc: formData.get('ruc') as string,
            persona_contacto: formData.get('persona_contacto') as string,
            email: formData.get('email') as string,
        }

        startTransition(async () => {
            const result = await createClientAction(data)
            if (result.success) {
                setIsModalOpen(false)
            } else {
                alert('Error: ' + result.error)
            }
        })
    }

    return (
        <div className="space-y-6">
            <div className="flex justify-end">
                <button
                    onClick={() => setIsModalOpen(true)}
                    className="flex items-center gap-2 rounded-xl bg-primary px-4 py-2 text-sm font-bold text-primary-foreground transition-all hover:bg-primary/80 active:scale-95"
                >
                    <UserPlus size={18} />
                    Nuevo Cliente
                </button>
            </div>

            <FtxDatagrid
                data={initialData}
                columns={columns}
                enableGlobalFilter={true}
                enableColumnVisibility={true}
            />

            <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title="Registrar Nuevo Cliente">
                <form onSubmit={handleAdd} className="grid grid-cols-1 gap-4">
                    <div className="space-y-1.5">
                        <label className="text-xs font-bold uppercase text-foreground">Razón Social</label>
                        <div className="relative">
                            <Building2 className="absolute left-3 top-1/2 -translate-y-1/2 text-border" size={16} />
                            <input name="razon_social" required className="w-full rounded-xl border border-border/50 bg-background pl-10 pr-4 py-2.5 text-sm outline-none focus:border-accent/50" placeholder="Nombre de la empresa" />
                        </div>
                    </div>

                    <div className="space-y-1.5">
                        <label className="text-xs font-bold uppercase text-foreground">RUC</label>
                        <div className="relative">
                            <Hash className="absolute left-3 top-1/2 -translate-y-1/2 text-border" size={16} />
                            <input name="ruc" required className="w-full rounded-xl border border-border/50 bg-background pl-10 pr-4 py-2.5 text-sm outline-none focus:border-accent/50" placeholder="20XXXXXXXXX" />
                        </div>
                    </div>

                    <div className="space-y-1.5">
                        <label className="text-xs font-bold uppercase text-foreground">Persona de Contacto</label>
                        <div className="relative">
                            <Phone className="absolute left-3 top-1/2 -translate-y-1/2 text-border" size={16} />
                            <input name="persona_contacto" required className="w-full rounded-xl border border-border/50 bg-background pl-10 pr-4 py-2.5 text-sm outline-none focus:border-accent/50" placeholder="Nombre completo" />
                        </div>
                    </div>

                    <div className="space-y-1.5">
                        <label className="text-xs font-bold uppercase text-foreground">Email Corporativo</label>
                        <div className="relative">
                            <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-border" size={16} />
                            <input name="email" type="email" required className="w-full rounded-xl border border-border/50 bg-background pl-10 pr-4 py-2.5 text-sm outline-none focus:border-accent/50" placeholder="contacto@empresa.com" />
                        </div>
                    </div>

                    <button
                        type="submit"
                        disabled={isPending}
                        className="mt-2 w-full rounded-xl bg-primary py-3 text-sm font-bold text-primary-foreground hover:bg-primary/80 disabled:opacity-50 transition-all active:scale-[0.98]">
                        {isPending ? 'Sincronizando...' : 'Registrar Cliente'}
                    </button>
                </form>
            </Modal>
        </div>
    )
}
