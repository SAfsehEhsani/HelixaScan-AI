import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Camera, BookOpen, Users, MapPin, ChevronRight, Check } from 'lucide-react';

interface OnboardingStep {
  title: string;
  description: string;
  icon: React.ReactNode;
  color: string;
}

const steps: OnboardingStep[] = [
  {
    title: "AI Skin Analysis",
    description: "Take a photo of any skin concern. Our advanced AI will analyze it and provide detailed insights and care recommendations.",
    icon: <Camera size={48} />,
    color: "bg-emerald-500"
  },
  {
    title: "Skin Encyclopedia",
    description: "Browse our extensive library of skin conditions. Learn about symptoms, causes, and treatments for various skin health topics.",
    icon: <BookOpen size={48} />,
    color: "bg-blue-500"
  },
  {
    title: "Family Profiles",
    description: "Manage skin health for your whole family. Create separate profiles to track individual progress and personalized routines.",
    icon: <Users size={48} />,
    color: "bg-amber-500"
  },
  {
    title: "Interactive Skin Map",
    description: "Pin your scans on a body map to track exactly where concerns are located. Monitor changes over time with visual precision.",
    icon: <MapPin size={48} />,
    color: "bg-rose-500"
  }
];

interface Props {
  onComplete: () => void;
}

export const OnboardingFlow: React.FC<Props> = ({ onComplete }) => {
  const [currentStep, setCurrentStep] = useState(0);

  const handleNext = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      onComplete();
    }
  };

  return (
    <div className="fixed inset-0 z-[100] bg-wellness-bg flex flex-col items-center justify-center p-6">
      <div className="max-w-md w-full">
        <AnimatePresence mode="wait">
          <motion.div
            key={currentStep}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="text-center"
          >
            <div className={`w-24 h-24 ${steps[currentStep].color} text-white rounded-[2rem] flex items-center justify-center mx-auto mb-8 shadow-2xl shadow-current/20`}>
              {steps[currentStep].icon}
            </div>
            
            <h2 className="text-3xl font-serif text-wellness-ink mb-4">
              {steps[currentStep].title}
            </h2>
            
            <p className="text-wellness-ink/60 text-lg leading-relaxed mb-12">
              {steps[currentStep].description}
            </p>
          </motion.div>
        </AnimatePresence>

        <div className="flex flex-col gap-6">
          {/* Progress Indicators */}
          <div className="flex justify-center gap-2">
            {steps.map((_, idx) => (
              <div 
                key={idx}
                className={`h-1.5 rounded-full transition-all duration-300 ${
                  idx === currentStep ? 'w-8 bg-wellness-ink' : 'w-1.5 bg-wellness-ink/10'
                }`}
              />
            ))}
          </div>

          <button
            onClick={handleNext}
            className="w-full py-5 bg-wellness-ink text-white rounded-2xl font-bold flex items-center justify-center gap-2 hover:bg-wellness-ink/90 transition-all shadow-xl shadow-wellness-ink/20 group"
          >
            {currentStep === steps.length - 1 ? (
              <>Get Started <Check size={20} /></>
            ) : (
              <>Next <ChevronRight size={20} className="group-hover:translate-x-1 transition-transform" /></>
            )}
          </button>
          
          {currentStep < steps.length - 1 && (
            <button 
              onClick={onComplete}
              className="text-wellness-ink/40 font-bold uppercase tracking-widest text-xs hover:text-wellness-ink transition-colors"
            >
              Skip Introduction
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
