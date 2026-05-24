import { useState, useRef } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { FileText, Upload, Download, Trash2, File, Activity, Stethoscope } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { useAuthStore } from '@/store/authStore';

const MOCK_DOCS = [
  { id: 1, name: 'Blood Test Results.pdf', category: 'Lab Reports', date: 'Oct 20, 2023', size: '2.4 MB', icon: Activity, color: 'text-rose-500 bg-rose-50' },
  { id: 2, name: 'Cardiology Assessment.pdf', category: 'Consultations', date: 'Sep 15, 2023', size: '1.1 MB', icon: Stethoscope, color: 'text-teal-500 bg-teal-50' },
  { id: 3, name: 'Prescription_Sep.pdf', category: 'Prescriptions', date: 'Sep 15, 2023', size: '450 KB', icon: FileText, color: 'text-blue-500 bg-blue-50' },
];

export default function Documents() {
  const { user } = useAuthStore();
  const [documents, setDocuments] = useState(MOCK_DOCS);
  const [isDragging, setIsDragging] = useState(false);
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

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
    setUploading(true);
    // Real implementation would upload to Supabase Storage:
    /*
    for(const file of Array.from(files)) {
      const filePath = `${user?.id}/${Date.now()}_${file.name}`;
      await supabase.storage.from('medical-documents').upload(filePath, file);
    }
    */
    
    // Mock upload delay
    setTimeout(() => {
      const newDocs = Array.from(files).map((f, i) => ({
        id: Date.now() + i,
        name: f.name,
        category: 'Uncategorized',
        date: new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
        size: `${(f.size / (1024 * 1024)).toFixed(1)} MB`,
        icon: File,
        color: 'text-slate-500 bg-slate-50'
      }));
      setDocuments(prev => [...newDocs, ...prev]);
      setUploading(false);
    }, 1500);
  };

  return (
    <div className="max-w-5xl mx-auto space-y-8">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">Medical Documents</h1>
          <p className="text-slate-500 mt-1">Securely store and manage your health records</p>
        </div>
        <Button onClick={() => fileInputRef.current?.click()} className="bg-teal-600 hover:bg-teal-700">
          <Upload className="w-4 h-4 mr-2" /> Upload File
        </Button>
      </div>

      {/* Drag & Drop Zone */}
      <div 
        className={`border-2 border-dashed rounded-2xl p-10 text-center transition-colors ${
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
          accept=".pdf,.jpg,.jpeg,.png"
        />
        <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center mx-auto mb-4 shadow-sm">
          <Upload className={`w-8 h-8 ${isDragging ? 'text-teal-600' : 'text-slate-400'}`} />
        </div>
        <h3 className="text-lg font-semibold text-slate-700 mb-1">
          {uploading ? 'Uploading...' : 'Click or drag files here to upload'}
        </h3>
        <p className="text-sm text-slate-500 max-w-sm mx-auto">
          Support for PDF, JPG, PNG files up to 10MB.
        </p>
      </div>

      {/* Document List */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {documents.map((doc) => (
          <Card key={doc.id} className="border-slate-200 shadow-sm hover:shadow-md transition-shadow group">
            <CardContent className="p-5">
              <div className="flex items-start justify-between mb-4">
                <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${doc.color}`}>
                  <doc.icon className="w-6 h-6" />
                </div>
                <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                  <button className="p-1.5 text-slate-400 hover:text-teal-600 hover:bg-teal-50 rounded-lg transition-colors">
                    <Download className="w-4 h-4" />
                  </button>
                  <button className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors">
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
              <div>
                <h4 className="font-semibold text-slate-900 truncate" title={doc.name}>{doc.name}</h4>
                <div className="flex items-center justify-between mt-2">
                  <span className="text-xs font-medium px-2 py-1 rounded-md bg-slate-100 text-slate-600">
                    {doc.category}
                  </span>
                  <span className="text-xs text-slate-500">{doc.date}</span>
                </div>
                <div className="mt-4 text-xs text-slate-400 font-medium">
                  {doc.size}
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
