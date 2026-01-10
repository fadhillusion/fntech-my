'use client';

import { useEffect, useState } from 'react';
import { createClient } from '@/lib/supabase-client';
import { useParams } from 'next/navigation';
import Link from 'next/link';

export default function SinglePostPage() {
  const params = useParams();
  const supabase = createClient();
  const [post, setPost] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchPost = async () => {
      if (!params.id) return;

      // 1. Tarik Data Artikel
      const { data, error } = await supabase
        .from('posts')
        .select('*')
        .eq('id', params.id)
        .single();

      if (data) {
        setPost(data);
        
        // 2. Tambah View Count (+1) - CARA FIXED
        // Kita panggil RPC. Kalau error (sebab takde function), kita abaikan je.
        await supabase.rpc('increment_views', { post_id: params.id });
      }
      setLoading(false);
    };

    fetchPost();
  }, [params.id, supabase]);

  if (loading) return <div className="max-w-3xl mx-auto py-20 px-4 animate-pulse"><div className="h-8 bg-gray-200 w-3/4 mb-4"></div><div className="h-64 bg-gray-200 mb-6"></div><div className="space-y-2"><div className="h-4 bg-gray-200"></div><div className="h-4 bg-gray-200"></div></div></div>;

  if (!post) return <div className="text-center py-20">Artikel tidak dijumpai 404.</div>;

  return (
    <div className="min-h-screen bg-white">
      <article className="max-w-3xl mx-auto px-4 py-12">
        
        {/* Breadcrumb */}
        <div className="text-sm text-gray-500 mb-6 flex items-center gap-2">
            <Link href="/" className="hover:text-blue-600">Home</Link>
            <span>/</span>
            <span className="text-blue-600 font-semibold uppercase">{post.category}</span>
        </div>

        {/* Tajuk Besar */}
        <h1 className="text-3xl md:text-5xl font-extrabold text-gray-900 mb-6 leading-tight">
          {post.title}
        </h1>

        {/* Info Penulis / Tarikh */}
        <div className="flex items-center gap-4 text-sm text-gray-500 mb-8 border-b pb-8">
            <span>📅 {new Date(post.created_at).toLocaleDateString('ms-MY', { day: 'numeric', month: 'long', year: 'numeric' })}</span>
            <span>👁️ {post.views || 0} Bacaan</span>
        </div>

        {/* ISI KANDUNGAN UTAMA */}
        <div 
          className="prose prose-lg prose-blue max-w-none text-gray-800"
          dangerouslySetInnerHTML={{ __html: post.content }} 
        />
        
      </article>

      {/* Footer Navigation */}
      <div className="border-t border-gray-100 py-12 bg-gray-50">
        <div className="max-w-3xl mx-auto px-4 text-center">
             <Link href="/" className="inline-block bg-white border border-gray-300 px-6 py-3 rounded-full font-bold text-gray-700 hover:bg-gray-100 transition shadow-sm">
                &larr; Kembali ke Laman Utama
             </Link>
        </div>
      </div>
    </div>
  );
}