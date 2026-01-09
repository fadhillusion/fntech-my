'use client';

import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import Link from 'next/link';

// --- KAMUS KATEGORI ---
const categoryMap: Record<string, string> = {
  'android': 'Android', 'ios': 'iOS', 'linux': 'Linux & Lain', 'macos': 'macOS', 'windows': 'Windows',
  'fintech': 'Fintech & eWallet', 'gaming': 'Gaming (E-Sukan)', 'telco': 'Telco & Pelan',
  'multimedia': 'Kreatif & Multimedia', 'security': 'Siber & Sekuriti', 'network': 'Sistem & Rangkaian', 'dev': 'Web & Perisian',
  'headphone': 'Headphone', 'smartwatch': 'Smartwatch', 'speaker': 'Speaker', 'tws': 'TWS',
  'desktop': 'Desktop', 'laptop': 'Laptop', 'monitor': 'Monitor', 'storage': 'Storan & RAM',
  'flagship': 'Flagship', 'foldable': 'Foldable', 'gaming-phone': 'Gaming Phone', 'midrange': 'Mid-Range',
  'tablet': 'Tablet & 2-in-1',
  'tips': 'Tips (Life-hacks)', 'trivia': 'Trivia', 'tutorial': 'Tutorial',
  'news': 'Berita', 'reviews': 'Ulasan',
  'automotive': 'Automotif (EV)', 'ai': 'AI (Kecerdasan Buatan)', 'science': 'Sains & Angkasa', 'smart-utility': 'Utiliti Pintar'
};

export default function AdminDashboard() {
  const [posts, setPosts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Fungsi delete
  const handleDelete = async (id: string) => {
    if (!confirm('Betul ke nak padam artikel ni Boss?')) return;
    const { error } = await supabase.from('posts').delete().eq('id', id);
    if (error) alert('Error: ' + error.message);
    else {
      setPosts(posts.filter((post) => post.id !== id)); // Buang dari screen
      alert('Artikel dah padam! 🗑️');
    }
  };

  useEffect(() => {
    const fetchPosts = async () => {
      // Tarik data artikel
      const { data, error } = await supabase
        .from('posts')
        .select('*')
        .order('created_at', { ascending: false });

      if (data) setPosts(data);
      setLoading(false);
    };

    fetchPosts();
  }, []);

  if (loading) return <div className="p-8 text-center text-gray-500">Sedang memuatkan data...</div>;

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
      <div className="p-6 border-b border-gray-200 flex justify-between items-center bg-gray-50">
        <h2 className="text-xl font-bold text-gray-800">Artikel Terkini</h2>
        <Link href="/admin/create" className="bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-bold hover:bg-blue-700 shadow-sm transition">
          + Artikel Baru
        </Link>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="text-sm font-semibold text-gray-600 bg-gray-100 border-b border-gray-200">
              <th className="p-4">Tajuk</th>
              <th className="p-4">Kategori</th>
              <th className="p-4">Tarikh</th>
              <th className="p-4 text-center">Views</th>
              <th className="p-4 text-right">Tindakan</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {posts.map((post) => (
              <tr key={post.id} className="hover:bg-blue-50 transition duration-150">
                <td className="p-4 font-medium text-gray-900 max-w-md truncate">{post.title}</td>
                
                {/* --- FIX KATEGORI DISINI --- */}
                <td className="p-4 text-sm text-blue-600 font-semibold">
                    {/* Guna kamus tadi, kalau tak jumpa guna huruf asal */}
                    {categoryMap[post.category] || post.category || '-'}
                </td>
                
                <td className="p-4 text-sm text-gray-500">
                  {new Date(post.created_at).toLocaleDateString('ms-MY')}
                </td>
                
                <td className="p-4 text-center font-bold text-gray-700">
                    {post.views || 0}
                </td>

                <td className="p-4 text-right space-x-3">
                  <Link href={`/admin/edit/${post.id}`} className="text-blue-600 hover:text-blue-800 font-medium text-sm">
                    Edit
                  </Link>
                  <button onClick={() => handleDelete(post.id)} className="text-red-500 hover:text-red-700 font-medium text-sm">
                    Padam
                  </button>
                </td>
              </tr>
            ))}
            
            {posts.length === 0 && (
                <tr>
                    <td colSpan={5} className="p-8 text-center text-gray-400 italic">Belum ada artikel boss. Jom tulis satu!</td>
                </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}