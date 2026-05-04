'use client'

import React, { useRef, useState, useMemo } from 'react'
import {
    ColumnDef,
    flexRender,
    getCoreRowModel,
    getSortedRowModel,
    getFilteredRowModel,
    getPaginationRowModel,
    useReactTable,
    SortingState,
    ColumnFiltersState,
    VisibilityState,
    RowSelectionState,
    getGroupedRowModel,
    getExpandedRowModel,
    GroupingState,
    PaginationState,
} from '@tanstack/react-table'
import { useVirtualizer } from '@tanstack/react-virtual'
import {
    ChevronUp,
    ChevronDown,
    ChevronsUpDown,
    Search,
    Settings2,
    ChevronLeft,
    ChevronRight,
    ChevronsLeft,
    ChevronsRight,
    Maximize2,
} from 'lucide-react'

interface FtxDatagridProps<TData> {
    data: TData[]
    columns: ColumnDef<TData, any>[]
    enableVirtualization?: boolean
    enableRowSelection?: boolean
    enableGlobalFilter?: boolean
    enableColumnVisibility?: boolean
    manualPagination?: boolean
    pageCount?: number
    onPaginationChange?: (pagination: PaginationState) => void
    onSortingChange?: (sorting: SortingState) => void
    onGlobalFilterChange?: (filter: string) => void
    isLoading?: boolean
    renderBulkActions?: (selectedRows: TData[]) => React.ReactNode
}

