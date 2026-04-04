'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import { TreePine, LogIn, UserPlus, Heart, Sparkles, ChevronRight } from 'lucide-react';
import AnimatedBackground from '@/components/AnimatedBackground';

// --- SUB-COMPONENTS FOR ANIMATION ---

const Leaf = ({ index }: { index: number }) => {
  const randomDelay = Math.random() * 10;
  const randomDuration = 10 + Math.random() * 15;
  const randomScale = 0.5 + Math.random() * 1;
  const startX = Math.random() * 100;

  return (
    <motion.div
      className="absolute z-10 pointer-events-none"
      initial={{ 
        top: "-10%", 
        left: `${startX}%`, 
        opacity: 0,
        rotate: 0 
      }}
      animate={{ 
        top: "110%", 
        left: `${startX + (Math.random() * 20 - 10)}%`,
        opacity: [0, 0.6, 0.6, 0],
        rotate: [0, 360 * (Math.random() > 0.5 ? 1 : -1)]
      }}
      transition={{ 
        duration: randomDuration, 
        repeat: Infinity, 
        delay: randomDelay,
        ease: "linear"
      }}
      style={{ scale: randomScale }}
    >
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className="text-green-500/30">
        <path d="M12 2C12 2 15 5 18 9C21 13 20 18 16 21C12 24 7 22 4 18C1 14 3 8 7 4C9 2 12 2 12 2Z" fill="currentColor" />
        <path d="M12 2V22" stroke="white" strokeWidth="0.5" strokeOpacity="0.2" />
      </svg>
    </motion.div>
  );
};

const SwayingTree = ({ className, delay = 0 }: { className?: string; delay?: number }) => (
  <motion.div 
    className={className}
    animate={{ 
      rotate: [-1, 1, -1],
      scale: [1, 1.01, 1]
    }}
    transition={{ 
      duration: 8, 
      repeat: Infinity, 
      ease: "easeInOut",
      delay 
    }}
  >
    <svg viewBox="0 0 200 400" className="w-full h-full text-emerald-900/20 fill-current">
      <path d="M100 400 L110 400 L105 300 Z" />
      <circle cx="100" cy="250" r="80" />
      <circle cx="60" cy="200" r="60" />
      <circle cx="140" cy="200" r="60" />
      <circle cx="100" cy="150" r="70" />
      <circle cx="100" cy="80" r="50" />
    </svg>
  </motion.div>
);

export default function LandingPage() {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  return (
    <main className="relative min-h-screen bg-[#1b331b] text-white overflow-hidden selection:bg-amber-500/30">
      
      {/* 1. BACKGROUND & ANIMATIONS */}
      <AnimatedBackground />

      {/* 2. HEADER */}
      <header className="fixed top-0 left-0 right-0 z-50 flex items-center justify-between px-6 py-5 md:px-12 backdrop-blur-xl bg-[#050a05]/40 border-b border-white/5">
        <div className="flex items-center gap-3 group cursor-pointer">
          <div className="p-2 rounded-xl bg-gradient-to-br from-green-500 to-emerald-800 shadow-lg shadow-green-900/30 group-hover:rotate-12 transition-all duration-300">
            <TreePine size={24} className="text-white" />
          </div>
          <span className="text-2xl font-black tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-white to-slate-400">
            FamilyTree <span className="text-amber-500">Studio</span>
          </span>
        </div>

        <nav className="flex items-center gap-6">
          <Link href="/login" className="flex items-center gap-2 px-2 py-2 text-sm font-bold tracking-wide transition-all hover:text-amber-400 opacity-80 hover:opacity-100">
            <LogIn size={18} />
            <span className="hidden sm:inline">Portal</span>
          </Link>
          <Link href="/register" className="group relative flex items-center gap-2 px-8 py-3 text-sm font-black text-[#050a05] overflow-hidden rounded-full transition-all">
            <div className="absolute inset-0 bg-gradient-to-r from-amber-400 to-amber-600 group-hover:scale-110 transition-transform duration-300" />
            <span className="relative z-10 flex items-center gap-2">
              <UserPlus size={18} />
              Join Now
            </span>
          </Link>
        </nav>
      </header>

      {/* 4. HERO SECTION */}
      <section className="relative z-10 pt-32 pb-20 px-6 md:px-12 flex flex-col items-center text-center">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="max-w-4xl"
        >
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/5 border border-white/10 mb-8 backdrop-blur-md">
            <Sparkles size={16} className="text-amber-400" />
            <span className="text-xs md:text-sm font-medium tracking-wider text-amber-200 uppercase">Discover Your Roots</span>
          </div>

          <h1 className="text-5xl md:text-8xl font-black mb-8 leading-[1.1] tracking-tight">
            Map Your <span className="bg-clip-text text-transparent bg-gradient-to-r from-green-400 via-emerald-400 to-teal-400">Legacy</span>, <br />
            Deepen Your <span className="bg-clip-text text-transparent bg-gradient-to-r from-amber-200 to-amber-500">Roots</span>
          </h1>
          
          <p className="text-base md:text-xl text-slate-300 mb-12 max-w-2xl mx-auto leading-relaxed px-4">
            Build a beautiful, interactive family tree that preserves your history for generations. 
            Connect with your past and secure your family's future.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-6">
            <Link href="/register" className="group w-full sm:w-auto px-12 py-5 bg-amber-500 text-[#050a05] font-black text-xl rounded-2xl hover:bg-white transition-all shadow-2xl shadow-amber-500/20 hover:shadow-white/20 duration-300 flex items-center justify-center gap-2">
              Start Your Story
              <ChevronRight size={20} className="group-hover:translate-x-1 transition-transform" />
            </Link>
            <Link href="/diagram-demo" className="w-full sm:w-auto px-12 py-5 bg-white/5 text-white font-bold text-xl rounded-2xl border border-white/10 hover:bg-white/10 transition-all backdrop-blur-3xl duration-300 flex items-center justify-center gap-3 group">
              <Heart size={22} className="text-red-500 group-hover:scale-125 transition-transform" />
              Watch Demo
            </Link>
          </div>
        </motion.div>
      </section>

      {/* 5. FOOTER */}
      <footer className="absolute bottom-10 left-0 right-0 z-30 px-6">
        <div className="mx-auto max-w-screen-xl flex flex-col md:flex-row items-center justify-between gap-6 border-t border-white/5 pt-10">
          <p className="text-slate-500 text-xs font-black tracking-[0.3em] uppercase opacity-40">
            Heritage • Connection • Permanence
          </p>
          <div className="flex items-center gap-8">
             <div className="flex -space-x-3">
                {[...Array(4)].map((_, i) => (
                  <div key={i} className="w-8 h-8 rounded-full border-2 border-[#050a05] bg-slate-800 overflow-hidden">
                    <img src={`https://i.pravatar.cc/100?u=${i}`} alt="user" className="w-full h-full object-cover grayscale opacity-50" />
                  </div>
                ))}
             </div>
             <p className="text-slate-500 text-xs font-bold">
               Joined by <span className="text-white">2.4k+</span> Families
             </p>
          </div>
          <p className="text-slate-600 text-[10px] font-bold">
            &copy; 2026 FamilyTree Studio
          </p>
        </div>
      </footer>
    </main>
  );
}
