import React, { useState, useRef, useEffect } from 'react';
import { Camera as CameraIcon, Upload, ShieldAlert, Activity, History, ChevronRight, Loader2, RefreshCcw, Info, BookOpen, X, MapPin, Download, Languages, Columns, MessageSquare, Clock, User, Sparkles, Scan, Map, Book, Stethoscope, Users, Twitter, Facebook, MessageCircle, Zap, LogOut, Sun } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import ReactMarkdown from 'react-markdown';
import { jsPDF } from 'jspdf';
import { Camera } from './components/Camera.tsx';
import { DermatologistFinder } from './components/DermatologistFinder.tsx';
import { ChatAssistant } from './components/ChatAssistant.tsx';
import { UVAdvisor } from './components/UVAdvisor.tsx';
import { Reminders } from './components/Reminders.tsx';
import { SkinProfile } from './components/SkinProfile.tsx';
import { SkinEncyclopedia } from './components/SkinEncyclopedia.tsx';
import { SkinJourney } from './components/SkinJourney.tsx';
import { DoctorDashboard } from './components/DoctorDashboard.tsx';
import { ClinicalTrials } from './components/ClinicalTrials.tsx';
import { Testimonials } from './components/Testimonials.tsx';
import { ProductRecommendations } from './components/ProductRecommendations.tsx';
import { SkinMap } from './components/SkinMap.tsx';
import { UVFilter } from './components/UVFilter.tsx';
import { SymptomChecker } from './components/SymptomChecker.tsx';
import { IngredientScanner } from './components/IngredientScanner.tsx';
import { SkinWiki } from './components/SkinWiki.tsx';
import { SkinScorecard } from './components/SkinScorecard.tsx';
import { LifestyleAdvisor } from './components/LifestyleAdvisor.tsx';
import { BodyLocationPicker } from './components/BodyLocationPicker.tsx';
import { analyzeSkinImage, getDetailedMedicalInfo, findClinicalTrials } from './services/gemini.ts';
import { 
  auth, db, onAuthStateChanged, onSnapshot, collection, query, where, 
  doc, setDoc, updateDoc, deleteDoc, Timestamp, handleFirestoreError, OperationType, User as FirebaseUser,
  testConnection
} from './firebase';

interface ScanResult {
  id: string;
  profileId: string;
  userId: string;
  date: string;
  image: string;
  analysis: string;
  condition?: string;
  confidence?: number;
  x?: number;
  y?: number;
  metrics?: {
    redness: number | null;
    intensity: number | null;
    estimatedSizeMm: number | null;
  };
}

interface Profile {
  id: string;
  userId: string;
  name: string;
  skinType: string;
  concerns: string;
  routine?: any;
  correlation?: any;
}

const LANGUAGES = [
  { code: 'English', label: 'English' },
  { code: 'Spanish', label: 'Español' },
  { code: 'Hindi', label: 'हिन्दी' },
  { code: 'French', label: 'Français' },
  { code: 'Arabic', label: 'العربية' },
];

type Tab = 'scan' | 'chat' | 'library' | 'uv' | 'reminders' | 'profile';

import { TrendCharts, ConditionTrendChart } from './components/TrendCharts';
import { OnboardingFlow } from './components/OnboardingFlow';
import { SplashScreen } from './components/SplashScreen';
import { AuthScreen } from './components/AuthScreen';
const NavButton = ({ active, onClick, icon: Icon, label }: { active: boolean, onClick: () => void, icon: any, label: string }) => (
  <button
    onClick={onClick}
    className="flex-1 flex flex-col items-center gap-2 transition-all relative group py-1"
  >
    <div className="relative">
      <motion.div
        animate={{
          scale: active ? 1.1 : 1,
          y: active ? -4 : 0,
        }}
        transition={{ type: "spring", stiffness: 400, damping: 25 }}
        className={`p-2.5 rounded-2xl transition-all duration-500 ${
          active 
            ? 'bg-wellness-accent text-white shadow-xl shadow-wellness-accent/30' 
            : 'text-wellness-ink/30 group-hover:text-wellness-accent group-hover:bg-wellness-soft'
        }`}
      >
        <Icon size={20} strokeWidth={active ? 2.5 : 2} />
      </motion.div>
      {active && (
        <motion.div
          layoutId="nav-indicator"
          className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-1.5 h-1.5 bg-wellness-accent rounded-full shadow-[0_0_12px_rgba(22,74,65,0.6)]"
          transition={{ type: "spring", stiffness: 300, damping: 30 }}
        />
      )}
    </div>
    <motion.span 
      animate={{
        opacity: active ? 1 : 0.5,
        y: active ? -1 : 0,
      }}
      className={`text-[8px] font-black uppercase tracking-[0.2em] transition-all duration-300 ${active ? 'text-wellness-accent' : 'text-wellness-ink/40 group-hover:text-wellness-accent'}`}
    >
      {label}
    </motion.span>
  </button>
);

