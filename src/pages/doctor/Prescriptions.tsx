import { useState, useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { FileText, Plus, Trash2, Loader2, X, ChevronDown, CheckCircle2, Search } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { useAuthStore } from '@/store/authStore';

interface Medication {
  name: string;
  dosage: string;
  frequency: string;
  duration: string;
  instructions: string;
}

const FREQUENCIES = ['Once daily', 'Twice daily', 'Three times daily', 'Every 8 hours', 'Every 12 hours', 'As needed', 'With meals', 'Before meals', 'At bedtime'];
const DURATIONS = ['3 days', '5 days', '7 days', '10 days', '14 days', '1 month', '2 months', '3 months', 'Ongoing'];

const emptyMed: Medication = { name: '', dosage: '', frequency: 'Once daily', duration: '7 days', instructions: '' };

export default function Prescriptions() {
  const { profile } = useAuthStore();
  const [recentAppointments, setRecentAppointments] = useState<any[]>([]);
  const [selectedAppointment, setSelectedAppointment] = useState<any>(null);
  const [medications, setMedications] = useState<Medication[]>([{ ...emptyMed }]);
  const [notes, setNotes] = useState('');
  const [followUp, setFollowUp] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const [savedPrescriptions, setSavedPrescriptions] = useState<any[]>([]);
  const [isLoadingAppts, setIsLoadingAppts] = useState(true);
  const [isLoadingRx, setIsLoadingRx] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [savedSuccess, setSavedSuccess] = useState(false);

  useEffect(() => {
    if (!profile?.id) return;
    const fetchData = async () => {
      // Get doctor profile
      const { data: docData } = await supabase.from('doctors').select('id').eq('profile_id', profile.id).single();
      if (!docData) return;

      // Get recent completed appointments
      setIsLoadingAppts(true);
      const { data: appts } = await supabase
        .from('appointments')
        .select(`
          id, token_number, chief_complaint, created_at,
          sessions (session_date, doctors (id)),
          user_profiles:patient_id (full_name, avatar_url)
        `)
        .eq('sessions.doctors.id', docData.id)
        .in('status', ['completed', 'upcoming', 'called_at'])
        .order('created_at', { ascending: false })
        .limit(20);
      setRecentAppointments(appts || []);
      setIsLoadingAppts(false);

      // Get saved prescriptions
      setIsLoadingRx(true);
      const { data: rxData } = await supabase
        .from('prescriptions')
        .select(`
          id, created_at, notes, follow_up_date,
          medications,
          appointments (
            user_profiles:patient_id (full_name)
          )
        `)
        .eq('doctor_id', docData.id)
        .order('created_at', { ascending: false })
        .limit(20);
      setSavedPrescriptions(rxData || []);
      setIsLoadingRx(false);
    };

    fetchData();
  }, [profile?.id]);

  const handleAddMed = () => setMedications(m => [...m, { ...emptyMed }]);
  const handleRemoveMed = (i: number) => setMedications(m => m.filter((_, idx) => idx !== i));
  const handleMedChange = (i: number, field: keyof Medication, value: string) => {
    setMedications(m => m.map((med, idx) => idx === i ? { ...med, [field]: value } : med));
  };

  const handleSave = async () => {
    if (!selectedAppointment || medications.some(m => !m.name)) return;
    setIsSaving(true);
    try {
      const { data: docData } = await supabase.from('doctors').select('id').eq('profile_id', profile?.id).single();
      await supabase.from('prescriptions').insert([{
        appointment_id: selectedAppointment.id,
        patient_id: selectedAppointment.patient_id,
        doctor_id: docData?.id,
        medications,
        notes,
        follow_up_date: followUp || null,
        issued_at: new Date().toISOString(),
      }]);
      setSavedSuccess(true);
      setTimeout(() => setSavedSuccess(false), 3000);
      setMedications([{ ...emptyMed }]);
      setNotes('');
      setFollowUp('');
      setSelectedAppointment(null);
    } catch (err) {
      console.error('Failed to save prescription:', err);
    } finally {
      setIsSaving(false);
    }
  };

  const filteredAppts = recentAppointments.filter(a =>
    (a.user_profiles?.full_name || '').toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="max-w-5xl mx-auto space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-slate-900">Prescriptions</h1>
        <p className="text-slate-500 mt-1">Create and manage digital prescriptions</p>
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Patient Selector */}
        <div className="lg:col-span-1 space-y-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4" />
            <Input placeholder="Search patient..." className="pl-9 bg-slate-50" value={searchQuery} onChange={e => setSearchQuery(e.target.value)} />
          </div>
          <div className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-sm">
            <div className="p-3 border-b border-slate-100 text-sm font-semibold text-slate-700">Select Patient</div>
            {isLoadingAppts ? (
              <div className="p-6 text-center"><Loader2 className="w-6 h-6 animate-spin text-teal-600 mx-auto" /></div>
            ) : filteredAppts.length === 0 ? (
              <div className="p-6 text-center text-sm text-slate-400">No recent patients</div>
            ) : (
              <div className="overflow-y-auto max-h-[400px] divide-y divide-slate-100">
                {filteredAppts.map(appt => (
                  <button key={appt.id} onClick={() => setSelectedAppointment(appt)}
                    className={`w-full text-left p-3 flex items-center gap-3 transition-colors ${selectedAppointment?.id === appt.id ? 'bg-teal-50 border-l-2 border-teal-500' : 'hover:bg-slate-50'}`}>
                    <div className="w-9 h-9 bg-teal-100 rounded-full flex items-center justify-center text-teal-700 font-bold text-sm flex-shrink-0">
                      {(appt.user_profiles?.full_name || '?')[0].toUpperCase()}
                    </div>
                    <div className="min-w-0">
                      <p className="font-medium text-sm text-slate-900 truncate">{appt.user_profiles?.full_name || 'Patient'}</p>
                      <p className="text-xs text-slate-400 truncate">{appt.chief_complaint || 'No complaint noted'}</p>
                    </div>
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Prescription Builder */}
        <div className="lg:col-span-2 space-y-5">
          {savedSuccess && (
            <div className="flex items-center gap-3 p-4 bg-green-50 border border-green-200 rounded-xl text-green-800">
              <CheckCircle2 className="w-5 h-5 text-green-600" />
              <p className="font-medium">Prescription saved successfully!</p>
            </div>
          )}

          {!selectedAppointment ? (
            <div className="text-center py-16 bg-white border border-slate-100 rounded-xl">
              <FileText className="w-12 h-12 text-slate-300 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-slate-700">Select a Patient</h3>
              <p className="text-slate-500 text-sm mt-1">Choose a patient from the list to create a prescription</p>
            </div>
          ) : (
            <Card className="border-slate-200 shadow-sm">
              <CardContent className="p-6 space-y-6">
                {/* Header */}
                <div className="flex items-center justify-between p-4 bg-teal-50 rounded-xl border border-teal-100">
                  <div>
                    <p className="text-sm text-teal-600 font-medium">Prescribing for</p>
                    <p className="text-xl font-bold text-teal-800">{selectedAppointment.user_profiles?.full_name}</p>
                    {selectedAppointment.chief_complaint && <p className="text-sm text-teal-600 mt-0.5">{selectedAppointment.chief_complaint}</p>}
                  </div>
                  <button onClick={() => setSelectedAppointment(null)} className="text-teal-400 hover:text-teal-600">
                    <X className="w-5 h-5" />
                  </button>
                </div>

                {/* Medications */}
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <h3 className="font-semibold text-slate-800">Medications</h3>
                    <Button size="sm" variant="outline" onClick={handleAddMed} className="gap-1 text-teal-600 border-teal-200 hover:bg-teal-50">
                      <Plus className="w-4 h-4" /> Add Drug
                    </Button>
                  </div>
                  {medications.map((med, i) => (
                    <div key={i} className="p-4 bg-slate-50 rounded-xl border border-slate-100 space-y-3">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Drug #{i + 1}</span>
                        {medications.length > 1 && (
                          <button onClick={() => handleRemoveMed(i)} className="text-slate-400 hover:text-red-500">
                            <Trash2 className="w-4 h-4" />
                          </button>
                        )}
                      </div>
                      <div className="grid sm:grid-cols-2 gap-3">
                        <div className="space-y-1">
                          <label className="text-xs font-medium text-slate-600">Drug Name</label>
                          <Input placeholder="e.g. Amoxicillin" value={med.name} onChange={e => handleMedChange(i, 'name', e.target.value)} className="bg-white" />
                        </div>
                        <div className="space-y-1">
                          <label className="text-xs font-medium text-slate-600">Dosage</label>
                          <Input placeholder="e.g. 500mg" value={med.dosage} onChange={e => handleMedChange(i, 'dosage', e.target.value)} className="bg-white" />
                        </div>
                        <div className="space-y-1">
                          <label className="text-xs font-medium text-slate-600">Frequency</label>
                          <select className="w-full h-10 px-3 border border-slate-200 rounded-md bg-white text-sm focus:outline-none focus:ring-2 focus:ring-teal-500"
                            value={med.frequency} onChange={e => handleMedChange(i, 'frequency', e.target.value)}>
                            {FREQUENCIES.map(f => <option key={f}>{f}</option>)}
                          </select>
                        </div>
                        <div className="space-y-1">
                          <label className="text-xs font-medium text-slate-600">Duration</label>
                          <select className="w-full h-10 px-3 border border-slate-200 rounded-md bg-white text-sm focus:outline-none focus:ring-2 focus:ring-teal-500"
                            value={med.duration} onChange={e => handleMedChange(i, 'duration', e.target.value)}>
                            {DURATIONS.map(d => <option key={d}>{d}</option>)}
                          </select>
                        </div>
                        <div className="sm:col-span-2 space-y-1">
                          <label className="text-xs font-medium text-slate-600">Special Instructions</label>
                          <Input placeholder="e.g. Take with food" value={med.instructions} onChange={e => handleMedChange(i, 'instructions', e.target.value)} className="bg-white" />
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Notes & Follow-up */}
                <div className="grid sm:grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="text-sm font-medium text-slate-700">Clinical Notes</label>
                    <textarea className="w-full min-h-[100px] px-3 py-2 border border-slate-200 rounded-lg text-sm bg-white focus:outline-none focus:ring-2 focus:ring-teal-500 resize-none"
                      placeholder="Diagnosis, advice, instructions..." value={notes} onChange={e => setNotes(e.target.value)} />
                  </div>
                  <div className="space-y-1">
                    <label className="text-sm font-medium text-slate-700">Follow-up Date</label>
                    <input type="date" className="w-full h-10 px-3 border border-slate-200 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-teal-500"
                      value={followUp} onChange={e => setFollowUp(e.target.value)} />
                    <p className="text-xs text-slate-400">Optional: schedule a follow-up appointment</p>
                  </div>
                </div>

                <div className="flex justify-end gap-3">
                  <Button variant="outline" onClick={() => { setMedications([{ ...emptyMed }]); setNotes(''); setFollowUp(''); }}>
                    Clear
                  </Button>
                  <Button onClick={handleSave} disabled={isSaving || medications.some(m => !m.name)} className="bg-teal-600 hover:bg-teal-700 gap-2">
                    {isSaving ? <Loader2 className="w-4 h-4 animate-spin" /> : <FileText className="w-4 h-4" />}
                    Save Prescription
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Recent Prescriptions */}
          {savedPrescriptions.length > 0 && (
            <div className="space-y-3">
              <h3 className="font-semibold text-slate-700 text-sm uppercase tracking-wider">Recent Prescriptions</h3>
              {isLoadingRx ? (
                <Loader2 className="w-5 h-5 animate-spin text-teal-600" />
              ) : (
                savedPrescriptions.map(rx => (
                  <div key={rx.id} className="bg-white border border-slate-200 rounded-xl p-4 shadow-sm flex items-center justify-between">
                    <div>
                      <p className="font-medium text-slate-900">{rx.appointments?.user_profiles?.full_name || 'Patient'}</p>
                      <p className="text-sm text-slate-400">{(rx.medications || []).length} medication(s) • {new Date(rx.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</p>
                    </div>
                    <FileText className="w-5 h-5 text-teal-600" />
                  </div>
                ))
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
