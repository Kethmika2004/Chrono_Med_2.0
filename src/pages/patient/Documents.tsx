import { useState, useRef, useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { FileText, Upload, Download, Trash2, File, Activity, Stethoscope, Loader2, AlertCircle } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { useAuthStore } from '@/store/authStore';

const CATEGORY_ICONS: Record<string, { icon: React.ElementType; color: string }> = {
  lab_report: { icon: Activity, color: 'text-rose-500 bg-rose-50' },
  consultation: { icon: Stethoscope, color: 'text-teal-500 bg-teal-50' },
  prescription: { icon: FileText, color: 'text-blue-500 bg-blue-50' },
  radiology: { icon: Activity, color: 'text-purple-500 bg-purple-50' },
  other: { icon: File, color: 'text-slate-500 bg-slate-50' },
};

export default function Documents() {
  const { user, profile } = useAuthStore();
  const [documents, setDocuments] = useState<any[]>([]);
  const [isDragging, setIsDragging] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const fetchDocuments = async () => {
    if (!profile?.id) return;
    try {
      setIsLoading(true);
      const { data, error } = await supabase
        .from('medical_documents')
        .select('*')
        .eq('patient_id', profile.id)
        .eq('is_archived', false)
        .order('uploaded_at', { ascending: false });

      if (error) throw error;
      setDocuments(data || []);
    } catch (err) {
      console.error('Failed to fetch documents:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchDocuments();
  }, [profile?.id]);

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = async (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      handleFiles(e.dataTransfer.files);
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      handleFiles(e.target.files);
    }
  };

  const handleFiles = async (files: FileList) => {
    if (!user?.id || !profile?.id) return;
    setUploading(true);
    let uploadedCount = 0;

    for (const file of Array.from(files)) {
      try {
        setUploadProgress(`Uploading ${file.name}...`);
        const safeFileName = file.name.replace(/[^a-zA-Z0-9._-]/g, '_');
        const filePath = `${user.id}/${Date.now()}_${safeFileName}`;

        // Upload to Supabase Storage
        const { error: uploadError } = await supabase.storage
          .from('medical-documents')
          .upload(filePath, file);

        if (uploadError) throw uploadError;

        // Get public URL
        const { data: urlData } = supabase.storage
          .from('medical-documents')
          .getPublicUrl(filePath);

        // Determine category
        const nameLower = file.name.toLowerCase();
        let category = 'other';
        if (nameLower.includes('lab') || nameLower.includes('test') || nameLower.includes('blood')) category = 'lab_report';
        else if (nameLower.includes('prescription') || nameLower.includes('rx')) category = 'prescription';
        else if (nameLower.includes('scan') || nameLower.includes('xray') || nameLower.includes('mri') || nameLower.includes('ct')) category = 'radiology';
        else if (nameLower.includes('consult') || nameLower.includes('report')) category = 'consultation';

        // Save metadata to database
        const { error: dbError } = await supabase
          .from('medical_documents')
          .insert([{
            patient_id: profile.id,
            file_url: urlData.publicUrl,
            file_name: file.name,
            file_type: file.type,
            file_size_bytes: file.size,
            document_category: category,
            uploaded_at: new Date().toISOString(),
            visible_to_doctor: true,
            is_archived: false,
          }]);

        if (dbError) throw dbError;
        uploadedCount++;
      } catch (err) {
        console.error(`Failed to upload ${file.name}:`, err);
        setUploadProgress(`Failed to upload ${file.name}`);
        await new Promise(r => setTimeout(r, 1000));
      }
    }

    setUploadProgress(null);
    setUploading(false);
    if (uploadedCount > 0) fetchDocuments();
  };

  const handleDownload = async (doc: any) => {
    try {
      const filePath = doc.file_url.split('/medical-documents/')[1];
      if (!filePath) {
        window.open(doc.file_url, '_blank');
        return;
      }
      const { data, error } = await supabase.storage
        .from('medical-documents')
        .createSignedUrl(filePath, 60);

      if (error) throw error;
      window.open(data.signedUrl, '_blank');
    } catch (err) {
      console.error('Failed to download:', err);
      window.open(doc.file_url, '_blank');
    }
  };

  const handleDelete = async (doc: any) => {
    if (!confirm(`Delete "${doc.file_name}"? This cannot be undone.`)) return;
    setDeletingId(doc.id);
    try {
      // Archive in database
      const { error: dbError } = await supabase
        .from('medical_documents')
        .update({ is_archived: true })
        .eq('id', doc.id);
      if (dbError) throw dbError;

      // Try to delete from storage (best-effort)
      const filePath = doc.file_url.split('/medical-documents/')[1];
      if (filePath) {
        await supabase.storage.from('medical-documents').remove([filePath]);
      }

      setDocuments(prev => prev.filter(d => d.id !== doc.id));
    } catch (err) {
      console.error('Failed to delete:', err);
    } finally {
      setDeletingId(null);
    }
  };

  const formatFileSize = (bytes: number) => {
    if (!bytes) return '';
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  const formatDate = (dateStr: string) => {
    if (!dateStr) return '';
    return new Date(dateStr).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  };

  return (
    <div className="max-w-5xl mx-auto space-y-8">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">Medical Documents</h1>
          <p className="text-slate-500 mt-1">Securely store and manage your health records</p>
        </div>
        <Button onClick={() => fileInputRef.current?.click()} className="bg-teal-600 hover:bg-teal-700" disabled={uploading}>
          {uploading ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Upload className="w-4 h-4 mr-2" />}
          Upload File
        </Button>
      </div>

      {/* Drag & Drop Zone */}
      <div 
        className={`border-2 border-dashed rounded-2xl p-10 text-center transition-colors cursor-pointer ${
          isDragging ? 'border-teal-500 bg-teal-50' : 'border-slate-300 bg-slate-50 hover:bg-slate-100 hover:border-teal-300'
        }`}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        onClick={() => fileInputRef.current?.click()}
      >
        <input 
          type="file" 
          ref={fileInputRef} 
          onChange={handleFileSelect} 
          className="hidden" 
          multiple 
          accept=".pdf,.jpg,.jpeg,.png,.doc,.docx"
        />
        <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center mx-auto mb-4 shadow-sm">
          {uploading ? (
            <Loader2 className="w-8 h-8 text-teal-600 animate-spin" />
          ) : (
            <Upload className={`w-8 h-8 ${isDragging ? 'text-teal-600' : 'text-slate-400'}`} />
          )}
        </div>
        <h3 className="text-lg font-semibold text-slate-700 mb-1">
          {uploading ? (uploadProgress || 'Uploading...') : 'Click or drag files here to upload'}
        </h3>
        <p className="text-sm text-slate-500 max-w-sm mx-auto">
          Supports PDF, JPG, PNG, DOC files up to 10MB.
        </p>
      </div>

      {/* Document List */}
      {isLoading ? (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {[1, 2, 3].map(i => (
            <div key={i} className="h-48 bg-slate-200 rounded-xl animate-pulse" />
          ))}
        </div>
      ) : documents.length === 0 ? (
        <div className="text-center py-16 bg-white border border-slate-100 rounded-xl">
          <File className="w-12 h-12 text-slate-300 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-slate-800">No Documents Yet</h3>
          <p className="text-slate-500 mt-1 text-sm">Upload your lab results, prescriptions, or scan reports.</p>
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {documents.map((doc) => {
            const catInfo = CATEGORY_ICONS[doc.document_category] || CATEGORY_ICONS.other;
            const Icon = catInfo.icon;
            const isDeleting = deletingId === doc.id;

            return (
              <Card key={doc.id} className={`border-slate-200 shadow-sm hover:shadow-md transition-shadow group ${isDeleting ? 'opacity-50 pointer-events-none' : ''}`}>
                <CardContent className="p-5">
                  <div className="flex items-start justify-between mb-4">
                    <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${catInfo.color}`}>
                      <Icon className="w-6 h-6" />
                    </div>
                    <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button 
                        className="p-1.5 text-slate-400 hover:text-teal-600 hover:bg-teal-50 rounded-lg transition-colors"
                        onClick={() => handleDownload(doc)}
                      >
                        <Download className="w-4 h-4" />
                      </button>
                      <button 
                        className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                        onClick={() => handleDelete(doc)}
                      >
                        {isDeleting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Trash2 className="w-4 h-4" />}
                      </button>
                    </div>
                  </div>
                  <div>
                    <h4 className="font-semibold text-slate-900 truncate text-sm" title={doc.file_name}>{doc.file_name}</h4>
                    <div className="flex items-center justify-between mt-2">
                      <span className="text-xs font-medium px-2 py-1 rounded-md bg-slate-100 text-slate-600 capitalize">
                        {(doc.document_category || 'other').replace('_', ' ')}
                      </span>
                      <span className="text-xs text-slate-500">{formatDate(doc.uploaded_at)}</span>
                    </div>
                    <div className="mt-3 text-xs text-slate-400 font-medium">
                      {formatFileSize(doc.file_size_bytes)}
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
