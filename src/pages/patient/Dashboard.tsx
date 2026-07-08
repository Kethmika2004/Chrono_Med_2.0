import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { supabase } from '@/lib/supabase';
import { useAuthStore } from '@/store/authStore';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { CalendarPlus, CalendarDays, Activity, FileText, Bell, Clock } from 'lucide-react';
import { useIntlayer } from 'react-intlayer';

export default function PatientDashboard() {
  const { profile } = useAuthStore();
  const [activeAppointment, setActiveAppointment] = useState<any>(null);
  const [upcomingAppointments, setUpcomingAppointments] = useState<any[]>([]);
  const [notifications, setNotifications] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const {
    welcomeTitle,
    welcomeSubtitle,
    bookAppointment,
    myAppointments,
    queueTracker,
    healthRecords,
    activeQueue,
    tokenLabel,
    roomLabel,
    estWaitTime,
    mins,
    patientsAhead,
    viewLiveTracker,
    upcomingAppointments: upcomingAppointmentsTitle,
    viewAll,
    detailsButton,
    notificationsTitle,
    viewAllNotifications
  } = useIntlayer('dashboard');

  const getDayAndMonth = (dateStr: string) => {
    if (!dateStr) return { month: 'OCT', day: 1 };
    const [year, month, day] = dateStr.split('-');
    const dateObj = new Date(parseInt(year), parseInt(month) - 1, parseInt(day));
    const monthName = dateObj.toLocaleDateString('en-US', { month: 'short' });
    return { month: monthName.toUpperCase(), day: parseInt(day, 10) };
  };

  const formatTime = (timeStr: string) => {
    if (!timeStr) return '';
    const [hours, minutes] = timeStr.split(':');
    const h = parseInt(hours, 10);
    const ampm = h >= 12 ? 'PM' : 'AM';
    const displayHour = h % 12 || 12;
    return `${displayHour}:${minutes} ${ampm}`;
  };

  const formatDate = (dateStr: string) => {
    if (!dateStr) return '';
    const [year, month, day] = dateStr.split('-');
    const dateObj = new Date(parseInt(year), parseInt(month) - 1, parseInt(day));
    return dateObj.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  };

  const formatTimeAgo = (dateStr: string) => {
    const diff = Date.now() - new Date(dateStr).getTime();
    const elapsedMins = Math.floor(diff / 60000);
    if (elapsedMins < 1) return 'Just now';
    if (elapsedMins < 60) return `${elapsedMins}m ago`;
    const hours = Math.floor(elapsedMins / 60);
    if (hours < 24) return `${hours}h ago`;
    const days = Math.floor(hours / 24);
    return `${days}d ago`;
  };

  const getNotificationIcon = (type: string) => {
    if (type === 'queue') return Activity;
    if (type === 'document' || type === 'prescription') return FileText;
    if (type === 'appointment') return CalendarDays;
    return Bell;
  };

  useEffect(() => {
    if (!profile?.id) return;

    const fetchData = async () => {
      try {
        setIsLoading(true);
        // 1. Fetch appointments
        const { data: appts, error: apptError } = await supabase
          .from('appointments')
          .select(`
            id,
            token_number,
            status,
            chief_complaint,
            created_at,
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
                user_profiles:profile_id (
                  full_name,
                  avatar_url
                )
              ),
              hospitals (
                id,
                name,
                city
              )
            )
          `)
          .eq('patient_id', profile.id)
          .order('created_at', { ascending: false });

        if (apptError) throw apptError;

        if (appts) {
          // Sort/filter active vs upcoming
          // Active: session status is 'active' or 'delayed' and appointment status is 'upcoming' or 'called_at'
          const active = appts.find(
            (a: any) =>
              (a.status === 'upcoming' || a.status === 'called_at') &&
              a.sessions &&
              (a.sessions.status === 'active' || a.sessions.status === 'delayed')
          );
          setActiveAppointment(active || null);

          // Upcoming: appointment status is 'upcoming', excluding the active one
          const upcoming = appts.filter(
            (a: any) =>
              a.status === 'upcoming' &&
              (!active || a.id !== active.id)
          );
          setUpcomingAppointments(upcoming);
        }

        // 2. Fetch last 3 notifications
        const { data: notifs, error: notifError } = await supabase
          .from('notifications')
          .select('*')
          .eq('user_id', profile.id)
          .order('created_at', { ascending: false })
          .limit(3);

        if (!notifError && notifs) {
          setNotifications(notifs);
        }
      } catch (err) {
        console.error('Error fetching dashboard data:', err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [profile?.id]);

  if (isLoading) {
    return (
      <div className="space-y-6 animate-pulse">
        <div className="h-40 bg-slate-200 rounded-2xl"></div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="h-24 bg-slate-200 rounded-xl"></div>
          <div className="h-24 bg-slate-200 rounded-xl"></div>
          <div className="h-24 bg-slate-200 rounded-xl"></div>
          <div className="h-24 bg-slate-200 rounded-xl"></div>
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-6">
            <div className="h-48 bg-slate-200 rounded-xl"></div>
            <div className="h-64 bg-slate-200 rounded-xl"></div>
          </div>
          <div className="h-80 bg-slate-200 rounded-xl"></div>
        </div>
      </div>
    );
  }

  // Active appointment calculations
  const isSessionActive = activeAppointment?.sessions?.status === 'active' || activeAppointment?.sessions?.status === 'delayed';
  const currentToken = activeAppointment?.sessions?.current_token || 0;
  const myToken = activeAppointment?.token_number || 0;
  const patientsAheadVal = Math.max(0, myToken - currentToken);
  const calculatedWait = patientsAheadVal * 15;

  return (
    <div className="space-y-6">
      {/* Welcome Banner */}
      <div className="bg-gradient-to-r from-teal-600 to-teal-800 rounded-2xl p-6 sm:p-10 text-white shadow-lg relative overflow-hidden">
        <div className="relative z-10">
          <h1 className="text-3xl font-bold mb-2">
            {welcomeTitle}, {profile?.full_name?.split(' ')[0] || 'Patient'}!
          </h1>
          <p className="text-teal-100 max-w-lg text-lg">
            {welcomeSubtitle}
          </p>
        </div>
        {/* Decorative elements */}
        <div className="absolute top-0 right-0 -mt-8 -mr-8 w-48 h-48 bg-white opacity-10 rounded-full blur-2xl"></div>
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { title: bookAppointment, icon: CalendarPlus, href: '/patient/book', color: 'bg-blue-50 text-blue-600' },
          { title: myAppointments, icon: CalendarDays, href: '/patient/appointments', color: 'bg-amber-50 text-amber-600' },
          { title: queueTracker, icon: Activity, href: '/patient/queue', color: 'bg-rose-50 text-rose-600' },
          { title: healthRecords, icon: FileText, href: '/patient/health-record', color: 'bg-emerald-50 text-emerald-600' },
        ].map((action, idx) => (
          <Link key={idx} to={action.href}>
            <Card className="hover:shadow-md transition-shadow cursor-pointer h-full border-slate-100 group">
              <CardContent className="p-4 flex flex-col items-center justify-center text-center h-full">
                <div className={`w-12 h-12 rounded-full flex items-center justify-center mb-3 group-hover:scale-110 transition-transform ${action.color}`}>
                  <action.icon className="w-6 h-6" />
                </div>
                <span className="font-medium text-slate-700 text-sm">{action.title}</span>
              </CardContent>
            </Card>
          </Link>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Content Area */}
        <div className="lg:col-span-2 space-y-6">
          {/* Active Appointment (Queue) */}
          {activeAppointment ? (
            <Card className="border-teal-100 shadow-sm overflow-hidden">
              <div className="bg-teal-50 border-b border-teal-100 px-6 py-4 flex items-center justify-between">
                <h2 className="text-lg font-semibold text-teal-800 flex items-center">
                  <span className="relative flex h-3 w-3 mr-3">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-teal-400 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-3 w-3 bg-teal-500"></span>
                  </span>
                  {activeQueue}
                </h2>
                <span className="text-sm font-medium text-teal-600 bg-white px-3 py-1 rounded-full border border-teal-200">
                  {tokenLabel} #{activeAppointment.token_number}
                </span>
              </div>
              <CardContent className="p-6">
                <div className="flex flex-col md:flex-row gap-6 items-center md:items-start justify-between">
                  <div className="space-y-1 text-center md:text-left">
                    <h3 className="text-xl font-bold text-slate-800">
                      {activeAppointment.sessions?.doctors?.user_profiles?.full_name || 'Medical Doctor'}
                    </h3>
                    <p className="text-slate-500">
                      {activeAppointment.sessions?.doctors?.specialty || 'General Practitioner'} • {activeAppointment.sessions?.hospitals?.name || 'Affiliated Hospital'}
                    </p>
                    <div className="mt-4 flex items-center justify-center md:justify-start gap-2 text-sm text-slate-600 bg-slate-50 p-2 rounded-lg w-fit">
                      <Clock className="w-4 h-4 text-amber-500" />
                      <span>
                        {estWaitTime}: <strong>{calculatedWait} {mins}</strong> ({patientsAheadVal} {patientsAhead})
                      </span>
                    </div>
                  </div>
                  <Button className="w-full md:w-auto bg-teal-600 hover:bg-teal-700" asChild>
                    <Link to={`/patient/queue/${activeAppointment.id}`}>{viewLiveTracker}</Link>
                  </Button>
                </div>
              </CardContent>
            </Card>
          ) : (
            <Card className="border-slate-100 shadow-sm overflow-hidden bg-white">
              <CardContent className="p-8 text-center space-y-4">
                <div className="w-16 h-16 bg-teal-50 rounded-full flex items-center justify-center mx-auto text-teal-700">
                  <Activity className="w-8 h-8 animate-pulse" />
                </div>
                <h3 className="text-lg font-bold text-slate-800">No Active Queue Sessions</h3>
                <p className="text-slate-500 max-w-sm mx-auto text-sm">
                  You don't have any live queue sessions running right now. When a doctor starts your session, the live tracker will appear here.
                </p>
                <Button className="bg-teal-600 hover:bg-teal-700" asChild>
                  <Link to="/patient/book">{bookAppointment}</Link>
                </Button>
              </CardContent>
            </Card>
          )}

          {/* Upcoming Appointments */}
          <Card className="shadow-sm border-slate-100">
            <CardHeader className="pb-3 border-b border-slate-50">
              <div className="flex items-center justify-between">
                <CardTitle className="text-lg font-semibold">{upcomingAppointmentsTitle}</CardTitle>
                <Link to="/patient/appointments" className="text-sm text-teal-600 hover:underline font-medium">{viewAll}</Link>
              </div>
            </CardHeader>
            <CardContent className="p-0">
              <div className="divide-y divide-slate-100">
                {upcomingAppointments.length === 0 ? (
                  <div className="p-8 text-center text-slate-400 text-sm italic">
                    No upcoming appointments.
                  </div>
                ) : (
                  upcomingAppointments.map((apt) => {
                    const { month, day } = getDayAndMonth(apt.sessions?.session_date);
                    return (
                      <div key={apt.id} className="p-4 sm:px-6 hover:bg-slate-50 transition-colors flex items-center justify-between">
                        <div className="flex items-start gap-4">
                          <div className="bg-blue-50 text-blue-700 rounded-xl p-3 text-center min-w-[64px]">
                            <div className="text-xs font-bold uppercase">{month}</div>
                            <div className="text-xl font-bold">{day}</div>
                          </div>
                          <div>
                            <h4 className="font-semibold text-slate-800">
                              {apt.sessions?.doctors?.user_profiles?.full_name || 'Medical Doctor'}
                            </h4>
                            <p className="text-sm text-slate-500">{apt.sessions?.doctors?.specialty}</p>
                            <p className="text-sm font-medium text-slate-600 mt-1 flex items-center gap-1.5">
                              <Clock className="w-3.5 h-3.5" /> {formatTime(apt.sessions?.start_time)}
                            </p>
                          </div>
                        </div>
                        <Button variant="outline" size="sm" className="hidden sm:flex" asChild>
                          <Link to="/patient/appointments">{detailsButton}</Link>
                        </Button>
                      </div>
                    );
                  })
                )}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Sidebar Panel */}
        <div className="space-y-6">
          <Card className="shadow-sm border-slate-100">
            <CardHeader className="pb-3">
              <CardTitle className="text-lg font-semibold flex items-center gap-2">
                <Bell className="w-5 h-5 text-slate-500" /> {notificationsTitle}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {notifications.length === 0 ? (
                  <p className="text-sm text-slate-400 italic text-center py-4">No notifications yet</p>
                ) : (
                  notifications.map((notif) => {
                    const Icon = getNotificationIcon(notif.type);
                    return (
                      <div key={notif.id} className="flex gap-3 items-start">
                        <div className={`w-2 h-2 rounded-full mt-1.5 shrink-0 ${notif.read_at ? 'bg-transparent' : 'bg-teal-500'}`} />
                        <div className="flex-1 min-w-0">
                          <p className={`text-sm truncate ${notif.read_at ? 'font-medium text-slate-700' : 'font-semibold text-slate-800'}`}>
                            {notif.title}
                          </p>
                          <p className="text-xs text-slate-500 mt-0.5 line-clamp-2">{notif.body}</p>
                          <p className="text-[10px] text-slate-400 mt-1 uppercase tracking-wider">{formatTimeAgo(notif.created_at)}</p>
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
              <Button variant="ghost" className="w-full mt-4 text-sm text-teal-600 hover:text-teal-700 hover:bg-slate-50" asChild>
                 <Link to="/patient/notifications">{viewAllNotifications}</Link>
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}