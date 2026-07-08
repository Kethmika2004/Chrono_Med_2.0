import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Clock, Users, Activity, CheckCircle2, MapPin, AlertTriangle, Loader2 } from 'lucide-react';
import { useIntlayer } from 'react-intlayer';
import { supabase } from '@/lib/supabase';
import { useAuthStore } from '@/store/authStore';

export default function QueueTracker() {
  const { appointmentId } = useParams<{ appointmentId?: string }>();
  const { profile } = useAuthStore();
  const [session, setSession] = useState<any>(null);
  const [appointment, setAppointment] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [hasArrived, setHasArrived] = useState(false);

  const {
    title,
    subtitle,
    sessionActive,
    sessionInactive,
    currentlyCalling,
    yourToken,
    estWait,
    tokenStart,
    yourTurn,
    patientsAheadText,
    patientAheadText,
    sessionDetails,
    avgTimeText,
    checkedInTitle,
    checkedInDesc,
    hospitalQuestion,
    hospitalQuestionDesc,
    arrivedButton
  } = useIntlayer('queue-tracker');

  const formatTime = (timeStr: string) => {
    if (!timeStr) return '';
    const [hours, minutes] = timeStr.split(':');
    const h = parseInt(hours, 10);
    const ampm = h >= 12 ? 'PM' : 'AM';
    const displayHour = h % 12 || 12;
    return `${displayHour}:${minutes} ${ampm}`;
  };

  const loadData = async () => {
    if (!profile?.id) return;
    try {
      setIsLoading(true);
      setError(null);

      let apptQuery = supabase
        .from('appointments')
        .select(`
          id,
          token_number,
          status,
          arrived_at,
          sessions (
            id,
            session_date,
            start_time,
            end_time,
            status,
            current_token,
            delay_minutes,
            doctors (
              id,
              specialty,
              avg_consultation_min,
              user_profiles:profile_id (
                full_name
              )
            ),
            hospitals (
              id,
              name,
              city
            )
          )
        `)
        .eq('patient_id', profile.id);

      if (appointmentId) {
        apptQuery = apptQuery.eq('id', appointmentId);
      } else {
        // Get most recent active appointment
        apptQuery = apptQuery.in('status', ['upcoming', 'called_at']).order('created_at', { ascending: false }).limit(1);
      }

      const { data, error: apptError } = await apptQuery.single();
      if (apptError) {
        setError('No active appointment found. Please book an appointment first.');
        return;
      }
      if (data) {
        setAppointment(data);
        setSession(data.sessions);
        setHasArrived(!!data.arrived_at);
      }
    } catch (err) {
      setError('Failed to load queue information.');
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [profile?.id, appointmentId]);

  // Realtime subscription on session
  useEffect(() => {
    if (!session?.id) return;

    const channel = supabase
      .channel(`session_queue_${session.id}`)
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'sessions',
          filter: `id=eq.${session.id}`
        },
        (payload) => {
          setSession((prev: any) => ({ ...prev, ...payload.new }));
        }
      )
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'appointments',
          filter: `id=eq.${appointment?.id}`
        },
        (payload) => {
          setAppointment((prev: any) => ({ ...prev, ...payload.new }));
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [session?.id, appointment?.id]);

  const handleArrived = async () => {
    if (!appointment?.id) return;
    try {
      const { error } = await supabase
        .from('appointments')
        .update({ arrived_at: new Date().toISOString() })
        .eq('id', appointment.id);
      if (!error) setHasArrived(true);
    } catch (err) {
      console.error('Failed to mark arrival:', err);
    }
  };

  if (isLoading) {
    return (
      <div className="max-w-3xl mx-auto flex flex-col items-center justify-center py-24 gap-4">
        <Loader2 className="w-12 h-12 animate-spin text-teal-600" />
        <p className="text-slate-500 text-lg">Loading queue status...</p>
      </div>
    );
  }

  if (error || !appointment) {
    return (
      <div className="max-w-3xl mx-auto">
        <Card className="border-0 shadow-lg">
          <CardContent className="p-12 text-center space-y-4">
            <AlertTriangle className="w-16 h-16 mx-auto text-amber-400" />
            <h2 className="text-2xl font-bold text-slate-800">No Active Session</h2>
            <p className="text-slate-500">{error || 'You don\'t have any active appointments to track.'}</p>
            <Button className="bg-teal-600 hover:bg-teal-700" asChild>
              <a href="/patient/book">Book an Appointment</a>
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  const currentToken = session?.current_token || 0;
  const myToken = appointment.token_number || 0;
  const patientsAhead = Math.max(0, myToken - currentToken);
  const avgConsultMin = session?.doctors?.avg_consultation_min || 15;
  const estWaitTime = patientsAhead * avgConsultMin;
  const progressPercent = myToken > 1
    ? Math.min(100, Math.max(0, (currentToken / (myToken - 1)) * 100))
    : 100;
  const isSessionActive = session?.status === 'active' || session?.status === 'delayed';
  const isDelayed = session?.status === 'delayed';

  return (
    <div className="max-w-3xl mx-auto space-y-8">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">{title}</h1>
          <p className="text-slate-500 mt-1">{subtitle}</p>
        </div>
        <div className="flex flex-col gap-2">
          <div className={`flex items-center gap-2 px-4 py-2 rounded-full shadow-sm border w-fit ${isDelayed ? 'bg-amber-50 border-amber-200' : 'bg-white border-slate-200'}`}>
            <span className="relative flex h-3 w-3">
              {isSessionActive ? (
                <>
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-teal-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-3 w-3 bg-teal-500"></span>
                </>
              ) : (
                <span className="relative inline-flex rounded-full h-3 w-3 bg-slate-300"></span>
              )}
            </span>
            <span className={`text-sm font-semibold ${isDelayed ? 'text-amber-700' : isSessionActive ? 'text-teal-700' : 'text-slate-500'}`}>
              {isSessionActive ? sessionActive : sessionInactive}
            </span>
          </div>
          {isDelayed && session?.delay_minutes > 0 && (
            <div className="flex items-center gap-2 px-4 py-2 bg-amber-50 rounded-full border border-amber-200">
              <Clock className="w-4 h-4 text-amber-600" />
              <span className="text-sm font-semibold text-amber-700">Running {session.delay_minutes} min late</span>
            </div>
          )}
        </div>
      </div>

      <Card className="border-0 shadow-xl overflow-hidden">
        <div className="bg-slate-900 text-white p-8 md:p-12 text-center relative overflow-hidden">
          <div className="absolute inset-0 opacity-10" style={{ backgroundImage: 'radial-gradient(circle at 2px 2px, white 1px, transparent 0)', backgroundSize: '24px 24px' }}></div>
          
          <div className="relative z-10">
            <h2 className="text-lg font-medium text-slate-300 uppercase tracking-widest mb-4">{currentlyCalling}</h2>
            <div className="text-8xl md:text-9xl font-black text-transparent bg-clip-text bg-gradient-to-b from-white to-slate-400 drop-shadow-lg">
              {currentToken}
            </div>
            
            <div className="mt-8 flex flex-wrap justify-center gap-4">
              <div className="bg-white/10 backdrop-blur-md border border-white/20 rounded-xl p-4 flex-1 min-w-[140px] max-w-[200px]">
                <p className="text-slate-400 text-xs uppercase tracking-wider mb-1">{yourToken}</p>
                <p className="text-3xl font-bold text-teal-400">#{myToken}</p>
              </div>
              <div className="bg-white/10 backdrop-blur-md border border-white/20 rounded-xl p-4 flex-1 min-w-[140px] max-w-[200px]">
                <p className="text-slate-400 text-xs uppercase tracking-wider mb-1">{estWait}</p>
                <p className="text-3xl font-bold text-amber-400">{estWaitTime}m</p>
              </div>
            </div>
          </div>
        </div>

        <CardContent className="p-6 md:p-8 space-y-8 bg-white">
          {/* Progress Bar */}
          <div className="space-y-3">
            <div className="flex justify-between text-sm font-medium text-slate-500">
              <span>{tokenStart}</span>
              <span>{yourTurn} #{myToken}</span>
            </div>
            <div className="h-4 bg-slate-100 rounded-full overflow-hidden relative">
              <div 
                className="absolute top-0 left-0 h-full bg-gradient-to-r from-teal-500 to-teal-400 rounded-full transition-all duration-1000 ease-in-out"
                style={{ width: `${progressPercent}%` }}
              />
            </div>
            <p className="text-center text-sm text-slate-600 font-medium">
              <Users className="inline w-4 h-4 mr-1 text-slate-400" /> 
              {patientsAhead} {patientsAhead === 1 ? patientAheadText : patientsAheadText}
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-6 bg-slate-50 rounded-2xl p-6 border border-slate-100">
             <div className="space-y-4">
               <h3 className="font-semibold text-slate-800">{sessionDetails}</h3>
               <div className="space-y-3 text-sm">
                 <div className="flex items-start gap-3">
                   <div className="bg-white p-2 rounded-lg shadow-sm text-teal-600"><Activity className="w-5 h-5" /></div>
                   <div>
                     <p className="font-medium text-slate-900">
                       {session?.doctors?.user_profiles?.full_name || 'Medical Doctor'}
                     </p>
                     <p className="text-slate-500">{session?.doctors?.specialty || 'Specialist'}</p>
                   </div>
                 </div>
                 <div className="flex items-start gap-3">
                   <div className="bg-white p-2 rounded-lg shadow-sm text-amber-600"><Clock className="w-5 h-5" /></div>
                   <div>
                     <p className="font-medium text-slate-900">
                       {formatTime(session?.start_time)} - {formatTime(session?.end_time)}
                     </p>
                     <p className="text-slate-500">{avgTimeText} {avgConsultMin} min/patient</p>
                   </div>
                 </div>
                 <div className="flex items-start gap-3">
                   <div className="bg-white p-2 rounded-lg shadow-sm text-blue-600"><MapPin className="w-5 h-5" /></div>
                   <div>
                     <p className="font-medium text-slate-900">{session?.hospitals?.name || 'Hospital'}</p>
                     <p className="text-slate-500">{session?.hospitals?.city}</p>
                   </div>
                 </div>
               </div>
             </div>

             <div className="space-y-4 flex flex-col justify-center">
               {hasArrived ? (
                 <div className="bg-green-50 border border-green-200 rounded-xl p-6 text-center space-y-3">
                   <div className="mx-auto w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
                     <CheckCircle2 className="w-6 h-6 text-green-600" />
                   </div>
                   <h3 className="font-semibold text-green-800">{checkedInTitle}</h3>
                   <p className="text-sm text-green-600">{checkedInDesc}</p>
                 </div>
               ) : (
                 <div className="bg-white border border-slate-200 rounded-xl p-6 text-center space-y-4 shadow-sm">
                   <h3 className="font-semibold text-slate-800">{hospitalQuestion}</h3>
                   <p className="text-sm text-slate-500">{hospitalQuestionDesc}</p>
                   <Button 
                     className="w-full h-12 text-lg bg-teal-600 hover:bg-teal-700" 
                     onClick={handleArrived}
                     disabled={!isSessionActive}
                   >
                     {arrivedButton}
                   </Button>
                 </div>
               )}
             </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
