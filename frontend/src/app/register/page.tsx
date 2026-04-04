'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import axios from 'axios';
import { showSuccess, showError } from '@/utils/swal';
import Link from 'next/link';
import { TreePine } from 'lucide-react';
import AnimatedBackground from '@/components/AnimatedBackground';

export default function RegisterPage() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await axios.post('/api/auth/register', { name, email, password });
      showSuccess("Pendaftaran Berhasil", "Silakan login dengan akun baru Anda.");
      router.push('/login');
    } catch (err: any) {
      showError("Pendaftaran Gagal", err.response?.data?.error || 'Gagal membuat akun');
    }
  };

  return (
    <div className="min-h-screen relative flex items-center justify-center bg-[#1b331b] text-white overflow-hidden p-6">
      {/* 1. ANIMATED BACKGROUND WITH PARALLAX */}
      <AnimatedBackground />

      {/* 2. REGISTER FORM BOX */}
      <div className="relative z-10 w-full max-w-md p-8 md:p-10 rounded-3xl bg-[#1b331b]/40 backdrop-blur-2xl shadow-2xl border border-white/5">
        <div className="flex justify-center mb-6">
          <div className="p-3 rounded-2xl bg-gradient-to-br from-green-600 to-emerald-800 shadow-lg">
            <TreePine size={32} className="text-white" />
          </div>
        </div>
        <h1 className="text-4xl font-black mb-2 text-center bg-clip-text text-transparent bg-gradient-to-r from-amber-200 to-amber-500">
          Start Your Legacy
        </h1>
        <p className="text-slate-400 text-center mb-8 text-sm">Join the family and map your history</p>

        <form onSubmit={handleSubmit} className="space-y-5">
          <div className="space-y-1">
            <label className="block text-xs font-bold uppercase tracking-widest text-amber-500/80 ml-1">Full Name</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full px-5 py-3 rounded-2xl bg-white/5 border border-white/10 focus:outline-none focus:border-amber-500/50 focus:bg-white/10 transition-all font-medium"
              placeholder="Full Name"
              required
            />
          </div>
          <div className="space-y-1">
            <label className="block text-xs font-bold uppercase tracking-widest text-amber-500/80 ml-1">Email Address</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-5 py-3 rounded-2xl bg-white/5 border border-white/10 focus:outline-none focus:border-amber-500/50 focus:bg-white/10 transition-all font-medium"
              placeholder="name@example.com"
              required
            />
          </div>
          <div className="space-y-1">
            <label className="block text-xs font-bold uppercase tracking-widest text-amber-500/80 ml-1">Password</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-5 py-3 rounded-2xl bg-white/5 border border-white/10 focus:outline-none focus:border-amber-500/50 focus:bg-white/10 transition-all font-medium"
              placeholder="••••••••"
              required
            />
          </div>
          <button
            type="submit"
            className="w-full py-4 px-6 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-[#050a05] rounded-2xl font-black text-lg shadow-xl shadow-amber-900/40 transition-all transform hover:scale-[1.02] active:scale-[0.98]"
          >
            Create Account
          </button>
        </form>
        <p className="mt-8 text-center text-slate-400 text-sm">
          Already part of the family?{' '}
          <Link href="/login" className="text-amber-400 font-bold hover:underline">
            Login here
          </Link>
        </p>
      </div>
    </div>
  );
}
