"use client";

import React, { useState, useEffect } from "react";
import toast from "react-hot-toast";
import { Calendar, Clock, BookOpen, Plus, Trash2 } from "lucide-react";

export default function ExamsView({ scholarId, currentUser }: { scholarId: string, currentUser: any }) {
  const [exams, setExams] = useState<any[]>([]);
  const [courses, setCourses] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  const [formData, setFormData] = useState({
    courseId: "",
    examDate: "",
    startTime: "",
    endTime: "",
    examType: "REGULAR"
  });

  const [resultModal, setResultModal] = useState<{isOpen: boolean, exam: any}>({isOpen: false, exam: null});
  const [resultForm, setResultForm] = useState({
    marksObtained: "",
    maximumMarks: "100",
    result: "",
    remarks: ""
  });
  const [submittingResult, setSubmittingResult] = useState(false);

  const openResultModal = (exam: any) => {
    const existingResult = exam.results?.[0];
    if (existingResult) {
      setResultForm({
        marksObtained: existingResult.marksObtained.toString(),
        maximumMarks: existingResult.maximumMarks.toString(),
        result: existingResult.result,
        remarks: existingResult.remarks || ""
      });
    } else {
      setResultForm({ marksObtained: "", maximumMarks: "100", result: "", remarks: "" });
    }
    setResultModal({ isOpen: true, exam });
  };

  const handleResultSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!resultModal.exam) return;
    
    setSubmittingResult(true);
    try {
      const res = await fetch(`/api/scholars/${scholarId}/exams/${resultModal.exam.id}/result`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(resultForm)
      });
      
      const data = await res.json();
      if (res.ok) {
        toast.success("Result updated successfully");
        setResultModal({ isOpen: false, exam: null });
        fetchExams();
      } else {
        toast.error(data.error || "Failed to update result");
      }
    } catch (e) {
      toast.error("An error occurred");
    } finally {
      setSubmittingResult(false);
    }
  };

  const isCoordinator = currentUser?.rawRole === "COORDINATOR" || currentUser?.rawRole === "SUPER_ADMIN";
  const isRdcMember = ["RDC_ADMIN", "SUPER_ADMIN", "ADMIN", "VC"].includes(currentUser?.rawRole);

  const [verifyingResultId, setVerifyingResultId] = useState<string | null>(null);

  const handleVerifyResult = async (examId: string) => {
    setVerifyingResultId(examId);
    try {
      const res = await fetch(`/api/scholars/${scholarId}/exams/${examId}/result/verify`, {
        method: "POST"
      });
      if (res.ok) {
        toast.success("Result verified successfully");
        fetchExams();
      } else {
        const data = await res.json();
        toast.error(data.error || "Failed to verify result");
      }
    } catch (e) {
      toast.error("An error occurred");
    } finally {
      setVerifyingResultId(null);
    }
  };

  const fetchExams = async () => {
    try {
      const res = await fetch(`/api/scholars/${scholarId}/exams`);
      if (res.ok) {
        const data = await res.json();
        setExams(data.exams || []);
      }
    } catch (e) {}
  };

  const fetchScholarCourses = async () => {
    try {
      const res = await fetch(`/api/scholars/${scholarId}`);
      if (res.ok) {
        const data = await res.json();
        if (data.scholar?.courses) {
          setCourses(data.scholar.courses.map((c: any) => c.course).filter(Boolean));
        }
      }
    } catch (e) {}
  };

  useEffect(() => {
    if (scholarId) {
      Promise.all([fetchExams(), fetchScholarCourses()]).finally(() => setLoading(false));
    }
  }, [scholarId]);

  const [editingExamId, setEditingExamId] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.courseId || !formData.examDate || !formData.startTime || !formData.endTime) {
      toast.error("Please fill all fields");
      return;
    }
    
    setSubmitting(true);
    try {
      const url = editingExamId 
        ? `/api/scholars/${scholarId}/exams/${editingExamId}`
        : `/api/scholars/${scholarId}/exams`;
        
      const res = await fetch(url, {
        method: editingExamId ? "PUT" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData)
      });
      
      const data = await res.json();
      if (res.ok) {
        toast.success(editingExamId ? "Exam updated successfully" : "Exam scheduled successfully");
        setFormData({ courseId: "", examDate: "", startTime: "", endTime: "", examType: "REGULAR" });
        setEditingExamId(null);
        fetchExams();
      } else {
        toast.error(data.error || "Failed to schedule exam");
      }
    } catch (e) {
      toast.error("An error occurred");
    } finally {
      setSubmitting(false);
    }
  };

  const [deleteModal, setDeleteModal] = useState<{isOpen: boolean, examId: string | null}>({isOpen: false, examId: null});

  const handleEditClick = (exam: any) => {
    setEditingExamId(exam.id);
    setFormData({
      courseId: exam.courseId,
      examDate: new Date(exam.examDate).toISOString().split('T')[0],
      startTime: exam.startTime,
      endTime: exam.endTime,
      examType: exam.examType
    });
  };

  const confirmDelete = (examId: string) => {
    setDeleteModal({ isOpen: true, examId });
  };

  const handleDeleteExam = async () => {
    if (!deleteModal.examId) return;
    try {
      const res = await fetch(`/api/scholars/${scholarId}/exams/${deleteModal.examId}`, {
        method: "DELETE"
      });
      if (res.ok) {
        toast.success("Exam deleted successfully");
        fetchExams();
      } else {
        const data = await res.json();
        toast.error(data.error || "Failed to delete exam");
      }
    } catch (e) {
      toast.error("An error occurred while deleting");
    } finally {
      setDeleteModal({ isOpen: false, examId: null });
    }
  };

  if (loading) return <div className="p-8 text-center text-muted">Loading exams...</div>;

  return (
    <div className="p-6 md:p-8 flex-1 space-y-8">
      <div className="flex items-center justify-between mb-4 border-b border-border pb-2">
        <h4 className="text-xs font-bold text-muted uppercase tracking-wider">Exams & Assessments</h4>
      </div>

      {isCoordinator && courses.length > 0 && (
        <form onSubmit={handleSubmit} className="p-6 rounded-[5px] border border-border bg-surface shadow-sm">
          <div className="flex items-center justify-between mb-4 border-b border-border pb-2">
            <h4 className="text-xs font-bold text-primary flex items-center gap-2 uppercase tracking-wider">
              <Plus className="w-4 h-4" /> {editingExamId ? "Edit Scheduled Exam" : "Schedule New Exam"}
            </h4>
            {editingExamId && (
              <button type="button" onClick={() => { setEditingExamId(null); setFormData({ courseId: "", examDate: "", startTime: "", endTime: "", examType: "REGULAR" }); }} className="text-xs text-muted hover:text-foreground underline">Cancel Edit</button>
            )}
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5 mb-6">
            <div>
              <label className="block text-sm font-medium text-foreground mb-1.5">Course *</label>
              <select required value={formData.courseId} onChange={e => setFormData({...formData, courseId: e.target.value})} className="w-full px-4 py-2 rounded-[5px] border border-border bg-background focus:outline-none focus:ring-2 focus:ring-primary/20 text-sm">
                <option value="">Select Course</option>
                {courses.map(c => <option key={c.id} value={c.id}>{c.courseCode} - {c.courseName}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-foreground mb-1.5">Exam Type *</label>
              <select required value={formData.examType} onChange={e => setFormData({...formData, examType: e.target.value})} className="w-full px-4 py-2 rounded-[5px] border border-border bg-background focus:outline-none focus:ring-2 focus:ring-primary/20 text-sm">
                <option value="REGULAR">Regular</option>
                <option value="RE_EXAM">Re-Exam</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-foreground mb-1.5">Exam Date *</label>
              <div className="relative">
                <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted pointer-events-none" />
                <input required type="date" value={formData.examDate} onChange={e => setFormData({...formData, examDate: e.target.value})} className="w-full pl-9 pr-4 py-2 rounded-[5px] border border-border bg-background focus:outline-none focus:ring-2 focus:ring-primary/20 text-sm" />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-foreground mb-1.5">Start Time *</label>
              <div className="relative">
                <Clock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted pointer-events-none" />
                <input required type="time" value={formData.startTime} onChange={e => setFormData({...formData, startTime: e.target.value})} className="w-full pl-9 pr-4 py-2 rounded-[5px] border border-border bg-background focus:outline-none focus:ring-2 focus:ring-primary/20 text-sm" />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-foreground mb-1.5">End Time *</label>
              <div className="relative">
                <Clock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted pointer-events-none" />
                <input required type="time" value={formData.endTime} onChange={e => setFormData({...formData, endTime: e.target.value})} className="w-full pl-9 pr-4 py-2 rounded-[5px] border border-border bg-background focus:outline-none focus:ring-2 focus:ring-primary/20 text-sm" />
              </div>
            </div>
          </div>
          <div className="flex justify-end pt-4 border-t border-border">
            <button type="submit" disabled={submitting} className="px-6 py-2.5 text-sm font-semibold text-white bg-primary hover:bg-primary-hover rounded-[5px] shadow-sm hover:shadow transition-all disabled:opacity-50">
              {submitting ? 'Scheduling...' : 'Schedule Exam'}
            </button>
          </div>
        </form>
      )}

      {isCoordinator && courses.length === 0 && (
        <div className="p-4 rounded-[5px] border border-warning/20 bg-warning-light/30 text-sm font-semibold text-foreground">
          No courses assigned to this scholar. Please assign a course first to schedule an exam.
        </div>
      )}

      <div>
        <h4 className="text-xs font-bold text-muted uppercase tracking-wider border-b border-border pb-2 mb-4">Scheduled Exams</h4>
        {exams.length === 0 ? (
          <div className="text-sm text-slate-500 italic p-4 border border-dashed rounded-xl border-slate-200 text-center">No exams scheduled yet.</div>
        ) : (
          <div className="grid grid-cols-1 gap-5">
            {exams.map(exam => {
              const result = exam.results?.[0];
              return (
              <div key={exam.id} className="p-5 rounded-[5px] border border-border bg-surface shadow-sm hover:shadow-md transition-shadow flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div className="flex items-start gap-4">
                  <div className="p-2.5 bg-primary-light text-primary rounded-[5px]">
                    <BookOpen className="w-5 h-5" />
                  </div>
                  <div>
                    <h5 className="text-sm font-bold text-foreground mb-1.5">{exam.course?.courseCode} - {exam.course?.courseName}</h5>
                    <div className="flex items-center gap-3 text-xs text-muted font-medium">
                      <span className="flex items-center gap-1.5"><Calendar className="w-3 h-3" /> {new Date(exam.examDate).toLocaleDateString()}</span>
                      <span className="flex items-center gap-1.5"><Clock className="w-3 h-3" /> {exam.startTime} - {exam.endTime}</span>
                      <span className="font-bold text-primary bg-primary-light px-2 py-0.5 rounded-[5px] uppercase tracking-wider">{exam.examType}</span>
                    </div>
                    {result && (
                      <div className="mt-4 pt-3 border-t border-border flex flex-wrap items-center gap-4 text-xs font-medium">
                        <div className="text-muted">Marks: <span className="text-foreground font-bold">{result.marksObtained} / {result.maximumMarks}</span></div>
                        <div className={`px-2.5 py-0.5 rounded-[5px] font-bold uppercase tracking-wider ${result.result === 'PASS' ? 'bg-success-light/30 text-success' : result.result === 'FAIL' ? 'bg-danger-light/30 text-danger' : 'bg-warning-light/30 text-warning'}`}>
                          {result.result.replace(/_/g, ' ')}
                        </div>
                        {result.verificationStatus === 'VERIFIED_RDC' ? (
                          <div className="flex items-center gap-1.5 text-success font-bold bg-success-light/30 px-2.5 py-0.5 rounded-[5px] uppercase tracking-wider">
                            <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg>
                            VERIFIED BY RDC
                          </div>
                        ) : (
                          <div className="text-warning bg-warning-light/30 px-2.5 py-0.5 rounded-[5px] font-bold uppercase tracking-wider">
                            Pending RDC Verification
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                </div>
                <div className="text-right flex flex-col items-end justify-between min-w-[120px]">
                  <div className="flex gap-2">
                    {isCoordinator && result?.verificationStatus !== 'VERIFIED_RDC' && (
                      <>
                        <button onClick={() => handleEditClick(exam)} className="p-1.5 text-muted hover:text-primary transition-colors rounded hover:bg-surface-hover" title="Edit Exam">
                          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2-2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>
                        </button>
                        <button onClick={() => confirmDelete(exam.id)} className="p-1.5 text-muted hover:text-danger transition-colors rounded hover:bg-surface-hover" title="Delete Exam">
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </>
                    )}
                  </div>
                  <div className="flex flex-col items-end gap-3 mt-3">
                    <span className={`inline-flex px-2.5 py-0.5 rounded-[5px] text-[10px] font-bold uppercase tracking-wider ${
                      exam.status === 'SCHEDULED' ? 'bg-warning-light text-warning' : 'bg-primary-light text-primary'
                    }`}>
                      {exam.status}
                    </span>
                    {isCoordinator && result?.verificationStatus !== 'VERIFIED_RDC' && (
                      <button 
                        onClick={() => openResultModal(exam)}
                        className="text-xs px-4 py-2 border border-border hover:bg-surface-hover text-foreground font-semibold rounded-[5px] transition-colors whitespace-nowrap shadow-sm"
                      >
                        {result ? 'Edit Result' : 'Add Result'}
                      </button>
                    )}
                    {isRdcMember && result && result.verificationStatus !== 'VERIFIED_RDC' && (
                      <button 
                        onClick={() => handleVerifyResult(exam.id)}
                        disabled={verifyingResultId === exam.id}
                        className="text-xs px-4 py-2 bg-success hover:bg-success-hover text-white font-semibold rounded-[5px] shadow-sm transition-colors whitespace-nowrap disabled:opacity-50"
                      >
                        {verifyingResultId === exam.id ? 'Verifying...' : 'Verify Result'}
                      </button>
                    )}
                  </div>
                </div>
              </div>
            )})}
          </div>
        )}
      </div>

      {deleteModal.isOpen && (
        <div className="fixed inset-0 z-[80] flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
          <div className="bg-surface w-full max-w-sm rounded-[5px] shadow-xl overflow-hidden animate-in zoom-in-95 duration-200 border border-border">
            <div className="p-6 text-center">
              <div className="w-12 h-12 rounded-full bg-danger-light/30 text-danger flex items-center justify-center mx-auto mb-4">
                <Trash2 className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold text-foreground mb-2">Delete Scheduled Exam?</h3>
              <p className="text-sm text-muted mb-6">Are you sure you want to delete this exam? This action cannot be undone and will also remove any associated results.</p>
              <div className="flex gap-3">
                <button onClick={() => setDeleteModal({isOpen: false, examId: null})} className="flex-1 py-2.5 bg-surface-hover border border-border text-foreground font-semibold rounded-[5px] hover:bg-slate-100">Cancel</button>
                <button onClick={handleDeleteExam} className="flex-1 py-2.5 bg-danger text-white font-semibold rounded-[5px] hover:bg-danger/90">Delete</button>
              </div>
            </div>
          </div>
        </div>
      )}

      {resultModal.isOpen && (
        <div className="fixed inset-0 z-[70] flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
          <div className="bg-surface w-full max-w-md rounded-[5px] shadow-xl overflow-hidden animate-in zoom-in-95 duration-200 border border-border">
            <div className="p-6 md:p-8">
              <h3 className="text-lg font-bold text-foreground mb-6">
                {resultModal.exam?.results?.[0] ? 'Edit Exam Result' : 'Enter Exam Result'}
              </h3>
              <form onSubmit={handleResultSubmit} className="space-y-5">
                <div className="grid grid-cols-2 gap-5">
                  <div>
                    <label className="block text-sm font-medium text-foreground mb-1.5">Marks Obtained *</label>
                    <input required type="number" step="0.01" value={resultForm.marksObtained} onChange={e => setResultForm({...resultForm, marksObtained: e.target.value})} className="w-full px-4 py-2 border border-border bg-background rounded-[5px] focus:ring-2 focus:ring-primary/20 focus:outline-none text-sm" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-foreground mb-1.5">Maximum Marks *</label>
                    <input required type="number" step="0.01" value={resultForm.maximumMarks} onChange={e => setResultForm({...resultForm, maximumMarks: e.target.value})} className="w-full px-4 py-2 border border-border bg-background rounded-[5px] focus:ring-2 focus:ring-primary/20 focus:outline-none text-sm" />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-foreground mb-1.5">Result *</label>
                  <select required value={resultForm.result} onChange={e => setResultForm({...resultForm, result: e.target.value})} className="w-full px-4 py-2 border border-border bg-background rounded-[5px] focus:ring-2 focus:ring-primary/20 focus:outline-none text-sm">
                    <option value="">Select Result</option>
                    <option value="PASS">Pass</option>
                    <option value="FAIL">Fail</option>
                    <option value="RE_EXAM_REQUIRED">Re-Exam Required</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-foreground mb-1.5">Remarks</label>
                  <textarea value={resultForm.remarks} onChange={e => setResultForm({...resultForm, remarks: e.target.value})} rows={2} className="w-full px-4 py-2 border border-border bg-background rounded-[5px] focus:ring-2 focus:ring-primary/20 focus:outline-none text-sm"></textarea>
                </div>
                
                <div className="flex gap-3 pt-4 border-t border-border">
                  <button type="button" onClick={() => setResultModal({isOpen: false, exam: null})} className="flex-1 py-2.5 bg-surface-hover border border-border text-foreground font-semibold rounded-[5px] hover:bg-slate-100">Cancel</button>
                  <button type="submit" disabled={submittingResult} className="flex-1 py-2.5 bg-primary text-white font-semibold rounded-[5px] hover:bg-primary-hover disabled:opacity-50">{submittingResult ? 'Saving...' : 'Save Result'}</button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
