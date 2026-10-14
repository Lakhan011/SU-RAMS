'use client';

import { useState, useEffect, useMemo, useCallback } from 'react';
import { Shield, Edit, Trash2, X, Plus } from 'lucide-react';
import toast from 'react-hot-toast';
import { formatRoleName } from '@/lib/utils';
import {
  flexRender,
  getCoreRowModel,
  getFilteredRowModel,
  useReactTable,
  ColumnDef,
} from '@tanstack/react-table';
import { useLayoutStore } from '@/store/useLayoutStore';

export default function RolesPage() {
  const setHeader = useLayoutStore((state) => state.setHeader);
  const resetHeader = useLayoutStore((state) => state.resetHeader);

  const [roles, setRoles] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Modals state
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  
  const [submitting, setSubmitting] = useState(false);

  // Form state
  const [formData, setFormData] = useState({
    id: '',
    name: '',
    description: ''
  });

  useEffect(() => {
    fetchData();
  }, []);

  const openAddModal = useCallback(() => {
    setFormData({ id: '', name: '', description: '' });
    setIsModalOpen(true);
  }, []);

  useEffect(() => {
    setHeader(
      "User Types (Roles)",
      "Manage system roles and their configurations",
      <button 
        onClick={openAddModal}
        className="flex items-center justify-center gap-2 bg-primary hover:bg-primary-hover text-white px-5 py-2.5 rounded-[5px] text-sm font-semibold transition-all duration-200 shadow-sm"
      >
        <Plus className="w-4 h-4" />
        Add Role
      </button>
    );
    return () => resetHeader();
  }, [setHeader, resetHeader, openAddModal]);

  const fetchData = async () => {
    try {
      const res = await fetch('/api/roles');
      const data = await res.json();
      if (res.ok) {
        setRoles(data.roles);
      } else {
        toast.error(data.error || 'Failed to load roles');
      }
    } catch (err) {
      toast.error('Error fetching data');
    } finally {
      setLoading(false);
    }
  };

  // openAddModal is now defined above

  const openEditModal = (role: any) => {
    setFormData({
      id: role.id,
      name: formatRoleName(role.name),
      description: role.description || ''
    });
    setIsEditModalOpen(true);
  };

  const confirmDelete = (id: string) => {
    setDeletingId(id);
    setIsDeleteModalOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const isEdit = isEditModalOpen;
      const url = isEdit ? `/api/roles/${formData.id}` : '/api/roles';
      const method = isEdit ? 'PUT' : 'POST';

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });
      const data = await res.json();
      if (!res.ok) {
        toast.error(data.error || 'Failed to save role');
      } else {
        toast.success(isEdit ? 'Role updated successfully' : 'Role created successfully');
        setIsModalOpen(false);
        setIsEditModalOpen(false);
        fetchData();
      }
    } catch (err) {
      toast.error('Network error');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async () => {
    if (!deletingId) return;
    try {
      const res = await fetch(`/api/roles/${deletingId}`, { method: 'DELETE' });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to delete');
      toast.success('Role deleted successfully');
      fetchData();
    } catch (e: any) {
      toast.error(e.message || 'Could not delete role');
    } finally {
      setIsDeleteModalOpen(false);
      setDeletingId(null);
    }
  };

  const columns = useMemo<ColumnDef<any>[]>(
    () => [
      {
        accessorFn: (row) => row.name,
        id: 'name',
        header: () => <div className="uppercase">Role Name</div>,
        cell: ({ row }) => {
          const role = row.original;
          return (
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold shrink-0">
                <Shield className="w-5 h-5" />
              </div>
              <div>
                <p className="text-sm font-semibold text-foreground">{formatRoleName(role.name)}</p>
                <p className="text-xs text-muted font-mono">{role.name}</p>
              </div>
            </div>
          )
        },
      },
      {
        accessorFn: (row) => row.description,
        id: 'description',
        header: () => <div className="uppercase">Description</div>,
        cell: ({ getValue }) => <span className="text-sm text-muted line-clamp-2">{getValue() as string || '-'}</span>,
      },
      {
        accessorFn: (row) => row._count?.users || 0,
        id: 'users',
        header: () => <div className="uppercase">Assigned Users</div>,
        cell: ({ getValue }) => (
          <span className="inline-flex items-center px-2.5 py-1 rounded-[5px] text-xs font-semibold bg-surface-hover border border-border">
            {getValue() as number} users
          </span>
        ),
      },
      {
        id: 'actions',
        header: () => <div className="text-right uppercase">Actions</div>,
        cell: ({ row }) => {
          const role = row.original;
          return (
            <div className="flex items-center justify-end gap-2">
              <button 
                onClick={() => openEditModal(role)}
                className="p-2 text-muted hover:text-primary transition-colors rounded-[5px] hover:bg-primary-light"
                title="Edit Role"
              >
                <Edit className="w-4 h-4" />
              </button>
              <button 
                onClick={() => confirmDelete(role.id)}
                className="p-2 text-muted hover:text-danger transition-colors rounded-[5px] hover:bg-danger-light"
                title="Delete Role"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          )
        },
      }
    ],
    []
  );

  const table = useReactTable({
    data: roles,
    columns,
    getCoreRowModel: getCoreRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
  });

  if (loading) {
    return <div className="p-6 text-center text-muted text-sm">Loading roles...</div>;
  }

  return (
    <div className="space-y-6">
      {/* Header is now handled by useLayoutStore */}

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
              {table.getRowModel().rows?.length ? (
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
                    No roles found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add / Edit Role Modal */}
      {(isModalOpen || isEditModalOpen) && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4 animate-in fade-in duration-200">
          <div className="bg-surface w-full max-w-md rounded-xl shadow-xl overflow-hidden border border-border flex flex-col max-h-[90vh] animate-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between p-6 border-b border-border shrink-0">
              <h2 className="text-xl font-bold text-foreground flex items-center gap-2">
                <Shield className="w-5 h-5 text-primary" />
                {isEditModalOpen ? 'Edit Role' : 'Create New Role'}
              </h2>
              <button onClick={() => { setIsModalOpen(false); setIsEditModalOpen(false); }} className="text-muted hover:text-foreground">
                <X className="w-5 h-5" />
              </button>
            </div>
            <form onSubmit={handleSubmit} className="flex flex-col flex-1 overflow-hidden">
              <div className="p-6 space-y-4 overflow-y-auto">
                <div>
                  <label className="block text-sm font-medium text-foreground mb-1.5">Role Name</label>
                  <input required type="text" placeholder="e.g. System Admin" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} className="w-full px-4 py-2 border border-border rounded-[5px] placeholder:text-muted bg-background focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary text-sm" />
                  <p className="text-xs text-muted mt-1.5">Will be automatically formatted to uppercase with underscores (e.g., SYSTEM_ADMIN).</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-foreground mb-1.5">Description (Optional)</label>
                  <textarea placeholder="Briefly describe the purpose of this role..." value={formData.description} onChange={e => setFormData({...formData, description: e.target.value})} rows={3} className="w-full px-4 py-2 border border-border rounded-[5px] placeholder:text-muted bg-background focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary text-sm resize-none" />
                </div>
              </div>

              <div className="px-6 py-4 border-t border-border bg-surface shrink-0 flex justify-end gap-3">
                <button type="button" onClick={() => { setIsModalOpen(false); setIsEditModalOpen(false); }} className="px-4 py-2 text-sm font-medium text-muted hover:text-foreground bg-surface-hover hover:bg-border-light rounded-[5px] transition-colors">Cancel</button>
                <button type="submit" disabled={submitting} className="px-4 py-2 text-sm font-semibold text-white bg-primary hover:bg-primary-hover rounded-[5px] shadow-sm hover:shadow transition-all disabled:opacity-50">
                  {submitting ? 'Saving...' : (isEditModalOpen ? 'Save Changes' : 'Create Role')}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {isDeleteModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-surface w-full max-w-sm rounded-xl shadow-xl border border-border overflow-hidden animate-in zoom-in-95 duration-200">
            <div className="p-6 text-center space-y-4">
              <div className="w-12 h-12 bg-danger-light text-danger rounded-full flex items-center justify-center mx-auto mb-4">
                <Trash2 className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold text-foreground">Confirm Deletion</h3>
              <p className="text-sm text-muted">
                Are you sure you want to delete this role?
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
