import React, { useState, useEffect } from 'react';
import { Clock, Plus, Trash2, Bell, BellOff, CheckCircle2, AlertCircle } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface Reminder {
  id: string;
  title: string;
  time: string;
  days: string[];
  active: boolean;
}

export const Reminders: React.FC = () => {
  const [reminders, setReminders] = useState<Reminder[]>(() => {
    const saved = localStorage.getItem('dermscan_reminders');
    return saved ? JSON.parse(saved) : [
      { id: '1', title: 'Apply Sunscreen', time: '08:00', days: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'], active: true },
      { id: '2', title: 'Moisturize Skin', time: '21:00', days: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'], active: true }
    ];
  });

  const [isAdding, setIsAdding] = useState(false);
  const [newTitle, setNewTitle] = useState('');
  const [newTime, setNewTime] = useState('08:00');

  useEffect(() => {
    localStorage.setItem('dermscan_reminders', JSON.stringify(reminders));
  }, [reminders]);

  const addReminder = () => {
    if (!newTitle.trim()) return;
    const reminder: Reminder = {
      id: Math.random().toString(36).substr(2, 9),
      title: newTitle,
      time: newTime,
      days: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
      active: true
    };
    setReminders([...reminders, reminder]);
    setNewTitle('');
    setIsAdding(false);
  };

  const deleteReminder = (id: string) => {
    setReminders(reminders.filter(r => r.id !== id));
  };

  const toggleReminder = (id: string) => {
    setReminders(reminders.map(r => r.id === id ? { ...r, active: !r.active } : r));
  };

  return (
    <div className="space-y-12">
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        className="flex items-center justify-between px-2"
      >
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 bg-wellness-accent/10 text-wellness-accent rounded-2xl flex items-center justify-center shadow-sm">
            <Clock size={24} />
          </div>
          <div>
            <p className="section-label">Consistency Protocol</p>
            <h3 className="text-3xl font-serif text-wellness-ink">Treatment Reminders</h3>
          </div>
        </div>
        <button
          onClick={() => setIsAdding(true)}
          className="w-12 h-12 bg-wellness-accent text-white rounded-2xl hover:bg-wellness-accent/90 transition-all shadow-xl shadow-wellness-accent/20 flex items-center justify-center"
        >
          <Plus size={24} />
        </button>
      </motion.div>

      <AnimatePresence>
        {isAdding && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="bg-white p-8 rounded-[2.5rem] border border-wellness-ink/5 shadow-2xl space-y-6"
          >
            <div className="space-y-2">
              <label className="text-[10px] font-bold text-wellness-ink/40 uppercase tracking-widest">Treatment Name</label>
              <input
                type="text"
                value={newTitle}
                onChange={(e) => setNewTitle(e.target.value)}
                placeholder="e.g., Apply Eczema Cream"
                className="w-full bg-wellness-soft border border-transparent rounded-2xl px-6 py-4 text-sm focus:bg-white focus:border-wellness-ink/5 outline-none transition-all"
              />
            </div>
            <div className="space-y-2">
              <label className="text-[10px] font-bold text-wellness-ink/40 uppercase tracking-widest">Time</label>
              <input
                type="time"
                value={newTime}
                onChange={(e) => setNewTime(e.target.value)}
                className="w-full bg-wellness-soft border border-transparent rounded-2xl px-6 py-4 text-sm focus:bg-white focus:border-wellness-ink/5 outline-none transition-all"
              />
            </div>
            <div className="flex gap-3">
              <button
                onClick={() => setIsAdding(false)}
                className="flex-1 py-4 text-sm font-bold text-wellness-ink/40 bg-wellness-soft rounded-2xl hover:bg-wellness-ink/5 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={addReminder}
                className="flex-1 py-4 text-sm font-bold bg-wellness-accent text-white rounded-2xl hover:bg-wellness-accent/90 transition-all shadow-lg shadow-wellness-accent/20"
              >
                Add Reminder
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="space-y-4">
        {reminders.length === 0 ? (
          <div className="text-center py-20 wellness-card border-dashed">
            <Clock size={48} className="mx-auto text-wellness-soft mb-4" />
            <p className="text-wellness-ink/50 font-serif text-lg">No reminders set yet</p>
            <p className="text-[10px] text-wellness-ink/30 uppercase tracking-widest font-bold mt-2">Stay consistent with your skin care</p>
          </div>
        ) : (
          reminders.map((reminder) => (
            <motion.div
              key={reminder.id}
              layout
              className={`wellness-card p-6 flex items-center gap-6 ${!reminder.active && 'opacity-50 grayscale'}`}
            >
              <button
                onClick={() => toggleReminder(reminder.id)}
                className={`w-14 h-14 rounded-2xl transition-all flex items-center justify-center ${reminder.active ? 'bg-wellness-accent text-white shadow-lg shadow-wellness-accent/20' : 'bg-wellness-soft text-wellness-ink/30'}`}
              >
                {reminder.active ? <Bell size={24} /> : <BellOff size={24} />}
              </button>
              <div className="flex-1">
                <h4 className="text-lg font-serif font-medium text-wellness-ink">{reminder.title}</h4>
                <div className="flex items-center gap-3 text-[10px] text-wellness-ink/40 font-bold uppercase tracking-widest mt-1">
                  <div className="flex items-center gap-1">
                    <Clock size={12} />
                    <span>{reminder.time}</span>
                  </div>
                  <span className="w-1 h-1 rounded-full bg-wellness-ink/20" />
                  <span>Daily Protocol</span>
                </div>
              </div>
              <button
                onClick={() => deleteReminder(reminder.id)}
                className="p-3 text-wellness-ink/20 hover:text-rose-500 hover:bg-rose-50 rounded-xl transition-all"
              >
                <Trash2 size={20} />
              </button>
            </motion.div>
          ))
        )}
      </div>

      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        className="bg-wellness-soft rounded-[2.5rem] p-8 border border-wellness-ink/5 flex gap-6"
      >
        <div className="p-4 bg-white rounded-2xl text-wellness-accent shadow-sm h-fit">
          <CheckCircle2 size={28} />
        </div>
        <div>
          <h4 className="text-xl font-serif font-medium text-wellness-ink mb-2">Consistency is Key</h4>
          <p className="text-sm text-wellness-ink/60 leading-relaxed italic">
            Dermatological treatments work best when applied consistently. Use these reminders to ensure you never miss a step in your clinical routine.
          </p>
        </div>
      </motion.div>
    </div>
  );
};
