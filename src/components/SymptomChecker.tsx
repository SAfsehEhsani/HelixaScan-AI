import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { ChevronRight, ChevronLeft, CheckCircle2, AlertCircle, HelpCircle } from 'lucide-react';

interface Question {
  id: string;
  text: string;
  options: string[];
}

const QUESTIONS: Question[] = [
  {
    id: 'sensation',
    text: 'What does the area feel like?',
    options: ['Itchy', 'Painful/Tender', 'Burning', 'Numb', 'No sensation']
  },
  {
    id: 'duration',
    text: 'How long has this been present?',
    options: ['Less than 24 hours', '1-3 days', '1 week', 'More than a month']
  },
  {
    id: 'spreading',
    text: 'Is it spreading to other areas?',
    options: ['Yes, rapidly', 'Yes, slowly', 'No, it is localized']
  },
  {
    id: 'triggers',
    text: 'Did anything specific trigger it?',
    options: ['New product/detergent', 'Sun exposure', 'Stress', 'Food/Allergy', 'Unknown']
  }
];

interface SymptomCheckerProps {
  onComplete: (answers: { question: string, answer: string }[]) => void;
  onCancel: () => void;
}

export const SymptomChecker: React.FC<SymptomCheckerProps> = ({ onComplete, onCancel }) => {
  const [currentStep, setCurrentStep] = useState(0);
  const [answers, setAnswers] = useState<Record<string, string>>({});

  const handleSelect = (option: string) => {
    const newAnswers = { ...answers, [QUESTIONS[currentStep].id]: option };
    setAnswers(newAnswers);
    
    if (currentStep < QUESTIONS.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      const formattedAnswers = QUESTIONS.map(q => ({
        question: q.text,
        answer: newAnswers[q.id]
      }));
      onComplete(formattedAnswers);
    }
  };

  const goBack = () => {
    if (currentStep > 0) setCurrentStep(currentStep - 1);
  };

  return (
    <div className="wellness-card p-8 border-wellness-ink/5 overflow-hidden">
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-wellness-accent/10 rounded-xl text-wellness-accent">
            <HelpCircle size={20} />
          </div>
          <h3 className="text-xl font-serif text-wellness-ink">Symptom Checker</h3>
        </div>
        <button onClick={onCancel} className="text-wellness-ink/30 hover:text-wellness-ink transition-colors">
          <X size={20} />
        </button>
      </div>

      <div className="mb-8">
        <div className="flex justify-between text-[10px] font-bold text-wellness-ink/40 uppercase tracking-widest mb-2">
          <span>Step {currentStep + 1} of {QUESTIONS.length}</span>
          <span>{Math.round(((currentStep + 1) / QUESTIONS.length) * 100)}% Complete</span>
        </div>
        <div className="h-1.5 bg-wellness-soft rounded-full overflow-hidden">
          <motion.div 
            className="h-full bg-wellness-accent"
            initial={{ width: 0 }}
            animate={{ width: `${((currentStep + 1) / QUESTIONS.length) * 100}%` }}
          />
        </div>
      </div>

      <AnimatePresence mode="wait">
        <motion.div
          key={currentStep}
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -20 }}
          className="space-y-6"
        >
          <h4 className="text-lg font-serif text-wellness-ink leading-tight">
            {QUESTIONS[currentStep].text}
          </h4>

          <div className="grid gap-3">
            {QUESTIONS[currentStep].options.map((option) => (
              <button
                key={option}
                onClick={() => handleSelect(option)}
                className={`w-full p-4 rounded-2xl text-left transition-all border ${
                  answers[QUESTIONS[currentStep].id] === option
                    ? 'bg-wellness-accent text-white border-wellness-accent shadow-lg shadow-wellness-accent/20'
                    : 'bg-wellness-soft text-wellness-ink border-transparent hover:border-wellness-ink/10'
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="font-medium">{option}</span>
                  {answers[QUESTIONS[currentStep].id] === option && <CheckCircle2 size={18} />}
                </div>
              </button>
            ))}
          </div>
        </motion.div>
      </AnimatePresence>

      <div className="mt-12 flex items-center justify-between">
        <button
          onClick={goBack}
          disabled={currentStep === 0}
          className="flex items-center gap-2 text-sm font-bold text-wellness-ink/40 hover:text-wellness-ink disabled:opacity-0 transition-all"
        >
          <ChevronLeft size={20} /> Back
        </button>
        
        <div className="flex gap-1">
          {QUESTIONS.map((_, i) => (
            <div 
              key={i} 
              className={`w-1.5 h-1.5 rounded-full transition-all ${i === currentStep ? 'bg-wellness-accent w-4' : 'bg-wellness-ink/10'}`} 
            />
          ))}
        </div>
      </div>
    </div>
  );
};

import { X } from 'lucide-react';
