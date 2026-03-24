import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Users, 
  Clock, 
  ShieldAlert, 
  Search, 
  Filter, 
  ChevronRight, 
  MessageSquare, 
  FileText, 
  CheckCircle2, 
  AlertCircle,
  Stethoscope,
  Activity,
  User,
  ExternalLink,
  ArrowRight,
  Plus,
  X,
  MapPin,
  Phone,
  Calendar,
  ClipboardList
} from 'lucide-react';

interface Patient {
  id: string;
  name: string;
  age: number;
  lastScan: string;
  urgency: 'Low' | 'Medium' | 'High';
  condition: string;
  status: 'Pending' | 'Reviewed' | 'Action Required';
  image: string;
  address?: string;
  phone?: string;
  history?: { date: string; image: string; metrics: any }[];
  differentialDiagnosis?: { condition: string; confidence: number }[];
}

const MOCK_PATIENTS: Patient[] = [
  {
    id: '1',
    name: 'Sarah Johnson',
    age: 34,
    lastScan: '2 hours ago',
    urgency: 'High',
    condition: 'Suspicious Nevus',
    status: 'Pending',
    image: 'https://picsum.photos/seed/skin1/200/200',
    history: [
      { date: '2026-03-21', image: 'https://picsum.photos/seed/skin1/200/200', metrics: { size: 4.2, redness: 65 } },
      { date: '2026-02-15', image: 'https://picsum.photos/seed/skin1_old/200/200', metrics: { size: 3.8, redness: 40 } }
    ],
    differentialDiagnosis: [
      { condition: 'Dysplastic Nevus', confidence: 85 },
      { condition: 'Malignant Melanoma', confidence: 12 },
      { condition: 'Seborrheic Keratosis', confidence: 3 }
    ]
  },
  {
    id: '2',
    name: 'Michael Chen',
    age: 45,
    lastScan: '5 hours ago',
    urgency: 'Medium',
    condition: 'Psoriasis Flare-up',
    status: 'Action Required',
    image: 'https://picsum.photos/seed/skin2/200/200',
    differentialDiagnosis: [
      { condition: 'Psoriasis Vulgaris', confidence: 92 },
      { condition: 'Nummular Eczema', confidence: 8 }
    ]
  },
  {
    id: '3',
    name: 'Emma Wilson',
    age: 28,
    lastScan: '1 day ago',
    urgency: 'Low',
    condition: 'Mild Acne',
    status: 'Reviewed',
    image: 'https://picsum.photos/seed/skin3/200/200',
    differentialDiagnosis: [
      { condition: 'Acne Vulgaris', confidence: 98 },
      { condition: 'Rosacea', confidence: 2 }
    ]
  }
];

