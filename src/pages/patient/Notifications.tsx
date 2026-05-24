import { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Bell, Activity, FileText, Calendar, CheckCircle2, Circle } from 'lucide-react';
import { useAuthStore } from '@/store/authStore';

const MOCK_NOTIFS = [
  { id: 1, title: 'Queue Update', desc: 'Dr. Sarah Connor is running 15 mins late due to an emergency.', time: '10 mins ago', read: false, type: 'queue', icon: Activity },
  { id: 2, title: 'Test Results Ready', desc: 'Your recent blood test results are now available in your documents.', time: '2 hours ago', read: false, type: 'document', icon: FileText },
  { id: 3, title: 'Appointment Reminder', desc: 'You have an appointment tomorrow at 10:00 AM with Dr. John Smith.', time: '1 day ago', read: true, type: 'appointment', icon: Calendar },
  { id: 4, title: 'Prescription Added', desc: 'Dr. Emily Chen has uploaded a new prescription to your records.', time: '3 days ago', read: true, type: 'document', icon: FileText },
];

export default function Notifications() {
  const [notifications, setNotifications] = useState(MOCK_NOTIFS);

  const markAllAsRead = () => {
    setNotifications(prev => prev.map(n => ({ ...n, read: true })));
  };

  const toggleRead = (id: number) => {
    setNotifications(prev => prev.map(n => n.id === id ? { ...n, read: !n.read } : n));
  };

  const unreadCount = notifications.filter(n => !n.read).length;

  return (
    <div className="max-w-3xl mx-auto space-y-8">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-slate-900 flex items-center gap-3">
            Notifications 
            {unreadCount > 0 && (
              <span className="bg-red-500 text-white text-sm px-2.5 py-0.5 rounded-full font-semibold">
                {unreadCount} New
              </span>
            )}
          </h1>
          <p className="text-slate-500 mt-1">Stay updated on your appointments and records</p>
        </div>
        <Button variant="outline" onClick={markAllAsRead} disabled={unreadCount === 0}>
          <CheckCircle2 className="w-4 h-4 mr-2" /> Mark all as read
        </Button>
      </div>

      <Card className="border-slate-200 shadow-sm overflow-hidden">
        <div className="divide-y divide-slate-100">
          {notifications.length === 0 ? (
            <div className="p-12 text-center text-slate-500">
              <Bell className="w-12 h-12 mx-auto mb-4 opacity-20" />
              <p>You're all caught up!</p>
            </div>
          ) : (
            notifications.map((notif) => (
              <div 
                key={notif.id} 
                className={`p-4 sm:p-6 flex gap-4 transition-colors ${notif.read ? 'bg-white' : 'bg-slate-50'}`}
              >
                <div className={`mt-1 shrink-0 ${notif.read ? 'text-slate-400' : 'text-teal-600'}`}>
                  <notif.icon className="w-6 h-6" />
                </div>
                <div className="flex-1">
                  <div className="flex items-start justify-between gap-2">
                    <h4 className={`text-base font-semibold ${notif.read ? 'text-slate-700' : 'text-slate-900'}`}>
                      {notif.title}
                    </h4>
                    <span className="text-xs text-slate-400 whitespace-nowrap">{notif.time}</span>
                  </div>
                  <p className={`mt-1 text-sm ${notif.read ? 'text-slate-500' : 'text-slate-700 font-medium'}`}>
                    {notif.desc}
                  </p>
                </div>
                <button 
                  onClick={() => toggleRead(notif.id)}
                  className="shrink-0 pt-1 text-slate-400 hover:text-teal-600 focus:outline-none"
                  title={notif.read ? 'Mark as unread' : 'Mark as read'}
                >
                  {notif.read ? <Circle className="w-5 h-5" /> : <CheckCircle2 className="w-5 h-5 text-teal-600" />}
                </button>
              </div>
            ))
          )}
        </div>
      </Card>
    </div>
  );
}
