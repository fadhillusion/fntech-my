import Link from 'next/link';
import { supabase } from '@/lib/supabase';

export const revalidate = 60;

interface Post {
  id: string;
  title: string;
  content: string;
  image_url?: string;
  created_at: string;
  views?: number;
  category?: string;
}

// --- PETA HIERARKI (SILSILAH KELUARGA MENU) ---
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
  'ai': { label: 'AI', grandparent: 'TEKNOLOGI' },
  'science': { label: 'Sains & Angkasa', grandparent: 'TEKNOLOGI' },
  'smart-utility': { label: 'Utiliti Pintar', grandparent: 'TEKNOLOGI' },
};

export default async function BlogPost({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;

  // 1. Tarik Data
  const { data: post } = await supabase.from('posts').select('*').eq('slug', slug).single();

  if (!post) return <div className="text-center py-20">404 - Artikel Tak Jumpa Boss.</div>;

  // 2. Setting Logik Api
  const { data: settings } = await supabase.from('settings').select('*').single();
  const orangeThreshold = settings?.fire_orange || 50;
  const redThreshold = settings?.fire_red || 100;

  // 3. Update View
  await supabase.rpc('increment_views', { row_id: post.id });

  // 4. Logic Warna Api 🔥
  const currentViews = (post.views || 0) + 1;
  let fireColorClass = "text-gray-400"; // Default
  if (currentViews >= redThreshold) fireColorClass = "text-red-600 animate-pulse";
  else if (currentViews >= orangeThreshold) fireColorClass = "text-orange-500";

  // Info Lain
  const hierarchy = post.category ? categoryMap[post.category] : null;
  const currentLabel = hierarchy ? hierarchy.label : (post.category || 'Tech');
  const formattedDate = new Date(post.created_at).toLocaleDateString('ms-MY', { day: 'numeric', month: 'long', year: 'numeric' });
  const ChevronIcon = () => (<svg className="w-3 h-3 text-gray-400 mx-1" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7"></path></svg>);

  return (
    <main className="min-h-screen bg-white px-4 py-12 sm:px-6 lg:px-8">
      <article className="mx-auto max-w-4xl">
        
        {/* --- BREADCRUMBS SIMPLE (Arrow >) --- */}
        <nav className="flex mb-8 text-xs font-medium text-gray-500 overflow-x-auto whitespace-nowrap pb-2">
            <ol className="inline-flex items-center space-x-1">
                <li className="inline-flex items-center"><Link href="/" className="hover:text-blue-600">Home</Link></li>
                {hierarchy?.grandparent && (<li className="flex items-center"><ChevronIcon /><span className="text-gray-500">{hierarchy.grandparent}</span></li>)}
                {hierarchy?.parent && (<li className="flex items-center"><ChevronIcon /><span className="text-gray-500">{hierarchy.parent}</span></li>)}
                {post.category && (<li className="flex items-center"><ChevronIcon /><Link href={`/category/${post.category}`} className="hover:text-blue-600 text-blue-600 font-semibold uppercase">{currentLabel}</Link></li>)}
            </ol>
        </nav>

        {/* --- HEADER ARTIKEL --- */}
        <header className="mb-10 text-center">
          {/* Label Kategori */}
          <div className="flex justify-center items-center gap-2 mb-4 text-xs font-bold uppercase tracking-wider text-blue-600">
             <span>{hierarchy?.grandparent || 'TECH'}</span>
             {hierarchy?.parent && (<><span className="text-gray-300">/</span><span>{hierarchy.parent}</span></>)}
          </div>
          
          {/* Tarikh */}
          <div className="text-gray-500 text-sm mb-4">{formattedDate}</div>
          
          {/* Tajuk Besar */}
          <h1 className="mb-6 text-3xl font-extrabold tracking-tight text-gray-900 sm:text-4xl md:text-5xl leading-tight">
            {post.title}
          </h1>

          {/* --- [PINDAH SINI] INFO PENULIS & API PEMBACA 🔥 --- */}
          <div className="flex flex-wrap justify-center items-center gap-4 sm:gap-6 mt-6 pb-6 border-b border-gray-100">
             
             {/* Penulis */}
             <div className="flex items-center gap-2 text-sm text-gray-600">
                <span className="bg-gray-100 p-1.5 rounded-full text-xs">✍️</span>
                <span>Oleh: <b className="text-gray-900">Admin FNDigital</b></span>
             </div>

             <span className="hidden sm:block text-gray-300">|</span>

             {/* Jumlah Pembaca (Dynamic Fire) */}
             <div className={`flex items-center gap-1.5 px-3 py-1 rounded-full text-sm font-bold border shadow-sm transition-colors duration-300
                ${currentViews >= redThreshold ? 'bg-red-50 text-red-600 border-red-100' : 
                  currentViews >= orangeThreshold ? 'bg-orange-50 text-orange-600 border-orange-100' : 
                  'bg-gray-50 text-gray-500 border-gray-200'} 
             `}>
                <svg className={`w-4 h-4 ${fireColorClass}`} fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M12.395 2.553a1 1 0 00-1.45-.385c-.345.23-.614.558-.822.88-.214.33-.403.713-.57 1.116-.334.804-.614 1.768-.84 2.734a31.365 31.365 0 00-.613 3.58 2.64 2.64 0 01-.945-1.067c-.328-.68-.398-1.534-.398-2.654A1 1 0 005.05 6.05 6.981 6.981 0 003 11a7 7 0 1011.95-4.95c-.592-.591-.98-.985-1.348-1.467-.363-.476-.724-1.063-1.207-2.03zM12.12 15.12A3 3 0 017 13s.879.5 2.5.5c0-1 .5-4 1.25-4.5.5 1 .786 3.258 1.37 5.12z" clipRule="evenodd" />
                </svg>
                {currentViews} Pembaca
             </div>
          </div>
          {/* -------------------------------------------------- */}
        </header>

        {/* Gambar Utama */}
        {post.image_url && (
          <div className="mb-10 overflow-hidden rounded-2xl shadow-xl aspect-video bg-gray-100">
            <img src={post.image_url} alt={post.title} className="w-full h-full object-cover" />
          </div>
        )}

        {/* Isi Content */}
        <div className="prose prose-lg prose-blue mx-auto max-w-none text-gray-700 leading-loose">
          <div dangerouslySetInnerHTML={{ __html: post.content ? post.content.replace(/\n/g, '<br/>') : '' }} />
        </div>

        {/* Footer (Kosong atau Boleh Letak Share Button Nanti) */}
        <div className="mt-16 pt-8 border-t border-gray-100 text-center text-sm text-gray-400">
             Terima kasih kerana membaca di FNDigital.my
        </div>

      </article>
    </main>
  );
}