'use client';

import { useEffect, useState } from 'react';
import { createClient } from '@/lib/supabase-client';
import Link from 'next/link';

export default function PagesManager() {
  const [pages, setPages] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const supabase = createClient();

  const WEBSITE_URL = 'https://fndigital.my'; // Atau localhost:3000

  // --- 1. Tarik Data Pages ---
  const fetchPages = async () => {
    const { data } = await supabase
      .from('pages')
      .select('*')
      .order('created_at', { ascending: true }); // Page statik biasanya ikut urutan buat

    if (data) setPages(data);
    setLoading(false);
  };

  useEffect(() => {
    fetchPages();
  }, []);

  // --- 2. Fungsi Padam ---
  const handleDelete = async (id: string) => {
    if (!confirm('Betul nak padam halaman ni? Halaman ni akan hilang dari website.')) return;

    const { error } = await supabase
      .from('pages')
      .delete()
      .eq('id', id);

    if (error) {
      alert('Error: ' + error.message);
    } else {
      setPages(pages.filter((p) => p.id !== id));
      alert('Halaman berjaya dipadam! 🗑️');
    }
  };

  // --- 3. Toggle Status (Publish/Draft) ---
  const handleToggleStatus = async (id: string, currentStatus: boolean) => {
    const { error } = await supabase
      .from('pages')
      .update({ is_published: !currentStatus })
      .eq('id', id);

    if (!error) {
      // Update state secara manual supaya takyah fetch balik
      setPages(pages.map(p => p.id === id ? { ...p, is_published: !currentStatus } : p));
    }
  };

  if (loading) return <div className="p-8 text-center text-gray-500 animate-pulse">Memuatkan senarai halaman...</div>;

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Pengurusan Halaman</h1>
          <p className="text-sm text-gray-500">Buat halaman statik seperti About Us, Contact, dll.</p>
        </div>
        <Link 
          href="/admin/pages/create" 
          className="bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-bold hover:bg-blue-700 shadow-sm transition flex items-center gap-2"
        >
          <span>+</span> Tambah Halaman
        </Link>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        <table className="w-full text-left">
          <thead className="bg-gray-50 border-b">
            <tr>
              <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase">Tajuk Halaman</th>
              <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase">URL Slug</th>
              <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase text-center">Status</th>
              <th className="px-6 py-4 text-right text-xs font-bold text-gray-500 uppercase">Aksi</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {pages.map((page) => (
              <tr key={page.id} className="hover:bg-blue-50 transition">
                <td className="px-6 py-4">
                  <span className="font-bold text-gray-800 block">{page.title}</span>
                  <span className="text-xs text-gray-400">ID: {page.id.slice(0, 8)}...</span>
                </td>
                
                <td className="px-6 py-4">
                  <a 
                    href={`${WEBSITE_URL}/${page.slug}`} 
                    target="_blank" 
                    className="text-blue-600 hover:underline text-sm font-mono flex items-center gap-1"
                  >
                    /{page.slug}
                    <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"></path></svg>
                  </a>
                </td>

                <td className="px-6 py-4 text-center">
                  <button 
                    onClick={() => handleToggleStatus(page.id, page.is_published)}
                    className={`px-3 py-1 rounded-full text-xs font-bold border transition ${
                      page.is_published 
                        ? 'bg-green-100 text-green-700 border-green-200 hover:bg-green-200' 
                        : 'bg-gray-100 text-gray-600 border-gray-200 hover:bg-gray-200'
                    }`}
                  >
                    {page.is_published ? 'Published' : 'Draft'}
                  </button>
                </td>

                <td className="px-6 py-4 text-right space-x-3">
                  <Link 
                    href={`/admin/pages/edit/${page.id}`} 
                    className="text-blue-600 hover:text-blue-800 font-medium text-sm"
                  >
                    Edit
                  </Link>
                  <button 
                    onClick={() => handleDelete(page.id)}
                    className="text-red-500 hover:text-red-700 font-medium text-sm"
                  >
                    Padam
                  </button>
                </td>
              </tr>
            ))}
            {pages.length === 0 && (
              <tr>
                <td colSpan={4} className="p-8 text-center text-gray-400">
                  Tiada halaman lagi.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}