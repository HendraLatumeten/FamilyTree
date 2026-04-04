'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useUserStore } from '@/store/userStore';
import { showSuccess, showError, showConfirm, showLoading, closeSwal } from '@/utils/swal';
import axios from 'axios';
import { 
  Users, 
  Globe, 
  ShieldCheck, 
  UserX, 
  UserCheck, 
  LayoutDashboard, 
  ExternalLink,
  Search,
  Loader2,
  ChevronLeft
} from 'lucide-react';

interface AdminUser {
  id: string;
  name: string;
  email: string;
  role: string;
  isActive: boolean;
  isTreePublic: boolean;
  treeShareId: string | null;
  createdAt: string;
  _count: {
    members: number;
  };
}

export default function AdminDashboard() {
  const { token, role } = useUserStore();
  const router = useRouter();
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTab, setActiveTab] = useState<'users' | 'trees'>('users');

  useEffect(() => {
    if (!token || role !== 'ADMIN') {
      router.push('/dashboard');
      return;
    }
    fetchData();
  }, [token, role]);

  const fetchData = async () => {
    try {
      setLoading(true);
      const res = await axios.get('/api/admin/users', {
        headers: { Authorization: `Bearer ${token}` }
      });
      setUsers(res.data);
    } catch (err) {
      showError("Gagal Memuat Data", "Terjadi kesalahan saat mengambil data admin.");
    } finally {
      setLoading(false);
    }
  };

  const toggleUserStatus = async (userId: string, currentStatus: boolean) => {
    const action = currentStatus ? 'nonaktifkan' : 'aktifkan';
    const result = await showConfirm(
      `Konfirmasi Status`,
      `Apakah Anda yakin ingin ${action} user ini?`,
      currentStatus ? 'Ya, Nonaktifkan' : 'Ya, Aktifkan'
    );

    if (result.isConfirmed) {
      try {
        showLoading(`Sedang ${action}...`);
        await axios.patch(`/api/admin/users/${userId}/status`, 
          { isActive: !currentStatus },
          { headers: { Authorization: `Bearer ${token}` } }
        );
        closeSwal();
        showSuccess("Berhasil", `User telah di${action}.`);
        fetchData();
      } catch (err) {
        showError("Gagal", "Terjadi kesalahan saat mengubah status user.");
      }
    }
  };

  const filteredUsers = users.filter(u => 
    u.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
    u.email.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const publishedTrees = users.filter(u => u.isTreePublic && u.treeShareId);

  if (loading && users.length === 0) {
    return (
      <div className="h-screen bg-slate-950 flex items-center justify-center">
        <Loader2 className="w-10 h-10 text-blue-500 animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-950 text-white font-sans">
      {/* Header */}
      <header className="h-20 px-8 bg-slate-900/50 backdrop-blur-md border-b border-slate-800 flex items-center justify-between sticky top-0 z-50">
        <div className="flex items-center gap-4">
          <button 
            onClick={() => router.push('/dashboard')}
            className="p-2 hover:bg-slate-800 rounded-lg transition-colors text-slate-400 hover:text-white"
          >
            <ChevronLeft size={24} />
          </button>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl flex items-center justify-center shadow-lg shadow-blue-500/20">
              <ShieldCheck size={24} className="text-white" />
            </div>
            <div>
              <h1 className="text-xl font-bold tracking-tight">Admin Console</h1>
              <p className="text-xs text-slate-400 font-medium uppercase tracking-wider">Management Dashboard</p>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-6">
          <div className="hidden md:flex flex-col items-end">
            <span className="text-sm font-semibold text-blue-400">Security Active</span>
            <span className="text-[10px] text-slate-500 uppercase tracking-widest">v1.2.0-stable</span>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto p-6 md:p-10">
        {/* Stats Row */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
          <div className="bg-slate-900 p-6 rounded-3xl border border-slate-800 shadow-xl relative overflow-hidden group">
            <div className="absolute top-0 right-0 p-8 opacity-5 group-hover:scale-110 transition-transform duration-500">
              <Users size={80} />
            </div>
            <p className="text-slate-400 text-sm font-medium mb-1">Total Users</p>
            <h3 className="text-4xl font-bold">{users.length}</h3>
          </div>
          <div className="bg-slate-900 p-6 rounded-3xl border border-slate-800 shadow-xl relative overflow-hidden group">
            <div className="absolute top-0 right-0 p-8 opacity-5 group-hover:scale-110 transition-transform duration-500">
              <Globe size={80} />
            </div>
            <p className="text-slate-400 text-sm font-medium mb-1">Published Trees</p>
            <h3 className="text-4xl font-bold text-emerald-400">{publishedTrees.length}</h3>
          </div>
          <div className="bg-slate-900 p-6 rounded-3xl border border-slate-800 shadow-xl relative overflow-hidden group">
            <div className="absolute top-0 right-0 p-8 opacity-5 group-hover:scale-110 transition-transform duration-500">
              <ShieldCheck size={80} />
            </div>
            <p className="text-slate-400 text-sm font-medium mb-1">System Health</p>
            <h3 className="text-4xl font-bold text-blue-400 uppercase text-2xl">Stable</h3>
          </div>
        </div>

        {/* Action Bar */}
        <div className="flex flex-col md:flex-row items-center justify-between gap-6 mb-8">
          <div className="flex bg-slate-900 p-1 rounded-2xl border border-slate-800 w-full md:w-auto">
            <button 
              onClick={() => setActiveTab('users')}
              className={`flex-1 md:flex-none px-6 py-2.5 rounded-xl text-sm font-bold transition-all duration-300 flex items-center justify-center gap-2 ${activeTab === 'users' ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/20' : 'text-slate-400 hover:text-white'}`}
            >
              <Users size={16} /> User Management
            </button>
            <button 
              onClick={() => setActiveTab('trees')}
              className={`flex-1 md:flex-none px-6 py-2.5 rounded-xl text-sm font-bold transition-all duration-300 flex items-center justify-center gap-2 ${activeTab === 'trees' ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/20' : 'text-slate-400 hover:text-white'}`}
            >
              <Globe size={16} /> Public Trees
            </button>
          </div>

          <div className="relative w-full md:w-80 group">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 group-focus-within:text-blue-400 transition-colors" size={18} />
            <input 
              type="text" 
              placeholder="Search user..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-12 pr-4 py-3 bg-slate-900 border border-slate-800 rounded-2xl focus:outline-none focus:border-blue-500/50 transition-all placeholder:text-slate-600 text-sm"
            />
          </div>
        </div>

        {/* Content Table */}
        <div className="bg-slate-900 rounded-3xl border border-slate-800 shadow-2xl overflow-hidden">
          {activeTab === 'users' ? (
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead>
                  <tr className="bg-slate-800/30 border-b border-slate-800">
                    <th className="px-6 py-5 text-xs font-bold uppercase tracking-wider text-slate-500">User Identity</th>
                    <th className="px-6 py-5 text-xs font-bold uppercase tracking-wider text-slate-500">Status</th>
                    <th className="px-6 py-5 text-xs font-bold uppercase tracking-wider text-slate-500">Activity</th>
                    <th className="px-6 py-5 text-xs font-bold uppercase tracking-wider text-slate-500">Data</th>
                    <th className="px-6 py-5 text-xs font-bold uppercase tracking-wider text-slate-500">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/50">
                  {filteredUsers.map(user => (
                    <tr key={user.id} className="hover:bg-slate-800/20 transition-colors group">
                      <td className="px-6 py-5">
                        <div className="flex flex-col">
                          <span className="font-bold text-slate-200 group-hover:text-white transition-colors">{user.name}</span>
                          <span className="text-xs text-slate-500">{user.email}</span>
                        </div>
                      </td>
                      <td className="px-6 py-5">
                        {user.isActive ? (
                          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/10 text-emerald-500 text-[10px] font-black uppercase tracking-widest border border-emerald-500/20">
                            <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse"></span>
                            Active
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-red-500/10 text-red-500 text-[10px] font-black uppercase tracking-widest border border-red-500/20">
                            Deactivated
                          </span>
                        )}
                      </td>
                      <td className="px-6 py-5">
                        <span className="text-xs text-slate-400 block mb-1">Joined</span>
                        <span className="text-xs font-medium text-slate-300">{new Date(user.createdAt).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' })}</span>
                      </td>
                      <td className="px-6 py-5 text-slate-300">
                        <div className="flex items-center gap-2">
                          <Users size={14} className="text-slate-500" />
                          <span className="text-sm font-bold">{user._count.members} <span className="text-[10px] text-slate-500 font-medium">Nodes</span></span>
                        </div>
                      </td>
                      <td className="px-6 py-5">
                        {user.role !== 'ADMIN' && (
                          <button 
                            onClick={() => toggleUserStatus(user.id, user.isActive)}
                            className={`p-2 rounded-xl transition-all duration-300 ${user.isActive ? 'bg-red-500/10 text-red-500 hover:bg-red-500 hover:text-white' : 'bg-emerald-500/10 text-emerald-500 hover:bg-emerald-500 hover:text-white'}`}
                            title={user.isActive ? 'Nonaktifkan' : 'Aktifkan'}
                          >
                            {user.isActive ? <UserX size={18} /> : <UserCheck size={18} />}
                          </button>
                        )}
                        {user.role === 'ADMIN' && <span className="text-[10px] text-blue-500 font-black uppercase tracking-widest">Protected</span>}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead>
                  <tr className="bg-slate-800/30 border-b border-slate-800">
                    <th className="px-6 py-5 text-xs font-bold uppercase tracking-wider text-slate-500">Publisher</th>
                    <th className="px-6 py-5 text-xs font-bold uppercase tracking-wider text-slate-500">Live URL</th>
                    <th className="px-6 py-5 text-xs font-bold uppercase tracking-wider text-slate-500">Visibility</th>
                    <th className="px-6 py-5 text-xs font-bold uppercase tracking-wider text-slate-500">Nodes</th>
                    <th className="px-6 py-5 text-xs font-bold uppercase tracking-wider text-slate-500">Link</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/50">
                  {publishedTrees.map(user => (
                    <tr key={user.id} className="hover:bg-slate-800/20 transition-colors">
                      <td className="px-6 py-5 font-bold text-slate-200">{user.name}</td>
                      <td className="px-6 py-5 font-mono text-[10px] text-slate-400">{`/tree/${user.treeShareId}`}</td>
                      <td className="px-6 py-5">
                        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-violet-500/10 text-violet-500 text-[10px] font-black uppercase tracking-widest border border-violet-500/20">
                          Public
                        </span>
                      </td>
                      <td className="px-6 py-5 text-sm font-bold">{user._count.members}</td>
                      <td className="px-6 py-5">
                        <a 
                          href={`/tree/${user.treeShareId}`} 
                          target="_blank"
                          className="inline-flex items-center gap-2 px-4 py-2 bg-slate-800 hover:bg-blue-600 rounded-xl text-xs font-bold transition-all ring-1 ring-slate-700"
                        >
                          <ExternalLink size={14} /> Open
                        </a>
                      </td>
                    </tr>
                  ))}
                  {publishedTrees.length === 0 && (
                    <tr>
                      <td colSpan={5} className="px-6 py-20 text-center text-slate-500 font-medium italic">
                        Belum ada pohon keluarga yang dipublikasikan secara publik.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
