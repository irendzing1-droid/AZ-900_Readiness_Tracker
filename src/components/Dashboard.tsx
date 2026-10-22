import { useEffect, useState, useCallback } from 'react';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/context/AuthContext';
import type { PracticeSession } from '@/types/database';
import SessionForm from '@/components/SessionForm';
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip,
  ReferenceLine, ResponsiveContainer,
} from 'recharts';
import {
  Cloud, LogOut, AlertTriangle, CheckCircle2, Calendar,
  Trophy, BarChart3, Award, Trash2, LineChart as LineChartIcon,
} from 'lucide-react';

export default function Dashboard() {
  const { session, signOut } = useAuth();
  const [sessions, setSessions] = useState<PracticeSession[]>([]);
  const [loading, setLoading] = useState(true);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const fetchSessions = useCallback(async () => {
    const { data, error } = await supabase
      .from('practice_sessions')
      .select('*')
      .order('test_date', { ascending: false });

    if (error) {
      console.error('Failed to load sessions:', error.message);
      setSessions([]);
    } else {
      setSessions(data ?? []);
    }
    setLoading(false);
  }, []);

  useEffect(() => {
    fetchSessions();
  }, [fetchSessions]);

  const handleDelete = async (id: string) => {
    setDeletingId(id);
    const { error } = await supabase.from('practice_sessions').delete().eq('id', id);
    setDeletingId(null);
    if (!error) fetchSessions();
  };

  const avgScore = sessions.length > 0
    ? Math.round(sessions.reduce((sum, s) => sum + s.score, 0) / sessions.length)
    : 0;
  const avgPct = Math.round((avgScore / 1000) * 100);
  const isReady = avgScore >= 700;
  const bestScore = sessions.reduce((max, s) => Math.max(max, s.score), 0);

  const last5 = sessions.slice(0, 5);

  // Chart data: chronological order
  const chartData = [...sessions]
    .sort((a, b) => new Date(a.test_date).getTime() - new Date(b.test_date).getTime())
    .map((s) => ({
      date: new Date(s.test_date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
      score: s.score,
    }));

  // Weakest domain frequency (exclude N/A)
  const domainCounts = sessions.reduce<Record<string, number>>((acc, s) => {
    if (s.weakest_domain !== 'N/A') {
      acc[s.weakest_domain] = (acc[s.weakest_domain] ?? 0) + 1;
    }
    return acc;
  }, {});
  const focusArea = Object.entries(domainCounts).sort((a, b) => b[1] - a[1])[0];

  const scoreColor = (s: number) =>
    s >= 700 ? 'text-emerald-400' : s >= 500 ? 'text-amber-400' : 'text-red-400';

  const formatDate = (d: string) =>
    new Date(d).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });

  return (
    <div className="min-h-screen bg-slate-950 flex flex-col">
      {/* Header */}
      <header className="sticky top-0 z-10 bg-slate-950/90 backdrop-blur border-b border-slate-800">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="flex items-center justify-center w-10 h-10 rounded-xl bg-gradient-to-br from-sky-500 to-blue-600 shadow-lg shadow-sky-500/20 flex-shrink-0">
              <Cloud className="w-5 h-5 text-white" />
            </div>
            <div>
              <h1 className="text-sm sm:text-base font-bold text-white leading-tight">AZ-900 Readiness Tracker</h1>
              <p className="text-xs text-slate-500">Azure Fundamentals exam prep</p>
            </div>
          </div>
          <div className="flex items-center gap-2 sm:gap-3">
            <span className="text-xs sm:text-sm text-slate-400 hidden sm:inline max-w-[200px] truncate">
              {session?.user?.email}
            </span>
            <button
              onClick={signOut}
              className="flex items-center gap-1.5 text-sm text-slate-400 hover:text-white px-2.5 sm:px-3 py-2 rounded-lg hover:bg-slate-800 transition"
            >
              <LogOut className="w-4 h-4" /> <span className="hidden sm:inline">Sign Out</span>
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-5xl w-full mx-auto px-4 sm:px-6 py-8 space-y-6 flex-1">
        {/* Form */}
        <SessionForm onSaved={fetchSessions} />

        {/* Dashboard */}
        {loading ? (
          <div className="bg-slate-900/80 backdrop-blur rounded-2xl border border-slate-800 p-12 text-center text-slate-500 text-sm">
            Loading sessions…
          </div>
        ) : sessions.length === 0 ? (
          <div className="bg-slate-900/80 backdrop-blur rounded-2xl border border-slate-800 p-12 text-center">
            <Calendar className="w-10 h-10 text-slate-700 mx-auto mb-3" />
            <p className="text-slate-500 text-sm">
              No sessions yet. Log your first practice test above to start tracking your readiness!
            </p>
          </div>
        ) : (
          <div className="space-y-6">
            {/* Readiness Overview: Progress Bar + Badge */}
            <div className="bg-slate-900/80 backdrop-blur rounded-2xl border border-slate-800 p-5 sm:p-6 shadow-xl">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-5">
                <div>
                  <h2 className="text-lg font-semibold text-white">Readiness Overview</h2>
                  <p className="text-sm text-slate-500 mt-0.5">
                    Average score across {sessions.length} session{sessions.length !== 1 ? 's' : ''}
                  </p>
                </div>
                <div className={`inline-flex items-center gap-2 px-4 py-2 rounded-xl font-semibold text-sm self-start sm:self-auto ${
                  isReady
                    ? 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/30'
                    : 'bg-amber-500/15 text-amber-400 border border-amber-500/30'
                }`}>
                  {isReady
                    ? <CheckCircle2 className="w-4 h-4" />
                    : <AlertTriangle className="w-4 h-4" />}
                  {isReady ? 'Ready' : 'Needs Study'}
                </div>
              </div>

              {/* Progress Bar */}
              <div className="space-y-2">
                <div className="flex items-baseline justify-between">
                  <span className="text-3xl font-bold text-white">
                    {avgScore}
                    <span className="text-sm text-slate-500 font-normal ml-1">/ 1000</span>
                  </span>
                  <span className="text-sm text-slate-400">{avgPct}%</span>
                </div>

                <div className="relative h-6 bg-slate-800 rounded-full overflow-hidden">
                  <div
                    className={`absolute inset-y-0 left-0 rounded-full transition-all duration-700 ease-out ${
                      isReady
                        ? 'bg-gradient-to-r from-emerald-600 to-emerald-400'
                        : 'bg-gradient-to-r from-amber-600 to-amber-400'
                    }`}
                    style={{ width: `${avgPct}%` }}
                  />
                  <div className="absolute inset-y-0 z-10" style={{ left: '70%' }}>
                    <div className="w-0.5 h-full bg-white/80" />
                  </div>
                </div>

                <div className="flex justify-between text-xs text-slate-600 pt-3">
                  <span>0</span>
                  <span>700 (passing)</span>
                  <span>1000</span>
                </div>
              </div>
            </div>

            {/* Score History Line Chart — directly above session history */}
            <div className="bg-slate-900/80 backdrop-blur rounded-2xl border border-slate-800 p-5 sm:p-6 shadow-xl">
              <div className="flex items-center gap-2 mb-5">
                <LineChartIcon className="w-5 h-5 text-sky-400" />
                <h2 className="text-lg font-semibold text-white">Score History</h2>
              </div>

              <div style={{ width: '100%', height: '300px', minHeight: '300px' }}>
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart
                    data={chartData}
                    margin={{ top: 5, right: 10, left: -15, bottom: 5 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                    <XAxis
                      dataKey="date"
                      tick={{ fill: '#64748b', fontSize: 11 }}
                      tickLine={{ stroke: '#334155' }}
                      axisLine={{ stroke: '#334155' }}
                      interval="preserveStartEnd"
                    />
                    <YAxis
                      domain={[0, 1000]}
                      ticks={[0, 250, 500, 700, 1000]}
                      tick={{ fill: '#64748b', fontSize: 11 }}
                      tickLine={{ stroke: '#334155' }}
                      axisLine={{ stroke: '#334155' }}
                    />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: '#0f172a',
                        border: '1px solid #334155',
                        borderRadius: '8px',
                        fontSize: '13px',
                      }}
                      labelStyle={{ color: '#94a3b8' }}
                      itemStyle={{ color: '#e2e8f0' }}
                    />
                    <ReferenceLine
                      y={700}
                      stroke="#10b981"
                      strokeDasharray="5 5"
                      strokeWidth={1.5}
                      label={{ value: 'Pass (700)', position: 'right', fill: '#10b981', fontSize: 11 }}
                    />
                    <Line
                      type="monotone"
                      dataKey="score"
                      stroke="#0ea5e9"
                      strokeWidth={2.5}
                      dot={{ fill: '#0ea5e9', r: 4 }}
                      activeDot={{ r: 6 }}
                      name="Score"
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Focus Area + Quick Stats */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="bg-slate-900/80 backdrop-blur rounded-2xl border border-amber-500/20 p-5 shadow-xl">
                <div className="flex items-center gap-2 mb-2">
                  <AlertTriangle className="w-4 h-4 text-amber-400" />
                  <span className="text-sm text-slate-400">Focus Area</span>
                </div>
                {focusArea ? (
                  <>
                    <p className="text-base font-semibold text-white">{focusArea[0]}</p>
                    <p className="text-xs text-slate-500 mt-1">
                      Weakest in {focusArea[1]} of {sessions.length} session{sessions.length !== 1 ? 's' : ''}
                    </p>
                  </>
                ) : (
                  <p className="text-sm text-slate-500">No weak domains flagged yet.</p>
                )}
              </div>

              <div className="bg-slate-900/80 backdrop-blur rounded-2xl border border-slate-800 p-5 shadow-xl">
                <div className="flex items-center gap-2 mb-2">
                  <Trophy className="w-4 h-4 text-sky-400" />
                  <span className="text-sm text-slate-400">Best Score</span>
                </div>
                <p className={`text-2xl font-bold ${scoreColor(bestScore)}`}>
                  {bestScore}
                  <span className="text-xs text-slate-500 font-normal ml-1">/ 1000</span>
                </p>
              </div>

              <div className="bg-slate-900/80 backdrop-blur rounded-2xl border border-slate-800 p-5 shadow-xl">
                <div className="flex items-center gap-2 mb-2">
                  <BarChart3 className="w-4 h-4 text-sky-400" />
                  <span className="text-sm text-slate-400">Sessions Logged</span>
                </div>
                <p className="text-2xl font-bold text-white">{sessions.length}</p>
              </div>
            </div>

            {/* Disclaimer */}
            <footer className="border-t border-slate-800 bg-slate-950 rounded-xl">
              <p className="text-center text-xs text-slate-500 leading-relaxed px-4 py-4">
                This is an unofficial tool and is not affiliated with Microsoft. Not official AZ-900 exam content.
              </p>
            </footer>

            {/* Last 5 Attempts — Table on desktop, cards on mobile */}
            <div className="bg-slate-900/80 backdrop-blur rounded-2xl border border-slate-800 shadow-xl overflow-hidden">
              <div className="px-5 sm:px-6 py-4 border-b border-slate-800 flex items-center gap-2">
                <Award className="w-4 h-4 text-sky-400" />
                <h2 className="text-lg font-semibold text-white">Session History</h2>
                <span className="text-xs text-slate-500 ml-auto">Last 5 attempts</span>
              </div>

              {last5.length === 0 ? (
                <div className="px-6 py-10 text-center text-slate-500 text-sm">
                  No attempts recorded yet.
                </div>
              ) : (
                <>
                  {/* Desktop table */}
                  <table className="w-full hidden sm:table">
                    <thead>
                      <tr className="border-b border-slate-800">
                        <th className="text-left px-6 py-3 text-xs font-medium text-slate-500 uppercase tracking-wider">Date</th>
                        <th className="text-left px-6 py-3 text-xs font-medium text-slate-500 uppercase tracking-wider">Score</th>
                        <th className="text-left px-6 py-3 text-xs font-medium text-slate-500 uppercase tracking-wider">Weakest Domain</th>
                        <th className="text-left px-6 py-3 text-xs font-medium text-slate-500 uppercase tracking-wider">Result</th>
                        <th className="px-6 py-3"></th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-800/60">
                      {last5.map((s) => (
                        <tr key={s.id} className="hover:bg-slate-800/30 transition group">
                          <td className="px-6 py-3.5 text-sm text-slate-300">{formatDate(s.test_date)}</td>
                          <td className="px-6 py-3.5">
                            <span className={`text-sm font-semibold ${scoreColor(s.score)}`}>
                              {s.score}<span className="text-slate-600 font-normal ml-0.5">/1000</span>
                            </span>
                          </td>
                          <td className="px-6 py-3.5 text-sm text-slate-300">{s.weakest_domain}</td>
                          <td className="px-6 py-3.5">
                            {s.score >= 700 ? (
                              <span className="inline-flex items-center gap-1 text-xs text-emerald-400 bg-emerald-500/10 px-2 py-1 rounded-md">
                                <CheckCircle2 className="w-3 h-3" /> Pass
                              </span>
                            ) : (
                              <span className="inline-flex items-center gap-1 text-xs text-amber-400 bg-amber-500/10 px-2 py-1 rounded-md">
                                <AlertTriangle className="w-3 h-3" /> Below
                              </span>
                            )}
                          </td>
                          <td className="px-6 py-3.5 text-right">
                            <button
                              onClick={() => handleDelete(s.id)}
                              disabled={deletingId === s.id}
                              className="text-slate-600 hover:text-red-400 transition opacity-0 group-hover:opacity-100 disabled:opacity-30"
                              aria-label="Delete session"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>

                  {/* Mobile cards */}
                  <div className="sm:hidden divide-y divide-slate-800/60">
                    {last5.map((s) => (
                      <div key={s.id} className="px-5 py-4">
                        <div className="flex items-start justify-between gap-3 mb-2">
                          <div className="min-w-0">
                            <p className="text-sm font-medium text-white">{formatDate(s.test_date)}</p>
                            <p className="text-xs text-slate-500 mt-0.5 truncate">{s.weakest_domain}</p>
                          </div>
                          <div className="flex items-center gap-2 flex-shrink-0">
                            <span className={`text-lg font-bold ${scoreColor(s.score)}`}>
                              {s.score}
                              <span className="text-xs text-slate-600 font-normal ml-0.5">/1000</span>
                            </span>
                            <button
                              onClick={() => handleDelete(s.id)}
                              disabled={deletingId === s.id}
                              className="text-slate-600 hover:text-red-400 transition p-1 disabled:opacity-30"
                              aria-label="Delete session"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </div>
                        {s.score >= 700 ? (
                          <span className="inline-flex items-center gap-1 text-xs text-emerald-400 bg-emerald-500/10 px-2 py-1 rounded-md">
                            <CheckCircle2 className="w-3 h-3" /> Pass
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 text-xs text-amber-400 bg-amber-500/10 px-2 py-1 rounded-md">
                            <AlertTriangle className="w-3 h-3" /> Below
                          </span>
                        )}
                      </div>
                    ))}
                  </div>
                </>
              )}
            </div>
          </div>
        )}

      </main>

    </div>
  );
}