export default function App() {
  const [currentUser, setCurrentUser] = useState<FirebaseUser | null>(null);
  const [isAuthReady, setIsAuthReady] = useState(false);
  const [activeTab, setActiveTab] = useState<Tab>('scan');
  const [language, setLanguage] = useState(() => localStorage.getItem('skin_app_lang') || 'English');
  const [profiles, setProfiles] = useState<Profile[]>([]);
  const [activeProfileId, setActiveProfileId] = useState(() => localStorage.getItem('skin_active_profile_id') || 'default');
  const [isCameraOpen, setIsCameraOpen] = useState(false);
  const [isMapOpen, setIsMapOpen] = useState(false);
  const [compareIds, setCompareIds] = useState<string[]>([]);
  const [isCompareMode, setIsCompareMode] = useState(false);
  const [image, setImage] = useState<string | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [result, setResult] = useState<string | null>(null);
  const [history, setHistory] = useState<ScanResult[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [detailedInfo, setDetailedInfo] = useState<string | null>(null);
  const [isFetchingDetails, setIsFetchingDetails] = useState(false);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [isDoctorMode, setIsDoctorMode] = useState(false);
  const [isConsulting, setIsConsulting] = useState(false);
  const [selectedScanForUV, setSelectedScanForUV] = useState<string | null>(null);
  const [isSymptomCheckerOpen, setIsSymptomCheckerOpen] = useState(false);
  const [isIngredientScannerOpen, setIsIngredientScannerOpen] = useState(false);
  const [isLifestyleOpen, setIsLifestyleOpen] = useState(false);
  const [symptoms, setSymptoms] = useState<{ question: string, answer: string }[] | null>(null);
  const [pendingImage, setPendingImage] = useState<string | null>(null);
  const [scanToDelete, setScanToDelete] = useState<string | null>(null);
  const [isLocationPickerOpen, setIsLocationPickerOpen] = useState(false);
  const [pendingScanResult, setPendingScanResult] = useState<ScanResult | null>(null);
  const [hasCompletedOnboarding, setHasCompletedOnboarding] = useState<boolean>(true);
  const [isSplashVisible, setIsSplashVisible] = useState(true);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    testConnection();
  }, []);

  // Auth Listener
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setCurrentUser(user);
      setIsAuthReady(true);
      if (user) {
        // Create user doc if it doesn't exist
        const userDocRef = doc(db, 'users', user.uid);
        setDoc(userDocRef, {
          uid: user.uid,
          email: user.email,
          displayName: user.displayName,
          photoURL: user.photoURL,
          createdAt: Timestamp.now(),
          role: 'user'
        }, { merge: true }).catch(err => handleFirestoreError(err, OperationType.WRITE, `users/${user.uid}`));
      }
    });
    return () => unsubscribe();
  }, []);

  // Firestore Listeners
  useEffect(() => {
    if (!currentUser) {
      setProfiles([]);
      setHistory([]);
      setHasCompletedOnboarding(true);
      return;
    }

    // User Doc Listener for Onboarding
    const userDocRef = doc(db, 'users', currentUser.uid);
    const unsubscribeUser = onSnapshot(userDocRef, (snapshot) => {
      const data = snapshot.data();
      if (data) {
        setHasCompletedOnboarding(data.hasCompletedOnboarding === true);
      } else {
        setHasCompletedOnboarding(false);
      }
    }, (err) => handleFirestoreError(err, OperationType.GET, `users/${currentUser.uid}`));

    const profilesQuery = query(collection(db, `users/${currentUser.uid}/profiles`));
    const unsubscribeProfiles = onSnapshot(profilesQuery, (snapshot) => {
      const p = snapshot.docs.map(doc => doc.data() as Profile);
      setProfiles(p);
      if (p.length > 0 && !p.find(prof => prof.id === activeProfileId)) {
        setActiveProfileId(p[0].id);
      }
    }, (err) => handleFirestoreError(err, OperationType.LIST, `users/${currentUser.uid}/profiles`));

    const scansQuery = query(collection(db, `users/${currentUser.uid}/scans`));
    const unsubscribeScans = onSnapshot(scansQuery, (snapshot) => {
      const s = snapshot.docs.map(doc => {
        const data = doc.data();
        return {
          ...data,
          date: data.date instanceof Timestamp ? data.date.toDate().toISOString() : data.date
        } as ScanResult;
      });
      setHistory(s.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()));
    }, (err) => handleFirestoreError(err, OperationType.LIST, `users/${currentUser.uid}/scans`));

    return () => {
      unsubscribeUser();
      unsubscribeProfiles();
      unsubscribeScans();
    };
  }, [currentUser, activeProfileId]);

  const completeOnboarding = async () => {
    if (!currentUser) return;
    try {
      const userDocRef = doc(db, 'users', currentUser.uid);
      await updateDoc(userDocRef, { hasCompletedOnboarding: true });
    } catch (err) {
      handleFirestoreError(err, OperationType.UPDATE, `users/${currentUser.uid}`);
    }
  };

  const activeProfile = profiles.find(p => p.id === activeProfileId) || profiles[0] || {
    id: 'default',
    userId: currentUser?.uid || '',
    name: 'User',
    skinType: 'Normal',
    concerns: 'General skin health'
  };
  const profileHistory = history.filter(h => h.profileId === activeProfileId);

  const toggleDoctorMode = () => {
    setIsDoctorMode(!isDoctorMode);
    setActiveTab('scan');
  };

  useEffect(() => {
    localStorage.setItem('skin_active_profile_id', activeProfileId);
  }, [activeProfileId]);

  useEffect(() => {
    localStorage.setItem('skin_app_lang', language);
  }, [language]);

  const handleAddProfile = async (name: string) => {
    if (!currentUser) return;
    const profileId = Math.random().toString(36).substr(2, 9);
    const newProfile: Profile = {
      id: profileId,
      userId: currentUser.uid,
      name,
      skinType: 'Normal',
      concerns: 'General skin health'
    };
    
    try {
      await setDoc(doc(db, `users/${currentUser.uid}/profiles`, profileId), {
        ...newProfile,
        createdAt: Timestamp.now()
      });
      setActiveProfileId(profileId);
    } catch (err) {
      handleFirestoreError(err, OperationType.WRITE, `users/${currentUser.uid}/profiles/${profileId}`);
    }
  };

  const handleUpdateProfile = async (updatedProfile: Profile) => {
    if (!currentUser) return;
    try {
      await updateDoc(doc(db, `users/${currentUser.uid}/profiles`, updatedProfile.id), {
        ...updatedProfile
      });
    } catch (err) {
      handleFirestoreError(err, OperationType.UPDATE, `users/${currentUser.uid}/profiles/${updatedProfile.id}`);
    }
  };

  const handleDeleteProfile = async (profileId: string) => {
    if (!currentUser || profiles.length <= 1) return;
    try {
      await deleteDoc(doc(db, `users/${currentUser.uid}/profiles`, profileId));
      if (activeProfileId === profileId) {
        const remaining = profiles.filter(p => p.id !== profileId);
        setActiveProfileId(remaining[0].id);
      }
    } catch (err) {
      handleFirestoreError(err, OperationType.DELETE, `users/${currentUser.uid}/profiles/${profileId}`);
    }
  };

  const handleDeleteScan = async (scanId: string) => {
    if (!currentUser) return;
    try {
      await deleteDoc(doc(db, `users/${currentUser.uid}/scans`, scanId));
    } catch (err) {
      handleFirestoreError(err, OperationType.DELETE, `users/${currentUser.uid}/scans/${scanId}`);
    }
  };

  const handleCapture = async (base64: string) => {
    setPendingImage(base64);
    setIsSymptomCheckerOpen(true);
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        const base64 = reader.result as string;
        setPendingImage(base64);
        setIsSymptomCheckerOpen(true);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSymptomComplete = (answers: { question: string, answer: string }[]) => {
    setSymptoms(answers);
    setIsSymptomCheckerOpen(false);
    if (pendingImage) {
      setImage(pendingImage);
      setResult(null);
      setError(null);
      setDetailedInfo(null);
      performAnalysis(pendingImage, answers);
      setPendingImage(null);
    }
  };

  const performAnalysis = async (base64: string, symptomData?: { question: string, answer: string }[]) => {
    if (!currentUser) return;
    setIsAnalyzing(true);
    try {
      const analysis = await analyzeSkinImage(base64, language, symptomData);
      if (analysis) {
        setResult(analysis);
        
        // Parse metrics
        let metrics = undefined;
        const metricsMatch = analysis.match(/\[METRICS\]\s*(\{[\s\S]*?\})\s*\[\/METRICS\]/);
        if (metricsMatch) {
          try {
            metrics = JSON.parse(metricsMatch[1]);
          } catch (e) {
            console.error("Error parsing metrics:", e);
          }
        }

        const conditionMatch = analysis.match(/\*\*Primary Condition\*\*:\s*(.*)/i);
        const confidenceMatch = analysis.match(/\*\*Confidence Score\*\*:\s*(\d+)%/i);

        const scanId = Math.random().toString(36).substr(2, 9);
        const newResult: ScanResult = {
          id: scanId,
          profileId: activeProfileId,
          userId: currentUser.uid,
          date: new Date().toISOString(),
          image: base64,
          analysis: analysis,
          condition: conditionMatch ? conditionMatch[1].trim() : undefined,
          confidence: confidenceMatch ? parseInt(confidenceMatch[1]) : undefined,
          metrics
        };
        
        setPendingScanResult(newResult);
        setIsLocationPickerOpen(true);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "An unexpected error occurred during analysis.");
      if (err instanceof Error && err.message.includes('permission')) {
        handleFirestoreError(err, OperationType.WRITE, `users/${currentUser.uid}/scans`);
      }
    } finally {
      setIsAnalyzing(false);
    }
  };

  const fetchDetails = async () => {
    if (!result) return;
    
    // Extract condition name from analysis
    // Looking for "**Primary Condition**: [Condition]"
    const match = result.match(/\*\*Primary Condition\*\*:\s*(.*)/i);
    const condition = match ? match[1].trim() : "this condition";
    
    setIsFetchingDetails(true);
    try {
      const details = await getDetailedMedicalInfo(condition, language);
      setDetailedInfo(details);
      setShowDetailsModal(true);
    } catch (err) {
      setError("Failed to fetch detailed information.");
    } finally {
      setIsFetchingDetails(false);
    }
  };

  const reset = () => {
    setImage(null);
    setResult(null);
    setError(null);
    setDetailedInfo(null);
  };

  const handleLocationSelect = async (x: number, y: number) => {
    if (!pendingScanResult || !currentUser) return;

    const finalResult = {
      ...pendingScanResult,
      x,
      y
    };

    try {
      await setDoc(doc(db, `users/${currentUser.uid}/scans`, pendingScanResult.id), {
        ...finalResult,
        date: Timestamp.now()
      });
      setIsLocationPickerOpen(false);
      setPendingScanResult(null);
    } catch (err) {
      handleFirestoreError(err, OperationType.WRITE, `users/${currentUser.uid}/scans/${pendingScanResult.id}`);
    }
  };

  const skipLocation = async () => {
    if (!pendingScanResult || !currentUser) return;

    try {
      await setDoc(doc(db, `users/${currentUser.uid}/scans`, pendingScanResult.id), {
        ...pendingScanResult,
        date: Timestamp.now()
      });
      setIsLocationPickerOpen(false);
      setPendingScanResult(null);
    } catch (err) {
      handleFirestoreError(err, OperationType.WRITE, `users/${currentUser.uid}/scans/${pendingScanResult.id}`);
    }
  };

  const getConditionName = () => {
    if (!result) return "";
    const match = result.match(/\*\*Primary Condition\*\*:\s*(.*)/i);
    return match ? match[1].trim() : "Condition";
  };

  const shareAnalysis = (platform: 'twitter' | 'facebook' | 'whatsapp') => {
    const condition = getConditionName();
    const text = `I just analyzed my skin using DermScan AI and it identified: ${condition}. Check out your skin health too!`;
    const url = window.location.href;

    let shareUrl = '';
    if (platform === 'twitter') {
      shareUrl = `https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}&url=${encodeURIComponent(url)}`;
    } else if (platform === 'facebook') {
      shareUrl = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}&quote=${encodeURIComponent(text)}`;
    } else if (platform === 'whatsapp') {
      shareUrl = `https://api.whatsapp.com/send?text=${encodeURIComponent(text + ' ' + url)}`;
    }

    window.open(shareUrl, '_blank');
  };

  const toggleCompare = (id: string) => {
    setCompareIds(prev => {
      if (prev.includes(id)) return prev.filter(i => i !== id);
      if (prev.length >= 2) return [prev[1], id];
      return [...prev, id];
    });
  };

  const generatePDF = () => {
    if (!result || !image) return;

    const doc = new jsPDF();
    const condition = getConditionName();
    const activeProfile = profiles.find(p => p.id === activeProfileId) || profiles[0] || {
      id: 'default',
      userId: currentUser?.uid || '',
      name: 'User',
      skinType: 'Normal',
      concerns: 'General skin health'
    };

    // Helper to extract sections from the result text
    const extractSection = (sectionName: string) => {
      const regex = new RegExp(`\\*\\*${sectionName}\\*\\*:\\s*([\\s\\S]*?)(?=\\n\\d\\.|\\n\\*\\*|$)`, 'i');
      const match = result.match(regex);
      return match ? match[1].trim().replace(/\*\*/g, '') : "Information not available";
    };

    const identification = extractSection("Potential Identification");
    const characteristics = extractSection("Characteristics");
    const urgency = extractSection("Urgency Level");
    const actions = extractSection("Recommended Actions");

    // Official Document Styling
    const primaryColor = [16, 185, 129]; // Emerald-600
    const secondaryColor = [15, 23, 42]; // Slate-900
    const lightGray = [248, 250, 252]; // Slate-50
    const accentColor = [225, 29, 72]; // Rose-600

    // Background Pattern (Subtle Grid)
    doc.setDrawColor(240, 240, 240);
    for (let i = 0; i < 210; i += 10) {
      doc.line(i, 0, i, 297);
    }
    for (let i = 0; i < 297; i += 10) {
      doc.line(0, i, 210, i);
    }

    // Header Background
    doc.setFillColor(secondaryColor[0], secondaryColor[1], secondaryColor[2]);
    doc.rect(0, 0, 210, 45, 'F');

    // App Logo Placeholder & Name (Top Right)
    doc.setFillColor(primaryColor[0], primaryColor[1], primaryColor[2]);
    doc.roundedRect(160, 12, 40, 14, 3, 3, 'F');
    doc.setFontSize(11);
    doc.setTextColor(255, 255, 255);
    doc.setFont("helvetica", "bold");
    doc.text('DermScan AI', 165, 21);

    // Document Title
    doc.setFontSize(26);
    doc.setTextColor(255, 255, 255);
    doc.setFont("helvetica", "bold");
    doc.text('CLINICAL ANALYSIS REPORT', 20, 28);

    // Metadata (Top Left)
    doc.setFontSize(8);
    doc.setTextColor(180, 180, 180);
    doc.setFont("helvetica", "normal");
    doc.text('DEPARTMENT OF DERMATOLOGY | AI DIAGNOSTICS UNIT', 20, 36);
    doc.text(`Report ID: ${Math.random().toString(36).toUpperCase().substr(2, 10)}`, 20, 40);

    // Confidential Stamp
    doc.setDrawColor(accentColor[0], accentColor[1], accentColor[2]);
    doc.setLineWidth(0.5);
    doc.setTextColor(accentColor[0], accentColor[1], accentColor[2]);
    doc.setFontSize(10);
    doc.rect(160, 30, 40, 8);
    doc.text('CONFIDENTIAL', 166, 35.5);

    let y = 60;

    // STEP 1: Patient Information
    doc.setFillColor(lightGray[0], lightGray[1], lightGray[2]);
    doc.rect(15, y - 5, 180, 28, 'F');
    doc.setDrawColor(200, 200, 200);
    doc.setLineWidth(0.1);
    doc.rect(15, y - 5, 180, 28, 'D');

    doc.setFontSize(10);
    doc.setTextColor(secondaryColor[0], secondaryColor[1], secondaryColor[2]);
    doc.setFont("helvetica", "bold");
    doc.text('● STEP 1: PATIENT PROFILE', 20, y);
    
    y += 10;
    doc.setFont("helvetica", "normal");
    doc.setFontSize(9);
    doc.text(`Patient Name: ${activeProfile.name}`, 20, y);
    doc.text(`Skin Type: ${activeProfile.skinType}`, 85, y);
    doc.text(`Date: ${new Date().toLocaleDateString()}`, 150, y);
    y += 6;
    doc.text(`Primary Concerns: ${activeProfile.concerns || 'None stated'}`, 20, y);

    y += 25;

    // STEP 2: Visual Documentation
    doc.setFontSize(10);
    doc.setFont("helvetica", "bold");
    doc.text('● STEP 2: VISUAL DOCUMENTATION', 20, y);
    
    y += 8;
    try {
      doc.setDrawColor(secondaryColor[0], secondaryColor[1], secondaryColor[2]);
      doc.setLineWidth(0.5);
      doc.rect(19.5, y - 0.5, 61, 46, 'D');
      doc.addImage(image, 'JPEG', 20, y, 60, 45);
    } catch (e) {
      console.error("Error adding image to PDF", e);
    }

    // Urgency Badge
    const urgencyColor = urgency.toLowerCase().includes('high') ? [225, 29, 72] : // Rose-600
                         urgency.toLowerCase().includes('medium') ? [217, 119, 6] : // Amber-600
                         [16, 185, 129]; // Emerald-600
    
    doc.setFillColor(urgencyColor[0], urgencyColor[1], urgencyColor[2]);
    doc.roundedRect(90, y, 45, 10, 2, 2, 'F');
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(9);
    doc.setFont("helvetica", "bold");
    doc.text(`URGENCY: ${urgency.toUpperCase()}`, 94, y + 6.5);

    // Primary Condition
    doc.setTextColor(secondaryColor[0], secondaryColor[1], secondaryColor[2]);
    doc.setFontSize(16);
    doc.setFont("helvetica", "bold");
    doc.text(condition, 90, y + 22);
    
    doc.setFontSize(9);
    doc.setFont("helvetica", "normal");
    doc.setTextColor(100, 100, 100);
    const splitIdent = doc.splitTextToSize(identification, 100);
    doc.text(splitIdent, 90, y + 30);

    y += 65;

    // STEP 3: Clinical Findings
    doc.setFontSize(10);
    doc.setFont("helvetica", "bold");
    doc.setTextColor(secondaryColor[0], secondaryColor[1], secondaryColor[2]);
    doc.text('● STEP 3: CLINICAL FINDINGS', 20, y);
    
    y += 10;
    doc.setFont("helvetica", "normal");
    doc.setFontSize(9);
    doc.setTextColor(secondaryColor[0], secondaryColor[1], secondaryColor[2]);
    doc.text('Observed Characteristics:', 20, y);
    y += 6;
    doc.setTextColor(80, 80, 80);
    const splitChars = doc.splitTextToSize(characteristics, 170);
    doc.text(splitChars, 20, y);
    y += (splitChars.length * 5) + 8;

    // STEP 4: Recommended Actions
    doc.setFontSize(10);
    doc.setFont("helvetica", "bold");
    doc.setTextColor(secondaryColor[0], secondaryColor[1], secondaryColor[2]);
    doc.text('● STEP 4: RECOMMENDED ACTIONS', 20, y);
    
    y += 10;
    doc.setFont("helvetica", "normal");
    doc.setFontSize(9);
    doc.setTextColor(80, 80, 80);
    const splitActions = doc.splitTextToSize(actions, 170);
    doc.text(splitActions, 20, y);

    y += (splitActions.length * 5) + 15;

    // Signature Section
    doc.setDrawColor(200, 200, 200);
    doc.line(20, y, 90, y);
    doc.line(120, y, 190, y);
    doc.setFontSize(8);
    doc.setTextColor(150, 150, 150);
    doc.text('Patient Signature', 20, y + 5);
    doc.text('Reviewing Clinician (Placeholder)', 120, y + 5);

    // Footer / Disclaimer
    doc.setDrawColor(226, 232, 240);
    doc.line(20, 270, 190, 270);
    
    doc.setFontSize(7);
    doc.setTextColor(150, 150, 150);
    const disclaimer = "LEGAL DISCLAIMER: This report is generated by DermScan AI for informational and educational purposes only. It is NOT a medical diagnosis, professional opinion, or substitute for consultation with a board-certified dermatologist. The analysis is based on computer vision patterns and may contain inaccuracies. If you are experiencing pain, rapid changes, or bleeding, seek immediate medical attention.";
    const splitDisclaimer = doc.splitTextToSize(disclaimer, 170);
    doc.text(splitDisclaimer, 20, 275);

    doc.setFontSize(8);
    doc.text('Page 1 of 1', 180, 290);
    doc.text('CONFIDENTIAL CLINICAL RECORD', 20, 290);

    doc.save(`DermScan_Clinical_Report_${condition.replace(/\s+/g, '_')}.pdf`);
  };

  if (isSplashVisible) {
    return <SplashScreen onComplete={() => setIsSplashVisible(false)} />;
  }

  if (!isAuthReady) {
    return (
      <div className="min-h-screen bg-wellness-bg flex items-center justify-center">
        <Loader2 size={40} className="animate-spin text-wellness-accent" />
      </div>
    );
  }

  if (!currentUser) {
    return <AuthScreen onSuccess={() => {}} />;
  }

  return (
    <div className="min-h-screen bg-wellness-bg flex flex-col">
      {/* Header */}
      <header className="bg-wellness-bg/80 backdrop-blur-xl border-b border-black/5 sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
          <div 
            className="flex items-center gap-3 cursor-pointer group"
            onClick={reset}
          >
            <div className="w-10 h-10 bg-wellness-accent rounded-2xl flex items-center justify-center text-white shadow-lg shadow-wellness-accent/20 group-hover:scale-110 transition-transform">
              <Stethoscope size={22} />
            </div>
            <div>
              <h1 className="text-xl font-serif font-semibold tracking-tight text-wellness-ink">DermScan AI</h1>
              <p className="text-[10px] uppercase tracking-widest text-slate-400 font-bold hidden sm:block">Clinical Wellness</p>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <button 
              onClick={() => auth.signOut()}
              className="p-2.5 text-slate-500 hover:bg-wellness-soft rounded-2xl transition-all border border-transparent hover:border-black/5"
              title="Logout"
            >
              <LogOut size={18} />
            </button>
            <button 
              onClick={toggleDoctorMode}
              className={`px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all flex items-center gap-2 ${
                isDoctorMode 
                  ? 'bg-wellness-ink text-white shadow-lg' 
                  : 'bg-wellness-soft text-wellness-ink/60 hover:bg-wellness-ink/5'
              }`}
            >
              <Users size={16} />
              {isDoctorMode ? 'Patient View' : 'Doctor Access'}
            </button>
            <div className="hidden md:flex items-center gap-2 bg-wellness-soft p-1 rounded-xl">
              {LANGUAGES.map(lang => (
                <button
                  key={lang.code}
                  onClick={() => setLanguage(lang.code)}
                  className={`px-3 py-1.5 rounded-lg text-[10px] font-bold transition-all ${language === lang.code ? 'bg-white text-wellness-accent shadow-sm' : 'text-wellness-ink/40 hover:text-wellness-ink/60'}`}
                >
                  {lang.label}
                </button>
              ))}
            </div>
            <button 
              onClick={() => setHistory([])}
              className="p-2.5 text-slate-500 hover:bg-wellness-soft rounded-2xl transition-all border border-transparent hover:border-black/5"
              title="Clear History"
            >
              <History size={18} />
            </button>
          </div>
        </div>
      </header>

      <main className={`flex-1 ${isDoctorMode ? '' : 'max-w-2xl lg:max-w-4xl xl:max-w-5xl mx-auto w-full px-4 sm:px-6 py-8 space-y-10 pb-32'}`}>
        {isDoctorMode ? (
          <DoctorDashboard />
        ) : (
          <AnimatePresence mode="wait">
            {activeTab === 'scan' ? (
            <motion.div
              key="scan-tab"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            >
              <AnimatePresence mode="wait">
                {!image ? (
                  <motion.div
                    key="home"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    className="space-y-12"
                  >
                    {/* Hero Section - Editorial Style */}
                    <motion.div 
                      initial={{ opacity: 0, y: 30 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.8, ease: "easeOut" }}
                      className="relative group"
                    >
                      <div className="bg-wellness-accent rounded-[3.5rem] p-12 sm:p-16 text-white shadow-2xl shadow-wellness-accent/30 relative overflow-hidden">
                        <div className="relative z-10">
                          <motion.div 
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: 0.3 }}
                            className="flex items-center gap-3 mb-8"
                          >
                            <div className="w-10 h-px bg-white/40" />
                            <span className="text-[10px] uppercase tracking-[0.5em] font-black text-white/60">Clinical Intelligence</span>
                          </motion.div>
                          <motion.h2 
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.4 }}
                            className="text-6xl sm:text-7xl font-serif font-medium mb-8 leading-[0.85] tracking-tighter text-balance"
                          >
                            The Future<br />of Skin Care
                          </motion.h2>
                          <motion.p 
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.5 }}
                            className="text-wellness-soft/70 text-xl mb-12 max-w-[90%] font-light leading-relaxed text-balance"
                          >
                            Advanced dermatological analysis powered by medical-grade AI models.
                          </motion.p>
                          <motion.div 
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.6 }}
                            className="flex flex-col sm:flex-row gap-5"
                          >
                            <button
                              onClick={() => setIsCameraOpen(true)}
                              className="flex-1 bg-white text-wellness-accent px-10 py-7 rounded-2xl font-black uppercase tracking-widest text-xs flex items-center justify-center gap-3 hover:bg-wellness-soft transition-all transform hover:scale-[1.02] active:scale-[0.98] shadow-2xl"
                            >
                              <CameraIcon size={20} />
                              Start Scan
                            </button>
                            <button
                              onClick={() => fileInputRef.current?.click()}
                              className="flex-1 bg-white/5 backdrop-blur-xl text-white px-10 py-7 rounded-2xl font-black uppercase tracking-widest text-xs flex items-center justify-center gap-3 hover:bg-white/10 transition-all border border-white/10"
                            >
                              <Upload size={20} />
                              Upload
                            </button>
                          </motion.div>
                        </div>
                        
                        {/* Abstract Shapes */}
                        <div className="absolute -right-20 -top-20 w-96 h-96 bg-white/5 rounded-full blur-[100px] animate-pulse" />
                        <div className="absolute -left-20 -bottom-20 w-80 h-80 bg-emerald-400/10 rounded-full blur-[80px]" />
                        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full h-full opacity-10 pointer-events-none">
                          <div className="absolute inset-0 border-[0.5px] border-white/20 rounded-full scale-150" />
                          <div className="absolute inset-0 border-[0.5px] border-white/10 rounded-full scale-125" />
                        </div>
                      </div>
                    </motion.div>

                    {/* Quick Actions - Bento Style Enhanced */}
                    <div className="grid grid-cols-2 gap-6">
                      <motion.div 
                        whileInView={{ opacity: 1, y: 0 }}
                        initial={{ opacity: 0, y: 20 }}
                        viewport={{ once: true }}
                        className="wellness-card p-10 group hover:bg-wellness-accent transition-colors duration-500"
                      >
                        <div className="w-14 h-14 bg-wellness-soft text-wellness-accent rounded-2xl flex items-center justify-center mb-8 group-hover:bg-white/10 group-hover:text-white transition-colors">
                          <ShieldAlert size={28} />
                        </div>
                        <h3 className="text-2xl font-serif font-medium text-wellness-ink mb-3 group-hover:text-white transition-colors">Safe Analysis</h3>
                        <p className="text-sm text-slate-500 leading-relaxed group-hover:text-white/70 transition-colors">Privacy-focused medical-grade AI models.</p>
                      </motion.div>
                      <motion.div 
                        whileInView={{ opacity: 1, y: 0 }}
                        initial={{ opacity: 0, y: 20 }}
                        viewport={{ once: true }}
                        transition={{ delay: 0.1 }}
                        className="wellness-card p-10 group hover:bg-wellness-accent transition-colors duration-500"
                      >
                        <div className="w-14 h-14 bg-blue-50 text-blue-600 rounded-2xl flex items-center justify-center mb-8 group-hover:bg-white/10 group-hover:text-white transition-colors">
                          <Activity size={28} />
                        </div>
                        <h3 className="text-2xl font-serif font-medium text-wellness-ink mb-3 group-hover:text-white transition-colors">Instant Results</h3>
                        <p className="text-sm text-slate-500 leading-relaxed group-hover:text-white/70 transition-colors">Get insights in seconds, not days.</p>
                      </motion.div>
                    </div>

                    {/* History Section */}
                    {history.length > 0 && (
                      <motion.div 
                        whileInView={{ opacity: 1, y: 0 }}
                        initial={{ opacity: 0, y: 20 }}
                        viewport={{ once: true }}
                        className="space-y-6 pt-4"
                      >
                        <div className="flex items-center justify-between">
                          <div>
                            <span className="section-label">Clinical Records</span>
                            <h3 className="text-2xl font-serif text-wellness-ink flex items-center gap-3">
                              Recent Scans
                              <span className="text-xs font-bold bg-wellness-soft px-3 py-1 rounded-full text-wellness-accent">
                                {history.length}
                              </span>
                            </h3>
                          </div>
                          <button
                            onClick={() => setIsCompareMode(!isCompareMode)}
                            className={`text-xs font-bold px-4 py-2 rounded-full transition-all flex items-center gap-2 ${isCompareMode ? 'bg-wellness-accent text-white shadow-lg shadow-wellness-accent/20' : 'bg-wellness-soft text-wellness-ink/60 hover:bg-wellness-soft/80'}`}
                          >
                            <Columns size={14} />
                            {isCompareMode ? 'Exit Compare' : 'Compare Mode'}
                          </button>
                        </div>

                        {isCompareMode && compareIds.length > 0 && (
                          <div className="bg-wellness-accent/10 border border-wellness-accent/20 p-3 rounded-2xl flex items-center justify-between">
                            <p className="text-xs font-bold text-wellness-accent">
                              {compareIds.length === 1 ? 'Select one more scan to compare' : '2 scans selected'}
                            </p>
                            {compareIds.length === 2 && (
                              <button
                                onClick={() => setImage('compare')}
                                className="text-xs bg-wellness-accent text-white px-3 py-1.5 rounded-lg font-bold shadow-sm hover:bg-wellness-accent/90 transition-colors"
                              >
                                View Comparison
                              </button>
                            )}
                          </div>
                        )}

                        <div className="grid gap-3">
                          {history.map((item) => (
                            <div
                              key={item.id}
                              className={`relative group wellness-card flex items-center gap-4 transition-all ${isCompareMode ? (compareIds.includes(item.id) ? 'border-wellness-accent ring-2 ring-wellness-accent/20' : 'opacity-80') : 'hover:border-wellness-accent/30 hover:shadow-md'}`}
                            >
                              <button
                                onClick={() => {
                                  if (isCompareMode) {
                                    toggleCompare(item.id);
                                  } else {
                                    setImage(item.image);
                                    setResult(item.analysis);
                                  }
                                }}
                                className="flex-1 flex items-center gap-4 p-3 text-left"
                              >
                                <img src={item.image} alt="Scan" className="w-16 h-16 rounded-xl object-cover border border-wellness-ink/5" />
                                  <div className="flex-1 min-w-0">
                                    <p className="text-sm font-serif text-wellness-ink truncate">
                                      {item.analysis.split('\n').find(l => l.includes('Primary Condition'))?.replace(/#|\*|Primary Condition:/g, '').trim() || "Skin Analysis"}
                                    </p>
                                    <div className="flex items-center justify-between mt-0.5">
                                      <p className="text-[10px] text-wellness-ink/40 font-bold uppercase tracking-wider">{new Date(item.date).toLocaleDateString()}</p>
                                      {item.metrics && (
                                        <div className="flex gap-1">
                                          {item.metrics.redness !== null && <span className="text-[8px] font-bold px-1.5 py-0.5 bg-[#D97706]/10 text-[#D97706] rounded-full">R:{item.metrics.redness}</span>}
                                          {item.metrics.intensity !== null && <span className="text-[8px] font-bold px-1.5 py-0.5 bg-wellness-accent/10 text-wellness-accent rounded-full">I:{item.metrics.intensity}</span>}
                                          {item.metrics.estimatedSizeMm !== null && <span className="text-[8px] font-bold px-1.5 py-0.5 bg-wellness-ink/10 text-wellness-ink/60 rounded-full">S:{item.metrics.estimatedSizeMm}mm</span>}
                                        </div>
                                      )}
                                    </div>
                                  </div>
                                {!isCompareMode && (
                                  <div className="flex items-center pr-2">
                                    <button
                                      onClick={() => setScanToDelete(item.id)}
                                      className="p-2 text-rose-500/30 hover:text-rose-500 hover:bg-rose-50 rounded-xl transition-all"
                                      title="Delete Scan"
                                    >
                                      <X size={18} />
                                    </button>
                                    <ChevronRight size={20} className="text-wellness-ink/20" />
                                  </div>
                                )}
                              </button>
                            </div>
                          ))}
                        </div>

                          {/* Delete Scan Confirmation Modal */}
                          <AnimatePresence>
                            {scanToDelete && (
                              <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
                                <motion.div
                                  initial={{ opacity: 0 }}
                                  animate={{ opacity: 1 }}
                                  exit={{ opacity: 0 }}
                                  onClick={() => setScanToDelete(null)}
                                  className="absolute inset-0 bg-wellness-ink/40 backdrop-blur-sm"
                                />
                                <motion.div
                                  initial={{ opacity: 0, scale: 0.95, y: 20 }}
                                  animate={{ opacity: 1, scale: 1, y: 0 }}
                                  exit={{ opacity: 0, scale: 0.95, y: 20 }}
                                  className="relative w-full max-w-sm bg-white rounded-[40px] shadow-2xl p-8 text-center"
                                >
                                  <div className="w-16 h-16 bg-rose-50 rounded-full flex items-center justify-center text-rose-500 mx-auto mb-6">
                                    <ShieldAlert size={32} />
                                  </div>
                                  <h3 className="text-xl font-serif text-wellness-ink mb-2">Delete Scan?</h3>
                                  <p className="text-sm text-wellness-ink/50 mb-8">
                                    This will permanently remove this scan result from your history.
                                  </p>
                                  <div className="flex gap-3">
                                    <button
                                      onClick={() => setScanToDelete(null)}
                                      className="flex-1 py-4 bg-wellness-soft text-wellness-ink rounded-2xl font-bold hover:bg-wellness-ink/5 transition-all"
                                    >
                                      Cancel
                                    </button>
                                    <button
                                      onClick={() => {
                                        handleDeleteScan(scanToDelete);
                                        setScanToDelete(null);
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
                    )}
                  </motion.div>
                ) : image === 'compare' ? (
                  <motion.div
                    key="compare"
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    className="space-y-6"
                  >
                    <div className="flex items-center justify-between">
                      <h3 className="text-2xl font-serif text-wellness-ink">AI Comparison</h3>
                      <button onClick={() => setImage(null)} className="p-2 hover:bg-wellness-soft rounded-full transition-colors text-wellness-ink/50">
                        <X size={24} />
                      </button>
                    </div>

                    <SkinJourney 
                      history={profileHistory} 
                      language={language} 
                      initialSelectedIds={compareIds} 
                    />

                    <button
                      onClick={() => setImage(null)}
                      className="w-full bg-wellness-ink text-white py-4 rounded-2xl font-bold hover:bg-wellness-ink/90 transition-all shadow-lg hover:shadow-wellness-accent/20"
                    >
                      Back to Dashboard
                    </button>
                  </motion.div>
                ) : (
                  <motion.div
                    key="analysis"
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    className="space-y-6"
                  >
                    <div className="flex items-center justify-between mb-2">
                      <button 
                        onClick={reset}
                        className="flex items-center gap-2 text-xs font-bold text-wellness-ink/40 hover:text-wellness-accent transition-colors"
                      >
                        <RefreshCcw size={14} />
                        Back to Home
                      </button>
                      {result && (
                        <span className="text-[10px] font-black uppercase tracking-widest text-wellness-accent bg-wellness-soft px-3 py-1 rounded-full">
                          Analysis Complete
                        </span>
                      )}
                    </div>

                    <div className="relative rounded-[40px] overflow-hidden bg-wellness-soft aspect-[4/3] shadow-2xl border-4 border-white">
                      <img src={image} alt="Scan" className="w-full h-full object-cover" />
                      <button 
                        onClick={() => setSelectedScanForUV(image)}
                        className="absolute bottom-6 right-6 p-4 bg-violet-500 text-white rounded-2xl shadow-xl hover:bg-violet-600 transition-all flex items-center gap-2 font-bold text-xs"
                      >
                        <Zap size={16} /> UV Analysis
                      </button>
                      {isAnalyzing && (
                        <div className="absolute inset-0 bg-wellness-ink/40 backdrop-blur-md flex flex-col items-center justify-center text-white">
                          <Loader2 size={48} className="animate-spin mb-4 text-wellness-accent" />
                          <p className="font-serif text-2xl">Analyzing Skin...</p>
                          <p className="text-white/70 text-sm italic">Consulting AI Dermatology Models</p>
                        </div>
                      )}
                    </div>

                    {error && (
                      <div className="bg-red-50 border border-red-100 p-4 rounded-2xl text-red-700 text-sm font-medium flex items-center gap-3">
                        <Info size={18} />
                        <span>{error}</span>
                        <button onClick={() => performAnalysis(image)} className="ml-auto underline font-bold">Retry</button>
                      </div>
                    )}

                    {result && (
                      <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="space-y-6"
                      >
                        <div className="wellness-card p-8">
                          <div className="markdown-body">
                            <ReactMarkdown>{result}</ReactMarkdown>
                          </div>
                        </div>

                        <ConditionTrendChart history={history} condition={getConditionName()} />

                        <div className="grid gap-4">
                          <button
                            onClick={() => setIsLifestyleOpen(true)}
                            className="w-full bg-emerald-500 text-white py-4 rounded-2xl font-bold flex items-center justify-center gap-3 hover:bg-emerald-600 transition-all shadow-lg"
                          >
                            <Sparkles size={20} />
                            Lifestyle & Diet Advice
                          </button>

                          <button
                            onClick={fetchDetails}
                            disabled={isFetchingDetails}
                            className="w-full bg-wellness-ink text-white py-4 rounded-2xl font-bold flex items-center justify-center gap-3 hover:bg-wellness-ink/90 transition-all shadow-lg disabled:opacity-50"
                          >
                            {isFetchingDetails ? (
                              <Loader2 size={20} className="animate-spin" />
                            ) : (
                              <BookOpen size={20} className="text-wellness-accent" />
                            )}
                            Learn More about {getConditionName()}
                          </button>

                          <button
                            onClick={() => setIsMapOpen(true)}
                            className="w-full bg-wellness-accent text-white py-4 rounded-2xl font-bold flex items-center justify-center gap-3 hover:bg-wellness-accent/90 transition-all shadow-lg"
                          >
                            <MapPin size={20} />
                            Find Nearby Specialists
                          </button>

                          <button
                            onClick={generatePDF}
                            className="w-full bg-white text-wellness-ink py-4 rounded-2xl font-bold flex items-center justify-center gap-3 hover:bg-wellness-soft transition-all border border-wellness-ink/10"
                          >
                            <Download size={20} className="text-wellness-accent" />
                            Download Clinical Report
                          </button>

                          <div className="flex gap-4">
                            <button
                              onClick={() => shareAnalysis('twitter')}
                              className="flex-1 bg-[#1DA1F2] text-white py-4 rounded-2xl font-bold flex items-center justify-center gap-3 hover:opacity-90 transition-all shadow-lg"
                              title="Share on Twitter"
                            >
                              <Twitter size={20} />
                            </button>
                            <button
                              onClick={() => shareAnalysis('facebook')}
                              className="flex-1 bg-[#4267B2] text-white py-4 rounded-2xl font-bold flex items-center justify-center gap-3 hover:opacity-90 transition-all shadow-lg"
                              title="Share on Facebook"
                            >
                              <Facebook size={20} />
                            </button>
                            <button
                              onClick={() => shareAnalysis('whatsapp')}
                              className="flex-1 bg-[#25D366] text-white py-4 rounded-2xl font-bold flex items-center justify-center gap-3 hover:opacity-90 transition-all shadow-lg"
                              title="Share on WhatsApp"
                            >
                              <MessageCircle size={20} />
                            </button>
                          </div>

                          <button
                            onClick={() => {
                              setIsConsulting(true);
                              setTimeout(() => setIsConsulting(false), 2000);
                            }}
                            disabled={isConsulting}
                            className="w-full bg-wellness-ink text-white py-4 rounded-2xl font-bold flex items-center justify-center gap-3 hover:opacity-90 transition-all shadow-xl shadow-wellness-ink/20"
                          >
                            {isConsulting ? (
                              <>
                                <Loader2 size={20} className="animate-spin" />
                                Sending to Doctor...
                              </>
                            ) : (
                              <>
                                <MessageSquare size={20} className="text-wellness-accent" />
                                Consult a Doctor (Paid)
                              </>
                            )}
                          </button>
                        </div>

                        <ClinicalTrials 
                          condition={result.split('\n').find(l => l.includes('Primary Condition'))?.replace(/#|\*|Primary Condition:/g, '').trim() || ''} 
                          language={language}
                        />

                        <ProductRecommendations 
                          skinType={activeProfile.skinType}
                          scanResult={result}
                          concerns={activeProfile.concerns}
                          language={language}
                        />

                        <div className="flex gap-4">
                          <button
                            onClick={reset}
                            className="flex-1 bg-white border border-wellness-ink/10 text-wellness-ink py-4 rounded-2xl font-bold flex items-center justify-center gap-3 hover:bg-wellness-soft transition-all"
                          >
                            <RefreshCcw size={20} className="text-wellness-accent" />
                            New Scan
                          </button>
                          <button
                            onClick={() => setIsCameraOpen(true)}
                            className="flex-1 bg-wellness-accent text-white py-4 rounded-2xl font-bold flex items-center justify-center gap-3 hover:bg-wellness-accent/90 transition-all shadow-lg shadow-wellness-accent/20"
                          >
                            <CameraIcon size={20} />
                            Retake
                          </button>
                        </div>
                      </motion.div>
                    )}
                  </motion.div>
                )}
              </AnimatePresence>
              <Testimonials />
            </motion.div>
          ) : activeTab === 'chat' ? (
            <motion.div
              key="chat-tab"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="h-[calc(100vh-12rem)]"
            >
              <ChatAssistant language={language} />
            </motion.div>
          ) : activeTab === 'library' ? (
            <motion.div
              key="library-tab"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="space-y-12"
            >
              <div className="flex gap-4 p-1 bg-wellness-soft rounded-2xl">
                <button 
                  onClick={() => setIsIngredientScannerOpen(false)}
                  className={`flex-1 py-3 rounded-xl text-xs font-bold transition-all ${!isIngredientScannerOpen ? 'bg-white text-wellness-accent shadow-sm' : 'text-wellness-ink/40'}`}
                >
                  Encyclopedia
                </button>
                <button 
                  onClick={() => setIsIngredientScannerOpen(true)}
                  className={`flex-1 py-3 rounded-xl text-xs font-bold transition-all ${isIngredientScannerOpen ? 'bg-white text-wellness-accent shadow-sm' : 'text-wellness-ink/40'}`}
                >
                  Ingredient Scanner
                </button>
              </div>

              {isIngredientScannerOpen ? (
                <IngredientScanner 
                  skinType={activeProfile.skinType} 
                  concerns={activeProfile.concerns} 
                  language={language} 
                  onClose={() => setIsIngredientScannerOpen(false)} 
                />
              ) : (
                <SkinWiki language={language} />
              )}
              
              <SkinEncyclopedia language={language} history={profileHistory} />
            </motion.div>
          ) : activeTab === 'uv' ? (
            <motion.div
              key="uv-tab"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
            >
              <UVAdvisor language={language} />
            </motion.div>
          ) : activeTab === 'reminders' ? (
            <motion.div
              key="reminders-tab"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
            >
              <Reminders />
            </motion.div>
          ) : (
            <motion.div
              key="profile-tab"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="space-y-6"
            >
              <SkinProfile 
                language={language} 
                profiles={profiles}
                activeProfileId={activeProfileId}
                onProfileChange={setActiveProfileId}
                onAddProfile={handleAddProfile}
                onUpdateProfile={handleUpdateProfile}
                onDeleteProfile={handleDeleteProfile}
                history={profileHistory}
                user={currentUser}
              />
              <div className="px-4 space-y-12">
                <SkinScorecard history={profileHistory} language={language} />
                <SkinMap 
                  scans={profileHistory.map(h => ({
                    id: h.id,
                    x: h.x || Math.random() * 100 + 50, // Fallback for older scans
                    y: h.y || Math.random() * 200 + 100,
                    label: h.condition || 'Unknown',
                    date: h.date,
                    condition: h.condition || 'Analysis Pending',
                    confidence: h.confidence || 0,
                    image: h.image
                  }))} 
                />
                <SkinJourney history={profileHistory} language={language} />
                <div>
                  <h2 className="text-2xl font-serif text-wellness-ink mb-6">Health Trends</h2>
                  <TrendCharts history={profileHistory} />
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      )}
    </main>

      {/* Bottom Navigation */}
      {!isDoctorMode && (
        <div className="fixed bottom-8 left-0 right-0 px-6 z-40 pointer-events-none">
          <nav className="bg-white/90 backdrop-blur-2xl border border-white/50 px-6 py-3 rounded-[2.5rem] shadow-[0_25px_60px_rgba(0,0,0,0.15)] max-w-lg lg:max-w-2xl mx-auto pointer-events-auto">
            <div className="flex justify-between items-center">
              <NavButton 
                active={activeTab === 'scan'} 
                onClick={() => setActiveTab('scan')} 
                icon={Scan} 
                label="Scan" 
              />
              <NavButton 
                active={activeTab === 'chat'} 
                onClick={() => setActiveTab('chat')} 
                icon={MessageSquare} 
                label="Chat" 
              />
              <NavButton 
                active={activeTab === 'library'} 
                onClick={() => setActiveTab('library')} 
                icon={Book} 
                label="Library" 
              />
              <NavButton 
                active={activeTab === 'uv'} 
                onClick={() => setActiveTab('uv')} 
                icon={Sun} 
                label="Sun" 
              />
              <NavButton 
                active={activeTab === 'reminders'} 
                onClick={() => setActiveTab('reminders')} 
                icon={Clock} 
                label="Reminders" 
              />
              <NavButton 
                active={activeTab === 'profile'} 
                onClick={() => setActiveTab('profile')} 
                icon={User} 
                label="Profile" 
              />
            </div>
          </nav>
        </div>
      )}

      {/* Detailed Info Modal */}
      <AnimatePresence>
        {showDetailsModal && detailedInfo && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-end sm:items-center justify-center p-4"
          >
            <motion.div
              initial={{ y: "100%" }}
              animate={{ y: 0 }}
              exit={{ y: "100%" }}
              className="bg-wellness-bg w-full max-w-2xl rounded-t-[3rem] sm:rounded-[3rem] max-h-[90vh] overflow-hidden flex flex-col shadow-2xl border-t border-white"
            >
              <div className="p-8 border-b border-wellness-ink/5 flex items-center justify-between bg-white/50 backdrop-blur-md sticky top-0 z-10">
                <div className="flex items-center gap-4">
                  <div className="p-3 bg-wellness-accent/10 rounded-2xl text-wellness-accent">
                    <Info size={24} />
                  </div>
                  <h3 className="text-2xl font-serif text-wellness-ink">Medical Information</h3>
                </div>
                <button
                  onClick={() => setShowDetailsModal(false)}
                  className="p-2 hover:bg-wellness-soft rounded-full transition-colors text-wellness-ink/30"
                >
                  <X size={28} />
                </button>
              </div>
              
              <div className="flex-1 overflow-y-auto p-8">
                <div className="markdown-body">
                  <ReactMarkdown>{detailedInfo}</ReactMarkdown>
                </div>
                
                <div className="mt-10 p-6 bg-wellness-soft rounded-[2rem] border border-wellness-ink/5">
                  <p className="text-xs text-wellness-ink/50 leading-relaxed italic">
                    <span className="font-bold not-italic text-wellness-ink uppercase tracking-tighter mr-1">Disclaimer:</span> 
                    This information is for educational purposes only and does not constitute medical advice. Always consult with a qualified healthcare provider for diagnosis and treatment.
                  </p>
                </div>
              </div>
              
              <div className="p-8 border-t border-wellness-ink/5 bg-white/50 backdrop-blur-md">
                <button
                  onClick={() => setShowDetailsModal(false)}
                  className="w-full bg-wellness-ink text-white py-5 rounded-2xl font-bold hover:bg-wellness-ink/90 transition-all shadow-lg"
                >
                  Close
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Footer */}
      <footer className="p-12 text-center text-wellness-ink/30 text-xs">
        <p className="font-serif text-sm text-wellness-ink/40 mb-2">DermScan AI</p>
        <p>© 2026 • Developed By Syed Afseh Ehsani</p>
        <p className="mt-2 italic">Privacy focused • Local history only</p>
      </footer>

      {/* Camera Modal */}
      <AnimatePresence>
        {isCameraOpen && (
          <Camera
            onCapture={handleCapture}
            onClose={() => setIsCameraOpen(false)}
          />
        )}
      </AnimatePresence>

      {/* Map Modal */}
      <AnimatePresence>
        {isMapOpen && (
          <DermatologistFinder
            onClose={() => setIsMapOpen(false)}
          />
        )}
      </AnimatePresence>

      {/* UV Filter Modal */}
      <AnimatePresence>
        {selectedScanForUV && (
          <UVFilter 
            image={selectedScanForUV} 
            onClose={() => setSelectedScanForUV(null)} 
          />
        )}
      </AnimatePresence>

      {/* Symptom Checker Modal */}
      <AnimatePresence>
        {isSymptomCheckerOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[60] bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4"
          >
            <div className="w-full max-w-lg">
              <SymptomChecker 
                onComplete={handleSymptomComplete}
                onCancel={() => {
                  setIsSymptomCheckerOpen(false);
                  setPendingImage(null);
                }}
              />
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Location Picker Modal */}
      <AnimatePresence>
        {isLocationPickerOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[70] bg-slate-900/60 backdrop-blur-sm flex items-end sm:items-center justify-center p-4"
          >
            <motion.div
              initial={{ y: "100%" }}
              animate={{ y: 0 }}
              exit={{ y: "100%" }}
              className="bg-wellness-bg w-full max-w-lg rounded-t-[3rem] sm:rounded-[3rem] overflow-hidden shadow-2xl border-t border-white"
            >
              <BodyLocationPicker 
                onSelect={handleLocationSelect}
                onCancel={skipLocation}
              />
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Lifestyle Advice Modal */}
      <AnimatePresence>
        {isLifestyleOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[60] bg-slate-900/60 backdrop-blur-sm flex items-end sm:items-center justify-center p-4"
          >
            <motion.div
              initial={{ y: "100%" }}
              animate={{ y: 0 }}
              exit={{ y: "100%" }}
              className="bg-wellness-bg w-full max-w-3xl rounded-t-[3rem] sm:rounded-[3rem] max-h-[90vh] overflow-y-auto shadow-2xl border-t border-white"
            >
              <div className="sticky top-0 z-10 p-4 flex justify-end">
                <button onClick={() => setIsLifestyleOpen(false)} className="p-2 bg-white/10 backdrop-blur-md rounded-full text-wellness-ink/30">
                  <X size={24} />
                </button>
              </div>
              <LifestyleAdvisor 
                condition={getConditionName()} 
                language={language} 
              />
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
      {/* Body Location Picker Modal */}
      <AnimatePresence>
        {isLocationPickerOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[70] bg-slate-900/80 backdrop-blur-md flex items-center justify-center p-4"
          >
            <BodyLocationPicker 
              onSelect={handleLocationSelect}
              onCancel={skipLocation}
            />
          </motion.div>
        )}
      </AnimatePresence>
      {/* Onboarding Flow */}
      <AnimatePresence>
        {currentUser && !hasCompletedOnboarding && (
          <OnboardingFlow onComplete={completeOnboarding} />
        )}
      </AnimatePresence>
    </div>
  );
}
