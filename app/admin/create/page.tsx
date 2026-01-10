'use client';

import { useState } from 'react';
import { createClient } from '@/lib/supabase-client';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

export default function CreatePostPro() {
  const router = useRouter();
  const supabase = createClient();
  
  // --- STATE ---
  const [loading, setLoading] = useState(false);
  const [aiLoading, setAiLoading] = useState(false);
  
  // Data Form
  const [title, setTitle] = useState('');
  const [slug, setSlug] = useState('');
  const [category, setCategory] = useState('');
  const [content, setContent] = useState('');
  const [excerpt, setExcerpt] = useState('');
  const [imageUrl, setImageUrl] = useState('');

  // --- AUTO SLUG ---
  const handleTitleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setTitle(val);
    setSlug(val.toLowerCase().replace(/ /g, '-').replace(/[^\w-]+/g, ''));
  };

  // --- FUNGSI UPLOAD GAMBAR ---
  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    try {
      if (!e.target.files || e.target.files.length === 0) return;
      const file = e.target.files[0];
      const fileExt = file.name.split('.').pop();
      const fileName = `${Date.now()}.${fileExt}`;
      const filePath = `${fileName}`;

      setLoading(true);
      const { error: uploadError } = await supabase.storage.from('images').upload(filePath, file);
      if (uploadError) throw uploadError;

      const { data } = supabase.storage.from('images').getPublicUrl(filePath);
      setImageUrl(data.publicUrl);
      setLoading(false);
    } catch (error: any) {
      alert('Error upload: ' + error.message);
      setLoading(false);
    }
  };

  // --- 🤖 AI GENERATOR (MOCKUP) ---
  const generateAIStructure = (type: 'viral' | 'review' | 'listicle') => {
    setAiLoading(true);
    setTimeout(() => {
      let template = '';
      if (type === 'viral') {
        template = `## 🔥 Intro: Kenapa Benda Ni Viral?
(Tulis 2-3 ayat "hook" yang buat orang marah atau teruja...)

## 🤯 Fakta Yang Ramai Tak Tahu
1. Fakta pertama...
2. Fakta kedua...

## 📸 Bukti Kejadian
(Letak gambar bukti di sini)

## 💡 Pendapat Jujur Saya
Jujur cakap, benda ni sebenarnya...

## 👇 Kesimpulan
Korang rasa macam mana? Komen kat bawah!`;
      } else if (type === 'review') {
        template = `## 📦 Unboxing & First Impression
Bila pegang kotak dia, rasa premium...

## ⚙️ Spesifikasi Ringkas
* **Chipset:** ...
* **Bateri:** ...
* **Harga:** ...

## ✅ Kelebihan (Yang Best)
* Laju namati...
* Kamera padu...

## ❌ Kekurangan (Yang Hauk)
* Cepat panas bila gaming...

## 🏆 Berbaloi Beli?
Kalau korang jenis yang..., beli je. Tapi kalau...`;
      }
      
      setContent(prev => prev + '\n' + template);
      setAiLoading(false);
    }, 1000); // Simulasi loading 1 saat
  };

  // --- FUNGSI SAVE (DRAFT vs PUBLISH) ---
  const handleSave = async (isPublished: boolean) => {
    if (!title || !category) {
        alert('Sila isi Tajuk dan Kategori!');
        return;
    }
    setLoading(true);

    const { error } = await supabase.from('posts').insert({
      title,
      slug,
      category,
      content,
      excerpt: excerpt || content.slice(0, 150), // Kalau tak isi excerpt, ambil dari content
      image_url: imageUrl,
      is_published: isPublished,
      views: 0
    });

    if (error) {
      alert('Gagal simpan: ' + error.message);
      setLoading(false);
    } else {
      alert(isPublished ? 'Artikel berjaya PUBLISH! 🚀' : 'Artikel disimpan sebagai DRAFT. 💾');
      router.push('/admin/posts');
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 pb-20">
      
      {/* --- TOP BAR (ACTIONS) --- */}
      <div className="sticky top-0 z-40 bg-white border-b border-gray-200 px-6 py-4 flex justify-between items-center shadow-sm">
         <div className="flex items-center gap-4">
             <Link href="/admin/posts" className="text-gray-500 hover:text-gray-800 font-bold">&larr; Batal</Link>
             <div className="h-6 w-px bg-gray-300"></div>
             <span className="text-sm text-gray-400 font-mono">Status: Penulisan...</span>
         </div>
         <div className="flex gap-3">
             <button 
                onClick={() => handleSave(false)} 
                disabled={loading}
                className="px-4 py-2 text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg font-bold text-sm transition"
             >
                💾 Simpan Draft
             </button>
             <button 
                onClick={() => handleSave(true)}
                disabled={loading} 
                className="px-6 py-2 text-white bg-blue-600 hover:bg-blue-700 rounded-lg font-bold text-sm shadow-md hover:shadow-lg transition flex items-center gap-2"
             >
                {loading ? 'Processing...' : '🚀 Terbitkan Sekarang'}
             </button>
         </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* --- KOLUM KIRI (EDITOR) - 2/3 --- */}
        <div className="lg:col-span-2 space-y-6">
            
            {/* 1. TAJUK BESAR */}
            <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
                <input 
                    type="text" 
                    placeholder="Tulis Tajuk Yang Gempak Di Sini..." 
                    value={title}
                    onChange={handleTitleChange}
                    className="w-full text-3xl md:text-4xl font-black text-gray-900 placeholder-gray-300 border-none focus:ring-0 outline-none bg-transparent"
                />
                <div className="mt-4 flex items-center gap-2 text-sm text-gray-500 bg-gray-50 p-2 rounded-lg">
                    <span className="font-mono">fndigital.my/</span>
                    <input 
                        type="text" 
                        value={slug} 
                        onChange={(e) => setSlug(e.target.value)}
                        className="bg-transparent border-none focus:ring-0 text-blue-600 font-bold w-full p-0" 
                    />
                </div>
            </div>

            {/* 2. AI TOOLS BAR */}
            <div className="flex gap-2 overflow-x-auto pb-2">
                <div className="flex items-center gap-2 px-3 py-1 bg-purple-100 text-purple-700 rounded-full text-xs font-bold whitespace-nowrap">
                    🤖 AI Assistant:
                </div>
                <button 
                    onClick={() => generateAIStructure('viral')}
                    disabled={aiLoading}
                    className="px-4 py-1.5 bg-white border border-purple-200 text-purple-600 rounded-full text-xs font-bold hover:bg-purple-50 transition shadow-sm flex items-center gap-1"
                >
                    🔥 Struktur Viral
                </button>
                <button 
                    onClick={() => generateAIStructure('review')}
                    disabled={aiLoading}
                    className="px-4 py-1.5 bg-white border border-blue-200 text-blue-600 rounded-full text-xs font-bold hover:bg-blue-50 transition shadow-sm flex items-center gap-1"
                >
                    📦 Struktur Review
                </button>
            </div>

            {/* 3. CONTENT EDITOR */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 flex flex-col min-h-[500px]">
                <div className="border-b border-gray-100 px-4 py-2 flex gap-4 text-xs font-bold text-gray-400">
                    <button className="text-blue-600 border-b-2 border-blue-600 pb-2">Write</button>
                    <button className="hover:text-gray-600 pb-2">Preview (Markdown)</button>
                </div>
                <textarea 
                    value={content}
                    onChange={(e) => setContent(e.target.value)}
                    placeholder="Mula menaip cerita anda di sini... (Boleh guna Markdown)"
                    className="flex-1 w-full p-6 text-lg text-gray-800 border-none focus:ring-0 outline-none resize-none leading-relaxed font-sans"
                />
            </div>

        </div>

        {/* --- KOLUM KANAN (SETTINGS) - 1/3 --- */}
        <div className="space-y-6">

            {/* A. SEO PREVIEW CARD (Google) */}
            <div className="bg-white p-5 rounded-xl shadow-sm border border-gray-200">
                <h3 className="text-xs font-bold text-gray-400 uppercase mb-3">Google SEO Preview</h3>
                <div className="bg-gray-50 p-4 rounded-lg">
                    <div className="flex items-center gap-2 mb-1">
                         <div className="w-6 h-6 bg-white rounded-full flex items-center justify-center border border-gray-200 text-[10px]">FN</div>
                         <div className="text-xs text-gray-700">FNDigital.my</div>
                    </div>
                    <div className="text-blue-700 text-lg font-medium leading-snug hover:underline cursor-pointer truncate">
                        {title || 'Tajuk Artikel Anda Di Sini...'}
                    </div>
                    <div className="text-green-700 text-xs mt-0.5">
                        https://fndigital.my/{slug || 'tajuk-artikel'}
                    </div>
                    <div className="text-gray-600 text-sm mt-2 line-clamp-2">
                        {excerpt || content.slice(0, 150) || 'Penerangan artikel akan muncul di sini. Pastikan ia menarik supaya orang klik!'}...
                    </div>
                </div>
                <div className="mt-4">
                    <label className="text-xs font-bold text-gray-700 block mb-1">Meta Description (Rumusan)</label>
                    <textarea 
                        rows={3}
                        value={excerpt}
                        onChange={(e) => setExcerpt(e.target.value)}
                        className="w-full text-sm p-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                        placeholder="Tulis ringkasan padu untuk tarik orang klik..."
                    />
                    <p className="text-[10px] text-gray-400 mt-1 text-right">{excerpt.length}/160 patah perkataan disyorkan.</p>
                </div>
            </div>

            {/* B. POST SETTINGS */}
            <div className="bg-white p-5 rounded-xl shadow-sm border border-gray-200 space-y-4">
                <h3 className="text-xs font-bold text-gray-400 uppercase border-b border-gray-100 pb-2">Tetapan Artikel</h3>
                
                {/* Kategori */}
                <div>
                    <label className="text-sm font-bold text-gray-700 block mb-1">Kategori</label>
                    <select 
                        value={category} 
                        onChange={(e) => setCategory(e.target.value)}
                        className="w-full p-2.5 border border-gray-300 rounded-lg bg-gray-50 focus:ring-2 focus:ring-blue-500 outline-none text-sm"
                    >
                        <option value="">-- Pilih Kategori --</option>
                        <option value="tech">Teknologi</option>
                        <option value="android">Android</option>
                        <option value="ios">iOS</option>
                        <option value="gaming">Gaming</option>
                        <option value="tips">Tips & Tricks</option>
                        <option value="fintech">Fintech</option>
                    </select>
                </div>

                {/* Featured Image */}
                <div>
                    <label className="text-sm font-bold text-gray-700 block mb-1">Gambar Utama</label>
                    <div className="border-2 border-dashed border-gray-300 rounded-lg p-4 text-center hover:bg-gray-50 transition cursor-pointer relative">
                        <input 
                            type="file" 
                            accept="image/*"
                            onChange={handleImageUpload}
                            className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                        />
                        {imageUrl ? (
                            <img src={imageUrl} alt="Preview" className="w-full h-32 object-cover rounded-md" />
                        ) : (
                            <div className="text-gray-400">
                                <div className="text-2xl mb-1">📷</div>
                                <span className="text-xs">Klik untuk upload</span>
                            </div>
                        )}
                    </div>
                </div>

            </div>

        </div>

      </div>
    </div>
  );
}