import { useState, useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Clock, Users, Activity, CheckCircle2, MapPin } from 'lucide-react';

export default function QueueTracker() {
  const [currentQueueToken, setCurrentQueueToken] = useState(11);
  const myToken = 14;
  const [hasArrived, setHasArrived] = useState(false);
  const [isSessionActive, setIsSessionActive] = useState(true);

  // Mock real-time update
  useEffect(() => {
    if (!isSessionActive || currentQueueToken >= myToken) return;
    
    const timer = setInterval(() => {
      setCurrentQueueToken(prev => prev + 1);
    }, 15000); // Increment token every 15s for demo
    
    return () => clearInterval(timer);
  }, [currentQueueToken, isSessionActive, myToken]);

  const patientsAhead = Math.max(0, myToken - currentQueueToken);
  const estWaitTime = patientsAhead * 15; // 15 mins per patient
  const progressPercent = Math.min(100, Math.max(0, ((currentQueueToken - 1) / (myToken - 1)) * 100));

  return (
    <div className="max-w-3xl mx-auto space-y-8">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">Live Queue Tracker</h1>
          <p className="text-slate-500 mt-1">Track your appointment in real-time</p>
        </div>
        <div className="flex items-center gap-2 bg-white px-4 py-2 rounded-full shadow-sm border border-slate-200 w-fit">
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
          <span className={`text-sm font-semibold ${isSessionActive ? 'text-teal-700' : 'text-slate-500'}`}>
            {isSessionActive ? 'Session In Progress' : 'Session Not Started'}
          </span>
        </div>
      </div>

      <Card className="border-0 shadow-xl overflow-hidden">
        <div className="bg-slate-900 text-white p-8 md:p-12 text-center relative overflow-hidden">
          {/* Background pattern */}
          <div className="absolute inset-0 opacity-10" style={{ backgroundImage: 'radial-gradient(circle at 2px 2px, white 1px, transparent 0)', backgroundSize: '24px 24px' }}></div>
          
          <div className="relative z-10">
            <h2 className="text-lg font-medium text-slate-300 uppercase tracking-widest mb-4">Currently Calling</h2>
            <div className="text-8xl md:text-9xl font-black text-transparent bg-clip-text bg-gradient-to-b from-white to-slate-400 drop-shadow-lg">
              {currentQueueToken}
            </div>
            
            <div className="mt-8 flex flex-wrap justify-center gap-4">
              <div className="bg-white/10 backdrop-blur-md border border-white/20 rounded-xl p-4 flex-1 min-w-[140px] max-w-[200px]">
                <p className="text-slate-400 text-xs uppercase tracking-wider mb-1">Your Token</p>
                <p className="text-3xl font-bold text-teal-400">#{myToken}</p>
              </div>
              <div className="bg-white/10 backdrop-blur-md border border-white/20 rounded-xl p-4 flex-1 min-w-[140px] max-w-[200px]">
                <p className="text-slate-400 text-xs uppercase tracking-wider mb-1">Est. Wait</p>
                <p className="text-3xl font-bold text-amber-400">{estWaitTime}m</p>
              </div>
            </div>
          </div>
        </div>

        <CardContent className="p-6 md:p-8 space-y-8 bg-white">
          {/* Progress Bar */}
          <div className="space-y-3">
            <div className="flex justify-between text-sm font-medium text-slate-500">
              <span>Token 1</span>
              <span>Your Turn (Token {myToken})</span>
            </div>
            <div className="h-4 bg-slate-100 rounded-full overflow-hidden relative">
              <div 
                className="absolute top-0 left-0 h-full bg-gradient-to-r from-teal-500 to-teal-400 rounded-full transition-all duration-1000 ease-in-out"
                style={{ width: `${progressPercent}%` }}
              />
            </div>
            <p className="text-center text-sm text-slate-600 font-medium">
              <Users className="inline w-4 h-4 mr-1 text-slate-400" /> 
              {patientsAhead} {patientsAhead === 1 ? 'patient' : 'patients'} ahead of you
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-6 bg-slate-50 rounded-2xl p-6 border border-slate-100">
             <div className="space-y-4">
               <h3 className="font-semibold text-slate-800">Session Details</h3>
               <div className="space-y-3 text-sm">
                 <div className="flex items-start gap-3">
                   <div className="bg-white p-2 rounded-lg shadow-sm text-teal-600"><Activity className="w-5 h-5" /></div>
                   <div>
                     <p className="font-medium text-slate-900">Dr. Sarah Connor</p>
                     <p className="text-slate-500">Cardiologist</p>
                   </div>
                 </div>
                 <div className="flex items-start gap-3">
                   <div className="bg-white p-2 rounded-lg shadow-sm text-amber-600"><Clock className="w-5 h-5" /></div>
                   <div>
                     <p className="font-medium text-slate-900">10:00 AM - 01:00 PM</p>
                     <p className="text-slate-500">Average time per patient: ~15 mins</p>
                   </div>
                 </div>
                 <div className="flex items-start gap-3">
                   <div className="bg-white p-2 rounded-lg shadow-sm text-blue-600"><MapPin className="w-5 h-5" /></div>
                   <div>
                     <p className="font-medium text-slate-900">Room 302, 3rd Floor</p>
                     <p className="text-slate-500">Nawaloka Hospital</p>
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
                   <h3 className="font-semibold text-green-800">You're checked in!</h3>
                   <p className="text-sm text-green-600">Please wait in the seating area. Your token will be called shortly.</p>
                 </div>
               ) : (
                 <div className="bg-white border border-slate-200 rounded-xl p-6 text-center space-y-4 shadow-sm">
                   <h3 className="font-semibold text-slate-800">Are you at the hospital?</h3>
                   <p className="text-sm text-slate-500">Let the doctor know you've arrived so they can call you in.</p>
                   <Button 
                     className="w-full h-12 text-lg bg-teal-600 hover:bg-teal-700" 
                     onClick={() => setHasArrived(true)}
                     disabled={!isSessionActive}
                   >
                     I Have Arrived
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
