'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase-client';
import { useEffect, useState } from 'react';
import { Toaster } from 'sonner'; // <--- 1. IMPORT BARU

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  
  // State Login
  const [isLoading, setIsLoading] = useState(true);
  const [isAuthorized, setIsAuthorized] = useState(false);

  const supabase = createClient();

  useEffect(() => {
    const checkUser = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();

        if (session) {
          setIsAuthorized(true);
        } else {
          setIsAuthorized(false);
        }
      } catch (error) {
        console.error('Error auth:', error);
        setIsAuthorized(false);
      } finally {
        setIsLoading(false);
      }
    };

    checkUser();
  }, []); // Jalan sekali sahaja

  const handleLogout = async () => {
    await supabase.auth.signOut();
    window.location.href = '/login'; // Guna hard reload supaya bersih
  };

  // --- 1. LOADING SCREEN ---
  if (isLoading) {
    return (
      <div className="flex h-screen items-center justify-center bg-gray-100">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  // --- 2. JIKA TAK AUTHORIZED (STOP LOOP DISINI) ---
  // Kita tak redirect auto. Kita suruh user tekan sendiri.
  if (!isAuthorized) {
    return (
      <div className="flex h-screen flex-col items-center justify-center bg-gray-100 p-4">
        <div className="bg-white p-8 rounded-xl shadow-lg text-center max-w-md w-full">
          <div className="text-5xl mb-4">🔒</div>
          <h2 className="text-2xl font-bold text-gray-800 mb-2">Akses Terhad</h2>
          <p className="text-gray-600 mb-6">Sesi anda telah tamat atau tidak dijumpai. Sila log masuk semula.</p>
          <a 
            href="/login" 
            className="block w-full bg-blue-600 text-white py-3 px-4 rounded-lg font-bold hover:bg-blue-700 transition"
          >
            Log Masuk Admin
          </a>
        </div>
      </div>
    );
  }

  // --- 3. JIKA AUTHORIZED, BARU TUNJUK ADMIN ---
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

  const SidebarContent = () => (
    <div className="flex flex-col h-full bg-gray-900 border-r border-gray-800">
      <div className="h-16 flex items-center px-6 bg-gray-950 border-b border-gray-800 flex-shrink-0">
        <span className="text-xl font-bold bg-gradient-to-r from-blue-400 to-blue-600 bg-clip-text text-transparent tracking-wide">
          FNDigital<span className="text-white text-xs ml-1 uppercase bg-gray-700 px-1 rounded">Admin</span>
        </span>
      </div>
      <nav className="flex-1 overflow-y-auto py-6 px-3 custom-scrollbar">
        {/* --- BAHAGIAN DASHBOARD --- */}
        <div className="px-4 py-2 text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Dashboard</div>
        <NavLink 
          href="/admin" 
          label="Ringkasan" 
          icon={<svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z"></path></svg>} 
        />

        {/* --- BAHAGIAN CONTENT (CMS) --- */}
        <div className="px-4 py-2 mt-6 text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Content</div>

        {/* 1. POSTS */}
        <NavLink 
          href="/admin/posts" 
          label="Posts (Artikel)" 
          icon={<svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"></path></svg>} 
        />

        {/* 2. PAGES */}
        <NavLink 
          href="/admin/pages" 
          label="Pages (Halaman)" 
          icon={<svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z"></path></svg>} 
        />

        {/* 3. MEDIA */}
        <NavLink 
          href="/admin/media" 
          label="Media (Gambar)" 
          icon={<svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"></path></svg>} 
        />

        {/* 4. COMMENTS */}
        <NavLink 
          href="/admin/comments" 
          label="Comments (Komen)" 
          icon={<svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"></path></svg>} 
        />

        {/* --- BAHAGIAN SYSTEM --- */}
        <div className="px-4 py-2 mt-6 text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Sistem</div>

        <NavLink 
          href="/admin/menus" 
          label="Menu Manager" 
          icon={<svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16"></path></svg>} 
        />

        <NavLink 
          href="/admin/settings" 
          label="Tetapan" 
          icon={<svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"></path><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"></path></svg>} 
        />
        
        {/* Butang Logout */}
        <button
          onClick={handleLogout}
          className="flex w-full items-center gap-3 px-4 py-3 text-sm font-medium text-red-400 hover:bg-red-900/20 hover:text-red-300 transition-colors rounded-lg mt-4"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
          </svg>
          Log Keluar
        </button>
      </nav>
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-100 font-sans">
      
      {/* 2. COMPONENT TOASTER (Letak kat sini) */}
      <Toaster position="top-center" richColors />

      <aside className="fixed top-0 left-0 z-40 w-64 h-screen hidden md:block">
         <SidebarContent />
      </aside>
      {isMobileMenuOpen && (
        <div className="fixed inset-0 z-50 md:hidden flex">
          <aside className="w-64 h-full relative z-50">
             <SidebarContent />
          </aside>
          <div className="absolute inset-0 bg-black/50" onClick={() => setIsMobileMenuOpen(false)}></div>
        </div>
      )}
      <div className="md:ml-64 flex flex-col min-h-screen">
        <header className="md:hidden bg-white shadow-sm p-4 flex justify-between items-center sticky top-0 z-30">
             <span className="font-bold text-gray-800">Admin Panel</span>
             <button onClick={() => setIsMobileMenuOpen(true)} className="p-2 bg-gray-100 rounded text-gray-600 hover:bg-gray-200">
               <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16"></path></svg>
             </button>
        </header>
        <main className="flex-1 p-4 md:p-8">
            {children}
        </main>
      </div>
    </div>
  );
}