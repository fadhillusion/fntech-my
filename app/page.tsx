import Link from 'next/link';
import { supabase } from '@/lib/supabase';

// Refresh data setiap 60 saat
export const revalidate = 60;

interface Post {
  id: string;
  title: string;
  slug: string;
  image_url?: string | null;
  excerpt?: string;
  created_at: string;
  category?: string; // <--- KITA TAMBAH NI
}

export default async function Home() {
  // 1. Tarik data dari Supabase (Termasuk category)
  const { data: posts, error } = await supabase
    .from('posts')
    .select('*')
    .eq('is_published', true)
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Error fetching posts:', error);
    return <div className="p-10 text-center text-red-500">Error loading posts.</div>;
  }

  if (!posts || posts.length === 0) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center text-center px-4">
        <h2 className="text-3xl font-bold text-gray-900">Belum ada berita tech!</h2>
        <p className="text-gray-500 mt-2">Admin tengah minum kopi. Sila datang balik nanti.</p>
      </div>
    );
  }

  // 2. Asingkan Hero & Lain-lain
  const heroPost = posts[0];
  const otherPosts = posts.slice(1);

  return (
    <div className="bg-white pb-20">
      
      {/* --- SECTION 1: HERO (BERITA UTAMA) --- */}
      <section className="relative w-full h-[500px] md:h-[600px] overflow-hidden group">
        <Link href={`/blog/${heroPost.slug}`} className="block w-full h-full">
          
          <div className="absolute inset-0">
            {heroPost.image_url ? (
              <img
                src={heroPost.image_url}
                alt={heroPost.title}
                className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
              />
            ) : (
              <div className="w-full h-full bg-gray-800" />
            )}
            <div className="absolute inset-0 bg-gradient-to-t from-black via-black/50 to-transparent opacity-90" />
          </div>

          <div className="absolute bottom-0 left-0 w-full p-6 md:p-12 max-w-4xl">
            {/* LABEL KATEGORI HERO (DYNAMIC) */}
            <span className="inline-block px-3 py-1 mb-4 text-xs font-bold tracking-wider text-white uppercase bg-blue-600 rounded-full">
              {heroPost.category?.replace(/-/g, ' ') || 'Featured Story'}
            </span>
            
            <h1 className="text-3xl md:text-5xl lg:text-6xl font-extrabold text-white leading-tight mb-4 drop-shadow-lg">
              {heroPost.title}
            </h1>
            <p className="text-gray-200 text-lg md:text-xl line-clamp-2 max-w-2xl mb-6 hidden md:block">
              {heroPost.excerpt || "Baca ulasan penuh mengenai topik teknologi terkini di sini."}
            </p>
            <div className="flex items-center text-gray-300 text-sm font-medium">
              <span>{new Date(heroPost.created_at).toLocaleDateString('ms-MY', { day: 'numeric', month: 'long', year: 'numeric' })}</span>
              <span className="mx-2">•</span>
              <span className="text-blue-400 group-hover:underline">Baca Selanjutnya →</span>
            </div>
          </div>
        </Link>
      </section>

      {/* --- SECTION 2: LATEST STORIES (GRID) --- */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-16">
        <div className="flex items-center justify-between mb-8 border-b border-gray-200 pb-4">
          <h2 className="text-3xl font-bold text-gray-900 tracking-tight">
            Terkini <span className="text-blue-600">.</span>
          </h2>
        </div>

        <div className="grid gap-x-8 gap-y-12 sm:grid-cols-2 lg:grid-cols-3">
          {otherPosts.map((post) => (
            <article key={post.id} className="flex flex-col group cursor-pointer">
              
              <Link href={`/blog/${post.slug}`} className="relative overflow-hidden rounded-2xl aspect-[16/10] mb-4 bg-gray-100 shadow-sm">
                {post.image_url ? (
                  <img
                    src={post.image_url}
                    alt={post.title}
                    className="object-cover w-full h-full transition-transform duration-500 group-hover:scale-110"
                  />
                ) : (
                  <div className="flex items-center justify-center w-full h-full text-gray-400 bg-gray-200">
                    No Image
                  </div>
                )}
              </Link>

              <div className="flex-1">
                <div className="flex items-center gap-3 text-xs font-semibold text-blue-600 uppercase tracking-wide mb-2">
                  
                  {/* --- LABEL KATEGORI GRID (DYNAMIC) --- */}
                  {/* Kita ganti 'Tech News' dgn post.category */}
                  <span>{post.category?.replace(/-/g, ' ') || 'Tech News'}</span> 
                  
                  <span className="text-gray-300">•</span>
                  <span className="text-gray-500 normal-case">
                    {new Date(post.created_at).toLocaleDateString('ms-MY', { day: 'numeric', month: 'short' })}
                  </span>
                </div>
                
                <Link href={`/blog/${post.slug}`}>
                  <h3 className="text-xl font-bold text-gray-900 leading-snug mb-3 group-hover:text-blue-600 transition-colors line-clamp-2">
                    {post.title}
                  </h3>
                </Link>
                
                <p className="text-gray-600 text-sm line-clamp-3 leading-relaxed">
                  {post.excerpt || "Klik untuk baca artikel penuh..."}
                </p>
              </div>
            </article>
          ))}
        </div>
      </section>

      {/* --- SECTION 3: NEWSLETTER --- */}
      <section className="mt-20 py-16 bg-gray-900 text-white rounded-none md:mx-4 md:rounded-3xl relative overflow-hidden">
        <div className="relative z-10 max-w-2xl mx-auto text-center px-4">
          <h2 className="text-3xl font-bold mb-4">Jangan Terlepas Berita Tech.</h2>
          <p className="text-gray-400 mb-8">Sertai FNDigital untuk update gajet mingguan.</p>
          <div className="flex gap-2 justify-center">
            <input type="email" placeholder="Email boss..." className="px-4 py-3 rounded-lg text-gray-900 w-64 focus:outline-none" />
            <button className="bg-blue-600 hover:bg-blue-700 px-6 py-3 rounded-lg font-bold transition">Subscribe</button>
          </div>
        </div>
        <div className="absolute top-0 left-0 w-64 h-64 bg-blue-600 rounded-full mix-blend-multiply filter blur-3xl opacity-20 -translate-x-1/2 -translate-y-1/2"></div>
        <div className="absolute bottom-0 right-0 w-64 h-64 bg-purple-600 rounded-full mix-blend-multiply filter blur-3xl opacity-20 translate-x-1/2 translate-y-1/2"></div>
      </section>

    </div>
  );
}