import React, { useState, useMemo } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, AreaChart, Area } from 'recharts';
import { Activity, Columns, TrendingUp, Calendar } from 'lucide-react';

interface ScanResult {
  id: string;
  profileId: string;
  date: string;
  image: string;
  analysis: string;
  metrics?: {
    redness: number | null;
    intensity: number | null;
    estimatedSizeMm: number | null;
  };
}

type DateRange = '7d' | '30d' | '90d' | 'all';

export const TrendCharts = ({ history }: { history: ScanResult[] }) => {
  const [range, setRange] = useState<DateRange>('all');

  const filteredHistory = useMemo(() => {
    if (range === 'all') return history;
    const now = new Date();
    const cutoff = new Date();
    if (range === '7d') cutoff.setDate(now.getDate() - 7);
    else if (range === '30d') cutoff.setDate(now.getDate() - 30);
    else if (range === '90d') cutoff.setDate(now.getDate() - 90);
    return history.filter(scan => new Date(scan.date) >= cutoff);
  }, [history, range]);

  const data = [...filteredHistory]
    .filter(scan => scan.metrics)
    .reverse()
    .map(scan => ({
      date: new Date(scan.date).toLocaleDateString(undefined, { month: 'short', day: 'numeric' }),
      redness: scan.metrics?.redness || 0,
      intensity: scan.metrics?.intensity || 0,
      size: scan.metrics?.estimatedSizeMm || 0,
    }));

  if (history.length < 2) {
    return (
      <div className="wellness-card p-6 text-center py-12">
        <Activity size={32} className="mx-auto text-wellness-soft mb-4 opacity-50" />
        <h3 className="font-serif text-lg text-wellness-ink">Not enough data for trends</h3>
        <p className="text-wellness-ink/60 text-sm mt-1">Perform more scans to see your skin health trends over time.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between px-2">
        <div className="flex items-center gap-2 text-wellness-ink/50">
          <Calendar size={16} />
          <span className="text-[10px] font-bold uppercase tracking-widest">Time Range</span>
        </div>
        <div className="flex bg-wellness-soft p-1 rounded-xl border border-wellness-ink/5">
          {(['7d', '30d', '90d', 'all'] as DateRange[]).map((r) => (
            <button
              key={r}
              onClick={() => setRange(r)}
              className={`px-3 py-1 rounded-lg text-[10px] font-bold transition-all ${
                range === r 
                  ? 'bg-white text-wellness-accent shadow-sm' 
                  : 'text-wellness-ink/40 hover:text-wellness-ink/70'
              }`}
            >
              {r === 'all' ? 'All' : r.toUpperCase()}
            </button>
          ))}
        </div>
      </div>

      {data.length < 2 ? (
        <div className="wellness-card p-8 text-center border-dashed">
          <p className="text-sm text-wellness-ink/50">No data points found for this period.</p>
        </div>
      ) : (
        <>
          <div className="wellness-card p-6">
            <h3 className="font-serif text-xl text-wellness-ink mb-6 flex items-center gap-2">
              <Activity size={20} className="text-wellness-accent" />
              Redness & Intensity Trends
            </h3>
            <div className="h-64 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={data}>
                  <defs>
                    <linearGradient id="colorRedness" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#D97706" stopOpacity={0.1}/>
                      <stop offset="95%" stopColor="#D97706" stopOpacity={0}/>
                    </linearGradient>
                    <linearGradient id="colorIntensity" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#164A41" stopOpacity={0.1}/>
                      <stop offset="95%" stopColor="#164A41" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(22, 74, 65, 0.05)" />
                  <XAxis dataKey="date" axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: '#164A41', opacity: 0.5 }} />
                  <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: '#164A41', opacity: 0.5 }} />
                  <Tooltip 
                    contentStyle={{ backgroundColor: '#F4F1EA', borderRadius: '16px', border: '1px solid rgba(22, 74, 65, 0.1)', boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)' }}
                  />
                  <Area type="monotone" dataKey="redness" stroke="#D97706" fillOpacity={1} fill="url(#colorRedness)" strokeWidth={2} />
                  <Area type="monotone" dataKey="intensity" stroke="#164A41" fillOpacity={1} fill="url(#colorIntensity)" strokeWidth={2} />
                </AreaChart>
              </ResponsiveContainer>
            </div>
            <div className="flex justify-center gap-6 mt-4">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-[#D97706]"></div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-wellness-ink/60">Redness</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-[#164A41]"></div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-wellness-ink/60">Intensity</span>
              </div>
            </div>
          </div>

          <div className="wellness-card p-6">
            <h3 className="font-serif text-xl text-wellness-ink mb-6 flex items-center gap-2">
              <Columns size={20} className="text-wellness-accent" />
              Estimated Lesion Size (mm)
            </h3>
            <div className="h-64 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={data}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(22, 74, 65, 0.05)" />
                  <XAxis dataKey="date" axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: '#164A41', opacity: 0.5 }} />
                  <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: '#164A41', opacity: 0.5 }} />
                  <Tooltip 
                    contentStyle={{ backgroundColor: '#F4F1EA', borderRadius: '16px', border: '1px solid rgba(22, 74, 65, 0.1)', boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)' }}
                  />
                  <Line type="monotone" dataKey="size" stroke="#164A41" strokeWidth={3} dot={{ r: 4, fill: '#164A41', strokeWidth: 2, stroke: '#fff' }} activeDot={{ r: 6 }} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export const ConditionTrendChart = ({ history, condition }: { history: ScanResult[], condition: string }) => {
  const [range, setRange] = useState<DateRange>('all');

  const filteredHistory = useMemo(() => {
    if (range === 'all') return history;
    const now = new Date();
    const cutoff = new Date();
    if (range === '7d') cutoff.setDate(now.getDate() - 7);
    else if (range === '30d') cutoff.setDate(now.getDate() - 30);
    else if (range === '90d') cutoff.setDate(now.getDate() - 90);
    return history.filter(scan => new Date(scan.date) >= cutoff);
  }, [history, range]);

  const data = [...filteredHistory]
    .filter(scan => {
      const match = scan.analysis.match(/\*\*Primary Condition\*\*:\s*(.*)/i);
      const scanCondition = match ? match[1].trim() : "";
      return scanCondition.toLowerCase() === condition.toLowerCase() && scan.metrics;
    })
    .reverse()
    .map(scan => ({
      date: new Date(scan.date).toLocaleDateString(undefined, { month: 'short', day: 'numeric' }),
      redness: scan.metrics?.redness || 0,
      intensity: scan.metrics?.intensity || 0,
      size: scan.metrics?.estimatedSizeMm || 0,
    }));

  if (history.filter(scan => {
    const match = scan.analysis.match(/\*\*Primary Condition\*\*:\s*(.*)/i);
    const scanCondition = match ? match[1].trim() : "";
    return scanCondition.toLowerCase() === condition.toLowerCase();
  }).length < 2) return null;

  return (
    <div className="bg-wellness-soft/50 rounded-3xl p-6 border border-wellness-ink/5 space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="font-serif text-lg text-wellness-ink flex items-center gap-2">
          <TrendingUp size={18} className="text-wellness-accent" />
          Progress Tracking
        </h3>
        <div className="flex bg-wellness-ink/5 p-0.5 rounded-lg">
          {(['7d', '30d', 'all'] as DateRange[]).map((r) => (
            <button
              key={r}
              onClick={() => setRange(r)}
              className={`px-2 py-0.5 rounded-md text-[8px] font-bold transition-all ${
                range === r 
                  ? 'bg-white text-wellness-accent shadow-sm' 
                  : 'text-wellness-ink/40'
              }`}
            >
              {r === 'all' ? 'All' : r.toUpperCase()}
            </button>
          ))}
        </div>
      </div>
      
      {data.length < 2 ? (
        <div className="h-40 flex items-center justify-center text-center p-4 border border-dashed border-wellness-ink/10 rounded-2xl">
          <p className="text-[10px] text-wellness-ink/40">No data for this period.</p>
        </div>
      ) : (
        <div className="h-40 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={data}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(22, 74, 65, 0.05)" />
              <XAxis dataKey="date" hide />
              <YAxis hide domain={['auto', 'auto']} />
              <Tooltip 
                contentStyle={{ backgroundColor: '#F4F1EA', borderRadius: '8px', border: '1px solid rgba(22, 74, 65, 0.1)', fontSize: '10px' }}
              />
              <Line type="monotone" dataKey="redness" stroke="#D97706" strokeWidth={2} dot={{ r: 3 }} />
              <Line type="monotone" dataKey="intensity" stroke="#164A41" strokeWidth={2} dot={{ r: 3 }} />
              <Line type="monotone" dataKey="size" stroke="#164A41" strokeWidth={2} dot={{ r: 3 }} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      )}
      
      <div className="flex justify-center gap-4">
        <div className="flex items-center gap-1.5">
          <div className="w-2 h-2 rounded-full bg-[#D97706]"></div>
          <span className="text-[9px] font-bold text-wellness-ink/40 uppercase tracking-wider">Redness</span>
        </div>
        <div className="flex items-center gap-1.5">
          <div className="w-2 h-2 rounded-full bg-[#164A41]"></div>
          <span className="text-[9px] font-bold text-wellness-ink/40 uppercase tracking-wider">Intensity</span>
        </div>
        <div className="flex items-center gap-1.5">
          <div className="w-2 h-2 rounded-full bg-[#164A41] opacity-50"></div>
          <span className="text-[9px] font-bold text-wellness-ink/40 uppercase tracking-wider">Size</span>
        </div>
      </div>
    </div>
  );
};
