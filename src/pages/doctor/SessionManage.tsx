import { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ChevronRight, Users, Clock, AlertTriangle, Loader2, Play, Pause, SkipForward, Plus, Minus, CheckCircle2, ArrowLeft } from 'lucide-react';
import { supabase } from '@/lib/supabase';

const STATUS_STYLE: Record<string, string> = {
  upcoming: 'bg-slate-100 text-slate-600',
  called_at: 'bg-amber-100 text-amber-700 animate-pulse',
  completed: 'bg-green-100 text-green-700',
  no_show: 'bg-red-100 text-red-600',
  cancelled: 'bg-gray-100 text-gray-400 line-through',
};

export default function SessionManage() {
  const { sessionId } = useParams<{ sessionId: string }>();
  const navigate = useNavigate();
  const [session, setSession] = useState<any>(null);
  const [appointments, setAppointments] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [timer, setTimer] = useState(0); // seconds elapsed
  const [timerRunning, setTimerRunning] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);
  const [isAddingDelay, setIsAddingDelay] = useState(false);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  const loadSession = async () => {
    if (!sessionId) return;
    try {
      setIsLoading(true);
      const { data: sessionData } = await supabase
        .from('sessions')
        .select(`
          id, session_date, start_time, end_time, status, current_token, delay_minutes, max_patients,
          doctors (specialty, user_profiles:profile_id (full_name)),
          hospitals (name, city)
        `)
        .eq('id', sessionId)
        .single();

      if (sessionData) {
        setSession(sessionData);
        if (sessionData.status === 'active') setTimerRunning(true);
      }

      const { data: apptData } = await supabase
        .from('appointments')
        .select('id, token_number, status, chief_complaint, patient_id, user_profiles:patient_id (full_name, phone)')
        .eq('session_id', sessionId)
        .order('token_number', { ascending: true });

      setAppointments(apptData || []);
    } catch (err) {
      console.error('Error loading session manage:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadSession();
  }, [sessionId]);

  // Realtime sync
  useEffect(() => {
    if (!sessionId) return;
    const channel = supabase
      .channel(`manage_session_${sessionId}`)
      .on('postgres_changes', { event: 'UPDATE', schema: 'public', table: 'sessions', filter: `id=eq.${sessionId}` },
        (payload) => setSession((prev: any) => ({ ...prev, ...payload.new })))
      .on('postgres_changes', { event: '*', schema: 'public', table: 'appointments', filter: `session_id=eq.${sessionId}` },
        () => loadSession())
      .subscribe();

    return () => { supabase.removeChannel(channel); };
  }, [sessionId]);

  // Consultation timer
  useEffect(() => {
    if (timerRunning) {
      timerRef.current = setInterval(() => setTimer(t => t + 1), 1000);
    } else {
      if (timerRef.current) clearInterval(timerRef.current);
    }
    return () => { if (timerRef.current) clearInterval(timerRef.current); };
  }, [timerRunning]);

  const formatTimer = (secs: number) => {
    const m = Math.floor(secs / 60).toString().padStart(2, '0');
    const s = (secs % 60).toString().padStart(2, '0');
    return `${m}:${s}`;
  };

  const handleStartSession = async () => {
    setIsUpdating(true);
    await supabase.from('sessions').update({ status: 'active' }).eq('id', sessionId);
    setSession((s: any) => ({ ...s, status: 'active' }));
    setTimerRunning(true);
    setIsUpdating(false);
  };

  const handleNextToken = async () => {
    if (!session) return;
    setIsUpdating(true);
    setTimer(0);
    const next = (session.current_token || 0) + 1;
    
    // Mark current patient as completed
    const currentAppt = appointments.find(a => a.token_number === session.current_token && a.status !== 'cancelled');
    if (currentAppt) {
      await supabase.from('appointments').update({ status: 'completed' }).eq('id', currentAppt.id);
    }

    // Call next patient
    const nextAppt = appointments.find(a => a.token_number === next && a.status !== 'cancelled');
    if (nextAppt) {
      await supabase.from('appointments').update({ status: 'called_at' }).eq('id', nextAppt.id);
    }

    await supabase.from('sessions').update({ current_token: next }).eq('id', sessionId);
    setSession((s: any) => ({ ...s, current_token: next }));
    await loadSession();
    setIsUpdating(false);
  };

  const handleMarkNoShow = async () => {
    if (!session) return;
    const currentAppt = appointments.find(a => a.token_number === session.current_token && a.status !== 'completed' && a.status !== 'cancelled');
    if (!currentAppt) return;
    setIsUpdating(true);
    await supabase.from('appointments').update({ status: 'no_show' }).eq('id', currentAppt.id);
    await handleNextToken();
    setIsUpdating(false);
  };

  const handleAddDelay = async (minutes: number) => {
    setIsAddingDelay(true);
    const newDelay = Math.max(0, (session?.delay_minutes || 0) + minutes);
    await supabase.from('sessions').update({ status: 'delayed', delay_minutes: newDelay }).eq('id', sessionId);
    setSession((s: any) => ({ ...s, delay_minutes: newDelay, status: newDelay > 0 ? 'delayed' : 'active' }));
    setIsAddingDelay(false);
  };

  const handleEndSession = async () => {
    if (!confirm('End this session? This cannot be undone.')) return;
    setTimerRunning(false);
    await supabase.from('sessions').update({ status: 'completed' }).eq('id', sessionId);
    setSession((s: any) => ({ ...s, status: 'completed' }));
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-24">
        <Loader2 className="w-10 h-10 animate-spin text-teal-600" />
      </div>
    );
  }

  if (!session) {
    return (
      <div className="max-w-3xl mx-auto text-center py-20">
        <AlertTriangle className="w-12 h-12 mx-auto text-amber-400 mb-4" />
        <h2 className="text-2xl font-bold text-slate-800">Session not found</h2>
        <Button className="mt-6" onClick={() => navigate('/doctor/sessions')}>Back to Sessions</Button>
      </div>
    );
  }

  const currentAppt = appointments.find(a => a.token_number === session.current_token);
  const remainingCount = appointments.filter(a => a.token_number > session.current_token && a.status !== 'cancelled').length;
  const completedCount = appointments.filter(a => a.status === 'completed').length;
  const totalCount = appointments.filter(a => a.status !== 'cancelled').length;
  const sessionActive = session.status === 'active' || session.status === 'delayed';

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      <div className="flex items-center gap-4">
        <button onClick={() => navigate('/doctor/sessions')} className="p-2 text-slate-500 hover:text-slate-800 hover:bg-slate-100 rounded-lg transition-colors">
          <ArrowLeft className="w-5 h-5" />
        </button>
        <div className="flex-1">
          <h1 className="text-2xl font-bold text-slate-900">Session Control Panel</h1>
          <p className="text-slate-500 text-sm">{session.hospitals?.name} • {new Date(session.session_date).toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}</p>
        </div>
        <div className={`px-3 py-1.5 rounded-full text-sm font-semibold border ${session.status === 'active' ? 'bg-green-50 text-green-700 border-green-200' : session.status === 'delayed' ? 'bg-amber-50 text-amber-700 border-amber-200' : session.status === 'completed' ? 'bg-blue-50 text-blue-700 border-blue-200' : 'bg-slate-100 text-slate-600 border-slate-200'} capitalize`}>
          {session.status}
        </div>
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Main Control Panel */}
        <div className="lg:col-span-2 space-y-6">
          {/* Current Token + Timer */}
          <Card className="bg-slate-900 text-white border-0 overflow-hidden shadow-xl">
            <CardContent className="p-8">
              <div className="flex flex-col sm:flex-row items-center justify-between gap-6">
                <div className="text-center sm:text-left">
                  <p className="text-slate-400 text-sm uppercase tracking-widest mb-1">Now Calling</p>
                  <p className="text-7xl font-black text-white">#{session.current_token || '—'}</p>
                  {currentAppt && (
                    <p className="text-teal-400 font-semibold mt-2">{currentAppt.user_profiles?.full_name || 'Patient'}</p>
                  )}
                </div>
                <div className="text-center">
                  <p className="text-slate-400 text-sm mb-1">Consultation Time</p>
                  <div className={`text-5xl font-mono font-bold ${timerRunning ? 'text-teal-400' : 'text-slate-500'}`}>{formatTimer(timer)}</div>
                  <button onClick={() => setTimerRunning(r => !r)} className="mt-3 text-xs text-slate-400 hover:text-white flex items-center gap-1 mx-auto">
                    {timerRunning ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
                    {timerRunning ? 'Pause' : 'Resume'}
                  </button>
                </div>
              </div>

              {currentAppt?.chief_complaint && (
                <div className="mt-6 p-3 bg-white/10 rounded-xl text-sm text-slate-200">
                  <span className="text-slate-400 text-xs font-medium uppercase tracking-wider mr-2">Chief Complaint:</span>
                  {currentAppt.chief_complaint}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Action Controls */}
          <div className="grid grid-cols-2 gap-4">
            {!sessionActive ? (
              <Button className="col-span-2 h-16 text-lg bg-teal-600 hover:bg-teal-700 gap-3" onClick={handleStartSession} disabled={isUpdating}>
                {isUpdating ? <Loader2 className="w-6 h-6 animate-spin" /> : <Play className="w-6 h-6" />}
                Start Session
              </Button>
            ) : (
              <>
                <Button className="h-14 text-base bg-teal-600 hover:bg-teal-700 gap-2 col-span-2" onClick={handleNextToken} disabled={isUpdating}>
                  {isUpdating ? <Loader2 className="w-5 h-5 animate-spin" /> : <SkipForward className="w-5 h-5" />}
                  Next Patient (#{(session.current_token || 0) + 1})
                </Button>
                <Button variant="outline" className="h-12 border-red-200 text-red-600 hover:bg-red-50" onClick={handleMarkNoShow}>
                  Mark No-Show
                </Button>
                <Button variant="outline" className="h-12 text-slate-700" onClick={handleEndSession}>
                  End Session
                </Button>
              </>
            )}
          </div>

          {/* Delay Controls */}
          {sessionActive && (
            <Card className="border-amber-200 bg-amber-50 shadow-sm">
              <CardContent className="p-5 flex items-center justify-between">
                <div>
                  <p className="font-semibold text-amber-800">Session Delay</p>
                  <p className="text-amber-600 text-sm">Currently running <span className="font-bold">{session.delay_minutes || 0} minutes</span> late</p>
                </div>
                <div className="flex items-center gap-3">
                  <button onClick={() => handleAddDelay(-15)} disabled={isAddingDelay || session.delay_minutes <= 0} className="w-9 h-9 rounded-full border border-amber-300 flex items-center justify-center text-amber-700 hover:bg-amber-100 disabled:opacity-40">
                    <Minus className="w-4 h-4" />
                  </button>
                  <span className="font-bold text-amber-800 w-10 text-center">{session.delay_minutes || 0}m</span>
                  <button onClick={() => handleAddDelay(15)} disabled={isAddingDelay} className="w-9 h-9 rounded-full border border-amber-300 flex items-center justify-center text-amber-700 hover:bg-amber-100">
                    <Plus className="w-4 h-4" />
                  </button>
                </div>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Sidebar: Queue List */}
        <div className="space-y-4">
          <div className="grid grid-cols-3 gap-3">
            {[
              { label: 'Remaining', value: remainingCount, color: 'text-teal-600' },
              { label: 'Completed', value: completedCount, color: 'text-green-600' },
              { label: 'Total', value: totalCount, color: 'text-slate-600' },
            ].map(s => (
              <div key={s.label} className="bg-white border border-slate-200 rounded-xl p-3 text-center shadow-sm">
                <p className={`text-2xl font-black ${s.color}`}>{s.value}</p>
                <p className="text-xs text-slate-500 font-medium">{s.label}</p>
              </div>
            ))}
          </div>

          <div className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-sm">
            <div className="p-4 border-b border-slate-100 flex items-center gap-2 font-semibold text-slate-700">
              <Users className="w-4 h-4 text-teal-600" />
              Patient Queue
            </div>
            <div className="overflow-y-auto max-h-[400px] divide-y divide-slate-100">
              {appointments.length === 0 ? (
                <p className="text-center text-slate-400 py-8 text-sm">No patients booked yet</p>
              ) : (
                appointments.map(appt => (
                  <div key={appt.id} className={`p-4 flex items-center justify-between ${appt.token_number === session.current_token ? 'bg-teal-50' : ''}`}>
                    <div className="flex items-center gap-3">
                      <span className={`w-9 h-9 rounded-full flex items-center justify-center font-bold text-sm ${appt.token_number === session.current_token ? 'bg-teal-600 text-white' : 'bg-slate-100 text-slate-600'}`}>
                        {appt.token_number}
                      </span>
                      <div>
                        <p className="font-medium text-sm text-slate-900 truncate max-w-[120px]">{appt.user_profiles?.full_name || 'Patient'}</p>
                        {appt.chief_complaint && <p className="text-xs text-slate-400 truncate max-w-[120px]">{appt.chief_complaint}</p>}
                      </div>
                    </div>
                    <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${STATUS_STYLE[appt.status] || ''}`}>
                      {appt.status === 'called_at' ? 'Calling' : appt.status}
                    </span>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
