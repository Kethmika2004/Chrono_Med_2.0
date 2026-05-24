import { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Calendar, Clock, MapPin, Search, ChevronRight, XCircle } from 'lucide-react';
import { Input } from '@/components/ui/input';

const MOCK_APPOINTMENTS = [
  { id: 1, status: 'upcoming', doctor: 'Dr. Sarah Connor', specialty: 'Cardiologist', hospital: 'Nawaloka Hospital', date: 'Oct 24, 2023', time: '10:00 AM', token: 14 },
  { id: 2, status: 'upcoming', doctor: 'Dr. John Smith', specialty: 'Neurologist', hospital: 'Asiri Surgical', date: 'Oct 28, 2023', time: '02:30 PM', token: 5 },
  { id: 3, status: 'past', doctor: 'Dr. Emily Chen', specialty: 'Dermatologist', hospital: 'Lanka Hospitals', date: 'Sep 15, 2023', time: '11:00 AM', token: 22 },
  { id: 4, status: 'cancelled', doctor: 'Dr. Sarah Connor', specialty: 'Cardiologist', hospital: 'Nawaloka Hospital', date: 'Aug 02, 2023', time: '09:00 AM', token: 8 },
];

export default function Appointments() {
  const [activeTab, setActiveTab] = useState<'upcoming' | 'past' | 'cancelled'>('upcoming');
  const [searchQuery, setSearchQuery] = useState('');

  const filtered = MOCK_APPOINTMENTS.filter(apt => 
    apt.status === activeTab && 
    (apt.doctor.toLowerCase().includes(searchQuery.toLowerCase()) || apt.specialty.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  return (
    <div className="max-w-5xl mx-auto space-y-8">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">My Appointments</h1>
          <p className="text-slate-500 mt-1">Manage all your medical visits</p>
        </div>
        <div className="relative max-w-sm w-full">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 w-5 h-5" />
          <Input 
            placeholder="Search doctors..." 
            className="pl-10 h-11 bg-white border-slate-200"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 border-b border-slate-200 pb-px overflow-x-auto no-scrollbar">
        {[
          { id: 'upcoming', label: 'Upcoming' },
          { id: 'past', label: 'Past Visits' },
          { id: 'cancelled', label: 'Cancelled' }
        ].map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id as any)}
            className={`px-6 py-3 font-medium text-sm transition-all relative whitespace-nowrap ${
              activeTab === tab.id ? 'text-teal-700' : 'text-slate-500 hover:text-slate-700'
            }`}
          >
            {tab.label}
            {activeTab === tab.id && (
              <span className="absolute bottom-0 left-0 w-full h-0.5 bg-teal-600 rounded-t-full" />
            )}
          </button>
        ))}
      </div>

      {/* Appointment List */}
      <div className="space-y-4">
        {filtered.length === 0 ? (
          <div className="text-center py-16 bg-white border border-slate-100 rounded-xl">
            <Calendar className="w-12 h-12 text-slate-300 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-slate-900">No {activeTab} appointments</h3>
            <p className="text-slate-500 mt-1">You don't have any appointments in this category.</p>
          </div>
        ) : (
          filtered.map(apt => (
            <Card key={apt.id} className="border-slate-200 hover:border-teal-200 transition-colors shadow-sm overflow-hidden group">
              <div className="flex flex-col md:flex-row">
                <div className="md:w-48 bg-slate-50 p-6 flex flex-col justify-center border-r border-slate-100 md:group-hover:bg-teal-50/50 transition-colors">
                  <div className="text-center">
                    <p className="text-sm font-semibold text-slate-500 uppercase tracking-widest">{apt.date.split(' ')[0]}</p>
                    <p className="text-3xl font-bold text-slate-900 my-1">{apt.date.split(' ')[1].replace(',', '')}</p>
                    <p className="text-sm font-medium text-slate-500">{apt.date.split(' ')[2]}</p>
                  </div>
                </div>
                <CardContent className="p-6 flex-1 flex flex-col md:flex-row md:items-center justify-between gap-6">
                  <div className="space-y-3">
                    <div>
                      <h3 className="text-xl font-bold text-slate-900">{apt.doctor}</h3>
                      <p className="text-teal-600 font-medium">{apt.specialty}</p>
                    </div>
                    <div className="flex flex-wrap gap-4 text-sm text-slate-600">
                      <span className="flex items-center gap-1.5"><Clock className="w-4 h-4 text-slate-400" /> {apt.time}</span>
                      <span className="flex items-center gap-1.5"><MapPin className="w-4 h-4 text-slate-400" /> {apt.hospital}</span>
                      {apt.status === 'upcoming' && (
                        <span className="flex items-center gap-1.5 font-semibold text-amber-600 bg-amber-50 px-2.5 py-0.5 rounded-full">
                          Token #{apt.token}
                        </span>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center gap-3 md:flex-col md:items-end">
                    {apt.status === 'upcoming' ? (
                      <>
                        <Button variant="outline" className="text-red-600 hover:text-red-700 hover:bg-red-50 border-red-200" size="sm">
                          <XCircle className="w-4 h-4 mr-2" /> Cancel
                        </Button>
                        <Button className="bg-teal-600 hover:bg-teal-700" size="sm">
                          Tracker <ChevronRight className="w-4 h-4 ml-1" />
                        </Button>
                      </>
                    ) : (
                      <Button variant="outline" size="sm">
                        View Summary
                      </Button>
                    )}
                  </div>
                </CardContent>
              </div>
            </Card>
          ))
        )}
      </div>
    </div>
  );
}
