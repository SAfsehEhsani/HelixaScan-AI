import { useState, useMemo, useEffect, useRef } from 'react';
import { Search, Info, BookOpen, Loader2, ChevronRight, X, Sparkles, Bookmark, BookmarkCheck, Activity } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import ReactMarkdown from 'react-markdown';
import { getDetailedMedicalInfo } from '../services/gemini';
import { ConditionTrendChart } from './TrendCharts';

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

interface Condition {
  id: string;
  name: string;
  category: string;
  shortDesc: string;
  imageSeed: string;
}

const COMMON_CONDITIONS: Condition[] = [
  { id: 'acne', name: 'Acne', category: 'Common', shortDesc: 'Clogged hair follicles and oil glands.', imageSeed: 'acne' },
  { id: 'eczema', name: 'Eczema', category: 'Inflammatory', shortDesc: 'Itchy, inflamed skin patches.', imageSeed: 'eczema' },
  { id: 'psoriasis', name: 'Psoriasis', category: 'Autoimmune', shortDesc: 'Red, scaly patches of skin.', imageSeed: 'psoriasis' },
  { id: 'rosacea', name: 'Rosacea', category: 'Inflammatory', shortDesc: 'Redness and visible blood vessels in the face.', imageSeed: 'rosacea' },
  { id: 'melanoma', name: 'Melanoma', category: 'Cancer', shortDesc: 'Serious type of skin cancer.', imageSeed: 'melanoma' },
  { id: 'vitiligo', name: 'Vitiligo', category: 'Pigmentation', shortDesc: 'Loss of skin color in patches.', imageSeed: 'vitiligo' },
  { id: 'hives', name: 'Hives', category: 'Allergic', shortDesc: 'Red, itchy welts from a reaction.', imageSeed: 'hives' },
  { id: 'moles', name: 'Moles', category: 'Common', shortDesc: 'Small, dark skin growths.', imageSeed: 'moles' },
];

