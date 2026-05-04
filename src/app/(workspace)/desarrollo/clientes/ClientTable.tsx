'use client'

import { useState, useTransition, useMemo } from 'react'
import { createColumnHelper } from '@tanstack/react-table'
import Link from 'next/link'
import { Plus, UserPlus, Phone, Mail, Building2, Hash, ExternalLink } from 'lucide-react'
import { Client, NewClient } from '@/types'
import { Modal } from '@/components/ui/Modal'
import { FtxDatagrid } from '@/components/ui/FtxDatagrid'
import { createClientAction, updateClientAction } from './actions'

const EditIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="currentColor" className="icon icon-tabler icons-tabler-filled icon-tabler-edit">
        <path stroke="none" d="M0 0h24v24H0z" fill="none" />
        <path d="M8 7a1 1 0 0 1 -1 1h-1a1 1 0 0 0 -1 1v9a1 1 0 0 0 1 1h9a1 1 0 0 0 1 -1v-1a1 1 0 0 1 2 0v1a3 3 0 0 1 -3 3h-9a3 3 0 0 1 -3 -3v-9a3 3 0 0 1 3 -3h1a1 1 0 0 1 1 1" />
        <path d="M14.596 5.011l4.392 4.392l-6.28 6.303a1 1 0 0 1 -.708 .294h-3a1 1 0 0 1 -1 -1v-3a1 1 0 0 1 .294 -.708zm6.496 -2.103a3.097 3.097 0 0 1 .165 4.203l-.164 .18l-.693 .694l-4.387 -4.387l.695 -.69a3.1 3.1 0 0 1 4.384 0" />
    </svg>
)

const EyeIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="currentColor" className="icon icon-tabler icons-tabler-filled icon-tabler-eye">
        <path stroke="none" d="M0 0h24v24H0z" fill="none" />
        <path d="M12 4c4.29 0 7.863 2.429 10.665 7.154l.22 .379l.045 .1l.03 .083l.014 .055l.014 .082l.011 .1v.11l-.014 .111a.992 .992 0 0 1 -.026 .11l-.039 .108l-.036 .075l-.016 .03c-2.764 4.836 -6.3 7.38 -10.555 7.499l-.313 .004c-4.396 0 -8.037 -2.549 -10.868 -7.504a1 1 0 0 1 0 -.992c2.831 -4.955 6.472 -7.504 10.868 -7.504zm0 5a3 3 0 1 0 0 6a3 3 0 0 0 0 -6" />
    </svg>
)

const columnHelper = createColumnHelper<Client>()

