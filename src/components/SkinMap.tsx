import React, { useEffect, useRef, useState } from 'react';
import * as d3 from 'd3';
import { motion, AnimatePresence } from 'motion/react';
import { MapPin, Info, History, X, ChevronRight } from 'lucide-react';

interface ScanPoint {
  id: string;
  x: number;
  y: number;
  label: string;
  date: string;
  condition: string;
  confidence: number;
  image: string;
}

interface SkinMapProps {
  scans: ScanPoint[];
  onSelectPoint?: (point: ScanPoint) => void;
}

export const SkinMap: React.FC<SkinMapProps> = ({ scans, onSelectPoint }) => {
  const svgRef = useRef<SVGSVGElement>(null);
  const [selectedPoint, setSelectedPoint] = useState<ScanPoint | null>(null);
  const [hoveredPoint, setHoveredPoint] = useState<ScanPoint | null>(null);

  // Simplified Human Silhouette Path (Front View)
  const silhouettePath = "M100,20 C110,20 120,30 120,50 C120,70 110,80 100,80 C90,80 80,70 80,50 C80,30 90,20 100,20 M100,80 C120,80 140,90 150,110 L160,180 L145,185 L135,120 L130,220 L140,350 L120,350 L110,240 L100,240 L90,240 L80,350 L60,350 L70,220 L65,120 L55,185 L40,180 L50,110 C60,90 80,80 100,80 Z";

  useEffect(() => {
    if (!svgRef.current) return;

    const svg = d3.select(svgRef.current);
    svg.selectAll("*").remove();

    const width = 200;
    const height = 400;

    // Draw Silhouette
    svg.append("path")
      .attr("d", silhouettePath)
      .attr("fill", "currentColor")
      .attr("class", "text-wellness-soft opacity-50")
      .attr("stroke", "currentColor")
      .attr("stroke-width", 1)
      .attr("class", "text-wellness-ink/10");

    // Draw Points
    const points = svg.selectAll(".scan-point")
      .data(scans)
      .enter()
      .append("g")
      .attr("class", "scan-point cursor-pointer")
      .attr("transform", d => `translate(${d.x}, ${d.y})`)
      .on("mouseenter", (event, d) => setHoveredPoint(d))
      .on("mouseleave", () => setHoveredPoint(null))
      .on("click", (event, d) => {
        setSelectedPoint(d);
        if (onSelectPoint) onSelectPoint(d);
      });

    points.append("circle")
      .attr("r", 6)
      .attr("fill", "var(--color-wellness-accent)")
      .attr("class", "animate-pulse")
      .attr("stroke", "white")
      .attr("stroke-width", 2);

    points.append("circle")
      .attr("r", 12)
      .attr("fill", "var(--color-wellness-accent)")
      .attr("opacity", 0.2);

  }, [scans, onSelectPoint]);

  return (
    <div className="relative flex flex-col md:flex-row gap-8 items-start">
      <div className="wellness-card p-8 flex-1 w-full border-wellness-ink/5">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h3 className="text-xl font-serif text-wellness-ink">Interactive Skin Map</h3>
            <p className="text-sm text-wellness-ink/40">Visual history of your skin scans</p>
          </div>
          <div className="p-3 bg-wellness-accent/10 rounded-2xl text-wellness-accent">
            <MapPin size={24} />
          </div>
        </div>

        <div className="flex justify-center bg-wellness-soft/30 rounded-[3rem] p-8 border border-wellness-ink/5">
          <svg
            ref={svgRef}
            viewBox="0 0 200 400"
            className="w-full max-w-[250px] h-auto drop-shadow-2xl"
          />
        </div>

        <div className="mt-8 grid grid-cols-2 gap-4">
          <div className="p-4 bg-wellness-soft rounded-2xl border border-wellness-ink/5">
            <span className="text-[10px] font-bold text-wellness-ink/40 uppercase tracking-widest block mb-1">Total Scans</span>
            <span className="text-2xl font-serif text-wellness-ink">{scans.length}</span>
          </div>
          <div className="p-4 bg-wellness-soft rounded-2xl border border-wellness-ink/5">
            <span className="text-[10px] font-bold text-wellness-ink/40 uppercase tracking-widest block mb-1">Last Update</span>
            <span className="text-2xl font-serif text-wellness-ink">{scans[0]?.date || 'N/A'}</span>
          </div>
        </div>
      </div>

      <AnimatePresence>
        {selectedPoint && (
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 20 }}
            className="w-full md:w-80 space-y-4"
          >
            <div className="wellness-card p-6 border-wellness-ink/5 relative overflow-hidden">
              <button 
                onClick={() => setSelectedPoint(null)}
                className="absolute top-4 right-4 p-2 hover:bg-wellness-soft rounded-full transition-colors text-wellness-ink/30"
              >
                <X size={20} />
              </button>

              <div className="flex items-center gap-3 mb-6">
                <div className="p-2 bg-wellness-accent/10 rounded-xl text-wellness-accent">
                  <History size={20} />
                </div>
                <h4 className="font-serif text-wellness-ink">Scan Details</h4>
              </div>

              <div className="aspect-square rounded-2xl overflow-hidden mb-4 border border-wellness-ink/10">
                <img src={selectedPoint.image} alt={selectedPoint.label} className="w-full h-full object-cover" />
              </div>

              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-xs font-bold text-wellness-ink/40 uppercase tracking-widest">{selectedPoint.label}</span>
                  <span className="text-xs font-bold text-wellness-accent">{selectedPoint.date}</span>
                </div>
                <div className="p-4 bg-wellness-soft rounded-2xl border border-wellness-ink/5">
                  <p className="text-sm font-bold text-wellness-ink">{selectedPoint.condition}</p>
                  <p className="text-xs text-wellness-ink/60 mt-1">AI Confidence: {selectedPoint.confidence}%</p>
                </div>
                <button className="w-full py-3 bg-wellness-ink text-white rounded-xl text-sm font-bold hover:bg-wellness-ink/90 transition-all flex items-center justify-center gap-2">
                  View Full Report <ChevronRight size={16} />
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Hover Tooltip */}
      <AnimatePresence>
        {hoveredPoint && !selectedPoint && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            className="absolute z-10 p-3 bg-wellness-ink text-white rounded-xl shadow-xl text-xs pointer-events-none border border-white/10"
            style={{ left: hoveredPoint.x + 20, top: hoveredPoint.y }}
          >
            <p className="font-bold">{hoveredPoint.label}</p>
            <p className="opacity-60">{hoveredPoint.date}</p>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
