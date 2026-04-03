'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { useFamilyStore } from '@/store/familyStore';
import FamilyTree from '@/components/FamilyTree';
import { Loader2, Trees } from 'lucide-react';

export default function PublicTreeView() {
  const { shareId: urlShareId } = useParams();
  const { members, relationships, loading, fetchPublicTree } = useFamilyStore();
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (urlShareId) {
      fetchPublicTree(urlShareId as string).catch((err) => {
        setError('Pohon keluarga tidak ditemukan atau bersifat privat.');
      });
    }
  }, [urlShareId, fetchPublicTree]);

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center gap-6">
        <Loader2 className="animate-spin text-blue-500" size={64} />
        <div className="flex flex-col items-center gap-2">
           <h2 className="text-2xl font-bold text-white animate-pulse">Memuat Silsilah Keluarga...</h2>
           <p className="text-slate-500 font-medium">Menyiapkan tampilan draf publik</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center p-6 text-center">
        <div className="w-20 h-20 bg-red-500/10 rounded-full flex items-center justify-center mb-6">
          <Trees size={40} className="text-red-500" />
        </div>
        <h2 className="text-3xl font-bold text-white mb-2">Ops! Ada Masalah</h2>
        <p className="text-slate-400 max-w-md mb-8">{error}</p>
        <a href="/" className="px-8 py-3 bg-slate-900 hover:bg-slate-800 text-white rounded-xl font-bold transition-all border border-slate-800">
          Kembali ke Beranda
        </a>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-slate-950 overflow-hidden select-none">
      {/* Branding Overlay (Subtle) */}
      <div className="absolute top-6 left-6 z-10 pointer-events-none opacity-40 hover:opacity-100 transition-opacity flex items-center gap-2">
        <div className="w-8 h-8 bg-blue-600 rounded flex items-center justify-center font-bold text-lg text-white">F</div>
        <span className="text-sm font-bold tracking-widest text-slate-400">FAMILYTREE <span className="text-blue-500">VIEWER</span></span>
      </div>

      {/* Full Screen Diagram */}
      <div className="w-full h-full">
        <FamilyTree 
          members={members}
          relationships={relationships}
          readOnly={true}
        />
      </div>

      {/* Floating Info Plate */}
      <div className="absolute bottom-6 right-6 z-10 p-4 bg-slate-900/60 backdrop-blur-md rounded-2xl border border-slate-800 flex items-center gap-4 transition-all hover:bg-slate-900/80 shadow-2xl">
        <div className="flex flex-col">
          <span className="text-[10px] font-bold text-blue-400 uppercase tracking-widest">Public Draft</span>
          <span className="text-xs text-slate-400">{members.length} Anggota • {relationships.length} Hubungan</span>
        </div>
      </div>
    </div>
  );
}
