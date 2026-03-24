import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Camera as CameraIcon, Upload, Loader2, ShieldAlert, CheckCircle2, AlertCircle, X, Info, RefreshCw } from 'lucide-react';
import { analyzeIngredients } from '../services/gemini';
import { Camera } from './Camera';

interface IngredientScannerProps {
  skinType: string;
  concerns: string;
  language: string;
  onClose: () => void;
}

export const IngredientScanner: React.FC<IngredientScannerProps> = ({ skinType, concerns, language, onClose }) => {
  const [isCameraOpen, setIsCameraOpen] = useState(false);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [result, setResult] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);

  const handleCapture = async (base64: string) => {
    setIsAnalyzing(true);
    setError(null);
    try {
      const analysis = await analyzeIngredients(base64, skinType, concerns, language);
      setResult(analysis);
    } catch (err) {
      setError("Failed to analyze ingredients. Please try again.");
    } finally {
      setIsAnalyzing(false);
    }
  };

  return (
    <div className="wellness-card p-8 border-wellness-ink/5 relative overflow-hidden">
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-4">
          <div className="p-3 bg-wellness-accent/10 rounded-2xl text-wellness-accent">
            <ShieldAlert size={24} />
          </div>
          <div>
            <h3 className="text-xl font-serif text-wellness-ink">Ingredient Scanner</h3>
            <p className="text-xs text-wellness-ink/40 uppercase tracking-widest font-bold">Smart Label Analysis</p>
          </div>
        </div>
        <button onClick={onClose} className="p-2 hover:bg-wellness-soft rounded-full transition-colors text-wellness-ink/30">
          <X size={28} />
        </button>
      </div>

      {!result && !isAnalyzing ? (
        <div className="space-y-8">
          <div className="p-6 bg-wellness-soft rounded-[2rem] border border-wellness-ink/5">
            <p className="text-sm text-wellness-ink/60 leading-relaxed">
              Scan the ingredient list on your product's label. Our AI will check for potential irritants based on your skin type and concerns.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <button
              onClick={() => setIsCameraOpen(true)}
              className="p-8 bg-wellness-ink text-white rounded-[2rem] font-bold flex flex-col items-center gap-4 hover:opacity-90 transition-all shadow-xl shadow-wellness-ink/20"
            >
              <div className="p-4 bg-white/10 rounded-2xl">
                <CameraIcon size={32} />
              </div>
              <span>Open Camera</span>
            </button>
            <button
              className="p-8 bg-white text-wellness-ink rounded-[2rem] font-bold flex flex-col items-center gap-4 hover:bg-wellness-soft transition-all border border-wellness-ink/5"
            >
              <div className="p-4 bg-wellness-accent/10 rounded-2xl text-wellness-accent">
                <Upload size={32} />
              </div>
              <span>Upload Photo</span>
            </button>
          </div>
        </div>
      ) : isAnalyzing ? (
        <div className="py-20 flex flex-col items-center justify-center text-center space-y-6">
          <div className="relative">
            <div className="absolute inset-0 bg-wellness-accent/20 blur-3xl rounded-full animate-pulse" />
            <Loader2 size={64} className="animate-spin text-wellness-accent relative z-10" />
          </div>
          <div>
            <h4 className="text-2xl font-serif text-wellness-ink">Analyzing Ingredients</h4>
            <p className="text-wellness-ink/40 italic">Checking for irritants and benefits...</p>
          </div>
        </div>
      ) : (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-8"
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className={`p-3 rounded-2xl ${
                result.verdict === 'Safe' ? 'bg-emerald-500/10 text-emerald-500' :
                result.verdict === 'Caution' ? 'bg-amber-500/10 text-amber-500' :
                'bg-rose-500/10 text-rose-500'
              }`}>
                {result.verdict === 'Safe' ? <CheckCircle2 size={24} /> :
                 result.verdict === 'Caution' ? <AlertCircle size={24} /> :
                 <ShieldAlert size={24} />}
              </div>
              <div>
                <h4 className="text-2xl font-serif text-wellness-ink">{result.verdict}</h4>
                <p className="text-xs font-bold text-wellness-ink/40 uppercase tracking-widest">Safety Score: {result.safetyScore}/10</p>
              </div>
            </div>
          </div>

          <div className="p-6 bg-wellness-soft rounded-[2rem] border border-wellness-ink/5">
            <p className="text-sm text-wellness-ink leading-relaxed">{result.suitability}</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <h5 className="text-xs font-bold text-rose-500 uppercase tracking-widest flex items-center gap-2">
                <AlertCircle size={14} /> Potential Irritants
              </h5>
              <div className="flex flex-wrap gap-2">
                {result.irritants.map((item: string) => (
                  <span key={item} className="px-3 py-1.5 bg-rose-500/10 text-rose-500 rounded-xl text-[10px] font-bold border border-rose-500/10">{item}</span>
                ))}
                {result.irritants.length === 0 && <span className="text-xs text-wellness-ink/40 italic">No major irritants found</span>}
              </div>
            </div>
            <div className="space-y-4">
              <h5 className="text-xs font-bold text-emerald-500 uppercase tracking-widest flex items-center gap-2">
                <CheckCircle2 size={14} /> Key Benefits
              </h5>
              <div className="flex flex-wrap gap-2">
                {result.benefits.map((item: string) => (
                  <span key={item} className="px-3 py-1.5 bg-emerald-500/10 text-emerald-500 rounded-xl text-[10px] font-bold border border-emerald-500/10">{item}</span>
                ))}
              </div>
            </div>
          </div>

          <button
            onClick={() => setResult(null)}
            className="w-full py-4 bg-wellness-soft text-wellness-ink rounded-2xl font-bold hover:bg-wellness-ink/10 transition-all flex items-center justify-center gap-2"
          >
            <RefreshCw size={18} /> Scan Another Product
          </button>
        </motion.div>
      )}

      <AnimatePresence>
        {isCameraOpen && (
          <Camera
            onCapture={handleCapture}
            onClose={() => setIsCameraOpen(false)}
          />
        )}
      </AnimatePresence>
    </div>
  );
};
