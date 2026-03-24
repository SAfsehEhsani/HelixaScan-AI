import React, { useState, useRef } from 'react';
import { motion } from 'motion/react';
import { MapPin, Check, X } from 'lucide-react';

interface BodyLocationPickerProps {
  onSelect: (x: number, y: number) => void;
  onCancel: () => void;
}

export const BodyLocationPicker: React.FC<BodyLocationPickerProps> = ({ onSelect, onCancel }) => {
  const [point, setPoint] = useState<{ x: number, y: number } | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  // Simplified Human Silhouette Path (Front View)
  const silhouettePath = "M100,20 C110,20 120,30 120,50 C120,70 110,80 100,80 C90,80 80,70 80,50 C80,30 90,20 100,20 M100,80 C120,80 140,90 150,110 L160,180 L145,185 L135,120 L130,220 L140,350 L120,350 L110,240 L100,240 L90,240 L80,350 L60,350 L70,220 L65,120 L55,185 L40,180 L50,110 C60,90 80,80 100,80 Z";

  const handleClick = (e: React.MouseEvent<SVGSVGElement>) => {
    const svg = e.currentTarget;
    const rect = svg.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * 200;
    const y = ((e.clientY - rect.top) / rect.height) * 400;
    setPoint({ x, y });
  };

  return (
    <div className="flex flex-col items-center p-8 space-y-8">
      <div className="text-center">
        <h3 className="text-2xl font-serif text-wellness-ink">Where was this scan taken?</h3>
        <p className="text-sm text-wellness-ink/40">Tap on the body map to pin the location</p>
      </div>

      <div className="relative bg-wellness-soft/30 rounded-[3rem] p-8 border border-wellness-ink/5">
        <svg
          viewBox="0 0 200 400"
          className="w-64 h-auto cursor-crosshair drop-shadow-xl"
          onClick={handleClick}
        >
          <path
            d={silhouettePath}
            fill="currentColor"
            className="text-wellness-ink/10"
            stroke="currentColor"
            strokeWidth={1}
          />
          {point && (
            <motion.g
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              key={`${point.x}-${point.y}`}
            >
              <circle
                cx={point.x}
                cy={point.y}
                r={8}
                fill="var(--color-wellness-accent)"
                className="animate-pulse"
              />
              <circle
                cx={point.x}
                cy={point.y}
                r={16}
                fill="var(--color-wellness-accent)"
                opacity={0.2}
              />
            </motion.g>
          )}
        </svg>
      </div>

      <div className="flex gap-4 w-full max-w-xs">
        <button
          onClick={onCancel}
          className="flex-1 py-4 bg-wellness-soft text-wellness-ink rounded-2xl font-bold hover:bg-wellness-ink/5 transition-all"
        >
          Skip
        </button>
        <button
          disabled={!point}
          onClick={() => point && onSelect(point.x, point.y)}
          className={`flex-1 py-4 rounded-2xl font-bold transition-all flex items-center justify-center gap-2 ${
            point 
              ? 'bg-wellness-accent text-white shadow-lg shadow-wellness-accent/20' 
              : 'bg-slate-200 text-slate-400 cursor-not-allowed'
          }`}
        >
          <Check size={20} /> Confirm
        </button>
      </div>
    </div>
  );
};
