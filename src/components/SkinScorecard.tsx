import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Activity, TrendingUp, TrendingDown, Minus, Loader2, Info, CheckCircle2, AlertCircle, RefreshCw } from 'lucide-react';
import { getSkinHealthScore } from '../services/gemini';

interface SkinScorecardProps {
  history: any[];
  language: string;
}

export const SkinScorecard: React.FC<SkinScorecardProps> = ({ history, language }) => {
  const [scoreData, setScoreData] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchScore = async () => {
    if (history.length === 0) return;
    setIsLoading(true);
    setError(null);
    try {
      const data = await getSkinHealthScore(history, language);
      setScoreData(data);
    } catch (err) {
      setError("Failed to calculate score. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchScore();
  }, [history.length]);

  if (history.length === 0) {
    return (
      <div className="wellness-card p-8 border-wellness-ink/5 text-center space-y-4">
        <div className="p-4 bg-wellness-soft rounded-full w-16 h-16 mx-auto flex items-center justify-center text-wellness-ink/20">
          <Activity size={32} />
        </div>
        <div>
          <h4 className="text-xl font-serif text-wellness-ink">No Scan History</h4>
          <p className="text-sm text-wellness-ink/40">Complete your first scan to generate a skin health scorecard.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="wellness-card p-8 border-wellness-ink/5 relative overflow-hidden">
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-4">
          <div className="p-3 bg-wellness-accent/10 rounded-2xl text-wellness-accent">
            <Activity size={24} />
          </div>
          <div>
            <h3 className="text-xl font-serif text-wellness-ink">Skin Health Scorecard</h3>
            <p className="text-xs text-wellness-ink/40 uppercase tracking-widest font-bold">AI Health Analysis</p>
          </div>
        </div>
        <button 
          onClick={fetchScore}
          disabled={isLoading}
          className="p-2 hover:bg-wellness-soft rounded-full transition-colors text-wellness-ink/30 disabled:opacity-50"
        >
          <RefreshCw size={20} className={isLoading ? 'animate-spin' : ''} />
        </button>
      </div>

      {isLoading ? (
        <div className="py-12 flex flex-col items-center justify-center text-center space-y-4">
          <Loader2 size={48} className="animate-spin text-wellness-accent" />
          <p className="text-sm text-wellness-ink/40 italic">Calculating your skin health score...</p>
        </div>
      ) : scoreData ? (
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="space-y-8"
        >
          <div className="flex flex-col items-center justify-center text-center py-4">
            <div className="relative w-40 h-40 flex items-center justify-center">
              <svg className="w-full h-full transform -rotate-90">
                <circle
                  cx="80"
                  cy="80"
                  r="70"
                  stroke="currentColor"
                  strokeWidth="8"
                  fill="transparent"
                  className="text-wellness-soft"
                />
                <motion.circle
                  cx="80"
                  cy="80"
                  r="70"
                  stroke="currentColor"
                  strokeWidth="8"
                  fill="transparent"
                  strokeDasharray={440}
                  initial={{ strokeDashoffset: 440 }}
                  animate={{ strokeDashoffset: 440 - (440 * scoreData.score) / 100 }}
                  transition={{ duration: 1.5, ease: "easeOut" }}
                  className={`${
                    scoreData.score >= 80 ? 'text-emerald-500' :
                    scoreData.score >= 50 ? 'text-amber-500' :
                    'text-rose-500'
                  }`}
                />
              </svg>
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <span className="text-5xl font-serif text-wellness-ink">{scoreData.score}</span>
                <span className="text-[10px] font-bold text-wellness-ink/40 uppercase tracking-widest">Score</span>
              </div>
            </div>
            <div className={`mt-6 px-6 py-2 rounded-full text-xs font-bold uppercase tracking-widest ${
              scoreData.status === 'Excellent' ? 'bg-emerald-500/10 text-emerald-500' :
              scoreData.status === 'Good' ? 'bg-emerald-500/10 text-emerald-500' :
              scoreData.status === 'Fair' ? 'bg-amber-500/10 text-amber-500' :
              'bg-rose-500/10 text-rose-500'
            }`}>
              {scoreData.status} Health
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="p-6 bg-wellness-soft rounded-[2rem] border border-wellness-ink/5">
              <h5 className="text-[10px] font-bold text-wellness-ink/40 uppercase tracking-widest mb-3 flex items-center gap-2">
                <Info size={12} /> Key Factor
              </h5>
              <p className="text-sm text-wellness-ink leading-relaxed font-medium">
                {scoreData.keyFactor}
              </p>
            </div>
            <div className="p-6 bg-wellness-accent/5 rounded-[2rem] border border-wellness-accent/10">
              <h5 className="text-[10px] font-bold text-wellness-accent uppercase tracking-widest mb-3 flex items-center gap-2">
                <TrendingUp size={12} /> Improvement Tip
              </h5>
              <p className="text-sm text-wellness-ink leading-relaxed font-medium">
                {scoreData.improvementTip}
              </p>
            </div>
          </div>
        </motion.div>
      ) : null}
    </div>
  );
};
