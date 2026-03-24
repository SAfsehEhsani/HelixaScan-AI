import React, { useState, useEffect } from 'react';
import { Sparkles, Loader2, CheckCircle2, Info, ShoppingBag, RefreshCcw, Pill, Droplets, Target } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { getProductRecommendations } from '../services/gemini';

interface Product {
  name: string;
  category: string;
  suitability: string;
  ingredients: string[];
  usage: string;
}

interface ProductRecommendationsProps {
  skinType: string;
  scanResult: string;
  concerns: string;
  language: string;
}

export const ProductRecommendations: React.FC<ProductRecommendationsProps> = ({
  skinType,
  scanResult,
  concerns,
  language
}) => {
  const [products, setProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [refreshKey, setRefreshKey] = useState(0);

  useEffect(() => {
    const fetchRecommendations = async () => {
      if (!skinType || !scanResult) return;
      
      setIsLoading(true);
      setError(null);
      try {
        const recommendations = await getProductRecommendations(skinType, scanResult, concerns, language);
        setProducts(recommendations);
      } catch (err) {
        console.error("Failed to fetch product recommendations:", err);
        setError("Could not load recommendations at this time.");
      } finally {
        setIsLoading(false);
      }
    };

    fetchRecommendations();
  }, [skinType, scanResult, concerns, language, refreshKey]);

  if (isLoading) {
    return (
      <div className="wellness-card p-12 flex flex-col items-center justify-center space-y-6">
        <div className="relative">
          <Loader2 size={48} className="animate-spin text-wellness-accent" />
          <Sparkles size={20} className="absolute -top-2 -right-2 text-wellness-accent animate-pulse" />
        </div>
        <p className="text-wellness-ink/60 font-serif text-lg animate-pulse">Curating your personalized ritual...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 rounded-[2rem] p-8 border border-red-100 text-center">
        <p className="text-red-600 font-medium">{error}</p>
        <button 
          onClick={() => setRefreshKey(prev => prev + 1)}
          className="mt-4 px-6 py-2 bg-red-600 text-white rounded-full text-xs font-bold shadow-lg hover:bg-red-700 transition-all"
        >
          Try Again
        </button>
      </div>
    );
  }

  if (products.length === 0) return null;

  return (
    <div className="space-y-12">
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        className="flex items-center gap-4 px-2"
      >
        <div className="p-3 bg-wellness-accent/10 rounded-2xl text-wellness-accent shadow-inner">
          <ShoppingBag size={24} />
        </div>
        <div className="flex-1">
          <p className="section-label">Curated based on your unique skin profile</p>
          <h3 className="text-3xl font-serif text-wellness-ink">Recommended for You</h3>
        </div>
        <button 
          onClick={() => setRefreshKey(prev => prev + 1)}
          className="ml-auto p-3 hover:bg-wellness-soft rounded-full text-wellness-ink/30 transition-all hover:text-wellness-accent"
          title="Refresh recommendations"
        >
          <RefreshCcw size={20} className={isLoading ? 'animate-spin' : ''} />
        </button>
      </motion.div>

      <div className="grid grid-cols-1 gap-6">
        {products.map((product, idx) => (
          <motion.div
            key={idx}
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: idx * 0.1 }}
            className="wellness-card p-8 group hover:border-wellness-accent/30 transition-all relative overflow-hidden"
          >
            <div className="absolute top-0 right-0 p-6 opacity-5 group-hover:opacity-20 transition-opacity">
              <Sparkles size={80} className="text-wellness-accent" />
            </div>

            <div className="flex justify-between items-start mb-6 relative z-10">
              <div>
                <span className="text-[10px] font-bold text-wellness-accent uppercase tracking-widest bg-wellness-accent/10 px-3 py-1 rounded-full mb-3 inline-block">
                  {product.category}
                </span>
                <h4 className="text-2xl font-serif text-wellness-ink group-hover:text-wellness-accent transition-colors">
                  {product.name}
                </h4>
              </div>
              <div className="p-3 bg-wellness-soft rounded-2xl text-wellness-ink/20 group-hover:bg-wellness-accent/10 group-hover:text-wellness-accent transition-all shadow-inner">
                {product.category.toLowerCase().includes('medicine') ? <Pill size={24} /> : 
                 product.category.toLowerCase().includes('cleanser') || product.category.toLowerCase().includes('moisturizer') ? <Droplets size={24} /> :
                 product.category.toLowerCase().includes('treatment') ? <Target size={24} /> :
                 <Sparkles size={24} />}
              </div>
            </div>

            <div className="space-y-6 relative z-10">
              <div className="flex gap-4">
                <div className="mt-1 text-wellness-accent">
                  <CheckCircle2 size={20} />
                </div>
                <div>
                  <p className="section-label mb-1">Why it works</p>
                  <p className="text-sm text-wellness-ink/70 leading-relaxed">
                    {product.suitability}
                  </p>
                </div>
              </div>

              <div className="flex gap-4">
                <div className="mt-1 text-wellness-accent/40">
                  <Info size={20} />
                </div>
                <div className="space-y-4">
                  <div>
                    <p className="section-label mb-1">Key Ingredients</p>
                    <p className="text-sm text-wellness-ink/70 leading-relaxed">
                      {product.ingredients.join(', ')}
                    </p>
                  </div>
                  <div>
                    <p className="section-label mb-1">How to use</p>
                    <p className="text-sm text-wellness-ink/70 leading-relaxed italic">
                      {product.usage}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      <div className="p-5 bg-wellness-soft border border-wellness-ink/5 rounded-[2rem] flex gap-4">
        <Info size={22} className="text-wellness-accent shrink-0 mt-0.5" />
        <p className="text-[11px] text-wellness-ink/60 leading-relaxed italic">
          <span className="font-bold not-italic text-wellness-ink uppercase tracking-tighter mr-1">Medical Note:</span> 
          These recommendations are AI-generated based on common dermatological knowledge. Always perform a patch test before trying new products and consult a dermatologist for prescription-strength treatments.
        </p>
      </div>
    </div>
  );
};
