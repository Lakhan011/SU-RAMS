"use client";

import React, { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { Printer, Save, CheckCircle, Upload, Eye, Download, RefreshCw, AlertCircle, FileText, X, GraduationCap, Calendar, Phone, Edit } from "lucide-react";
import toast from "react-hot-toast";


const shortenFileName = (name: string) => {
  if (!name) return "";
  if (name.length <= 25) return name;
  const extIndex = name.lastIndexOf('.');
  const ext = extIndex > -1 ? name.substring(extIndex) : '';
  const base = extIndex > -1 ? name.substring(0, extIndex) : name;
  return base.substring(0, 15) + '...' + base.substring(base.length - 4) + ext;
};

export default function MatriculationView({ scholarId }: { scholarId: string }) {
  const router = useRouter();
  const idRef = useRef<string | null>(null);
  
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [scholar, setScholar] = useState<any>(null);
  
  
  
  const [matriculation, setMatriculation] = useState<any>({
    mode: "FULL_TIME",
    date: "",
    preparedBy: "",
    designation: "",
    verificationStatus: "",
    originalDocsProduced: false,
    status: "DRAFT",
    documents: [],
    undertaking: null,
  });

  const [uploadingDocNo, setUploadingDocNo] = useState<number | null>(null);
  const [uploadingUndertaking, setUploadingUndertaking] = useState(false);
  const [verificationModal, setVerificationModal] = useState<{isOpen: boolean, stage: "HOD"|"DEAN"|null}>({isOpen: false, stage: null});
  const [verifying, setVerifying] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const undertakingInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => { if (scholarId) { idRef.current = scholarId; fetchData(scholarId); } }, [scholarId]);

  
  const executeVerification = async () => {
    if (!verificationModal.stage) return;
    setVerifying(true);
    try {
      const res = await fetch(`/api/scholars/${scholarId}/matriculation/verify`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ stage: verificationModal.stage, status: "VERIFIED" })
      });
      if (!res.ok) {
        const d = await res.json();
        alert(d.error || "Failed to verify");
      } else {
        fetchData(scholarId);
      }
    } catch (e) {
      alert("Error verifying");
    } finally {
      setVerifying(false);
      setVerificationModal({ isOpen: false, stage: null });
    }
  };

  const fetchData = async (scholarId: string) => {
    try {
      const [authRes, scholarRes, matriculationRes] = await Promise.all([
        fetch("/api/auth/me"),
        fetch("/api/scholars"),
        fetch(`/api/scholars/${scholarId}/matriculation`),
        ]);

      const safeJson = async (res: Response) => {
        if (!res.ok) return null;
        try { return await res.json(); } catch { return null; }
      };

      const authData = await safeJson(authRes);
      if (authData) setCurrentUser(authData);

      const scholarData = await safeJson(scholarRes);
      if (scholarData?.scholars) {
        const found = scholarData.scholars.find((s: any) => s.id === scholarId);
        if (found) setScholar(found);
      }

      const matriculationData = await safeJson(matriculationRes);
      if (matriculationData?.matriculation) {
        let mergedDocuments = matriculationData.defaultDocuments || [];
        if (matriculationData.matriculation.documents && matriculationData.matriculation.documents.length > 0) {
          mergedDocuments = mergedDocuments.map((defDoc: any) => {
            const uploaded = matriculationData.matriculation.documents.find((d: any) => d.documentNo === defDoc.documentNo);
            return uploaded || defDoc;
          });
        }
        
        setMatriculation({
          ...matriculationData.matriculation,
          documents: mergedDocuments,
          date: matriculationData.matriculation.date ? new Date(matriculationData.matriculation.date).toISOString().split("T")[0] : "",
        });
      } else if (matriculationData?.defaultDocuments) {
        setMatriculation((prev: any) => ({
          ...prev,
          documents: matriculationData.defaultDocuments,
        }));
      }
    } catch (e) {
      console.error("Fetch Data Error:", e);
      toast.error("Failed to load data");
    } finally {
      setLoading(false);
    }
  };

  

  

  const handlePrint = () => {
    window.print();
  };

  const handleModeChange = async (newMode: string) => {
    if (!idRef.current) return;
    setMatriculation({ ...matriculation, mode: newMode });
    
    const loadToast = toast.loading("Saving mode...");
    try {
      const payload = {
        ...matriculation,
        mode: newMode,
        verificationStatus: matriculation.verificationStatus,
      };

      const res = await fetch(`/api/scholars/${idRef.current}/matriculation`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (res.ok) {
        toast.success("Mode updated successfully!", { id: loadToast });
      } else {
        toast.error("Failed to update mode", { id: loadToast });
      }
    } catch (error) {
      toast.error("Error updating mode", { id: loadToast });
    }
  };


  const handleOriginalDocsChange = async (checked: boolean) => {
    if (!idRef.current) return;
    setMatriculation({ ...matriculation, originalDocsProduced: checked });
    
    const loadToast = toast.loading("Saving checkbox status...");
    try {
      const payload = {
        ...matriculation,
        originalDocsProduced: checked,
        verificationStatus: matriculation.verificationStatus,
      };

      const res = await fetch(`/api/scholars/${idRef.current}/matriculation`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (res.ok) {
        toast.success("Checkbox updated successfully!", { id: loadToast });
      } else {
        toast.error("Failed to update checkbox", { id: loadToast });
      }
    } catch (error) {
      toast.error("Error updating checkbox", { id: loadToast });
    }
  };

  const handleSave = async (isSubmit = false) => {
    if (!idRef.current) return;
    if (isSubmit) setSubmitting(true);
    else setSaving(true);
    
    try {
      const payload = {
        ...matriculation,
        verificationStatus: isSubmit ? "COMPLETE" : matriculation.verificationStatus,
      };

      const res = await fetch(`/api/scholars/${idRef.current}/matriculation`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      if (res.ok) {
        toast.success(isSubmit ? "Matriculation submitted successfully!" : "Draft saved successfully!");
        if (data.matriculation) {
          setMatriculation({
            ...data.matriculation,
            date: data.matriculation.date ? new Date(data.matriculation.date).toISOString().split("T")[0] : "",
          });
        }
      } else {
        toast.error(data.error || "Failed to save");
      }
    } catch (error) {
      toast.error("An error occurred while saving.");
    } finally {
      setSaving(false);
      setSubmitting(false);
    }
  };

  const triggerUpload = (docNo: number) => {
    setUploadingDocNo(docNo);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
      fileInputRef.current.click();
    }
  };

  const triggerUndertakingUpload = () => {
    setUploadingUndertaking(true);
    if (undertakingInputRef.current) {
      undertakingInputRef.current.value = "";
      undertakingInputRef.current.click();
    }
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>, isUndertaking = false) => {
    const file = e.target.files?.[0];
    if (!file) {
      setUploadingDocNo(null);
      setUploadingUndertaking(false);
      return;
    }

    const formData = new FormData();
    formData.append("file", file);

    const loadToast = toast.loading("Uploading file...");
    
    try {
      const res = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      });
      
      const data = await res.json();
      if (res.ok) {
        toast.success("File uploaded successfully", { id: loadToast });
        

        let updatedMatriculation;
        if (isUndertaking) {
          updatedMatriculation = {
            ...matriculation,
            undertaking: {
              fileName: data.fileName,
              filePath: data.filePath,
              remarks: "",
            }
          };
          setMatriculation(updatedMatriculation);
        } else if (uploadingDocNo !== null) {
          const newDocs = [...matriculation.documents];
          const idx = newDocs.findIndex(d => d.documentNo === uploadingDocNo);
          if (idx >= 0) {
            newDocs[idx] = {
              ...newDocs[idx],
              fileName: data.fileName,
              filePath: data.filePath,
              fileSize: data.fileSize,
              mimeType: data.mimeType,
              isSubmitted: true,
            };
          }
          updatedMatriculation = { ...matriculation, documents: newDocs };
          setMatriculation(updatedMatriculation);
        }

        // Auto-save to database
        if (updatedMatriculation && idRef.current) {
          fetch(`/api/scholars/${idRef.current}/matriculation`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(updatedMatriculation),
          }).catch(console.error);
        }

      } else {
        toast.error(data.error || "Upload failed", { id: loadToast });
      }
    } catch (error) {
      toast.error("Upload failed", { id: loadToast });
    } finally {
      setUploadingDocNo(null);
      setUploadingUndertaking(false);
    }
  };

  // Logic to dynamically handle "Applicable"
  useEffect(() => {
    if (matriculation.documents.length === 0) return;
    
    setMatriculation((prev: any) => {
      const newDocs = [...prev.documents];
      const nocIdx = newDocs.findIndex(d => d.documentNo === 13);
      if (nocIdx >= 0) {
        const isPartTime = prev.mode === "PART_TIME";
        if (newDocs[nocIdx].isApplicable !== isPartTime) {
          newDocs[nocIdx].isApplicable = isPartTime;
          if (!isPartTime) {
            newDocs[nocIdx].isSubmitted = false;
            newDocs[nocIdx].isVerified = false;
          }
        }
      }
      return { ...prev, documents: newDocs };
    });
  }, [matriculation.mode, matriculation.documents.length]);

  if (loading) {
    return <div className="flex h-screen items-center justify-center"><p className="text-muted font-medium">Loading Checklist...</p></div>;
  }

  if (!scholar) {
    return <div className="flex h-screen items-center justify-center"><p className="text-danger font-medium">Scholar not found</p></div>;
  }

  // Calculate statistics
  const totalRequired = matriculation.mode === "FULL_TIME" ? 17 : 18;
  const submitted = matriculation.documents.filter((d: any) => {
    if (d.documentNo === 13 && matriculation.mode === "FULL_TIME") return false;
    return !!d.filePath;
  }).length;
  const verified = matriculation.documents.filter((d: any) => {
    if (d.documentNo === 13 && matriculation.mode === "FULL_TIME") return false;
    return !!d.isVerified;
  }).length;
  const pending = totalRequired - submitted;
  const rejected = 0; // Not explicitly tracked in the basic schema yet, usually derived from remarks/status
  
  const progressPercent = totalRequired > 0 ? Math.round((submitted / totalRequired) * 100) : 0;
  
  const isCoordinator = currentUser?.rawRole === "COORDINATOR" || currentUser?.rawRole === "SUPER_ADMIN";
  const canVerify = ["HOD", "DEAN", "RDC_ADMIN", "SUPER_ADMIN"].includes(currentUser?.rawRole);

  return (
    <>
      <style dangerouslySetInnerHTML={{__html: `
        @media print {
          body * { visibility: hidden; }
          .print-section, .print-section * { visibility: visible; }
          .print-section { position: absolute; left: 0; top: 0; width: 100%; }
          .no-print { display: none !important; }
          .print-border { border: 1px solid #000 !important; }
          .print-text { color: #000 !important; }
        }
      `}} />
      
      <div className="hidden">
        <input type="file" ref={fileInputRef} onChange={(e) => handleFileUpload(e, false)} accept=".pdf,.jpg,.jpeg,.png" />
        <input type="file" ref={undertakingInputRef} onChange={(e) => handleFileUpload(e, true)} accept=".pdf,.jpg,.jpeg,.png" />
      </div>

      <div className="w-full mx-auto py-4 px-2 space-y-6 print-section">
        
        {/* Header Actions (No Print) */}
        <div className="flex items-center justify-between no-print mb-6">
          
          <div className="flex items-center gap-3">


          </div>
        </div>

        <div className="bg-white text-black p-8 md:p-12 shadow-sm rounded-xl border border-gray-200">
          


          {/* Scholar Info */}
          <div className="mb-8 relative">
            <div className="flex items-center justify-between bg-gray-100 p-2 mb-4 border border-gray-300">
              <h4 className="text-sm font-bold uppercase">Ph.D. Scholar Information</h4>
              
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-y-4 gap-x-8 text-sm">
              <div className="flex border-b border-gray-200 pb-2">
                <span className="font-bold w-40">Scholar Name:</span>
                <span className="flex-1">{scholar.firstName} {scholar.lastName}</span>
              </div>
              <div className="flex border-b border-gray-200 pb-2">
                <span className="font-bold w-40">System ID:</span>
                <span className="flex-1 font-mono">{scholar.scholarId}</span>
              </div>
              <div className="flex border-b border-gray-200 pb-2">
                <span className="font-bold w-40">School:</span>
                <span className="flex-1">{scholar.school?.schoolName}</span>
              </div>
              <div className="flex border-b border-gray-200 pb-2">
                <span className="font-bold w-40">Department:</span>
                <span className="flex-1">{scholar.department?.departmentName}</span>
              </div>
              <div className="flex border-b border-gray-200 pb-2 md:col-span-2">
                <span className="font-bold w-40 shrink-0">Mode:</span>
                <div className="flex gap-6 flex-1">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input type="radio" checked={matriculation.mode === "FULL_TIME"} onChange={(e) => handleModeChange("FULL_TIME")}  className="accent-black w-4 h-4" /> 
                    Full Time
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input type="radio" checked={matriculation.mode === "PART_TIME"} onChange={(e) => handleModeChange("PART_TIME")}  className="accent-black w-4 h-4" /> 
                    Part Time
                  </label>
                </div>
              </div>
            </div>
          </div>



          {/* Verification Status */}
          <div className="mb-8">
            <h4 className="text-sm font-bold uppercase bg-gray-100 p-2 mb-4 border border-gray-300 flex justify-between items-center">
              <span>Document Verification Status</span>
              <span className="text-xs font-normal bg-white px-2 py-0.5 rounded border border-gray-300">Progress: {progressPercent}%</span>
            </h4>
            
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center mb-4">
              <div className="p-3 border border-gray-200 rounded-lg bg-indigo-50">
                <div className="text-2xl font-bold text-indigo-700">{submitted}</div>
                <div className="text-xs text-indigo-600 uppercase mt-1">Submitted</div>
              </div>
              <div className="p-3 border border-gray-200 rounded-lg bg-green-50">
                <div className="text-2xl font-bold text-green-700">{verified}</div>
                <div className="text-xs text-green-600 uppercase mt-1">Verified</div>
              </div>
              <div className="p-3 border border-gray-200 rounded-lg bg-orange-50">
                <div className="text-2xl font-bold text-orange-700">{pending}</div>
                <div className="text-xs text-orange-600 uppercase mt-1">Pending</div>
              </div>
              <div className="p-3 border border-gray-200 rounded-lg bg-red-50">
                <div className="text-2xl font-bold text-red-700">{rejected}</div>
                <div className="text-xs text-red-600 uppercase mt-1">Rejected</div>
              </div>
            </div>
            
            <div className="w-full bg-gray-200 rounded-full h-2.5 overflow-hidden">
              <div className="bg-green-600 h-2.5 rounded-full transition-all duration-500" style={{ width: `${progressPercent}%` }}></div>
            </div>
          </div>

          {/* Checklist Table */}
          <div className="mb-8 overflow-x-auto">
            <h4 className="text-sm font-bold uppercase bg-gray-100 p-2 border border-gray-300 border-b-0">Document Verification Checklist</h4>
            <table className="w-full text-sm border-collapse border border-gray-300">
              <thead>
                <tr className="bg-gray-50">
                  <th className="border border-gray-300 p-2 w-12 text-center">S.No.</th>
                  <th className="border border-gray-300 p-2 text-left">Document / Requirement</th>
                  <th className="border border-gray-300 p-2 w-48 text-center no-print">Document</th>
                </tr>
              </thead>
              <tbody>
                {matriculation.documents.map((doc: any, idx: number) => {
                  const isNA = doc.documentNo === 13 && matriculation.mode === "FULL_TIME";
                  
                  return (
                    <tr key={doc.documentNo} className={isNA ? "bg-gray-50/50" : ""}>
                      <td className="border border-gray-300 p-2 text-center font-medium text-gray-600">{doc.documentNo}</td>
                      <td className="border border-gray-300 p-2">
                        {doc.documentName}
                        {isNA && <span className="ml-2 text-xs font-bold text-red-500 no-print">(N/A)</span>}
                      </td>
                      <td className="border border-gray-300 p-2 text-center no-print">
                        {isNA ? (
                          <span className="text-xs text-gray-400 italic">Not Applicable</span>
                        ) : !doc.filePath ? (
                          <button 
                            onClick={() => triggerUpload(doc.documentNo)}
                            
                            className="text-xs inline-flex items-center gap-2 px-3 py-1.5 bg-blue-50 hover:bg-blue-100 border border-blue-200 rounded-lg text-blue-700 font-medium transition-colors disabled:opacity-50"
                          >
                            <Upload className="w-3.5 h-3.5" /> Upload
                          </button>
                        ) : (
                          <div className="flex flex-col gap-1 items-center">
                            <span className="text-[11px] text-slate-600 font-medium px-1 max-w-[140px] truncate block" title={doc.fileName}>{shortenFileName(doc.fileName)}</span>
                            <div className="flex items-center gap-1">
                              <a href={doc.filePath} target="_blank" rel="noreferrer" className="p-1 text-blue-600 hover:bg-blue-50 rounded" title="View">
                                <Eye className="w-3.5 h-3.5" />
                              </a>
                              <a href={doc.filePath} download className="p-1 text-green-600 hover:bg-green-50 rounded" title="Download">
                                <Download className="w-3.5 h-3.5" />
                              </a>
                              {isCoordinator && (
                                <button onClick={() => triggerUpload(doc.documentNo)} className="flex items-center gap-1 p-1 px-2 text-[10px] font-bold text-orange-600 hover:bg-orange-50 rounded transition-colors" title="Re-upload Document">
                                  <Upload className="w-3.5 h-3.5" /> Re-upload
                                </button>
                              )}
                            </div>
                          </div>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {/* Undertaking Section */}
          <div className="mb-8">
             <h4 className="text-sm font-bold uppercase bg-gray-100 p-2 mb-4 border border-gray-300">Undertaking</h4>
             <div className="p-4 border border-orange-200 bg-orange-50/50 rounded-lg flex flex-col md:flex-row items-center gap-4">
                <div className="flex-shrink-0">
                  <AlertCircle className="w-8 h-8 text-orange-500" />
                </div>
                <div className="flex-1 text-sm text-gray-700">
                  <p><strong>Note:</strong> If any of the above-mentioned document has not been produced/submitted, the Ph.D Scholar has to furnish an undertaking for Matriculation.</p>
                </div>
                <div className="flex-shrink-0 no-print">
                  {matriculation.undertaking ? (
                    <div className="flex flex-col gap-2 items-center bg-white p-3 border border-gray-200 rounded shadow-sm">
                      <div className="flex items-center gap-2">
                        <FileText className="w-4 h-4 text-blue-500" />
                        <span className="text-xs font-medium truncate max-w-[150px]" title={matriculation.undertaking.fileName}>{shortenFileName(matriculation.undertaking.fileName)}</span>
                      </div>
                      <div className="flex gap-2 w-full">
                        <a href={matriculation.undertaking.filePath} target="_blank" rel="noreferrer" className="flex-1 text-center text-xs py-1 px-2 bg-blue-50 text-blue-600 rounded hover:bg-blue-100 font-medium">View</a>
                        {isCoordinator && (
                          <button onClick={triggerUndertakingUpload} className="flex-1 text-xs py-1 px-2 bg-orange-50 text-orange-600 rounded hover:bg-orange-100 font-medium flex items-center justify-center gap-1"><Upload className="w-3 h-3" /> Re-upload</button>
                        )}
                      </div>
                    </div>
                  ) : (
                    pending > 0 && isCoordinator && (
                      <button onClick={triggerUndertakingUpload} className="flex flex-col items-center justify-center gap-1 px-4 py-3 border-2 border-dashed border-orange-300 hover:border-orange-400 bg-white hover:bg-orange-50 rounded-lg text-orange-700 transition-colors">
                        <Upload className="w-4 h-4" />
                        <span className="text-xs font-bold uppercase tracking-wider">Upload Undertaking</span>
                      </button>
                    )
                  )}
                </div>
             </div>
          </div>

          
          {/* Official Verifications */}
          <div className="mb-8 p-6 bg-white border border-gray-200 rounded-xl shadow-sm">
            <h4 className="text-sm font-bold text-gray-800 uppercase tracking-wider mb-4 border-b border-gray-100 pb-2">Official Verifications</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="p-4 rounded-lg border border-gray-100 bg-gray-50 flex flex-col items-center justify-center text-center">
                <span className="text-xs font-semibold text-gray-500 uppercase mb-2">HOD Verification</span>
                {matriculation.verifications?.find((v: any) => v.stage === 'HOD') ? (
                  <div className="flex flex-col items-center animate-in fade-in zoom-in duration-300">
                    <CheckCircle className="w-8 h-8 text-green-500 mb-2" />
                    <span className="text-sm font-bold text-green-700">Verified by HOD</span>
                  </div>
                ) : (
                  currentUser?.rawRole === 'HOD' && scholar?.departmentId === currentUser.departmentId ? (
                    <button onClick={() => setVerificationModal({isOpen: true, stage: 'HOD'})} className="px-4 py-2 bg-primary text-white text-sm font-semibold rounded-lg hover:bg-primary-hover shadow-sm transition-colors">Verify as HOD</button>
                  ) : (
                    <span className="text-sm text-gray-400 font-medium">Pending HOD Verification</span>
                  )
                )}
              </div>
              <div className="p-4 rounded-lg border border-gray-100 bg-gray-50 flex flex-col items-center justify-center text-center">
                <span className="text-xs font-semibold text-gray-500 uppercase mb-2">Dean Verification</span>
                {matriculation.verifications?.find((v: any) => v.stage === 'DEAN') ? (
                  <div className="flex flex-col items-center animate-in fade-in zoom-in duration-300">
                    <CheckCircle className="w-8 h-8 text-green-500 mb-2" />
                    <span className="text-sm font-bold text-green-700">Verified by Dean</span>
                  </div>
                ) : (
                  currentUser?.rawRole === 'DEAN' && scholar?.schoolId === currentUser.schoolId ? (
                    <button onClick={() => setVerificationModal({isOpen: true, stage: 'DEAN'})} className="px-4 py-2 bg-primary text-white text-sm font-semibold rounded-lg hover:bg-primary-hover shadow-sm transition-colors">Verify as Dean</button>
                  ) : (
                    <span className="text-sm text-gray-400 font-medium">Pending Dean Verification</span>
                  )
                )}
              </div>
            </div>
          </div>

          {/* Verification NB */}
          <div className="mb-8 p-4 bg-gray-100 border border-gray-300 text-sm font-bold text-center">
            <p className="uppercase text-red-600">NB:- Please bring all your documents in original for verification</p>
            <div className="mt-3 flex items-center justify-center gap-2 text-black">
              <input 
                type="checkbox" 
                checked={!!matriculation.originalDocsProduced} 
                onChange={(e) => handleOriginalDocsChange(e.target.checked)} 
                disabled={!canVerify}
                className="w-5 h-5 accent-black cursor-pointer" 
              />
              <span className="text-sm font-semibold">Original documents produced for verification</span>
            </div>
          </div>

        </div>
      </div>
      
    
      {/* Verification Confirmation Modal */}
      {verificationModal.isOpen && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white w-full max-w-sm flex flex-col rounded-3xl shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200">
            <div className="p-8 text-center relative">
              <button 
                onClick={() => setVerificationModal({ isOpen: false, stage: null })}
                className="absolute top-4 right-4 p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-full transition-colors"
              >
                <X className="w-5 h-5" />
              </button>

              <div className="w-16 h-16 bg-blue-50 rounded-full flex items-center justify-center mx-auto mb-5 shadow-sm border border-blue-100">
                <CheckCircle className="w-8 h-8 text-blue-600" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">
                Verify Matriculation
              </h3>
              <p className="text-sm text-gray-500 mb-8 leading-relaxed">
                You are about to officially verify this checklist as <strong>{verificationModal.stage}</strong>. 
                By proceeding, you confirm all required documents are accurate.
              </p>
              
              <div className="flex flex-row gap-3 mt-2">
                <button 
                  onClick={() => setVerificationModal({ isOpen: false, stage: null })}
                  disabled={verifying}
                  className="flex-1 py-3 text-sm font-bold text-gray-600 hover:text-gray-900 bg-gray-100 hover:bg-gray-200 rounded-xl transition-colors disabled:opacity-50"
                >
                  Cancel
                </button>
                <button 
                  onClick={executeVerification}
                  disabled={verifying}
                  className="flex-1 py-3 bg-blue-600 text-white text-sm font-bold rounded-xl hover:bg-blue-700 shadow-sm transition-all active:scale-[0.98] disabled:opacity-50"
                >
                  {verifying ? 'Wait...' : 'Confirm'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

    </>
  );
}