'use client';

import { useEffect, useState } from 'react';
import { createClient } from '@/lib/supabase-client';
import Link from 'next/link';

export default function Home() {
  const [posts, setPosts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const supabase = createClient();

  // --- Tarik Data ---
  useEffect(() => {
    const fetchPosts = async () => {
      const { data } = await supabase
        .from('posts')
        .select('*')
        .eq('is_published', true) // Kalau boss ada column ni
        .order('created_at', { ascending: false });

      if (data) setPosts(data);
      setLoading(false);
    };

    fetchPosts();
  }, [supabase]);

  // Asingkan artikel: 1 Utama, 3 Sampingan, Selebihnya Latest
  const featuredPost = posts[0];
  const subFeatured = posts.slice(1, 4);
  const latestPosts = posts.slice(4);

  // Fungsi pilih warna badge ikut kategori
  const getBadgeColor = (cat: string) => {
    const c = cat?.toLowerCase() || '';
    if (c.includes('android') || c.includes('tech')) return 'bg-green-100 text-green-700';
    if (c.includes('apple') || c.includes('ios')) return 'bg-gray-100 text-gray-800';
    if (c.includes('review')) return 'bg-purple-100 text-purple-700';
    if (c.includes('news')) return 'bg-red-100 text-red-700';
    return 'bg-blue-100 text-blue-700';
  };

  if (loading) return <div className="min-h-screen flex items-center justify-center bg-white"><div className="w-16 h-16 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div></div>;

  return (
    <div className="min-h-screen bg-white font-sans selection:bg-black selection:text-white">
      
      {/* --- 1. MARQUEE BAR (HYPE FACTOR) --- */}
      <div className="bg-black text-white py-3 overflow-hidden whitespace-nowrap border-b border-gray-800">
        <div className="animate-marquee inline-block text-sm font-bold tracking-widest uppercase">
          🔥 TECH TERKINI • REVIEW JUJUR • 💯 TIADA TAPIS • GAJET PADU • 🚀 FNDIGITAL.MY • 🔥 TECH TERKINI • REVIEW JUJUR • 💯 TIADA TAPIS •
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        
        {/* --- 2. HEADER BESAR --- */}
        <div className="mb-10 text-center md:text-left">
           <h1 className="text-5xl md:text-7xl font-extrabold tracking-tighter text-black leading-tight">
             DUNIA <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-purple-600">DIGITAL.</span>
             <br/>
             TANPA SEMPADAN.
           </h1>
           <p className="mt-4 text-xl text-gray-500 max-w-2xl font-medium">
             Portal teknologi No.1 untuk Gen-Z. Info pantas, ulasan padu, gaya hidup digital.
           </p>
        </div>

        {/* --- 3. BENTO GRID HERO (Featured) --- */}
        {featuredPost && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 mb-16">
            
            {/* KIRI: ARTIKEL UTAMA (BESAR) - Span 8 */}
            <div className="lg:col-span-8 group relative rounded-3xl overflow-hidden shadow-2xl h-[500px] cursor-pointer">
              <Link href={`/${featuredPost.slug}`}>
                 {/* Image */}
                 <div className="absolute inset-0 bg-gray-200">
                    {featuredPost.image_url ? (
                      <img src={featuredPost.image_url} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" alt={featuredPost.title} />
                    ) : (
                      <div className="w-full h-full bg-gradient-to-br from-blue-500 to-purple-600"></div>
                    )}
                 </div>
                 {/* Overlay Gradient */}
                 <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-transparent flex flex-col justify-end p-8 md:p-12">
                    <span className={`self-start px-4 py-1.5 rounded-full text-xs font-bold uppercase tracking-wider mb-4 bg-white text-black`}>
                      {featuredPost.category || 'FEATURED'}
                    </span>
                    <h2 className="text-3xl md:text-5xl font-black text-white mb-4 leading-tight group-hover:underline decoration-4 underline-offset-4 decoration-blue-500">
                      {featuredPost.title}
                    </h2>
                    <div className="flex items-center text-gray-300 text-sm font-medium gap-4">
                       <span>📅 {new Date(featuredPost.created_at).toLocaleDateString('ms-MY')}</span>
                       <span>🔥 {featuredPost.views || 0} Pembaca</span>
                    </div>
                 </div>
              </Link>
            </div>

            {/* KANAN: TRENDING SIDE (KECIL) - Span 4 */}
            <div className="lg:col-span-4 flex flex-col gap-6 h-[500px]">
              {subFeatured.map((post, idx) => (
                <Link key={post.id} href={`/${post.slug}`} className="flex-1 group relative rounded-3xl overflow-hidden shadow-lg border border-gray-100 bg-white hover:border-blue-500 transition-colors">
                  <div className="flex h-full">
                     {/* Gambar Kecil */}
                     <div className="w-1/3 relative overflow-hidden">
                        {post.image_url ? (
                           <img src={post.image_url} className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110" alt={post.title} />
                        ) : (
                           <div className="w-full h-full bg-gray-100 flex items-center justify-center text-xs text-gray-400">No IMG</div>
                        )}
                     </div>
                     {/* Text */}
                     <div className="w-2/3 p-5 flex flex-col justify-center">
                        <span className="text-[10px] font-black text-blue-600 uppercase mb-1 tracking-wide">{post.category}</span>
                        <h3 className="text-lg font-bold text-gray-900 leading-snug line-clamp-2 group-hover:text-blue-600">
                           {post.title}
                        </h3>
                     </div>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        )}

        {/* --- 4. DIVIDER HYPE --- */}
        <div className="flex items-center justify-between mb-8">
           <h3 className="text-4xl font-black italic tracking-tighter text-black">
             LATEST <span className="text-stroke-2 text-transparent bg-clip-text bg-black">DROPS</span> 📦
           </h3>
           <Link href="/category/tech" className="hidden md:inline-flex items-center gap-2 px-6 py-2 rounded-full border-2 border-black font-bold hover:bg-black hover:text-white transition-all">
              Lihat Semua <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 8l4 4m0 0l-4 4m4-4H3"></path></svg>
           </Link>
        </div>

        {/* --- 5. GRID ARTIKEL (MODERN CARDS) --- */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-20">
           {latestPosts.map((post) => (
             <article key={post.id} className="group bg-gray-50 rounded-[2rem] overflow-hidden hover:shadow-xl transition-all duration-300 border border-transparent hover:border-gray-200">
                {/* Image Wrapper */}
                <Link href={`/${post.slug}`} className="block relative h-64 overflow-hidden">
                   {post.image_url ? (
                      <img src={post.image_url} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" alt={post.title} />
                   ) : (
                      <div className="w-full h-full bg-gray-200 flex items-center justify-center text-gray-400 font-bold">FN.DIGITAL</div>
                   )}
                   {/* Date Badge Floating */}
                   <div className="absolute top-4 right-4 bg-white/90 backdrop-blur-md px-3 py-1 rounded-full text-xs font-bold shadow-sm">
                      {new Date(post.created_at).toLocaleDateString('ms-MY', { day: '2-digit', month: 'short' })}
                   </div>
                </Link>

                <div className="p-8">
                   <div className="mb-3">
                      <span className={`inline-block px-3 py-1 rounded-full text-[10px] font-extrabold uppercase tracking-wide ${getBadgeColor(post.category)}`}>
                         {post.category || 'UMUM'}
                      </span>
                   </div>
                   <Link href={`/${post.slug}`}>
                      <h3 className="text-2xl font-bold text-gray-900 mb-3 leading-tight group-hover:text-blue-600 transition-colors">
                         {post.title}
                      </h3>
                   </Link>
                   <p className="text-gray-500 text-sm line-clamp-2 mb-6 font-medium">
                      {post.excerpt || post.content?.replace(/<[^>]*>?/gm, '').slice(0, 100)}...
                   </p>
                   <div className="flex items-center justify-between border-t border-gray-200 pt-4">
                      <div className="flex items-center gap-2">
                         <div className="w-6 h-6 rounded-full bg-gradient-to-r from-blue-400 to-purple-400"></div>
                         <span className="text-xs font-bold text-gray-600">Admin</span>
                      </div>
                      <span className="text-xs font-bold text-gray-400">👁️ {post.views} Views</span>
                   </div>
                </div>
             </article>
           ))}
        </div>

      </div>
    </div>
  );
}