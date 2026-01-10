'use client';

import { useEffect, useState } from 'react';
import { createClient } from '@/lib/supabase-client';
import { useRouter, useParams } from 'next/navigation';
import Link from 'next/link';
import { toast } from 'sonner'; // Notification cantik
import RichTextEditor from '@/components/ui/RichTextEditor'; // <--- EDITOR BARU KITA

export default function EditPostPage() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const router = useRouter();
  const params = useParams();
  const supabase = createClient();

  // State untuk form
  const [formData, setFormData] = useState({
    title: '',
    slug: '',
    category: '',
    content: '', // Ini akan simpan HTML dari TipTap
    is_published: false,
    image_url: '' 
  });

  // 1. Tarik Data Lama bila page load
  useEffect(() => {
    const fetchPost = async () => {
      try {
        const { data, error } = await supabase
          .from('posts')
          .select('*')
          .eq('id', params.id)
          .single();

        if (error) throw error;

        // Masukkan data ke dalam form
        setFormData(data);
      } catch (error) {
        console.error(error);
        toast.error('Gagal tarik data artikel.');
        router.push('/admin/posts');
      } finally {
        setLoading(false);
      }
    };

    if (params.id) fetchPost();
  }, [params.id, router]);

  // 2. Handle Perubahan Input BIASA (Tajuk, Slug, Kategori)
  const handleChange = (e: any) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }));
  };

  // 3. Handle Perubahan EDITOR (Khas untuk TipTap)
  const handleEditorChange = (htmlContent: string) => {
    setFormData((prev) => ({
      ...prev,
      content: htmlContent // Simpan terus HTML yang editor bagi
    }));
  };

  // 4. Simpan Perubahan (Update)
  const handleUpdate = async (e: any) => {
    e.preventDefault();
    setSaving(true);
    const toastId = toast.loading('Sedang mengemaskini...');

    try {
      const { error } = await supabase
        .from('posts')
        .update({
          title: formData.title,
          slug: formData.slug,
          category: formData.category,
          content: formData.content, // HTML Content dihantar ke DB
          is_published: formData.is_published,
          updated_at: new Date().toISOString(),
        })
        .eq('id', params.id);

      if (error) throw error;

      toast.success('Artikel berjaya dikemaskini!', { id: toastId });
      router.push('/admin/posts'); // Balik ke senarai

    } catch (error: any) {
      console.error(error);
      toast.error('Gagal update: ' + error.message, { id: toastId });
    } finally {
      setSaving(false);
    }
  };

  // Loading Screen
  if (loading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <div className="text-gray-500 animate-pulse flex flex-col items-center gap-2">
          <div className="w-6 h-6 border-2 border-gray-300 border-t-blue-500 rounded-full animate-spin"/>
          <span>Sedang memuatkan data...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto space-y-6 pb-20">
      
      {/* Header */}
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-black text-gray-800">Edit Artikel</h1>
        <Link href="/admin/posts" className="text-gray-500 hover:text-gray-700 font-medium px-3 py-1 rounded-lg hover:bg-gray-100 transition">
          &larr; Kembali
        </Link>
      </div>

      <form onSubmit={handleUpdate} className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm space-y-6">
        
        {/* Tajuk */}
        <div>
          <label className="block text-sm font-bold text-gray-700 mb-2">Tajuk Artikel</label>
          <input
            type="text"
            name="title"
            value={formData.title || ""}
            onChange={handleChange}
            className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none transition text-lg font-semibold"
            placeholder="Masukkan tajuk artikel..."
            required
          />
        </div>

        {/* Slug & Kategori */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-bold text-gray-700 mb-2">URL Slug</label>
            <input
              type="text"
              name="slug"
              value={formData.slug || ""}
              onChange={handleChange}
              className="w-full p-3 border border-gray-300 rounded-lg bg-gray-50 text-gray-600 font-mono text-sm"
            />
          </div>
          <div>
            <label className="block text-sm font-bold text-gray-700 mb-2">Kategori</label>
            <select
              name="category"
              value={formData.category || ""}
              onChange={handleChange}
              className="w-full p-3 border border-gray-300 rounded-lg bg-white"
            >
               <option value="">Pilih Kategori</option>
               <option value="TEKNOLOGI">TEKNOLOGI</option>
               <option value="DUNIA IT">DUNIA IT</option>
               <option value="GAJET">GAJET</option>
               <option value="PANDUAN">PANDUAN</option>
               <option value="SOHOR">SOHOR</option>
               <option value="FINTECH">FINTECH</option>
            </select>
          </div>
        </div>

        {/* --- EDITOR CANGGIH (RichTextEditor) --- */}
        <div>
          <label className="block text-sm font-bold text-gray-700 mb-2">Isi Kandungan</label>
          
          <div className="prose-editor-wrapper">
            <RichTextEditor 
              content={formData.content || ""} 
              onChange={handleEditorChange} 
            />
          </div>
          
          <p className="text-xs text-gray-400 mt-2">
            Tip: Highlight text untuk pilihan formatting. Klik ikon gambar untuk masukkan URL imej.
          </p>
        </div>
        {/* --------------------------------------- */}

        {/* Status Toggle */}
        <div 
          className="flex items-center gap-3 p-4 bg-gray-50 rounded-lg border border-gray-200 cursor-pointer hover:bg-gray-100 transition" 
          onClick={() => setFormData(prev => ({ ...prev, is_published: !prev.is_published }))}
        >
          <div className={`w-12 h-6 rounded-full p-1 transition-colors duration-300 ${formData.is_published ? 'bg-green-500' : 'bg-gray-300'}`}>
             <div className={`w-4 h-4 rounded-full bg-white shadow-md transform transition-transform duration-300 ${formData.is_published ? 'translate-x-6' : ''}`}></div>
          </div>
          <div>
             <span className="font-bold text-gray-700 select-none">Publish Artikel Ini?</span>
             <p className="text-xs text-gray-500 select-none">Jika "ON", artikel akan muncul di homepage secara LIVE.</p>
          </div>
        </div>

        {/* Submit Button */}
        <div className="pt-4 border-t border-gray-100">
            <button
            type="submit"
            disabled={saving}
            className="w-full md:w-auto md:px-8 bg-blue-600 text-white py-3 rounded-lg font-bold hover:bg-blue-700 transition shadow-lg disabled:opacity-50 disabled:cursor-not-allowed flex justify-center items-center gap-2 ml-auto"
            >
            {saving && <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />}
            {saving ? 'Sedang Simpan...' : 'Simpan Perubahan'}
            </button>
        </div>

      </form>
    </div>
  );
}