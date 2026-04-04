'use client';

import React, { useState, useEffect } from 'react';
import { motion, useMotionValue, useSpring, useTransform } from 'framer-motion';

// --- SUB-COMPONENTS FOR ANIMATION ---

const Leaf = ({ index, mouseX, mouseY }: { index: number; mouseX: any; mouseY: any }) => {
  const randomDelay = Math.random() * 10;
  const randomDuration = 10 + Math.random() * 15;
  const randomScale = 0.5 + Math.random() * 0.8;
  const startX = Math.random() * 100;
  
  // Parallax movement for leaves (subtle)
  const px = useTransform(mouseX, [0, 2400], [index % 2 === 0 ? -30 : 30, index % 2 === 0 ? 30 : -30]);
  const py = useTransform(mouseY, [0, 1200], [index % 3 === 0 ? -20 : 20, index % 3 === 0 ? 20 : -20]);

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
        opacity: [0, 0.4, 0.4, 0],
        rotate: [0, 360 * (Math.random() > 0.5 ? 1 : -1)]
      }}
      transition={{ 
        duration: randomDuration, 
        repeat: Infinity, 
        delay: randomDelay,
        ease: "linear"
      }}
      style={{ scale: randomScale, x: px, y: py }}
    >
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className="text-green-500/20">
        <path d="M12 2C12 2 15 5 18 9C21 13 20 18 16 21C12 24 7 22 4 18C1 14 3 8 7 4C9 2 12 2 12 2Z" fill="currentColor" />
        <path d="M12 2V22" stroke="white" strokeWidth="0.5" strokeOpacity="0.1" />
      </svg>
    </motion.div>
  );
};

const Firefly = ({ index, mouseX, mouseY }: { index: number; mouseX: any; mouseY: any }) => {
  // Fireflies parallax - Legal Hook usage at top level of component
  const fx = useTransform(mouseX, [0, 2400], [Math.random() * 60 - 30, Math.random() * 60 - 30]);
  const fy = useTransform(mouseY, [0, 1200], [Math.random() * 40 - 20, Math.random() * 40 - 20]);
  
  return (
    <motion.div
      className="absolute w-1.5 h-1.5 bg-amber-400 rounded-full blur-[1.5px]"
      initial={{ 
        x: Math.random() * 100 + "%", 
        y: Math.random() * 100 + "%", 
        opacity: 0 
      }}
      animate={{ 
        y: [null, Math.random() * -300 - 100 + "px"],
        x: [null, (Math.random() > 0.5 ? 100 : -100) + "px"],
        opacity: [0, 0.8, 0],
        scale: [0, 1.8, 0]
      }}
      transition={{ 
        duration: Math.random() * 10 + 10, 
        repeat: Infinity,
        delay: Math.random() * 10 
      }}
      style={{ translateX: fx, translateY: fy }}
    />
  );
};

const SwayingTree = ({ className, delay = 0, mouseX, mouseY, intensity = 1 }: { className?: string; delay?: number; mouseX: any; mouseY: any; intensity?: number }) => {
  // Parallax movement for trees (more depth)
  const px = useTransform(mouseX, [0, 2400], [40 * intensity, -40 * intensity]);
  const py = useTransform(mouseY, [0, 1200], [30 * intensity, -30 * intensity]);

  return (
    <motion.div 
      className={className}
      animate={{ 
        rotate: [-1, 1, -1],
        scale: [1, 1.02, 1]
      }}
      transition={{ 
        duration: 12, 
        repeat: Infinity, 
        ease: "easeInOut",
        delay 
      }}
      style={{ x: px, y: py }}
    >
      <svg viewBox="0 0 200 400" className="w-full h-full fill-current overflow-visible drop-shadow-[0_0_15px_rgba(0,0,0,0.4)]">
        <path d="M100 400 L110 400 L105 300 Z" />
        <circle cx="100" cy="250" r="80" />
        <circle cx="60" cy="200" r="60" />
        <circle cx="140" cy="200" r="60" />
        <circle cx="100" cy="150" r="70" />
        <circle cx="100" cy="80" r="50" />
      </svg>
    </motion.div>
  );
};

export default function AnimatedBackground() {
  const [mounted, setMounted] = useState(false);
  
  // Cursor tracking
  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);

  // Smooth smoothing for the cursor movement
  const smoothX = useSpring(mouseX, { damping: 50, stiffness: 300 });
  const smoothY = useSpring(mouseY, { damping: 50, stiffness: 300 });

  useEffect(() => {
    setMounted(true);
    if (typeof window === 'undefined') return;
    
    const handleMouseMove = (e: MouseEvent) => {
      mouseX.set(e.clientX);
      mouseY.set(e.clientY);
    };
    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, [mouseX, mouseY]);

  if (!mounted) return <div className="absolute inset-0 bg-[#1b331b] z-0" />;

  return (
    <div className="absolute inset-0 z-0 overflow-hidden pointer-events-none">
      {/* 1. BACKGROUND LAYERS */}
      <div className="absolute inset-0 z-0 scale-110">
        {/* VIBRANT LUSH FOREST BASE */}
        <div 
          className="absolute inset-0 bg-cover bg-center opacity-40 blur-[0.5px] mix-blend-soft-light"
          style={{ backgroundImage: "url('/assets/family_hero.png')" }}
        />
        <div className="absolute inset-0 bg-gradient-to-b from-[#224422]/95 via-[#2d5a2d]/40 to-[#224422]" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(60,110,60,0.5)_0%,#224422_90%)]" />
      </div>

      {/* 2. ANIMATION PARTICLES with PARALLAX */}
      <div className="absolute inset-0 z-10 block">
        {/* FALLING LEAVES - Reduced on small screens for performance/clarity */}
        {[...Array(typeof window !== 'undefined' && window.innerWidth < 768 ? 8 : 15)].map((_, i) => (
          <Leaf key={`leaf-${i}`} index={i} mouseX={smoothX} mouseY={smoothY} />
        ))}

        {/* FLOATING FIREFLIES - Fixed: Now using sub-component */}
        {[...Array(typeof window !== 'undefined' && window.innerWidth < 768 ? 10 : 20)].map((_, i) => (
          <Firefly key={`firefly-${i}`} index={i} mouseX={smoothX} mouseY={smoothY} />
        ))}
      </div>
    </div>
  );
}
