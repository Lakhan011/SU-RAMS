"use client";

import React, { useState, useEffect, useRef } from "react";
import toast from "react-hot-toast";
import { Plus, Trash2, Upload, FileText, CheckCircle, Edit, Users, X, ArrowRight, Calendar, Clock, MessageSquare, ClipboardList, Info } from "lucide-react";

export default function PresentationView({ scholarId, currentUser, type = "DRC" }: { scholarId: string, currentUser: any, type?: string }) {
  const [presentations, setPresentations] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formOpen, setFormOpen] = useState(false);
  const [deleteModalId, setDeleteModalId] = useState<string | null>(null);
  const [deleting, setDeleting] = useState(false);
  const [approveModalId, setApproveModalId] = useState<string | null>(null);
  const [approving, setApproving] = useState(false);
  const [listDeleteConfirm, setListDeleteConfirm] = useState<{type: 'nominee' | 'expert', index: number} | null>(null);

  const defaultForm = {
    synopsisUrl: "",
    momUrl: "",
    documentsUrl: "",
    presentationDate: "",
    presentationTime: "",
    result: "",
    remarks: "",
    nomineesStatus: "PENDING"
  };
  
  const [formData, setFormData] = useState(defaultForm);
  const [experts, setExperts] = useState<{name: string, email: string}[]>([]);
  const [nominees, setNominees] = useState<{name: string, email: string}[]>([]);
  
  const isCoordinator = ["COORDINATOR", "ADMIN", "SUPER_ADMIN"].includes(currentUser?.rawRole);
  const isDean = ["DEAN", "VC", "ADMIN", "SUPER_ADMIN"].includes(currentUser?.rawRole);
  const isVC = ["VC", "ADMIN", "SUPER_ADMIN"].includes(currentUser?.rawRole);
  const isRdcMember = ["SUPER_ADMIN", "ADMIN", "VC"].includes(currentUser?.rawRole);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const [uploadTarget, setUploadTarget] = useState<"synopsisUrl" | "momUrl" | "documentsUrl" | null>(null);

  const fetchPresentations = async () => {
    try {
      const res = await fetch(`/api/scholars/${scholarId}/presentations?type=${type}`);
      if (res.ok) {
        const data = await res.json();
        setPresentations(data.presentations || []);
      }
    } catch (e) {} finally { setLoading(false); }
  };

  useEffect(() => {
    if (scholarId) fetchPresentations();
  }, [scholarId, type]);

  const handleEditClick = (p: any) => {
    setEditingId(p.id);
    setFormData({
      synopsisUrl: p.synopsisUrl || "",
      momUrl: p.momUrl || "",
      documentsUrl: p.documentsUrl || "",
      presentationDate: p.presentationDate || "",
      presentationTime: p.presentationTime || "",
      result: p.result || "",
      remarks: p.remarks || "",
      nomineesStatus: p.nomineesStatus || "PENDING"
    });
    try { setExperts(JSON.parse(p.externalExperts || "[]")); } catch { setExperts([]); }
    try { setNominees(JSON.parse(p.researchNominees || "[]")); } catch { setNominees([]); }
    setFormOpen(true);
  };

  const handleCreateNew = () => {
    setEditingId(null);
    setFormData(defaultForm);
    setExperts([]);
    setNominees([]);
    setFormOpen(true);
  };

  const handleCancelEdit = () => {
    setEditingId(null);
    setFormData(defaultForm);
    setExperts([]);
    setNominees([]);
    setFormOpen(false);
  };

  // Expert Handlers
  const handleAddExpert = () => setExperts([...experts, { name: "", email: "" }]);
  const handleUpdateExpert = (index: number, field: string, value: string) => {
    const newExperts = [...experts];
    newExperts[index] = { ...newExperts[index], [field]: value };
    setExperts(newExperts);
  };
  const handleRemoveExpert = (index: number) => setExperts(experts.filter((_, i) => i !== index));

  // Nominee Handlers (Dean)
  const handleAddNominee = () => setNominees([...nominees, { name: "", email: "" }]);
  const handleUpdateNominee = (index: number, field: string, value: string) => {
    const newNominees = [...nominees];
    newNominees[index] = { ...newNominees[index], [field]: value };
    setNominees(newNominees);
  };
  const handleRemoveNominee = (index: number) => setNominees(nominees.filter((_, i) => i !== index));

  const executeListDelete = () => {
    if (!listDeleteConfirm) return;
    if (listDeleteConfirm.type === 'nominee') {
      handleRemoveNominee(listDeleteConfirm.index);
    } else {
      handleRemoveExpert(listDeleteConfirm.index);
    }
    setListDeleteConfirm(null);
  };

  // VC approves a nominee and copies to experts
  const handleApproveNomineeAsExpert = (nominee: {name: string, email: string}) => {
    if (!experts.find(e => e.email === nominee.email)) {
      setExperts([...experts, { name: nominee.name, email: nominee.email }]);
      setFormData({...formData, nomineesStatus: "APPROVED_BY_VC"});
    } else {
      toast("Expert already added");
    }
  };

  const triggerUpload = (target: "synopsisUrl" | "momUrl" | "documentsUrl") => {
    setUploadTarget(target);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
      fileInputRef.current.click();
    }
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !uploadTarget) return;

    const bodyData = new FormData();
    bodyData.append("file", file);
    const loadToast = toast.loading("Uploading file...");
    try {
      const res = await fetch("/api/upload", { method: "POST", body: bodyData });
      const data = await res.json();
      if (res.ok) {
        toast.success("Uploaded", { id: loadToast });
        setFormData({ ...formData, [uploadTarget]: data.filePath });
      } else {
        toast.error(data.error || "Failed", { id: loadToast });
      }
    } catch {
      toast.error("Upload failed", { id: loadToast });
    } finally {
      setUploadTarget(null);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    
    // Auto-approve if VC adds experts manually in DRC
    const finalNomStatus = (type === 'DRC' && experts.length > 0) ? 'APPROVED_BY_VC' : formData.nomineesStatus;

    const payload = {
      ...formData,
      type,
      nomineesStatus: finalNomStatus,
      researchNominees: JSON.stringify(nominees.filter(n => n.name && n.email)),
      externalExperts: JSON.stringify(experts.filter(exp => exp.name && exp.email)),
      // We clear out vcExperts and use externalExperts universally to avoid confusion
      vcExperts: JSON.stringify(experts.filter(exp => exp.name && exp.email))
    };
    
    try {
      const url = editingId 
        ? `/api/scholars/${scholarId}/presentations/${editingId}`
        : `/api/scholars/${scholarId}/presentations`;
      const res = await fetch(url, {
        method: editingId ? "PUT" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      });
      if (res.ok) {
        toast.success(editingId ? "Updated" : "Saved");
        handleCancelEdit();
        fetchPresentations();
      } else {
        toast.error("Failed to save");
      }
    } catch { toast.error("An error occurred"); } finally { setSubmitting(false); }
  };

  const confirmDelete = (id: string) => { setDeleteModalId(id); };

  const executeDelete = async () => {
    if (!deleteModalId) return;
    setDeleting(true);
    try {
      const res = await fetch(`/api/scholars/${scholarId}/presentations/${deleteModalId}`, { method: "DELETE" });
      if (res.ok) { toast.success("Deleted"); fetchPresentations(); }
    } catch {} finally { setDeleting(false); setDeleteModalId(null); }
  };

  const confirmApprove = (id: string) => { setApproveModalId(id); };

  const executeApprove = async () => {
    if (!approveModalId) return;
    setApproving(true);
    try {
      const res = await fetch(`/api/scholars/${scholarId}/presentations/verify`, {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ presentationId: approveModalId, status: "VERIFIED_RDC" })
      });
      if (res.ok) { toast.success("Approved successfully"); fetchPresentations(); }
    } catch {} finally { setApproving(false); setApproveModalId(null); }
  };

  if (loading) return <div className="p-8 text-center text-muted">Loading...</div>;

  return (
    <div className="p-6">
      <div className="hidden">
        <input type="file" ref={fileInputRef} onChange={handleFileUpload} accept=".pdf,.jpg,.jpeg,.png,.doc,.docx" />
      </div>

      <div className="flex justify-between items-center mb-6">
        <h3 className="text-lg font-bold text-slate-800">{type === 'SRC' ? 'SRC Presentations' : 'DRC Presentations'}</h3>
        {!formOpen && (
          <button onClick={handleCreateNew} className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold rounded-lg flex items-center gap-2 shadow-sm transition-colors">
            <Plus className="w-4 h-4"/> Create New {type === 'SRC' ? 'SRC' : 'DRC'} Presentation
          </button>
        )}
      </div>

      {/* UNIFIED FORM */}
      {formOpen && (
        <form onSubmit={handleSubmit} className="mb-8 p-6 rounded-xl border border-slate-200 bg-slate-50 shadow-sm">
          <div className="flex items-center justify-between mb-5">
            <h4 className="text-lg font-bold text-slate-800 flex items-center gap-2">
              {editingId ? <Edit className="w-5 h-5 text-blue-600"/> : <Plus className="w-5 h-5 text-blue-600"/>}
              {editingId ? `Edit ${type} Presentation` : `Create New ${type} Presentation`}
            </h4>
            <button type="button" onClick={handleCancelEdit} className="text-sm text-slate-500 hover:text-slate-800 font-semibold flex items-center gap-1 bg-white px-3 py-1.5 rounded-lg border shadow-sm">
              <X className="w-4 h-4"/> Cancel
            </button>
          </div>
          
          {/* Coordinator Section */}
          <div className="bg-white p-5 rounded-xl border border-slate-200 mb-6">
            <h5 className="text-sm font-bold text-slate-700 mb-4 uppercase tracking-wider flex items-center gap-2">
              <FileText className="w-4 h-4"/> Basic Details & Documents (Coordinator)
            </h5>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5 mb-5">
              <div>
                <label className="text-sm font-semibold text-slate-700 mb-1.5 flex items-center gap-1.5"><Calendar className="w-4 h-4 text-slate-400"/> Presentation Date</label>
                <input type="date" value={formData.presentationDate} onChange={e => setFormData({...formData, presentationDate: e.target.value})} className="w-full px-4 py-2 bg-white border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 text-sm shadow-sm" />
              </div>
              <div>
                <label className="text-sm font-semibold text-slate-700 mb-1.5 flex items-center gap-1.5"><Clock className="w-4 h-4 text-slate-400"/> Presentation Time</label>
                <input type="time" value={formData.presentationTime} onChange={e => setFormData({...formData, presentationTime: e.target.value})} className="w-full px-4 py-2 bg-white border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 text-sm shadow-sm" />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-5">
              {[
                { id: 'synopsisUrl', label: 'Synopsis' },
                { id: 'momUrl', label: 'MOM Document' },
                { id: 'documentsUrl', label: 'Other Documents' }
              ].map(doc => (
                <div key={doc.id} className="p-2 rounded-xl border border-slate-200 bg-[#f8fafc] shadow-sm transition-all hover:shadow-md">
                  <label className="text-[11px] font-bold text-slate-500 mb-1.5 uppercase tracking-wider flex items-center gap-1.5"><FileText className="w-3.5 h-3.5 text-slate-400"/> {doc.label}</label>
                  {(formData as any)[doc.id] ? (
                    <div className="flex flex-col gap-1.5">
                      <a href={(formData as any)[doc.id]} target="_blank" rel="noreferrer" className="flex items-center justify-center gap-1.5 w-full py-1 bg-white border border-slate-200 rounded-full text-blue-600 text-xs font-bold hover:bg-blue-50 hover:border-blue-200 transition-colors shadow-sm">
                        <FileText className="w-3 h-3"/> View
                      </a>
                      <button type="button" onClick={() => triggerUpload(doc.id as any)} className="flex items-center justify-center gap-1.5 w-full py-1 bg-slate-100/80 text-slate-600 text-xs font-bold rounded-full hover:bg-slate-200 transition-colors">
                        <Upload className="w-3 h-3"/> Replace
                      </button>
                    </div>
                  ) : (
                    <button type="button" onClick={() => triggerUpload(doc.id as any)} className="group w-full py-2 border-2 border-dashed border-slate-300 rounded-xl text-xs font-bold text-slate-500 hover:text-blue-600 hover:border-blue-400 hover:bg-blue-50/50 flex flex-col justify-center items-center gap-1 bg-white transition-all">
                      <div className="p-1 bg-slate-100 rounded-full text-slate-400 group-hover:bg-blue-100 group-hover:text-blue-500 transition-colors">
                        <Upload className="w-3.5 h-3.5"/>
                      </div>
                      Upload
                    </button>
                  )}
                </div>
              ))}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <div className="flex-1">
                <label className="text-sm font-semibold text-slate-700 mb-1.5 flex items-center gap-1.5"><ClipboardList className="w-4 h-4 text-slate-400"/> Result</label>
                <select value={formData.result} onChange={(e) => setFormData({ ...formData, result: e.target.value })} className="w-full px-4 py-2 bg-white border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 text-sm shadow-sm">
                  <option value="">Select Result</option>
                  <option value="PASS">Pass</option>
                  <option value="FAIL">Fail</option>
                  <option value="MODIFICATION">Modification</option>
                  <option value="REPEAT">Repeat</option>
                </select>
              </div>
              <div>
                <label className="text-sm font-semibold text-slate-700 mb-1.5 flex items-center gap-1.5"><MessageSquare className="w-4 h-4 text-slate-400"/> Remarks</label>
                <input type="text" placeholder="Optional remarks..." value={formData.remarks} onChange={e => setFormData({...formData, remarks: e.target.value})} className="w-full px-4 py-2 bg-white border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 text-sm shadow-sm" />
              </div>
            </div>
          </div>

          {/* Unified Dean & VC Expert Section */}
          {type === 'DRC' && (
            <div className="bg-blue-50/50 p-5 rounded-xl border border-blue-200 mb-6">
              <h5 className="text-sm font-bold text-blue-900 mb-4 uppercase tracking-wider flex items-center gap-2">
                <Users className="w-4 h-4"/> Expert Selection (Dean & VC)
              </h5>
            
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Dean Nominees Box - Only for DRC */}
              {type === 'DRC' && (
                <div className="bg-white p-4 rounded-lg border border-blue-100 shadow-sm">
                  <div className="flex justify-between items-center mb-3">
                    <label className="text-sm font-bold text-slate-800">1. Research Nominees</label>
                    {isDean && (
                      <button type="button" onClick={handleAddNominee} className="text-xs bg-blue-100 text-blue-700 font-semibold flex items-center gap-1 px-2 py-1 rounded hover:bg-blue-200 transition-colors"><Plus className="w-3 h-3"/> Add</button>
                    )}
                  </div>
                  
                  {nominees.length === 0 ? (
                    <div className="text-xs text-slate-500 italic text-center p-3 border border-dashed rounded bg-slate-50">No nominees added.</div>
                  ) : (
                    <div className="space-y-2">
                      {nominees.map((nom, idx) => (
                        <div key={idx} className="flex items-center gap-2">
                          <div className="flex-1 flex gap-2">
                            <input type="text" placeholder="Name" value={nom.name} onChange={e => handleUpdateNominee(idx, "name", e.target.value)} disabled={!isDean} className="w-1/2 px-2 py-1.5 border rounded text-xs disabled:bg-slate-50" />
                            <input type="email" placeholder="Email" value={nom.email} onChange={e => handleUpdateNominee(idx, "email", e.target.value)} disabled={!isDean} className="w-1/2 px-2 py-1.5 border rounded text-xs disabled:bg-slate-50" />
                          </div>
                          {isDean && (
                            <button type="button" onClick={() => setListDeleteConfirm({type: 'nominee', index: idx})} className="p-1.5 text-red-400 hover:bg-red-50 rounded"><Trash2 className="w-4 h-4"/></button>
                          )}
                          {isVC && (
                            <button type="button" onClick={() => handleApproveNomineeAsExpert(nom)} className="flex items-center gap-1 text-[10px] font-bold bg-emerald-100 text-emerald-700 px-2 py-1.5 rounded hover:bg-emerald-200 transition-colors whitespace-nowrap">
                              Approve <ArrowRight className="w-3 h-3"/>
                            </button>
                          )}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {/* Final Experts Box */}
              <div className="bg-white p-4 rounded-lg border border-blue-100 shadow-sm">
                <div className="flex justify-between items-center mb-3">
                  <label className="text-sm font-bold text-slate-800">{type === 'DRC' ? '2. Final External Experts' : 'External Experts'}</label>
                  {(isVC || (type === 'SRC' && isCoordinator)) && (
                    <button type="button" onClick={handleAddExpert} className="text-xs bg-blue-100 text-blue-700 font-semibold flex items-center gap-1 px-2 py-1 rounded hover:bg-blue-200 transition-colors"><Plus className="w-3 h-3"/> Add Manual</button>
                  )}
                </div>
                
                {experts.length === 0 ? (
                  <div className="text-xs text-slate-500 italic text-center p-3 border border-dashed rounded bg-slate-50">
                    {type === 'DRC' ? 'No experts approved yet.' : 'No experts added.'}
                  </div>
                ) : (
                  <div className="space-y-2">
                    {experts.map((exp, idx) => (
                      <div key={idx} className="flex items-center gap-2">
                        <div className="flex-1 flex gap-2">
                          <input type="text" placeholder="Name" value={exp.name} onChange={e => handleUpdateExpert(idx, "name", e.target.value)} disabled={type === 'DRC' && !isVC} className="w-1/2 px-2 py-1.5 border rounded text-xs bg-emerald-50/30 border-emerald-200 font-semibold text-emerald-900 disabled:bg-slate-50" />
                          <input type="email" placeholder="Email" value={exp.email} onChange={e => handleUpdateExpert(idx, "email", e.target.value)} disabled={type === 'DRC' && !isVC} className="w-1/2 px-2 py-1.5 border rounded text-xs bg-emerald-50/30 border-emerald-200 text-emerald-800 disabled:bg-slate-50" />
                        </div>
                        {(isVC || (type === 'SRC' && isCoordinator)) && (
                          <button type="button" onClick={() => setListDeleteConfirm({type: 'expert', index: idx})} className="p-1.5 text-red-400 hover:bg-red-50 rounded"><Trash2 className="w-4 h-4"/></button>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
          )}
          
          <div className="flex justify-end pt-2">
            <button type="submit" disabled={submitting} className="px-6 py-3 bg-blue-600 text-white text-sm font-bold rounded-lg shadow-md hover:bg-blue-700 transition-all disabled:opacity-50 flex items-center gap-2">
              <CheckCircle className="w-4 h-4"/> {submitting ? 'Saving...' : 'Save Presentation Data'}
            </button>
          </div>
        </form>
      )}

      {/* Presentations List (View Only) */}
      {!formOpen && (
        <div>
          <h4 className="text-base font-bold text-slate-800 mb-4 flex items-center gap-2">
            <FileText className="w-5 h-5 text-slate-400"/> Recorded {type === 'SRC' ? 'SRC Presentations' : 'DRC Presentations'}
          </h4>
          {presentations.length === 0 ? (
            <div className="text-sm text-slate-500 italic p-8 border-2 border-dashed rounded-xl border-slate-200 text-center bg-slate-50">No presentations recorded yet.</div>
          ) : (
            <div className="grid grid-cols-1 gap-6">
              {presentations.map(p => {
                let parsedExperts = []; try { parsedExperts = JSON.parse(p.externalExperts || "[]"); } catch {}
                let parsedNominees = []; try { parsedNominees = JSON.parse(p.researchNominees || "[]"); } catch {}

                const isPendingVc = type === 'DRC' && p.nomineesStatus === 'PENDING' && parsedExperts.length === 0;
                
                return (
                <div key={p.id} className="p-6 rounded-2xl border border-slate-200 bg-white shadow-sm hover:shadow-md transition-shadow flex flex-col gap-5">
                  <div className="flex justify-between items-start">
                    <div>
                      <div className="flex items-center gap-3 mb-4">
                        {isPendingVc ? (
                          <span className="px-3 py-1.5 rounded-md text-xs font-bold uppercase tracking-wider bg-amber-50 text-amber-600 border border-amber-200">
                            Pending VC Approval
                          </span>
                        ) : (
                          <span className={`px-3 py-1.5 rounded-md text-xs font-bold uppercase tracking-wider border ${p.result === 'PASS' ? 'bg-emerald-50 text-emerald-600 border-emerald-200' : p.result === 'FAIL' ? 'bg-red-50 text-red-600 border-red-200' : 'bg-slate-50 text-slate-600 border-slate-200'}`}>
                            {p.result || "PENDING RESULT"}
                          </span>
                        )}
                        
                        {!isPendingVc && p.verificationStatus === 'VERIFIED_RDC' ? (
                          <div className="flex items-center gap-1.5 text-emerald-600 font-bold bg-emerald-50 px-3 py-1.5 rounded-md text-xs uppercase border border-emerald-200">
                            <CheckCircle className="w-3.5 h-3.5" /> APPROVED BY RDC
                          </div>
                        ) : !isPendingVc ? (
                          <div className="flex items-center gap-1.5 text-blue-600 bg-blue-50 px-3 py-1.5 rounded-md font-bold uppercase tracking-wider text-xs border border-blue-200">
                            Pending RDC Approval
                          </div>
                        ) : null}
                      </div>
                      
                      <div className="flex flex-wrap gap-x-6 gap-y-2">
                        {p.presentationDate && (
                          <p className="text-sm text-slate-400 font-medium flex items-center gap-1.5">
                            <Calendar className="w-4 h-4"/> Date: 
                            <span className="text-slate-700 font-bold">{p.presentationDate} {p.presentationTime && `at ${p.presentationTime}`}</span>
                          </p>
                        )}
                        {p.remarks && (
                          <p className="text-sm text-slate-400 font-medium flex items-center gap-1.5">
                            <MessageSquare className="w-4 h-4"/> Remarks: 
                            <span className="text-slate-700 italic">{p.remarks}</span>
                          </p>
                        )}
                      </div>
                    </div>
                    
                    <div className="flex flex-col items-end gap-3">
                      <button onClick={() => handleEditClick(p)} className="flex items-center gap-1.5 text-xs font-semibold px-4 py-2 bg-blue-50 hover:bg-blue-100 text-blue-600 rounded-lg border border-blue-100 transition-colors">
                        <Edit className="w-3.5 h-3.5"/> View & Edit Data
                      </button>
                      
                      {isCoordinator && (
                        <button onClick={() => confirmDelete(p.id)} className="flex items-center gap-1.5 text-xs font-semibold px-2 py-1 text-red-500 hover:text-red-700 transition-colors">
                          <Trash2 className="w-3.5 h-3.5" /> Delete
                        </button>
                      )}
                      
                      {isRdcMember && p.verificationStatus !== 'VERIFIED_RDC' && !isPendingVc && (
                        <button onClick={() => confirmApprove(p.id)} className="text-xs px-5 py-2 bg-[#059669] text-white font-bold rounded-full hover:bg-emerald-700 flex items-center gap-1.5 transition-colors mt-1">
                          <CheckCircle className="w-4 h-4"/> Approve for RDC
                        </button>
                      )}
                    </div>
                  </div>

                  <div className={`grid grid-cols-1 ${type === 'DRC' ? 'md:grid-cols-2' : ''} gap-4 mt-2`}>
                    {/* Documents Summary */}
                    <div className="p-6 bg-[#f8fafc] rounded-2xl">
                      <h5 className="text-xs font-bold text-slate-500 mb-5 uppercase tracking-wider flex items-center gap-2"><FileText className="w-4 h-4"/> Documents</h5>
                      <div className="flex flex-col gap-5 text-sm">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <FileText className="w-4 h-4 text-slate-400"/>
                            <span className="font-medium text-slate-700">Synopsis</span>
                          </div>
                          {p.synopsisUrl ? <a href={p.synopsisUrl} target="_blank" rel="noreferrer" className="text-blue-600 font-bold hover:bg-blue-100 bg-blue-50 px-4 py-1.5 rounded-lg transition-colors flex items-center gap-1.5">View PDF <ArrowRight className="w-3.5 h-3.5"/></a> : <span className="text-slate-400 italic text-xs">Not Uploaded</span>}
                        </div>
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <FileText className="w-4 h-4 text-slate-400"/>
                            <span className="font-medium text-slate-700">MOM Document</span>
                          </div>
                          {p.momUrl ? <a href={p.momUrl} target="_blank" rel="noreferrer" className="text-blue-600 font-bold hover:bg-blue-100 bg-blue-50 px-4 py-1.5 rounded-lg transition-colors flex items-center gap-1.5">View PDF <ArrowRight className="w-3.5 h-3.5"/></a> : <span className="text-slate-400 italic text-xs">Not Uploaded</span>}
                        </div>
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <FileText className="w-4 h-4 text-slate-400"/>
                            <span className="font-medium text-slate-700">Other Docs</span>
                          </div>
                          {p.documentsUrl ? <a href={p.documentsUrl} target="_blank" rel="noreferrer" className="text-blue-600 font-bold hover:bg-blue-100 bg-blue-50 px-4 py-1.5 rounded-lg transition-colors flex items-center gap-1.5">View PDF <ArrowRight className="w-3.5 h-3.5"/></a> : <span className="text-slate-400 italic text-xs">Not Uploaded</span>}
                        </div>
                      </div>
                    </div>
                    
                    {/* Experts Summary */}
                    {type === 'DRC' && (
                    <div className="p-6 bg-[#f8fafc] rounded-2xl">
                        <div className="mb-6">
                          <h5 className="text-xs font-bold text-slate-500 mb-4 uppercase tracking-wider flex items-center gap-2"><Users className="w-4 h-4"/> Research Nominees (Dean)</h5>
                          {parsedNominees && parsedNominees.length > 0 ? (
                            <ul className="text-sm space-y-2">
                              {parsedNominees.map((n: any, idx: number) => (
                                <li key={idx} className="flex justify-between items-center bg-white px-4 py-2.5 rounded-xl border border-slate-100 shadow-sm">
                                  <span className="font-semibold text-slate-700">{n.name}</span>
                                  <span className="text-slate-500 text-xs">{n.email}</span>
                                </li>
                              ))}
                            </ul>
                          ) : (
                            <div className="text-xs text-slate-400 italic">No nominees provided.</div>
                          )}
                        </div>

                        <div>
                          <h5 className="text-xs font-bold text-emerald-600 mb-4 uppercase tracking-wider flex items-center gap-2"><CheckCircle className="w-4 h-4"/> Final Experts (VC Approved)</h5>
                          {parsedExperts && parsedExperts.length > 0 ? (
                            <ul className="text-sm space-y-2">
                              {parsedExperts.map((n: any, idx: number) => (
                                <li key={idx} className="flex justify-between items-center bg-emerald-50/80 px-4 py-2.5 rounded-xl border border-emerald-200">
                                  <span className="font-bold text-emerald-800">{n.name}</span>
                                  <span className="text-emerald-600 text-xs">{n.email}</span>
                                </li>
                              ))}
                            </ul>
                          ) : (
                            <div className="text-sm text-amber-600 bg-amber-50 italic p-2 rounded-lg border border-amber-100 text-center font-medium">{isPendingVc ? 'Awaiting VC Approval' : 'No experts selected'}</div>
                          )}
                        </div>
                    </div>
                    )}
                  </div>
                </div>
                )
              })}
            </div>
          )}
        </div>
      )}

      {/* Delete Modal */}
      {deleteModalId && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md p-6 border border-slate-100 animate-in zoom-in-95 duration-200">
            <div className="flex items-center gap-3 mb-3 text-red-600">
              <div className="p-2 bg-red-50 rounded-full">
                <Trash2 className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold text-slate-800">Delete Presentation</h3>
            </div>
            <p className="text-sm text-slate-600 mb-6 pl-14">
              Are you sure you want to permanently delete this presentation? This action cannot be undone and all associated data will be lost.
            </p>
            <div className="flex justify-end gap-3 pt-2 border-t border-slate-100">
              <button onClick={() => setDeleteModalId(null)} className="px-5 py-2 text-sm font-semibold text-slate-600 hover:bg-slate-100 rounded-xl transition-colors">
                Cancel
              </button>
              <button onClick={executeDelete} disabled={deleting} className="flex items-center gap-2 px-5 py-2 text-sm font-semibold text-white bg-red-500 hover:bg-red-600 rounded-xl shadow-sm transition-colors disabled:opacity-50">
                {deleting ? 'Deleting...' : 'Yes, Delete'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Approve Modal */}
      {approveModalId && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md p-6 border border-slate-100 animate-in zoom-in-95 duration-200">
            <div className="flex items-center gap-3 mb-3 text-emerald-600">
              <div className="p-2 bg-emerald-50 rounded-full">
                <CheckCircle className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold text-slate-800">Approve Presentation</h3>
            </div>
            <p className="text-sm text-slate-600 mb-6 pl-14">
              Are you sure you want to approve this presentation? It will be marked as officially verified by the RDC.
            </p>
            <div className="flex justify-end gap-3 pt-2 border-t border-slate-100">
              <button onClick={() => setApproveModalId(null)} className="px-5 py-2 text-sm font-semibold text-slate-600 hover:bg-slate-100 rounded-xl transition-colors">
                Cancel
              </button>
              <button onClick={executeApprove} disabled={approving} className="flex items-center gap-2 px-5 py-2 text-sm font-semibold text-white bg-[#059669] hover:bg-emerald-700 rounded-xl shadow-sm transition-colors disabled:opacity-50">
                {approving ? 'Approving...' : 'Yes, Approve'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* List Delete Modal */}
      {listDeleteConfirm && (
        <div className="fixed inset-0 z-[110] flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-sm p-6">
            <h3 className="text-lg font-bold text-slate-800 mb-2">Remove Item?</h3>
            <p className="text-sm text-slate-600 mb-6">Are you sure you want to remove this {listDeleteConfirm.type}? This action cannot be undone.</p>
            <div className="flex justify-end gap-3">
              <button type="button" onClick={() => setListDeleteConfirm(null)} className="px-4 py-2 text-sm font-semibold text-slate-600 hover:bg-slate-100 rounded-lg">Cancel</button>
              <button type="button" onClick={executeListDelete} className="px-4 py-2 text-sm font-semibold text-white bg-red-600 hover:bg-red-700 rounded-lg shadow-sm">
                Remove
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
