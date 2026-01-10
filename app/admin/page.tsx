'use client';

import { useEffect, useState } from 'react';
import { createClient } from '@/lib/supabase-client';

export default function AdminDashboard() {
  const [stats, setStats] = useState({
    totalPosts: 0,
    totalViews: 0,
    latestPost: 'Tiada Data',
  });
  const [loading, setLoading] = useState(true);
  const supabase = createClient();

  useEffect(() => {
    const fetchStats = async () => {
      // 1. Ambil semua post (cuma ambil column id, title, views, created_at)
      const { data } = await supabase
        .from('posts')
        .select('id, title, views, created_at')
        .order('created_at', { ascending: false });

      if (data) {
        const totalPosts = data.length;
        // Kira total views (Campur semua views)
        const totalViews = data.reduce((acc, curr) => acc + (curr.views || 0), 0);
        const latestPost = data[0]?.title || 'Tiada Data';

        setStats({ totalPosts, totalViews, latestPost });
      }
      setLoading(false);
    };

    fetchStats();
  }, [supabase]);

  if (loading) return <div className="p-8 text-gray-500">Mengira statistik...</div>;

  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-800 mb-6">Ringkasan Dashboard</h1>

      {/* --- GRID STATISTIK --- */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        
        {/* KAD 1: TOTAL POST */}
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-blue-100 text-blue-600 rounded-lg">
              <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"></path></svg>
            </div>
            <div>
              <p className="text-sm text-gray-500 font-medium">Jumlah Artikel</p>
              <h3 className="text-2xl font-bold text-gray-900">{stats.totalPosts}</h3>
            </div>
          </div>
        </div>

        {/* KAD 2: TOTAL VIEWS */}
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-green-100 text-green-600 rounded-lg">
              <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"></path><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"></path></svg>
            </div>
            <div>
              <p className="text-sm text-gray-500 font-medium">Total Pembaca (Views)</p>
              <h3 className="text-2xl font-bold text-gray-900">{stats.totalViews}</h3>
            </div>
          </div>
        </div>

        {/* KAD 3: LATEST POST */}
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-purple-100 text-purple-600 rounded-lg">
              <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10V3L4 14h7v7l9-11h-7z"></path></svg>
            </div>
            <div className="overflow-hidden">
              <p className="text-sm text-gray-500 font-medium">Artikel Terkini</p>
              <h3 className="text-sm font-bold text-gray-900 truncate" title={stats.latestPost}>
                {stats.latestPost}
              </h3>
            </div>
          </div>
        </div>

      </div>

      {/* --- QUICK ACTION --- */}
      <div className="bg-gradient-to-r from-blue-600 to-blue-800 rounded-xl p-8 text-white shadow-lg">
        <h2 className="text-2xl font-bold mb-2">Selamat Kembali, Boss! 👋</h2>
        <p className="text-blue-100 mb-6">Sedia untuk berkongsi info teknologi terkini? Jom tulis artikel baru sekarang.</p>
        <a href="/admin/create" className="inline-block bg-white text-blue-700 px-6 py-3 rounded-lg font-bold hover:bg-gray-100 transition shadow-md">
          ✍️ Tulis Artikel Baru
        </a>
      </div>

    </div>
  );
}