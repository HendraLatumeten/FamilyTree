'use client';

import { useEffect, useState, useRef, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { useUserStore } from '@/store/userStore';
import { useFamilyStore } from '@/store/familyStore';
import { showSuccess, showError, showConfirm, showLoading, closeSwal, toast, showImagePreview } from '@/utils/swal';
import FamilyTree from '@/components/FamilyTree';
import { LogOut, UserPlus, Link as LinkIcon, Loader2, Share2, Globe, Copy, Check, ChevronLeft, ChevronRight, LayoutDashboard, BarChart3, Users, ShieldCheck } from 'lucide-react';

export default function DashboardPage() {
  const { token, name, role, logout } = useUserStore();
  const { members, relationships, loading, fetchTree, addMember, addRelationship, deleteMember, updatePosition, syncTree, updateMemberDetails, uploadMemberPhoto, publishTree, shareId } = useFamilyStore();
  const router = useRouter();
  const treeRef = useRef<{ getPositions: () => { id: string; posX: number; posY: number }[] }>(null);

  const [mounted, setMounted] = useState(false);
  const [saving, setSaving] = useState(false);
  const [isSidebarExpanded, setIsSidebarExpanded] = useState(false);
  const [isMemberModalOpen, setIsMemberModalOpen] = useState(false);
  const [isRelModalOpen, setIsRelModalOpen] = useState(false);
  const [publishing, setPublishing] = useState(false);
  const [copied, setCopied] = useState(false);

  const [newMember, setNewMember] = useState({ name: '', gender: 'MALE' as 'MALE' | 'FEMALE', title: '', photoUrl: '' });
  const [newRel, setNewRel] = useState({ fromMemberId: '', toMemberId: '', relationshipType: 'PARENT' as 'PARENT' | 'SPOUSE' });

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!mounted) return;
    if (!token) {
      router.push('/login');
    } else {
      fetchTree(token);
    }
  }, [token, router, fetchTree, mounted]);

  const handleAddMember = async (e: React.FormEvent) => {
    e.preventDefault();
    if (token) {
      addMember(newMember);
      setIsMemberModalOpen(false);
      setNewMember({ name: '', gender: 'MALE', title: '', photoUrl: '' });
    }
  };

  const handleAddRel = async (e: React.FormEvent) => {
    e.preventDefault();
    if (token) {
      addRelationship(newRel);
      setIsRelModalOpen(false);
      setNewRel({ fromMemberId: '', toMemberId: '', relationshipType: 'PARENT' });
    }
  };

  const handleLinkDrawn = useCallback(async (from: string, to: string) => {
    if (token) {
      addRelationship({
        fromMemberId: from,
        toMemberId: to,
        relationshipType: 'PARENT'
      });
    }
  }, [token, addRelationship]);

  const handleAddChild = useCallback(async (parentId: string) => {
    if (token) {
      const createdMember = addMember({ name: 'New Member', gender: 'MALE' });
      addRelationship({
        fromMemberId: parentId,
        toMemberId: createdMember.id,
        relationshipType: 'PARENT'
      });
    }
  }, [token, addMember, addRelationship]);

  const handleDeleteMember = useCallback(async (id: string) => {
    if (token) {
      await deleteMember(token, id);
    }
  }, [token, deleteMember]);

  const handlePositionChanged = useCallback(async (id: string, x: number, y: number) => {
    // Disabled auto-save on drag for better performance
  }, []);

  const handleMemberUpdated = useCallback(async (id: string, details: { name?: string; title?: string }) => {
    if (token) {
      await updateMemberDetails(token, id, details);
    }
  }, [token, updateMemberDetails]);

  const handleUploadPhoto = useCallback(async (id: string, file: File) => {
    if (!token) {
      showError("Sesi Habis", "Silakan login kembali");
      return;
    }

    setSaving(true);
    try {
      let targetId = id;
      
      // AUTO-SAVE FLOW FOR NEW MEMBERS
      if (id.startsWith('temp-')) {
        showLoading("Menyimpan...", "Menyimpan data sebelum mengunggah foto");
        
        const positions = treeRef.current?.getPositions() || [];
        const currentTempMember = members.find(m => m.id === id);
        
        const newMembers = await syncTree(token, positions);
        
        // Find the newly created member by name/title match in the fresh list
        const matched = newMembers.find(m => 
          !m.id.startsWith('temp-') && 
          m.name === currentTempMember?.name && 
          m.gender === currentTempMember?.gender
        );
        
        if (matched) {
          targetId = matched.id;
          console.log(`[DASHBOARD] Mapped temp member ${id} to real ID: ${targetId}`);
        } else {
          throw new Error("Gagal menemukan ID baru setelah sinkronisasi");
        }
      }

      showLoading("Mengunggah...", "Sedang mengunggah foto anggota");
      await uploadMemberPhoto(token, targetId, file);
      
      closeSwal();
      toast.fire({ icon: 'success', title: 'Foto berhasil diunggah' });
      console.log(`[DASHBOARD] Photo upload success for member: ${targetId}`);
    } catch (err: any) {
      console.error(`[DASHBOARD] Photo upload failed for member: ${id}`, err);
      showError("Gagal Unggah Foto", err.response?.data?.error || "Pastikan file adalah gambar dan ukuran tidak melebihi 5MB.");
    } finally {
      setSaving(false);
    }
  }, [token, members, syncTree, uploadMemberPhoto]);

  const handleViewPhoto = useCallback((url: string, name: string) => {
    showImagePreview(url, name);
  }, []);

  const handleSaveLayout = async () => {
    if (token && treeRef.current) {
      setSaving(true);
      showLoading("Menyimpan...", "Sedang menyimpan posisi dan data anggota");
      try {
        const positions = treeRef.current.getPositions();
        await syncTree(token, positions);
        closeSwal();
        showSuccess("Berhasil", "Data dan posisi pohon keluarga berhasil disimpan!");
      } catch (err) {
        showError("Gagal Simpan", "Terjadi kesalahan saat menyimpan data.");
        console.error(err);
      } finally {
        setSaving(false);
      }
    }
  };

  const handlePublish = async () => {
    if (!token || !treeRef.current) return;
    
    const result = await showConfirm(
      "Publikasikan?", 
      "Simpan perubahan dan publikasikan pohon keluarga Anda sekarang?"
    );
    
    if (!result.isConfirmed) return;

    setPublishing(true);
    showLoading("Publikasi...", "Sedang menyimpan dan mempublikasikan...");
    try {
      const positions = treeRef.current.getPositions();
      await syncTree(token, positions);
      
      const newShareId = await publishTree(token);
      
      closeSwal();
      showSuccess("Berhasil!", "Pohon keluarga Anda kini dapat diakses secara publik.");
      
      if (newShareId) {
        const url = `${window.location.origin}/public/${newShareId}`;
        window.open(url, '_blank');
      }
    } catch (err) {
      showError("Gagal Publikasi", "Terjadi kesalahan saat memproses permintaan.");
    } finally {
      setPublishing(false);
    }
  };

  const copyToClipboard = () => {
    if (shareId) {
      const url = `${window.location.origin}/public/${shareId}`;
      navigator.clipboard.writeText(url);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  if (!mounted || !token) return (
    <div className="min-h-screen bg-[#050a05] flex items-center justify-center">
       <Loader2 className="animate-spin text-emerald-500" size={48} />
    </div>
  );

  return (
    <div className="h-screen bg-[#050a05] text-white flex flex-col font-sans overflow-hidden selection:bg-amber-500/30">
      <header className="h-16 px-6 bg-white/5 backdrop-blur-md border-b border-white/10 flex items-center justify-between shadow-lg z-50">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-gradient-to-br from-green-600 to-emerald-800 rounded-lg flex items-center justify-center font-bold text-xl shadow-lg shadow-green-900/40">F</div>
          <h1 className="text-xl font-black tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-amber-100 to-amber-500">FamilyTree <span className="text-emerald-500">Studio</span></h1>
        </div>
        <div className="flex items-center gap-4">
          <span className="hidden md:block text-slate-400">Welcome, <span className="text-amber-500 font-bold">{name}</span></span>
          <button onClick={() => { logout(); router.push('/login'); }} className="p-2 hover:bg-white/10 rounded-xl transition-all text-slate-400 hover:text-white">
            <LogOut size={20} />
          </button>
        </div>
      </header>

      <main className="flex-1 flex flex-col p-4 md:p-6 overflow-hidden min-h-0">
        <div className="flex flex-col md:flex-row gap-6 h-full min-h-0">
          <aside className={`flex flex-col gap-4 transition-all duration-500 ease-in-out ${isSidebarExpanded ? 'w-full md:w-80' : 'w-full md:w-20'}`}>
            <div className="p-4 md:p-6 bg-white/5 backdrop-blur-xl rounded-2xl border border-white/10 shadow-2xl overflow-hidden min-h-[140px] flex flex-col">
              <div className="flex items-center justify-between mb-6">
                <h2 className={`text-lg font-black flex items-center gap-2 truncate transition-opacity duration-300 ${isSidebarExpanded ? 'opacity-100' : 'opacity-0 md:hidden'}`}>
                  <div className="w-2 h-6 bg-amber-500 rounded-full"></div>
                  Dashboard
                </h2>
                <button 
                  onClick={() => setIsSidebarExpanded(!isSidebarExpanded)}
                  className="p-2 hover:bg-white/10 rounded-xl transition-all text-slate-400 hover:text-white border border-white/10 bg-white/5 shadow-lg"
                  title={isSidebarExpanded ? "Collapse Sidebar" : "Expand Sidebar"}
                >
                  {isSidebarExpanded ? <ChevronLeft size={20} /> : <ChevronRight size={20} className="mx-auto" />}
                </button>
              </div>

              <div className="space-y-3">
                <button 
                  onClick={() => setIsMemberModalOpen(true)}
                  className={`w-full flex items-center bg-emerald-600/10 border border-emerald-500/20 hover:bg-emerald-600/20 text-emerald-400 rounded-xl transition-all group ${isSidebarExpanded ? 'px-4 py-3 justify-between' : 'p-3 justify-center'}`}
                  title="Add Family Member"
                >
                  <span className={`font-bold truncate transition-all duration-300 ${isSidebarExpanded ? 'opacity-100 w-auto' : 'opacity-0 w-0 md:hidden'}`}>Add Member</span>
                  <UserPlus size={20} className={`${isSidebarExpanded ? 'group-hover:translate-x-1' : ''} transition-transform flex-shrink-0`} />
                </button>
                <button 
                   onClick={() => setIsRelModalOpen(true)}
                  className={`w-full flex items-center bg-amber-600/10 border border-amber-500/20 hover:bg-amber-600/20 text-amber-400 rounded-xl transition-all group ${isSidebarExpanded ? 'px-4 py-3 justify-between' : 'p-3 justify-center'}`}
                  title="Create Relationship"
                >
                  <span className={`font-bold truncate transition-all duration-300 ${isSidebarExpanded ? 'opacity-100 w-auto' : 'opacity-0 w-0 md:hidden'}`}>Relationship</span>
                  <LinkIcon size={20} className={`${isSidebarExpanded ? 'group-hover:translate-x-1' : ''} transition-transform flex-shrink-0`} />
                </button>
              </div>
            </div>

            <div className="p-4 md:p-6 bg-white/5 backdrop-blur-xl rounded-2xl border border-white/10 shadow-2xl flex-1 overflow-y-auto overflow-x-hidden scrollbar-thin">
              <div className={`flex flex-col gap-6 ${isSidebarExpanded ? '' : 'items-center'}`}>
                <div className="w-full">
                  <h3 className={`text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] mb-4 transition-all ${isSidebarExpanded ? 'opacity-100' : 'opacity-0 md:hidden'}`}>Live Statistics</h3>
                  {!isSidebarExpanded && <BarChart3 size={20} className="text-slate-600 mb-4 mx-auto md:block hidden" />}
                  <div className={`grid gap-3 ${isSidebarExpanded ? 'grid-cols-2' : 'grid-cols-1'}`}>
                    <div className="p-3 bg-white/5 rounded-xl border border-white/5 flex flex-col items-center justify-center transition-all">
                      <div className="text-xl font-black text-emerald-400 leading-none">{members.length}</div>
                      <div className={`text-[9px] text-slate-500 uppercase font-bold mt-1 ${isSidebarExpanded ? '' : 'md:hidden'}`}>Members</div>
                    </div>
                    <div className="p-3 bg-white/5 rounded-xl border border-white/5 flex flex-col items-center justify-center transition-all">
                      <div className="text-xl font-black text-amber-500 leading-none">{relationships.length}</div>
                      <div className={`text-[9px] text-slate-500 uppercase font-bold mt-1 ${isSidebarExpanded ? '' : 'md:hidden'}`}>Links</div>
                    </div>
                  </div>
                </div>
                
                <div className="w-full h-px bg-slate-800/50"></div>

                <div className="w-full">
                  <h3 className={`text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] mb-4 transition-all ${isSidebarExpanded ? 'opacity-100' : 'opacity-0 md:hidden'}`}>Hierarchy</h3>
                  {!isSidebarExpanded && <Users size={20} className="text-slate-600 mb-4 mx-auto md:block hidden" />}
                  <div className={`space-y-2 ${isSidebarExpanded ? '' : 'md:hidden'}`}>
                    {members.slice(0, 8).map(m => (
                      <div key={m.id} className="flex items-center gap-3 p-2 rounded-lg hover:bg-slate-800/50 transition-colors border border-transparent hover:border-slate-700/30">
                        <div className={`w-2 h-2 rounded-full flex-shrink-0 ${m.gender === 'MALE' ? 'bg-blue-500 shadow-[0_0_8px_rgba(59,130,246,0.5)]' : 'bg-pink-500 shadow-[0_0_8px_rgba(236,72,153,0.5)]'}`}></div>
                        <span className="text-xs font-semibold truncate text-slate-300">{m.name}</span>
                      </div>
                    ))}
                    {members.length > 8 && <div className="text-[10px] text-center text-slate-500 italic py-2">+{members.length - 8} more...</div>}
                  </div>
                </div>
              </div>
            </div>
          </aside>

          <section className="flex-1 relative flex flex-col min-h-0">
            <div className={`bg-slate-900 mb-2 p-2 rounded-xl border flex flex-wrap items-center justify-between gap-4 transition-all duration-300 ${shareId ? 'border-violet-500/30' : 'border-slate-800'}`}>
              <div className="flex items-center gap-3 ml-2">
                <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse shadow-[0_0_8px_rgba(16,185,129,0.5)]"></div>
                <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest hidden sm:block">Live Diagram</span>
              </div>

              {shareId && (
                <div className="flex-1 flex items-center gap-3 px-3 py-1.5 bg-slate-800/40 rounded-lg border border-slate-700/30 max-w-md animate-in fade-in slide-in-from-left-2 transition-all">
                  <Globe size={14} className="text-violet-400 flex-shrink-0" />
                  <div className="flex flex-col min-w-0">
                    <span className="text-[9px] font-black text-slate-500 uppercase tracking-tight">Public Share URL</span>
                    <span className="text-xs font-mono text-violet-300 truncate">
                      {mounted ? `${window.location.origin}/public/${shareId}` : ''}
                    </span>
                  </div>
                </div>
              )}

              <div className="flex items-center gap-2">
                {role === 'ADMIN' && (
                  <button 
                    onClick={() => router.push('/admin/dashboard')}
                    className="flex items-center gap-2 px-3 py-1.5 bg-emerald-600/10 hover:bg-emerald-600 border border-emerald-500/30 rounded-lg text-emerald-400 hover:text-white transition-all text-xs font-bold mr-2 group"
                  >
                    <ShieldCheck size={14} className="group-hover:scale-110 transition-transform" /> 
                    <span className="hidden md:inline text-[10px] font-black uppercase tracking-widest">Admin Control</span>
                  </button>
                )}
                {shareId && (
                  <div className="flex items-center gap-1.5 mr-2 pr-2 border-r border-slate-800">
                    <button 
                      onClick={() => {
                        if (shareId && typeof window !== 'undefined') {
                          window.open(`${window.location.origin}/public/${shareId}`, '_blank');
                        }
                      }}
                      className="p-2 bg-slate-800 hover:bg-slate-700 rounded-lg text-slate-300 transition-all border border-slate-700 shadow-lg"
                      title="View Public Page"
                    >
                      <Globe size={14} />
                    </button>
                    <button 
                      onClick={copyToClipboard}
                      className="flex items-center gap-2 px-3 py-2 bg-violet-600/10 hover:bg-violet-600/20 text-violet-400 rounded-lg text-[10px] font-black transition-all border border-violet-500/20"
                    >
                      {copied ? <Check size={14} /> : <Copy size={14} />}
                      <span className="hidden lg:block">{copied ? 'Copied!' : 'Copy'}</span>
                    </button>
                  </div>
                )}
                
                <button 
                  onClick={handlePublish}
                  disabled={publishing}
                  className="px-4 py-2 bg-amber-600 hover:bg-amber-500 disabled:bg-slate-700 text-[#050a05] rounded-lg font-black text-[11px] transition-all shadow-lg shadow-amber-900/20 flex items-center gap-2"
                >
                  {publishing ? <Loader2 size={14} className="animate-spin" /> : <Share2 size={14} />}
                  <span>Publish</span>
                </button>
                <button 
                  onClick={handleSaveLayout}
                  disabled={saving}
                  className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 disabled:bg-slate-700 text-white rounded-lg font-black text-[11px] transition-all shadow-lg shadow-emerald-500/20 flex items-center gap-2"
                >
                  {saving ? (
                    <Loader2 size={14} className="animate-spin" />
                  ) : (
                    <Check size={14} />
                  )}
                  <span className="hidden sm:block">{saving ? 'Saving...' : 'Save Layout'}</span>
                </button>
              </div>
            </div>

            <div className="flex-1 bg-[#020402] rounded-3xl border border-white/5 shadow-2xl overflow-hidden relative group">
               {loading ? (
                <div className="w-full h-full flex flex-col items-center justify-center gap-4">
                  <Loader2 className="animate-spin text-emerald-500" size={48} />
                  <p className="text-slate-400 animate-pulse">Building your lineage...</p>
                </div>
              ) : members.length === 0 ? (
                <div className="w-full h-full flex flex-col items-center justify-center gap-6 p-12 text-center bg-slate-950/20">
                  <div className="relative">
                    <div className="absolute inset-0 bg-blue-500 blur-3xl opacity-20 animate-pulse"></div>
                    <button 
                      onClick={() => setIsMemberModalOpen(true)}
                      className="relative w-24 h-24 bg-blue-600 hover:bg-blue-500 text-white rounded-full flex items-center justify-center shadow-2xl shadow-blue-500/40 transform transition-all hover:scale-110 active:scale-95 group/btn"
                    >
                      <UserPlus size={40} className="group-hover/btn:rotate-12 transition-transform" />
                    </button>
                  </div>
                  <div className="space-y-2">
                    <h3 className="text-xl font-bold text-white">Mulai Silsilah Keluarga Anda</h3>
                    <p className="text-slate-500 max-w-xs mx-auto">Klik tombol di atas untuk menambahkan anggota keluarga pertama dan mulai membangun draf Anda.</p>
                  </div>
                </div>
              ) : (
                <FamilyTree 
                  ref={treeRef}
                  members={members} 
                  relationships={relationships} 
                  onLinkDrawn={handleLinkDrawn}
                  onAddChild={handleAddChild}
                  onDeleteMember={handleDeleteMember}
                  onMemberUpdated={handleMemberUpdated}
                  onUploadPhoto={handleUploadPhoto}
                  onViewPhoto={handleViewPhoto}
                  readOnly={false}
                />
              )}
            </div>
            <div className="absolute bottom-6 left-6 p-4 bg-slate-950/80 backdrop-blur-md rounded-2xl border border-slate-800 text-xs text-slate-500 pointer-events-none">
               Interactive GoJS Diagram Engine • eval version
            </div>
          </section>
        </div>
      </main>

      {/* Member Modal */}
      {isMemberModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm transition-all">
          <div className="w-full max-w-md bg-slate-900 border border-slate-800 rounded-3xl p-8 shadow-2xl transform transition-transform animate-in fade-in zoom-in duration-300">
            <h2 className="text-2xl font-bold mb-6 text-blue-400">Add Family Member</h2>
            <form onSubmit={handleAddMember} className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1 text-slate-400">Full Name</label>
                <input 
                  type="text" 
                  value={newMember.name} 
                  onChange={e => setNewMember({...newMember, name: e.target.value})}
                  className="w-full px-4 py-3 bg-slate-800 border border-slate-700 rounded-xl focus:outline-none focus:border-blue-500 transition-all shadow-inner"
                  placeholder="e.g. John Doe"
                  required 
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1 text-slate-400">Relationship Role / Title</label>
                <input 
                  type="text" 
                  value={newMember.title} 
                  onChange={e => setNewMember({...newMember, title: e.target.value})}
                  className="w-full px-4 py-3 bg-slate-800 border border-slate-700 rounded-xl focus:outline-none focus:border-blue-500 transition-all shadow-inner"
                  placeholder="e.g. CEO / Grandfather"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1 text-slate-400">Photo URL (Optional)</label>
                <input 
                  type="text" 
                  value={newMember.photoUrl} 
                  onChange={e => setNewMember({...newMember, photoUrl: e.target.value})}
                  className="w-full px-4 py-3 bg-slate-800 border border-slate-700 rounded-xl focus:outline-none focus:border-blue-500 transition-all shadow-inner"
                  placeholder="https://example.com/photo.jpg"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1 text-slate-400">Gender</label>
                <div className="grid grid-cols-2 gap-3">
                  <button 
                    type="button" 
                    onClick={() => setNewMember({...newMember, gender: 'MALE'})}
                    className={`py-3 rounded-xl font-bold transition-all border ${newMember.gender === 'MALE' ? 'bg-blue-600/20 border-blue-500 text-blue-400 shadow-lg shadow-blue-500/10' : 'bg-slate-800 border-slate-700 text-slate-500'}`}
                  >
                    MALE
                  </button>
                  <button 
                    type="button" 
                    onClick={() => setNewMember({...newMember, gender: 'FEMALE'})}
                    className={`py-3 rounded-xl font-bold transition-all border ${newMember.gender === 'FEMALE' ? 'bg-pink-600/20 border-pink-500 text-pink-400 shadow-lg shadow-pink-500/10' : 'bg-slate-800 border-slate-700 text-slate-500'}`}
                  >
                    FEMALE
                  </button>
                </div>
              </div>
              <div className="flex gap-3 pt-4">
                <button type="button" onClick={() => setIsMemberModalOpen(false)} className="flex-1 py-3 px-4 bg-slate-800 hover:bg-slate-700 rounded-xl font-bold transition-all">Cancel</button>
                <button type="submit" className="flex-1 py-3 px-4 bg-blue-600 hover:bg-blue-500 rounded-xl font-bold transition-all shadow-lg shadow-blue-500/20">Add Member</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Relationship Modal */}
      {isRelModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="w-full max-w-md bg-slate-900 border border-slate-800 rounded-3xl p-8 shadow-2xl animate-in fade-in zoom-in duration-300">
            <h2 className="text-2xl font-bold mb-6 text-fuchsia-400">Create Relationship</h2>
            <form onSubmit={handleAddRel} className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1 text-slate-400">From (Parent/Spouse 1)</label>
                <select 
                  className="w-full px-4 py-3 bg-slate-800 border border-slate-700 rounded-xl focus:outline-none focus:border-fuchsia-500"
                  value={newRel.fromMemberId}
                  onChange={e => setNewRel({...newRel, fromMemberId: e.target.value})}
                  required
                >
                  <option value="">Select Member</option>
                  {members.map(m => <option key={m.id} value={m.id}>{m.name}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium mb-1 text-slate-400">To (Child/Spouse 2)</label>
                <select 
                  className="w-full px-4 py-3 bg-slate-800 border border-slate-700 rounded-xl focus:outline-none focus:border-fuchsia-500"
                   value={newRel.toMemberId}
                  onChange={e => setNewRel({...newRel, toMemberId: e.target.value})}
                  required
                >
                  <option value="">Select Member</option>
                  {members.map(m => m.id !== newRel.fromMemberId && <option key={m.id} value={m.id}>{m.name}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium mb-1 text-slate-400">Relationship Type</label>
                <select 
                  className="w-full px-4 py-3 bg-slate-800 border border-slate-700 rounded-xl focus:outline-none focus:border-fuchsia-500 font-bold"
                  value={newRel.relationshipType}
                  onChange={e => setNewRel({...newRel, relationshipType: e.target.value as 'PARENT' | 'SPOUSE'})}
                >
                  <option value="PARENT">PARENT & CHILD</option>
                  <option value="SPOUSE">SPOUSE</option>
                </select>
              </div>
              <div className="flex gap-3 pt-4">
                <button type="button" onClick={() => setIsRelModalOpen(false)} className="flex-1 py-3 px-4 bg-slate-800 hover:bg-slate-700 rounded-xl font-bold transition-all">Cancel</button>
                <button type="submit" className="flex-1 py-3 px-4 bg-fuchsia-600 hover:bg-fuchsia-500 rounded-xl font-bold transition-all shadow-lg shadow-fuchsia-500/20">Establish Link</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
