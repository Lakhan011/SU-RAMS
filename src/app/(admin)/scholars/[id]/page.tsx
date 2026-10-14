'use client';

import { useState, useEffect, useMemo, useCallback, use } from 'react';
import { useRouter } from 'next/navigation';
import { 
  User, 
  FileCheck, 
  BookOpen, 
  MonitorPlay,
  Mail,
  Phone,
  Calendar,
  Save,
  ArrowLeft,
  ChevronRight,
  GraduationCap
} from 'lucide-react';
import toast from 'react-hot-toast';
import { useLayoutStore } from '@/store/useLayoutStore';
import MatriculationView from '@/components/scholars/MatriculationView';
import ExamsView from '@/components/scholars/ExamsView';
import PresentationView from '@/components/scholars/PresentationView';
import Link from 'next/link';

export default function ScholarDetailsPage({ params }: { params: Promise<{ id: string }> }) {
  const router = useRouter();
  const resolvedParams = use(params);
  const scholarIdParam = resolvedParams.id;
  const isNew = scholarIdParam === 'new';

  const [activeTab, setActiveTab] = useState<'profile' | 'matriculation' | 'exams' | 'drc-presentation' | 'src-presentation'>('profile');
  const [loading, setLoading] = useState(!isNew);
  const [submitting, setSubmitting] = useState(false);
  
  const [schools, setSchools] = useState<any[]>([]);
  const [departments, setDepartments] = useState<any[]>([]);
  const [supervisors, setSupervisors] = useState<any[]>([]);
  const [courses, setCourses] = useState<any[]>([]);
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [scholars, setScholars] = useState<any[]>([]);

  const initialForm = useMemo(() => ({
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
    status: 'ACTIVE',
    supervisorId: '',
    courseIds: [] as string[]
  }), []);
  
  const [formData, setFormData] = useState(initialForm);

  const setHeader = useLayoutStore((state) => state.setHeader);
  const resetHeader = useLayoutStore((state) => state.resetHeader);

  const fetchDependencies = async () => {
    try {
      const [schoolsRes, deptsRes, authRes, coursesRes, supRes, scholarsRes] = await Promise.all([
        fetch('/api/schools'),
        fetch('/api/departments'),
        fetch('/api/auth/me'),
        fetch('/api/courses'),
        fetch('/api/supervisors'),
        fetch('/api/scholars')
      ]);
      
      if (schoolsRes.ok) setSchools((await schoolsRes.json()).schools || []);
      if (deptsRes.ok) setDepartments((await deptsRes.json()).departments || []);
      if (authRes.ok) setCurrentUser(await authRes.json());
      if (coursesRes.ok) setCourses((await coursesRes.json()).courses || []);
      if (supRes.ok) setSupervisors((await supRes.json()).supervisors || []);
      if (scholarsRes.ok) setScholars((await scholarsRes.json()).scholars || []);
    } catch (e) {
      console.error(e);
    }
  };

  const fetchScholar = useCallback(async () => {
    try {
      setLoading(true);
      const res = await fetch(`/api/scholars/${scholarIdParam}`);
      const data = await res.json();
      
      if (res.ok && data.scholar) {
        const fullScholar = data.scholar;
        setFormData({
          id: fullScholar.id,
          scholarId: fullScholar.scholarId,
          enrollmentNumber: fullScholar.enrollmentNumber,
          firstName: fullScholar.firstName,
          lastName: fullScholar.lastName,
          email: fullScholar.email,
          phone: fullScholar.phone || '',
          country: fullScholar.country || '',
          dateOfBirth: fullScholar.dateOfBirth ? new Date(fullScholar.dateOfBirth).toISOString().split('T')[0] : '',
          gender: fullScholar.gender || '',
          address: fullScholar.address || '',
          schoolId: fullScholar.schoolId,
          departmentId: fullScholar.departmentId,
          program: fullScholar.program || '',
          status: fullScholar.status,
          supervisorId: fullScholar.supervisor?.supervisorId ? String(fullScholar.supervisor.supervisorId) : '',
          courseIds: fullScholar.courses?.map((c: any) => String(c.courseId)) || []
        });
      } else {
        toast.error('Failed to load scholar details');
        router.push('/scholars');
      }
    } catch (e) {
      toast.error('An error occurred while loading scholar');
      router.push('/scholars');
    } finally {
      setLoading(false);
    }
  }, [scholarIdParam, router]);

  useEffect(() => {
    fetchDependencies();
    if (!isNew) {
      fetchScholar();
    } else {
      setLoading(false);
    }
  }, [isNew, fetchScholar]);

  useEffect(() => {
    const title = isNew ? "New Scholar" : `${formData.firstName} ${formData.lastName}`;
    const subtitle = isNew ? "Add a new Ph.D. Scholar to the system" : `Manage details for ${formData.scholarId}`;
    
    setHeader(
      title,
      subtitle,
      <Link href="/scholars" className="px-4 py-2.5 rounded-[5px] hover:bg-slate-200 bg-slate-100 text-slate-700 font-semibold text-sm transition-colors flex items-center gap-2">
        <ArrowLeft className="w-4 h-4" />
        Back to Scholars
      </Link>
    );
    return () => resetHeader();
  }, [setHeader, resetHeader, isNew, formData.firstName, formData.lastName, formData.scholarId]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!['SUPER_ADMIN', 'RDC_ADMIN', 'COORDINATOR'].includes(currentUser?.rawRole)) {
      toast.error('You do not have permission to edit scholar profiles.');
      return;
    }
    if (!formData.scholarId || !formData.enrollmentNumber || !formData.firstName || !formData.lastName || !formData.email || !formData.schoolId || !formData.departmentId) {
      toast.error('Please fill all required fields');
      return;
    }
    setSubmitting(true);
    try {
      const url = isNew ? '/api/scholars' : `/api/scholars/${formData.id}`;
      const method = isNew ? 'POST' : 'PUT';

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });
      const data = await res.json();
      
      if (!res.ok) {
        toast.error(data.error || 'Failed to save scholar');
      } else {
        toast.success(isNew ? 'Scholar added successfully!' : 'Scholar updated successfully!');
        if (isNew && data.scholar?.id) {
          router.push(`/scholars/${data.scholar.id}`);
        } else {
          fetchDependencies();
          fetchScholar();
        }
      }
    } catch (e) {
      toast.error('An error occurred');
    } finally {
      setSubmitting(false);
    }
  };

  const navItems = [
    { id: 'profile', icon: <User className="w-4 h-4" />, label: 'Profile Details' },
    { id: 'matriculation', icon: <FileCheck className="w-4 h-4" />, label: 'Matriculation Checklist' },
    { id: 'exams', icon: <BookOpen className="w-4 h-4" />, label: 'Exams' },
    { id: 'drc-presentation', icon: <MonitorPlay className="w-4 h-4" />, label: 'DRC Presentation' },
    { id: 'src-presentation', icon: <MonitorPlay className="w-4 h-4" />, label: 'SRC Presentation' },
  ] as const;

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="text-muted text-sm">Loading scholar details...</div>
      </div>
    );
  }

  return (
    <div className="flex flex-col md:flex-row gap-6">
      
      {/* Sidebar Navigation */}
      <div className="w-full md:w-64 shrink-0">
        <div className="bg-surface rounded-[5px] border border-border shadow-sm p-3 sticky top-6">
          <nav className="flex flex-col gap-1">
            {navItems.map((item) => {
              const isDisabled = !formData.id && item.id !== 'profile';
              return (
                <button
                  key={item.id}
                  disabled={isDisabled}
                  onClick={() => !isDisabled && setActiveTab(item.id)}
                  className={`
                    w-full flex items-center gap-3 px-3 py-2.5 rounded-[5px] text-sm font-medium transition-colors
                    ${activeTab === item.id 
                      ? 'bg-primary-light text-primary' 
                      : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
                    }
                    ${isDisabled ? 'opacity-50 cursor-not-allowed' : ''}
                  `}
                >
                  <span className={`${activeTab === item.id ? 'text-primary' : 'text-slate-400'}`}>
                    {item.icon}
                  </span>
                  <span className="flex-1 text-left">{item.label}</span>
                  {activeTab === item.id && (
                    <ChevronRight className="w-4 h-4 ml-auto" />
                  )}
                </button>
              );
            })}
          </nav>

          <div className="mt-8 pt-4 border-t border-border">
            <div className="flex items-center gap-3 px-3 py-2 text-sm text-slate-500">
              <div className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center shrink-0">
                <GraduationCap className="w-4 h-4 text-slate-400" />
              </div>
              <div>
                <p className="font-semibold text-slate-700">{formData.scholarId || 'Unassigned'}</p>
                <p className="text-xs">{formData.status}</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="flex-1 min-w-0">
        <div className="bg-surface rounded-[5px] border border-border shadow-sm overflow-hidden min-h-[600px]">
          
          {activeTab === 'profile' && (
            <form onSubmit={handleSubmit} className="flex flex-col h-full">
              <div className="p-6 md:p-8 space-y-8 flex-1">
                
                {/* Academic Identity */}
                <div className="space-y-4">
                  <h4 className="text-xs font-bold text-muted uppercase tracking-wider border-b border-border pb-2">Academic Identity</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                    <div>
                      <label className="block text-sm font-medium text-foreground mb-1.5">Scholar ID *</label>
                      <input required type="text" value={formData.scholarId} onChange={(e) => setFormData({ ...formData, scholarId: e.target.value })} placeholder="e.g. STU1004" className="w-full px-4 py-2 rounded-[5px] border border-border bg-background focus:outline-none focus:ring-2 focus:ring-primary/20 text-sm" />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-foreground mb-1.5">Enrollment Number *</label>
                      <input required type="text" value={formData.enrollmentNumber} onChange={(e) => setFormData({ ...formData, enrollmentNumber: e.target.value })} placeholder="e.g. ENR-2026-001" className="w-full px-4 py-2 rounded-[5px] border border-border bg-background focus:outline-none focus:ring-2 focus:ring-primary/20 text-sm" />
                    </div>
                  </div>
                </div>

                {/* Personal Information */}
                <div className="space-y-4">
                  <h4 className="text-xs font-bold text-muted uppercase tracking-wider border-b border-border pb-2">Personal Information</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                    <div>
                      <label className="block text-sm font-medium text-foreground mb-1.5">First Name *</label>
                      <input required type="text" value={formData.firstName} onChange={(e) => setFormData({ ...formData, firstName: e.target.value })} placeholder="First Name" className="w-full px-4 py-2 rounded-[5px] border border-border bg-background focus:outline-none focus:ring-2 focus:ring-primary/20 text-sm" />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-foreground mb-1.5">Last Name *</label>
                      <input required type="text" value={formData.lastName} onChange={(e) => setFormData({ ...formData, lastName: e.target.value })} placeholder="Last Name" className="w-full px-4 py-2 rounded-[5px] border border-border bg-background focus:outline-none focus:ring-2 focus:ring-primary/20 text-sm" />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-foreground mb-1.5">Email *</label>
                      <div className="relative">
                        <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted" />
                        <input required type="email" value={formData.email} onChange={(e) => setFormData({ ...formData, email: e.target.value })} placeholder="scholar@domain.edu" className="w-full pl-9 pr-4 py-2 rounded-[5px] border border-border bg-background focus:outline-none focus:ring-2 focus:ring-primary/20 text-sm" />
                      </div>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-foreground mb-1.5">Phone</label>
                      <div className="relative">
                        <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted" />
                        <input type="tel" value={formData.phone} onChange={(e) => setFormData({ ...formData, phone: e.target.value })} placeholder="+91 98765 43210" className="w-full pl-9 pr-4 py-2 rounded-[5px] border border-border bg-background focus:outline-none focus:ring-2 focus:ring-primary/20 text-sm" />
                      </div>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-foreground mb-1.5">Country</label>
                      <select value={formData.country} onChange={(e) => setFormData({ ...formData, country: e.target.value })} className="w-full px-4 py-2 rounded-[5px] border border-border bg-background focus:outline-none focus:ring-2 focus:ring-primary/20 text-sm">
                        <option value="">Select Country</option>
                        <option value="India">India</option>
                        <option value="United States">United States</option>
                        <option value="United Kingdom">United Kingdom</option>
                        <option value="Other">Other</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-foreground mb-1.5">Gender</label>
                      <select value={formData.gender} onChange={(e) => setFormData({ ...formData, gender: e.target.value })} className="w-full px-4 py-2 rounded-[5px] border border-border bg-background focus:outline-none focus:ring-2 focus:ring-primary/20 text-sm">
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
                        <input type="date" value={formData.dateOfBirth} onChange={(e) => setFormData({ ...formData, dateOfBirth: e.target.value })} className="w-full pl-9 pr-4 py-2 rounded-[5px] border border-border bg-background focus:outline-none focus:ring-2 focus:ring-primary/20 text-sm" />
                      </div>
                    </div>
                  </div>
                </div>

                {/* Academic Placement */}
                <div className="space-y-4">
                  <h4 className="text-xs font-bold text-muted uppercase tracking-wider border-b border-border pb-2">Academic Placement</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                    <div>
                      <label className="block text-sm font-medium text-foreground mb-1.5">School *</label>
                      <select 
                        required 
                        value={formData.schoolId} 
                        onChange={(e) => setFormData({ ...formData, schoolId: e.target.value })} 
                        disabled={currentUser?.rawRole === 'COORDINATOR'}
                        className="w-full px-4 py-2 rounded-[5px] border border-border bg-background focus:outline-none focus:ring-2 focus:ring-primary/20 text-sm disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        <option value="">Select School</option>
                        {schools.map(s => <option key={s.id} value={s.id}>{s.schoolName}</option>)}
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-foreground mb-1.5">Department *</label>
                      <select required value={formData.departmentId} onChange={(e) => setFormData({ ...formData, departmentId: e.target.value })} className="w-full px-4 py-2 rounded-[5px] border border-border bg-background focus:outline-none focus:ring-2 focus:ring-primary/20 text-sm">
                        <option value="">Select Department</option>
                        {departments.filter(d => !formData.schoolId || d.schoolId === formData.schoolId).map(d => (
                          <option key={d.id} value={d.id}>{d.departmentName}</option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-foreground mb-1.5">Program Name</label>
                      <input type="text" value={formData.program} onChange={(e) => setFormData({ ...formData, program: e.target.value })} placeholder="e.g. Ph.D. in AI" className="w-full px-4 py-2 rounded-[5px] border border-border bg-background focus:outline-none focus:ring-2 focus:ring-primary/20 text-sm" />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-foreground mb-1.5">Status</label>
                      <select value={formData.status} onChange={(e) => setFormData({ ...formData, status: e.target.value })} className="w-full px-4 py-2 rounded-[5px] border border-border bg-background focus:outline-none focus:ring-2 focus:ring-primary/20 text-sm">
                        <option value="ACTIVE">Active</option>
                        <option value="INACTIVE">Inactive</option>
                        <option value="GRADUATED">Graduated</option>
                        <option value="SUSPENDED">Suspended</option>
                      </select>
                    </div>

                    {/* Supervisor Assignment */}
                    {(() => {
                      const currentScholar = scholars.find((s: any) => s.id === formData.id);
                      const dept = departments.find(d => d.id === formData.departmentId);
                      const hasHod = dept?._count?.users > 0;

                      const hodVerified = currentScholar?.verifications?.find((v: any) => v.stage === 'HOD');
                      const deanVerified = currentScholar?.verifications?.find((v: any) => v.stage === 'DEAN');
                      const isVerified = deanVerified && (!hasHod || hodVerified);

                      const isCoordinator = currentUser?.rawRole === 'COORDINATOR';
                      const isRdcMember = ['SUPER_ADMIN', 'ADMIN', 'VC', 'RDC_ADMIN'].includes(currentUser?.rawRole);
                      
                      if (!isCoordinator && !isRdcMember) {
                        return null;
                      }

                      if (!isCoordinator) {
                        const currentCourseId = formData.courseIds?.[0];
                        const currentCourse = courses.find(c => c.id === currentCourseId);
                        const currentSupervisor = supervisors.find(s => s.id === formData.supervisorId);
                        
                        const handleVerifyAssignment = async (stage: string) => {
                          try {
                            const res = await fetch(`/api/scholars/${formData.id}/assignments/verify`, {
                              method: 'POST',
                              headers: { 'Content-Type': 'application/json' },
                              body: JSON.stringify({ stage })
                            });
                            if (res.ok) {
                              toast.success(`Assignments verified!`);
                              fetchDependencies();
                            } else {
                              toast.error(`Verification failed`);
                            }
                          } catch(e) {}
                        };

                        const currentStatus = currentScholar?.supervisor?.status;
                        const canVerifyRdc = isRdcMember && currentStatus !== 'VERIFIED_RDC';

                        const stageName = 'RDC';

                        let displayStatus = currentStatus || 'UNASSIGNED';
                        if (currentStatus === 'VERIFIED_RDC') displayStatus = 'VERIFIED RDC';

                        return (
                          <div className="md:col-span-2 mt-2 space-y-4">
                            <div className="p-5 rounded-[5px] border border-slate-200 bg-slate-50">
                              <div className="flex justify-between items-start mb-4">
                                <div>
                                  <h4 className="text-sm font-bold text-slate-800">Course & Supervisor Assignment</h4>
                                  <p className="text-xs text-slate-500 mt-1">Review the assignments made by the Coordinator. Status: <span className="font-semibold text-blue-600">{displayStatus}</span></p>
                                </div>
                                {canVerifyRdc && (formData.supervisorId || (formData.courseIds && formData.courseIds.length > 0)) && (
                                  <button 
                                    type="button"
                                    onClick={() => handleVerifyAssignment(stageName)}
                                    className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold rounded-[5px] shadow-sm transition-colors"
                                  >
                                    Verify as {stageName}
                                  </button>
                                )}
                              </div>
                              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                  <label className="block text-xs font-medium text-slate-500 mb-1">Assigned Course</label>
                                  <div className="text-sm font-medium text-slate-800">
                                    {currentCourse ? `${currentCourse.courseCode} - ${currentCourse.courseName}` : 'No course assigned yet'}
                                  </div>
                                </div>
                                <div>
                                  <label className="block text-xs font-medium text-slate-500 mb-1">Assigned Supervisor</label>
                                  <div className="text-sm font-medium text-slate-800">
                                    {currentSupervisor ? `${currentSupervisor.name} (${currentSupervisor.email})` : 'No supervisor assigned yet'}
                                  </div>
                                </div>
                              </div>
                            </div>
                          </div>
                        );
                      }
                      
                      return (
                        <div className="md:col-span-2 mt-2 space-y-4">
                        <div className="p-5 rounded-[5px] border border-blue-100 bg-blue-50/50">
                          <h4 className="text-sm font-bold text-slate-800 mb-3">Course Assignment</h4>
                          <div className="relative">
                            <label className="block text-sm font-medium text-slate-600 mb-1.5">Assign Course</label>
                            <select 
                              value={formData.courseIds?.[0] || ''} 
                              onChange={(e) => {
                                const val = e.target.value;
                                setFormData({ ...formData, courseIds: val ? [val] : [] });
                              }}
                              disabled={!isVerified}
                              className={`w-full px-4 py-2 rounded-[5px] border ${!isVerified ? 'border-gray-200 bg-gray-100 text-gray-400 cursor-not-allowed' : 'border-blue-200 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20'} text-sm`}
                            >
                              <option value="">-- Select Course --</option>
                              {courses
                                .filter(c => c.departmentId === formData.departmentId)
                                .map(c => <option key={c.id} value={c.id}>{c.courseCode} - {c.courseName}</option>)}
                            </select>
                            {!isVerified && (
                              <p className="text-xs text-orange-600 mt-2 font-medium flex items-center gap-1">
                                <span className="w-1.5 h-1.5 rounded-full bg-orange-500 inline-block"></span>
                                Assignment locked: Requires {hasHod ? 'both HOD and Dean' : 'Dean'} verification first.
                              </p>
                            )}
                          </div>
                        </div>

                        <div className="p-5 rounded-[5px] border border-blue-100 bg-blue-50/50">
                          <h4 className="text-sm font-bold text-slate-800 mb-3">Supervisor Assignment</h4>
                          <div className="relative">
                            <label className="block text-sm font-medium text-slate-600 mb-1.5">Assign Supervisor</label>
                            <select 
                              value={formData.supervisorId || ''} 
                              onChange={(e) => setFormData({ ...formData, supervisorId: e.target.value })} 
                              disabled={!isVerified}
                              className={`w-full px-4 py-2 rounded-[5px] border ${!isVerified ? 'border-gray-200 bg-gray-100 text-gray-400 cursor-not-allowed' : 'border-blue-200 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20'} text-sm`}
                            >
                              <option value="">-- Select Supervisor --</option>
                              {supervisors
                                .filter(s => !formData.departmentId || s.departmentId === formData.departmentId)
                                .map(s => <option key={s.id} value={s.id}>{s.name} ({s.email})</option>)}
                            </select>
                            {!isVerified && (
                              <p className="text-xs text-orange-600 mt-2 font-medium flex items-center gap-1">
                                <span className="w-1.5 h-1.5 rounded-full bg-orange-500 inline-block"></span>
                                Assignment locked: Requires {hasHod ? 'both HOD and Dean' : 'Dean'} verification first.
                              </p>
                            )}
                          </div>
                        </div>
                        </div>
                      );
                    })()}

                  </div>
                </div>

              </div>
              <div className="px-6 md:px-8 py-5 border-t border-border bg-background/50 flex justify-end shrink-0">
                {['SUPER_ADMIN', 'RDC_ADMIN', 'COORDINATOR'].includes(currentUser?.rawRole) && (
                  <button
                    type="submit"
                    disabled={submitting}
                    className="inline-flex items-center gap-2 px-6 py-2.5 text-sm font-semibold text-white bg-primary hover:bg-primary-hover rounded-[5px] shadow-sm hover:shadow transition-all disabled:opacity-50"
                  >
                    <Save className="w-4 h-4" />
                    {submitting ? 'Saving...' : 'Save Profile'}
                  </button>
                )}
              </div>
            </form>
          )}

          {activeTab === 'matriculation' && (
            <MatriculationView scholarId={formData.id} />
          )}
          {activeTab === 'exams' && (
            <ExamsView scholarId={formData.id} currentUser={currentUser} />
          )}
          {activeTab === 'drc-presentation' && (
            <PresentationView scholarId={formData.id!} currentUser={currentUser} type="DRC" />
          )}
          {activeTab === 'src-presentation' && (
            <PresentationView scholarId={formData.id!} currentUser={currentUser} type="SRC" />
          )}

        </div>
      </div>
    </div>
  );
}
