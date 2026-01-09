'use client';

import Link from 'next/link';
import { useState } from 'react';
import { usePathname } from 'next/navigation';

// --- DATA STRUKTUR MENU (Saraf Tunjang) ---
const menuItems = [
  {
    label: 'HOME',
    href: '/',
  },
  {
    label: '📱 DIGITAL',
    href: '/category/digital',
    children: [
      {
        label: 'Aplikasi & OS',
        children: [
            { label: 'Android', href: '/category/android' },
            { label: 'iOS', href: '/category/ios' },
            { label: 'Linux & Lain', href: '/category/linux' },
            { label: 'macOS', href: '/category/macos' },
            { label: 'Windows', href: '/category/windows' }
        ]
      },
      { label: 'Fintech & eWallet', href: '/category/fintech' },
      { label: 'Gaming (E-Sukan)', href: '/category/gaming' },
      { label: 'Telco & Pelan', href: '/category/telco' },
    ],
  },
  {
    label: '🛡 DUNIA IT',
    href: '/category/it',
    children: [
      { label: 'Kreatif & Multimedia', href: '/category/multimedia' },
      { label: 'Siber & Sekuriti', href: '/category/security' },
      { label: 'Sistem & Rangkaian', href: '/category/network' },
      { label: 'Web & Perisian', href: '/category/dev' },
    ],
  },
  {
    label: '🎧 GAJET',
    href: '/category/gadget',
    children: [
      {
        label: 'Audio & Aksesori',
        children: [
            { label: 'Headphone', href: '/category/headphone' },
            { label: 'Smartwatch', href: '/category/smartwatch' },
            { label: 'Speaker', href: '/category/speaker' },
            { label: 'TWS', href: '/category/tws' }
        ]
      },
      {
        label: 'Komputer & Laptop',
        children: [
            { label: 'Desktop', href: '/category/desktop' },
            { label: 'Laptop', href: '/category/laptop' },
            { label: 'Monitor', href: '/category/monitor' },
            { label: 'Storan', href: '/category/storage' }
        ]
      },
      {
        label: 'Telefon Pintar',
        children: [
            { label: 'Flagship', href: '/category/flagship' },
            { label: 'Foldable', href: '/category/foldable' },
            { label: 'Gaming Phone', href: '/category/gaming-phone' },
            { label: 'Mid-Range', href: '/category/midrange' }
        ]
      },
      { label: 'Tablet & 2-in-1', href: '/category/tablet' },
    ],
  },
  {
    label: '📚 PANDUAN',
    href: '/category/guide',
    children: [
      { label: 'Tips (Life-hacks)', href: '/category/tips' },
      { label: 'Trivia (Fakta)', href: '/category/trivia' },
      { label: 'Tutorial (How-to)', href: '/category/tutorial' },
    ],
  },
  {
    label: '🔥 SOHOR',
    href: '/category/trending',
    children: [
      { label: 'Berita', href: '/category/news' },
      { label: 'Ulasan', href: '/category/reviews' },
    ],
  },
  {
    label: '🚀 TEKNOLOGI',
    href: '/category/tech',
    children: [
      { label: 'Automotif (EV)', href: '/category/automotive' },
      { label: 'AI (Kecerdasan Buatan)', href: '/category/ai' },
      { label: 'Sains & Angkasa', href: '/category/science' },
      { label: 'Utiliti Pintar', href: '/category/smart-utility' },
    ],
  },
];

