'use client';

import { Plus, Search, Edit, Trash2, X, GraduationCap, Phone, Mail, Calendar, User, BookOpen, ClipboardCheck } from 'lucide-react';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import toast from 'react-hot-toast';

export default function ScholarsPage() {
  const router = useRouter();
  const [scholars, setScholars] = useState<any[]>([]);
  const [schools, setSchools] = useState<any[]>([]);
  const [departments, setDepartments] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const initialForm = {
    id: '',
    scholarId: '',
    enrollmentNumber: '',
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    country: '',
    dateOfBirth: '',
    gender: '',
    address: '',
    schoolId: '',
    departmentId: '',
    program: '',
    status: 'ACTIVE'
  };
  const [formData, setFormData] = useState(initialForm);

  const [currentUser, setCurrentUser] = useState<any>(null);

  const fetchData = async () => {
    try {
      const [scholarsRes, schoolsRes, deptsRes, authRes] = await Promise.all([
        fetch('/api/scholars'),
        fetch('/api/schools'),
        fetch('/api/departments'),
        fetch('/api/auth/me')
      ]);
      
      if (scholarsRes.ok && schoolsRes.ok && deptsRes.ok && authRes.ok) {
        const scholarsData = await scholarsRes.json();
        const schoolsData = await schoolsRes.json();
        const deptsData = await deptsRes.json();
        const authData = await authRes.json();
        
        setScholars(scholarsData.scholars || []);
        setSchools(schoolsData.schools || []);
        setDepartments(deptsData.departments || []);
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

  const openAddModal = () => {
    let presetSchoolId = '';
    if (currentUser?.rawRole === 'COORDINATOR' && currentUser?.schoolId) {
      presetSchoolId = currentUser.schoolId;
    }
    setFormData({ ...initialForm, schoolId: presetSchoolId });
    setIsModalOpen(true);
  };

  const openEditModal = (scholar: any) => {
    setFormData({
      id: scholar.id,
      scholarId: scholar.scholarId,
      enrollmentNumber: scholar.enrollmentNumber,
      firstName: scholar.firstName,
      lastName: scholar.lastName,
      email: scholar.email,
      phone: scholar.phone || '',
      country: scholar.country || '',
      dateOfBirth: scholar.dateOfBirth ? new Date(scholar.dateOfBirth).toISOString().split('T')[0] : '',
      gender: scholar.gender || '',
      address: scholar.address || '',
      schoolId: scholar.schoolId,
      departmentId: scholar.departmentId,
      program: scholar.program || '',
      status: scholar.status
    });
    setIsEditModalOpen(true);
  };
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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.scholarId || !formData.enrollmentNumber || !formData.firstName || !formData.lastName || !formData.email || !formData.schoolId || !formData.departmentId) {
      toast.error('Please fill all required fields');
      return;
    }
    setSubmitting(true);
    try {
      const isEdit = isEditModalOpen;
      const url = isEdit ? `/api/scholars/${formData.id}` : '/api/scholars';
      const method = isEdit ? 'PUT' : 'POST';

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });
      const data = await res.json();
      
      if (!res.ok) {
        toast.error(data.error || 'Failed to save scholar');
      } else {
        toast.success(isEdit ? 'Scholar updated successfully!' : 'Scholar added successfully!');
        setIsModalOpen(false);
        setIsEditModalOpen(false);
        fetchData();
        if (!isEdit && data.scholar?.id) {
          router.push(`/scholars/${data.scholar.id}/matriculation`);
        }
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
          <h1 className="text-2xl font-bold text-foreground">Ph.D. Scholars</h1>
          <p className="text-sm text-muted mt-1">Manage Ph.D. scholars across all university programs.</p>
        </div>
        <button 
          onClick={openAddModal}
          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-lg bg-primary hover:bg-primary-hover text-white font-semibold text-sm shadow-sm hover:shadow-md transition-all duration-200"
        >
          <Plus className="w-4 h-4" />
          Add Scholar
        </button>
      </div>

      {/* Data Table */}
      <div className="bg-surface rounded-xl shadow-sm border border-border overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-background border-b border-border text-left">
                <th className="py-4 px-6 text-xs font-semibold text-muted uppercase tracking-wider">ID & Enrollment</th>
                <th className="py-4 px-6 text-xs font-semibold text-muted uppercase tracking-wider">Name</th>
                <th className="py-4 px-6 text-xs font-semibold text-muted uppercase tracking-wider">Program / Dept</th>
                <th className="py-4 px-6 text-xs font-semibold text-muted uppercase tracking-wider">Joined Date</th>
                <th className="py-4 px-6 text-center text-xs font-semibold text-muted uppercase tracking-wider">Status</th>
                <th className="py-4 px-6 text-right text-xs font-semibold text-muted uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {loading ? (
                <tr>
                  <td colSpan={6} className="py-8 text-center text-muted">Loading scholars...</td>
                </tr>
              ) : scholars.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-8 text-center text-muted">No scholars found</td>
                </tr>
              ) : (
                scholars.map((scholar) => (
                  <tr key={scholar.id} className="hover:bg-surface-hover transition-colors">
                    <td className="py-4 px-6">
                      <p className="inline-flex items-center px-2.5 py-1 rounded-md bg-primary-light text-primary font-bold text-xs mb-1">
                        {scholar.scholarId}
                      </p>
                      <p className="text-xs text-muted font-mono">{scholar.enrollmentNumber}</p>
                    </td>
                    <td className="py-4 px-6">
                      <p className="text-sm font-medium text-foreground">{scholar.firstName} {scholar.lastName}</p>
                      <p className="text-xs text-muted mt-0.5">{scholar.school?.schoolName || 'University'}</p>
                    </td>
                    <td className="py-4 px-6 text-sm text-muted">
                      {scholar.program || scholar.department?.departmentName || 'N/A'}
                    </td>
                    <td className="py-4 px-6 text-sm font-medium text-foreground">
                      {new Date(scholar.createdAt).toLocaleDateString()}
                    </td>
                    <td className="py-4 px-6 text-center">
                      <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium ${
                        scholar.status === 'ACTIVE' ? 'bg-success-light text-success' : 
                        scholar.status === 'GRADUATED' ? 'bg-primary-light text-primary' : 'bg-warning-light text-warning'
                      }`}>
                        {scholar.status}
                      </span>
                    </td>
                    <td className="py-4 px-6 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button 
                          onClick={() => router.push(`/scholars/${scholar.id}/matriculation`)}
                          title="Matriculation Checklist"
                          className="p-2 text-muted hover:text-blue-600 transition-colors rounded-lg hover:bg-blue-50"
                        >
                          <ClipboardCheck className="w-4 h-4" />
                        </button>
                        <button 
                          onClick={() => openEditModal(scholar)}
                          className="p-2 text-muted hover:text-primary transition-colors rounded-lg hover:bg-primary-light"
                        >
                          <Edit className="w-4 h-4" />
                        </button>
                        <button 
                          onClick={() => confirmDelete(scholar.id)}
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

      {/* Add/Edit Scholar Modal */}
      {(isModalOpen || isEditModalOpen) && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-surface w-full max-w-2xl max-h-[90vh] flex flex-col rounded-2xl shadow-xl border border-border overflow-hidden animate-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between px-6 py-4 border-b border-border bg-background/50 shrink-0">
              <h3 className="text-lg font-semibold text-foreground flex items-center gap-2">
                <GraduationCap className="w-5 h-5 text-primary" />
                {isEditModalOpen ? 'Edit Scholar Profile' : 'Add New Scholar'}
              </h3>
              <button 
                onClick={() => { setIsModalOpen(false); setIsEditModalOpen(false); }}
                className="p-2 text-muted hover:text-foreground hover:bg-surface-hover rounded-lg transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            
            <form onSubmit={handleSubmit} className="flex flex-col flex-1 overflow-hidden">
              <div className="p-6 overflow-y-auto">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                
                {/* Academic Identity */}
                <div className="space-y-4 md:col-span-2">
                  <h4 className="text-xs font-bold text-muted uppercase tracking-wider border-b border-border pb-2">Academic Identity</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-foreground mb-1.5">Scholar ID *</label>
                      <input required type="text" value={formData.scholarId} onChange={(e) => setFormData({ ...formData, scholarId: e.target.value })} placeholder="e.g. STU1004" className="w-full px-4 py-2 rounded-lg border border-border bg-background focus:outline-none focus:ring-2 focus:ring-primary/20 text-sm" />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-foreground mb-1.5">Enrollment Number *</label>
                      <input required type="text" value={formData.enrollmentNumber} onChange={(e) => setFormData({ ...formData, enrollmentNumber: e.target.value })} placeholder="e.g. ENR-2026-001" className="w-full px-4 py-2 rounded-lg border border-border bg-background focus:outline-none focus:ring-2 focus:ring-primary/20 text-sm" />
                    </div>
                  </div>
                </div>

                {/* Personal Information */}
                <div className="space-y-4 md:col-span-2">
                  <h4 className="text-xs font-bold text-muted uppercase tracking-wider border-b border-border pb-2 mt-2">Personal Information</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-foreground mb-1.5">First Name *</label>
                      <input required type="text" value={formData.firstName} onChange={(e) => setFormData({ ...formData, firstName: e.target.value })} placeholder="First Name" className="w-full px-4 py-2 rounded-lg border border-border bg-background focus:outline-none focus:ring-2 focus:ring-primary/20 text-sm" />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-foreground mb-1.5">Last Name *</label>
                      <input required type="text" value={formData.lastName} onChange={(e) => setFormData({ ...formData, lastName: e.target.value })} placeholder="Last Name" className="w-full px-4 py-2 rounded-lg border border-border bg-background focus:outline-none focus:ring-2 focus:ring-primary/20 text-sm" />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-foreground mb-1.5">Email *</label>
                      <div className="relative">
                        <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted" />
                        <input required type="email" value={formData.email} onChange={(e) => setFormData({ ...formData, email: e.target.value })} placeholder="scholar@domain.edu" className="w-full pl-9 pr-4 py-2 rounded-lg border border-border bg-background focus:outline-none focus:ring-2 focus:ring-primary/20 text-sm" />
                      </div>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-foreground mb-1.5">Phone</label>
                      <div className="relative">
                        <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted" />
                        <input type="tel" value={formData.phone} onChange={(e) => setFormData({ ...formData, phone: e.target.value })} placeholder="+91 98765 43210" className="w-full pl-9 pr-4 py-2 rounded-lg border border-border bg-background focus:outline-none focus:ring-2 focus:ring-primary/20 text-sm" />
                      </div>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-foreground mb-1.5">Country</label>
                      <select value={formData.country} onChange={(e) => setFormData({ ...formData, country: e.target.value })} className="w-full px-4 py-2 rounded-lg border border-border bg-background focus:outline-none focus:ring-2 focus:ring-primary/20 text-sm">
                        <option value="">Select Country</option>
                        <option value="India">India</option>
                        <option value="United States">United States</option>
                        <option value="Canada">Canada</option>
                        <option value="United Kingdom">United Kingdom</option>
                        <option value="Australia">Australia</option>
                        <option value="New Zealand">New Zealand</option>
                        <option value="United Arab Emirates">United Arab Emirates</option>
                        <option value="Saudi Arabia">Saudi Arabia</option>
                        <option value="Singapore">Singapore</option>
                        <option value="Malaysia">Malaysia</option>
                        <option value="Germany">Germany</option>
                        <option value="France">France</option>
                        <option value="Italy">Italy</option>
                        <option value="Spain">Spain</option>
                        <option value="Netherlands">Netherlands</option>
                        <option value="Belgium">Belgium</option>
                        <option value="Switzerland">Switzerland</option>
                        <option value="Austria">Austria</option>
                        <option value="Sweden">Sweden</option>
                        <option value="Norway">Norway</option>
                        <option value="Denmark">Denmark</option>
                        <option value="Finland">Finland</option>
                        <option value="Portugal">Portugal</option>
                        <option value="Poland">Poland</option>
                        <option value="Russia">Russia</option>
                        <option value="Turkey">Turkey</option>
                        <option value="China">China</option>
                        <option value="Japan">Japan</option>
                        <option value="South Korea">South Korea</option>
                        <option value="Pakistan">Pakistan</option>
                        <option value="Bangladesh">Bangladesh</option>
                        <option value="Sri Lanka">Sri Lanka</option>
                        <option value="Nepal">Nepal</option>
                        <option value="Indonesia">Indonesia</option>
                        <option value="Philippines">Philippines</option>
                        <option value="Thailand">Thailand</option>
                        <option value="Vietnam">Vietnam</option>
                        <option value="Brazil">Brazil</option>
                        <option value="Mexico">Mexico</option>
                        <option value="Argentina">Argentina</option>
                        <option value="South Africa">South Africa</option>
                        <option value="Nigeria">Nigeria</option>
                        <option value="Kenya">Kenya</option>
                        <option value="Egypt">Egypt</option>
                        <option value="Iran">Iran</option>
                        <option value="Iraq">Iraq</option>
                        <option value="Jordan">Jordan</option>
                        <option value="Lebanon">Lebanon</option>
                        <option value="Israel">Israel</option>
                        <option value="Other">Other</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-foreground mb-1.5">Gender</label>
                      <select value={formData.gender} onChange={(e) => setFormData({ ...formData, gender: e.target.value })} className="w-full px-4 py-2 rounded-lg border border-border bg-background focus:outline-none focus:ring-2 focus:ring-primary/20 text-sm">
                        <option value="">Select Gender</option>
                        <option value="Male">Male</option>
                        <option value="Female">Female</option>
                        <option value="Other">Other</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-foreground mb-1.5">Date of Birth</label>
                      <div className="relative">
                        <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted pointer-events-none" />
                        <input type="date" value={formData.dateOfBirth} onChange={(e) => setFormData({ ...formData, dateOfBirth: e.target.value })} className="w-full pl-9 pr-4 py-2 rounded-lg border border-border bg-background focus:outline-none focus:ring-2 focus:ring-primary/20 text-sm" />
                      </div>
                    </div>
                  </div>
                </div>

                {/* Academic Placement */}
                <div className="space-y-4 md:col-span-2">
                  <h4 className="text-xs font-bold text-muted uppercase tracking-wider border-b border-border pb-2 mt-2">Academic Placement</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-foreground mb-1.5">School *</label>
                      <select 
                        required 
                        value={formData.schoolId} 
                        onChange={(e) => setFormData({ ...formData, schoolId: e.target.value })} 
                        disabled={currentUser?.rawRole === 'COORDINATOR'}
                        className="w-full px-4 py-2 rounded-lg border border-border bg-background focus:outline-none focus:ring-2 focus:ring-primary/20 text-sm disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        <option value="">Select School</option>
                        {schools.map(s => <option key={s.id} value={s.id}>{s.schoolName}</option>)}
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-foreground mb-1.5">Department *</label>
                      <select required value={formData.departmentId} onChange={(e) => setFormData({ ...formData, departmentId: e.target.value })} className="w-full px-4 py-2 rounded-lg border border-border bg-background focus:outline-none focus:ring-2 focus:ring-primary/20 text-sm">
                        <option value="">Select Department</option>
                        {departments.filter(d => !formData.schoolId || d.schoolId === formData.schoolId).map(d => (
                          <option key={d.id} value={d.id}>{d.departmentName}</option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-foreground mb-1.5">Program Name</label>
                      <input type="text" value={formData.program} onChange={(e) => setFormData({ ...formData, program: e.target.value })} placeholder="e.g. Ph.D. in AI" className="w-full px-4 py-2 rounded-lg border border-border bg-background focus:outline-none focus:ring-2 focus:ring-primary/20 text-sm" />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-foreground mb-1.5">Status</label>
                      <select value={formData.status} onChange={(e) => setFormData({ ...formData, status: e.target.value })} className="w-full px-4 py-2 rounded-lg border border-border bg-background focus:outline-none focus:ring-2 focus:ring-primary/20 text-sm">
                        <option value="ACTIVE">Active</option>
                        <option value="INACTIVE">Inactive</option>
                        <option value="GRADUATED">Graduated</option>
                        <option value="SUSPENDED">Suspended</option>
                      </select>
                    </div>
                  </div>
                </div>

              </div>
            </div>

            <div className="px-6 py-4 border-t border-border bg-background/50 flex gap-3 justify-end shrink-0">
                <button
                  type="button"
                  onClick={() => { setIsModalOpen(false); setIsEditModalOpen(false); }}
                  className="px-6 py-2.5 text-sm font-medium text-muted hover:text-foreground bg-surface-hover hover:bg-border-light rounded-lg transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-6 py-2.5 text-sm font-semibold text-white bg-primary hover:bg-primary-hover rounded-lg shadow-sm hover:shadow transition-all disabled:opacity-50"
                >
                  {submitting ? 'Saving...' : (isEditModalOpen ? 'Save Changes' : 'Create Scholar')}
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
                Are you sure you want to delete this scholar? This action cannot be undone.
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

