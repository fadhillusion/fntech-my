'use client';

import { useEffect, useState } from 'react';
import { createClient } from '@/lib/supabase-client';
import { useParams } from 'next/navigation';
import Link from 'next/link';

export default function DynamicRouter() {
  const params = useParams();
  const supabase = createClient();
  
  const [data, setData] = useState<any>(null);
  const [trending, setTrending] = useState<any[]>([]);
  const [type, setType] = useState<'post' | 'page' | '404' | null>(null);
  const [loading, setLoading] = useState(true);
  
  // State untuk URL semasa (untuk button share)
  const [currentUrl, setCurrentUrl] = useState('');

  useEffect(() => {
    // Simpan URL semasa bila page dah load
    if (typeof window !== 'undefined') {
      setCurrentUrl(window.location.href);
    }

    const fetchData = async () => {
      // 1. Cek POST
      const { data: postData } = await supabase
        .from('posts')
        .select('*')
        .eq('slug', params.slug)
        .single();

      if (postData) {
        setData(postData);
        setType('post');
        
        await supabase.rpc('increment_views', { post_id: postData.id });
        
        // TARIK SIDEBAR TRENDING
        const { data: trendingData } = await supabase
            .from('posts')
            .select('id, title, slug, image_url, category, created_at')
            .neq('id', postData.id)
            .order('views', { ascending: false })
            .limit(5);
            
        if (trendingData) setTrending(trendingData);
        setLoading(false);
        return;
      }

      // 2. Cek PAGE
      const { data: pageData } = await supabase
        .from('pages')
        .select('*')
        .eq('slug', params.slug)
        .eq('is_published', true)
        .single();

      if (pageData) {
        setData(pageData);
        setType('page');
      } else {
        setType('404');
      }
      setLoading(false);
    };

    if (params.slug) fetchData();
  }, [params.slug, supabase]);

  // --- FUNGSI SHARE ---
  const handleShare = (platform: 'facebook' | 'twitter' | 'whatsapp' | 'telegram') => {
    if (!data || !currentUrl) return;

    const title = encodeURIComponent(data.title);
    const url = encodeURIComponent(currentUrl);
    let shareLink = '';

    switch (platform) {
      case 'facebook':
        shareLink = `https://www.facebook.com/sharer/sharer.php?u=${url}`;
        break;
      case 'twitter':
        shareLink = `https://twitter.com/intent/tweet?text=${title}&url=${url}`;
        break;
      case 'whatsapp':
        shareLink = `https://api.whatsapp.com/send?text=*${title}* %0A%0A${url}`;
        break;
      case 'telegram':
        shareLink = `https://t.me/share/url?url=${url}&text=${title}`;
        break;
    }

    // Buka popup window
    window.open(shareLink, '_blank', 'width=600,height=500');
  };

  // --- LOADING SKELETON ---
  if (loading) return (
    <div className="max-w-7xl mx-auto px-4 py-12 grid grid-cols-1 lg:grid-cols-12 gap-10 animate-pulse">
        <div className="lg:col-span-8 space-y-4">
            <div className="h-12 bg-gray-200 w-3/4 rounded"></div>
            <div className="h-96 bg-gray-200 rounded-xl"></div>
        </div>
        <div className="hidden lg:block lg:col-span-4 space-y-4">
            <div className="h-64 bg-gray-200 rounded-xl"></div>
        </div>
    </div>
  );

  // --- 404 PAGE ---
  if (type === '404') return (
    <div className="min-h-[60vh] flex flex-col items-center justify-center text-center">
       <h1 className="text-9xl font-black text-gray-200">404</h1>
       <p className="text-2xl font-bold text-gray-800 mt-[-2rem]">Halaman Hilang!</p>
       <Link href="/" className="mt-8 px-8 py-3 bg-black text-white rounded-full font-bold hover:scale-105 transition transform">Balik Home</Link>
    </div>
  );

  // ==========================================
  // 🔥 DESIGN ARTIKEL (ALA VOCKET + FUNCTIONAL SHARE) 
  // ==========================================
  if (type === 'post') return (
    <div className="min-h-screen bg-white font-sans text-gray-900">
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
            
            {/* --- KOLUM KIRI (ARTIKEL) --- */}
            <main className="lg:col-span-8">
                
                {/* Breadcrumb */}
                <div className="flex items-center gap-2 text-sm font-bold text-blue-600 mb-4 uppercase tracking-wider">
                    <Link href="/" className="hover:underline">Home</Link>
                    <span className="text-gray-300">/</span>
                    <Link href={`/category/${data.category}`} className="hover:underline">{data.category}</Link>
                </div>

                {/* Tajuk Besar */}
                <h1 className="text-3xl md:text-5xl font-black leading-tight mb-6 text-gray-900">
                    {data.title}
                </h1>

                {/* Meta Data & Share Buttons */}
                <div className="flex flex-col md:flex-row md:items-center justify-between border-y border-gray-100 py-5 mb-8 gap-6">
                    
                    {/* Author Info */}
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-blue-600 to-purple-600 flex items-center justify-center text-white font-bold text-sm shadow-md">
                            FN
                        </div>
                        <div>
                            <p className="text-sm font-bold text-gray-900">Admin FNDigital</p>
                            <p className="text-xs text-gray-500 font-medium">
                                {new Date(data.created_at).toLocaleDateString('ms-MY', { day: 'numeric', month: 'long', year: 'numeric' })} • {data.views} Bacaan
                            </p>
                        </div>
                    </div>

                    {/* 🔥 FUNCTIONAL SHARE BUTTONS (SVG) */}
                    <div className="flex gap-2">
                        {/* Facebook */}
                        <button onClick={() => handleShare('facebook')} className="w-9 h-9 flex items-center justify-center rounded-full bg-[#1877F2] text-white hover:scale-110 transition shadow-sm" title="Share ke Facebook">
                            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.791-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/></svg>
                        </button>

                        {/* Twitter / X */}
                        <button onClick={() => handleShare('twitter')} className="w-9 h-9 flex items-center justify-center rounded-full bg-black text-white hover:scale-110 transition shadow-sm" title="Share ke X">
                            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/></svg>
                        </button>

                        {/* WhatsApp */}
                        <button onClick={() => handleShare('whatsapp')} className="w-9 h-9 flex items-center justify-center rounded-full bg-[#25D366] text-white hover:scale-110 transition shadow-sm" title="Share ke WhatsApp">
                             <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z"/></svg>
                        </button>
                        
                        {/* Telegram */}
                        <button onClick={() => handleShare('telegram')} className="w-9 h-9 flex items-center justify-center rounded-full bg-[#0088cc] text-white hover:scale-110 transition shadow-sm" title="Share ke Telegram">
                             <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24"><path d="M11.944 0A12 12 0 0 0 0 12a12 12 0 0 0 12 12 12 12 0 0 0 12-12A12 12 0 0 0 12 0a12 12 0 0 0-.056 0zm4.962 7.224c.1-.002.321.023.465.14a.506.506 0 0 1 .171.325c.016.093.036.306.02.472-.18 1.898-.962 6.502-1.36 8.627-.168.9-.499 1.201-.82 1.23-.696.065-1.225-.46-1.9-.902-1.056-.693-1.653-1.124-2.678-1.8-1.185-.78-.417-1.21.258-1.91.177-.184 3.247-2.977 3.307-3.23.007-.032.014-.15-.056-.212s-.174-.041-.249-.024c-.106.024-1.793 1.14-5.061 3.345-.48.33-.913.49-1.302.48-.428-.008-1.252-.241-1.865-.44-.752-.245-1.349-.374-1.297-.789.027-.216.325-.437.893-.663 3.498-1.524 5.83-2.529 6.998-3.014 3.332-1.386 4.025-1.627 4.476-1.635z"/></svg>
                        </button>
                    </div>
                </div>

                {/* Featured Image */}
                <div className="rounded-2xl overflow-hidden shadow-lg mb-10 bg-gray-100 aspect-video relative">
                    {data.image_url ? (
                        <img src={data.image_url} alt={data.title} className="w-full h-full object-cover" />
                    ) : (
                        <div className="flex items-center justify-center h-full text-gray-300 font-black text-4xl">FN.DIGITAL</div>
                    )}
                </div>

                {/* Content */}
                <article className="prose prose-lg prose-blue max-w-none prose-headings:font-bold prose-headings:text-gray-900 prose-p:text-gray-700 prose-p:leading-relaxed prose-a:text-blue-600 prose-a:font-bold prose-a:no-underline hover:prose-a:underline prose-img:rounded-xl prose-img:shadow-md first-letter:text-5xl first-letter:font-black first-letter:text-blue-600 first-letter:float-left first-letter:mr-3" dangerouslySetInnerHTML={{ __html: data.content }} />

                {/* Tags */}
                <div className="mt-12 pt-8 border-t border-gray-200">
                    <span className="text-xs font-bold text-gray-500 uppercase mb-3 block">Tag Berkaitan:</span>
                    <div className="flex flex-wrap gap-2">
                        <span className="bg-gray-100 text-gray-600 px-3 py-1 rounded-full text-sm font-semibold hover:bg-gray-200 cursor-pointer">#{data.category}</span>
                        <span className="bg-gray-100 text-gray-600 px-3 py-1 rounded-full text-sm font-semibold hover:bg-gray-200 cursor-pointer">#Teknologi</span>
                    </div>
                </div>

                {/* Author Box */}
                <div className="mt-10 bg-blue-50 p-6 rounded-2xl flex items-start gap-4">
                     <div className="text-4xl">👨‍💻</div>
                     <div>
                        <h4 className="font-bold text-gray-900">Tentang Penulis</h4>
                        <p className="text-sm text-gray-600 mt-1">Pasukan editorial FNDigital yang meminati gajet, kopi, dan 'coding'. Sentiasa membawakan berita teknologi terkini tanpa tapisan.</p>
                     </div>
                </div>

            </main>

            {/* --- KOLUM KANAN (SIDEBAR STICKY) --- */}
            <aside className="lg:col-span-4 space-y-8">
                <div className="sticky top-24 space-y-8">
                    
                    {/* Iklan */}
                    <div className="bg-gradient-to-br from-black to-gray-800 rounded-2xl p-6 text-white text-center shadow-xl">
                        <p className="text-xs font-bold text-gray-400 uppercase mb-2">Iklan Penaja</p>
                        <h3 className="text-2xl font-black mb-4">NAK WEBSITE PADU MACAM NI?</h3>
                        <p className="text-sm text-gray-300 mb-6">Kami bina sistem web moden, laju, dan mesra SEO untuk bisnes anda.</p>
                        <button className="bg-blue-600 text-white w-full py-2 rounded-lg font-bold hover:bg-blue-500 transition">Hubungi Kami</button>
                    </div>

                    {/* Trending Widget */}
                    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
                        <h3 className="text-lg font-black text-gray-900 mb-6 border-l-4 border-blue-600 pl-3">TRENDING 🔥</h3>
                        <div className="space-y-6">
                            {trending.map((item, index) => (
                                <Link key={item.id} href={`/${item.slug}`} className="group flex gap-4 items-start">
                                    <span className="text-3xl font-black text-gray-200 group-hover:text-blue-600 transition-colors leading-none">{index + 1}</span>
                                    <div>
                                        <h4 className="text-sm font-bold text-gray-900 group-hover:text-blue-600 transition-colors line-clamp-2 leading-snug">{item.title}</h4>
                                        <span className="text-[10px] text-gray-400 mt-1 block uppercase font-semibold">{item.category} • {new Date(item.created_at).toLocaleDateString()}</span>
                                    </div>
                                </Link>
                            ))}
                            {trending.length === 0 && <p className="text-sm text-gray-400">Tiada artikel trending lagi.</p>}
                        </div>
                    </div>

                </div>
            </aside>

        </div>
      </div>
    </div>
  );

  // --- HALAMAN STATIK ---
  if (type === 'page') return (
    <div className="min-h-screen bg-white">
      <div className="bg-gray-900 text-white py-20 text-center">
          <h1 className="text-4xl md:text-5xl font-black capitalize tracking-tight">{data.title}</h1>
      </div>
      <article className="max-w-3xl mx-auto px-4 py-16">
        <div className="prose prose-lg max-w-none text-gray-700" dangerouslySetInnerHTML={{ __html: data.content }} />
      </article>
    </div>
  );

  return null;
}