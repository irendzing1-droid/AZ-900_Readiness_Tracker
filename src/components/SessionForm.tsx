import { useState } from 'react';
import { supabase } from '@/lib/supabase';
import type { WeakestDomain, PracticeSessionInsert } from '@/types/database';
import { CheckCircle2, Loader2, Plus, Calendar, Target, TrendingDown } from 'lucide-react';

const DOMAINS: WeakestDomain[] = [
  'Cloud Concepts',
  'Core Azure Services',
  'Management & Governance',
  'N/A',
];

export default function SessionForm({ onSaved }: { onSaved: () => void }) {
  const [testDate, setTestDate] = useState('');
  const [score, setScore] = useState('');
  const [weakestDomain, setWeakestDomain] = useState<WeakestDomain>('N/A');
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(false);

    const scoreNum = parseInt(score, 10);
    if (isNaN(scoreNum) || scoreNum < 0 || scoreNum > 1000) {
      setError('Score must be a number between 0 and 1000.');
      return;
    }
    if (!testDate) {
      setError('Please pick a test date.');
      return;
    }

    const insert: PracticeSessionInsert = {
      test_date: testDate,
      score: scoreNum,
      weakest_domain: weakestDomain,
    };

    setSubmitting(true);
    const { error: insertError } = await supabase.from('practice_sessions').insert(insert);
    setSubmitting(false);

    if (insertError) {
      setError(insertError.message);
      return;
    }

    setSuccess(true);
    setTestDate('');
    setScore('');
    setWeakestDomain('N/A');
    onSaved();
    setTimeout(() => setSuccess(false), 4000);
  };

  return (
    <div className="bg-slate-900/80 backdrop-blur rounded-2xl border border-slate-800 p-6 shadow-xl">
      <div className="flex items-center gap-2 mb-5">
        <Plus className="w-5 h-5 text-sky-400" />
        <h2 className="text-lg font-semibold text-white">Log a Practice Session</h2>
      </div>

      {success && (
        <div className="mb-4 flex items-center gap-2 text-sm text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 rounded-lg px-4 py-3 animate-in fade-in duration-300">
          <CheckCircle2 className="w-4 h-4 flex-shrink-0" />
          Session saved successfully! Your readiness stats have been updated.
        </div>
      )}

      {error && (
        <div className="mb-4 text-sm text-red-400 bg-red-500/10 border border-red-500/20 rounded-lg px-4 py-3">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="flex items-center gap-1.5 text-sm font-medium text-slate-300 mb-1.5">
            <Calendar className="w-3.5 h-3.5" /> Test Date
          </label>
          <input
            type="date"
            required
            value={testDate}
            onChange={(e) => setTestDate(e.target.value)}
            className="w-full px-4 py-2.5 bg-slate-800/60 border border-slate-700 rounded-lg text-white focus:border-sky-500 focus:ring-1 focus:ring-sky-500 outline-none transition"
          />
        </div>

        <div>
          <label className="flex items-center gap-1.5 text-sm font-medium text-slate-300 mb-1.5">
            <Target className="w-3.5 h-3.5" /> Score (0–1000)
          </label>
          <input
            type="number"
            min={0}
            max={1000}
            required
            value={score}
            onChange={(e) => setScore(e.target.value)}
            className="w-full px-4 py-2.5 bg-slate-800/60 border border-slate-700 rounded-lg text-white placeholder-slate-500 focus:border-sky-500 focus:ring-1 focus:ring-sky-500 outline-none transition"
            placeholder="e.g. 720"
          />
        </div>

        <div>
          <label className="flex items-center gap-1.5 text-sm font-medium text-slate-300 mb-1.5">
            <TrendingDown className="w-3.5 h-3.5" /> Weakest Domain
          </label>
          <select
            value={weakestDomain}
            onChange={(e) => setWeakestDomain(e.target.value as WeakestDomain)}
            className="w-full px-4 py-2.5 bg-slate-800/60 border border-slate-700 rounded-lg text-white focus:border-sky-500 focus:ring-1 focus:ring-sky-500 outline-none transition"
          >
            {DOMAINS.map((d) => (
              <option key={d} value={d}>{d}</option>
            ))}
          </select>
        </div>

        <button
          type="submit"
          disabled={submitting}
          className="w-full py-2.5 bg-sky-600 hover:bg-sky-500 text-white font-medium rounded-lg transition flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {submitting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Plus className="w-4 h-4" />}
          Save Session
        </button>
      </form>
    </div>
  );
}
