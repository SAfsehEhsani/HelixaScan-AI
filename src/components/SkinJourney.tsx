import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { ChevronRight, TrendingUp, Info, Loader2, CheckCircle2, AlertCircle, ArrowRight, History } from 'lucide-react';
import { compareScans } from '../services/gemini.ts';

interface ScanResult {
  id: string;
  profileId: string;
  userId: string;
  date: string;
  image: string;
  analysis: string;
  metrics?: {
    redness: number | null;
    intensity: number | null;
    estimatedSizeMm: number | null;
  };
}

interface ComparisonResult {
  healingScore: number;
  summary: string;
  improvements: string[];
  concerns: string[];
  nextSteps: string;
}

interface SkinJourneyProps {
  history: ScanResult[];
  language: string;
  initialSelectedIds?: string[];
}

export const SkinJourney: React.FC<SkinJourneyProps> = ({ history, language, initialSelectedIds = [] }) => {
  const [selectedIds, setSelectedIds] = useState<string[]>(initialSelectedIds);
  const [comparison, setComparison] = useState<ComparisonResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSelect = (id: string) => {
    if (selectedIds.includes(id)) {
      setSelectedIds(selectedIds.filter(i => i !== id));
    } else if (selectedIds.length < 2) {
      setSelectedIds([...selectedIds, id]);
    }
  };

  const runComparison = async () => {
    if (selectedIds.length !== 2) return;
    
    setLoading(true);
    setError(null);
    try {
      const scan1 = history.find(h => h.id === selectedIds[0])!;
      const scan2 = history.find(h => h.id === selectedIds[1])!;
      
      // Ensure scan1 is the earlier one
      const [earlier, later] = new Date(scan1.date) < new Date(scan2.date) 
        ? [scan1, scan2] 
        : [scan2, scan1];

      const result = await compareScans(earlier, later, language);
      setComparison(result);
    } catch (err) {
      console.error("Comparison error:", err);
      setError("Failed to analyze progress. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const getScoreColor = (score: number) => {
    if (score >= 70) return 'text-emerald-500';
    if (score >= 40) return 'text-amber-500';
    return 'text-rose-500';
  };

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <p className="section-label">Healing Timeline</p>
          <h3 className="text-3xl font-serif font-medium text-wellness-ink">Skin Journey</h3>
        </div>
        <div className="w-12 h-12 bg-wellness-accent/10 text-wellness-accent rounded-2xl flex items-center justify-center">
          <History size={24} />
        </div>
      </div>

      {!comparison && !loading && (
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="wellness-card p-8"
        >
          <div className="flex items-center gap-4 mb-8">
            <div className="w-10 h-10 bg-wellness-soft rounded-xl flex items-center justify-center text-wellness-accent">
              <Info size={20} />
            </div>
            <p className="text-sm text-wellness-ink/60 leading-relaxed">
              Select two scans from your history to analyze your healing progress and calculate your **Healing Score**.
            </p>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 mb-8">
            {history.slice(0, 6).map((item) => (
              <button
                key={item.id}
                onClick={() => handleSelect(item.id)}
                className={`relative aspect-square rounded-3xl overflow-hidden border-2 transition-all ${
                  selectedIds.includes(item.id) 
                    ? 'border-wellness-accent ring-4 ring-wellness-accent/10' 
                    : 'border-transparent hover:border-wellness-ink/10'
                }`}
              >
                <img src={item.image} alt="Scan" className="w-full h-full object-cover" />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent flex items-end p-3">
                  <span className="text-[10px] text-white font-bold">{new Date(item.date).toLocaleDateString()}</span>
                </div>
                {selectedIds.includes(item.id) && (
                  <div className="absolute top-2 right-2 w-6 h-6 bg-wellness-accent rounded-full flex items-center justify-center text-white shadow-lg">
                    <CheckCircle2 size={14} />
                  </div>
                )}
              </button>
            ))}
          </div>

          <button
            onClick={runComparison}
            disabled={selectedIds.length !== 2}
            className="w-full bg-wellness-ink text-white py-4 rounded-2xl font-bold flex items-center justify-center gap-3 hover:bg-wellness-ink/90 transition-all disabled:opacity-30 disabled:cursor-not-allowed shadow-xl shadow-wellness-ink/10"
          >
            <TrendingUp size={20} className="text-wellness-accent" />
            Analyze Progress
          </button>
        </motion.div>
      )}

      {loading && (
        <div className="wellness-card p-20 flex flex-col items-center justify-center text-center">
          <Loader2 className="animate-spin text-wellness-accent mb-6" size={48} />
          <h4 className="text-2xl font-serif text-wellness-ink mb-2">Calculating Healing Score</h4>
          <p className="text-sm text-wellness-ink/50 italic">AI is comparing pixel-level changes in your skin...</p>
        </div>
      )}

      {error && (
        <div className="bg-rose-50 border border-rose-100 p-6 rounded-3xl flex gap-4 items-center">
          <AlertCircle className="text-rose-500 shrink-0" />
          <p className="text-sm text-rose-800 font-medium">{error}</p>
          <button onClick={runComparison} className="ml-auto underline font-bold text-rose-600">Retry</button>
        </div>
      )}

      <AnimatePresence>
        {comparison && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="space-y-8"
          >
            <div className="grid grid-cols-2 gap-4">
              {selectedIds.map((id, index) => (
                <div key={id} className="space-y-2">
                  <p className="text-[10px] font-bold uppercase tracking-widest text-wellness-ink/40">
                    {index === 0 ? 'Initial Scan' : 'Current Scan'}
                  </p>
                  <div className="aspect-[4/3] rounded-3xl overflow-hidden border border-wellness-ink/5 shadow-sm">
                    <img src={history.find(h => h.id === id)?.image} alt="Scan" className="w-full h-full object-cover" />
                  </div>
                </div>
              ))}
            </div>

            <div className="wellness-card p-10 relative overflow-hidden">
              <div className="absolute top-0 right-0 w-32 h-32 bg-wellness-accent/5 rounded-bl-[100px]" />
              
              <div className="flex items-center gap-8 mb-10">
                <div className="relative">
                  <svg className="w-24 h-24 transform -rotate-90">
                    <circle
                      cx="48"
                      cy="48"
                      r="42"
                      stroke="currentColor"
                      strokeWidth="8"
                      fill="transparent"
                      className="text-wellness-soft"
                    />
                    <motion.circle
                      cx="48"
                      cy="48"
                      r="42"
                      stroke="currentColor"
                      strokeWidth="8"
                      fill="transparent"
                      strokeDasharray={264}
                      initial={{ strokeDashoffset: 264 }}
                      animate={{ strokeDashoffset: 264 - (264 * comparison.healingScore) / 100 }}
                      className={getScoreColor(comparison.healingScore)}
                    />
                  </svg>
                  <div className="absolute inset-0 flex items-center justify-center">
                    <span className={`text-2xl font-black ${getScoreColor(comparison.healingScore)}`}>
                      {comparison.healingScore}%
                    </span>
                  </div>
                </div>
                <div>
                  <h4 className="text-3xl font-serif text-wellness-ink">Healing Score</h4>
                  <p className="text-sm text-wellness-ink/50 mt-1">Based on AI visual analysis</p>
                </div>
              </div>

              <div className="space-y-8">
                <div>
                  <h5 className="text-xs font-bold uppercase tracking-widest text-wellness-accent mb-3">Progress Summary</h5>
                  <p className="text-base text-wellness-ink/70 leading-relaxed font-serif italic">
                    "{comparison.summary}"
                  </p>
                </div>

                <div className="grid sm:grid-cols-2 gap-8">
                  <div className="space-y-4">
                    <h5 className="text-xs font-bold uppercase tracking-widest text-emerald-600">Key Improvements</h5>
                    <ul className="space-y-3">
                      {comparison.improvements.map((imp, i) => (
                        <li key={i} className="flex gap-3 text-sm text-wellness-ink/70">
                          <CheckCircle2 size={18} className="text-emerald-500 shrink-0" />
                          <span>{imp}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                  <div className="space-y-4">
                    <h5 className="text-xs font-bold uppercase tracking-widest text-rose-600">Remaining Concerns</h5>
                    <ul className="space-y-3">
                      {comparison.concerns.map((con, i) => (
                        <li key={i} className="flex gap-3 text-sm text-wellness-ink/70">
                          <AlertCircle size={18} className="text-rose-500 shrink-0" />
                          <span>{con}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>

                <div className="bg-wellness-ink text-white p-8 rounded-[2.5rem] flex items-start gap-6">
                  <div className="w-12 h-12 bg-wellness-accent rounded-2xl flex items-center justify-center shrink-0">
                    <ArrowRight size={24} />
                  </div>
                  <div>
                    <h5 className="text-sm font-bold uppercase tracking-widest text-wellness-accent mb-2">Next Steps</h5>
                    <p className="text-sm text-white/80 leading-relaxed">
                      {comparison.nextSteps}
                    </p>
                  </div>
                </div>
              </div>

              <button
                onClick={() => setComparison(null)}
                className="w-full mt-10 text-sm font-bold text-wellness-ink/40 hover:text-wellness-accent transition-colors uppercase tracking-widest"
              >
                Reset Comparison
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
