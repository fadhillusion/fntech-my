import Link from 'next/link';
import { supabase } from '@/lib/supabase'; // Pastikan path ni betul

export const revalidate = 60; // Refresh data setiap 60 saat

// --- KAMUS KATEGORI ---
const categoryMap: Record<string, { label: string, parent?: string, grandparent?: string }> = {
  // 📱 DIGITAL
  'android': { label: 'Android', parent: 'Aplikasi & OS', grandparent: 'DIGITAL' },
  'ios': { label: 'iOS', parent: 'Aplikasi & OS', grandparent: 'DIGITAL' },
  'linux': { label: 'Linux & Lain', parent: 'Aplikasi & OS', grandparent: 'DIGITAL' },
  'macos': { label: 'macOS', parent: 'Aplikasi & OS', grandparent: 'DIGITAL' },
  'windows': { label: 'Windows', parent: 'Aplikasi & OS', grandparent: 'DIGITAL' },
  'fintech': { label: 'Fintech & eWallet', grandparent: 'DIGITAL' },
  'gaming': { label: 'Gaming (E-Sukan)', grandparent: 'DIGITAL' },
  'telco': { label: 'Telco & Pelan', grandparent: 'DIGITAL' },

  // 🛡 DUNIA IT
  'multimedia': { label: 'Kreatif & Multimedia', grandparent: 'DUNIA IT' },
  'security': { label: 'Siber & Sekuriti', grandparent: 'DUNIA IT' },
  'network': { label: 'Sistem & Rangkaian', grandparent: 'DUNIA IT' },
  'dev': { label: 'Web & Perisian', grandparent: 'DUNIA IT' },

  // 🎧 GAJET
  'headphone': { label: 'Headphone', parent: 'Audio & Aksesori', grandparent: 'GAJET' },
  'smartwatch': { label: 'Smartwatch', parent: 'Audio & Aksesori', grandparent: 'GAJET' },
  'speaker': { label: 'Speaker', parent: 'Audio & Aksesori', grandparent: 'GAJET' },
  'tws': { label: 'TWS', parent: 'Audio & Aksesori', grandparent: 'GAJET' },
  
  'desktop': { label: 'Desktop', parent: 'Komputer & Laptop', grandparent: 'GAJET' },
  'laptop': { label: 'Laptop', parent: 'Komputer & Laptop', grandparent: 'GAJET' },
  'monitor': { label: 'Monitor', parent: 'Komputer & Laptop', grandparent: 'GAJET' },
  'storage': { label: 'Storan & RAM', parent: 'Komputer & Laptop', grandparent: 'GAJET' },

  'flagship': { label: 'Flagship', parent: 'Telefon Pintar', grandparent: 'GAJET' },
  'foldable': { label: 'Foldable', parent: 'Telefon Pintar', grandparent: 'GAJET' },
  'gaming-phone': { label: 'Gaming Phone', parent: 'Telefon Pintar', grandparent: 'GAJET' },
  'midrange': { label: 'Mid-Range', parent: 'Telefon Pintar', grandparent: 'GAJET' },

  'tablet': { label: 'Tablet & 2-in-1', grandparent: 'GAJET' },

  // 📚 PANDUAN
  'tips': { label: 'Tips (Life-hacks)', grandparent: 'PANDUAN' },
  'trivia': { label: 'Trivia', grandparent: 'PANDUAN' },
  'tutorial': { label: 'Tutorial', grandparent: 'PANDUAN' },

  // 🔥 SOHOR
  'news': { label: 'Berita', grandparent: 'SOHOR' },
  'reviews': { label: 'Ulasan', grandparent: 'SOHOR' },

  // 🚀 TEKNOLOGI
  'automotive': { label: 'Automotif (EV)', grandparent: 'TEKNOLOGI' },
  'ai': { label: 'AI (Kecerdasan Buatan)', grandparent: 'TEKNOLOGI' },
  'science': { label: 'Sains & Angkasa', grandparent: 'TEKNOLOGI' },
  'smart-utility': { label: 'Utiliti Pintar', grandparent: 'TEKNOLOGI' },
};

