import React, { useEffect, useRef, useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Sun, Info, X, Download, Share2, RefreshCw } from 'lucide-react';

interface UVFilterProps {
  image: string;
  onClose: () => void;
}

export const UVFilter: React.FC<UVFilterProps> = ({ image, onClose }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isProcessing, setIsProcessing] = useState(true);
  const [intensity, setIntensity] = useState(0.5);

  useEffect(() => {
    const processImage = async () => {
      if (!canvasRef.current) return;
      setIsProcessing(true);

      const canvas = canvasRef.current;
      const ctx = canvas.getContext('2d');
      if (!ctx) return;

      const img = new Image();
      img.crossOrigin = "anonymous";
      img.src = image;

      img.onload = () => {
        canvas.width = img.width;
        canvas.height = img.height;
        ctx.drawImage(img, 0, 0);

        const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
        const data = imageData.data;

        // UV Simulation Algorithm
        // 1. Convert to grayscale
        // 2. Increase contrast in the blue/violet spectrum
        // 3. Invert certain luminosity ranges to highlight "deep" pigment
        for (let i = 0; i < data.length; i += 4) {
          const r = data[i];
          const g = data[i + 1];
          const b = data[i + 2];

          // Grayscale luminosity
          const gray = 0.299 * r + 0.587 * g + 0.114 * b;

          // UV Effect: Highlight blue channel and contrast
          // We simulate UV by emphasizing areas where light is absorbed (melanin)
          let uvValue = gray;
          
          // Melanin absorption simulation: Darker areas in blue channel become even darker
          // while lighter areas are pushed towards a violet/blue tint
          const melaninFactor = (255 - b) / 255;
          uvValue = gray * (1 - melaninFactor * intensity);

          // Apply a violet/blue tint
          data[i] = uvValue * 0.4;     // Red
          data[i + 1] = uvValue * 0.4; // Green
          data[i + 2] = uvValue * 0.8; // Blue
        }

        ctx.putImageData(imageData, 0, 0);
        setIsProcessing(false);
      };
    };

    processImage();
  }, [image, intensity]);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-[60] bg-black/90 backdrop-blur-xl flex items-center justify-center p-4 sm:p-8"
    >
      <div className="w-full max-w-4xl bg-wellness-bg rounded-[3rem] overflow-hidden flex flex-col shadow-2xl border border-white/10 relative">
        <div className="p-6 border-b border-wellness-ink/5 flex items-center justify-between bg-white/50 backdrop-blur-md">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-violet-500/10 rounded-2xl text-violet-500">
              <Sun size={24} />
            </div>
            <div>
              <h3 className="text-xl font-serif text-wellness-ink">Pigment Density Analysis</h3>
              <p className="text-xs text-wellness-ink/40">Simulated UV spectrum visualization</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-wellness-soft rounded-full transition-colors text-wellness-ink/30"
          >
            <X size={28} />
          </button>
        </div>

        <div className="flex-1 overflow-hidden flex flex-col md:flex-row">
          <div className="flex-1 bg-black relative flex items-center justify-center p-4">
            {isProcessing && (
              <div className="absolute inset-0 z-10 flex flex-col items-center justify-center text-white/60 space-y-4 bg-black/40 backdrop-blur-sm">
                <RefreshCw size={40} className="animate-spin text-violet-500" />
                <p className="font-serif italic text-sm">Processing UV Spectrum...</p>
              </div>
            )}
            <canvas 
              ref={canvasRef} 
              className="max-w-full max-h-full object-contain rounded-2xl shadow-2xl"
            />
          </div>

          <div className="w-full md:w-80 p-8 space-y-8 bg-wellness-soft/30 backdrop-blur-md">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h4 className="text-sm font-bold text-wellness-ink uppercase tracking-widest">UV Intensity</h4>
                <span className="text-xs font-bold text-violet-500">{Math.round(intensity * 100)}%</span>
              </div>
              <input 
                type="range" 
                min="0" 
                max="1" 
                step="0.01" 
                value={intensity}
                onChange={(e) => setIntensity(parseFloat(e.target.value))}
                className="w-full h-2 bg-violet-500/20 rounded-full appearance-none cursor-pointer accent-violet-500"
              />
              <p className="text-[10px] text-wellness-ink/40 leading-relaxed">
                Adjust intensity to highlight deeper dermal pigmentation and sun damage patterns.
              </p>
            </div>

            <div className="p-6 bg-violet-500/5 rounded-3xl border border-violet-500/10 space-y-3">
              <div className="flex items-center gap-2 text-violet-500">
                <Info size={16} />
                <span className="text-xs font-bold uppercase tracking-widest">Clinical Note</span>
              </div>
              <p className="text-xs text-wellness-ink/60 leading-relaxed">
                This visualization highlights areas where melanin absorption is highest. Darker spots in this view may indicate sub-surface sun damage or hyperpigmentation.
              </p>
            </div>

            <div className="space-y-3">
              <button className="w-full py-4 bg-violet-500 text-white rounded-2xl font-bold hover:bg-violet-600 transition-all flex items-center justify-center gap-2 shadow-lg shadow-violet-500/20">
                <Download size={18} /> Save Analysis
              </button>
              <button className="w-full py-4 bg-white text-wellness-ink rounded-2xl font-bold hover:bg-wellness-soft transition-all flex items-center justify-center gap-2 border border-wellness-ink/5">
                <Share2 size={18} /> Share Report
              </button>
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
};
