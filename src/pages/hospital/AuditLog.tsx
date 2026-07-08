import { useState, useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { ScrollText, Search, Filter, Loader2, ChevronLeft, ChevronRight } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { useAuthStore } from '@/store/authStore';

const ACTION_BADGE: Record<string, string> = {
  insert: 'bg-green-100 text-green-700',
  update: 'bg-blue-100 text-blue-700',
  delete: 'bg-red-100 text-red-700',
  login: 'bg-teal-100 text-teal-700',
  logout: 'bg-slate-100 text-slate-600',
};

export default function AuditLog() {
  const { profile } = useAuthStore();
  const [logs, setLogs] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [actionFilter, setActionFilter] = useState('all');
  const [tableFilter, setTableFilter] = useState('');
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');
  const [page, setPage] = useState(0);
  const [totalCount, setTotalCount] = useState(0);
  const PAGE_SIZE = 25;

  const fetchLogs = async (pageIndex = 0) => {
    if (!profile?.id) return;
    setIsLoading(true);
    try {
      const { data: hospData } = await supabase.from('hospitals').select('id').eq('profile_id', profile.id).single();
      if (!hospData) return;

      let query = supabase
        .from('audit_logs')
        .select('id, action, table_name, record_id, actor_id, actor_role, ip_address, created_at, old_data, new_data, user_profiles:actor_id (full_name)', { count: 'exact' })
        .eq('hospital_id', hospData.id)
        .order('created_at', { ascending: false })
        .range(pageIndex * PAGE_SIZE, (pageIndex + 1) * PAGE_SIZE - 1);

      if (actionFilter !== 'all') query = query.eq('action', actionFilter);
      if (tableFilter) query = query.ilike('table_name', `%${tableFilter}%`);
      if (dateFrom) query = query.gte('created_at', dateFrom);
      if (dateTo) query = query.lte('created_at', dateTo + 'T23:59:59');

      const { data, count } = await query;
      setLogs(data || []);
      setTotalCount(count || 0);
      setPage(pageIndex);
    } catch (err) {
      console.error('Audit log error:', err);
      setLogs([]);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => { fetchLogs(0); }, [profile?.id, actionFilter, tableFilter, dateFrom, dateTo]);

  const filtered = logs.filter(l =>
    !search || 
    (l.user_profiles?.full_name || '').toLowerCase().includes(search.toLowerCase()) ||
    (l.table_name || '').toLowerCase().includes(search.toLowerCase()) ||
    (l.action || '').toLowerCase().includes(search.toLowerCase())
  );

  const totalPages = Math.ceil(totalCount / PAGE_SIZE);
  const formatDate = (d: string) => new Date(d).toLocaleString('en-US', { month: 'short', day: 'numeric', year: 'numeric', hour: '2-digit', minute: '2-digit' });

  return (
    <div className="max-w-6xl mx-auto space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-slate-900">Audit Log</h1>
        <p className="text-slate-500 mt-1">Track all system actions and changes</p>
      </div>

      {/* Filters */}
      <Card className="border-slate-200 shadow-sm">
        <CardContent className="p-5">
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4" />
              <Input placeholder="Search actor or table..." className="pl-9 bg-slate-50" value={search} onChange={e => setSearch(e.target.value)} />
            </div>
            <div>
              <select className="w-full h-10 px-3 border border-slate-200 rounded-lg bg-slate-50 focus:outline-none focus:ring-2 focus:ring-teal-500 text-sm"
                value={actionFilter} onChange={e => setActionFilter(e.target.value)}>
                <option value="all">All Actions</option>
                {['insert', 'update', 'delete', 'login', 'logout'].map(a => (
                  <option key={a} value={a}>{a.charAt(0).toUpperCase() + a.slice(1)}</option>
                ))}
              </select>
            </div>
            <div>
              <Input placeholder="Filter by table..." className="bg-slate-50" value={tableFilter} onChange={e => setTableFilter(e.target.value)} />
            </div>
            <div className="flex gap-2">
              <input type="date" className="flex-1 h-10 px-3 border border-slate-200 rounded-lg bg-slate-50 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500"
                value={dateFrom} onChange={e => setDateFrom(e.target.value)} placeholder="From" />
              <input type="date" className="flex-1 h-10 px-3 border border-slate-200 rounded-lg bg-slate-50 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500"
                value={dateTo} onChange={e => setDateTo(e.target.value)} placeholder="To" />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Total count */}
      <div className="flex items-center justify-between text-sm text-slate-500">
        <span>{totalCount.toLocaleString()} total entries</span>
        <span>Page {page + 1} of {totalPages || 1}</span>
      </div>

      {isLoading ? (
        <div className="flex justify-center py-16"><Loader2 className="w-10 h-10 animate-spin text-teal-600" /></div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-16 bg-white border border-slate-100 rounded-xl">
          <ScrollText className="w-12 h-12 text-slate-300 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-slate-700">No Audit Records</h3>
          <p className="text-slate-500 text-sm mt-1">Audit entries will appear as actions are performed</p>
        </div>
      ) : (
        <div className="overflow-x-auto rounded-xl border border-slate-200 shadow-sm bg-white">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-slate-100 bg-slate-50">
                {['Timestamp', 'Actor', 'Action', 'Table', 'Record ID', 'Role', 'IP'].map(h => (
                  <th key={h} className="text-left px-4 py-3 font-semibold text-slate-600 text-xs uppercase tracking-wider">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filtered.map(log => (
                <tr key={log.id} className="hover:bg-slate-50 transition-colors">
                  <td className="px-4 py-3 text-slate-600 whitespace-nowrap text-xs">{formatDate(log.created_at)}</td>
                  <td className="px-4 py-3 font-medium text-slate-900">{log.user_profiles?.full_name || log.actor_id?.slice(0, 8) + '...' || 'System'}</td>
                  <td className="px-4 py-3">
                    <span className={`text-xs font-semibold px-2 py-1 rounded-md capitalize ${ACTION_BADGE[log.action] || 'bg-slate-100 text-slate-600'}`}>
                      {log.action}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-slate-600 font-mono text-xs">{log.table_name}</td>
                  <td className="px-4 py-3 text-slate-400 font-mono text-xs truncate max-w-[100px]">{log.record_id}</td>
                  <td className="px-4 py-3 text-slate-500 capitalize text-xs">{log.actor_role || '—'}</td>
                  <td className="px-4 py-3 text-slate-400 font-mono text-xs">{log.ip_address || '—'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-4">
          <Button variant="outline" size="sm" onClick={() => fetchLogs(page - 1)} disabled={page === 0 || isLoading} className="gap-1">
            <ChevronLeft className="w-4 h-4" /> Previous
          </Button>
          <span className="text-sm text-slate-600 font-medium">Page {page + 1} / {totalPages}</span>
          <Button variant="outline" size="sm" onClick={() => fetchLogs(page + 1)} disabled={page >= totalPages - 1 || isLoading} className="gap-1">
            Next <ChevronRight className="w-4 h-4" />
          </Button>
        </div>
      )}
    </div>
  );
}
