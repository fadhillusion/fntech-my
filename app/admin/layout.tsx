'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import { useState } from 'react';

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.push('/login');
  };

  const NavLink = ({ href, icon, label }: { href: string; icon: any; label: string }) => {
    const isActive = pathname === href;
    return (
      <Link
        href={href}
        className={`flex items-center gap-3 px-4 py-3 text-sm font-medium transition-colors rounded-lg mb-1 ${
          isActive 
            ? 'bg-blue-600 text-white shadow-md' 
            : 'text-gray-400 hover:bg-gray-800 hover:text-white'
        }`}
      >
        {icon}
        {label}
      </Link>
    );
  };

  // Komponen Isi Sidebar
  const SidebarContent = () => (
    <div className="flex flex-col h-full bg-gray-900 border-r border-gray-800">
      {/* Logo */}
      <div className="h-16 flex items-center px-6 bg-gray-950 border-b border-gray-800 flex-shrink-0">
        <span className="text-xl font-bold bg-gradient-to-r from-blue-400 to-blue-600 bg-clip-text text-transparent tracking-wide">
          FNDigital<span className="text-white text-xs ml-1 uppercase bg-gray-700 px-1 rounded">Admin</span>
        </span>
      </div>

      {/* Menu List */}
      <nav className="flex-1 overflow-y-auto py-6 px-3 custom-scrollbar">
        <div className="px-4 py-2 text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Utama</div>
        
        <NavLink 
          href="/admin" 
          label="Dashboard" 
          icon={<svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z"></path></svg>} 
        />
        <NavLink 
          href="/admin/create" 
          label="Tulis Artikel" 
          icon={<svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z"></path></svg>} 
        />

        <div className="px-4 py-2 mt-6 text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Sistem</div>

        <NavLink 
          href="/admin/settings" 
          label="Tetapan Api" 
          icon={<svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"></path><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"></path></svg>} 
        />

        <div className="border-t border-gray-800 mt-6 pt-6 pb-6">
          <a href="/" target="_blank" className="flex items-center gap-3 px-4 py-3 text-sm font-medium text-gray-400 hover:bg-gray-800 hover:text-white transition-colors rounded-lg">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"></path></svg>
            Lihat Website
          </a>
          <button onClick={handleLogout} className="w-full text-left flex items-center gap-3 px-4 py-3 text-sm font-medium text-red-400 hover:bg-red-900/20 hover:text-red-300 transition-colors rounded-lg mt-1">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"></path></svg>
            Log Keluar
          </button>
        </div>
      </nav>
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-100 font-sans">
      
      {/* --- SIDEBAR DESKTOP (FIXED POS) --- */}
      {/* Kita guna 'fixed' + 'left-0' + 'top-0' supaya dia melekat kat skrin */}
      <aside className="fixed top-0 left-0 z-40 w-64 h-screen hidden md:block">
         <SidebarContent />
      </aside>

      {/* --- SIDEBAR MOBILE (FIXED OVERLAY) --- */}
      {isMobileMenuOpen && (
        <div className="fixed inset-0 z-50 md:hidden flex">
          <aside className="w-64 h-full relative z-50">
             <SidebarContent />
          </aside>
          {/* Gelap Belakang */}
          <div className="absolute inset-0 bg-black/50" onClick={() => setIsMobileMenuOpen(false)}></div>
        </div>
      )}

      {/* --- CONTENT AREA (Kanan) --- */}
      {/* Kita letak 'md:ml-64' (Margin Left 64) supaya content tak tertindih bawah sidebar */}
      <div className="md:ml-64 flex flex-col min-h-screen">
        
        {/* Header Mobile */}
        <header className="md:hidden bg-white shadow-sm p-4 flex justify-between items-center sticky top-0 z-30">
             <span className="font-bold text-gray-800">Admin Panel</span>
             <button onClick={() => setIsMobileMenuOpen(true)} className="p-2 bg-gray-100 rounded text-gray-600 hover:bg-gray-200">
               <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16"></path></svg>
             </button>
        </header>

        {/* Isi Page */}
        <main className="flex-1 p-4 md:p-8">
            {children}
        </main>

      </div>

    </div>
  );
}