'use client';

import { useState } from 'react';
import { supabase } from '@/lib/supabase';
import { useRouter } from 'next/navigation';

export default function CreatePost() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  
  // Borang Data
  const [title, setTitle] = useState('');
  const [slug, setSlug] = useState('');
  const [excerpt, setExcerpt] = useState('');
  const [content, setContent] = useState('');
  const [imageUrl, setImageUrl] = useState('');

  // Fungsi: Auto-generate Slug bila taip Tajuk
  const handleTitleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newTitle = e.target.value;
    setTitle(newTitle);
    // Tukar jadi huruf kecil & ganti space dengan sengkang
    setSlug(newTitle.toLowerCase().replace(/ /g, '-').replace(/[^\w-]+/g, ''));
  };

  // Fungsi: Hantar ke Supabase
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const { error } = await supabase.from('posts').insert([
        {
          title,
          slug,
          excerpt,
          content,
          image_url: imageUrl,
          is_published: true, // Auto publish terus
        },
      ]);

      if (error) throw error;

      alert('Artikel Berjaya Publish! 🎉');
      router.push('/'); // Balik ke Home
      router.refresh();

    } catch (err: any) {
      alert('Error: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-3xl mx-auto bg-white p-8 rounded-xl shadow-lg">
        <h1 className="text-2xl font-bold text-gray-900 mb-6">Tulis Artikel Baru ✍️</h1>

        <form onSubmit={handleSubmit} className="space-y-6">
          
          {/* Tajuk */}
          <div>
            <label className="block text-sm font-medium text-gray-700">Tajuk Artikel</label>
            <input
              type="text"
              required
              value={title}
              onChange={handleTitleChange}
              className="mt-1 block w-full rounded-md border border-gray-300 p-3 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              placeholder="Contoh: Review iPhone 16 Pro"
            />
          </div>

          {/* Slug (Link) - Auto Fill */}
          <div>
            <label className="block text-sm font-medium text-gray-700">Slug (Link URL)</label>
            <input
              type="text"
              required
              value={slug}
              onChange={(e) => setSlug(e.target.value)}
              className="mt-1 block w-full rounded-md border border-gray-300 p-2 bg-gray-100 text-gray-500 text-sm"
            />
          </div>

          {/* Image URL */}
          <div>
            <label className="block text-sm font-medium text-gray-700">Link Gambar (URL)</label>
            <input
              type="text"
              value={imageUrl}
              onChange={(e) => setImageUrl(e.target.value)}
              className="mt-1 block w-full rounded-md border border-gray-300 p-3 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              placeholder="https://contoh.com/gambar.jpg"
            />
            <p className="text-xs text-gray-500 mt-1">Tips: Copy image address dari Google Images.</p>
          </div>

          {/* Excerpt (Rumusan Pendek) */}
          <div>
            <label className="block text-sm font-medium text-gray-700">Rumusan Pendek (Untuk Kad Depan)</label>
            <textarea
              rows={2}
              value={excerpt}
              onChange={(e) => setExcerpt(e.target.value)}
              className="mt-1 block w-full rounded-md border border-gray-300 p-3 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              placeholder="Tulis sikit intro yang menarik..."
            />
          </div>

          {/* Content Penuh */}
          <div>
            <label className="block text-sm font-medium text-gray-700">Isi Artikel (Markdown)</label>
            <textarea
              rows={15}
              required
              value={content}
              onChange={(e) => setContent(e.target.value)}
              className="mt-1 block w-full rounded-md border border-gray-300 p-3 shadow-sm font-mono text-sm focus:border-blue-500 focus:ring-blue-500"
              placeholder="Tulis artikel di sini..."
            />
             <p className="text-xs text-gray-500 mt-1">Guna ## untuk tajuk kecil, **bold**, dll.</p>
          </div>

          {/* Butang Submit */}
          <div className="flex justify-end space-x-4">
             <button
              type="button"
              onClick={() => router.back()}
              className="px-4 py-2 text-gray-700 bg-gray-200 rounded-md hover:bg-gray-300"
            >
              Batal
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-6 py-2 text-white bg-blue-600 rounded-md hover:bg-blue-700 font-bold shadow-md transition disabled:bg-blue-300"
            >
              {loading ? 'Sedang Publish...' : '🚀 Publish Sekarang'}
            </button>
          </div>

        </form>
      </div>
    </div>
  );
}