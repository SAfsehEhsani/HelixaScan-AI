import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Quote, Star, ChevronLeft, ChevronRight } from 'lucide-react';

interface Testimonial {
  id: number;
  name: string;
  role: string;
  content: string;
  rating: number;
  avatar: string;
}

const TESTIMONIALS: Testimonial[] = [
  {
    id: 1,
    name: "Sarah Johnson",
    role: "Verified User",
    content: "DermScan AI helped me identify a suspicious mole that I had been ignoring. My dermatologist confirmed it was early-stage and we caught it just in time. Truly a life-saver!",
    rating: 5,
    avatar: "https://picsum.photos/seed/sarah/100/100"
  },
  {
    id: 2,
    name: "Michael Chen",
    role: "Skincare Enthusiast",
    content: "The skin type analysis and personalized routine have completely transformed my complexion. I finally understand what products my skin actually needs.",
    rating: 5,
    avatar: "https://picsum.photos/seed/michael/100/100"
  },
  {
    id: 3,
    name: "Elena Rodriguez",
    role: "Mother of two",
    content: "I use the reminders for my kids' eczema treatments. It's so helpful to have everything in one place. The encyclopedia is also a great resource for quick info.",
    rating: 5,
    avatar: "https://picsum.photos/seed/elena/100/100"
  },
  {
    id: 4,
    name: "David Smith",
    role: "Outdoor Runner",
    content: "The UV Advisor is my go-to every morning before my run. It's accurate and the protection advice is spot on. Highly recommend for anyone active outdoors.",
    rating: 5,
    avatar: "https://picsum.photos/seed/david/100/100"
  }
];

export function Testimonials() {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [direction, setDirection] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      next();
    }, 5000);
    return () => clearInterval(timer);
  }, [currentIndex]);

  const next = () => {
    setDirection(1);
    setCurrentIndex((prev) => (prev + 1) % TESTIMONIALS.length);
  };

  const prev = () => {
    setDirection(-1);
    setCurrentIndex((prev) => (prev - 1 + TESTIMONIALS.length) % TESTIMONIALS.length);
  };

  const variants = {
    enter: (direction: number) => ({
      x: direction > 0 ? 300 : -300,
      opacity: 0,
      scale: 0.8,
      rotate: direction > 0 ? 10 : -10
    }),
    center: {
      zIndex: 1,
      x: 0,
      opacity: 1,
      scale: 1,
      rotate: 0
    },
    exit: (direction: number) => ({
      zIndex: 0,
      x: direction < 0 ? 300 : -300,
      opacity: 0,
      scale: 0.8,
      rotate: direction < 0 ? 10 : -10
    })
  };

  return (
    <div className="py-24 px-4 overflow-hidden relative">
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-wellness-accent/5 blur-[120px] rounded-full animate-pulse" />
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-wellness-gold/5 blur-[120px] rounded-full animate-pulse" style={{ animationDelay: '2s' }} />
      </div>

      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        className="max-w-xl mx-auto text-center mb-20"
      >
        <p className="section-label">Join thousands of users who trust DermScan AI</p>
        <h2 className="text-5xl font-serif text-wellness-ink mb-4 tracking-tight">Voices of Wellness</h2>
      </motion.div>

      <div className="relative max-w-lg mx-auto h-[400px] flex items-center justify-center">
        <AnimatePresence initial={false} custom={direction}>
          <motion.div
            key={currentIndex}
            custom={direction}
            variants={variants}
            initial="enter"
            animate="center"
            exit="exit"
            transition={{
              x: { type: "spring", stiffness: 300, damping: 30 },
              opacity: { duration: 0.2 }
            }}
            className="absolute w-full wellness-card p-10 flex flex-col items-center text-center shadow-2xl"
          >
            <div className="absolute -top-8 left-1/2 -translate-x-1/2 w-16 h-16 bg-wellness-accent rounded-[2rem] flex items-center justify-center text-white shadow-xl shadow-wellness-accent/20">
              <Quote size={32} />
            </div>

            <div className="mt-8 mb-8 flex gap-1.5">
              {[...Array(TESTIMONIALS[currentIndex].rating)].map((_, i) => (
                <Star key={i} size={18} className="fill-wellness-accent text-wellness-accent" />
              ))}
            </div>

            <p className="text-wellness-ink/70 italic leading-relaxed mb-10 text-xl font-serif">
              "{TESTIMONIALS[currentIndex].content}"
            </p>

            <div className="flex items-center gap-5 mt-auto">
              <div className="relative">
                <div className="absolute inset-0 bg-wellness-accent/20 blur-lg rounded-full" />
                <img
                  src={TESTIMONIALS[currentIndex].avatar}
                  alt={TESTIMONIALS[currentIndex].name}
                  className="w-14 h-14 rounded-full border-2 border-white relative z-10 shadow-sm"
                  referrerPolicy="no-referrer"
                />
              </div>
              <div className="text-left">
                <h4 className="font-serif text-lg text-wellness-ink">{TESTIMONIALS[currentIndex].name}</h4>
                <p className="text-[10px] text-wellness-ink/40 font-bold uppercase tracking-widest">{TESTIMONIALS[currentIndex].role}</p>
              </div>
            </div>
          </motion.div>
        </AnimatePresence>

        <div className="absolute top-1/2 -translate-y-1/2 -left-4 sm:-left-16 z-10">
          <button
            onClick={prev}
            className="w-14 h-14 bg-white rounded-2xl border border-wellness-ink/5 shadow-xl text-wellness-ink/20 hover:text-wellness-accent hover:border-wellness-accent/20 transition-all flex items-center justify-center"
          >
            <ChevronLeft size={28} />
          </button>
        </div>

        <div className="absolute top-1/2 -translate-y-1/2 -right-4 sm:-right-16 z-10">
          <button
            onClick={next}
            className="w-14 h-14 bg-white rounded-2xl border border-wellness-ink/5 shadow-xl text-wellness-ink/20 hover:text-wellness-accent hover:border-wellness-accent/20 transition-all flex items-center justify-center"
          >
            <ChevronRight size={28} />
          </button>
        </div>
      </div>

      <div className="flex justify-center gap-3 mt-12">
        {TESTIMONIALS.map((_, i) => (
          <button
            key={i}
            onClick={() => {
              setDirection(i > currentIndex ? 1 : -1);
              setCurrentIndex(i);
            }}
            className={`h-1.5 rounded-full transition-all duration-500 ${i === currentIndex ? 'w-12 bg-wellness-accent' : 'w-3 bg-wellness-ink/10'}`}
          />
        ))}
      </div>
    </div>
  );
}
