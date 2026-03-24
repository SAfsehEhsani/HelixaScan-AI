import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Search, Book, Loader2, Info, ChevronRight, X, AlertCircle, CheckCircle2, History } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import { getDetailedMedicalInfo } from '../services/gemini';

interface SkinWikiProps {
  language: string;
}

const COMMON_CONDITIONS = [
  'Acne', 'Eczema', 'Psoriasis', 'Rosacea', 'Melanoma', 'Hives', 'Warts', 'Vitiligo', 'Seborrheic Dermatitis', 'Contact Dermatitis'
];

export const SkinWiki: React.FC<SkinWikiProps> = ({ language }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [isSearching, setIsSearching] = useState(false);
  const [selectedCondition, setSelectedCondition] = useState<string | null>(null);
  const [details, setDetails] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleSearch = async (condition: string) => {
    setSelectedCondition(condition);
    setIsSearching(true);
    setError(null);
    try {
      const info = await getDetailedMedicalInfo(condition, language);
      setDetails(info);
    } catch (err) {
      setError("Failed to fetch information. Please try again.");
    } finally {
      setIsSearching(false);
    }
  };

  return (
    <div className="wellness-card p-8 border-wellness-ink/5 relative overflow-hidden">
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-4">
          <div className="p-3 bg-wellness-accent/10 rounded-2xl text-wellness-accent">
            <Book size={24} />
          </div>
          <div>
            <h3 className="text-xl font-serif text-wellness-ink">Skin Encyclopedia</h3>
            <p className="text-xs text-wellness-ink/40 uppercase tracking-widest font-bold">AI-Powered Medical Knowledge</p>
          </div>
        </div>
      </div>

      <div className="relative mb-8">
        <div className="absolute inset-y-0 left-4 flex items-center pointer-events-none text-wellness-ink/30">
          <Search size={20} />
        </div>
        <input
          type="text"
          placeholder="Search for a skin condition..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && searchQuery && handleSearch(searchQuery)}
          className="w-full pl-12 pr-4 py-4 bg-wellness-soft rounded-2xl border border-wellness-ink/5 text-wellness-ink focus:outline-none focus:ring-2 focus:ring-wellness-accent/20 transition-all"
        />
      </div>

      {!selectedCondition ? (
        <div className="space-y-6">
          <h4 className="text-xs font-bold text-wellness-ink/40 uppercase tracking-widest">Common Conditions</h4>
          <div className="flex flex-wrap gap-2">
            {COMMON_CONDITIONS.map((condition) => (
              <button
                key={condition}
                onClick={() => handleSearch(condition)}
                className="px-4 py-2 bg-wellness-soft text-wellness-ink rounded-xl text-sm font-medium hover:bg-wellness-accent hover:text-white transition-all border border-wellness-ink/5"
              >
                {condition}
              </button>
            ))}
          </div>
        </div>
      ) : isSearching ? (
        <div className="py-20 flex flex-col items-center justify-center text-center space-y-6">
          <div className="relative">
            <div className="absolute inset-0 bg-wellness-accent/20 blur-3xl rounded-full animate-pulse" />
            <Loader2 size={64} className="animate-spin text-wellness-accent relative z-10" />
          </div>
          <div>
            <h4 className="text-2xl font-serif text-wellness-ink">Consulting Medical Database</h4>
            <p className="text-wellness-ink/40 italic">Fetching details for {selectedCondition}...</p>
          </div>
        </div>
      ) : (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-8"
        >
          <div className="flex items-center justify-between">
            <h4 className="text-3xl font-serif text-wellness-ink">{selectedCondition}</h4>
            <button 
              onClick={() => setSelectedCondition(null)}
              className="p-2 hover:bg-wellness-soft rounded-full transition-colors text-wellness-ink/30"
            >
              <X size={24} />
            </button>
          </div>

          <div className="markdown-body">
            <ReactMarkdown>{details || ''}</ReactMarkdown>
          </div>

          <div className="mt-10 p-6 bg-wellness-soft rounded-[2rem] border border-wellness-ink/5">
            <p className="text-xs text-wellness-ink/50 leading-relaxed italic">
              <span className="font-bold not-italic text-wellness-ink uppercase tracking-tighter mr-1">Disclaimer:</span> 
              This information is for educational purposes only and does not constitute medical advice. Always consult with a qualified healthcare provider for diagnosis and treatment.
            </p>
          </div>
        </motion.div>
      )}
    </div>
  );
};
