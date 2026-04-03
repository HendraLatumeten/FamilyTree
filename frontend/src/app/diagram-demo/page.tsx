'use client';

import VisualDiagram from '../../components/VisualDiagram/VisualDiagram';
import { 
  FileText, 
  Share2, 
  Download, 
  Settings, 
  Layers, 
  MousePointer2, 
  Type, 
  Image as ImageIcon,
  Minus,
  Square,
  Circle,
  ArrowRight,
  Hand,
  Search,
  ChevronDown,
  HelpCircle,
  Eye,
  MoreVertical
} from 'lucide-react';

export default function DiagramDemoPage() {
  return (
    <div className="h-screen w-screen bg-[#050a05] flex flex-col overflow-hidden text-white font-sans">
      {/* Visual Paradigm Mock Header */}
      <header className="h-12 bg-white/5 backdrop-blur-md border-b border-white/10 flex items-center justify-between px-4 shrink-0 shadow-sm z-50">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 bg-emerald-600 rounded flex items-center justify-center font-bold text-white text-xs shadow-lg shadow-emerald-900/40">F</div>
            <span className="text-sm font-black tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-amber-100 to-amber-500">FamilyTree Studio</span>
          </div>
          <div className="h-6 w-px bg-white/10 mx-2"></div>
          <div className="flex items-center gap-4 text-xs font-semibold text-slate-400">
            <button className="flex items-center gap-1 hover:text-emerald-400 transition-colors">File <ChevronDown size={14} /></button>
            <button className="flex items-center gap-1 hover:text-emerald-400 transition-colors">Edit <ChevronDown size={14} /></button>
            <button className="flex items-center gap-1 hover:text-emerald-400 transition-colors">View <ChevronDown size={14} /></button>
            <button className="flex items-center gap-1 hover:text-emerald-400 transition-colors">Format <ChevronDown size={14} /></button>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <button className="flex items-center gap-2 px-3 py-1.5 bg-white/5 hover:bg-white/10 rounded text-xs font-bold border border-white/10 transition-all">
            <Share2 size={14} /> Share
          </button>
          <button className="flex items-center gap-2 px-3 py-1.5 bg-emerald-600 text-white hover:bg-emerald-500 rounded text-xs font-black shadow-lg shadow-emerald-900/40 transition-all">
            <Download size={14} /> Export
          </button>
          <button className="p-1.5 hover:bg-white/10 rounded text-slate-400">
            <Settings size={18} />
          </button>
        </div>
      </header>

      {/* Main Layout */}
      <div className="flex-1 flex overflow-hidden">
        {/* Left Toolbar (Visual Paradigm Style) */}
        <aside className="w-12 bg-white/5 backdrop-blur-md border-r border-white/10 flex flex-col items-center py-4 gap-4 shrink-0 shadow-sm z-40">
          <button className="p-2 bg-emerald-600/20 text-emerald-400 rounded-lg border border-emerald-500/30 shadow-lg" title="Select"><MousePointer2 size={18} /></button>
          <button className="p-2 hover:bg-white/10 text-slate-400 rounded-lg transition-colors" title="Hand"><Hand size={18} /></button>
          <div className="w-8 h-px bg-white/10"></div>
          <button className="p-2 hover:bg-white/10 text-slate-400 rounded-lg transition-colors" title="Text"><Type size={18} /></button>
          <button className="p-2 hover:bg-white/10 text-slate-400 rounded-lg transition-colors" title="Shape"><Square size={18} /></button>
          <button className="p-2 hover:bg-white/10 text-slate-400 rounded-lg transition-colors" title="Circle"><Circle size={18} /></button>
          <button className="p-2 hover:bg-white/10 text-slate-400 rounded-lg transition-colors" title="Connector"><ArrowRight size={18} /></button>
          <button className="p-2 hover:bg-white/10 text-slate-400 rounded-lg transition-colors" title="Image"><ImageIcon size={18} /></button>
          <div className="flex-1"></div>
          <button className="p-2 hover:bg-white/10 text-slate-400 rounded-lg transition-colors" title="Help"><HelpCircle size={18} /></button>
        </aside>

        {/* Library Panel (Left Sidebar) */}
        <aside className="w-56 bg-white/5 backdrop-blur-md border-r border-white/10 flex flex-col shrink-0 shadow-inner z-30">
          <div className="p-3 border-b border-white/10 bg-white/5 flex items-center justify-between">
            <h2 className="text-[10px] font-black uppercase tracking-widest text-slate-500">Diagram Library</h2>
            <Search size={14} className="text-slate-500" />
          </div>
          <div className="flex-1 p-2 overflow-y-auto space-y-4 scrollbar-thin scrollbar-thumb-white/10">
            <div className="space-y-2">
              <h3 className="text-[10px] font-black text-amber-500/80 uppercase tracking-widest px-2">Family Tree Nodes</h3>
              <div className="grid grid-cols-2 gap-2">
                {[1, 2, 3, 4].map(i => (
                  <div key={i} className="aspect-square bg-white/5 border border-white/5 rounded-xl flex flex-col items-center justify-center p-2 hover:border-emerald-500/50 cursor-pointer shadow-sm transition-all group">
                    <div className="w-8 h-8 rounded-full bg-white/10 mb-1 border border-white/10 group-hover:border-emerald-500/30 transition-all"></div>
                    <div className="w-full h-1.5 bg-white/5 rounded-full overflow-hidden">
                      <div className="w-1/2 h-full bg-emerald-500/30"></div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
            <div className="space-y-2">
              <h3 className="text-[10px] font-black text-amber-500/80 uppercase tracking-widest px-2">Connectors</h3>
              <div className="grid grid-cols-2 gap-2">
                {[1, 2].map(i => (
                  <div key={i} className="aspect-square bg-white/5 border border-white/5 rounded-xl flex items-center justify-center p-2 hover:border-emerald-500/50 cursor-pointer shadow-sm transition-all">
                    <Minus size={20} className="text-slate-500" />
                  </div>
                ))}
              </div>
            </div>
          </div>
        </aside>

        {/* Central Canvas Container */}
        <div className="flex-1 relative flex flex-col bg-[#020402]">
          {/* Subheader / Ruler Mockup */}
          <div className="h-8 bg-white/5 border-b border-white/5 flex items-center justify-between px-4 shrink-0 shadow-sm z-20">
            <div className="flex items-center gap-4 text-xs font-bold text-slate-500">
              <span className="text-amber-500/80 uppercase font-black tracking-widest text-[9px]">Canvas: Heritage Tree</span>
            </div>
            <div className="flex items-center gap-2">
              <button className="flex items-center gap-1 px-2 py-0.5 hover:bg-white/10 rounded text-slate-400 font-bold text-[10px] transition-all uppercase tracking-tighter">
                <Layers size={10} /> Layers
              </button>
              <button className="flex items-center gap-1 px-2 py-0.5 hover:bg-white/10 rounded text-slate-400 font-bold text-[10px] transition-all uppercase tracking-tighter">
                <Eye size={10} /> Grid
              </button>
            </div>
          </div>

          {/* Actual DiagramJS Canvas */}
          <div className="flex-1 relative overflow-hidden">
            {/* Grid Pattern Overlay (Mock) */}
            <div className="absolute inset-0 opacity-[0.03] pointer-events-none" 
                 style={{ backgroundImage: 'radial-gradient(#fff 1px, transparent 0)', backgroundSize: '30px 30px' }}></div>
            
            <VisualDiagram />
          </div>
          
          {/* Canvas Footer */}
          <footer className="h-8 bg-black/40 border-t border-white/5 flex items-center justify-between px-4 shrink-0 text-[10px] text-slate-500 z-20 shadow-[0_-1px_3px_rgba(0,0,0,0.2)]">
            <div className="flex gap-4 font-bold uppercase tracking-tight">
              <span className="text-emerald-500/50">ROOT / LEGACY</span>
              <span>Pos: 550, 450</span>
            </div>
            <div className="flex gap-4 font-black">
              <span className="text-amber-500">100%</span>
              <button className="hover:text-white transition-colors"><MoreVertical size={12} /></button>
            </div>
          </footer>
        </div>
      </div>
    </div>
  );
}
