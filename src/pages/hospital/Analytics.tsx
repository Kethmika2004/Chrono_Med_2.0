import { useState, useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { TrendingUp, Users, DollarSign, Calendar, Loader2 } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { useAuthStore } from '@/store/authStore';
import {
  AreaChart, Area, BarChart, Bar, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend
} from 'recharts';

const COLORS = ['#0D7A6B', '#F4A916', '#38bdf8', '#a78bfa', '#fb7185'];

export default function HospitalAnalytics() {
  const { profile } = useAuthStore();
  const [isLoading, setIsLoading] = useState(true);
  const [stats, setStats] = useState({ revenue: 0, totalAppts: 0, activeDoctors: 0, completedSessions: 0 });
  const [revenueData, setRevenueData] = useState<any[]>([]);
  const [specializationData, setSpecializationData] = useState<any[]>([]);
  const [utilizationData, setUtilizationData] = useState<any[]>([]);

  useEffect(() => {
    if (!profile?.id) return;
    const fetchAnalytics = async () => {
      setIsLoading(true);
      try {
        const { data: hospData } = await supabase.from('hospitals').select('id').eq('profile_id', profile.id).single();
        if (!hospData) return;

        // Appointments at this hospital
        const { data: sessData } = await supabase
          .from('sessions')
          .select(`
            id, session_date, status, max_patients, current_token, consultation_fee_lkr,
            doctors (specialty),
            appointments (id, status, fee_amount)
          `)
          .eq('hospital_id', hospData.id)
          .order('session_date', { ascending: true })
          .limit(60);

        const sessions = sessData || [];

        // Revenue per month
        const revenueByMonth: Record<string, number> = {};
        sessions.forEach(s => {
          const month = new Date(s.session_date).toLocaleDateString('en-US', { month: 'short', year: 'numeric' });
          const revenue = (s.appointments || []).reduce((sum: number, a: any) => sum + (a.fee_amount || 0), 0);
          revenueByMonth[month] = (revenueByMonth[month] || 0) + revenue;
        });
        setRevenueData(Object.entries(revenueByMonth).map(([name, value]) => ({ name, revenue: value })));

        // Specialization distribution
        const specCount: Record<string, number> = {};
        sessions.forEach(s => {
          const spec = s.doctors?.specialty || 'Other';
          specCount[spec] = (specCount[spec] || 0) + (s.appointments || []).length;
        });
        setSpecializationData(Object.entries(specCount).map(([name, value]) => ({ name, value })));

        // Utilization per session (recent 10)
        setUtilizationData(
          sessions.slice(-10).map(s => ({
            name: new Date(s.session_date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
            utilization: s.max_patients ? Math.round((s.current_token / s.max_patients) * 100) : 0,
          }))
        );

        const totalRevenue = sessions.reduce((sum, s) =>
          sum + (s.appointments || []).reduce((r: number, a: any) => r + (a.fee_amount || 0), 0), 0);
        const totalAppts = sessions.reduce((sum, s) => sum + (s.appointments || []).length, 0);
        const completedSessions = sessions.filter(s => s.status === 'completed').length;

        const { count: activeDoctors } = await supabase
          .from('doctors')
          .select('*', { count: 'exact', head: true })
          .contains('hospital_affiliations', [hospData.id])
          .eq('is_active', true);

        setStats({ revenue: totalRevenue, totalAppts, activeDoctors: activeDoctors || 0, completedSessions });
      } catch (err) {
        console.error('Analytics error:', err);
      } finally {
        setIsLoading(false);
      }
    };
    fetchAnalytics();
  }, [profile?.id]);

  const statCards = [
    { label: 'Total Revenue', value: `Rs. ${stats.revenue.toLocaleString()}`, icon: DollarSign, color: 'text-green-600', bg: 'bg-green-50' },
    { label: 'Total Appointments', value: stats.totalAppts, icon: Users, color: 'text-blue-600', bg: 'bg-blue-50' },
    { label: 'Active Doctors', value: stats.activeDoctors, icon: Calendar, color: 'text-teal-600', bg: 'bg-teal-50' },
    { label: 'Completed Sessions', value: stats.completedSessions, icon: TrendingUp, color: 'text-purple-600', bg: 'bg-purple-50' },
  ];

  if (isLoading) {
    return <div className="flex items-center justify-center py-24"><Loader2 className="w-10 h-10 animate-spin text-teal-600" /></div>;
  }

  return (
    <div className="max-w-5xl mx-auto space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-slate-900">Analytics</h1>
        <p className="text-slate-500 mt-1">Hospital performance metrics and revenue breakdown</p>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {statCards.map(card => (
          <Card key={card.label} className="border-slate-200 shadow-sm hover:shadow-md transition-shadow">
            <CardContent className="p-5">
              <div className={`w-11 h-11 rounded-xl ${card.bg} flex items-center justify-center mb-4`}>
                <card.icon className={`w-6 h-6 ${card.color}`} />
              </div>
              <p className={`text-2xl font-black ${card.color}`}>{card.value}</p>
              <p className="text-sm text-slate-500 mt-1 font-medium">{card.label}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        {/* Revenue Chart */}
        <Card className="border-slate-200 shadow-sm md:col-span-2">
          <CardContent className="p-6">
            <h3 className="font-semibold text-slate-800 mb-6 flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-teal-600" /> Monthly Revenue (LKR)
            </h3>
            <ResponsiveContainer width="100%" height={220}>
              <AreaChart data={revenueData} margin={{ top: 0, right: 10, left: 0, bottom: 0 }}>
                <defs>
                  <linearGradient id="revGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#0D7A6B" stopOpacity={0.15} />
                    <stop offset="95%" stopColor="#0D7A6B" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                <XAxis dataKey="name" tick={{ fontSize: 11 }} />
                <YAxis tick={{ fontSize: 11 }} tickFormatter={v => `${(v / 1000).toFixed(0)}k`} />
                <Tooltip formatter={(v: number) => `Rs. ${v.toLocaleString()}`} contentStyle={{ borderRadius: '12px', border: '1px solid #e2e8f0' }} />
                <Area type="monotone" dataKey="revenue" stroke="#0D7A6B" strokeWidth={2} fill="url(#revGrad)" dot={{ fill: '#0D7A6B', r: 4 }} />
              </AreaChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Utilization */}
        <Card className="border-slate-200 shadow-sm">
          <CardContent className="p-6">
            <h3 className="font-semibold text-slate-800 mb-6">Session Utilization %</h3>
            <ResponsiveContainer width="100%" height={200}>
              <BarChart data={utilizationData} margin={{ top: 0, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                <XAxis dataKey="name" tick={{ fontSize: 11 }} />
                <YAxis tick={{ fontSize: 11 }} domain={[0, 100]} tickFormatter={v => `${v}%`} />
                <Tooltip formatter={(v: number) => `${v}%`} contentStyle={{ borderRadius: '12px', border: '1px solid #e2e8f0' }} />
                <Bar dataKey="utilization" fill="#0D7A6B" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Specialization Breakdown */}
        <Card className="border-slate-200 shadow-sm">
          <CardContent className="p-6">
            <h3 className="font-semibold text-slate-800 mb-6">Patient Distribution by Specialty</h3>
            <ResponsiveContainer width="100%" height={200}>
              <PieChart>
                <Pie data={specializationData} cx="50%" cy="50%" innerRadius={50} outerRadius={80} paddingAngle={3} dataKey="value">
                  {specializationData.map((_, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip contentStyle={{ borderRadius: '12px', border: '1px solid #e2e8f0' }} />
                <Legend formatter={(v) => <span className="text-xs text-slate-600">{v}</span>} />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
