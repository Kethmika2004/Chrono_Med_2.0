import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { supabase } from '@/lib/supabase';
import { useAuthStore } from '@/store/authStore';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { CalendarPlus, CalendarDays, Activity, FileText, Bell, Clock } from 'lucide-react';

export default function PatientDashboard() {
  const { profile } = useAuthStore();
  const [activeAppointment, setActiveAppointment] = useState<any>(null);
  const [upcomingAppointments, setUpcomingAppointments] = useState<any[]>([]);

  useEffect(() => {
    // Mock fetching active & upcoming appointments
    // In a real app, this would be a Supabase query
    setUpcomingAppointments([
      { id: 1, doctor: 'Dr. Sarah Connor', specialty: 'Cardiologist', date: 'Oct 24, 2023', time: '10:00 AM' },
      { id: 2, doctor: 'Dr. John Smith', specialty: 'General Practitioner', date: 'Oct 28, 2023', time: '02:30 PM' },
    ]);
  }, []);

  return (
    <div className="space-y-6">
      {/* Welcome Banner */}
      <div className="bg-gradient-to-r from-teal-600 to-teal-800 rounded-2xl p-6 sm:p-10 text-white shadow-lg relative overflow-hidden">
        <div className="relative z-10">
          <h1 className="text-3xl font-bold mb-2">Welcome back, {profile?.full_name?.split(' ')[0] || 'Patient'}!</h1>
          <p className="text-teal-100 max-w-lg text-lg">
            Manage your health journey, view upcoming appointments, and keep track of your medical records.
          </p>
        </div>
        {/* Decorative elements */}
        <div className="absolute top-0 right-0 -mt-8 -mr-8 w-48 h-48 bg-white opacity-10 rounded-full blur-2xl"></div>
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { title: 'Book Appointment', icon: CalendarPlus, href: '/patient/book', color: 'bg-blue-50 text-blue-600' },
          { title: 'My Appointments', icon: CalendarDays, href: '/patient/appointments', color: 'bg-amber-50 text-amber-600' },
          { title: 'Queue Tracker', icon: Activity, href: '/patient/queue', color: 'bg-rose-50 text-rose-600' },
          { title: 'Health Records', icon: FileText, href: '/patient/health-record', color: 'bg-emerald-50 text-emerald-600' },
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
          <Card className="border-teal-100 shadow-sm overflow-hidden">
            <div className="bg-teal-50 border-b border-teal-100 px-6 py-4 flex items-center justify-between">
              <h2 className="text-lg font-semibold text-teal-800 flex items-center">
                <span className="relative flex h-3 w-3 mr-3">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-teal-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-3 w-3 bg-teal-500"></span>
                </span>
                Active Queue
              </h2>
              <span className="text-sm font-medium text-teal-600 bg-white px-3 py-1 rounded-full border border-teal-200">
                Token #14
              </span>
            </div>
            <CardContent className="p-6">
              <div className="flex flex-col md:flex-row gap-6 items-center md:items-start justify-between">
                <div className="space-y-1 text-center md:text-left">
                  <h3 className="text-xl font-bold text-slate-800">Dr. Sarah Connor</h3>
                  <p className="text-slate-500">Cardiologist • Room 302</p>
                  <div className="mt-4 flex items-center justify-center md:justify-start gap-2 text-sm text-slate-600 bg-slate-50 p-2 rounded-lg w-fit">
                    <Clock className="w-4 h-4 text-amber-500" />
                    <span>Est. wait time: <strong>15 mins</strong> (3 patients ahead)</span>
                  </div>
                </div>
                <Button className="w-full md:w-auto bg-teal-600 hover:bg-teal-700" asChild>
                  <Link to="/patient/queue">View Live Tracker</Link>
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Upcoming Appointments */}
          <Card className="shadow-sm border-slate-100">
            <CardHeader className="pb-3 border-b border-slate-50">
              <div className="flex items-center justify-between">
                <CardTitle className="text-lg font-semibold">Upcoming Appointments</CardTitle>
                <Link to="/patient/appointments" className="text-sm text-teal-600 hover:underline font-medium">View all</Link>
              </div>
            </CardHeader>
            <CardContent className="p-0">
              <div className="divide-y divide-slate-100">
                {upcomingAppointments.map((apt) => (
                  <div key={apt.id} className="p-4 sm:px-6 hover:bg-slate-50 transition-colors flex items-center justify-between">
                    <div className="flex items-start gap-4">
                      <div className="bg-blue-50 text-blue-700 rounded-xl p-3 text-center min-w-[64px]">
                        <div className="text-xs font-bold uppercase">{apt.date.split(' ')[0]}</div>
                        <div className="text-xl font-bold">{apt.date.split(' ')[1].replace(',', '')}</div>
                      </div>
                      <div>
                        <h4 className="font-semibold text-slate-800">{apt.doctor}</h4>
                        <p className="text-sm text-slate-500">{apt.specialty}</p>
                        <p className="text-sm font-medium text-slate-600 mt-1 flex items-center gap-1.5">
                          <Clock className="w-3.5 h-3.5" /> {apt.time}
                        </p>
                      </div>
                    </div>
                    <Button variant="outline" size="sm" className="hidden sm:flex">Details</Button>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Sidebar Panel */}
        <div className="space-y-6">
          <Card className="shadow-sm border-slate-100">
            <CardHeader className="pb-3">
              <CardTitle className="text-lg font-semibold flex items-center gap-2">
                <Bell className="w-5 h-5 text-slate-500" /> Notifications
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {[
                  { title: 'Queue Update', desc: 'Dr. Connor is running 15 mins late.', time: '10m ago', unread: true },
                  { title: 'Test Results', desc: 'Your blood test results are ready.', time: '2h ago', unread: false },
                  { title: 'Reminder', desc: 'Appointment tomorrow at 10:00 AM.', time: '1d ago', unread: false },
                ].map((notif, i) => (
                  <div key={i} className="flex gap-3 items-start">
                    <div className={`w-2 h-2 rounded-full mt-1.5 ${notif.unread ? 'bg-teal-500' : 'bg-transparent'}`} />
                    <div>
                      <p className={`text-sm ${notif.unread ? 'font-semibold text-slate-800' : 'font-medium text-slate-700'}`}>
                        {notif.title}
                      </p>
                      <p className="text-xs text-slate-500 mt-0.5">{notif.desc}</p>
                      <p className="text-[10px] text-slate-400 mt-1 uppercase tracking-wider">{notif.time}</p>
                    </div>
                  </div>
                ))}
              </div>
              <Button variant="ghost" className="w-full mt-4 text-sm text-teal-600" asChild>
                 <Link to="/patient/notifications">View all notifications</Link>
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}