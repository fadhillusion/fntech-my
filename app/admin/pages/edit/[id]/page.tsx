'use client';

import { useState, useEffect } from 'react';
import { createClient } from '@/lib/supabase-client';
import { useRouter, useParams } from 'next/navigation'; // Guna useParams
import Link from 'next/link';

export default function EditPage() {
  const router = useRouter();
  const params = useParams(); // Ambil ID dari URL
  const supabase = createClient();
  
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [title, setTitle] = useState('');
  const [slug, setSlug] = useState('');
  const [content, setContent] = useState('');
  const [isPublished, setIsPublished] = useState(false);

  // 1. Tarik Data Lama
  useEffect(() => {
    const fetchPage = async () => {
      const { data, error } = await supabase
        .from('pages')
        .select('*')
        .eq('id', params.id)
        .single();

      if (error) {
        alert('Page tak jumpa!');
        router.push('/admin/pages');
      } else if (data) {
        setTitle(data.title);
        setSlug(data.slug);
        setContent(data.content);
        setIsPublished(data.is_published);
        setLoading(false);
      }
    };

    if (params.id) fetchPage();
  }, [params.id, router, supabase]);

  // 2. Simpan Perubahan (Update)
  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);

    const { error } = await supabase
      .from('pages')
      .update({
        title,
        slug,
        content,
        is_published: isPublished
      })
      .eq('id', params.id);

    if (error) {
      alert('Gagal update: ' + error.message);
      setSaving(false);
    } else {
      alert('Halaman berjaya dikemaskini! ✅');
      router.push('/admin/pages');
    }
  };

  if (loading) return <div className="p-10 text-center animate-pulse">Sedang mencari data...</div>;

  return (
    <div className="max-w-4xl mx-auto">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-800">Edit Halaman</h1>
        <Link href="/admin/pages" className="text-gray-500 hover:text-gray-700 text-sm">
          &larr; Batal
        </Link>
      </div>

      <div className="bg-white p-8 rounded-xl shadow-sm border border-gray-200">
        <form onSubmit={handleUpdate} className="space-y-6">
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Tajuk Halaman</label>
              <input
                type="text"
                required
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">URL Slug</label>
              <div className="flex">
                <span className="inline-flex items-center px-3 rounded-l-md border border-r-0 border-gray-300 bg-gray-50 text-gray-500 text-sm">/</span>
                <input
                  type="text"
                  required
                  value={slug}
                  onChange={(e) => setSlug(e.target.value)}
                  className="flex-1 px-4 py-2 border border-gray-300 rounded-r-lg focus:ring-2 focus:ring-blue-500 outline-none bg-gray-50"
                />
              </div>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Isi Kandungan</label>
            <textarea
              rows={12}
              required
              value={content}
              onChange={(e) => setContent(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none font-mono text-sm"
            />
          </div>

          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              id="publish"
              checked={isPublished}
              onChange={(e) => setIsPublished(e.target.checked)}
              className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
            />
            <label htmlFor="publish" className="ml-2 block text-sm text-gray-900">
              Published (Aktif)
            </label>
          </div>

          <div className="pt-4 border-t border-gray-100 flex justify-end">
            <button
              type="submit"
              disabled={saving}
              className="px-6 py-2 bg-blue-600 text-white font-bold rounded-lg hover:bg-blue-700 transition disabled:opacity-70"
            >
              {saving ? 'Menyimpan...' : 'Kemaskini Halaman'}
            </button>
          </div>

        </form>
      </div>
    </div>
  );
}