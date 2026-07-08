import { useState, useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Calendar, Plus, Clock, Users, ChevronRight, Loader2, X, CheckCircle2, Edit2 } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { useAuthStore } from '@/store/authStore';
import { useNavigate } from 'react-router-dom';

const STATUS_STYLE: Record<string, string> = {
  active: 'bg-green-100 text-green-700 border-green-200',
  inactive: 'bg-slate-100 text-slate-600 border-slate-200',
  delayed: 'bg-amber-100 text-amber-700 border-amber-200',
  completed: 'bg-blue-100 text-blue-700 border-blue-200',
  cancelled: 'bg-red-100 text-red-700 border-red-200',
};

const defaultForm = {
  session_date: '',
  start_time: '',
  end_time: '',
  hospital_id: '',
  max_patients: 20,
  consultation_fee_lkr: 2500,
};

export default function DoctorSessions() {
  const { profile } = useAuthStore();
  const navigate = useNavigate();
  const [sessions, setSessions] = useState<any[]>([]);
  const [hospitals, setHospitals] = useState<any[]>([]);
  const [doctorId, setDoctorId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState(defaultForm);
  const [isSaving, setIsSaving] = useState(false);
  const [cancellingId, setCancellingId] = useState<string | null>(null);
  const [editingSession, setEditingSession] = useState<any>(null);

  const fetchDoctorAndSessions = async () => {
    if (!profile?.id) return;
    try {
      setIsLoading(true);
      const { data: docData } = await supabase
        .from('doctors')
        .select('id, hospital_affiliations, consultation_fee_lkr')
        .eq('profile_id', profile.id)
        .single();

      if (!docData) return;
      setDoctorId(docData.id);

      const { data: sessionsData } = await supabase
        .from('sessions')
        .select(`
          id, session_date, start_time, end_time, status,
          max_patients, current_token, delay_minutes,
          hospitals (id, name, city)
        `)
        .eq('doctor_id', docData.id)
        .order('session_date', { ascending: false });

      setSessions(sessionsData || []);

      // Fetch affiliated hospitals
      if (docData.hospital_affiliations?.length) {
        const { data: hospData } = await supabase
          .from('hospitals')
          .select('id, name, city')
          .in('id', docData.hospital_affiliations);
        setHospitals(hospData || []);
        if (hospData?.length && !form.hospital_id) {
          setForm(f => ({ ...f, hospital_id: hospData[0].id }));
        }
      }
    } catch (err) {
      console.error('Error fetching sessions:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchDoctorAndSessions();
  }, [profile?.id]);

  const openEditForm = (session: any) => {
    setEditingSession(session);
    setForm({
      session_date: session.session_date,
      start_time: session.start_time,
      end_time: session.end_time,
      hospital_id: session.hospitals?.id || '',
      max_patients: session.max_patients,
      consultation_fee_lkr: session.consultation_fee_lkr || 2500,
    });
    setShowForm(true);
  };

  const handleSave = async () => {
    if (!doctorId || !form.session_date || !form.start_time || !form.end_time || !form.hospital_id) return;
    setIsSaving(true);
    try {
      if (editingSession) {
        await supabase
          .from('sessions')
          .update({
            session_date: form.session_date,
            start_time: form.start_time,
            end_time: form.end_time,
            hospital_id: form.hospital_id,
            max_patients: form.max_patients,
            consultation_fee_lkr: form.consultation_fee_lkr,
          })
          .eq('id', editingSession.id);
      } else {
        await supabase.from('sessions').insert([{
          doctor_id: doctorId,
          hospital_id: form.hospital_id,
          session_date: form.session_date,
          start_time: form.start_time,
          end_time: form.end_time,
          max_patients: form.max_patients,
          consultation_fee_lkr: form.consultation_fee_lkr,
          status: 'inactive',
          current_token: 0,
          delay_minutes: 0,
        }]);
      }
      setShowForm(false);
      setEditingSession(null);
      setForm(defaultForm);
      fetchDoctorAndSessions();
    } catch (err) {
      console.error('Failed to save session:', err);
    } finally {
      setIsSaving(false);
    }
  };

  const handleCancel = async (sessionId: string) => {
    if (!confirm('Cancel this session? All patients will be notified.')) return;
    setCancellingId(sessionId);
    try {
      await supabase.from('sessions').update({ status: 'cancelled' }).eq('id', sessionId);
      setSessions(prev => prev.map(s => s.id === sessionId ? { ...s, status: 'cancelled' } : s));
    } catch (err) {
      console.error('Cancel failed:', err);
    } finally {
      setCancellingId(null);
    }
  };

  const formatDate = (d: string) => new Date(d).toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric', year: 'numeric' });
  const formatTime = (t: string) => { if (!t) return ''; const [h, m] = t.split(':'); const hr = parseInt(h); return `${hr % 12 || 12}:${m} ${hr >= 12 ? 'PM' : 'AM'}`; };

  return (
    <div className="max-w-5xl mx-auto space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">Sessions</h1>
          <p className="text-slate-500 mt-1">Manage your consultation sessions</p>
        </div>
        <Button onClick={() => { setEditingSession(null); setForm(defaultForm); setShowForm(true); }} className="bg-teal-600 hover:bg-teal-700 gap-2">
          <Plus className="w-4 h-4" /> Create Session
        </Button>
      </div>

      {/* Create/Edit Form */}
      {showForm && (
        <Card className="border-teal-200 shadow-lg ring-1 ring-teal-100">
          <CardContent className="p-6 space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold">{editingSession ? 'Edit Session' : 'Create New Session'}</h2>
              <button onClick={() => { setShowForm(false); setEditingSession(null); }} className="text-slate-400 hover:text-slate-600">
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="grid md:grid-cols-2 gap-4">
              <div className="space-y-1">
                <label className="text-sm font-medium text-slate-700">Date</label>
                <input type="date" className="w-full h-10 px-3 border border-slate-200 rounded-lg bg-slate-50 focus:outline-none focus:ring-2 focus:ring-teal-500"
                  value={form.session_date} onChange={e => setForm(f => ({ ...f, session_date: e.target.value }))} />
              </div>
              <div className="space-y-1">
                <label className="text-sm font-medium text-slate-700">Hospital</label>
                <select className="w-full h-10 px-3 border border-slate-200 rounded-lg bg-slate-50 focus:outline-none focus:ring-2 focus:ring-teal-500"
                  value={form.hospital_id} onChange={e => setForm(f => ({ ...f, hospital_id: e.target.value }))}>
                  <option value="">Select Hospital</option>
                  {hospitals.map(h => <option key={h.id} value={h.id}>{h.name}</option>)}
                </select>
              </div>
              <div className="space-y-1">
                <label className="text-sm font-medium text-slate-700">Start Time</label>
                <input type="time" className="w-full h-10 px-3 border border-slate-200 rounded-lg bg-slate-50 focus:outline-none focus:ring-2 focus:ring-teal-500"
                  value={form.start_time} onChange={e => setForm(f => ({ ...f, start_time: e.target.value }))} />
              </div>
              <div className="space-y-1">
                <label className="text-sm font-medium text-slate-700">End Time</label>
                <input type="time" className="w-full h-10 px-3 border border-slate-200 rounded-lg bg-slate-50 focus:outline-none focus:ring-2 focus:ring-teal-500"
                  value={form.end_time} onChange={e => setForm(f => ({ ...f, end_time: e.target.value }))} />
              </div>
              <div className="space-y-1">
                <label className="text-sm font-medium text-slate-700">Max Patients</label>
                <input type="number" min={1} max={100} className="w-full h-10 px-3 border border-slate-200 rounded-lg bg-slate-50 focus:outline-none focus:ring-2 focus:ring-teal-500"
                  value={form.max_patients} onChange={e => setForm(f => ({ ...f, max_patients: parseInt(e.target.value) }))} />
              </div>
              <div className="space-y-1">
                <label className="text-sm font-medium text-slate-700">Consultation Fee (LKR)</label>
                <input type="number" min={0} className="w-full h-10 px-3 border border-slate-200 rounded-lg bg-slate-50 focus:outline-none focus:ring-2 focus:ring-teal-500"
                  value={form.consultation_fee_lkr} onChange={e => setForm(f => ({ ...f, consultation_fee_lkr: parseInt(e.target.value) }))} />
              </div>
            </div>
            <div className="flex justify-end gap-3">
              <Button variant="outline" onClick={() => setShowForm(false)}>Cancel</Button>
              <Button onClick={handleSave} disabled={isSaving} className="bg-teal-600 hover:bg-teal-700 gap-2">
                {isSaving ? <Loader2 className="w-4 h-4 animate-spin" /> : <CheckCircle2 className="w-4 h-4" />}
                {editingSession ? 'Save Changes' : 'Create Session'}
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Sessions List */}
      {isLoading ? (
        <div className="space-y-4">
          {[1, 2, 3].map(i => <div key={i} className="h-28 bg-slate-200 rounded-xl animate-pulse" />)}
        </div>
      ) : sessions.length === 0 ? (
        <div className="text-center py-20 bg-white border border-slate-100 rounded-xl">
          <Calendar className="w-12 h-12 text-slate-300 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-slate-700">No Sessions Yet</h3>
          <p className="text-slate-500 text-sm mt-1">Create your first session to start accepting patients</p>
        </div>
      ) : (
        <div className="space-y-4">
          {sessions.map(session => (
            <Card key={session.id} className="border-slate-200 shadow-sm hover:shadow-md transition-shadow">
              <CardContent className="p-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div className="flex items-start gap-4">
                  <div className="bg-teal-50 rounded-xl p-3">
                    <Calendar className="w-6 h-6 text-teal-600" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2 flex-wrap">
                      <h3 className="font-semibold text-slate-900">{formatDate(session.session_date)}</h3>
                      <span className={`text-xs font-semibold px-2 py-0.5 rounded-full border capitalize ${STATUS_STYLE[session.status] || STATUS_STYLE.inactive}`}>
                        {session.status}
                      </span>
                    </div>
                    <div className="flex items-center gap-3 mt-1 text-sm text-slate-500">
                      <span className="flex items-center gap-1"><Clock className="w-4 h-4" />{formatTime(session.start_time)} – {formatTime(session.end_time)}</span>
                      <span className="flex items-center gap-1"><Users className="w-4 h-4" />{session.current_token}/{session.max_patients}</span>
                    </div>
                    <p className="text-xs text-slate-400 mt-1">{session.hospitals?.name}, {session.hospitals?.city}</p>
                  </div>
                </div>
                <div className="flex gap-2 ml-auto">
                  {session.status !== 'cancelled' && session.status !== 'completed' && (
                    <>
                      <Button size="sm" variant="outline" className="gap-2" onClick={() => openEditForm(session)}>
                        <Edit2 className="w-4 h-4" /> Edit
                      </Button>
                      <Button size="sm" className="bg-teal-600 hover:bg-teal-700 gap-2" onClick={() => navigate(`/doctor/session/${session.id}/manage`)}>
                        Manage <ChevronRight className="w-4 h-4" />
                      </Button>
                      <Button size="sm" variant="outline" className="text-red-600 border-red-200 hover:bg-red-50" onClick={() => handleCancel(session.id)} disabled={cancellingId === session.id}>
                        {cancellingId === session.id ? <Loader2 className="w-4 h-4 animate-spin" /> : <X className="w-4 h-4" />}
                      </Button>
                    </>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
