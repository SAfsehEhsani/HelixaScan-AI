import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Apple, Coffee, Moon, Sun, Wind, Loader2, Info, CheckCircle2, AlertCircle, RefreshCw, Sparkles } from 'lucide-react';
import { getLifestyleDietAdvice } from '../services/gemini';

interface LifestyleAdvisorProps {
  condition: string;
  language: string;
}

export const LifestyleAdvisor: React.FC<LifestyleAdvisorProps> = ({ condition, language }) => {
  const [advice, setAdvice] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchAdvice = async () => {
    if (!condition) return;
    setIsLoading(true);
    setError(null);
    try {
      const data = await getLifestyleDietAdvice(condition, language);
      setAdvice(data);
    } catch (err) {
      setError("Failed to fetch advice. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchAdvice();
  }, [condition]);

  if (!condition) {
    return (
      <div className="wellness-card p-8 border-wellness-ink/5 text-center space-y-4">
        <div className="p-4 bg-wellness-soft rounded-full w-16 h-16 mx-auto flex items-center justify-center text-wellness-ink/20">
          <Sparkles size={32} />
        </div>
        <div>
          <h4 className="text-xl font-serif text-wellness-ink">No Recent Scan</h4>
          <p className="text-sm text-wellness-ink/40">Complete a scan to get personalized lifestyle and diet advice.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="wellness-card p-8 border-wellness-ink/5 relative overflow-hidden">
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-4">
          <div className="p-3 bg-wellness-accent/10 rounded-2xl text-wellness-accent">
            <Sparkles size={24} />
          </div>
          <div>
            <h3 className="text-xl font-serif text-wellness-ink">Lifestyle & Diet Advisor</h3>
            <p className="text-xs text-wellness-ink/40 uppercase tracking-widest font-bold">Personalized AI Guidance</p>
          </div>
        </div>
        <button 
          onClick={fetchAdvice}
          disabled={isLoading}
          className="p-2 hover:bg-wellness-soft rounded-full transition-colors text-wellness-ink/30 disabled:opacity-50"
        >
          <RefreshCw size={20} className={isLoading ? 'animate-spin' : ''} />
        </button>
      </div>

      {isLoading ? (
        <div className="py-12 flex flex-col items-center justify-center text-center space-y-4">
          <Loader2 size={48} className="animate-spin text-wellness-accent" />
          <p className="text-sm text-wellness-ink/40 italic">Generating personalized advice for {condition}...</p>
        </div>
      ) : advice ? (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-10"
        >
          <div className="p-6 bg-wellness-soft rounded-[2rem] border border-wellness-ink/5">
            <p className="text-sm text-wellness-ink leading-relaxed font-medium italic">
              "{advice.summary}"
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="space-y-6">
              <h4 className="text-xs font-bold text-wellness-ink/40 uppercase tracking-widest flex items-center gap-2">
                <Apple size={14} /> Dietary Recommendations
              </h4>
              <div className="space-y-4">
                <div className="p-4 bg-emerald-500/5 rounded-2xl border border-emerald-500/10">
                  <h5 className="text-[10px] font-bold text-emerald-500 uppercase tracking-widest mb-2">Foods to Eat</h5>
                  <ul className="space-y-1">
                    {advice.diet.eat.map((item: string) => (
                      <li key={item} className="text-xs text-wellness-ink flex items-center gap-2">
                        <div className="w-1 h-1 bg-emerald-500 rounded-full" /> {item}
                      </li>
                    ))}
                  </ul>
                </div>
                <div className="p-4 bg-rose-500/5 rounded-2xl border border-rose-500/10">
                  <h5 className="text-[10px] font-bold text-rose-500 uppercase tracking-widest mb-2">Foods to Avoid</h5>
                  <ul className="space-y-1">
                    {advice.diet.avoid.map((item: string) => (
                      <li key={item} className="text-xs text-wellness-ink flex items-center gap-2">
                        <div className="w-1 h-1 bg-rose-500 rounded-full" /> {item}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>

            <div className="space-y-6">
              <h4 className="text-xs font-bold text-wellness-ink/40 uppercase tracking-widest flex items-center gap-2">
                <Moon size={14} /> Lifestyle Adjustments
              </h4>
              <div className="space-y-3">
                {advice.lifestyle.map((item: string) => (
                  <div key={item} className="p-4 bg-wellness-soft rounded-2xl border border-wellness-ink/5 flex items-start gap-3">
                    <div className="mt-1 p-1 bg-wellness-accent/10 rounded text-wellness-accent">
                      <CheckCircle2 size={12} />
                    </div>
                    <p className="text-xs text-wellness-ink leading-relaxed">{item}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="space-y-6">
            <h4 className="text-xs font-bold text-wellness-ink/40 uppercase tracking-widest flex items-center gap-2">
              <Wind size={14} /> Environmental Tips
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {advice.environmental.map((item: string) => (
                <div key={item} className="p-4 bg-wellness-soft rounded-2xl border border-wellness-ink/5 flex items-start gap-3">
                  <div className="mt-1 p-1 bg-wellness-accent/10 rounded text-wellness-accent">
                    <Sun size={12} />
                  </div>
                  <p className="text-xs text-wellness-ink leading-relaxed">{item}</p>
                </div>
              ))}
            </div>
          </div>
        </motion.div>
      ) : null}
    </div>
  );
};
