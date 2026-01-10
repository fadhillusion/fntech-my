'use client';

import { useEffect, useState } from 'react';
import { createClient } from '@/lib/supabase-client';
import Link from 'next/link';

export default function PostsPage() {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const supabase = createClient();

  // --- State untuk Feature Baru ---
  const [search, setSearch] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10; 

  // --- 1. Tarik Data Post ---
  useEffect(() => {
    fetchPosts();
  }, []);

  const fetchPosts = async () => {
    // Boss, pastikan column 'author_name' atau 'editor_name' wujud dalam table 'posts'
    const { data } = await supabase
      .from('posts')
      .select('*')
      .order('created_at', { ascending: false });

    if (data) setPosts(data);
    setLoading(false);
  };

  // --- 2. Fungsi Padam ---
  const handleDelete = async (id) => {
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
  const filteredPosts = posts.filter((post) => 
    post.title.toLowerCase().includes(search.toLowerCase()) ||
    post.category.toLowerCase().includes(search.toLowerCase()) ||
    (post.author_name && post.author_name.toLowerCase().includes(search.toLowerCase()))
  );

  const totalPages = Math.ceil(filteredPosts.length / itemsPerPage);
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = filteredPosts.slice(indexOfFirstItem, indexOfLastItem);

  useEffect(() => {
    setCurrentPage(1);
  }, [search]);


  if (loading) return <div className="p-10 text-center animate-pulse text-gray-500 font-bold italic text-lg">Menganalisis pangkalan data...</div>;

  return (
    <div className="space-y-6">
      
      {/* --- BAHAGIAN 1: STATISTIK RINGKAS --- */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="bg-white p-5 rounded-xl border border-gray-200 shadow-sm flex items-center gap-4">
              <div className="p-3 bg-blue-100 text-blue-600 rounded-lg">
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h10a2 2 0 012 2v1m2 13a2 2 0 01-2-2V7m2 13a2 2 0 002-2V9a2 2 0 00-2-2h-2m-4-3H9M7 16h6M7 8h6v4H7V8z"></path></svg>
              </div>
              <div>
                  <p className="text-xs font-bold text-gray-400 uppercase tracking-tight">Total Artikel</p>
                  <h3 className="text-2xl font-black text-gray-800">{totalPosts}</h3>
              </div>
          </div>

          <div className="bg-white p-5 rounded-xl border border-gray-200 shadow-sm flex items-center gap-4">
              <div className="p-3 bg-green-100 text-green-600 rounded-lg">
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"></path><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"></path></svg>
              </div>
              <div>
                  <p className="text-xs font-bold text-gray-400 uppercase tracking-tight">Total Views</p>
                  <h3 className="text-2xl font-black text-gray-800">{totalViews.toLocaleString()}</h3>
              </div>
          </div>

           <div className="bg-white p-5 rounded-xl border border-gray-200 shadow-sm flex items-center gap-4">
              <div className="p-3 bg-purple-100 text-purple-600 rounded-lg">
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
              </div>
              <div>
                  <p className="text-xs font-bold text-gray-400 uppercase tracking-tight">Published</p>
                  <h3 className="text-2xl font-black text-gray-800">{totalPublished}</h3>
              </div>
          </div>

          <div className="bg-white p-5 rounded-xl border border-gray-200 shadow-sm flex items-center gap-4">
              <div className="p-3 bg-yellow-100 text-yellow-600 rounded-lg">
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"></path></svg>
              </div>
              <div>
                  <p className="text-xs font-bold text-gray-400 uppercase tracking-tight">Draft</p>
                  <h3 className="text-2xl font-black text-gray-800">{totalDraft}</h3>
              </div>
          </div>
      </div>

      {/* --- BAHAGIAN 2: TOOLBAR --- */}
      <div className="flex flex-col md:flex-row justify-between items-center gap-4 bg-white p-4 rounded-xl border border-gray-200 shadow-sm">
         <div className="relative w-full md:w-96">
            <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-gray-400">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path></svg>
            </span>
            <input 
                type="text" 
                placeholder="Cari artikel / kategori / nama editor..." 
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition text-sm"
            />
         </div>

         <div className="flex items-center gap-3 w-full md:w-auto">
             <span className="text-xs font-bold text-gray-400 bg-gray-50 px-3 py-1.5 rounded-lg border border-gray-100">
                 {filteredPosts.length} Rekod Ditemui
             </span>
             <Link href="/admin/create" className="bg-blue-600 text-white px-6 py-2.5 rounded-xl text-sm font-bold hover:bg-blue-700 shadow-lg shadow-blue-100 transition-all flex items-center gap-2 whitespace-nowrap active:scale-95">
                <span className="text-lg">+</span> Artikel Baru
             </Link>
         </div>
      </div>

      {/* --- BAHAGIAN 3: TABLE DATA --- */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="text-[11px] font-bold text-gray-400 uppercase bg-gray-50/50 border-b border-gray-200 tracking-wider">
                <th className="p-5 text-center w-16">No.</th>
                <th className="p-5">Butiran Artikel</th>
                <th className="p-5 text-center">Kategori</th>
                <th className="p-5 text-center">Views</th>
                <th className="p-5 text-center">Info Editor</th>
                <th className="p-5 text-center">Status</th>
                <th className="p-5 text-right">Tindakan</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {currentItems.map((post, index) => {
                const bil = (currentPage - 1) * itemsPerPage + index + 1;
                
                return (
                  <tr key={post.id} className="hover:bg-blue-50/40 transition duration-150 group">
                    
                    <td className="p-5 text-center text-sm font-bold text-gray-400">
                      {bil.toString().padStart(2, '0')}
                    </td>

                    <td className="p-5">
                      <div className="flex items-center gap-4">
                          <div className="w-12 h-12 rounded-xl bg-gray-100 overflow-hidden flex-shrink-0 border border-gray-200 shadow-sm">
                              {post.image_url ? (
                                  <img src={post.image_url} className="w-full h-full object-cover" alt="thumb" />
                              ) : (
                                  <div className="w-full h-full flex items-center justify-center text-[10px] text-gray-400 font-bold bg-gray-50">TIADA</div>
                              )}
                          </div>
                          <div className="flex flex-col">
                              <div className="font-bold text-gray-800 line-clamp-1 max-w-xs group-hover:text-blue-600 transition text-sm" title={post.title}>{post.title}</div>
                              <div className="text-[10px] text-gray-400 mt-1 font-semibold flex items-center gap-1">
                                  <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"></path></svg>
                                  Dibuat: {new Date(post.created_at).toLocaleDateString('ms-MY', { day: 'numeric', month: 'short', year: 'numeric' })}
                              </div>
                          </div>
                      </div>
                    </td>

                    <td className="p-5 text-center">
                       <span className="px-3 py-1 rounded-lg bg-white text-gray-500 text-[10px] font-black uppercase tracking-widest border border-gray-200 shadow-sm">
                          {post.category}
                       </span>
                    </td>

                    <td className="p-5 text-center">
                        <div className="inline-flex items-center justify-center px-3 py-1 rounded-full bg-gray-50 font-bold text-gray-700 text-xs border border-gray-100">
                            {post.views || 0}
                        </div>
                    </td>

                    {/* Column Editor & Info Kemaskini */}
                    <td className="p-5 text-center">
                       <div className="flex flex-col items-center gap-0.5">
                          {post.author_name ? (
                            <div className="text-xs font-extrabold text-blue-700 capitalize">
                               {post.author_name}
                            </div>
                          ) : (
                            <div className="text-[10px] font-bold text-red-400 italic">
                               Nama Tiada
                            </div>
                          )}
                          
                          {post.updated_at && (
                            <div className="text-[9px] text-gray-400 font-medium italic">
                               Update: {new Date(post.updated_at).toLocaleDateString('ms-MY', { day: '2-digit', month: '2-digit', year: '2-digit' })}
                            </div>
                          )}
                       </div>
                    </td>

                    <td className="p-5 text-center">
                        {post.is_published ? (
                            <span className="inline-flex items-center gap-1.5 text-green-700 text-[10px] font-black bg-green-50 px-2.5 py-1 rounded-full border border-green-200 uppercase tracking-tighter">
                                <span className="w-1.5 h-1.5 rounded-full bg-green-500 shadow-[0_0_5px_rgba(34,197,94,0.5)]"></span> Terbit
                            </span>
                        ) : (
                            <span className="inline-flex items-center gap-1.5 text-orange-700 text-[10px] font-black bg-orange-50 px-2.5 py-1 rounded-full border border-orange-200 uppercase tracking-tighter">
                                <span className="w-1.5 h-1.5 rounded-full bg-orange-400"></span> Deraf
                            </span>
                        )}
                    </td>

                    <td className="p-5 text-right space-x-2">
                      <Link href={`/${post.slug}`} target="_blank" className="inline-flex items-center justify-center w-8 h-8 rounded-lg bg-white border border-gray-200 text-gray-500 hover:bg-blue-50 hover:text-blue-600 hover:border-blue-200 transition shadow-sm" title="Lihat Live">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"></path><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"></path></svg>
                      </Link>
                      <button disabled className="inline-flex items-center justify-center w-8 h-8 rounded-lg bg-gray-50 text-gray-300 cursor-not-allowed border border-gray-200" title="Edit">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"></path></svg>
                      </button>
                      <button onClick={() => handleDelete(post.id)} className="inline-flex items-center justify-center w-8 h-8 rounded-lg bg-white border border-red-100 text-red-400 hover:bg-red-500 hover:text-white hover:border-red-500 transition shadow-sm" title="Padam">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path></svg>
                      </button>
                    </td>
                  </tr>
                );
              })}

              {filteredPosts.length === 0 && (
                  <tr>
                      <td colSpan={7} className="p-20 text-center">
                        <div className="flex flex-col items-center justify-center">
                            <div className="bg-gray-50 p-6 rounded-full mb-4">
                                <svg className="w-12 h-12 text-gray-200" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path></svg>
                            </div>
                            <p className="text-gray-400 font-bold text-sm uppercase tracking-widest">Tiada rekod ditemui untuk "{search}"</p>
                        </div>
                      </td>
                  </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* --- BAHAGIAN 4: PAGINATION FOOTER --- */}
        {filteredPosts.length > 0 && (
            <div className="bg-gray-50/50 px-6 py-5 border-t border-gray-100 flex flex-col md:flex-row justify-between items-center gap-4">
                
                <span className="text-[11px] text-gray-400 font-black uppercase tracking-widest">
                    Halaman <span className="text-blue-600">{currentPage}</span> / {totalPages} — Rekod {indexOfFirstItem + 1} hingga {Math.min(indexOfLastItem, filteredPosts.length)}
                </span>

                <div className="flex items-center gap-1.5">
                    <button 
                        onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                        disabled={currentPage === 1}
                        className="p-2 rounded-lg border border-gray-200 bg-white text-gray-500 hover:bg-gray-50 disabled:opacity-30 disabled:cursor-not-allowed transition shadow-sm"
                    >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7"></path></svg>
                    </button>
                    
                    {Array.from({ length: totalPages }, (_, i) => {
                        if (totalPages > 5 && Math.abs(currentPage - (i + 1)) > 2) return null;
                        return (
                            <button
                                key={i + 1}
                                onClick={() => setCurrentPage(i + 1)}
                                className={`w-9 h-9 rounded-lg text-xs font-black flex items-center justify-center transition-all ${
                                    currentPage === i + 1 
                                        ? 'bg-blue-600 text-white shadow-lg shadow-blue-200 ring-2 ring-blue-100' 
                                        : 'bg-white border border-gray-200 text-gray-500 hover:bg-gray-50 shadow-sm'
                                }`}
                            >
                                {i + 1}
                            </button>
                        );
                    })}

                    <button 
                        onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                        disabled={currentPage === totalPages}
                        className="p-2 rounded-lg border border-gray-200 bg-white text-gray-500 hover:bg-gray-50 disabled:opacity-30 disabled:cursor-not-allowed transition shadow-sm"
                    >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7"></path></svg>
                    </button>
                </div>
            </div>
        )}
      </div>
    </div>
  );
}