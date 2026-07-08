import { useState, useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Search, MapPin, Star, Calendar, Clock, CreditCard, CheckCircle2, ChevronRight, ChevronLeft, Loader2 } from 'lucide-react';
import { useIntlayer } from 'react-intlayer';
import { supabase } from '@/lib/supabase';
import { useAuthStore } from '@/store/authStore';

export default function BookAppointment() {
  const { profile } = useAuthStore();
  const [step, setStep] = useState(1);
  const [searchQuery, setSearchQuery] = useState('');
  
  // Database Data
  const [doctorsList, setDoctorsList] = useState<any[]>([]);
  const [sessionsList, setSessionsList] = useState<any[]>([]);
  const [isLoadingDoctors, setIsLoadingDoctors] = useState(true);
  const [isLoadingSessions, setIsLoadingSessions] = useState(false);

  // Selections
  const [selectedDoctor, setSelectedDoctor] = useState<any>(null);
  const [selectedSession, setSelectedSession] = useState<any>(null);
  const [complaint, setComplaint] = useState('');
  
  // Checkout
  const [isProcessing, setIsProcessing] = useState(false);
  const [bookingConfirmed, setBookingConfirmed] = useState(false);
  const [tokenNumber, setTokenNumber] = useState<number | null>(null);

  const {
    title,
    subtitle,
    stepDoctor,
    stepSession,
    stepDetails,
    stepConfirm,
    searchPlaceholder,
    consultationFee,
    availableSessions,
    tokensLeft,
    detailsNotice,
    complaintLabel,
    complaintPlaceholder,
    bookingConfirmedTitle,
    bookingConfirmedDesc,
    tokenNumberLabel,
    goToDashboard,
    summaryTitle,
    doctorLabel,
    dateLabel,
    timeLabel,
    bookingFee,
    totalPayable,
    payButton,
    processingPayment,
    backButton,
    continueButton
  } = useIntlayer('book-appointment');

  // Fetch Doctors on mount
  useEffect(() => {
    const fetchDoctors = async () => {
      try {
        setIsLoadingDoctors(true);
        const { data, error } = await supabase
          .from('doctors')
          .select(`
            id,
            specialty,
            consultation_fee_lkr,
            rating,
            user_profiles:profile_id (
              full_name,
              avatar_url
            )
          `)
          .eq('is_active', true);

        if (error) throw error;

        const mapped = (data || []).map(d => ({
          id: d.id,
          name: d.user_profiles?.full_name || 'Medical Doctor',
          specialty: d.specialty || 'General Practitioner',
          rating: d.rating || 5.0,
          fee: d.consultation_fee_lkr || 2500,
          image: d.user_profiles?.avatar_url || `https://api.dicebear.com/7.x/avataaars/svg?seed=${d.id}`
        }));

        setDoctorsList(mapped);
      } catch (err) {
        console.error('Error fetching doctors:', err);
      } finally {
        setIsLoadingDoctors(false);
      }
    };

    fetchDoctors();
  }, []);

  // Fetch Sessions when selectedDoctor changes
  useEffect(() => {
    if (!selectedDoctor) {
      setSessionsList([]);
      setSelectedSession(null);
      return;
    }

    const fetchSessions = async () => {
      try {
        setIsLoadingSessions(true);
        const { data, error } = await supabase
          .from('sessions')
          .select(`
            id,
            session_date,
            start_time,
            end_time,
            max_patients,
            consultation_fee_lkr,
            hospitals (
              id,
              name,
              city
            )
          `)
          .eq('doctor_id', selectedDoctor.id)
          .in('status', ['active', 'delayed', 'inactive'])
          .order('session_date', { ascending: true });

        if (error) throw error;

        // Parse sessions and query available slots
        const parsed = await Promise.all((data || []).map(async (s: any) => {
          const { count } = await supabase
            .from('appointments')
            .select('*', { count: 'exact', head: true })
            .eq('session_id', s.id)
            .neq('status', 'cancelled');

          const dateObj = new Date(s.session_date);
          const formattedDate = dateObj.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });

          const formatTime = (timeStr: string) => {
            const [hours, minutes] = timeStr.split(':');
            const h = parseInt(hours, 10);
            const ampm = h >= 12 ? 'PM' : 'AM';
            const displayHour = h % 12 || 12;
            return `${displayHour}:${minutes} ${ampm}`;
          };

          const timeRange = `${formatTime(s.start_time)} - ${formatTime(s.end_time)}`;
          const left = Math.max(0, s.max_patients - (count || 0));

          return {
            id: s.id,
            date: formattedDate,
            time: timeRange,
            tokensAvailable: left,
            hospitalName: s.hospitals?.name || 'Affiliated Hospital',
            fee: s.consultation_fee_lkr || selectedDoctor.fee
          };
        }));

        setSessionsList(parsed);
      } catch (err) {
        console.error('Error fetching sessions:', err);
      } finally {
        setIsLoadingSessions(false);
      }
    };

    fetchSessions();
  }, [selectedDoctor]);

  const handleNext = () => setStep(s => Math.min(s + 1, 4));
  const handlePrev = () => setStep(s => Math.max(s - 1, 1));

  const handlePayment = async () => {
    if (!profile?.id || !selectedSession) return;
    setIsProcessing(true);
    try {
      // 1. Get next token number
      const { count: bookedCount } = await supabase
        .from('appointments')
        .select('*', { count: 'exact', head: true })
        .eq('session_id', selectedSession.id);
      const nextToken = (bookedCount || 0) + 1;

      // 2. Insert appointment
      const { error } = await supabase
        .from('appointments')
        .insert([
          {
            session_id: selectedSession.id,
            patient_id: profile.id,
            token_number: nextToken,
            appointment_type: 'consultation',
            status: 'upcoming',
            payment_status: 'paid',
            payment_gateway: 'PayHere',
            payment_ref: 'PAYHERE-' + Date.now(),
            fee_amount: selectedSession.fee,
            fee_currency: 'LKR',
            chief_complaint: complaint,
            is_emergency: false
          }
        ]);

      if (error) throw error;

      // 3. Insert notification
      await supabase
        .from('notifications')
        .insert([
          {
            user_id: profile.id,
            type: 'appointment',
            title: 'Appointment Booked',
            body: `Your slot is confirmed with ${selectedDoctor.name}. Token #${nextToken}.`,
            channel: 'in-app',
            status: 'unread'
          }
        ]);

      setTokenNumber(nextToken);
      setBookingConfirmed(true);
      setStep(4);
    } catch (err) {
      console.error('Booking failed:', err);
      alert('Failed to process booking. Please try again.');
    } finally {
      setIsProcessing(false);
    }
  };

  const filteredDoctors = doctorsList.filter(d => 
    d.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
    d.specialty.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-slate-900">{title}</h1>
        <p className="text-slate-500 mt-1">{subtitle}</p>
      </div>

      {/* Stepper */}
      <div className="flex items-center justify-between mb-8 relative">
        <div className="absolute left-0 top-1/2 -translate-y-1/2 w-full h-1 bg-slate-200 -z-10 rounded-full overflow-hidden">
          <div 
            className="h-full bg-teal-600 transition-all duration-500" 
            style={{ width: `${((step - 1) / 3) * 100}%` }}
          />
        </div>
        {[stepDoctor, stepSession, stepDetails, stepConfirm].map((label, index) => {
          const isActive = step >= index + 1;
          const isCurrent = step === index + 1;
          return (
            <div key={label} className="flex flex-col items-center">
              <div className={`w-10 h-10 rounded-full flex items-center justify-center font-semibold border-4 bg-white transition-colors duration-300 ${
                isCurrent ? 'border-teal-600 text-teal-700' : 
                isActive ? 'border-teal-600 bg-teal-600 text-white' : 
                'border-slate-200 text-slate-400'
              }`}>
                {isActive && !isCurrent ? <CheckCircle2 className="w-5 h-5" /> : index + 1}
              </div>
              <span className={`text-xs mt-2 font-medium ${isActive ? 'text-slate-800' : 'text-slate-400'}`}>{label}</span>
            </div>
          );
        })}
      </div>

      <Card className="border-0 shadow-lg ring-1 ring-slate-100">
        <CardContent className="p-6 sm:p-10">
          {/* Step 1: Doctor Selection */}
          {step === 1 && (
            <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-500">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 w-5 h-5" />
                <Input 
                  placeholder={searchPlaceholder} 
                  className="pl-10 h-12 text-lg bg-slate-50 border-slate-200 focus-visible:ring-teal-500"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>

              {isLoadingDoctors ? (
                <div className="flex flex-col items-center justify-center py-12 gap-2 text-slate-500">
                  <Loader2 className="w-8 h-8 animate-spin text-teal-600" />
                  <p className="text-sm">Loading doctors...</p>
                </div>
              ) : (
                <div className="grid gap-4">
                  {filteredDoctors.length === 0 ? (
                    <p className="text-center py-8 text-slate-400 italic">No doctors found matching "{searchQuery}"</p>
                  ) : (
                    filteredDoctors.map(doc => (
                      <div 
                        key={doc.id} 
                        className={`flex flex-col sm:flex-row items-center gap-4 p-4 rounded-xl border-2 cursor-pointer transition-all ${
                          selectedDoctor?.id === doc.id ? 'border-teal-500 bg-teal-50' : 'border-slate-100 hover:border-teal-200 hover:bg-slate-50'
                        }`}
                        onClick={() => setSelectedDoctor(doc)}
                      >
                        <img src={doc.image} alt={doc.name} className="w-16 h-16 bg-white rounded-full shadow-sm border border-slate-200 object-cover" />
                        <div className="flex-1 text-center sm:text-left">
                          <h3 className="font-semibold text-lg text-slate-900">{doc.name}</h3>
                          <p className="text-teal-600 font-medium">{doc.specialty}</p>
                          <div className="flex items-center justify-center sm:justify-start gap-3 mt-2 text-sm text-slate-500">
                            <span className="flex items-center gap-1"><MapPin className="w-4 h-4" /> Navigating hospital...</span>
                            <span className="flex items-center gap-1 text-amber-500"><Star className="w-4 h-4 fill-current" /> {doc.rating}</span>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="text-lg font-bold text-slate-900">Rs. {doc.fee}</p>
                          <p className="text-xs text-slate-500">{consultationFee}</p>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              )}
            </div>
          )}

          {/* Step 2: Session Selection */}
          {step === 2 && (
            <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-500">
              <div className="flex items-center gap-4 mb-6 p-4 bg-slate-50 rounded-xl">
                 <img src={selectedDoctor.image} alt={selectedDoctor.name} className="w-12 h-12 bg-white rounded-full border border-slate-200 object-cover" />
                 <div>
                   <h3 className="font-semibold text-slate-900">{selectedDoctor.name}</h3>
                   <p className="text-sm text-slate-500">{selectedDoctor.specialty}</p>
                 </div>
              </div>
              <h3 className="text-lg font-semibold mb-4">{availableSessions}</h3>
              {isLoadingSessions ? (
                <div className="flex flex-col items-center justify-center py-12 gap-2 text-slate-500">
                  <Loader2 className="w-8 h-8 animate-spin text-teal-600" />
                  <p className="text-sm">Loading sessions...</p>
                </div>
              ) : (
                <div className="grid sm:grid-cols-2 gap-4">
                  {sessionsList.length === 0 ? (
                    <p className="text-center py-8 text-slate-400 italic col-span-2">No active sessions available for this doctor.</p>
                  ) : (
                    sessionsList.map(session => (
                      <div 
                        key={session.id}
                        className={`p-5 rounded-xl border-2 cursor-pointer transition-all ${
                          selectedSession?.id === session.id ? 'border-teal-500 bg-teal-50 shadow-md' : 'border-slate-200 hover:border-teal-300'
                        }`}
                        onClick={() => setSelectedSession(session)}
                      >
                        <div className="flex items-center gap-2 text-slate-800 font-semibold mb-2">
                          <Calendar className="w-5 h-5 text-teal-600" />
                          {session.date}
                        </div>
                        <div className="flex items-center gap-2 text-slate-600 mb-2">
                          <Clock className="w-4 h-4" />
                          {session.time}
                        </div>
                        <div className="text-xs font-semibold text-slate-500 mb-3 flex items-center gap-1">
                          <MapPin className="w-3.5 h-3.5" />
                          {session.hospitalName}
                        </div>
                        <div className="flex items-center justify-between text-sm">
                          <span className="bg-teal-100 text-teal-800 px-2 py-1 rounded-md font-medium">
                            {session.tokensAvailable} {tokensLeft}
                          </span>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              )}
            </div>
          )}

          {/* Step 3: Patient Details */}
          {step === 3 && (
            <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-500">
               <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 text-amber-800 text-sm">
                 {detailsNotice}
               </div>
               <div className="space-y-4">
                 <div className="space-y-2">
                   <label className="text-sm font-medium">{complaintLabel}</label>
                   <textarea 
                     className="w-full min-h-[120px] p-3 rounded-md border border-slate-200 focus:outline-none focus:ring-2 focus:ring-teal-500 resize-none bg-slate-50"
                     placeholder={complaintPlaceholder}
                     value={complaint}
                     onChange={(e) => setComplaint(e.target.value)}
                   />
                 </div>
               </div>
            </div>
          )}

          {/* Step 4: Payment & Confirmation */}
          {step === 4 && (
            <div className="animate-in fade-in slide-in-from-right-4 duration-500">
               {bookingConfirmed ? (
                <div className="text-center space-y-6 py-8">
                  <div className="w-24 h-24 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
                    <CheckCircle2 className="w-12 h-12 text-green-600" />
                  </div>
                  <h2 className="text-3xl font-bold text-slate-900">{bookingConfirmedTitle}</h2>
                  <p className="text-slate-500 max-w-md mx-auto">
                    {bookingConfirmedDesc} ({selectedDoctor.name} - {selectedSession.date})
                  </p>
                  
                  <div className="bg-slate-50 border border-slate-200 rounded-2xl p-8 max-w-sm mx-auto shadow-sm my-8">
                    <p className="text-sm text-slate-500 font-medium uppercase tracking-wider mb-2">{tokenNumberLabel}</p>
                    <p className="text-6xl font-black text-teal-600">#{tokenNumber}</p>
                  </div>

                  <Button className="bg-teal-600 hover:bg-teal-700 h-12 px-8" asChild>
                    <a href="/patient/dashboard">{goToDashboard}</a>
                  </Button>
                </div>
              ) : (
                <div className="space-y-8">
                  <div className="bg-slate-50 p-6 rounded-xl border border-slate-200">
                    <h3 className="font-semibold text-lg mb-4">{summaryTitle}</h3>
                    <div className="space-y-3 text-sm">
                      <div className="flex justify-between"><span className="text-slate-500">{doctorLabel}</span><span className="font-medium text-slate-900">{selectedDoctor.name}</span></div>
                      <div className="flex justify-between"><span className="text-slate-500">{dateLabel}</span><span className="font-medium text-slate-900">{selectedSession.date}</span></div>
                      <div className="flex justify-between"><span className="text-slate-500">{timeLabel}</span><span className="font-medium text-slate-900">{selectedSession.time}</span></div>
                      <div className="w-full h-px bg-slate-200 my-4" />
                      <div className="flex justify-between"><span className="text-slate-500">{consultationFee}</span><span>Rs. {selectedSession.fee}</span></div>
                      <div className="flex justify-between"><span className="text-slate-500">{bookingFee}</span><span>Rs. 300</span></div>
                      <div className="flex justify-between text-lg font-bold text-slate-900 pt-2"><span className="text-slate-900">{totalPayable}</span><span className="text-teal-600">Rs. {selectedSession.fee + 300}</span></div>
                    </div>
                  </div>

                  <Button 
                    className="w-full h-14 text-lg bg-teal-600 hover:bg-teal-700 gap-2" 
                    onClick={handlePayment}
                    disabled={isProcessing}
                  >
                    {isProcessing ? (
                      <>
                        <Loader2 className="w-5 h-5 animate-spin" />
                        {processingPayment}
                      </>
                    ) : (
                      <>
                        <CreditCard className="w-5 h-5" />
                        {payButton}
                      </>
                    )}
                  </Button>
                </div>
              )}
            </div>
          )}
        </CardContent>
        
        {/* Navigation Footer */}
        {!bookingConfirmed && (
          <div className="bg-slate-50 p-6 flex justify-between items-center rounded-b-xl border-t border-slate-100">
            <Button 
              variant="outline" 
              onClick={handlePrev} 
              disabled={step === 1}
              className="gap-2"
            >
              <ChevronLeft className="w-4 h-4" /> {backButton}
            </Button>
            
            {step < 4 && (
              <Button 
                onClick={handleNext} 
                disabled={
                  (step === 1 && !selectedDoctor) || 
                  (step === 2 && !selectedSession)
                }
                className="gap-2 bg-teal-600 hover:bg-teal-700"
              >
                {continueButton} <ChevronRight className="w-4 h-4" />
              </Button>
            )}
          </div>
        )}
      </Card>
    </div>
  );
}
