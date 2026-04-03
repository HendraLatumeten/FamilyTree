'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { TreePine, LogIn, UserPlus, Heart, Sparkles } from 'lucide-react';

export default function Home() {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  return (
    <main className="relative min-h-screen bg-[#050a05] text-white overflow-hidden selection:bg-amber-500/30">
      
      {/* BACKGROUND IMAGE WITH PARALLAX EFFECT */}
      <div className="absolute inset-0 z-0">
        <div 
          className="absolute inset-0 bg-cover bg-center opacity-40 scale-110"
          style={{ backgroundImage: "url('/assets/family_hero.png')" }}
        />
        {/* VIGNETTE & GRADIENT OVERLAY */}
        <div className="absolute inset-0 bg-gradient-to-b from-[#050a05]/90 via-transparent to-[#050a05]" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,transparent_0%,#050a05_80%)]" />
      </div>

      {/* FLOATING FIREFLIES ANIMATION */}
      <div className="absolute inset-0 z-0 pointer-events-none">
        {mounted && [...Array(20)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute w-1 h-1 bg-amber-400 rounded-full blur-[1px]"
            initial={{ 
              x: Math.random() * 100 + "%", 
              y: Math.random() * 100 + "%", 
              opacity: 0 
            }}
            animate={{ 
              y: [null, Math.random() * -100 - 50 + "px"],
              opacity: [0, 0.8, 0],
              scale: [0, 1.5, 0]
            }}
            transition={{ 
              duration: Math.random() * 5 + 5, 
              repeat: Infinity,
              delay: Math.random() * 10 
            }}
          />
        ))}
      </div>

      {/* Header */}
      <header className="fixed top-0 left-0 right-0 z-50 flex items-center justify-between px-6 py-4 md:px-12 backdrop-blur-md bg-white/5 border-b border-white/10">
        <div className="flex items-center gap-2 group cursor-pointer">
          <div className="p-2 rounded-xl bg-gradient-to-br from-green-600 to-emerald-800 shadow-lg shadow-green-900/20 group-hover:scale-110 transition-transform">
            <TreePine size={24} className="text-white" />
          </div>
          <span className="text-xl font-bold tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-amber-100 to-amber-500">
            Family Tree
          </span>
        </div>

        <nav className="flex items-center gap-4">
          <Link href="/login" className="flex items-center gap-2 px-4 py-2 text-sm font-medium transition-all hover:text-amber-400">
            <LogIn size={18} />
            <span className="hidden sm:inline">Sign In</span>
          </Link>
          <Link href="/register" className="flex items-center gap-2 px-6 py-2.5 text-sm font-semibold text-[#050a05] bg-gradient-to-r from-amber-400 to-amber-600 rounded-full shadow-lg shadow-amber-900/20 hover:shadow-amber-500/40 hover:scale-105 active:scale-95 transition-all outline-none">
            <UserPlus size={18} />
            <span>Join Now</span>
          </Link>
        </nav>
      </header>

      {/* Hero Section */}
      <section className="relative z-10 flex flex-col items-center justify-center min-h-screen px-6 pt-20 text-center">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1, ease: "easeOut" }}
          className="max-w-4xl"
        >
          <div className="inline-flex items-center gap-2 px-4 py-1.5 mb-8 rounded-full bg-amber-500/10 border border-amber-500/20 text-amber-400 text-xs font-bold tracking-widest uppercase">
            <Sparkles size={14} className="animate-pulse" />
            Every Family Has a Story
          </div>

          <h1 className="text-6xl md:text-8xl font-black mb-8 leading-none tracking-tighter text-white">
            Honor Your <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-200 via-amber-500 to-emerald-400">
              Roots & Legacy
            </span>
          </h1>

          <p className="text-lg md:text-xl text-slate-300 mb-12 max-w-2xl mx-auto leading-relaxed font-medium">
            Map your lineage, connect the generations, and beautifully preserve 
            your family history for the ones who follow.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link href="/register" className="w-full sm:w-auto px-10 py-4 bg-amber-500 text-[#050a05] font-black text-lg rounded-2xl hover:bg-amber-400 transition-all shadow-2xl shadow-amber-500/20 hover:scale-105 active:scale-95 duration-200">
              Start Your Tree
            </Link>
            <Link href="/diagram-demo" className="w-full sm:w-auto px-10 py-4 bg-white/5 text-white font-bold text-lg rounded-2xl border border-white/10 hover:bg-white/10 transition-all backdrop-blur-xl duration-200 flex items-center justify-center gap-2">
              <Heart size={20} className="text-red-400" />
              View Demo
            </Link>
          </div>
        </motion.div>
      </section>

      {/* Footer Info */}
      <footer className="absolute bottom-8 left-1/2 -translate-x-1/2 z-10 w-full text-center px-6">
        <div className="flex flex-col items-center gap-4">
          <p className="text-slate-500 text-sm tracking-widest uppercase">
            Abadikan Sejarah • Hubungkan Generasi • Wariskan Cerita
          </p>
          <p className="text-slate-600 text-xs">
            &copy; 2026 Family Tree. All rights reserved.
          </p>
        </div>
      </footer>
    </main>
  );
}
