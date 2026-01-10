'use client';

import { createClient } from '@/lib/supabase-client';
import { useEffect, useState } from 'react';

export default function FinancePage() {
  const supabase = createClient();
  const [loading, setLoading] = useState(true);
  const [levels, setLevels] = useState<any[]>([]); // Data Level
  const [report, setReport] = useState<any[]>([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        // 1. Tarik Level dari Settings
        const { data: setting } = await supabase.from('settings').select('*').single();
        // Kalau takde level, guna array kosong (sepatutnya ada sebab kita dah set default SQL)
        const commissionLevels = setting?.commission_levels || [];
        // Sort level ikut min_posts (Ascending) supaya senang cari
        commissionLevels.sort((a: any, b: any) => a.min_posts - b.min_posts);
        setLevels(commissionLevels);

        // 2. Tarik Data Post
        const { data: posts } = await supabase
          .from('posts')
          .select(`views, is_published, user_id, profiles:user_id ( full_name, email )`)
          .eq('is_published', true);

        if (posts) {
          const stats: any = {};
          
          // Group by User
          posts.forEach((post: any) => {
            const uid = post.user_id;
            if (!uid) return;
            if (!stats[uid]) {
              stats[uid] = {
                id: uid,
                name: post.profiles?.full_name || 'Unknown',
                email: post.profiles?.email || '-',
                totalPosts: 0,
                totalViews: 0
              };
            }
            stats[uid].totalPosts += 1;
            stats[uid].totalViews += (post.views || 0);
          });

          setReport(Object.values(stats));
        }
      } catch (error) { console.error(error); } finally { setLoading(false); }
    };
    fetchData();
  }, []);

  // --- LOGIC TENTUKAN LEVEL ---
  const getUserLevel = (postCount: number) => {
    if (levels.length === 0) return { label: 'Default', rate_post: 5, rate_view: 2 };
    
    // Cari level paling tinggi yang layak
    // Contoh: Post 120. Level 5 (100) layak. Level 6 (150) tak layak.
    // Kita guna findLast atau loop terbalik
    for (let i = levels.length - 1; i >= 0; i--) {
      if (postCount >= levels[i].min_posts) {
        return levels[i];
      }
    }
    return levels[0]; // Fallback ke level 1
  };

  if (loading) return <div className="p-10 text-center animate-pulse">Mengira gaji & level... 💰</div>;

  return (
    <div className="max-w-6xl mx-auto space-y-8 pb-20">
      <div>
        <h1 className="text-3xl font-black text-gray-800">Laporan Kewangan & Prestasi</h1>
        <p className="text-gray-500 mt-1">Lihat level dan komisen editor berdasarkan carta prestasi.</p>
      </div>

      <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
        <div className="bg-gray-50 px-6 py-4 border-b border-gray-200 flex justify-between items-center">
          <h3 className="font-bold text-gray-700">Senarai Gaji Editor (Live)</h3>
        </div>
        
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-white text-gray-500 border-b border-gray-100 uppercase text-xs">
              <tr>
                <th className="px-6 py-3 font-medium">Editor</th>
                <th className="px-6 py-3 font-medium text-center">Level Semasa</th>
                <th className="px-6 py-3 font-medium text-center">Artikel</th>
                <th className="px-6 py-3 font-medium text-center">Views</th>
                <th className="px-6 py-3 font-medium text-right">Anggaran Komisen</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {report.map((editor) => {
                const currentLvl = getUserLevel(editor.totalPosts);
                const postComm = editor.totalPosts * currentLvl.rate_post;
                const viewComm = (editor.totalViews / 1000) * currentLvl.rate_view;
                const totalComm = postComm + viewComm;

                return (
                  <tr key={editor.id} className="hover:bg-green-50 transition group">
                    <td className="px-6 py-4">
                      <div className="font-bold text-gray-800">{editor.name}</div>
                      <div className="text-xs text-gray-400">{editor.email}</div>
                    </td>
                    <td className="px-6 py-4 text-center">
                      <span className="bg-blue-100 text-blue-700 px-3 py-1 rounded-full text-xs font-black uppercase tracking-wide border border-blue-200 shadow-sm">
                        {currentLvl.label}
                      </span>
                      <div className="text-[10px] text-gray-400 mt-1">Rate: RM{currentLvl.rate_post.toFixed(2)}</div>
                    </td>
                    <td className="px-6 py-4 text-center font-bold text-gray-700">{editor.totalPosts}</td>
                    <td className="px-6 py-4 text-center font-mono text-gray-600">{editor.totalViews.toLocaleString()}</td>
                    <td className="px-6 py-4 text-right">
                      <div className="text-lg font-black text-green-600">RM {totalComm.toFixed(2)}</div>
                      <div className="text-[10px] text-gray-400">
                        (Post: RM{postComm.toFixed(0)} + View: RM{viewComm.toFixed(2)})
                      </div>
                    </td>
                  </tr>
                );
              })}
              {report.length === 0 && <tr><td colSpan={5} className="p-8 text-center text-gray-400">Tiada data dijumpai.</td></tr>}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}