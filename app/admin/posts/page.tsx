'use client';

import { useEffect, useState } from 'react';
import { createClient } from '@/lib/supabase-client';
import Link from 'next/link';

export default function PostsPage() {
  const [posts, setPosts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const supabase = createClient();

  // --- State untuk Feature Baru ---
  const [search, setSearch] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10; // Boss boleh tukar nak berapa list per page

  // --- 1. Tarik Data Post ---
  useEffect(() => {
    fetchPosts();
  }, []);

  const fetchPosts = async () => {
    const { data } = await supabase
      .from('posts')
      .select('*')
      .order('created_at', { ascending: false });

    if (data) setPosts(data);
    setLoading(false);
  };

  // --- 2. Fungsi Padam ---
  const handleDelete = async (id: string) => {
    if (!confirm('Betul ke nak padam artikel ni Boss?')) return;
    
    const { error } = await supabase.from('posts').delete().eq('id', id);
    
    if (error) {
        alert('Error: ' + error.message);
    } else {
      setPosts(posts.filter((post) => post.id !== id)); 
      alert('Artikel dah padam! 🗑️');
    }
  };

  // --- LOGIK STATISTIK ---
  const totalPosts = posts.length;
  const totalViews = posts.reduce((acc, curr) => acc + (curr.views || 0), 0);
  const totalPublished = posts.filter(p => p.is_published).length;
  const totalDraft = totalPosts - totalPublished;

  // --- LOGIK SEARCH & PAGINATION ---
  // 1. Filter dulu ikut search
  const filteredPosts = posts.filter((post) => 
    post.title.toLowerCase().includes(search.toLowerCase()) ||
    post.category.toLowerCase().includes(search.toLowerCase())
  );

  // 2. Kira pagination
  const totalPages = Math.ceil(filteredPosts.length / itemsPerPage);
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = filteredPosts.slice(indexOfFirstItem, indexOfLastItem);

  // Reset page ke 1 kalau user tengah search
  useEffect(() => {
    setCurrentPage(1);
  }, [search]);


  if (loading) return <div className="p-10 text-center animate-pulse text-gray-500">Sedang analisis data...</div>;

  return (
    <div className="space-y-6">
      
      {/* --- BAHAGIAN 1: STATISTIK RINGKAS --- */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {/* Card Total Post */}
          <div className="bg-white p-5 rounded-xl border border-gray-200 shadow-sm flex items-center gap-4">
              <div className="p-3 bg-blue-100 text-blue-600 rounded-lg">
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h10a2 2 0 012 2v1m2 13a2 2 0 01-2-2V7m2 13a2 2 0 002-2V9a2 2 0 00-2-2h-2m-4-3H9M7 16h6M7 8h6v4H7V8z"></path></svg>
              </div>
              <div>
                  <p className="text-xs font-bold text-gray-500 uppercase">Total Artikel</p>
                  <h3 className="text-2xl font-black text-gray-800">{totalPosts}</h3>
              </div>
          </div>

          {/* Card Total Views */}
          <div className="bg-white p-5 rounded-xl border border-gray-200 shadow-sm flex items-center gap-4">
              <div className="p-3 bg-green-100 text-green-600 rounded-lg">
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"></path><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"></path></svg>
              </div>
              <div>
                  <p className="text-xs font-bold text-gray-500 uppercase">Total Views</p>
                  <h3 className="text-2xl font-black text-gray-800">{totalViews.toLocaleString()}</h3>
              </div>
          </div>

           {/* Card Published */}
           <div className="bg-white p-5 rounded-xl border border-gray-200 shadow-sm flex items-center gap-4">
              <div className="p-3 bg-purple-100 text-purple-600 rounded-lg">
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
              </div>
              <div>
                  <p className="text-xs font-bold text-gray-500 uppercase">Published</p>
                  <h3 className="text-2xl font-black text-gray-800">{totalPublished}</h3>
              </div>
          </div>

          {/* Card Draft */}
          <div className="bg-white p-5 rounded-xl border border-gray-200 shadow-sm flex items-center gap-4">
              <div className="p-3 bg-yellow-100 text-yellow-600 rounded-lg">
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"></path></svg>
              </div>
              <div>
                  <p className="text-xs font-bold text-gray-500 uppercase">Draft</p>
                  <h3 className="text-2xl font-black text-gray-800">{totalDraft}</h3>
              </div>
          </div>
      </div>

      {/* --- BAHAGIAN 2: TOOLBAR (SEARCH & ADD) --- */}
      <div className="flex flex-col md:flex-row justify-between items-center gap-4 bg-white p-4 rounded-xl border border-gray-200 shadow-sm">
         
         {/* Live Search Input */}
         <div className="relative w-full md:w-96">
            <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-gray-400">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path></svg>
            </span>
            <input 
                type="text" 
                placeholder="Cari artikel (Tajuk / Kategori)..." 
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition"
            />
         </div>

         <div className="flex items-center gap-3 w-full md:w-auto">
             <span className="text-sm font-bold text-gray-500 whitespace-nowrap">
                 {filteredPosts.length} Artikel Dijumpai
             </span>
             <Link href="/admin/create" className="bg-blue-600 text-white px-6 py-2 rounded-lg text-sm font-bold hover:bg-blue-700 shadow-md transition flex items-center gap-2 whitespace-nowrap">
                <span>+</span> Artikel Baru
             </Link>
         </div>
      </div>

      {/* --- BAHAGIAN 3: TABLE DATA --- */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="text-xs font-bold text-gray-500 uppercase bg-gray-50 border-b border-gray-200 tracking-wider">
                <th className="p-5">Artikel</th>
                <th className="p-5 text-center">Kategori</th>
                <th className="p-5 text-center">Statistik</th>
                <th className="p-5 text-center">Status</th>
                <th className="p-5 text-right">Tindakan</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {currentItems.map((post) => (
                <tr key={post.id} className="hover:bg-blue-50 transition duration-150 group">
                  
                  {/* Info Artikel */}
                  <td className="p-5">
                    <div className="flex items-center gap-4">
                        {/* Gambar Kecil (Thumbnail) */}
                        <div className="w-12 h-12 rounded-lg bg-gray-200 overflow-hidden flex-shrink-0">
                            {post.image_url ? (
                                <img src={post.image_url} className="w-full h-full object-cover" alt="thumb" />
                            ) : (
                                <div className="w-full h-full flex items-center justify-center text-xs text-gray-400">No IMG</div>
                            )}
                        </div>
                        <div>
                            <div className="font-bold text-gray-900 line-clamp-1 max-w-xs" title={post.title}>{post.title}</div>
                            <div className="text-xs text-gray-400 mt-1">
                                {new Date(post.created_at).toLocaleDateString('ms-MY', { day: 'numeric', month: 'short', year: 'numeric' })}
                            </div>
                        </div>
                    </div>
                  </td>

                  {/* Kategori Badge */}
                  <td className="p-5 text-center">
                     <span className="px-3 py-1 rounded-full bg-gray-100 text-gray-600 text-[10px] font-extrabold uppercase tracking-wide border border-gray-200">
                        {post.category}
                     </span>
                  </td>

                  {/* Statistik View */}
                  <td className="p-5 text-center">
                      <div className="flex items-center justify-center gap-1 font-bold text-gray-700">
                          <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"></path><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"></path></svg>
                          {post.views || 0}
                      </div>
                  </td>

                  {/* Status Toggle */}
                  <td className="p-5 text-center">
                      {post.is_published ? (
                          <span className="inline-flex items-center gap-1 text-green-700 text-[10px] font-bold bg-green-100 px-2 py-1 rounded-full border border-green-200">
                              <span className="w-2 h-2 rounded-full bg-green-500"></span> Published
                          </span>
                      ) : (
                          <span className="inline-flex items-center gap-1 text-yellow-700 text-[10px] font-bold bg-yellow-100 px-2 py-1 rounded-full border border-yellow-200">
                              <span className="w-2 h-2 rounded-full bg-yellow-500"></span> Draft
                          </span>
                      )}
                  </td>

                  {/* Action Buttons */}
                  <td className="p-5 text-right space-x-2">
                    <Link href={`/${post.slug}`} target="_blank" className="inline-flex items-center justify-center w-8 h-8 rounded-full bg-gray-100 text-gray-500 hover:bg-blue-100 hover:text-blue-600 transition" title="Lihat Live">
                      👁️
                    </Link>
                    <button disabled className="inline-flex items-center justify-center w-8 h-8 rounded-full bg-gray-100 text-gray-300 cursor-not-allowed" title="Edit (Coming Soon)">
                      ✏️
                    </button>
                    <button onClick={() => handleDelete(post.id)} className="inline-flex items-center justify-center w-8 h-8 rounded-full bg-red-50 text-red-500 hover:bg-red-100 hover:text-red-700 transition" title="Padam">
                      🗑️
                    </button>
                  </td>
                </tr>
              ))}

              {filteredPosts.length === 0 && (
                  <tr>
                      <td colSpan={5} className="p-12 text-center">
                        <div className="text-gray-300 text-6xl mb-4">🔍</div>
                        <p className="text-gray-500 font-medium">Tiada artikel dijumpai untuk carian "{search}".</p>
                      </td>
                  </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* --- BAHAGIAN 4: PAGINATION FOOTER --- */}
        {filteredPosts.length > 0 && (
            <div className="bg-gray-50 px-6 py-4 border-t border-gray-200 flex flex-col md:flex-row justify-between items-center gap-4">
                
                <span className="text-sm text-gray-500 font-medium">
                    Menunjukkan <span className="font-bold text-gray-800">{indexOfFirstItem + 1}</span> hingga <span className="font-bold text-gray-800">{Math.min(indexOfLastItem, filteredPosts.length)}</span> daripada {filteredPosts.length} artikel
                </span>

                <div className="flex items-center gap-2">
                    <button 
                        onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                        disabled={currentPage === 1}
                        className="px-3 py-1 rounded border border-gray-300 bg-white text-sm font-bold text-gray-600 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        &larr; Prev
                    </button>
                    
                    {/* Page Numbers */}
                    {Array.from({ length: totalPages }, (_, i) => (
                        <button
                            key={i + 1}
                            onClick={() => setCurrentPage(i + 1)}
                            className={`w-8 h-8 rounded text-sm font-bold flex items-center justify-center transition ${
                                currentPage === i + 1 
                                    ? 'bg-blue-600 text-white shadow-md' 
                                    : 'bg-white border border-gray-300 text-gray-600 hover:bg-gray-50'
                            }`}
                        >
                            {i + 1}
                        </button>
                    ))}

                    <button 
                        onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                        disabled={currentPage === totalPages}
                        className="px-3 py-1 rounded border border-gray-300 bg-white text-sm font-bold text-gray-600 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        Next &rarr;
                    </button>
                </div>
            </div>
        )}
      </div>
    </div>
  );
}