export const DoctorDashboard: React.FC = () => {
  const [patients, setPatients] = useState<Patient[]>(MOCK_PATIENTS);
  const [selectedPatient, setSelectedPatient] = useState<Patient | null>(null);
  const [filter, setFilter] = useState<'All' | 'High' | 'Medium' | 'Low'>('All');
  const [showAddModal, setShowAddModal] = useState(false);
  const [newPatient, setNewPatient] = useState({
    name: '',
    age: '',
    address: '',
    phone: '',
    condition: '',
    urgency: 'Low' as 'Low' | 'Medium' | 'High'
  });

  const filteredPatients = patients.filter(p => filter === 'All' || p.urgency === filter);

  const handleAddPatient = (e: React.FormEvent) => {
    e.preventDefault();
    const patient: Patient = {
      id: Math.random().toString(36).substr(2, 9),
      name: newPatient.name,
      age: parseInt(newPatient.age) || 0,
      address: newPatient.address,
      phone: newPatient.phone,
      condition: newPatient.condition,
      urgency: newPatient.urgency,
      lastScan: 'Just now',
      status: 'Pending',
      image: `https://picsum.photos/seed/${newPatient.name}/200/200`
    };
    setPatients([patient, ...patients]);
    setShowAddModal(false);
    setNewPatient({ name: '', age: '', address: '', phone: '', condition: '', urgency: 'Low' });
  };

  return (
    <div className="min-h-screen bg-[#F8F9FA] p-6 lg:p-10">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-serif text-wellness-ink flex items-center gap-3">
              <Stethoscope className="text-wellness-accent" size={32} />
              Clinician Dashboard
            </h1>
            <p className="text-wellness-ink/60 mt-1">AI-Assisted Triage & Patient Monitoring</p>
          </div>
          <div className="flex items-center gap-3">
            <button 
              onClick={() => setShowAddModal(true)}
              className="bg-wellness-ink text-white rounded-2xl px-4 py-2 flex items-center gap-2 shadow-lg hover:opacity-90 transition-all"
            >
              <Plus size={18} />
              <span className="font-bold">Add Patient</span>
            </button>
            <div className="bg-white border border-wellness-ink/10 rounded-2xl px-4 py-2 flex items-center gap-2 shadow-sm">
              <Users size={18} className="text-wellness-ink/40" />
              <span className="font-bold text-wellness-ink">{patients.length} Active Patients</span>
            </div>
            <div className="bg-wellness-accent text-white rounded-2xl px-4 py-2 flex items-center gap-2 shadow-lg shadow-wellness-accent/20">
              <Activity size={18} />
              <span className="font-bold">Live Triage</span>
            </div>
          </div>
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Patient List */}
          <div className={`lg:col-span-1 space-y-6 ${selectedPatient ? 'hidden lg:block' : 'block'}`}>
            <div className="wellness-card p-4 space-y-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-wellness-ink/30 dark:text-dark-ink/30" size={18} />
                <input 
                  type="text" 
                  placeholder="Search patients..." 
                  className="w-full pl-10 pr-4 py-3 bg-wellness-soft dark:bg-dark-bg rounded-xl border-none focus:ring-2 focus:ring-wellness-accent/20 dark:focus:ring-dark-accent/20 text-sm text-wellness-ink dark:text-dark-ink"
                />
              </div>
              <div className="flex gap-2">
                {['All', 'High', 'Medium', 'Low'].map((f) => (
                  <button
                    key={f}
                    onClick={() => setFilter(f as any)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                      filter === f 
                        ? 'bg-wellness-ink dark:bg-dark-accent text-white' 
                        : 'bg-wellness-soft dark:bg-dark-bg text-wellness-ink/60 dark:text-dark-ink/60 hover:bg-wellness-ink/5 dark:hover:bg-white/5'
                    }`}
                  >
                    {f}
                  </button>
                ))}
              </div>
            </div>

            <div className="space-y-3">
              {filteredPatients.map((patient) => (
                <motion.button
                  key={patient.id}
                  layoutId={patient.id}
                  onClick={() => setSelectedPatient(patient)}
                  className={`w-full text-left p-4 rounded-3xl transition-all border ${
                    selectedPatient?.id === patient.id 
                      ? 'bg-white dark:bg-dark-accent border-wellness-accent dark:border-dark-accent shadow-xl shadow-wellness-accent/5' 
                      : 'bg-white/50 dark:bg-dark-soft/50 border-transparent hover:border-wellness-ink/10 dark:hover:border-white/10'
                  }`}
                >
                  <div className="flex items-center gap-4">
                    <div className="relative">
                      <img src={patient.image} alt={patient.name} className="w-12 h-12 rounded-2xl object-cover" />
                      <div className={`absolute -top-1 -right-1 w-4 h-4 rounded-full border-2 border-white dark:border-dark-bg ${
                        patient.urgency === 'High' ? 'bg-red-500' : 
                        patient.urgency === 'Medium' ? 'bg-orange-500' : 'bg-green-500'
                      }`} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h4 className={`font-bold truncate ${selectedPatient?.id === patient.id ? 'text-wellness-ink dark:text-white' : 'text-wellness-ink dark:text-dark-ink'}`}>{patient.name}</h4>
                      <p className={`text-xs truncate ${selectedPatient?.id === patient.id ? 'text-wellness-ink/50 dark:text-white/50' : 'text-wellness-ink/50 dark:text-dark-ink/50'}`}>{patient.condition}</p>
                    </div>
                    <ChevronRight size={18} className={selectedPatient?.id === patient.id ? 'text-wellness-ink/20 dark:text-white/20' : 'text-wellness-ink/20 dark:text-dark-ink/20'} />
                  </div>
                </motion.button>
              ))}
            </div>
          </div>

          {/* Patient Detail / Triage View */}
          <div className={`lg:col-span-2 ${selectedPatient ? 'block' : 'hidden lg:block'}`}>
            <AnimatePresence mode="wait">
              {selectedPatient ? (
                <motion.div
                  key={selectedPatient.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  className="wellness-card p-8 space-y-8 min-h-[600px]"
                >
                  <div className="flex flex-col sm:flex-row items-start justify-between gap-6">
                    <div className="flex flex-col sm:flex-row gap-6 w-full">
                      <div className="flex items-center justify-between w-full sm:w-auto">
                        <img src={selectedPatient.image} alt={selectedPatient.name} className="w-24 h-24 rounded-3xl object-cover shadow-lg" />
                        <button 
                          onClick={() => setSelectedPatient(null)}
                          className="lg:hidden p-3 bg-wellness-soft rounded-2xl text-wellness-ink hover:bg-wellness-ink/5 transition-colors"
                        >
                          <X size={20} />
                        </button>
                      </div>
                      <div className="flex-1">
                        <div className="flex flex-wrap items-center gap-3 mb-2">
                          <h2 className="text-2xl font-serif text-wellness-ink">{selectedPatient.name}</h2>
                          <span className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest ${
                            selectedPatient.urgency === 'High' ? 'bg-red-100 text-red-600' : 
                            selectedPatient.urgency === 'Medium' ? 'bg-orange-100 text-orange-600' : 'bg-green-100 text-green-600'
                          }`}>
                            {selectedPatient.urgency} Priority
                          </span>
                        </div>
                        <div className="flex flex-wrap gap-4 text-sm text-wellness-ink/60">
                          <span className="flex items-center gap-1"><User size={14} /> {selectedPatient.age} years</span>
                          <span className="flex items-center gap-1"><Clock size={14} /> Last scan: {selectedPatient.lastScan}</span>
                          {selectedPatient.phone && <span className="flex items-center gap-1"><Phone size={14} /> {selectedPatient.phone}</span>}
                        </div>
                        {selectedPatient.address && (
                          <div className="mt-2 text-xs text-wellness-ink/40 flex items-center gap-1">
                            <MapPin size={12} /> {selectedPatient.address}
                          </div>
                        )}
                      </div>
                    </div>
                    <div className="hidden sm:flex gap-2 self-start">
                      <button className="p-3 bg-wellness-soft dark:bg-dark-bg rounded-2xl text-wellness-ink dark:text-dark-ink hover:bg-wellness-ink/5 dark:hover:bg-white/5 transition-colors">
                        <MessageSquare size={20} />
                      </button>
                      <button className="p-3 bg-wellness-soft dark:bg-dark-bg rounded-2xl text-wellness-ink dark:text-dark-ink hover:bg-wellness-ink/5 dark:hover:bg-white/5 transition-colors">
                        <FileText size={20} />
                      </button>
                    </div>
                  </div>

                  <div className="grid md:grid-cols-2 gap-8">
                    <div className="space-y-8">
                      <div>
                        <h3 className="text-sm font-bold text-wellness-ink/40 uppercase tracking-widest mb-4">AI Differential Diagnosis</h3>
                        <div className="space-y-3">
                          {selectedPatient.differentialDiagnosis?.map((dd, idx) => (
                            <div key={idx} className="bg-white p-4 rounded-2xl border border-wellness-ink/5 flex items-center justify-between">
                              <span className="font-bold text-wellness-ink">{dd.condition}</span>
                              <div className="flex items-center gap-2">
                                <div className="w-24 h-2 bg-wellness-soft rounded-full overflow-hidden">
                                  <div 
                                    className="h-full bg-wellness-accent" 
                                    style={{ width: `${dd.confidence}%` }}
                                  />
                                </div>
                                <span className="text-xs font-bold text-wellness-accent">{dd.confidence}%</span>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>

                      {selectedPatient.history && (
                        <div>
                          <h3 className="text-sm font-bold text-wellness-ink/40 uppercase tracking-widest mb-4">Progress Tracking</h3>
                          <div className="grid grid-cols-2 gap-4">
                            {selectedPatient.history.map((h, idx) => (
                              <div key={idx} className="space-y-2">
                                <div className="aspect-square rounded-2xl overflow-hidden border border-wellness-ink/10">
                                  <img src={h.image} alt={h.date} className="w-full h-full object-cover" />
                                </div>
                                <div className="flex justify-between items-center px-1">
                                  <span className="text-[10px] font-bold text-wellness-ink/40">{h.date}</span>
                                  <span className="text-[10px] font-bold text-wellness-accent">{h.metrics.size}mm</span>
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>

                    <div className="space-y-8">
                      <div>
                        <h3 className="text-sm font-bold text-wellness-ink/40 uppercase tracking-widest mb-4">Clinical Notes & Treatment</h3>
                        <div className="bg-wellness-soft/50 p-6 rounded-3xl border border-wellness-ink/5 mb-4">
                          <p className="text-wellness-ink leading-relaxed text-sm">
                            AI Analysis detected asymmetrical borders and color variegation. Urgency level set to {selectedPatient.urgency} based on morphological features.
                          </p>
                        </div>
                        <textarea 
                          placeholder="Add clinical notes or adjust prescription..."
                          className="w-full h-40 p-4 bg-wellness-soft rounded-3xl border-none focus:ring-2 focus:ring-wellness-accent/20 text-sm resize-none"
                        />
                      </div>

                      <div className="space-y-4">
                        <button className="w-full py-4 bg-wellness-ink text-white rounded-2xl font-bold hover:bg-wellness-ink/90 transition-all flex items-center justify-center gap-2 shadow-lg">
                          Update Treatment Plan <ArrowRight size={18} />
                        </button>
                        <div className="grid grid-cols-2 gap-3">
                          <button className="flex items-center justify-center gap-2 p-4 bg-emerald-50 text-emerald-600 rounded-2xl font-bold hover:bg-emerald-100 transition-all">
                            <CheckCircle2 size={18} /> Approve
                          </button>
                          <button className="flex items-center justify-center gap-2 p-4 bg-red-50 text-red-600 rounded-2xl font-bold hover:bg-red-100 transition-all">
                            <AlertCircle size={18} /> Flag Case
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                </motion.div>
              ) : (
                <div className="h-full flex flex-col items-center justify-center text-center p-12 wellness-card border-dashed border-2 border-wellness-ink/10 dark:border-white/10 bg-transparent">
                  <div className="w-20 h-20 bg-wellness-soft dark:bg-dark-soft rounded-full flex items-center justify-center mb-6">
                    <Users size={40} className="text-wellness-ink/20 dark:text-dark-ink/20" />
                  </div>
                  <h3 className="text-xl font-serif text-wellness-ink/40 dark:text-dark-ink/40">Select a patient to begin triage</h3>
                  <p className="text-wellness-ink/30 dark:text-dark-ink/30 mt-2 max-w-xs">Review AI-analyzed scans and provide clinical guidance remotely.</p>
                </div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>

      {/* Add Patient Modal */}
      <AnimatePresence>
        {showAddModal && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowAddModal(false)}
              className="absolute inset-0 bg-wellness-ink/40 backdrop-blur-sm"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="relative w-full max-w-lg bg-white dark:bg-dark-soft rounded-[40px] shadow-2xl overflow-hidden max-h-[90vh] overflow-y-auto"
            >
              <div className="p-8">
                <div className="flex items-center justify-between mb-8">
                  <h2 className="text-2xl font-serif text-wellness-ink dark:text-dark-ink">Register New Patient</h2>
                  <button 
                    onClick={() => setShowAddModal(false)}
                    className="p-2 hover:bg-wellness-soft dark:hover:bg-dark-bg rounded-full transition-colors"
                  >
                    <X size={24} className="text-wellness-ink/40 dark:text-dark-ink/40" />
                  </button>
                </div>

                <form onSubmit={handleAddPatient} className="space-y-6">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <label className="text-[10px] font-bold text-wellness-ink/40 dark:text-dark-ink/40 uppercase tracking-widest px-1">Full Name</label>
                      <div className="relative">
                        <User className="absolute left-4 top-1/2 -translate-y-1/2 text-wellness-ink/20 dark:text-dark-ink/20" size={18} />
                        <input
                          required
                          type="text"
                          value={newPatient.name}
                          onChange={e => setNewPatient({...newPatient, name: e.target.value})}
                          placeholder="John Doe"
                          className="w-full pl-12 pr-4 py-4 bg-wellness-soft dark:bg-dark-bg rounded-2xl border-none focus:ring-2 focus:ring-wellness-accent/20 dark:focus:ring-dark-accent/20 text-sm text-wellness-ink dark:text-dark-ink"
                        />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <label className="text-[10px] font-bold text-wellness-ink/40 dark:text-dark-ink/40 uppercase tracking-widest px-1">Age</label>
                      <div className="relative">
                        <Calendar className="absolute left-4 top-1/2 -translate-y-1/2 text-wellness-ink/20 dark:text-dark-ink/20" size={18} />
                        <input
                          required
                          type="number"
                          value={newPatient.age}
                          onChange={e => setNewPatient({...newPatient, age: e.target.value})}
                          placeholder="30"
                          className="w-full pl-12 pr-4 py-4 bg-wellness-soft dark:bg-dark-bg rounded-2xl border-none focus:ring-2 focus:ring-wellness-accent/20 dark:focus:ring-dark-accent/20 text-sm text-wellness-ink dark:text-dark-ink"
                        />
                      </div>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label className="text-[10px] font-bold text-wellness-ink/40 dark:text-dark-ink/40 uppercase tracking-widest px-1">Phone Number</label>
                    <div className="relative">
                      <Phone className="absolute left-4 top-1/2 -translate-y-1/2 text-wellness-ink/20 dark:text-dark-ink/20" size={18} />
                      <input
                        required
                        type="tel"
                        value={newPatient.phone}
                        onChange={e => setNewPatient({...newPatient, phone: e.target.value})}
                        placeholder="+1 (555) 000-0000"
                        className="w-full pl-12 pr-4 py-4 bg-wellness-soft dark:bg-dark-bg rounded-2xl border-none focus:ring-2 focus:ring-wellness-accent/20 dark:focus:ring-dark-accent/20 text-sm text-wellness-ink dark:text-dark-ink"
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label className="text-[10px] font-bold text-wellness-ink/40 dark:text-dark-ink/40 uppercase tracking-widest px-1">Address</label>
                    <div className="relative">
                      <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 text-wellness-ink/20 dark:text-dark-ink/20" size={18} />
                      <input
                        required
                        type="text"
                        value={newPatient.address}
                        onChange={e => setNewPatient({...newPatient, address: e.target.value})}
                        placeholder="123 Medical Way, Health City"
                        className="w-full pl-12 pr-4 py-4 bg-wellness-soft dark:bg-dark-bg rounded-2xl border-none focus:ring-2 focus:ring-wellness-accent/20 dark:focus:ring-dark-accent/20 text-sm text-wellness-ink dark:text-dark-ink"
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label className="text-[10px] font-bold text-wellness-ink/40 uppercase tracking-widest px-1">Reason for Visit</label>
                    <div className="relative">
                      <ClipboardList className="absolute left-4 top-1/2 -translate-y-1/2 text-wellness-ink/20" size={18} />
                      <input
                        required
                        type="text"
                        value={newPatient.condition}
                        onChange={e => setNewPatient({...newPatient, condition: e.target.value})}
                        placeholder="e.g., Routine check-up, Specific condition, Follow-up"
                        className="w-full pl-12 pr-4 py-4 bg-wellness-soft rounded-2xl border-none focus:ring-2 focus:ring-wellness-accent/20 text-sm"
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label className="text-[10px] font-bold text-wellness-ink/40 uppercase tracking-widest px-1">Urgency Level</label>
                    <div className="flex gap-2">
                      {(['Low', 'Medium', 'High'] as const).map((u) => (
                        <button
                          key={u}
                          type="button"
                          onClick={() => setNewPatient({...newPatient, urgency: u})}
                          className={`flex-1 py-3 rounded-2xl text-xs font-bold transition-all border ${
                            newPatient.urgency === u 
                              ? u === 'High' ? 'bg-red-500 text-white border-red-500' :
                                u === 'Medium' ? 'bg-orange-500 text-white border-orange-500' :
                                'bg-green-500 text-white border-green-500'
                              : 'bg-wellness-soft text-wellness-ink/40 border-transparent'
                          }`}
                        >
                          {u}
                        </button>
                      ))}
                    </div>
                  </div>

                  <button 
                    type="submit"
                    className="w-full py-5 bg-wellness-accent text-white rounded-3xl font-bold shadow-xl shadow-wellness-accent/20 hover:opacity-90 transition-all mt-4"
                  >
                    Complete Registration
                  </button>
                </form>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};