export function ClientTable({ initialData }: { initialData: Client[] }) {
    const [isModalOpen, setIsModalOpen] = useState(false)
    const [editingClient, setEditingClient] = useState<Client | null>(null)
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
                <div className="flex items-center gap-1">
                    <Link
                        href={`/desarrollo/clientes/${info.row.original.id}`}
                        className="p-2 rounded-lg text-foreground/30 hover:text-blue-600 hover:bg-blue-50 transition-all"
                        title="Ver Detalle"
                    >
                        <EyeIcon />
                    </Link>
                    <button
                        onClick={() => setEditingClient(info.row.original)}
                        className="p-2 rounded-lg text-foreground/30 hover:text-amber-700 hover:bg-amber-50 transition-all"
                        title="Editar"
                    >
                        <EditIcon />
                    </button>
                </div>
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

    const handleUpdate = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault()
        if (!editingClient) return

        const formData = new FormData(e.currentTarget)

        const data: Partial<NewClient> = {
            razon_social: formData.get('razon_social') as string,
            ruc: formData.get('ruc') as string,
            persona_contacto: formData.get('persona_contacto') as string,
            email: formData.get('email') as string,
        }

        startTransition(async () => {
            const result = await updateClientAction(editingClient.id, data)
            if (result.success) {
                setEditingClient(null)
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
                        <label className="text-xs font-bold uppercase text-foreground">RUC (Opcional)</label>
                        <div className="relative">
                            <Hash className="absolute left-3 top-1/2 -translate-y-1/2 text-border" size={16} />
                            <input name="ruc" className="w-full rounded-xl border border-border/50 bg-background pl-10 pr-4 py-2.5 text-sm outline-none focus:border-accent/50" placeholder="20XXXXXXXXX" />
                        </div>
                    </div>

                    <div className="space-y-1.5">
                        <label className="text-xs font-bold uppercase text-foreground">Persona de Contacto (Opcional)</label>
                        <div className="relative">
                            <Phone className="absolute left-3 top-1/2 -translate-y-1/2 text-border" size={16} />
                            <input name="persona_contacto" className="w-full rounded-xl border border-border/50 bg-background pl-10 pr-4 py-2.5 text-sm outline-none focus:border-accent/50" placeholder="Nombre completo" />
                        </div>
                    </div>

                    <div className="space-y-1.5">
                        <label className="text-xs font-bold uppercase text-foreground">Email Corporativo (Opcional)</label>
                        <div className="relative">
                            <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-border" size={16} />
                            <input name="email" type="email" className="w-full rounded-xl border border-border/50 bg-background pl-10 pr-4 py-2.5 text-sm outline-none focus:border-accent/50" placeholder="contacto@empresa.com" />
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

            {/* MODAL DE EDICIÓN */}
            <Modal 
                isOpen={!!editingClient} 
                onClose={() => setEditingClient(null)} 
                title={`Editar Información: ${editingClient?.razon_social}`}
            >
                <form onSubmit={handleUpdate} className="grid grid-cols-1 gap-4">
                    <div className="space-y-1.5">
                        <label className="text-xs font-bold uppercase text-foreground">Razón Social</label>
                        <div className="relative">
                            <Building2 className="absolute left-3 top-1/2 -translate-y-1/2 text-border" size={16} />
                            <input 
                                name="razon_social" 
                                required 
                                defaultValue={editingClient?.razon_social}
                                className="w-full rounded-xl border border-border/50 bg-background pl-10 pr-4 py-2.5 text-sm outline-none focus:border-accent/50" 
                            />
                        </div>
                    </div>

                    <div className="space-y-1.5">
                        <label className="text-xs font-bold uppercase text-foreground">RUC (Opcional)</label>
                        <div className="relative">
                            <Hash className="absolute left-3 top-1/2 -translate-y-1/2 text-border" size={16} />
                            <input 
                                name="ruc" 
                                defaultValue={editingClient?.ruc}
                                className="w-full rounded-xl border border-border/50 bg-background pl-10 pr-4 py-2.5 text-sm outline-none focus:border-accent/50" 
                            />
                        </div>
                    </div>

                    <div className="space-y-1.5">
                        <label className="text-xs font-bold uppercase text-foreground">Persona de Contacto (Opcional)</label>
                        <div className="relative">
                            <Phone className="absolute left-3 top-1/2 -translate-y-1/2 text-border" size={16} />
                            <input 
                                name="persona_contacto" 
                                defaultValue={editingClient?.persona_contacto}
                                className="w-full rounded-xl border border-border/50 bg-background pl-10 pr-4 py-2.5 text-sm outline-none focus:border-accent/50" 
                            />
                        </div>
                    </div>

                    <div className="space-y-1.5">
                        <label className="text-xs font-bold uppercase text-foreground">Email Corporativo (Opcional)</label>
                        <div className="relative">
                            <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-border" size={16} />
                            <input 
                                name="email" 
                                type="email" 
                                defaultValue={editingClient?.email}
                                className="w-full rounded-xl border border-border/50 bg-background pl-10 pr-4 py-2.5 text-sm outline-none focus:border-accent/50" 
                            />
                        </div>
                    </div>

                    <button
                        type="submit"
                        disabled={isPending}
                        className="mt-2 w-full rounded-xl bg-amber-600 py-3 text-sm font-bold text-white hover:bg-amber-700 disabled:opacity-50 transition-all active:scale-[0.98]">
                        {isPending ? 'Actualizando...' : 'Guardar Cambios'}
                    </button>
                </form>
            </Modal>
        </div>
    )
}
