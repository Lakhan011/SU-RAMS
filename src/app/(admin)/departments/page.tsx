'use client';

import { Plus, Search, Edit, Trash2, X } from 'lucide-react';
import { useState, useEffect } from 'react';
import toast from 'react-hot-toast';

export default function DepartmentsPage() {
  const [departments, setDepartments] = useState<any[]>([]);
  const [schools, setSchools] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  
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

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Departments Directory</h1>
          <p className="text-sm text-muted mt-1">Manage university departments.</p>
        </div>
        <button 
          onClick={() => setIsAddModalOpen(true)}
          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-lg bg-primary hover:bg-primary-hover text-white font-semibold text-sm shadow-sm hover:shadow-md transition-all duration-200"
        >
          <Plus className="w-4 h-4" />
          Add Department
        </button>
      </div>

      {/* Data Table */}
      <div className="bg-surface rounded-xl shadow-sm border border-border overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-background border-b border-border">
                <th className="py-4 px-6 text-xs font-semibold text-muted uppercase tracking-wider">Department Code</th>
                <th className="py-4 px-6 text-xs font-semibold text-muted uppercase tracking-wider">Department Name</th>
                <th className="py-4 px-6 text-xs font-semibold text-muted uppercase tracking-wider">School</th>
                <th className="py-4 px-6 text-xs font-semibold text-muted uppercase tracking-wider">Scholars</th>
                <th className="py-4 px-6 text-xs font-semibold text-muted uppercase tracking-wider text-center">Status</th>
                <th className="py-4 px-6 text-xs font-semibold text-muted uppercase tracking-wider text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {loading ? (
                <tr>
                  <td colSpan={6} className="py-8 text-center text-muted">Loading departments...</td>
                </tr>
              ) : departments.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-8 text-center text-muted">No departments found</td>
                </tr>
              ) : (
                departments.map((department) => (
                  <tr key={department.id} className="hover:bg-surface-hover transition-colors">
                    <td className="py-4 px-6">
                      <span className="inline-flex items-center px-2.5 py-1 rounded-md bg-primary-light text-primary font-bold text-xs">
                        {department.departmentCode}
                      </span>
                    </td>
                    <td className="py-4 px-6">
                      <p className="text-sm font-medium text-foreground">{department.departmentName}</p>
                    </td>
                    <td className="py-4 px-6 text-sm text-muted">
                      {department.school?.schoolName}
                    </td>
                    <td className="py-4 px-6 text-sm font-medium text-foreground">
                      {department._count?.scholars || 0}
                    </td>
                    <td className="py-4 px-6 text-center">
                      <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium ${
                        department.status === 'ACTIVE' ? 'bg-success-light text-success' : 'bg-warning-light text-warning'
                      }`}>
                        {department.status}
                      </span>
                    </td>
                    <td className="py-4 px-6 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button 
                          onClick={() => openEditModal(department)}
                          className="p-2 text-muted hover:text-primary transition-colors rounded-lg hover:bg-primary-light"
                        >
                          <Edit className="w-4 h-4" />
                        </button>
                        <button 
                          onClick={() => confirmDelete(department.id)}
                          className="p-2 text-muted hover:text-danger transition-colors rounded-lg hover:bg-danger-light"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
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
                className="p-2 text-muted hover:text-foreground hover:bg-surface-hover rounded-lg transition-colors"
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
                  className="w-full px-4 py-2 rounded-lg border border-border bg-background focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary text-sm"
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
                  className="w-full px-4 py-2 rounded-lg border border-border bg-background focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary text-sm"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-foreground mb-1.5">Associated School</label>
                <select
                  value={newDepartment.schoolId}
                  onChange={(e) => setNewDepartment({ ...newDepartment, schoolId: e.target.value })}
                  className="w-full px-4 py-2 rounded-lg border border-border bg-background focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary text-sm"
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
                  className="w-full px-4 py-2 rounded-lg border border-border bg-background focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary text-sm"
                >
                  <option value="ACTIVE">Active</option>
                  <option value="INACTIVE">Inactive</option>
                </select>
              </div>

              <div className="pt-4 flex gap-3 justify-end">
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  className="px-4 py-2 text-sm font-medium text-muted hover:text-foreground bg-surface-hover hover:bg-border-light rounded-lg transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-4 py-2 text-sm font-semibold text-white bg-primary hover:bg-primary-hover rounded-lg shadow-sm hover:shadow transition-all disabled:opacity-50"
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
                className="p-2 text-muted hover:text-foreground hover:bg-surface-hover rounded-lg transition-colors"
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
                  className="w-full px-4 py-2 rounded-lg border border-border bg-background focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary text-sm"
                  autoFocus
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-foreground mb-1.5">Department Name</label>
                <input
                  type="text"
                  value={editingDepartment.departmentName}
                  onChange={(e) => setEditingDepartment({ ...editingDepartment, departmentName: e.target.value })}
                  placeholder="e.g. Department of Computer Science"
                  className="w-full px-4 py-2 rounded-lg border border-border bg-background focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary text-sm"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-foreground mb-1.5">Associated School</label>
                <select
                  value={editingDepartment.schoolId}
                  onChange={(e) => setEditingDepartment({ ...editingDepartment, schoolId: e.target.value })}
                  className="w-full px-4 py-2 rounded-lg border border-border bg-background focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary text-sm"
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
                  className="w-full px-4 py-2 rounded-lg border border-border bg-background focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary text-sm"
                >
                  <option value="ACTIVE">Active</option>
                  <option value="INACTIVE">Inactive</option>
                </select>
              </div>

              <div className="pt-4 flex gap-3 justify-end">
                <button
                  type="button"
                  onClick={() => setIsEditModalOpen(false)}
                  className="px-4 py-2 text-sm font-medium text-muted hover:text-foreground bg-surface-hover hover:bg-border-light rounded-lg transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-4 py-2 text-sm font-semibold text-white bg-primary hover:bg-primary-hover rounded-lg shadow-sm hover:shadow transition-all disabled:opacity-50"
                >
                  {submitting ? 'Saving...' : 'Save Changes'}
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
                type="button"
                onClick={() => { setIsDeleteModalOpen(false); setDeletingId(null); }}
                className="px-4 py-2 text-sm font-medium text-muted hover:text-foreground bg-surface-hover hover:bg-border-light rounded-lg transition-colors"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleDelete}
                className="px-4 py-2 text-sm font-semibold text-white bg-danger hover:bg-red-600 rounded-lg shadow-sm hover:shadow transition-all"
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
