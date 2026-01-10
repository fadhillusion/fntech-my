'use client';

import { useEffect, useState } from 'react';
import { createClient } from '@/lib/supabase-client';

export default function AdminDashboard() {
  const [stats, setStats] = useState({
    totalPosts: 0,
    totalViews: 0,
    latestPost: 'Tiada Data',
    // Data Personal (Untuk Kira Duit)
    myPosts: 0,
    myViews: 0,
    myEarnings: 0,
    myLevelLabel: 'Newbie',
    myNextLevel: 10,
    myRatePost: 0,
    myRateView: 0
  });
  
  const [loading, setLoading] = useState(true);
  const supabase = createClient();

  useEffect(() => {
    const fetchStats = async () => {
      try {
        // 1. Dapatkan User ID Semasa
        const { data: { user } } = await supabase.auth.getUser();
        
        // 2. Dapatkan Settings & Levels
        const { data: settings } = await supabase.from('settings').select('*').single();
        const levels = settings?.commission_levels || [];
        // Sort levels
        levels.sort((a: any, b: any) => a.min_posts - b.min_posts);

        // 3. Ambil semua post
        const { data } = await supabase
          .from('posts')
          .select('id, title, views, created_at, user_id, is_published')
          .order('created_at', { ascending: false });

        if (data) {
          // --- A. STATISTIK GLOBAL ---
          const totalPosts = data.length;
          const totalViews = data.reduce((acc, curr) => acc + (curr.views || 0), 0);
          const latestPost = data[0]?.title || 'Tiada Data';

          // --- B. STATISTIK PERSONAL (LEVELING) ---
          const myPostsAll = data.filter(p => p.user_id === user?.id);
          const myPublishedCount = myPostsAll.filter(p => p.is_published).length; // Kira post untuk level
          const myTotalViews = myPostsAll.reduce((acc, curr) => acc + (curr.views || 0), 0);

          // Tentukan Level User
          let currentLevel = { label: 'Basic', rate_post: 5, rate_view: 2, min_posts: 0 };
          let nextLevelTarget = 0;

          if (levels.length > 0) {
            // Cari level semasa
            for (let i = levels.length - 1; i >= 0; i--) {
              if (myPublishedCount >= levels[i].min_posts) {
                currentLevel = levels[i];
                // Cari target next level
                if (i < levels.length - 1) {
                  nextLevelTarget = levels[i + 1].min_posts;
                }
                break;
              }
            }
            // Kalau post sikit sangat, fallback level 1
            if (myPublishedCount < levels[0].min_posts) {
                currentLevel = levels[0];
                nextLevelTarget = levels[1]?.min_posts || 0;
            }
          }

          // Kira Duit Guna Rate Level
          const earningPost = myPublishedCount * currentLevel.rate_post;
          const earningView = (myTotalViews / 1000) * currentLevel.rate_view;
          const totalEarnings = earningPost + earningView;

          setStats({ 
            totalPosts, 
            totalViews, 
            latestPost,
            myPosts: myPublishedCount,
            myViews: myTotalViews,
            myEarnings: totalEarnings,
            myLevelLabel: currentLevel.label,
            myNextLevel: nextLevelTarget,
            myRatePost: currentLevel.rate_post,
            myRateView: currentLevel.rate_view
          });
        }
      } catch (error) {
        console.error("Gagal tarik data:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, []);

  if (loading) return <div className="p-8 text-gray-500 animate-pulse">Mengira level & komisen...</div>;

  // Kira Progress Bar ke Next Level
  const progressPercent = stats.myNextLevel > 0 
    ? Math.min((stats.myPosts / stats.myNextLevel) * 100, 100) 
    : 100;

  return (
    <div>
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
        <div>
          <h1 className="text-2xl font-black text-gray-800">Dashboard</h1>
          <p className="text-gray-500 text-sm">Pusat kawalan FNDigital.</p>
        </div>
      </div>

      {/* --- SECTION 1: PRESTASI & LEVEL SAYA (UPDATE BARU) --- */}
      <div className="mb-8">
        <div className="bg-gradient-to-r from-indigo-600 to-blue-600 rounded-2xl p-1 shadow-lg shadow-blue-200">
          <div className="bg-white rounded-xl p-6">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-6">
              
              {/* KIRI: Level & Badge */}
              <div className="flex items-center gap-4">
                <div className="w-16 h-16 rounded-full bg-blue-100 flex items-center justify-center text-3xl shadow-inner">
                  🏆
                </div>
                <div>
                  <p className="text-xs font-bold text-blue-600 uppercase tracking-wider mb-1">Pangkat Semasa</p>
                  <h2 className="text-3xl font-black text-gray-800 leading-none">{stats.myLevelLabel}</h2>
                  <p className="text-xs text-gray-400 mt-1">Rate: RM{stats.myRatePost}/post + RM{stats.myRateView}/1k view</p>
                </div>
              </div>

              {/* KANAN: Duit */}
              <div className="text-right bg-green-50 px-6 py-3 rounded-xl border border-green-100">
                <p className="text-xs font-bold text-green-600 uppercase mb-1">Anggaran Komisen</p>
                <h3 className="text-3xl font-black text-green-700">RM {stats.myEarnings.toFixed(2)}</h3>
              </div>
            </div>

            {/* PROGRESS BAR KE NEXT LEVEL */}
            {stats.myNextLevel > 0 ? (
              <div className="relative pt-2">
                <div className="flex mb-2 items-center justify-between text-xs font-bold text-gray-500">
                  <span>Progress ke level seterusnya</span>
                  <span>{stats.myPosts} / {stats.myNextLevel} Artikel</span>
                </div>
                <div className="overflow-hidden h-3 mb-4 text-xs flex rounded-full bg-gray-100 border border-gray-200">
                  <div style={{ width: `${progressPercent}%` }} className="shadow-none flex flex-col text-center whitespace-nowrap text-white justify-center bg-blue-500 transition-all duration-1000 ease-out"></div>
                </div>
              </div>
            ) : (
              <div className="text-center py-2 bg-yellow-50 rounded-lg text-yellow-700 text-sm font-bold border border-yellow-100">
                🎉 Tahniah! Anda di level maksimum!
              </div>
            )}

            {/* Statistik Grid Kecil */}
            <div className="grid grid-cols-2 gap-4 mt-2 border-t border-gray-100 pt-4">
               <div className="text-center">
                 <span className="block text-2xl font-bold text-gray-800">{stats.myPosts}</span>
                 <span className="text-xs text-gray-400 uppercase">Artikel Published</span>
               </div>
               <div className="text-center border-l border-gray-100">
                 <span className="block text-2xl font-bold text-gray-800">{stats.myViews.toLocaleString()}</span>
                 <span className="text-xs text-gray-400 uppercase">Total Views</span>
               </div>
            </div>

          </div>
        </div>
      </div>

      {/* --- SECTION 2: STATISTIK WEBSITE --- */}
      <h2 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-4">Statistik Global (FNDigital)</h2>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-gray-100 text-gray-600 rounded-lg">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"></path></svg>
            </div>
            <div>
              <p className="text-xs text-gray-500 font-bold uppercase">Jumlah Artikel</p>
              <h3 className="text-xl font-bold text-gray-900">{stats.totalPosts}</h3>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-gray-100 text-gray-600 rounded-lg">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"></path><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"></path></svg>
            </div>
            <div>
              <p className="text-xs text-gray-500 font-bold uppercase">Total Pembaca</p>
              <h3 className="text-xl font-bold text-gray-900">{stats.totalViews.toLocaleString()}</h3>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-gray-100 text-gray-600 rounded-lg">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10V3L4 14h7v7l9-11h-7z"></path></svg>
            </div>
            <div className="overflow-hidden">
              <p className="text-xs text-gray-500 font-bold uppercase">Artikel Terkini</p>
              <h3 className="text-sm font-bold text-gray-900 truncate" title={stats.latestPost}>
                {stats.latestPost}
              </h3>
            </div>
          </div>
        </div>

      </div>

      <div className="bg-gray-900 rounded-xl p-8 text-white shadow-lg flex flex-col md:flex-row justify-between items-center gap-6">
        <div>
          <h2 className="text-xl font-bold mb-1">Misi Seterusnya 🚀</h2>
          <p className="text-gray-400 text-sm">Kejar {stats.myNextLevel - stats.myPosts} lagi artikel untuk naik pangkat!</p>
        </div>
        <a href="/admin/posts/create" className="inline-block bg-white text-gray-900 px-6 py-3 rounded-lg font-bold hover:bg-gray-100 transition shadow-md whitespace-nowrap text-sm">
          ✍️ Tulis Artikel Baru
        </a>
      </div>

    </div>
  );
}