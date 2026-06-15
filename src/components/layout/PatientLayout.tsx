import { Link, Outlet, useLocation } from 'react-router-dom';
import { 
  LayoutDashboard, 
  CalendarPlus, 
  CalendarDays, 
  Activity, 
  FileText, 
  HeartPulse, 
  Bell, 
  Settings,
  LogOut,
  User,
  Menu,
  X
} from 'lucide-react';
import { useState } from 'react';
import { useAuthStore } from '@/store/authStore';
import LanguageSwitcher from '@/components/LanguageSwitcher';
import { useIntlayer } from 'react-intlayer';

const navigation = [
  { name: 'Dashboard', href: '/patient/dashboard', icon: LayoutDashboard },
  { name: 'Book Appointment', href: '/patient/book', icon: CalendarPlus },
  { name: 'My Appointments', href: '/patient/appointments', icon: CalendarDays },
  { name: 'Queue Tracker', href: '/patient/queue', icon: Activity },
  { name: 'Documents', href: '/patient/documents', icon: FileText },
  { name: 'Health Record', href: '/patient/health-record', icon: HeartPulse },
  { name: 'Notifications', href: '/patient/notifications', icon: Bell },
  { name: 'Settings', href: '/patient/settings', icon: Settings },
];

export default function PatientLayout() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const location = useLocation();
  const { profile, signOut } = useAuthStore();
  const {
    dashboard,
    bookAppointment,
    myAppointments,
    queueTracker,
    documents,
    healthRecord,
    notifications,
    settings,
    signOut: signOutLabel,
    viewNotifications
  } = useIntlayer('patient-layout');

  const navigationTranslationMap: Record<string, string> = {
    'Dashboard': dashboard,
    'Book Appointment': bookAppointment,
    'My Appointments': myAppointments,
    'Queue Tracker': queueTracker,
    'Documents': documents,
    'Health Record': healthRecord,
    'Notifications': notifications,
    'Settings': settings,
  };

  return (
    <div className="min-h-screen bg-slate-50 flex">
      {/* Mobile sidebar overlay */}
      {sidebarOpen && (
        <div 
          className="fixed inset-0 z-40 bg-slate-600 bg-opacity-75 md:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <div className={`
        fixed inset-y-0 left-0 z-50 w-64 bg-white border-r border-slate-200 transform transition-transform duration-300 ease-in-out md:relative md:translate-x-0
        ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}
      `}>
        <div className="flex flex-col h-full">
          <div className="flex items-center justify-center h-16 border-b border-slate-200 px-4">
            <Link to="/patient/dashboard" className="flex items-center gap-2">
               <div className="w-8 h-8 bg-teal-700 rounded-lg flex items-center justify-center shadow-md">
                <span className="text-white font-bold text-lg">C</span>
              </div>
              <span className="text-xl font-bold text-teal-700">ChronoMed</span>
            </Link>
            <button 
              className="ml-auto md:hidden text-slate-500 hover:text-slate-700"
              onClick={() => setSidebarOpen(false)}
            >
              <X className="w-6 h-6" />
            </button>
          </div>

          <nav className="flex-1 px-4 py-4 space-y-1 overflow-y-auto">
            {navigation.map((item) => {
              const isActive = location.pathname.startsWith(item.href);
              const displayName = navigationTranslationMap[item.name] || item.name;
              return (
                <Link
                  key={item.name}
                  to={item.href}
                  className={`
                    flex items-center px-3 py-2.5 text-sm font-medium rounded-lg transition-colors
                    ${isActive 
                      ? 'bg-teal-50 text-teal-700' 
                      : 'text-slate-700 hover:bg-slate-100 hover:text-slate-900'}
                  `}
                >
                  <item.icon className={`mr-3 w-5 h-5 ${isActive ? 'text-teal-700' : 'text-slate-400'}`} />
                  {displayName}
                </Link>
              );
            })}
          </nav>

          <div className="p-4 border-t border-slate-200">
            <button
              onClick={() => signOut()}
              className="flex items-center w-full px-3 py-2.5 text-sm font-medium text-red-600 rounded-lg hover:bg-red-50 transition-colors"
            >
              <LogOut className="mr-3 w-5 h-5" />
              {signOutLabel}
            </button>
          </div>
        </div>
      </div>

      {/* Main content */}
      <div className="flex-1 flex flex-col min-w-0">
        <header className="bg-white shadow-sm border-b border-slate-200 sticky top-0 z-30">
          <div className="flex items-center justify-between h-16 px-4 sm:px-6 lg:px-8">
            <button
              className="text-slate-500 hover:text-slate-700 md:hidden"
              onClick={() => setSidebarOpen(true)}
            >
              <Menu className="w-6 h-6" />
            </button>

            <div className="flex items-center gap-4 ml-auto">
              <LanguageSwitcher />

              <Link to="/patient/notifications" className="relative p-2 text-slate-400 hover:text-slate-500 rounded-full hover:bg-slate-100 transition-colors">
                <span className="sr-only">{viewNotifications}</span>
                <Bell className="w-6 h-6" />
                <span className="absolute top-1.5 right-1.5 block w-2.5 h-2.5 rounded-full bg-red-500 ring-2 ring-white" />
              </Link>

              <div className="flex items-center gap-3">
                <div className="hidden md:block text-right">
                  <p className="text-sm font-medium text-slate-700">{profile?.full_name || 'Patient'}</p>
                  <p className="text-xs text-slate-500 capitalize">{profile?.role}</p>
                </div>
                <div className="w-9 h-9 rounded-full bg-teal-50 flex items-center justify-center text-teal-700 font-semibold border border-teal-100">
                  <User className="w-5 h-5" />
                </div>
              </div>
            </div>
          </div>
        </header>

        <main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8">
          <Outlet />
        </main>
      </div>
    </div>
  );
}