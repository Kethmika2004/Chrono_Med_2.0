import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { HeartPulse, Pill, AlertTriangle, Syringe, Activity, Save, Edit2 } from 'lucide-react';
import { Input } from '@/components/ui/input';

const SECTIONS = [
  { id: 'conditions', title: 'Chronic Conditions', icon: HeartPulse, color: 'text-rose-500' },
  { id: 'medications', title: 'Current Medications', icon: Pill, color: 'text-teal-500' },
  { id: 'allergies', title: 'Allergies', icon: AlertTriangle, color: 'text-amber-500' },
  { id: 'surgeries', title: 'Past Surgeries', icon: Activity, color: 'text-blue-500' },
  { id: 'immunizations', title: 'Immunizations', icon: Syringe, color: 'text-purple-500' },
];

export default function HealthRecord() {
  const [isEditing, setIsEditing] = useState(false);
  const [records, setRecords] = useState({
    conditions: ['Hypertension (Diagnosed 2018)', 'Type 2 Diabetes (Diagnosed 2020)'],
    medications: ['Lisinopril 10mg (Daily)', 'Metformin 500mg (Twice daily)'],
    allergies: ['Penicillin', 'Peanuts (Mild)'],
    surgeries: ['Appendectomy (2015)'],
    immunizations: ['COVID-19 Booster (2023)', 'Flu Shot (2023)'],
  });

  const [editForm, setEditForm] = useState(records);

  const handleSave = () => {
    // In a real app, save to Supabase
    setRecords(editForm);
    setIsEditing(false);
  };

  const handleAddItem = (section: keyof typeof records) => {
    setEditForm(prev => ({
      ...prev,
      [section]: [...prev[section], '']
    }));
  };

  const handleUpdateItem = (section: keyof typeof records, index: number, value: string) => {
    const updated = [...editForm[section]];
    updated[index] = value;
    setEditForm(prev => ({ ...prev, [section]: updated }));
  };

  const handleRemoveItem = (section: keyof typeof records, index: number) => {
    const updated = editForm[section].filter((_, i) => i !== index);
    setEditForm(prev => ({ ...prev, [section]: updated }));
  };

  return (
    <div className="max-w-5xl mx-auto space-y-8">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-gradient-to-r from-teal-700 to-teal-900 p-8 rounded-3xl text-white shadow-lg relative overflow-hidden">
        <div className="relative z-10">
          <h1 className="text-3xl font-bold">Health Passport</h1>
          <p className="text-teal-100 mt-2 max-w-lg">
            Your comprehensive medical summary. Keep this updated for more accurate consultations.
          </p>
        </div>
        <div className="relative z-10">
          {isEditing ? (
            <div className="flex gap-3">
              <Button variant="outline" className="bg-white/10 text-white border-white/20 hover:bg-white/20" onClick={() => setIsEditing(false)}>Cancel</Button>
              <Button className="bg-white text-teal-800 hover:bg-teal-50" onClick={handleSave}>
                <Save className="w-4 h-4 mr-2" /> Save Changes
              </Button>
            </div>
          ) : (
            <Button className="bg-white/20 text-white border-white/20 hover:bg-white/30 backdrop-blur-sm" onClick={() => { setEditForm(records); setIsEditing(true); }}>
              <Edit2 className="w-4 h-4 mr-2" /> Edit Records
            </Button>
          )}
        </div>
        <div className="absolute -right-10 -bottom-10 w-64 h-64 bg-teal-600 rounded-full blur-3xl opacity-50"></div>
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        {SECTIONS.map((section) => (
          <Card key={section.id} className="border-slate-200 shadow-sm">
            <CardHeader className="pb-3 border-b border-slate-50 flex flex-row items-center gap-3">
              <div className={`p-2 bg-slate-50 rounded-lg ${section.color}`}>
                <section.icon className="w-5 h-5" />
              </div>
              <CardTitle className="text-lg">{section.title}</CardTitle>
            </CardHeader>
            <CardContent className="pt-4">
              {isEditing ? (
                <div className="space-y-3">
                  {editForm[section.id as keyof typeof records].map((item, idx) => (
                    <div key={idx} className="flex items-center gap-2">
                      <Input 
                        value={item} 
                        onChange={(e) => handleUpdateItem(section.id as any, idx, e.target.value)}
                        className="h-10 bg-slate-50"
                        placeholder="Enter detail..."
                      />
                      <Button variant="ghost" size="sm" className="text-red-500 hover:text-red-700 hover:bg-red-50" onClick={() => handleRemoveItem(section.id as any, idx)}>
                        Remove
                      </Button>
                    </div>
                  ))}
                  <Button variant="outline" size="sm" className="w-full border-dashed" onClick={() => handleAddItem(section.id as any)}>
                    + Add Item
                  </Button>
                </div>
              ) : (
                <ul className="space-y-3">
                  {records[section.id as keyof typeof records].length > 0 ? (
                    records[section.id as keyof typeof records].map((item, idx) => (
                      <li key={idx} className="flex items-start gap-2 text-slate-700">
                        <span className="w-1.5 h-1.5 rounded-full bg-slate-300 mt-2 shrink-0" />
                        <span>{item}</span>
                      </li>
                    ))
                  ) : (
                    <li className="text-sm text-slate-400 italic">No records added.</li>
                  )}
                </ul>
              )}
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
