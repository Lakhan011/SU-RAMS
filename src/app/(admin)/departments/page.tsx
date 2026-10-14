'use client';

import { Plus, Search, Edit, Trash2, X, ArrowUpDown, ChevronLeft, ChevronRight } from 'lucide-react';
import { useState, useEffect, useCallback, useMemo } from 'react';
import { useLayoutStore } from '@/store/useLayoutStore';
import toast from 'react-hot-toast';
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

export default function DepartmentsPage() {
  const setHeader = useLayoutStore((state) => state.setHeader);
  const resetHeader = useLayoutStore((state) => state.resetHeader);

  const [departments, setDepartments] = useState<any[]>([]);
  const [schools, setSchools] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  
  const [schoolFilter, setSchoolFilter] = useState('all');
  const [globalFilter, setGlobalFilter] = useState('');
  const [sorting, setSorting] = useState<SortingState>([]);
  
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [newDepartment, setNewDepartment] = useState({ departmentCode: '', departmentName: '', status: 'ACTIVE', schoolId: '' });
  const [submitting, setSubmitting] = useState(false);

  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editingDepartment, setEditingDepartment] = useState<any>(null);

  const fetchData = async () => {
    try {
      const res = await fetch('/api/departments');
      if (res.ok) {
        const data = await res.json();
        setDepartments(data.departments);
        setSchools(data.schools);
      }
    } catch (e) {
      toast.error('Failed to load departments');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const openAddModal = useCallback(() => {
    setIsAddModalOpen(true);
  }, []);

  useEffect(() => {
    setHeader(
      "Departments Directory",
      "Manage university departments.",
      <button 
        onClick={openAddModal}
        className="inline-flex items-center gap-2 px-4 py-2.5 rounded-[5px] bg-primary hover:bg-primary-hover text-white font-semibold text-sm shadow-sm hover:shadow-md transition-all duration-200"
      >
        <Plus className="w-4 h-4" />
        Add Department
      </button>
    );
    return () => resetHeader();
  }, [setHeader, resetHeader, openAddModal]);

  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const confirmDelete = (id: string) => {
    setDeletingId(id);
    setIsDeleteModalOpen(true);
  };

  const handleDelete = async () => {
    if (!deletingId) return;
    try {
      const res = await fetch(`/api/departments/${deletingId}`, { method: 'DELETE' });
      if (!res.ok) throw new Error('Failed to delete');
      toast.success('Department deleted successfully');
      fetchData();
    } catch (e) {
      toast.error('Could not delete department');
    } finally {
      setIsDeleteModalOpen(false);
      setDeletingId(null);
    }
  };

  const handleAddDepartment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newDepartment.departmentCode || !newDepartment.departmentName || !newDepartment.schoolId) {
      toast.error('Please fill all fields');
      return;
    }
    setSubmitting(true);
    try {
      const res = await fetch('/api/departments', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newDepartment)
      });
      const data = await res.json();
      if (!res.ok) {
        toast.error(data.error || 'Failed to add department');
      } else {
        toast.success('Department added successfully!');
        setIsAddModalOpen(false);
        setNewDepartment({ departmentCode: '', departmentName: '', status: 'ACTIVE', schoolId: '' });
        fetchData();
      }
    } catch (e) {
      toast.error('An error occurred');
    } finally {
      setSubmitting(false);
    }
  };

  const openEditModal = (dept: any) => {
    setEditingDepartment({ ...dept });
    setIsEditModalOpen(true);
  };

  const handleUpdateDepartment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingDepartment.departmentCode || !editingDepartment.departmentName || !editingDepartment.schoolId) {
      toast.error('Please fill all fields');
      return;
    }
    setSubmitting(true);
    try {
      const res = await fetch(`/api/departments/${editingDepartment.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(editingDepartment)
      });
      const data = await res.json();
      if (!res.ok) {
        toast.error(data.error || 'Failed to update department');
      } else {
        toast.success('Department updated successfully!');
        setIsEditModalOpen(false);
        fetchData();
      }
    } catch (e) {
      toast.error('An error occurred');
    } finally {
      setSubmitting(false);
    }
  };

  const filteredData = useMemo(() => {
    let list = departments;
    if (schoolFilter !== 'all') {
      list = list.filter((d) => d.schoolId === schoolFilter);
    }
    return list;
  }, [departments, schoolFilter]);

  const columns = useMemo<ColumnDef<any>[]>(
    () => [
      {
        accessorFn: (row) => row.departmentCode,
        id: 'departmentCode',
        header: ({ column }) => {
          return (
            <button
              onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
              className="flex items-center gap-1 hover:text-foreground transition-colors uppercase w-full"
            >
              Dept Code
              <ArrowUpDown className="ml-1 h-3 w-3" />
            </button>
          )
        },
        cell: ({ row }) => (
          <span className="inline-flex items-center px-2.5 py-1 rounded-[5px] bg-primary-light text-primary font-bold text-xs">
            {row.original.departmentCode}
          </span>
        ),
      },
      {
        accessorFn: (row) => row.departmentName,
        id: 'departmentName',
        header: ({ column }) => {
          return (
            <button
              onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
              className="flex items-center gap-1 hover:text-foreground transition-colors uppercase w-full"
            >
              Department Name
              <ArrowUpDown className="ml-1 h-3 w-3" />
            </button>
          )
        },
        cell: ({ row }) => (
          <p className="text-sm font-medium text-foreground">{row.original.departmentName}</p>
        ),
      },
      {
        accessorFn: (row) => row.school?.schoolName,
        id: 'school',
        header: ({ column }) => {
          return (
            <button
              onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
              className="flex items-center gap-1 hover:text-foreground transition-colors uppercase w-full"
            >
              School
              <ArrowUpDown className="ml-1 h-3 w-3" />
            </button>
          )
        },
        cell: ({ row }) => (
          <span className="text-sm text-muted">{row.original.school?.schoolName}</span>
        ),
      },
      {
        accessorFn: (row) => row._count?.scholars || 0,
        id: 'scholars',
        header: () => <span className="uppercase">Scholars</span>,
        cell: ({ row }) => (
          <span className="text-sm font-medium text-foreground">{row.original._count?.scholars || 0}</span>
        ),
      },
      {
        accessorFn: (row) => row.status,
        id: 'status',
        header: () => <span className="uppercase">Status</span>,
        cell: ({ row }) => (
          <span className={`inline-flex items-center px-2.5 py-1 rounded-[5px] text-xs font-medium ${
            row.original.status === 'ACTIVE' ? 'bg-success-light text-success' : 'bg-warning-light text-warning'
          }`}>
            {row.original.status}
          </span>
        ),
      },
      {
        id: 'actions',
        header: () => <span className="uppercase flex justify-end">Actions</span>,
        cell: ({ row }) => (
          <div className="flex items-center justify-end gap-2">
            <button 
              onClick={() => openEditModal(row.original)}
              className="p-2 text-muted hover:text-primary transition-colors rounded-[5px] hover:bg-primary-light"
            >
              <Edit className="w-4 h-4" />
            </button>
            <button 
              onClick={() => confirmDelete(row.original.id)}
              className="p-2 text-muted hover:text-danger transition-colors rounded-[5px] hover:bg-danger-light"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          </div>
        ),
      }
    ],
    []
  );

  const table = useReactTable({
    data: filteredData,
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
      
      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4 mb-2">
        <div className="relative w-full sm:w-48">
          <select
            value={schoolFilter}
            onChange={(e) => setSchoolFilter(e.target.value)}
            className="w-full pl-4 pr-10 py-2.5 rounded-[5px] border border-border bg-surface text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/30 appearance-none"
          >
            <option value="all">All Schools</option>
            {schools.map(s => (
              <option key={s.id} value={s.id}>{s.schoolName}</option>
            ))}
          </select>
          <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none">
            <svg className="w-4 h-4 text-muted" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" /></svg>
          </div>
        </div>

        <div className="relative w-full sm:w-80">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted" />
          <input
            type="text"
            placeholder="Search departments..."
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
                <tr key={headerGroup.id} className="border-b border-border bg-background/50">
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
                    Loading departments...
                  </td>
                </tr>
              ) : table.getRowModel().rows?.length ? (
                table.getRowModel().rows.map((row) => (
                  <tr key={row.id} className="border-b border-border-light last:border-b-0 hover:bg-background/60">
                    {row.getVisibleCells().map((cell) => (
                      <td key={cell.id} className="px-5 py-4">
                        {flexRender(cell.column.columnDef.cell, cell.getContext())}
                      </td>
                    ))}
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={columns.length} className="text-center py-16 text-muted text-sm">
                    No results.
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

      {/* Add Department Modal */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-surface w-full max-w-md rounded-2xl shadow-xl border border-border overflow-hidden animate-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between px-6 py-4 border-b border-border">
              <h3 className="text-lg font-semibold text-foreground">Add New Department</h3>
              <button 
                onClick={() => setIsAddModalOpen(false)}
                className="p-2 text-muted hover:text-foreground hover:bg-surface-hover rounded-[5px] transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            
            <form onSubmit={handleAddDepartment} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-foreground mb-1.5">Department Code</label>
                <input
                  type="text"
                  value={newDepartment.departmentCode}
                  onChange={(e) => setNewDepartment({ ...newDepartment, departmentCode: e.target.value })}
                  placeholder="e.g. CS"
                  className="w-full px-4 py-2 rounded-[5px] border border-border bg-background focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary text-sm"
                  autoFocus
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-foreground mb-1.5">Department Name</label>
                <input
                  type="text"
                  value={newDepartment.departmentName}
                  onChange={(e) => setNewDepartment({ ...newDepartment, departmentName: e.target.value })}
                  placeholder="e.g. Department of Computer Science"
                  className="w-full px-4 py-2 rounded-[5px] border border-border bg-background focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary text-sm"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-foreground mb-1.5">Associated School</label>
                <select
                  value={newDepartment.schoolId}
                  onChange={(e) => setNewDepartment({ ...newDepartment, schoolId: e.target.value })}
                  className="w-full px-4 py-2 rounded-[5px] border border-border bg-background focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary text-sm"
                >
                  <option value="" disabled>Select a school...</option>
                  {schools.map(school => (
                    <option key={school.id} value={school.id}>{school.schoolName}</option>
                  ))}
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-foreground mb-1.5">Status</label>
                <select
                  value={newDepartment.status}
                  onChange={(e) => setNewDepartment({ ...newDepartment, status: e.target.value })}
                  className="w-full px-4 py-2 rounded-[5px] border border-border bg-background focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary text-sm"
                >
                  <option value="ACTIVE">Active</option>
                  <option value="INACTIVE">Inactive</option>
                </select>
              </div>

              <div className="pt-4 flex gap-3 justify-end">
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  className="px-4 py-2 text-sm font-medium text-muted hover:text-foreground bg-surface-hover hover:bg-border-light rounded-[5px] transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-4 py-2 text-sm font-semibold text-white bg-primary hover:bg-primary-hover rounded-[5px] shadow-sm hover:shadow transition-all disabled:opacity-50"
                >
                  {submitting ? 'Saving...' : 'Save Department'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Edit Department Modal */}
      {isEditModalOpen && editingDepartment && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-surface w-full max-w-md rounded-2xl shadow-xl border border-border overflow-hidden animate-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between px-6 py-4 border-b border-border">
              <h3 className="text-lg font-semibold text-foreground">Edit Department</h3>
              <button 
                onClick={() => setIsEditModalOpen(false)}
                className="p-2 text-muted hover:text-foreground hover:bg-surface-hover rounded-[5px] transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            
            <form onSubmit={handleUpdateDepartment} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-foreground mb-1.5">Department Code</label>
                <input
                  type="text"
                  value={editingDepartment.departmentCode}
                  onChange={(e) => setEditingDepartment({ ...editingDepartment, departmentCode: e.target.value })}
                  placeholder="e.g. CS"
                  className="w-full px-4 py-2 rounded-[5px] border border-border bg-background focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary text-sm"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-foreground mb-1.5">Department Name</label>
                <input
                  type="text"
                  value={editingDepartment.departmentName}
                  onChange={(e) => setEditingDepartment({ ...editingDepartment, departmentName: e.target.value })}
                  placeholder="e.g. Department of Computer Science"
                  className="w-full px-4 py-2 rounded-[5px] border border-border bg-background focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary text-sm"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-foreground mb-1.5">Associated School</label>
                <select
                  value={editingDepartment.schoolId}
                  onChange={(e) => setEditingDepartment({ ...editingDepartment, schoolId: e.target.value })}
                  className="w-full px-4 py-2 rounded-[5px] border border-border bg-background focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary text-sm"
                >
                  <option value="" disabled>Select a school...</option>
                  {schools.map(school => (
                    <option key={school.id} value={school.id}>{school.schoolName}</option>
                  ))}
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-foreground mb-1.5">Status</label>
                <select
                  value={editingDepartment.status}
                  onChange={(e) => setEditingDepartment({ ...editingDepartment, status: e.target.value })}
                  className="w-full px-4 py-2 rounded-[5px] border border-border bg-background focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary text-sm"
                >
                  <option value="ACTIVE">Active</option>
                  <option value="INACTIVE">Inactive</option>
                </select>
              </div>

              <div className="pt-4 flex gap-3 justify-end">
                <button
                  type="button"
                  onClick={() => setIsEditModalOpen(false)}
                  className="px-4 py-2 text-sm font-medium text-muted hover:text-foreground bg-surface-hover hover:bg-border-light rounded-[5px] transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-4 py-2 text-sm font-semibold text-white bg-primary hover:bg-primary-hover rounded-[5px] shadow-sm hover:shadow transition-all disabled:opacity-50"
                >
                  {submitting ? 'Updating...' : 'Update Department'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

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
                Are you sure you want to delete this department? This action cannot be undone.
              </p>
            </div>
            <div className="px-6 py-4 bg-background border-t border-border flex gap-3 justify-end">
              <button
                onClick={() => setIsDeleteModalOpen(false)}
                className="px-4 py-2 text-sm font-medium text-muted hover:text-foreground bg-surface-hover hover:bg-border-light rounded-[5px] transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleDelete}
                className="px-4 py-2 text-sm font-semibold text-white bg-danger hover:bg-danger/90 rounded-[5px] shadow-sm hover:shadow transition-all"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
