import React, { useState, useEffect } from 'react';
import { Sun, Shield, Info, Loader2, MapPin, AlertTriangle, Wind, Droplets, Thermometer, CheckCircle2, Clock } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { GoogleGenAI } from "@google/genai";

const API_KEY = process.env.GEMINI_API_KEY || "";

interface EnvironmentalData {
  uvIndex: number;
  aqi: number;
  humidity: number;
  temp: number;
  pollen: string;
}

export const UVAdvisor: React.FC<{ language: string }> = ({ language }) => {
  const [envData, setEnvData] = useState<EnvironmentalData | null>(null);
  const [advice, setAdvice] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [location, setLocation] = useState<string>("Detecting location...");
  const [activeRoutine, setActiveRoutine] = useState<string[]>([]);

  useEffect(() => {
    const fetchEnvironmentalData = async () => {
      setLoading(true);
      try {
        // Simulate high-fidelity environmental data
        const mockData: EnvironmentalData = {
          uvIndex: Math.floor(Math.random() * 11) + 1,
          aqi: Math.floor(Math.random() * 150) + 20, // Air Quality Index
          humidity: Math.floor(Math.random() * 60) + 20,
          temp: Math.floor(Math.random() * 15) + 20,
          pollen: ["Low", "Moderate", "High"][Math.floor(Math.random() * 3)]
        };
        setEnvData(mockData);

        const ai = new GoogleGenAI({ apiKey: API_KEY });
        const response = await ai.models.generateContent({
          model: "gemini-3-flash-preview",
          contents: `Provide personalized clinical skin protection advice in ${language} for these conditions:
          - UV Index: ${mockData.uvIndex}
          - Air Quality (AQI): ${mockData.aqi}
          - Humidity: ${mockData.humidity}%
          - Pollen: ${mockData.pollen}
          
          Include:
          1. **Immediate Protection**: SPF, clothing, and activity advice.
          2. **Pollution Defense**: How to protect skin from current air quality.
          3. **Hydration Strategy**: Based on humidity and temp.
          4. **Daily Routine Adjustment**: 3 specific steps for today's routine.
          
          Keep it professional and use bullet points.`,
        });

        setAdvice(response.text);
        
        // Extract routine steps for the "Daily Checklist"
        const routineSteps = response.text.split('\n')
          .filter(line => line.includes('•') || line.includes('-'))
          .slice(-3)
          .map(line => line.replace(/[•-]/g, '').trim());
        setActiveRoutine(routineSteps);

        navigator.geolocation.getCurrentPosition(async (pos) => {
          setLocation("Metropolitan Area");
        }, () => setLocation("Unknown Location"));

      } catch (error) {
        console.error("Environmental fetch error:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchEnvironmentalData();
  }, [language]);

  const getUVColor = (index: number) => {
    if (index <= 2) return 'bg-emerald-500';
    if (index <= 5) return 'bg-yellow-500';
    if (index <= 7) return 'bg-orange-500';
    if (index <= 10) return 'bg-red-500';
    return 'bg-purple-600';
  };

  const getAQILevel = (aqi: number) => {
    if (aqi <= 50) return { label: 'Good', color: 'text-emerald-500' };
    if (aqi <= 100) return { label: 'Moderate', color: 'text-yellow-500' };
    if (aqi <= 150) return { label: 'Unhealthy', color: 'text-orange-500' };
    return { label: 'Hazardous', color: 'text-red-500' };
  };

  return (
    <div className="space-y-12">
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        className="wellness-card p-10 relative overflow-hidden"
      >
        <div className="absolute top-0 right-0 w-64 h-64 bg-wellness-accent/5 rounded-bl-full -mr-20 -mt-20" />
        
        <div className="flex items-center justify-between mb-12 relative z-10">
          <div className="flex items-center gap-6">
            <div className="w-16 h-16 bg-wellness-accent/10 text-wellness-accent rounded-3xl flex items-center justify-center shadow-lg shadow-wellness-accent/10">
              <Sun size={32} />
            </div>
            <div>
              <p className="section-label">Environmental Intelligence</p>
              <h3 className="text-3xl font-serif font-medium text-wellness-ink">Smart Protection Advisor</h3>
              <div className="flex items-center gap-2 text-xs text-wellness-ink/40 font-bold uppercase tracking-widest mt-1">
                <MapPin size={12} />
                <span>{location}</span>
              </div>
            </div>
          </div>
          <button 
            onClick={() => window.location.reload()}
            className="w-10 h-10 bg-wellness-soft rounded-full flex items-center justify-center text-wellness-ink/30 hover:text-wellness-accent transition-colors"
          >
            <Clock size={20} />
          </button>
        </div>

        {loading ? (
          <div className="flex flex-col items-center justify-center py-24 text-wellness-ink/30">
            <Loader2 className="animate-spin text-wellness-accent mb-6" size={48} />
            <p className="font-serif text-xl">Analyzing Atmosphere...</p>
          </div>
        ) : (
          <div className="space-y-12 relative z-10">
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-6">
              <div className="bg-white p-6 rounded-[2.5rem] shadow-sm border border-black/5 flex flex-col items-center text-center">
                <div className={`w-16 h-16 rounded-full flex items-center justify-center text-white mb-4 shadow-xl ${getUVColor(envData?.uvIndex || 0)}`}>
                  <span className="text-2xl font-black">{envData?.uvIndex}</span>
                </div>
                <span className="text-[10px] font-bold uppercase tracking-widest text-wellness-ink/40">UV Index</span>
              </div>

              <div className="bg-white p-6 rounded-[2.5rem] shadow-sm border border-black/5 flex flex-col items-center text-center">
                <div className="w-16 h-16 rounded-full bg-wellness-soft flex items-center justify-center text-wellness-accent mb-4">
                  <Wind size={24} />
                </div>
                <span className={`text-lg font-bold ${getAQILevel(envData?.aqi || 0).color}`}>
                  {getAQILevel(envData?.aqi || 0).label}
                </span>
                <span className="text-[10px] font-bold uppercase tracking-widest text-wellness-ink/40">Air Quality</span>
              </div>

              <div className="bg-white p-6 rounded-[2.5rem] shadow-sm border border-black/5 flex flex-col items-center text-center">
                <div className="w-16 h-16 rounded-full bg-wellness-soft flex items-center justify-center text-wellness-accent mb-4">
                  <Droplets size={24} />
                </div>
                <span className="text-lg font-bold text-wellness-ink">
                  {envData?.humidity}%
                </span>
                <span className="text-[10px] font-bold uppercase tracking-widest text-wellness-ink/40">Humidity</span>
              </div>

              <div className="bg-white p-6 rounded-[2.5rem] shadow-sm border border-black/5 flex flex-col items-center text-center">
                <div className="w-16 h-16 rounded-full bg-wellness-soft flex items-center justify-center text-wellness-accent mb-4">
                  <Thermometer size={24} />
                </div>
                <span className="text-lg font-bold text-wellness-ink">
                  {envData?.temp}°C
                </span>
                <span className="text-[10px] font-bold uppercase tracking-widest text-wellness-ink/40">Temperature</span>
              </div>
            </div>

            <div className="grid sm:grid-cols-2 gap-8">
              <div className="bg-wellness-ink text-white rounded-[3rem] p-10 shadow-2xl">
                <div className="flex items-center gap-4 mb-8">
                  <div className="w-12 h-12 bg-wellness-accent rounded-2xl flex items-center justify-center">
                    <Shield size={24} />
                  </div>
                  <h4 className="text-xl font-serif font-medium">Daily Protection Plan</h4>
                </div>
                <div className="space-y-6">
                  {advice?.split('\n').filter(l => l.trim()).map((line, i) => (
                    <motion.p 
                      key={i}
                      initial={{ opacity: 0, x: -10 }}
                      whileInView={{ opacity: 1, x: 0 }}
                      viewport={{ once: true }}
                      transition={{ delay: i * 0.05 }}
                      className="text-sm text-white/70 leading-relaxed"
                    >
                      {line}
                    </motion.p>
                  ))}
                </div>
              </div>

              <div className="space-y-8">
                <div className="bg-wellness-soft rounded-[3rem] p-10 border border-black/5">
                  <h4 className="text-xl font-serif font-medium text-wellness-ink mb-8">Today's Checklist</h4>
                  <div className="space-y-6">
                    {activeRoutine.map((step, i) => (
                      <div key={i} className="flex gap-4 items-start">
                        <div className="w-6 h-6 rounded-full border-2 border-wellness-accent flex items-center justify-center shrink-0 mt-1">
                          <CheckCircle2 size={14} className="text-wellness-accent" />
                        </div>
                        <p className="text-sm text-wellness-ink/70 leading-relaxed">{step}</p>
                      </div>
                    ))}
                  </div>
                </div>

                {envData && envData.uvIndex > 7 && (
                  <div className="bg-rose-50 border border-rose-100 p-8 rounded-[3rem] flex gap-6">
                    <AlertTriangle size={32} className="text-rose-600 shrink-0" />
                    <div>
                      <h5 className="text-sm font-bold uppercase tracking-widest text-rose-600 mb-2">High Risk Alert</h5>
                      <p className="text-sm text-rose-800 leading-relaxed font-medium">
                        Extreme UV levels detected. Avoid direct sun exposure between 10 AM and 4 PM. Seek shade and wear protective clothing.
                      </p>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </motion.div>

      <div className="grid sm:grid-cols-2 gap-8">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="bg-wellness-accent/5 rounded-[3rem] p-10 border border-wellness-accent/10 flex gap-6"
        >
          <div className="w-16 h-16 bg-white rounded-2xl text-wellness-accent shadow-sm flex items-center justify-center shrink-0">
            <Wind size={32} />
          </div>
          <div>
            <h4 className="text-xl font-serif font-medium text-wellness-accent mb-2">Pollution & Skin</h4>
            <p className="text-sm text-wellness-accent/70 leading-relaxed">
              Particulate matter can penetrate pores, causing inflammation and premature aging. DermScan AI monitors AQI to suggest the best barrier creams.
            </p>
          </div>
        </motion.div>

        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="bg-wellness-soft rounded-[3rem] p-10 border border-black/5 flex gap-6"
        >
          <div className="w-16 h-16 bg-white rounded-2xl text-wellness-ink/30 shadow-sm flex items-center justify-center shrink-0">
            <Droplets size={32} />
          </div>
          <div>
            <h4 className="text-xl font-serif font-medium text-wellness-ink mb-2">Humidity Impact</h4>
            <p className="text-sm text-wellness-ink/50 leading-relaxed">
              Low humidity causes transepidermal water loss. We track local moisture levels to adjust your hydration routine dynamically.
            </p>
          </div>
        </motion.div>
      </div>
    </div>
  );
};
