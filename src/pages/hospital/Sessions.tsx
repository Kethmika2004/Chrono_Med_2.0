import { useState, useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Calendar, Plus, X, Loader2, Clock, Users, CheckCircle2, Filter } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { useAuthStore } from '@/store/authStore';

const STATUS_STYLE: Record<string, string> = {
  active: 'bg-green-100 text-green-700 border-green-200',
  inactive: 'bg-slate-100 text-slate-600 border-slate-200',
  delayed: 'bg-amber-100 text-amber-700 border-amber-200',
  completed: 'bg-blue-100 text-blue-700 border-blue-200',
  cancelled: 'bg-red-100 text-red-700 border-red-200',
};

const defaultForm = { doctor_id: '', session_date: '', start_time: '', end_time: '', max_patients: 20, consultation_fee_lkr: 2500 };

export default function HospitalSessions() {
  const { profile } = useAuthStore();
  const [sessions, setSessions] = useState<any[]>([]);
  const [doctors, setDoctors] = useState<any[]>([]);
  const [hospitalId, setHospitalId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState(defaultForm);
  const [isSaving, setIsSaving] = useState(false);
  const [statusFilter, setStatusFilter] = useState('all');
  const [cancellingId, setCancellingId] = useState<string | null>(null);

  const fetchData = async () => {
    if (!profile?.id) return;
    setIsLoading(true);
    try {
      const { data: hospData } = await supabase.from('hospitals').select('id').eq('profile_id', profile.id).single();
      if (!hospData) return;
      setHospitalId(hospData.id);

      const { data: sessData } = await supabase
        .from('sessions')
        .select(`
          id, session_date, start_time, end_time, status, max_patients, current_token, delay_minutes,
          doctors (id, specialty, user_profiles:profile_id (full_name))
        `)
        .eq('hospital_id', hospData.id)
        .order('session_date', { ascending: false });

      setSessions(sessData || []);

      const { data: docsData } = await supabase
        .from('doctors')
        .select('id, specialty, user_profiles:profile_id (full_name)')
        .contains('hospital_affiliations', [hospData.id]);
      setDoctors(docsData || []);
    } catch (err) {
      console.error('Error:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => { fetchData(); }, [profile?.id]);

  const handleCreate = async () => {
    if (!hospitalId || !form.doctor_id || !form.session_date || !form.start_time || !form.end_time) return;
    setIsSaving(true);
    try {
      await supabase.from('sessions').insert([{
        doctor_id: form.doctor_id,
        hospital_id: hospitalId,
        session_date: form.session_date,
        start_time: form.start_time,
        end_time: form.end_time,
        max_patients: form.max_patients,
        consultation_fee_lkr: form.consultation_fee_lkr,
        status: 'inactive',
        current_token: 0,
        delay_minutes: 0,
      }]);
      setShowForm(false);
      setForm(defaultForm);
      fetchData();
    } catch (err) { console.error(err); }
    finally { setIsSaving(false); }
  };

  const handleCancel = async (id: string) => {
    if (!confirm('Cancel this session?')) return;
    setCancellingId(id);
    await supabase.from('sessions').update({ status: 'cancelled' }).eq('id', id);
    setSessions(prev => prev.map(s => s.id === id ? { ...s, status: 'cancelled' } : s));
    setCancellingId(null);
  };

  const formatDate = (d: string) => new Date(d).toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' });
  const formatTime = (t: string) => { if (!t) return ''; const [h, m] = t.split(':'); const hr = parseInt(h); return `${hr % 12 || 12}:${m} ${hr >= 12 ? 'PM' : 'AM'}`; };

  const filtered = sessions.filter(s => statusFilter === 'all' || s.status === statusFilter);

  return (
    <div className="max-w-5xl mx-auto space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">Sessions</h1>
          <p className="text-slate-500 mt-1">All sessions at your hospital</p>
        </div>
        <Button onClick={() => setShowForm(true)} className="bg-teal-600 hover:bg-teal-700 gap-2">
          <Plus className="w-4 h-4" /> Create Session
        </Button>
      </div>

      {/* Create Form */}
      {showForm && (
        <Card className="border-teal-200 shadow-lg ring-1 ring-teal-100">
          <CardContent className="p-6 space-y-5">
            <div className="flex items-center justify-between">
              <h2 className="font-semibold text-lg">Create New Session</h2>
              <button onClick={() => setShowForm(false)} className="text-slate-400 hover:text-slate-600"><X className="w-5 h-5" /></button>
            </div>
            <div className="grid md:grid-cols-2 gap-4">
              <div className="md:col-span-2 space-y-1">
                <label className="text-sm font-medium text-slate-700">Doctor</label>
                <select className="w-full h-10 px-3 border border-slate-200 rounded-lg bg-slate-50 focus:outline-none focus:ring-2 focus:ring-teal-500"
                  value={form.doctor_id} onChange={e => setForm(f => ({ ...f, doctor_id: e.target.value }))}>
                  <option value="">Select Doctor</option>
                  {doctors.map(d => <option key={d.id} value={d.id}>Dr. {d.user_profiles?.full_name} – {d.specialty}</option>)}
                </select>
              </div>
              <div className="space-y-1">
                <label className="text-sm font-medium text-slate-700">Date</label>
                <input type="date" className="w-full h-10 px-3 border border-slate-200 rounded-lg bg-slate-50 focus:outline-none focus:ring-2 focus:ring-teal-500"
                  value={form.session_date} onChange={e => setForm(f => ({ ...f, session_date: e.target.value }))} />
              </div>
              <div className="space-y-1">
                <label className="text-sm font-medium text-slate-700">Max Patients</label>
                <input type="number" min={1} className="w-full h-10 px-3 border border-slate-200 rounded-lg bg-slate-50 focus:outline-none focus:ring-2 focus:ring-teal-500"
                  value={form.max_patients} onChange={e => setForm(f => ({ ...f, max_patients: parseInt(e.target.value) }))} />
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
                <label className="text-sm font-medium text-slate-700">Fee (LKR)</label>
                <input type="number" min={0} className="w-full h-10 px-3 border border-slate-200 rounded-lg bg-slate-50 focus:outline-none focus:ring-2 focus:ring-teal-500"
                  value={form.consultation_fee_lkr} onChange={e => setForm(f => ({ ...f, consultation_fee_lkr: parseInt(e.target.value) }))} />
              </div>
            </div>
            <div className="flex justify-end gap-3">
              <Button variant="outline" onClick={() => setShowForm(false)}>Cancel</Button>
              <Button onClick={handleCreate} disabled={isSaving} className="bg-teal-600 hover:bg-teal-700 gap-2">
                {isSaving ? <Loader2 className="w-4 h-4 animate-spin" /> : <CheckCircle2 className="w-4 h-4" />}
                Create
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Filter */}
      <div className="flex gap-2 flex-wrap">
        {['all', 'active', 'inactive', 'delayed', 'completed', 'cancelled'].map(s => (
          <button key={s} onClick={() => setStatusFilter(s)}
            className={`px-3 py-1.5 rounded-full text-sm font-medium border transition-colors ${statusFilter === s ? 'bg-teal-600 text-white border-teal-600' : 'bg-white text-slate-600 border-slate-200 hover:border-teal-300'}`}>
            {s === 'all' ? 'All' : s.charAt(0).toUpperCase() + s.slice(1)}
          </button>
        ))}
      </div>

      {isLoading ? (
        <div className="flex justify-center py-16"><Loader2 className="w-10 h-10 animate-spin text-teal-600" /></div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-16 bg-white border border-slate-100 rounded-xl">
          <Calendar className="w-12 h-12 text-slate-300 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-slate-700">No Sessions Found</h3>
        </div>
      ) : (
        <div className="overflow-x-auto rounded-xl border border-slate-200 shadow-sm bg-white">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-slate-100 bg-slate-50">
                {['Doctor', 'Date', 'Time', 'Patients', 'Status', 'Actions'].map(h => (
                  <th key={h} className="text-left px-4 py-3 font-semibold text-slate-600 text-xs uppercase tracking-wider">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filtered.map(session => (
                <tr key={session.id} className="hover:bg-slate-50 transition-colors">
                  <td className="px-4 py-3 font-medium text-slate-900">
                    {session.doctors?.user_profiles?.full_name || 'Doctor'}
                    <br /><span className="text-xs text-slate-400">{session.doctors?.specialty}</span>
                  </td>
                  <td className="px-4 py-3 text-slate-600">{formatDate(session.session_date)}</td>
                  <td className="px-4 py-3 text-slate-600">{formatTime(session.start_time)} – {formatTime(session.end_time)}</td>
                  <td className="px-4 py-3 text-slate-600">{session.current_token}/{session.max_patients}</td>
                  <td className="px-4 py-3">
                    <span className={`text-xs font-semibold px-2 py-1 rounded-full border capitalize ${STATUS_STYLE[session.status] || STATUS_STYLE.inactive}`}>{session.status}</span>
                  </td>
                  <td className="px-4 py-3">
                    {session.status !== 'cancelled' && session.status !== 'completed' && (
                      <button onClick={() => handleCancel(session.id)} disabled={cancellingId === session.id}
                        className="text-xs text-red-500 hover:text-red-700 font-medium flex items-center gap-1">
                        {cancellingId === session.id ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <X className="w-3.5 h-3.5" />}
                        Cancel
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
