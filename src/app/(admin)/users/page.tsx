'use client';

import { useState, useEffect, useMemo } from 'react';
import { cn, timeAgo } from '@/lib/utils';
import {
  UserPlus,
  Search,
  Edit,
  Trash2,
  ChevronLeft,
  ChevronRight,
  X
} from 'lucide-react';
import toast from 'react-hot-toast';

const ITEMS_PER_PAGE = 10;

export default function UsersPage() {
  const [users, setUsers] = useState<any[]>([]);
  const [roles, setRoles] = useState<any[]>([]);
  const [schools, setSchools] = useState<any[]>([]);
  const [departments, setDepartments] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const [roleFilter, setRoleFilter] = useState('all');
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  
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
    email: '',
    password: '',
    roleId: '',
    schoolId: '',
    departmentId: ''
  });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const res = await fetch('/api/users');
      const data = await res.json();
      if (res.ok) {
        setUsers(data.users);
        setRoles(data.roles);
        setSchools(data.schools);
        setDepartments(data.departments);
      } else {
        toast.error(data.error || 'Failed to load users');
      }
    } catch (err) {
      toast.error('Error fetching data');
    } finally {
      setLoading(false);
    }
  };

  const filtered = useMemo(() => {
    let list = users;
    if (roleFilter !== 'all') {
      list = list.filter((u) => u.role?.name === roleFilter);
    }
    if (search.trim()) {
      const q = search.toLowerCase();
      list = list.filter(
        (u) =>
          u.name.toLowerCase().includes(q) ||
          u.email.toLowerCase().includes(q)
      );
    }
    return list;
  }, [users, roleFilter, search]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / ITEMS_PER_PAGE));
  const currentPage = Math.min(page, totalPages);
  const paged = filtered.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE
  );

  const handleRoleChange = (roleId: string) => {
    setFormData(prev => ({ ...prev, roleId, schoolId: '', departmentId: '' }));
  };

  const selectedRole = roles.find(r => r.id === formData.roleId);
  const needsSchool = selectedRole && (selectedRole.name === 'DEAN' || selectedRole.name === 'COORDINATOR');
  const needsDepartment = selectedRole && (selectedRole.name === 'HOD');

  const openAddModal = () => {
    setFormData({ id: '', name: '', email: '', password: '', roleId: '', schoolId: '', departmentId: '' });
    setIsModalOpen(true);
  };

  const openEditModal = (user: any) => {
    setFormData({
      id: user.id,
      name: user.name,
      email: user.email,
      password: '', // Blank for security
      roleId: user.roleId || '',
      schoolId: user.schoolId || '',
      departmentId: user.departmentId || ''
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
      const url = isEdit ? `/api/users/${formData.id}` : '/api/users';
      const method = isEdit ? 'PUT' : 'POST';

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });
      const data = await res.json();
      if (!res.ok) {
        toast.error(data.error || 'Failed to save user');
      } else {
        toast.success(isEdit ? 'User updated successfully' : 'User created successfully');
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
      const res = await fetch(`/api/users/${deletingId}`, { method: 'DELETE' });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to delete');
      toast.success('User deleted successfully');
      fetchData();
    } catch (e: any) {
      toast.error(e.message || 'Could not delete user');
    } finally {
      setIsDeleteModalOpen(false);
      setDeletingId(null);
    }
  };

  const uniqueRoles = Array.from(new Set(users.map(u => u.role?.name))).filter(Boolean);

  if (loading) {
    return <div className="p-6 text-center text-muted text-sm">Loading users...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-foreground">System Users</h1>
          <p className="text-sm text-muted mt-1">
            {users.length} total users
          </p>
        </div>
        <button 
          onClick={openAddModal}
          className="flex items-center justify-center gap-2 bg-primary hover:bg-primary-hover text-white px-5 py-2.5 rounded-xl text-sm font-semibold transition-all duration-200 shadow-sm"
        >
          <UserPlus className="w-4 h-4" />
          Add User
        </button>
      </div>
      <div className="flex flex-col sm:flex-row items-center gap-4">
        <div className="relative w-full sm:w-64">
          <select
            value={roleFilter}
            onChange={(e) => {
              setRoleFilter(e.target.value);
              setPage(1);
            }}
            className="w-full px-4 py-2.5 rounded-xl border border-border bg-surface text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/30 appearance-none"
          >
            <option value="all">All Roles</option>
            {uniqueRoles.map((role: any) => (
              <option key={role} value={role}>
                {role.replace('_', ' ')}
              </option>
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
            placeholder="Search by name or email..."
            value={search}
            onChange={(e) => { setSearch(e.target.value); setPage(1); }}
            className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-border bg-surface text-sm text-foreground placeholder:text-muted focus:outline-none focus:ring-2 focus:ring-primary/30"
          />
        </div>
      </div>

      <div className="bg-surface rounded-xl border border-border shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-border bg-background/50">
                <th className="text-left text-xs font-semibold text-muted uppercase tracking-wider px-5 py-3.5">Name</th>
                <th className="text-left text-xs font-semibold text-muted uppercase tracking-wider px-5 py-3.5">Role</th>
                <th className="text-left text-xs font-semibold text-muted uppercase tracking-wider px-5 py-3.5">Association</th>
                <th className="text-left text-xs font-semibold text-muted uppercase tracking-wider px-5 py-3.5">Joined</th>
                <th className="text-right text-xs font-semibold text-muted uppercase tracking-wider px-5 py-3.5">Actions</th>
              </tr>
            </thead>
            <tbody>
              {paged.length === 0 ? (
                <tr>
                  <td colSpan={5} className="text-center py-16 text-muted text-sm">No users found</td>
                </tr>
              ) : (
                paged.map((user) => (
                  <tr key={user.id} className="border-b border-border-light last:border-b-0 hover:bg-background/60">
                    <td className="px-5 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold shrink-0">
                          {user.name.charAt(0)}
                        </div>
                        <div>
                          <p className="text-sm font-semibold text-foreground">{user.name}</p>
                          <p className="text-xs text-muted">{user.email}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-5 py-4">
                      <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold bg-primary-light text-primary">
                        {user.role?.name.replace('_', ' ')}
                      </span>
                    </td>
                    <td className="px-5 py-4 text-sm text-muted">
                      {user.department?.departmentName || user.school?.schoolName || 'University'}
                    </td>
                    <td className="px-5 py-4 text-sm text-muted">
                      {new Date(user.createdAt).toLocaleDateString()}
                    </td>
                    <td className="px-5 py-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button 
                          onClick={() => openEditModal(user)}
                          className="p-2 text-muted hover:text-primary transition-colors rounded-lg hover:bg-primary-light"
                        >
                          <Edit className="w-4 h-4" />
                        </button>
                        <button 
                          onClick={() => confirmDelete(user.id)}
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
        {/* Pagination Details (optional depending on needs) */}
      </div>

      {/* Add / Edit User Modal */}
      {(isModalOpen || isEditModalOpen) && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4 animate-in fade-in duration-200">
          <div className="bg-surface w-full max-w-md rounded-2xl shadow-xl overflow-hidden border border-border animate-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between p-6 border-b border-border">
              <h2 className="text-xl font-bold text-foreground">
                {isEditModalOpen ? 'Edit User' : 'Create New User'}
              </h2>
              <button onClick={() => { setIsModalOpen(false); setIsEditModalOpen(false); }} className="text-muted hover:text-foreground">
                <X className="w-5 h-5" />
              </button>
            </div>
            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-foreground mb-1.5">Name</label>
                <input required type="text" placeholder="e.g. Dr. John Doe" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} className="w-full px-4 py-2 border border-border rounded-lg placeholder:text-muted bg-background focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary text-sm" />
              </div>
              <div>
                <label className="block text-sm font-medium text-foreground mb-1.5">Email</label>
                <input required type="email" placeholder="e.g. john.doe@sharda.edu" value={formData.email} onChange={e => setFormData({...formData, email: e.target.value})} className="w-full px-4 py-2 border border-border rounded-lg placeholder:text-muted bg-background focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary text-sm" />
              </div>
              <div>
                <label className="block text-sm font-medium text-foreground mb-1.5">
                  {isEditModalOpen ? 'Password (leave blank to keep current)' : 'Password'}
                </label>
                <input required={!isEditModalOpen} type="password" placeholder={isEditModalOpen ? 'Leave blank to keep unchanged' : 'Create a strong password'} value={formData.password} onChange={e => setFormData({...formData, password: e.target.value})} className="w-full px-4 py-2 border border-border rounded-lg placeholder:text-muted bg-background focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary text-sm" />
              </div>
              <div>
                <label className="block text-sm font-medium text-foreground mb-1.5">Role</label>
                <select required value={formData.roleId} onChange={e => handleRoleChange(e.target.value)} className="w-full px-4 py-2 border border-border rounded-lg bg-background focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary text-sm">
                  <option value="">Select Role</option>
                  {roles.map(r => (
                    <option key={r.id} value={r.id}>{r.name.replace('_', ' ')}</option>
                  ))}
                </select>
              </div>

              {needsSchool && (
                <div>
                  <label className="block text-sm font-medium text-foreground mb-1.5">Associated School</label>
                  <select required value={formData.schoolId} onChange={e => setFormData({...formData, schoolId: e.target.value})} className="w-full px-4 py-2 border border-border rounded-lg bg-background focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary text-sm">
                    <option value="">Select School</option>
                    {schools.map(s => (
                      <option key={s.id} value={s.id}>{s.schoolName}</option>
                    ))}
                  </select>
                </div>
              )}

              {needsDepartment && (
                <div>
                  <label className="block text-sm font-medium text-foreground mb-1.5">Associated Department</label>
                  <select required value={formData.departmentId} onChange={e => setFormData({...formData, departmentId: e.target.value})} className="w-full px-4 py-2 border border-border rounded-lg bg-background focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary text-sm">
                    <option value="">Select Department</option>
                    {departments.map(d => (
                      <option key={d.id} value={d.id}>{d.departmentName}</option>
                    ))}
                  </select>
                </div>
              )}

              <div className="pt-4 flex justify-end gap-3">
                <button type="button" onClick={() => { setIsModalOpen(false); setIsEditModalOpen(false); }} className="px-4 py-2 text-sm font-medium text-muted hover:text-foreground bg-surface-hover hover:bg-border-light rounded-lg transition-colors">Cancel</button>
                <button type="submit" disabled={submitting} className="px-4 py-2 text-sm font-semibold text-white bg-primary hover:bg-primary-hover rounded-lg shadow-sm hover:shadow transition-all disabled:opacity-50">
                  {submitting ? 'Saving...' : (isEditModalOpen ? 'Save Changes' : 'Create User')}
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
                Are you sure you want to delete this user? This action cannot be undone.
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