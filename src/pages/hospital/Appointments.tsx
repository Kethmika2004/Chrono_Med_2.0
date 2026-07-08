import { useState, useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { CalendarCheck, Search, X, Loader2, ChevronUp } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { useAuthStore } from '@/store/authStore';

const STATUS_STYLE: Record<string, string> = {
  upcoming: 'bg-blue-100 text-blue-700 border-blue-200',
  completed: 'bg-green-100 text-green-700 border-green-200',
  cancelled: 'bg-red-100 text-red-700 border-red-200',
  no_show: 'bg-slate-100 text-slate-500 border-slate-200',
  waitlist: 'bg-amber-100 text-amber-700 border-amber-200',
  called_at: 'bg-teal-100 text-teal-700 border-teal-200',
};

export default function HospitalAppointments() {
  const { profile } = useAuthStore();
  const [appointments, setAppointments] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [page, setPage] = useState(0);
  const [hasMore, setHasMore] = useState(true);
  const [cancellingId, setCancellingId] = useState<string | null>(null);
  const [promotingId, setPromotingId] = useState<string | null>(null);
  const PAGE_SIZE = 20;

  const fetchAppointments = async (pageIndex = 0) => {
    if (!profile?.id) return;
    try {
      setIsLoading(true);
      const { data: hospData } = await supabase.from('hospitals').select('id').eq('profile_id', profile.id).single();
      if (!hospData) return;

      let query = supabase
        .from('appointments')
        .select(`
          id, token_number, status, payment_status, chief_complaint, created_at,
          sessions!inner (session_date, hospital_id, doctors (user_profiles:profile_id (full_name))),
          user_profiles:patient_id (full_name, phone)
        `)
        .eq('sessions.hospital_id', hospData.id)
        .order('created_at', { ascending: false })
        .range(pageIndex * PAGE_SIZE, (pageIndex + 1) * PAGE_SIZE - 1);

      if (statusFilter !== 'all') query = query.eq('status', statusFilter);

      const { data } = await query;
      const fresh = data || [];
      setHasMore(fresh.length === PAGE_SIZE);
      setAppointments(prev => pageIndex === 0 ? fresh : [...prev, ...fresh]);
      setPage(pageIndex);
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => { fetchAppointments(0); }, [profile?.id, statusFilter]);

  const handleCancel = async (id: string) => {
    if (!confirm('Cancel this appointment on behalf of the patient?')) return;
    setCancellingId(id);
    await supabase.from('appointments').update({ status: 'cancelled' }).eq('id', id);
    setAppointments(prev => prev.map(a => a.id === id ? { ...a, status: 'cancelled' } : a));
    setCancellingId(null);
  };

  const handlePromote = async (appt: any) => {
    if (appt.status !== 'waitlist') return;
    setPromotingId(appt.id);
    await supabase.from('appointments').update({ status: 'upcoming' }).eq('id', appt.id);
    setAppointments(prev => prev.map(a => a.id === appt.id ? { ...a, status: 'upcoming' } : a));
    setPromotingId(null);
  };

  const filtered = appointments.filter(a =>
    (a.user_profiles?.full_name || '').toLowerCase().includes(search.toLowerCase()) ||
    (a.sessions?.doctors?.user_profiles?.full_name || '').toLowerCase().includes(search.toLowerCase())
  );

  const formatDate = (d: string) => new Date(d).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });

  return (
    <div className="max-w-6xl mx-auto space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-slate-900">All Appointments</h1>
        <p className="text-slate-500 mt-1">Manage and monitor all patient appointments</p>
      </div>

      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4" />
          <Input placeholder="Search patient or doctor..." className="pl-9 bg-slate-50" value={search} onChange={e => setSearch(e.target.value)} />
        </div>
        <div className="flex gap-2 flex-wrap">
          {['all', 'upcoming', 'completed', 'cancelled', 'waitlist', 'no_show'].map(s => (
            <button key={s} onClick={() => setStatusFilter(s)}
              className={`px-3 py-2 rounded-lg text-sm font-medium border transition-colors ${statusFilter === s ? 'bg-teal-600 text-white border-teal-600' : 'bg-white text-slate-600 border-slate-200 hover:border-teal-300'}`}>
              {s === 'all' ? 'All' : s === 'no_show' ? 'No-Show' : s.charAt(0).toUpperCase() + s.slice(1)}
            </button>
          ))}
        </div>
      </div>

      {isLoading && appointments.length === 0 ? (
        <div className="flex justify-center py-16"><Loader2 className="w-10 h-10 animate-spin text-teal-600" /></div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-16 bg-white border border-slate-100 rounded-xl">
          <CalendarCheck className="w-12 h-12 text-slate-300 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-slate-700">No Appointments Found</h3>
        </div>
      ) : (
        <div className="overflow-x-auto rounded-xl border border-slate-200 shadow-sm bg-white">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-slate-100 bg-slate-50">
                {['#', 'Patient', 'Doctor', 'Date', 'Status', 'Payment', 'Actions'].map(h => (
                  <th key={h} className="text-left px-4 py-3 font-semibold text-slate-600 text-xs uppercase tracking-wider">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filtered.map(appt => (
                <tr key={appt.id} className="hover:bg-slate-50 transition-colors">
                  <td className="px-4 py-3 font-bold text-teal-600">#{appt.token_number}</td>
                  <td className="px-4 py-3 font-medium text-slate-900">
                    {appt.user_profiles?.full_name || 'Patient'}
                    {appt.user_profiles?.phone && <div className="text-xs text-slate-400">{appt.user_profiles.phone}</div>}
                  </td>
                  <td className="px-4 py-3 text-slate-600">{appt.sessions?.doctors?.user_profiles?.full_name || '—'}</td>
                  <td className="px-4 py-3 text-slate-600">{appt.sessions?.session_date ? formatDate(appt.sessions.session_date) : '—'}</td>
                  <td className="px-4 py-3">
                    <span className={`text-xs font-semibold px-2 py-1 rounded-full border capitalize ${STATUS_STYLE[appt.status] || ''}`}>
                      {appt.status === 'called_at' ? 'Called' : appt.status?.replace('_', ' ')}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <span className={`text-xs font-medium ${appt.payment_status === 'paid' ? 'text-green-600' : 'text-amber-600'}`}>
                      {appt.payment_status || 'pending'}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex gap-2">
                      {appt.status === 'waitlist' && (
                        <button onClick={() => handlePromote(appt)} disabled={promotingId === appt.id}
                          className="text-xs text-teal-600 hover:text-teal-800 font-medium flex items-center gap-1">
                          {promotingId === appt.id ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <ChevronUp className="w-3.5 h-3.5" />}
                          Promote
                        </button>
                      )}
                      {appt.status === 'upcoming' && (
                        <button onClick={() => handleCancel(appt.id)} disabled={cancellingId === appt.id}
                          className="text-xs text-red-500 hover:text-red-700 font-medium flex items-center gap-1">
                          {cancellingId === appt.id ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <X className="w-3.5 h-3.5" />}
                          Cancel
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {hasMore && (
            <div className="p-4 text-center border-t border-slate-100">
              <Button variant="outline" onClick={() => fetchAppointments(page + 1)} disabled={isLoading} className="gap-2">
                {isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : null}
                Load More
              </Button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
