'use client';

import { Plus, Search, Edit, Trash2, ArrowUpDown, ChevronLeft, ChevronRight, Building2, MapPin, FileCheck, UserCog, Hash, Eye } from 'lucide-react';
import toast from 'react-hot-toast';
import { useState, useEffect, useCallback, useMemo, Fragment } from 'react';
import { useRouter } from 'next/navigation';
import { useLayoutStore } from '@/store/useLayoutStore';
import {
  flexRender,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  useReactTable,
  ColumnDef,
  SortingState,
} from '@tanstack/react-table';

export default function ScholarsPage() {
  const router = useRouter();
  const [scholars, setScholars] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const [globalFilter, setGlobalFilter] = useState('');
  const [sorting, setSorting] = useState<SortingState>([]);

  const setHeader = useLayoutStore((state) => state.setHeader);
  const resetHeader = useLayoutStore((state) => state.resetHeader);
  const [currentUser, setCurrentUser] = useState<any>(null);
  
  const fetchData = async () => {
    try {
      const [scholarsRes, authRes] = await Promise.all([
        fetch('/api/scholars?t=' + Date.now(), { cache: 'no-store' }),
        fetch('/api/auth/me'),
      ]);
      
      if (scholarsRes.ok && authRes.ok) {
        const scholarsData = await scholarsRes.json();
        const authData = await authRes.json();
        
        setScholars(scholarsData.scholars || []);
        setCurrentUser(authData);
      }
    } catch (e) {
      toast.error('Failed to load data');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const openAddModal = useCallback(() => {
    router.push('/scholars/new');
  }, [router]);

  useEffect(() => {
    const showAddButton = ['SUPER_ADMIN', 'RDC_ADMIN', 'COORDINATOR'].includes(currentUser?.rawRole);
    setHeader(
      "Ph.D. Scholars",
      "Manage Ph.D. scholars across all university programs.",
      showAddButton ? (
        <button 
          onClick={openAddModal}
          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-[5px] bg-primary hover:bg-primary-hover text-white font-semibold text-sm shadow-sm hover:shadow-md transition-all duration-200"
        >
          <Plus className="w-4 h-4" />
          Add Scholar
        </button>
      ) : undefined
    );
    return () => resetHeader();
  }, [setHeader, resetHeader, currentUser?.rawRole, openAddModal]);

  const confirmDelete = (id: string) => {
    setDeletingId(id);
    setIsDeleteModalOpen(true);
  };

  const handleDelete = async () => {
    if (!deletingId) return;
    try {
      const res = await fetch(`/api/scholars/${deletingId}`, { method: 'DELETE' });
      if (!res.ok) throw new Error('Failed to delete');
      toast.success('Scholar deleted successfully');
      fetchData();
    } catch (e) {
      toast.error('Could not delete scholar');
    } finally {
      setIsDeleteModalOpen(false);
      setDeletingId(null);
    }
  };

  const columns = useMemo<ColumnDef<any>[]>(
    () => [
      {
        accessorFn: (row) => row.scholarId,
        id: 'id_enrollment',
        header: ({ column }) => {
          return (
            <button
              onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
              className="flex items-center gap-1 hover:text-foreground transition-colors uppercase w-full"
            >
              Scholar ID
              <ArrowUpDown className="ml-1 h-3 w-3" />
            </button>
          )
        },
        cell: ({ row }) => {
          const scholar = row.original;
          return (
            <div>
              <p className="inline-flex items-center px-2.5 py-1 rounded-[5px] bg-primary-light text-primary font-bold text-xs mb-1">
                {scholar.scholarId}
              </p>
            </div>
          );
        },
      },
      {
        accessorFn: (row) => `${row.firstName} ${row.lastName}`,
        id: 'name',
        header: ({ column }) => {
          return (
            <button
              onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
              className="flex items-center gap-1 hover:text-foreground transition-colors uppercase w-full"
            >
              Name
              <ArrowUpDown className="ml-1 h-3 w-3" />
            </button>
          )
        },
        cell: ({ row }) => {
          const scholar = row.original;
          return (
            <div>
              <p className="text-sm font-medium text-foreground">{scholar.firstName} {scholar.lastName}</p>
            </div>
          );
        },
      },
      {
        accessorFn: (row) => row.createdAt,
        id: 'joinedDate',
        header: ({ column }) => {
          return (
            <button
              onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
              className="flex items-center gap-1 hover:text-foreground transition-colors uppercase w-full"
            >
              Joined Date
              <ArrowUpDown className="ml-1 h-3 w-3" />
            </button>
          )
        },
        cell: ({ row }) => (
          <span className="text-sm font-medium text-foreground">
            {new Date(row.original.createdAt).toLocaleDateString()}
          </span>
        ),
      },
      {
        accessorFn: (row) => row.status,
        id: 'status',
        header: () => <span className="uppercase flex justify-center">Status</span>,
        cell: ({ row }) => {
          const status = row.original.status;
          return (
            <div className="flex justify-center">
              <span className={`inline-flex items-center px-2.5 py-1 rounded-[5px] text-xs font-medium ${
                status === 'ACTIVE' ? 'bg-success-light text-success' : 
                status === 'GRADUATED' ? 'bg-primary-light text-primary' : 'bg-warning-light text-warning'
              }`}>
                {status}
              </span>
            </div>
          );
        },
      },
      {
        id: 'actions',
        header: () => <span className="uppercase flex justify-end">Actions</span>,
        cell: ({ row }) => {
          const scholar = row.original;
          return (
            <div className="flex items-center justify-end gap-2">
              <button 
                onClick={(e) => { e.stopPropagation(); router.push('/scholars/' + scholar.id); }}
                className="p-2 text-muted hover:text-primary transition-colors rounded-[5px] hover:bg-primary-light"
                title="View Details"
              >
                <Eye className="w-4 h-4" />
              </button>
              <button 
                onClick={(e) => { e.stopPropagation(); router.push('/scholars/' + scholar.id); }}
                className="p-2 text-muted hover:text-primary transition-colors rounded-[5px] hover:bg-primary-light"
                title="Edit Details"
              >
                <Edit className="w-4 h-4" />
              </button>
              {['SUPER_ADMIN', 'RDC_ADMIN', 'COORDINATOR'].includes(currentUser?.rawRole) && (
                <button 
                  onClick={(e) => { e.stopPropagation(); confirmDelete(scholar.id); }}
                  className="p-2 text-muted hover:text-danger transition-colors rounded-[5px] hover:bg-danger-light"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              )}
            </div>
          );
        },
      }
    ],
    [currentUser, router, confirmDelete]
  );

  const table = useReactTable({
    data: scholars,
    columns,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    onSortingChange: setSorting,
    state: {
      sorting,
      globalFilter,
    },
    onGlobalFilterChange: setGlobalFilter,
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      {/* Header handled by useLayoutStore */}

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4 mb-2">
        <div className="relative w-full sm:w-80">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted" />
          <input
            type="text"
            placeholder="Search scholars..."
            value={globalFilter ?? ''}
            onChange={(e) => setGlobalFilter(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 rounded-[5px] border border-border bg-surface text-sm text-foreground placeholder:text-muted focus:outline-none focus:ring-2 focus:ring-primary/30"
          />
        </div>
      </div>

      {/* Data Table */}
      <div className="bg-surface rounded-xl border border-border shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              {table.getHeaderGroups().map((headerGroup) => (
                <tr key={headerGroup.id} className="border-b border-border bg-background/50 text-left">
                  {headerGroup.headers.map((header) => (
                    <th key={header.id} className="text-left text-xs font-semibold text-muted tracking-wider px-5 py-3.5">
                      {header.isPlaceholder
                        ? null
                        : flexRender(
                            header.column.columnDef.header,
                            header.getContext()
                          )}
                    </th>
                  ))}
                </tr>
              ))}
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={columns.length} className="text-center py-16 text-muted text-sm">
                    Loading scholars...
                  </td>
                </tr>
              ) : table.getRowModel().rows?.length ? (
                table.getRowModel().rows.map((row) => (
                  <Fragment key={row.id}>
                    <tr 
                      onClick={() => router.push('/scholars/' + row.original.id)}
                      className="hover:bg-slate-50/50 cursor-pointer transition-colors group"
                    >
                      {row.getVisibleCells().map((cell) => (
                        <td key={cell.id} className="px-5 py-3 border-b-0 pt-4">
                          {flexRender(cell.column.columnDef.cell, cell.getContext())}
                        </td>
                      ))}
                    </tr>
                    <tr 
                      onClick={() => router.push('/scholars/' + row.original.id)}
                      className="border-b border-border-light cursor-pointer hover:bg-slate-50/50 group"
                    >
                      <td colSpan={columns.length} className="px-5 pb-4 pt-1">
                        <div className="bg-slate-50/50 border border-slate-100 rounded-[5px] px-3 py-1.5 text-xs text-slate-400 flex flex-wrap items-center gap-x-4 gap-y-2 group-hover:bg-slate-50 group-hover:text-slate-600 transition-all duration-200">
                          <span className="flex items-center gap-1"><Hash className="w-3.5 h-3.5" /> EN. No: <span className="font-medium">{row.original.enrollmentNumber || 'N/A'}</span></span>
                          <span className="hidden sm:inline text-slate-200 group-hover:text-slate-300 transition-colors">|</span>
                          <span className="flex items-center gap-1"><Building2 className="w-3.5 h-3.5" /> <span className="font-medium">{row.original.school?.schoolName || 'N/A'}</span></span>
                          <span className="hidden sm:inline text-slate-200 group-hover:text-slate-300 transition-colors">|</span>
                          <span className="flex items-center gap-1"><MapPin className="w-3.5 h-3.5" /> <span className="font-medium">{row.original.program || row.original.department?.departmentName || 'N/A'}</span></span>
                          <span className="hidden sm:inline text-slate-200 group-hover:text-slate-300 transition-colors">|</span>
                          <span className="flex items-center gap-1"><FileCheck className="w-3.5 h-3.5" /> Matriculation: <span className="font-medium">{row.original.verificationStatus === 'COMPLETE' ? 'Complete' : row.original.verificationStatus === 'PENDING' ? 'Pending' : 'Draft'}</span></span>
                          {row.original.supervisor && (
                            <>
                              <span className="hidden sm:inline text-slate-200 group-hover:text-slate-300 transition-colors">|</span>
                              <span className="flex items-center gap-1"><UserCog className="w-3.5 h-3.5" /> Assignment: <span className="font-medium">{row.original.supervisor.status === 'VERIFIED_RDC' ? 'Verified RDC' : row.original.supervisor.status === 'VERIFIED_BOTH' ? 'Verified HOD & Dean' : row.original.supervisor.status === 'VERIFIED_DEAN' ? 'Verified Dean' : row.original.supervisor.status === 'VERIFIED_HOD' ? 'Verified HOD' : 'Unassigned'}</span></span>
                            </>
                          )}
                        </div>
                      </td>
                    </tr>
                  </Fragment>
                ))
              ) : (
                <tr>
                  <td colSpan={columns.length} className="text-center py-16 text-muted text-sm">
                    No scholars found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
        
        {/* Pagination Controls */}
        <div className="flex items-center justify-between px-5 py-4 border-t border-border bg-background/30">
          <div className="text-sm text-muted">
            Page {table.getState().pagination.pageIndex + 1} of{' '}
            {table.getPageCount() || 1}
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => table.previousPage()}
              disabled={!table.getCanPreviousPage()}
              className="p-2 rounded-[5px] border border-border hover:bg-surface disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <button
              onClick={() => table.nextPage()}
              disabled={!table.getCanNextPage()}
              className="p-2 rounded-[5px] border border-border hover:bg-surface disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Delete Confirmation Modal */}
      {isDeleteModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-surface w-full max-w-sm rounded-2xl shadow-xl border border-border overflow-hidden animate-in zoom-in-95 duration-200">
            <div className="p-6 text-center space-y-4">
              <div className="w-12 h-12 bg-danger-light text-danger rounded-full flex items-center justify-center mx-auto mb-4">
                <Trash2 className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold text-foreground">Confirm Deletion</h3>
              <p className="text-sm text-muted">
                Are you sure you want to delete this scholar? This action cannot be undone.
              </p>
            </div>
            <div className="px-6 py-4 bg-background border-t border-border flex gap-3 justify-end">
              <button
                type="button"
                onClick={() => { setIsDeleteModalOpen(false); setDeletingId(null); }}
                className="px-4 py-2 text-sm font-medium text-muted hover:text-foreground bg-surface-hover hover:bg-border-light rounded-[5px] transition-colors"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleDelete}
                className="px-4 py-2 text-sm font-semibold text-white bg-danger hover:bg-red-600 rounded-[5px] shadow-sm hover:shadow transition-all"
              >
                Yes, Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