export function FtxDatagrid<TData>({
    data,
    columns,
    enableVirtualization = false,
    enableRowSelection = false,
    enableGlobalFilter = true,
    enableColumnVisibility = true,
    manualPagination = false,
    pageCount,
    onPaginationChange,
    onSortingChange,
    onGlobalFilterChange,
    isLoading = false,
    renderBulkActions,
}: FtxDatagridProps<TData>) {
    const [sorting, setSorting] = useState<SortingState>([])
    const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([])
    const [globalFilter, setGlobalFilter] = useState('')
    const [columnVisibility, setColumnVisibility] = useState<VisibilityState>({})
    const [rowSelection, setRowSelection] = useState<RowSelectionState>({})
    const [grouping, setGrouping] = useState<GroupingState>([])
    const [expanded, setExpanded] = useState({})
    const [pagination, setPagination] = useState<PaginationState>({
        pageIndex: 0,
        pageSize: 10,
    })
    const [isVisibilityMenuOpen, setIsVisibilityMenuOpen] = useState(false)

    const finalColumns = useMemo(() => {
        if (!enableRowSelection) return columns

        const selectionColumn: ColumnDef<TData> = {
            id: 'selection',
            header: ({ table }) => (
                <div className="flex items-center justify-center w-5">
                    <input
                        type="checkbox"
                        checked={table.getIsAllPageRowsSelected()}
                        onChange={table.getToggleAllPageRowsSelectedHandler()}
                    />
                </div>
            ),
            cell: ({ row }) => (
                <div className="flex items-center justify-center w-5">
                    <input
                        type="checkbox"
                        checked={row.getIsSelected()}
                        disabled={!row.getCanSelect()}
                        onChange={row.getToggleSelectedHandler()}
                    />
                </div>
            ),
        }
        return [selectionColumn, ...columns]
    }, [columns, enableRowSelection])

    const table = useReactTable({
        data,
        columns: finalColumns,
        state: {
            sorting,
            columnFilters,
            globalFilter,
            columnVisibility,
            rowSelection,
            grouping,
            expanded,
            pagination,
        },
        enableRowSelection,
        onSortingChange: setSorting,
        onColumnFiltersChange: setColumnFilters,
        onGlobalFilterChange: setGlobalFilter,
        onColumnVisibilityChange: setColumnVisibility,
        onRowSelectionChange: setRowSelection,
        onGroupingChange: setGrouping,
        onExpandedChange: setExpanded,
        onPaginationChange: setPagination,
        getCoreRowModel: getCoreRowModel(),
        getSortedRowModel: getSortedRowModel(),
        getFilteredRowModel: getFilteredRowModel(),
        getPaginationRowModel: getPaginationRowModel(),
        getGroupedRowModel: getGroupedRowModel(),
        getExpandedRowModel: getExpandedRowModel(),
        manualPagination,
        pageCount,
    })

    // Notify external listeners of state changes via effects (safer for side-effects)
    React.useEffect(() => {
        onPaginationChange?.(pagination)
    }, [pagination, onPaginationChange])

    React.useEffect(() => {
        onSortingChange?.(sorting)
    }, [sorting, onSortingChange])

    React.useEffect(() => {
        onGlobalFilterChange?.(globalFilter)
    }, [globalFilter, onGlobalFilterChange])

    const parentRef = useRef<HTMLDivElement>(null)
    const { rows } = table.getRowModel()

    const rowVirtualizer = useVirtualizer({
        count: rows.length,
        getScrollElement: () => parentRef.current,
        estimateSize: () => 48,
        overscan: 5,
    })

    const virtualRows = rowVirtualizer.getVirtualItems()
    const totalSize = rowVirtualizer.getTotalSize()

    const [isMounted, setIsMounted] = useState(false)
    React.useEffect(() => {
        setIsMounted(true)
    }, [])

    if (!isMounted) {
        return (
            <div className="w-full h-48 rounded-3xl border border-border bg-card/50 animate-pulse flex items-center justify-center">
                <span className="text-[10px] font-black uppercase tracking-widest text-muted-foreground/30">Inicializando Datagrid...</span>
            </div>
        )
    }

    return (
        <div className="flex flex-col gap-4 w-full animate-in fade-in duration-500">
            {/* Bulk Actions Bar */}
            {Object.keys(rowSelection).length > 0 && renderBulkActions && (
                <div className="fixed bottom-24 left-1/2 -translate-x-1/2 z-[60] animate-in slide-in-from-bottom-4 fade-in duration-300">
                    <div className="bg-card border border-border px-6 py-3 rounded-2xl shadow-lg flex items-center gap-6">
                        <div className="flex items-center gap-2 border-r border-border pr-6 mr-1">
                            <div className="w-6 h-6 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-xs font-black">
                                {Object.keys(rowSelection).length}
                            </div>
                            <span className="text-[10px] font-black text-foreground uppercase tracking-[0.2em]">Seleccionados</span>
                        </div>
                        <div className="flex items-center gap-4">
                            {renderBulkActions(table.getSelectedRowModel().rows.map(r => r.original))}
                        </div>
                    </div>
                </div>
            )}

            {/* Top Toolbar */}
            <div className="flex items-center justify-between gap-4">
                {enableGlobalFilter && (
                    <div className="relative flex-1 max-w-[260px] group">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground group-focus-within:text-foreground transition-colors" size={16} />
                        <input
                            value={globalFilter ?? ''}
                            onChange={(e) => table.setGlobalFilter(String(e.target.value))}
                            placeholder="Buscar..."
                            className="w-full bg-card border border-border rounded-2xl pl-11 pr-4 py-2.5 text-xs text-foreground focus:border-primary/60 focus:ring-1 focus:ring-primary/20 outline-none transition-all placeholder:text-muted-foreground font-medium"
                        />
                    </div>
                )}

                <div className="flex items-center gap-2">
                    {enableColumnVisibility && (
                        <div className="relative">
                            <button
                                onClick={() => setIsVisibilityMenuOpen(!isVisibilityMenuOpen)}
                                className={`p-3 rounded-2xl border border-border bg-card hover:bg-secondary transition-colors text-foreground ${isVisibilityMenuOpen ? 'border-primary/60 bg-secondary' : ''}`}
                            >
                                <Settings2 size={18} />
                            </button>
                            {isVisibilityMenuOpen && (
                                <>
                                    <div
                                        className="fixed inset-0 z-40"
                                        onClick={() => setIsVisibilityMenuOpen(false)}
                                    />
                                    <div className="absolute right-0 top-full mt-3 w-56 bg-card border border-border p-2 rounded-2xl shadow-lg z-50 animate-in fade-in zoom-in-95 duration-200 origin-top-right">
                                        <div className="text-[10px] font-black uppercase text-muted-foreground tracking-[0.2em] px-3 py-2 border-b border-border mb-1">Configurar Columnas</div>
                                        <div className="max-h-64 overflow-auto p-1">
                                            {table.getAllLeafColumns()
                                                .filter(column => column.id !== 'selection')
                                                .map((column) => (
                                                    <label key={column.id} className="flex items-center gap-3 px-3 py-2 hover:bg-secondary rounded-xl cursor-pointer text-xs font-bold text-foreground/80 transition-colors group">
                                                        <input
                                                            type="checkbox"
                                                            checked={column.getIsVisible()}
                                                            onChange={column.getToggleVisibilityHandler()}
                                                            className="rounded border-border text-primary focus:ring-primary/20"
                                                        />
                                                        <span className="group-hover:text-foreground transition-colors uppercase tracking-tight">
                                                            {typeof column.columnDef.header === 'string'
                                                                ? column.columnDef.header
                                                                : column.id.charAt(0).toUpperCase() + column.id.slice(1)}
                                                        </span>
                                                    </label>
                                                ))}
                                        </div>
                                    </div>
                                </>
                            )}
                        </div>
                    )}
                </div>
            </div>

            {/* Table Container */}
            <div
                ref={parentRef}
                className="relative overflow-auto rounded-3xl border border-border bg-card shadow-sm"
                style={{ maxHeight: enableVirtualization ? '600px' : 'auto' }}
            >
                <table className="w-full border-collapse">
                    <thead className="sticky top-0 z-10 bg-card border-b border-border">
                        {table.getHeaderGroups().map((headerGroup) => (
                            <tr key={headerGroup.id}>
                                {headerGroup.headers.map((header) => {
                                    const canSort = header.column.getCanSort()
                                    return (
                                        <th
                                            key={header.id}
                                            className="px-6 py-5 text-left text-[10px] font-black uppercase tracking-[0.15em] text-muted-foreground select-none pb-8"
                                            style={{
                                                width: header.getSize(),
                                                textAlign: (header.column.columnDef.meta as any)?.align || 'left'
                                            }}
                                        >
                                            <div
                                                className={`flex items-center gap-2 mb-3 ${canSort ? 'cursor-pointer hover:text-foreground transition-colors' : ''} ${(header.column.columnDef.meta as any)?.align === 'right' ? 'justify-end' : ''}`}
                                                onClick={header.column.getToggleSortingHandler()}
                                            >
                                                {header.isPlaceholder ? null : flexRender(header.column.columnDef.header, header.getContext())}
                                                {canSort && ({
                                                    asc: <ChevronUp size={14} className="text-foreground" />,
                                                    desc: <ChevronDown size={14} className="text-foreground" />,
                                                }[header.column.getIsSorted() as string] ?? <ChevronsUpDown size={14} className="opacity-30" />)}
                                            </div>
                                            {/* Column Filter */}
                                            {header.column.getCanFilter() && (
                                                <div className="mt-1 relative">
                                                    <input
                                                        type="text"
                                                        value={(header.column.getFilterValue() as string) ?? ''}
                                                        onChange={(e) => header.column.setFilterValue(e.target.value)}
                                                        placeholder="filtrar..."
                                                        className="w-full text-[10px] font-bold bg-background border border-border rounded-lg px-2.5 py-2 outline-none focus:border-primary/60 focus:bg-card text-foreground transition-all placeholder:text-muted-foreground"
                                                        onClick={(e) => e.stopPropagation()}
                                                    />
                                                </div>
                                            )}
                                        </th>
                                    )
                                })}
                            </tr>
                        ))}
                    </thead>
                    <tbody
                        className="divide-y divide-border"
                        style={{ height: enableVirtualization ? `${totalSize}px` : 'auto', position: 'relative' }}
                    >
                        {enableVirtualization ? (
                            virtualRows.map((virtualRow) => {
                                const row = rows[virtualRow.index]
                                return (
                                    <tr
                                        key={virtualRow.key}
                                        data-index={virtualRow.index}
                                        className={`hover:bg-secondary transition-colors group ${row.getIsSelected() ? 'bg-primary/10' : ''}`}
                                        style={{
                                            position: 'absolute',
                                            top: 0,
                                            left: 0,
                                            width: '100%',
                                            height: `${virtualRow.size}px`,
                                            transform: `translateY(${virtualRow.start}px)`,
                                        }}
                                    >
                                        {row.getVisibleCells().map((cell) => (
                                            <td
                                                key={cell.id}
                                                className="px-6 py-3 text-sm text-foreground font-medium"
                                                style={{ textAlign: (cell.column.columnDef.meta as any)?.align || 'left' }}
                                            >
                                                {flexRender(cell.column.columnDef.cell, cell.getContext())}
                                            </td>
                                        ))}
                                    </tr>
                                )
                            })
                        ) : (
                            rows.map((row) => (
                                <tr
                                    key={row.id}
                                    className={`hover:bg-secondary transition-colors group ${row.getIsSelected() ? 'bg-primary/10' : ''}`}
                                >
                                    {row.getVisibleCells().map((cell) => (
                                        <td
                                            key={cell.id}
                                            className="px-6 py-5 text-sm text-foreground font-medium tracking-tight"
                                            style={{ textAlign: (cell.column.columnDef.meta as any)?.align || 'left' }}
                                        >
                                            {flexRender(cell.column.columnDef.cell, cell.getContext())}
                                        </td>
                                    ))}
                                </tr>
                            ))
                        )}
                        {!isLoading && rows.length === 0 && (
                            <tr>
                                <td colSpan={table.getAllLeafColumns().length} className="px-6 py-32 text-center">
                                    <div className="flex flex-col items-center gap-2 opacity-30">
                                        <Maximize2 className="w-12 h-12 mb-2" />
                                        <span className="text-[10px] font-black uppercase tracking-[0.5em] text-foreground">Sin registros</span>
                                    </div>
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
                {isLoading && (
                    <div className="absolute inset-0 bg-background/40 backdrop-blur-[2px] flex items-center justify-center z-20">
                        <div className="flex flex-col items-center gap-3">
                            <div className="w-10 h-10 border-4 border-primary-foreground border-t-transparent rounded-full animate-spin" />
                            <span className="text-[10px] font-black uppercase tracking-[0.3em] text-foreground animate-pulse">Cargando...</span>
                        </div>
                    </div>
                )}
            </div>

            {/* Pagination Controls */}
            {!enableVirtualization && (
                <div className="flex items-center justify-between bg-card rounded-3xl border border-border p-4 shadow-sm flex-wrap gap-4">
                    <div className="flex items-center gap-6 text-xs font-bold">
                        <div className="flex items-center gap-3">
                            <span className="text-muted-foreground font-bold uppercase tracking-wider text-[10px]">Filas por página</span>
                            <select
                                value={table.getState().pagination.pageSize}
                                onChange={e => table.setPageSize(Number(e.target.value))}
                                className="bg-background border border-border rounded-xl px-3 py-1.5 text-[10px] font-black outline-none focus:border-primary/60 cursor-pointer appearance-none text-foreground"
                            >
                                {[10, 20, 30, 40, 50].map(pageSize => (
                                    <option key={pageSize} value={pageSize} className="bg-card text-foreground font-bold">
                                        {pageSize}
                                    </option>
                                ))}
                            </select>
                        </div>
                        <div className="text-muted-foreground border-l border-border pl-6 flex items-center gap-2 uppercase tracking-tighter text-[10px] font-bold">
                            Muestra <span className="font-black text-foreground tracking-tighter text-sm italic normal-case">{table.getRowModel().rows.length}</span> de <span className="font-black text-foreground tracking-tighter text-sm italic normal-case">{manualPagination ? pageCount ? pageCount * pagination.pageSize : '?' : table.getFilteredRowModel().rows.length}</span>
                        </div>
                    </div>

                    <div className="flex items-center gap-2">
                        <button
                            onClick={() => table.setPageIndex(0)}
                            disabled={!table.getCanPreviousPage()}
                            className="p-2.5 rounded-xl border border-border bg-background hover:bg-secondary disabled:opacity-30 transition-all text-foreground"
                        >
                            <ChevronsLeft size={18} />
                        </button>
                        <button
                            onClick={() => table.previousPage()}
                            disabled={!table.getCanPreviousPage()}
                            className="flex items-center gap-2 px-4 py-2.5 rounded-xl border border-border bg-background hover:bg-secondary disabled:opacity-30 transition-all text-[10px] font-black uppercase tracking-wider text-foreground"
                        >
                            <ChevronLeft size={18} />
                            Anterior
                        </button>

                        <div className="flex items-center gap-2 bg-background rounded-xl border border-border px-5 py-2.5 text-[10px] font-black">
                            <span className="text-muted-foreground uppercase tracking-widest">Página</span>
                            <span className="text-foreground text-sm italic">{table.getState().pagination.pageIndex + 1}</span>
                            <span className="text-muted-foreground/60">/</span>
                            <span className="text-foreground text-sm">{table.getPageCount()}</span>
                        </div>

                        <button
                            onClick={() => table.nextPage()}
                            disabled={!table.getCanNextPage()}
                            className="flex items-center gap-2 px-4 py-2.5 rounded-xl border border-border bg-background hover:bg-secondary disabled:opacity-30 transition-all text-[10px] font-black uppercase tracking-wider text-foreground"
                        >
                            Siguiente
                            <ChevronRight size={18} />
                        </button>
                        <button
                            onClick={() => table.setPageIndex(table.getPageCount() - 1)}
                            disabled={!table.getCanNextPage()}
                            className="p-2.5 rounded-xl border border-border bg-background hover:bg-secondary disabled:opacity-30 transition-all text-foreground"
                        >
                            <ChevronsRight size={18} />
                        </button>
                    </div>
                </div>
            )}
            {/* Estabilización de Checkboxes con Variables del Tema */}
            <style jsx global>{`
                input[type="checkbox"] {
                    appearance: none;
                    width: 1.15rem;
                    height: 1.15rem;
                    border: 2px solid hsl(var(--border));
                    border-radius: 6px;
                    cursor: pointer;
                    position: relative;
                    transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
                    background: hsl(var(--background));
                    display: flex;
                    align-items: center;
                    justify-content: center;
                }

                input[type="checkbox"]:checked {
                    background-color: hsl(var(--primary));
                    border-color: hsl(var(--primary));
                }

                input[type="checkbox"]:checked::after {
                    content: '';
                    position: absolute;
                    left: 5px;
                    top: 2px;
                    width: 5px;
                    height: 10px;
                    border: solid hsl(var(--primary-foreground));
                    border-width: 0 2.5px 2.5px 0;
                    transform: rotate(45deg);
                }

                input[type="checkbox"]:focus-visible {
                    outline: 2px solid hsl(var(--ring));
                    outline-offset: 2px;
                }

                input[type="checkbox"]:hover:not(:checked) {
                    border-color: hsl(var(--primary) / 0.5);
                    background-color: hsl(var(--accent));
                }
            `}</style>
        </div>
    )
}