export default async function CategoryPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;

  // 1. Tarik Data Artikel ikut Kategori (Filter)
  const { data: posts, error } = await supabase
    .from('posts')
    .select('*')
    .eq('is_published', true) // Pastikan column ni wujud di DB, kalau tak buang line ni
    .eq('category', slug) 
    .order('created_at', { ascending: false });

  // Cari nama cantik kategori (Human Readable)
  const categoryInfo = categoryMap[slug];
  const categoryTitle = categoryInfo ? categoryInfo.label : slug.replace(/-/g, ' ').toUpperCase();
  const parentTitle = categoryInfo?.parent || categoryInfo?.grandparent || 'KATEGORI';

  return (
    <div className="bg-gray-50 min-h-screen pb-20">
      
      {/* --- HEADER KATEGORI --- */}
      <div className="bg-white border-b border-gray-200 py-12 text-center">
        <div className="max-w-7xl mx-auto px-4">
            <span className="text-blue-600 font-bold tracking-widest uppercase text-xs mb-2 block">
                {parentTitle}
            </span>
            <h1 className="text-3xl md:text-5xl font-extrabold text-gray-900 mb-4 capitalize">
                {categoryTitle}
            </h1>
            <p className="text-gray-500 max-w-2xl mx-auto">
                Koleksi artikel, ulasan, dan berita terkini berkaitan {categoryTitle}.
            </p>
        </div>
      </div>

      {/* --- LIST ARTIKEL (GRID) --- */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-12">
        
        {/* Kalau Takde Artikel */}
        {(!posts || posts.length === 0) ? (
            <div className="text-center py-20 bg-white rounded-xl shadow-sm">
                <div className="text-6xl mb-4">📭</div>
                <h3 className="text-xl font-bold text-gray-900">Tiada artikel di sini.</h3>
                <p className="text-gray-500 mt-2">Admin belum tulis apa-apa pasal topik ni.</p>
                <Link href="/" className="mt-6 inline-block text-blue-600 font-bold hover:underline">
                    ← Balik ke Home
                </Link>
            </div>
        ) : (
            // Kalau Ada Artikel -> Tunjuk Grid
            <div className="grid gap-x-8 gap-y-12 sm:grid-cols-2 lg:grid-cols-3">
            {posts.map((post) => (
                <article key={post.id} className="flex flex-col group cursor-pointer bg-white rounded-2xl shadow-sm hover:shadow-md transition-shadow duration-300 overflow-hidden">
                
                {/* Gambar Thumbnail (LINK FIXED) */}
                <Link href={`/${post.slug}`} className="relative overflow-hidden aspect-[16/10] bg-gray-200">
                    {post.image_url ? (
                    <img
                        src={post.image_url}
                        alt={post.title}
                        className="object-cover w-full h-full transition-transform duration-500 group-hover:scale-110"
                    />
                    ) : (
                    // Placeholder Image kalau takde gambar
                    <div className="flex items-center justify-center w-full h-full text-gray-400 bg-gray-100">
                         <svg className="w-12 h-12" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"></path></svg>
                    </div>
                    )}
                </Link>

                {/* Info Artikel */}
                <div className="p-6 flex flex-col flex-1">
                    <div className="flex items-center gap-3 text-xs font-bold text-blue-600 uppercase tracking-wide mb-3">
                        <span>{categoryTitle}</span>
                        <span className="text-gray-300">•</span>
                        <span className="text-gray-400 normal-case">
                            {new Date(post.created_at).toLocaleDateString('ms-MY', { day: 'numeric', month: 'short' })}
                        </span>
                    </div>
                    
                    {/* Tajuk (LINK FIXED) */}
                    <Link href={`/${post.slug}`}>
                        <h3 className="text-xl font-bold text-gray-900 leading-snug mb-3 group-hover:text-blue-600 transition-colors line-clamp-2">
                            {post.title}
                        </h3>
                    </Link>
                    
                    {/* Excerpt Auto-Generate */}
                    <p className="text-gray-600 text-sm line-clamp-3 leading-relaxed mb-4 flex-1">
                        {post.excerpt 
                          ? post.excerpt 
                          : post.content?.replace(/<[^>]*>?/gm, '').slice(0, 100) + '...'}
                    </p>

                    {/* Footer Card (Views) */}
                    <div className="pt-4 border-t border-gray-100 flex items-center text-xs text-gray-500 font-medium">
                        🔥 {post.views || 0} Pembaca
                    </div>
                </div>
                </article>
            ))}
            </div>
        )}
      </div>

    </div>
  );
}