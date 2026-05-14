import React from 'react';
import { useAuth } from '../lib/AuthContext';
import { Code2, LogOut, LogIn, LayoutDashboard, Globe } from 'lucide-react';

export const Layout: React.FC<{ children: React.ReactNode, activeTab: string, setActiveTab: (t: string) => void }> = ({ children, activeTab, setActiveTab }) => {
  const { user, signIn, signOut } = useAuth();
  
  const getInitials = (name: string) => {
    return name.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase() || 'U';
  };

  return (
    <div className="flex flex-col h-screen w-full bg-[#F8F9FA] text-[#202124] font-sans overflow-hidden">
      {/* Navbar */}
      <nav className="h-14 bg-white border-b border-[#DADCE0] flex items-center justify-between px-6 shrink-0">
        <div className="flex items-center gap-4">
          <div className="w-8 h-8 bg-[#4285F4] rounded-lg flex items-center justify-center">
            <div className="w-4 h-4 bg-white rounded-[2px] rotate-45"></div>
          </div>
          <h1 className="text-xl font-semibold tracking-tight text-[#202124]">
            Ino Neo <span className="text-[#70757A] font-normal text-sm ml-2">by Google</span>
          </h1>
        </div>
        
        <div className="flex items-center gap-3">
          <div className="flex bg-[#F1F3F4] rounded-full px-3 py-1 items-center gap-2 border border-[#DADCE0] hidden md:flex">
            <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
            <span className="text-xs font-medium uppercase tracking-wider text-[#5F6368]">Deployed Global</span>
          </div>
          
          {user ? (
            <div className="flex items-center gap-3 ml-2">
              <button onClick={signOut} className="text-[#70757A] hover:text-[#202124] text-sm font-medium transition-colors mr-2">Sign Out</button>
              {user.photoURL ? (
                <img src={user.photoURL} alt="Avatar" className="w-8 h-8 rounded-full ring-2 ring-offset-2 ring-white" />
              ) : (
                <div className="w-8 h-8 rounded-full bg-[#EA4335] text-white flex items-center justify-center text-xs font-bold ring-2 ring-offset-2 ring-white cursor-pointer select-none">
                  {getInitials(user.displayName || 'User')}
                </div>
              )}
            </div>
          ) : (
             <button 
                onClick={signIn}
                className="bg-[#4285F4] text-white px-4 py-1.5 rounded-md text-sm font-medium hover:bg-[#1A73E8] transition-colors flex items-center gap-2"
              >
                Sign In
              </button>
          )}
        </div>
      </nav>

      {/* Main Container */}
      <div className="flex flex-1 overflow-hidden">
        {/* Sidebar */}
        <aside className="w-64 bg-[#202124] text-[#BDC1C6] flex flex-col shrink-0 hidden md:flex">
          <div className="p-4 flex flex-col gap-1">
            <div 
              onClick={() => setActiveTab('codex')}
              className={`flex items-center gap-3 px-3 py-2 rounded-md cursor-pointer transition-colors ${
                activeTab === 'codex' ? 'bg-white/10 text-white' : 'hover:bg-white/5'
              }`}
            >
              <LayoutDashboard size={16} className={activeTab === 'codex' ? 'opacity-100' : 'opacity-60'} />
              <span className="text-sm font-medium">Codex Library</span>
            </div>
            <div 
              onClick={() => setActiveTab('explore')}
              className={`flex items-center gap-3 px-3 py-2 rounded-md cursor-pointer transition-colors ${
                activeTab === 'explore' ? 'bg-white/10 text-white' : 'hover:bg-white/5'
              }`}
            >
              <Globe size={16} className={activeTab === 'explore' ? 'opacity-100' : 'opacity-60'} />
              <span className="text-sm font-medium">Deployments</span>
            </div>
            
            <div className="mt-6 px-3 text-[10px] uppercase font-bold tracking-[0.1em] text-[#70757A]">AI Codex Engines</div>
             <div className="flex items-center gap-3 px-3 py-2 rounded-md cursor-pointer border-l-2 border-[#4285F4] bg-[#4285F4]/10 mt-1">
              <span className="text-xs text-white">Gemini 3.1 Pro (Active)</span>
            </div>
            <div className="flex items-center gap-3 px-3 py-2 hover:bg-white/5 rounded-md cursor-pointer">
              <span className="text-xs opacity-70">Claude 3.5 Sonnet</span>
            </div>
            <div className="flex items-center gap-3 px-3 py-2 hover:bg-white/5 rounded-md cursor-pointer">
              <span className="text-xs opacity-70">DeepSeek Coder v2</span>
            </div>
            <div className="flex items-center gap-3 px-3 py-2 hover:bg-white/5 rounded-md cursor-pointer">
              <span className="text-xs opacity-70">Manus-Omni</span>
            </div>
            <div className="flex items-center gap-3 px-3 py-2 hover:bg-white/5 rounded-md cursor-pointer">
              <span className="text-xs opacity-70">ChatGPT (Architectural)</span>
            </div>
          </div>
          <div className="mt-auto p-4 border-t border-white/10 text-[11px] text-[#70757A]">
            <div className="flex justify-between items-center mb-2">
              <span>Storage</span>
              <span>12.4 / 100 GB</span>
            </div>
            <div className="w-full h-1 bg-white/10 rounded-full overflow-hidden">
              <div className="w-[12%] h-full bg-[#4285F4]"></div>
            </div>
          </div>
        </aside>

        {/* Dynamic Content */}
        <main className="flex-1 min-w-0 bg-[#F8F9FA] relative flex flex-col">
          {children}
        </main>
      </div>
    </div>
  );
};