export function SkinEncyclopedia({ language, history = [] }: { language: string, history?: ScanResult[] }) {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCondition, setSelectedCondition] = useState<Condition | null>(null);
  const [detailedInfo, setDetailedInfo] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [bookmarks, setBookmarks] = useState<string[]>(() => {
    const saved = localStorage.getItem('skin_bookmarks');
    return saved ? JSON.parse(saved) : [];
  });
  const [showOnlyBookmarks, setShowOnlyBookmarks] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  const relatedConditions = useMemo(() => {
    if (!selectedCondition) return [];
    return COMMON_CONDITIONS
      .filter(c => c.id !== selectedCondition.id)
      .sort((a, b) => {
        if (a.category === selectedCondition.category && b.category !== selectedCondition.category) return -1;
        if (a.category !== selectedCondition.category && b.category === selectedCondition.category) return 1;
        return Math.random() - 0.5;
      })
      .slice(0, 3);
  }, [selectedCondition]);

  useEffect(() => {
    localStorage.setItem('skin_bookmarks', JSON.stringify(bookmarks));
  }, [bookmarks]);

  const filteredConditions = useMemo(() => {
    let result = COMMON_CONDITIONS;
    if (showOnlyBookmarks) {
      result = result.filter(c => bookmarks.includes(c.id));
    }
    return result.filter(c => 
      c.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.category.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [searchQuery, showOnlyBookmarks, bookmarks]);

  const handleSelectCondition = async (condition: Condition) => {
    setSelectedCondition(condition);
    setDetailedInfo(null);
    setIsLoading(true);
    if (scrollRef.current) {
      scrollRef.current.scrollTo({ top: 0, behavior: 'smooth' });
    }
    try {
      const info = await getDetailedMedicalInfo(condition.name, language);
      setDetailedInfo(info);
    } catch (error) {
      console.error('Error fetching condition info:', error);
      setDetailedInfo('Failed to load information. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const toggleBookmark = (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    setBookmarks(prev => 
      prev.includes(id) ? prev.filter(b => b !== id) : [...prev, id]
    );
  };

  return (
    <div className="space-y-12">
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        className="wellness-card p-10"
      >
        <div className="flex items-center gap-4 mb-3">
          <div className="w-12 h-12 bg-wellness-accent/10 text-wellness-accent rounded-2xl flex items-center justify-center shadow-sm">
            <BookOpen size={24} />
          </div>
          <div>
            <p className="section-label">Medical Knowledge Base</p>
            <h2 className="text-3xl font-serif font-medium text-wellness-ink">Skin Encyclopedia</h2>
          </div>
        </div>
        <p className="text-wellness-ink/50 text-base mb-8 leading-relaxed max-w-lg">Explore a curated medical database of skin conditions, symptoms, and clinical treatments.</p>
        
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-5 top-1/2 -translate-y-1/2 text-wellness-ink/30" size={20} />
            <input
              type="text"
              placeholder="Search conditions, categories, symptoms..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-14 pr-6 py-5 bg-wellness-soft border border-transparent rounded-[1.5rem] focus:bg-white focus:border-wellness-ink/5 focus:ring-4 focus:ring-wellness-ink/5 outline-none transition-all text-sm"
            />
          </div>
          <button
            onClick={() => setShowOnlyBookmarks(!showOnlyBookmarks)}
            className={`px-8 py-5 rounded-[1.5rem] font-bold text-sm flex items-center justify-center gap-3 transition-all border ${showOnlyBookmarks ? 'bg-wellness-accent text-white border-wellness-accent shadow-xl shadow-wellness-accent/20' : 'bg-white text-wellness-ink/60 border-black/5 hover:bg-wellness-soft'}`}
          >
            {showOnlyBookmarks ? <BookmarkCheck size={20} /> : <Bookmark size={20} />}
            {showOnlyBookmarks ? 'Saved Only' : 'Show Saved'}
          </button>
        </div>
      </motion.div>

      <motion.div 
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        viewport={{ once: true }}
        className="grid grid-cols-1 sm:grid-cols-2 gap-6"
      >
        {filteredConditions.map((condition, index) => (
          <motion.button
            key={condition.id}
            layoutId={condition.id}
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: index * 0.05 }}
            onClick={() => handleSelectCondition(condition)}
            className="wellness-card p-5 group relative flex gap-5 text-left"
          >
            <div className="w-24 h-24 rounded-2xl overflow-hidden shrink-0 bg-wellness-soft border border-black/5">
              <img 
                src={`https://picsum.photos/seed/${condition.imageSeed}/200/200`} 
                alt={condition.name}
                className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                referrerPolicy="no-referrer"
              />
            </div>
            <div className="flex-1 min-w-0 py-1">
              <div className="flex items-center justify-between mb-2">
                <span className="text-[9px] font-bold text-wellness-accent uppercase tracking-[0.2em]">{condition.category}</span>
                <button
                  onClick={(e) => toggleBookmark(e, condition.id)}
                  className={`p-2 rounded-xl transition-all ${bookmarks.includes(condition.id) ? 'text-wellness-accent bg-wellness-accent/10' : 'text-wellness-ink/20 hover:text-wellness-accent hover:bg-wellness-soft'}`}
                >
                  {bookmarks.includes(condition.id) ? <BookmarkCheck size={18} /> : <Bookmark size={18} />}
                </button>
              </div>
              <h3 className="text-lg font-serif font-medium text-wellness-ink mb-1 truncate">{condition.name}</h3>
              <p className="text-xs text-wellness-ink/50 line-clamp-2 leading-relaxed">{condition.shortDesc}</p>
            </div>
          </motion.button>
        ))}
      </motion.div>

      {filteredConditions.length === 0 && (
        <div className="text-center py-20 wellness-card border-dashed bg-transparent">
          <div className="w-20 h-20 bg-wellness-soft rounded-full flex items-center justify-center mx-auto mb-6">
            <Search size={32} className="text-wellness-ink/20" />
          </div>
          <h3 className="text-xl font-serif font-medium text-wellness-ink">
            {showOnlyBookmarks ? 'No saved conditions' : 'No conditions found'}
          </h3>
          <p className="text-wellness-ink/40 text-sm mt-2">
            {showOnlyBookmarks ? 'Bookmark conditions to build your personal library.' : 'Try searching for a different term.'}
          </p>
          {(searchQuery || showOnlyBookmarks) && (
            <button 
              onClick={() => { setSearchQuery(''); setShowOnlyBookmarks(false); }}
              className="mt-6 text-wellness-accent font-bold text-sm hover:underline uppercase tracking-widest"
            >
              Reset Filters
            </button>
          )}
        </div>
      )}

      <AnimatePresence>
        {selectedCondition && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-wellness-ink/60 backdrop-blur-sm z-50 flex items-end sm:items-center justify-center p-4"
          >
            <motion.div
              initial={{ y: '100%' }}
              animate={{ y: 0 }}
              exit={{ y: '100%' }}
              className="bg-wellness-bg w-full max-w-2xl rounded-t-[3rem] sm:rounded-[3rem] max-h-[90vh] overflow-hidden flex flex-col shadow-2xl border-t border-white"
            >
              <div className="p-8 border-b border-black/5 flex items-center justify-between bg-white/50 backdrop-blur-md">
                <div className="flex items-center gap-4">
                  <div className="w-14 h-14 bg-wellness-accent/10 text-wellness-accent rounded-2xl flex items-center justify-center shadow-sm">
                    <BookOpen size={28} />
                  </div>
                  <div>
                    <h3 className="text-2xl font-serif font-medium text-wellness-ink">{selectedCondition.name}</h3>
                    <p className="text-[10px] uppercase tracking-widest text-wellness-ink/40 font-bold">Medical Encyclopedia</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <button
                    onClick={(e) => toggleBookmark(e, selectedCondition.id)}
                    className={`p-3 rounded-2xl transition-all ${bookmarks.includes(selectedCondition.id) ? 'text-wellness-accent bg-wellness-accent/10 shadow-inner' : 'text-wellness-ink/20 hover:bg-wellness-soft'}`}
                  >
                    {bookmarks.includes(selectedCondition.id) ? <BookmarkCheck size={24} /> : <Bookmark size={24} />}
                  </button>
                  <button
                    onClick={() => setSelectedCondition(null)}
                    className="p-3 hover:bg-wellness-soft rounded-2xl transition-all text-wellness-ink/30"
                  >
                    <X size={28} />
                  </button>
                </div>
              </div>

              <div className="flex-1 overflow-y-auto p-8" ref={scrollRef}>
                {isLoading ? (
                  <div className="flex flex-col items-center justify-center py-24 text-wellness-ink/30">
                    <Loader2 size={56} className="animate-spin mb-6 text-wellness-accent" />
                    <p className="font-serif text-xl">Consulting Medical Database...</p>
                  </div>
                ) : (
                  <div className="space-y-10">
                    <div className="bg-wellness-accent/5 border border-wellness-accent/10 p-6 rounded-[2rem] flex gap-4">
                      <Sparkles size={24} className="text-wellness-accent shrink-0" />
                      <p className="text-xs text-wellness-accent/80 leading-relaxed italic">
                        This clinical information is synthesized by AI for educational purposes. For diagnosis and treatment, always consult a board-certified dermatologist.
                      </p>
                    </div>
                    
                    <div className="markdown-body">
                      <ReactMarkdown>{detailedInfo || ''}</ReactMarkdown>
                    </div>

                    {/* Personal Progress Chart */}
                    {!isLoading && detailedInfo && history.length > 0 && (
                      <div className="pt-10 border-t border-black/5">
                        <div className="flex items-center gap-3 mb-8">
                          <div className="w-10 h-10 bg-wellness-accent/10 text-wellness-accent rounded-xl flex items-center justify-center">
                            <Activity size={20} />
                          </div>
                          <h4 className="text-xl font-serif font-medium text-wellness-ink">Personal Health Trends</h4>
                        </div>
                        <div className="bg-white p-6 rounded-[2rem] border border-black/5 shadow-sm">
                          <ConditionTrendChart history={history} condition={selectedCondition.name} />
                        </div>
                        <p className="text-[10px] text-wellness-ink/40 mt-4 italic text-center tracking-wide">
                          Historical data for "{selectedCondition.name}" based on your clinical scan history.
                        </p>
                      </div>
                    )}

                    {/* Related Conditions Section */}
                    {!isLoading && detailedInfo && relatedConditions.length > 0 && (
                      <div className="pt-10 border-t border-black/5">
                        <div className="flex items-center gap-3 mb-8">
                          <div className="w-10 h-10 bg-wellness-accent/10 text-wellness-accent rounded-xl flex items-center justify-center">
                            <Sparkles size={20} />
                          </div>
                          <h4 className="text-xl font-serif font-medium text-wellness-ink">Related Conditions</h4>
                        </div>
                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                          {relatedConditions.map(related => (
                            <button
                              key={related.id}
                              onClick={() => handleSelectCondition(related)}
                              className="p-5 bg-wellness-soft border border-transparent rounded-2xl text-left hover:bg-white hover:border-wellness-accent/20 hover:shadow-md transition-all group"
                            >
                              <span className="text-[9px] font-bold text-wellness-accent uppercase tracking-widest block mb-2">{related.category}</span>
                              <h5 className="text-sm font-serif font-medium text-wellness-ink group-hover:text-wellness-accent transition-colors">{related.name}</h5>
                            </button>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>

              <div className="p-8 border-t border-black/5 bg-white/50 backdrop-blur-md">
                <button
                  onClick={() => setSelectedCondition(null)}
                  className="w-full bg-wellness-ink text-white py-5 rounded-2xl font-bold hover:bg-wellness-ink/90 transition-all shadow-lg"
                >
                  Close Encyclopedia
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
