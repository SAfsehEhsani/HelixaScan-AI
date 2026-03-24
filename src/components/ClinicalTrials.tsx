import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  FlaskConical, 
  MapPin, 
  Users, 
  ChevronRight, 
  Loader2, 
  ExternalLink, 
  AlertCircle,
  Sparkles,
  ArrowRight,
  Info
} from 'lucide-react';
import { findClinicalTrials } from '../services/gemini';

interface Trial {
  name: string;
  phase: string;
  eligibility: string;
  location: string;
  description: string;
  contact: string;
}

interface ClinicalTrialsProps {
  condition: string;
  language?: string;
}

export const ClinicalTrials: React.FC<ClinicalTrialsProps> = ({ condition, language = 'English' }) => {
  const [trials, setTrials] = useState<Trial[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchTrials = async () => {
      if (!condition) return;
      setLoading(true);
      setError(null);
      try {
        const data = await findClinicalTrials(condition, "Global", language);
        setTrials(data);
      } catch (err) {
        setError("Failed to fetch clinical trials. Please try again later.");
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchTrials();
  }, [condition, language]);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center p-12 wellness-card bg-wellness-soft/30 border-dashed border-2 border-wellness-ink/10">
        <Loader2 className="animate-spin text-wellness-accent mb-4" size={32} />
        <p className="text-wellness-ink/60 font-serif italic">Finding matching clinical trials...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6 wellness-card bg-red-50/50 border-red-100 flex items-center gap-4">
        <AlertCircle className="text-red-500 shrink-0" size={24} />
        <p className="text-red-600 text-sm">{error}</p>
      </div>
    );
  }

  if (trials.length === 0) return null;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-wellness-accent/10 rounded-xl">
            <FlaskConical className="text-wellness-accent" size={24} />
          </div>
          <div>
            <h3 className="text-xl font-serif text-wellness-ink">Clinical Trial Matching</h3>
            <p className="text-xs text-wellness-ink/50">Advancing research for {condition}</p>
          </div>
        </div>
        <div className="flex items-center gap-1 text-[10px] font-bold text-wellness-accent uppercase tracking-widest bg-wellness-accent/5 px-3 py-1 rounded-full">
          <Sparkles size={12} /> AI Matched
        </div>
      </div>

      <div className="grid gap-4">
        {trials.map((trial, idx) => (
          <motion.div
            key={idx}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: idx * 0.1 }}
            className="wellness-card p-6 hover:shadow-xl hover:shadow-wellness-accent/5 transition-all group"
          >
            <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">
              <div className="space-y-3 flex-1">
                <div className="flex items-center gap-3">
                  <span className="px-2 py-0.5 bg-wellness-ink text-white text-[10px] font-bold rounded-md uppercase tracking-tighter">
                    {trial.phase}
                  </span>
                  <h4 className="font-bold text-wellness-ink group-hover:text-wellness-accent transition-colors">
                    {trial.name}
                  </h4>
                </div>
                <p className="text-sm text-wellness-ink/70 leading-relaxed line-clamp-2">
                  {trial.description}
                </p>
                <div className="flex flex-wrap gap-4 text-xs text-wellness-ink/50">
                  <span className="flex items-center gap-1.5 font-medium">
                    <MapPin size={14} className="text-wellness-accent" /> {trial.location}
                  </span>
                  <span className="flex items-center gap-1.5 font-medium">
                    <Users size={14} className="text-wellness-accent" /> {trial.eligibility}
                  </span>
                </div>
              </div>
              <button className="shrink-0 flex items-center justify-center gap-2 px-6 py-3 bg-wellness-soft hover:bg-wellness-ink hover:text-white rounded-2xl text-wellness-ink text-sm font-bold transition-all">
                Learn More <ArrowRight size={16} />
              </button>
            </div>
          </motion.div>
        ))}
      </div>

      <div className="bg-wellness-soft/50 p-4 rounded-2xl flex gap-3 border border-wellness-ink/5">
        <Info size={18} className="text-wellness-ink/40 shrink-0" />
        <p className="text-[10px] text-wellness-ink/50 leading-relaxed italic">
          Clinical trials are research studies that test new medical treatments. Participation is voluntary and may provide access to cutting-edge therapies. Consult your physician before applying.
        </p>
      </div>
    </div>
  );
};
