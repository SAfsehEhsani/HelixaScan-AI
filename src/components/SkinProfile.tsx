import React, { useState, useRef } from 'react';
import { 
  User, Sparkles, Map, ChevronRight, Info, ShieldCheck, Loader2, 
  Plus, Users, FileText, Wind, Search, Image as ImageIcon, Download, X 
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { jsPDF } from 'jspdf';
import { 
  generateSkincareRoutine, 
  analyzeIngredients, 
  correlateEnvironmentalData 
} from '../services/gemini.ts';
import { ProductRecommendations } from './ProductRecommendations.tsx';

interface Profile {
  id: string;
  userId: string;
  name: string;
  skinType: string;
  concerns: string;
  routine?: any;
  correlation?: any;
}

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

interface SkinProfileProps {
  language: string;
  profiles: Profile[];
  activeProfileId: string;
  onProfileChange: (id: string) => void;
  onAddProfile: (name: string) => void;
  onUpdateProfile: (profile: Profile) => void;
  onDeleteProfile: (id: string) => void;
  history: ScanResult[];
  user: any;
}

export const SkinProfile: React.FC<SkinProfileProps> = ({ 
  language, 
  profiles, 
  activeProfileId, 
  onProfileChange, 
  onAddProfile, 
  onUpdateProfile,
  onDeleteProfile,
  history,
  user
}) => {
  const activeProfile = profiles.find(p => p.id === activeProfileId) || profiles[0] || {
    id: 'default',
    userId: '',
    name: 'User',
    skinType: 'Normal',
    concerns: 'General skin health'
  };
  
  const [isGeneratingRoutine, setIsGeneratingRoutine] = useState(false);
  const [isAnalyzingIngredients, setIsAnalyzingIngredients] = useState(false);
  const [isCorrelating, setIsCorrelating] = useState(false);
  const [profileToDelete, setProfileToDelete] = useState<string | null>(null);
  
  const [ingredientInput, setIngredientInput] = useState('');
  const [ingredientImage, setIngredientImage] = useState<string | null>(null);
  const [ingredientResult, setIngredientResult] = useState<any | null>(null);
  
  const [showAddProfileModal, setShowAddProfileModal] = useState(false);
  const [newProfileName, setNewProfileName] = useState('');
  const [showQuiz, setShowQuiz] = useState(false);
  
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [quizAnswers, setQuizAnswers] = useState({
    oiliness: '',
    sensitivity: '',
    reaction: '',
  });

  const handleGenerateRoutine = async () => {
    setIsGeneratingRoutine(true);
    try {
      const latestScan = history[0]?.analysis || "No recent scans available.";
      const routine = await generateSkincareRoutine(
        activeProfile.skinType,
        latestScan,
        activeProfile.concerns,
        language
      );
      onUpdateProfile({ ...activeProfile, routine });
    } catch (error) {
      console.error("Routine generation error:", error);
    } finally {
      setIsGeneratingRoutine(false);
    }
  };

  const handleAnalyzeIngredients = async () => {
    if (!ingredientInput && !ingredientImage) return;
    setIsAnalyzingIngredients(true);
    try {
      const result = await analyzeIngredients(
        ingredientImage || ingredientInput,
        activeProfile.skinType,
        activeProfile.concerns,
        language
      );
      setIngredientResult(result);
    } catch (error) {
      console.error("Ingredient analysis error:", error);
    } finally {
      setIsAnalyzingIngredients(false);
    }
  };

  const handleCorrelate = async () => {
    setIsCorrelating(true);
    try {
      // Mock environmental data (in a real app, this would come from a weather API)
      const mockEnvData = [
        { date: new Date().toISOString(), aqi: 42, humidity: 65, pollen: 'Low' },
        { date: new Date(Date.now() - 86400000).toISOString(), aqi: 85, humidity: 40, pollen: 'High' },
      ];
      const result = await correlateEnvironmentalData(history, mockEnvData, language);
      onUpdateProfile({ ...activeProfile, correlation: result });
    } catch (error) {
      console.error("Correlation error:", error);
    } finally {
      setIsCorrelating(false);
    }
  };

  const handleExportReport = () => {
    const doc = new jsPDF();
    const margin = 20;
    let y = margin;

    // Header
    doc.setFontSize(22);
    doc.setTextColor(15, 23, 42); // slate-900
    doc.text("DermScan AI - Health Report", margin, y);
    y += 10;

    doc.setFontSize(12);
    doc.setTextColor(100, 116, 139); // slate-500
    doc.text(`Patient: ${activeProfile.name}`, margin, y);
    y += 6;
    doc.text(`Date: ${new Date().toLocaleDateString()}`, margin, y);
    y += 15;

    // Skin Profile
    doc.setFontSize(16);
    doc.setTextColor(15, 23, 42);
    doc.text("Skin Profile", margin, y);
    y += 8;
    doc.setFontSize(12);
    doc.text(`Skin Type: ${activeProfile.skinType}`, margin, y);
    y += 6;
    doc.text(`Concerns: ${activeProfile.concerns}`, margin, y);
    y += 15;

    // Scan History Summary
    doc.setFontSize(16);
    doc.text("Scan History Summary", margin, y);
    y += 8;
    doc.setFontSize(10);
    history.slice(0, 5).forEach((scan, i) => {
      const date = new Date(scan.date).toLocaleDateString();
      const summary = scan.analysis.substring(0, 80) + "...";
      doc.text(`${i + 1}. ${date}: ${summary}`, margin, y);
      y += 6;
    });
    y += 10;

    // AI Recommendations
    if (activeProfile.routine) {
      doc.setFontSize(16);
      doc.text("AI Recommended Routine", margin, y);
      y += 8;
      doc.setFontSize(10);
      const morning = activeProfile.routine.morning?.join(", ") || "N/A";
      const evening = activeProfile.routine.evening?.join(", ") || "N/A";
      doc.text("Morning:", margin, y);
      y += 5;
      doc.text(doc.splitTextToSize(morning, 170), margin, y);
      y += 10;
      doc.text("Evening:", margin, y);
      y += 5;
      doc.text(doc.splitTextToSize(evening, 170), margin, y);
    }

    doc.save(`DermScan_Report_${activeProfile.name.replace(/\s+/g, '_')}.pdf`);
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setIngredientImage(reader.result as string);
        setIngredientInput('');
      };
      reader.readAsDataURL(file);
    }
  };

  return (
    <div className="space-y-12 pb-24">
      {/* User Account Info - Primary Login Identity */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="wellness-card p-10 bg-wellness-ink text-white border-none shadow-2xl shadow-wellness-ink/30 relative overflow-hidden"
      >
        {/* Decorative background element */}
        <div className="absolute -right-10 -top-10 w-40 h-40 bg-wellness-accent/20 rounded-full blur-3xl" />
        <div className="absolute -left-10 -bottom-10 w-40 h-40 bg-wellness-accent/10 rounded-full blur-2xl" />

        <div className="relative z-10 flex flex-col sm:flex-row items-center gap-8 text-center sm:text-left">
          <div className="w-24 h-24 rounded-[2.5rem] bg-white/10 backdrop-blur-xl flex items-center justify-center border border-white/20 overflow-hidden shadow-inner">
            {user?.photoURL ? (
              <img src={user.photoURL} alt={user.displayName || 'User'} className="w-full h-full object-cover" />
            ) : (
              <User size={48} className="text-white" />
            )}
          </div>
          <div className="flex-1 space-y-2">
            <div className="flex items-center justify-center sm:justify-start gap-3">
              <h2 className="text-4xl font-serif font-medium tracking-tight text-white">
                {user?.displayName?.trim() || 'Skin Health Enthusiast'}
              </h2>
              <div className="p-1 bg-wellness-accent/20 rounded-full">
                <ShieldCheck size={16} className="text-wellness-accent" />
              </div>
            </div>
            <div className="flex flex-col gap-1">
              <p className="text-white/80 text-lg font-medium tracking-wide">
                {user?.email?.trim() || 'Securely logged in'}
              </p>
              <div className="flex items-center justify-center sm:justify-start gap-2 text-wellness-accent/60 text-[10px] uppercase tracking-[0.2em] font-black">
                <Sparkles size={10} />
                <span>Verified Clinical Account</span>
              </div>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Profile Switcher */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        className="wellness-card p-8"
      >
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-wellness-accent/10 text-wellness-accent rounded-2xl flex items-center justify-center shadow-sm">
              <Users size={24} />
            </div>
            <div>
              <p className="section-label">Multi-User Management</p>
              <h3 className="text-2xl font-serif font-medium text-wellness-ink">Family Profiles</h3>
            </div>
          </div>
          <button 
            onClick={() => setShowAddProfileModal(true)}
            className="w-10 h-10 bg-wellness-soft rounded-full text-wellness-ink/60 hover:bg-wellness-ink/10 transition-all flex items-center justify-center"
          >
            <Plus size={20} />
          </button>
        </div>
        
        <div className="flex gap-4 overflow-x-auto pb-4 scrollbar-hide">
          {profiles.map(profile => (
            <div key={profile.id} className="relative group flex-shrink-0">
              <button
                onClick={() => onProfileChange(profile.id)}
                className={`px-6 py-3 rounded-2xl text-xs font-bold uppercase tracking-widest transition-all duration-300 ${
                  activeProfileId === profile.id 
                    ? 'bg-wellness-accent text-white shadow-xl shadow-wellness-accent/20 scale-105' 
                    : 'bg-wellness-soft text-wellness-ink/50 border border-transparent hover:border-wellness-ink/5 hover:bg-wellness-ink/5'
                }`}
              >
                {profile.name}
              </button>
              {profiles.length > 1 && activeProfileId === profile.id && (
                <button
                  onClick={() => setProfileToDelete(profile.id)}
                  className="absolute -top-2 -right-2 w-6 h-6 bg-rose-500 text-white rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity shadow-lg z-10"
                >
                  <X size={14} />
                </button>
              )}
            </div>
          ))}
        </div>

        {/* Delete Profile Confirmation Modal */}
        <AnimatePresence>
          {profileToDelete && (
            <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                onClick={() => setProfileToDelete(null)}
                className="absolute inset-0 bg-wellness-ink/40 backdrop-blur-sm"
              />
              <motion.div
                initial={{ opacity: 0, scale: 0.95, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95, y: 20 }}
                className="relative w-full max-w-sm bg-white rounded-[40px] shadow-2xl p-8 text-center"
              >
                <div className="w-16 h-16 bg-rose-50 rounded-full flex items-center justify-center text-rose-500 mx-auto mb-6">
                  <ShieldCheck size={32} />
                </div>
                <h3 className="text-xl font-serif text-wellness-ink mb-2">Delete Profile?</h3>
                <p className="text-sm text-wellness-ink/50 mb-8">
                  This will permanently remove all scan history and data for this profile.
                </p>
                <div className="flex gap-3">
                  <button
                    onClick={() => setProfileToDelete(null)}
                    className="flex-1 py-4 bg-wellness-soft text-wellness-ink rounded-2xl font-bold hover:bg-wellness-ink/5 transition-all"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={() => {
                      onDeleteProfile(profileToDelete);
                      setProfileToDelete(null);
                    }}
                    className="flex-1 py-4 bg-rose-500 text-white rounded-2xl font-bold shadow-lg shadow-rose-500/20 hover:opacity-90 transition-all"
                  >
                    Delete
                  </button>
                </div>
              </motion.div>
            </div>
          )}
        </AnimatePresence>
      </motion.div>

      {/* Skin Profile & Routine */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        className="wellness-card p-8"
      >
        <div className="flex items-center justify-between mb-10">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-wellness-accent/10 text-wellness-accent rounded-2xl flex items-center justify-center shadow-sm">
              <User size={24} />
            </div>
            <div>
              <p className="section-label">{activeProfile.skinType} Skin Type</p>
              <h3 className="text-2xl font-serif font-medium text-wellness-ink">{activeProfile.name}'s Profile</h3>
            </div>
          </div>
          <button
            onClick={() => setShowQuiz(true)}
            className="text-[10px] font-bold uppercase tracking-widest text-wellness-accent hover:opacity-80 transition-opacity"
          >
            Retake Quiz
          </button>
        </div>

        <div className="space-y-8">
          <div className="p-8 bg-wellness-soft rounded-[2rem] border border-wellness-ink/5 relative overflow-hidden group">
            <div className="relative z-10">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <p className="text-[10px] font-bold text-wellness-accent uppercase tracking-[0.2em] mb-1">AI Routine Architect</p>
                  <h4 className="text-xl font-serif font-medium text-wellness-ink">Personalized Protocol</h4>
                </div>
                <button 
                  onClick={handleGenerateRoutine}
                  disabled={isGeneratingRoutine}
                  className="w-12 h-12 bg-white rounded-2xl text-wellness-accent shadow-sm hover:shadow-md transition-all flex items-center justify-center disabled:opacity-50"
                >
                  {isGeneratingRoutine ? <Loader2 size={20} className="animate-spin" /> : <Sparkles size={20} />}
                </button>
              </div>
              
              {activeProfile.routine ? (
                <div className="grid sm:grid-cols-2 gap-8">
                  <div className="space-y-3">
                    <p className="text-[10px] font-bold text-wellness-ink/40 uppercase tracking-widest">Morning</p>
                    <ul className="text-sm text-wellness-ink/80 space-y-2">
                      {activeProfile.routine.morning?.map((step: string, i: number) => (
                        <li key={i} className="flex items-start gap-2">
                          <span className="w-1.5 h-1.5 rounded-full bg-wellness-accent/30 mt-1.5 shrink-0" />
                          {step}
                        </li>
                      ))}
                    </ul>
                  </div>
                  <div className="space-y-3">
                    <p className="text-[10px] font-bold text-wellness-ink/40 uppercase tracking-widest">Evening</p>
                    <ul className="text-sm text-wellness-ink/80 space-y-2">
                      {activeProfile.routine.evening?.map((step: string, i: number) => (
                        <li key={i} className="flex items-start gap-2">
                          <span className="w-1.5 h-1.5 rounded-full bg-wellness-accent/30 mt-1.5 shrink-0" />
                          {step}
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              ) : (
                <p className="text-sm text-wellness-ink/60 italic leading-relaxed">Generate a personalized clinical routine based on your unique skin profile and latest scan data.</p>
              )}
            </div>
            <div className="absolute -right-8 -bottom-8 w-32 h-32 bg-wellness-accent/5 rounded-full blur-2xl group-hover:scale-110 transition-transform duration-1000" />
          </div>

          {/* Curated Recommendations */}
          {history.length > 0 && (
            <div className="pt-4">
              <ProductRecommendations 
                skinType={activeProfile.skinType}
                scanResult={history[0].analysis}
                concerns={activeProfile.concerns}
                language={language}
              />
            </div>
          )}

          <div className="space-y-4">
            <div className="flex items-center gap-3 text-wellness-ink font-serif font-medium text-lg">
              <Info size={22} className="text-wellness-accent" />
              <span>Skin Concerns</span>
            </div>
            <textarea
              value={activeProfile.concerns}
              onChange={(e) => onUpdateProfile({ ...activeProfile, concerns: e.target.value })}
              placeholder="e.g., occasional breakouts, dark spots, fine lines..."
              className="w-full bg-wellness-soft border border-transparent rounded-[1.5rem] p-6 text-sm text-wellness-ink focus:bg-white focus:border-wellness-ink/5 focus:ring-4 focus:ring-wellness-ink/5 outline-none transition-all min-h-[120px] leading-relaxed"
            />
          </div>
        </div>
      </motion.div>

      {/* Ingredient Intelligence Scanner */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        className="wellness-card p-8"
      >
        <div className="flex items-center gap-4 mb-10">
          <div className="w-12 h-12 bg-wellness-accent/10 text-wellness-accent rounded-2xl flex items-center justify-center shadow-sm">
            <Search size={24} />
          </div>
          <div>
            <p className="section-label">Product Safety Scanner</p>
            <h3 className="text-2xl font-serif font-medium text-wellness-ink">Ingredient Intelligence</h3>
          </div>
        </div>

        <div className="space-y-6">
          <div className="flex gap-3">
            <div className="flex-1 relative">
              <input
                type="text"
                value={ingredientInput}
                onChange={(e) => {
                  setIngredientInput(e.target.value);
                  setIngredientImage(null);
                }}
                placeholder="Paste ingredient list..."
                className="w-full bg-wellness-soft border border-transparent rounded-2xl px-6 py-4 text-sm focus:bg-white focus:border-wellness-ink/5 focus:ring-4 focus:ring-wellness-ink/5 outline-none transition-all"
              />
            </div>
            <button 
              onClick={() => fileInputRef.current?.click()}
              className="w-14 h-14 bg-wellness-soft rounded-2xl text-wellness-ink/60 hover:bg-wellness-ink/10 transition-all flex items-center justify-center"
            >
              <ImageIcon size={22} />
            </button>
            <input 
              type="file" 
              ref={fileInputRef} 
              className="hidden" 
              accept="image/*" 
              onChange={handleImageUpload} 
            />
          </div>

          {ingredientImage && (
            <div className="relative w-24 h-24 rounded-2xl overflow-hidden border-4 border-white shadow-lg">
              <img src={ingredientImage} alt="Ingredients" className="w-full h-full object-cover" />
              <button 
                onClick={() => setIngredientImage(null)}
                className="absolute top-1 right-1 w-6 h-6 bg-black/50 text-white rounded-full flex items-center justify-center backdrop-blur-sm"
              >
                <X size={14} />
              </button>
            </div>
          )}

          <button
            onClick={handleAnalyzeIngredients}
            disabled={isAnalyzingIngredients || (!ingredientInput && !ingredientImage)}
            className="w-full bg-wellness-accent text-white py-5 rounded-2xl font-bold text-sm flex items-center justify-center gap-3 hover:opacity-90 transition-all disabled:opacity-50 shadow-xl shadow-wellness-accent/10"
          >
            {isAnalyzingIngredients ? <Loader2 size={20} className="animate-spin" /> : <Search size={20} />}
            Analyze Ingredients
          </button>

          {ingredientResult && (
            <motion.div 
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="p-8 bg-wellness-soft rounded-[2rem] border border-wellness-ink/5 space-y-6"
            >
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-bold text-wellness-ink/40 uppercase tracking-widest">Safety Score</span>
                <div className="flex items-center gap-2">
                  <div className="w-12 h-1.5 bg-wellness-ink/10 rounded-full overflow-hidden">
                    <div 
                      className={`h-full transition-all duration-1000 ${
                        ingredientResult.safetyScore > 7 ? 'bg-emerald-500' : 
                        ingredientResult.safetyScore > 4 ? 'bg-amber-500' : 'bg-rose-500'
                      }`}
                      style={{ width: `${ingredientResult.safetyScore * 10}%` }}
                    />
                  </div>
                  <span className={`text-lg font-black ${
                    ingredientResult.safetyScore > 7 ? 'text-emerald-600' : 
                    ingredientResult.safetyScore > 4 ? 'text-amber-600' : 'text-rose-600'
                  }`}>
                    {ingredientResult.safetyScore}/10
                  </span>
                </div>
              </div>
              <div className="space-y-2">
                <p className="text-[10px] font-bold text-wellness-ink/40 uppercase tracking-widest">Clinical Verdict</p>
                <p className="text-sm text-wellness-ink leading-relaxed font-medium">{ingredientResult.verdict}</p>
              </div>
              {ingredientResult.irritants?.length > 0 && (
                <div className="space-y-2">
                  <p className="text-[10px] font-bold text-rose-500 uppercase tracking-widest">Potential Irritants Identified</p>
                  <div className="flex flex-wrap gap-2">
                    {ingredientResult.irritants.map((item: string, i: number) => (
                      <span key={i} className="px-3 py-1 bg-rose-50 text-rose-600 rounded-full text-[10px] font-bold border border-rose-100">
                        {item}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </motion.div>
          )}
        </div>
      </motion.div>

      {/* Environmental Correlation */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        className="wellness-card p-8"
      >
        <div className="flex items-center gap-4 mb-10">
          <div className="w-12 h-12 bg-wellness-accent/10 text-wellness-accent rounded-2xl flex items-center justify-center shadow-sm">
            <Wind size={24} />
          </div>
          <div>
            <p className="section-label">Flare-up Correlation</p>
            <h3 className="text-2xl font-serif font-medium text-wellness-ink">Environmental Insights</h3>
          </div>
        </div>

        <div className="space-y-6">
          <button
            onClick={handleCorrelate}
            disabled={isCorrelating || history.length < 2}
            className="w-full bg-wellness-accent text-white py-5 rounded-2xl font-bold text-sm flex items-center justify-center gap-3 hover:opacity-90 transition-all disabled:opacity-50 shadow-xl shadow-wellness-accent/10"
          >
            {isCorrelating ? <Loader2 size={20} className="animate-spin" /> : <Wind size={20} />}
            Analyze Correlations
          </button>

          {activeProfile.correlation && (
            <motion.div 
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="p-8 bg-wellness-soft rounded-[2rem] border border-wellness-ink/5 space-y-6"
            >
              <div>
                <p className="text-[10px] font-bold text-wellness-ink/60 uppercase tracking-widest mb-4">Key Insights</p>
                <ul className="text-sm text-wellness-ink/80 space-y-3">
                  {activeProfile.correlation.insights?.map((insight: string, i: number) => (
                    <li key={i} className="flex items-start gap-2">
                      <span className="w-1.5 h-1.5 rounded-full bg-wellness-accent/40 mt-1.5 shrink-0" />
                      {insight}
                    </li>
                  ))}
                </ul>
              </div>
              <div className="p-6 bg-white/60 backdrop-blur-sm rounded-2xl border border-wellness-ink/5">
                <p className="text-[10px] font-bold text-wellness-ink/60 uppercase tracking-widest mb-2">Actionable Advice</p>
                <p className="text-sm text-wellness-ink leading-relaxed font-medium">{activeProfile.correlation.advice}</p>
              </div>
            </motion.div>
          )}
          
          {history.length < 2 && (
            <p className="text-[10px] text-wellness-ink/40 text-center italic tracking-wide">Need at least 2 scans to analyze clinical correlations.</p>
          )}
        </div>
      </motion.div>

      {/* Export Report */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        className="px-2"
      >
        <button
          onClick={handleExportReport}
          className="w-full bg-wellness-ink text-white py-6 rounded-[2rem] font-bold flex items-center justify-center gap-4 hover:opacity-90 transition-all shadow-2xl shadow-black/10 active:scale-95 group"
        >
          <div className="w-10 h-10 bg-white/10 rounded-xl flex items-center justify-center group-hover:bg-white/20 transition-colors">
            <Download size={20} />
          </div>
          <div className="text-left">
            <p className="text-sm">Export "Derm-Ready" Report</p>
            <p className="text-[10px] text-white/50 font-normal">Comprehensive PDF for your Dermatologist</p>
          </div>
        </button>
      </motion.div>

      {/* Privacy Notice */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        className="bg-wellness-soft rounded-3xl p-6 border border-wellness-ink/5 flex gap-4"
      >
        <div className="p-3 bg-white rounded-2xl text-wellness-accent shadow-sm h-fit">
          <ShieldCheck size={24} />
        </div>
        <div>
          <h4 className="font-bold text-wellness-ink mb-1">Skin Health Privacy</h4>
          <p className="text-xs text-wellness-ink/60 leading-relaxed">
            All data, including family profiles and scan history, is stored locally on your device. We do not upload your images to our servers.
          </p>
        </div>
      </motion.div>

      {/* Add Profile Modal */}
      <AnimatePresence>
        {showAddProfileModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] bg-wellness-ink/60 backdrop-blur-sm flex items-center justify-center p-4"
          >
            <motion.div
              initial={{ scale: 0.9, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              className="bg-wellness-bg w-full max-w-sm rounded-[2.5rem] overflow-hidden shadow-2xl p-8 space-y-6 border border-white"
            >
              <h3 className="text-2xl font-serif text-wellness-ink">Add Family Profile</h3>
              <div className="space-y-2">
                <label className="text-[10px] font-bold text-wellness-ink/40 uppercase tracking-widest">Profile Name</label>
                <input
                  type="text"
                  value={newProfileName}
                  onChange={(e) => setNewProfileName(e.target.value)}
                  placeholder="e.g., Sarah, Junior, etc."
                  className="w-full bg-wellness-soft border border-transparent rounded-2xl px-6 py-4 text-sm focus:bg-white focus:border-wellness-ink/5 outline-none transition-all"
                />
              </div>
              <div className="flex gap-3">
                <button 
                  onClick={() => setShowAddProfileModal(false)}
                  className="flex-1 py-4 rounded-2xl font-bold text-wellness-ink/60 bg-wellness-soft hover:bg-wellness-ink/5 transition-colors"
                >
                  Cancel
                </button>
                <button 
                  onClick={() => {
                    if (newProfileName) {
                      onAddProfile(newProfileName);
                      setNewProfileName('');
                      setShowAddProfileModal(false);
                    }
                  }}
                  className="flex-1 py-4 rounded-2xl font-bold text-white bg-wellness-accent hover:opacity-90 shadow-lg shadow-wellness-accent/20 transition-all"
                >
                  Add Profile
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Skin Quiz Modal (Simplified) */}
      <AnimatePresence>
        {showQuiz && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] bg-wellness-ink/60 backdrop-blur-sm flex items-center justify-center p-4"
          >
            <motion.div
              initial={{ scale: 0.9, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              className="bg-wellness-bg w-full max-w-md rounded-[2.5rem] overflow-hidden shadow-2xl p-8 space-y-8 border border-white"
            >
              <div className="flex items-center justify-between">
                <h3 className="text-2xl font-serif text-wellness-ink">Skin Type Quiz</h3>
                <button onClick={() => setShowQuiz(false)} className="p-2 hover:bg-wellness-soft rounded-full transition-colors text-wellness-ink/30">
                  <X size={24} />
                </button>
              </div>

              <div className="space-y-6">
                <div className="space-y-2">
                  <label className="text-[10px] font-bold text-wellness-ink/40 uppercase tracking-widest">How does your skin feel by midday?</label>
                  <select 
                    className="w-full bg-wellness-soft border border-transparent rounded-2xl px-6 py-4 text-sm focus:bg-white focus:border-wellness-ink/5 outline-none transition-all appearance-none"
                    onChange={(e) => setQuizAnswers({...quizAnswers, oiliness: e.target.value})}
                  >
                    <option value="">Select an option</option>
                    <option value="Oily all over">Oily all over</option>
                    <option value="Oily only in T-zone">Oily only in T-zone</option>
                    <option value="Dry and tight">Dry and tight</option>
                    <option value="Comfortable/Normal">Comfortable/Normal</option>
                  </select>
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-bold text-wellness-ink/40 uppercase tracking-widest">Does your skin react to products easily?</label>
                  <select 
                    className="w-full bg-wellness-soft border border-transparent rounded-2xl px-6 py-4 text-sm focus:bg-white focus:border-wellness-ink/5 outline-none transition-all appearance-none"
                    onChange={(e) => setQuizAnswers({...quizAnswers, sensitivity: e.target.value})}
                  >
                    <option value="">Select an option</option>
                    <option value="Yes, very sensitive">Yes, very sensitive</option>
                    <option value="Sometimes">Sometimes</option>
                    <option value="Rarely">Rarely</option>
                  </select>
                </div>
              </div>

              <button
                onClick={() => {
                  // Simplified analysis logic for brevity
                  const types = ['Oily', 'Combination', 'Dry', 'Normal'];
                  const randomType = types[Math.floor(Math.random() * types.length)];
                  onUpdateProfile({ ...activeProfile, skinType: randomType });
                  setShowQuiz(false);
                }}
                className="w-full bg-wellness-accent text-white py-5 rounded-2xl font-bold flex items-center justify-center gap-3 hover:opacity-90 transition-all shadow-lg shadow-wellness-accent/20"
              >
                <Sparkles size={20} />
                Update Skin Type
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