export default function Navbar() {
  const [isOpen, setIsOpen] = useState(false); // Untuk Mobile Menu
  const [activeSub, setActiveSub] = useState<string | null>(null); // Untuk Mobile Submenu

  return (
    <nav className="bg-white shadow-md sticky top-0 z-50 font-sans">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-20">
          
          {/* LOGO */}
          <div className="flex-shrink-0 flex items-center">
            <Link href="/" className="text-2xl font-bold bg-gradient-to-r from-blue-700 to-blue-500 bg-clip-text text-transparent">
              FNDigital<span className="text-gray-800">.my</span>
            </Link>
          </div>

          {/* --- DESKTOP MENU (Hidden on Mobile) --- */}
          <div className="hidden lg:flex items-center space-x-1">
            {menuItems.map((item, index) => (
              <div key={index} className="relative group px-3 py-6">
                
                {/* Level 1: Main Menu */}
                <Link 
                    href={item.href} 
                    className="text-gray-700 font-semibold hover:text-blue-600 transition flex items-center gap-1 text-[13px] uppercase tracking-wide"
                >
                  {item.label}
                  {item.children && (
                     <svg className="w-3 h-3 opacity-50" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path></svg>
                  )}
                </Link>

                {/* Level 2: Dropdown */}
                {item.children && (
                  <div className="absolute left-0 top-full w-64 bg-white shadow-xl rounded-b-xl border-t-2 border-blue-600 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 transform translate-y-2 group-hover:translate-y-0">
                    <div className="py-2">
                      {item.children.map((subItem, subIndex) => (
                        <div key={subIndex} className="relative group/sub">
                            
                            {/* Item Level 2 */}
                            <div className="px-4 py-2 hover:bg-gray-50 flex justify-between items-center cursor-pointer">
                                <Link href={subItem.href || '#'} className="block text-sm text-gray-700 font-medium w-full">
                                    {subItem.label}
                                </Link>
                                {/* Panah Kanan kalau ada Level 3 */}
                                {subItem.children && (
                                    <svg className="w-3 h-3 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7"></path></svg>
                                )}
                            </div>

                            {/* Level 3: Flyout Menu (Keluar tepi) */}
                            {subItem.children && (
                                <div className="absolute left-full top-0 w-56 bg-white shadow-lg rounded-xl border border-gray-100 opacity-0 invisible group-hover/sub:opacity-100 group-hover/sub:visible transition-all duration-200 -ml-1">
                                    <div className="py-2">
                                        {subItem.children.map((child, childIndex) => (
                                            <Link 
                                                key={childIndex} 
                                                href={child.href}
                                                className="block px-4 py-2 text-sm text-gray-600 hover:bg-blue-50 hover:text-blue-600"
                                            >
                                                {child.label}
                                            </Link>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>

          {/* MOBILE BURGER BUTTON */}
          <div className="flex items-center lg:hidden">
            <button onClick={() => setIsOpen(!isOpen)} className="text-gray-700 hover:text-blue-600 focus:outline-none">
              <svg className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                {isOpen ? (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                ) : (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                )}
              </svg>
            </button>
          </div>
        </div>
      </div>

      {/* --- MOBILE MENU (Expandable) --- */}
      {isOpen && (
        <div className="lg:hidden bg-gray-50 border-t border-gray-200 max-h-[80vh] overflow-y-auto">
          <div className="px-2 pt-2 pb-3 space-y-1">
            {menuItems.map((item, index) => (
              <div key={index}>
                {/* Mobile Main Item */}
                <div 
                    onClick={() => setActiveSub(activeSub === item.label ? null : item.label)}
                    className="flex justify-between items-center px-3 py-3 rounded-md text-base font-medium text-gray-800 hover:bg-white hover:shadow-sm cursor-pointer"
                >
                    <Link href={item.href}>{item.label}</Link>
                    {item.children && (
                        <span className="text-gray-400 text-xs">
                             {activeSub === item.label ? '▲' : '▼'}
                        </span>
                    )}
                </div>

                {/* Mobile Submenu */}
                {item.children && activeSub === item.label && (
                    <div className="pl-6 space-y-1 bg-gray-100 rounded-lg mb-2 py-2">
                        {item.children.map((sub, subIdx) => (
                            <div key={subIdx}>
                                <div className="px-3 py-2 text-sm text-gray-600 font-semibold">
                                    {sub.label}
                                </div>
                                {/* Mobile Level 3 */}
                                {sub.children && (
                                    <div className="pl-4 border-l-2 border-gray-300 ml-3 mb-2">
                                        {sub.children.map((child, childIdx) => (
                                            <Link key={childIdx} href={child.href} className="block px-3 py-1.5 text-sm text-gray-500 hover:text-blue-600">
                                                {child.label}
                                            </Link>
                                        ))}
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}
    </nav>
  );
}