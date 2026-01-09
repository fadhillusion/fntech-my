'use client';

import imageCompression from 'browser-image-compression'; // <--- Import Mesin Penyek
import { useEffect, useState, use } from 'react';
import { supabase } from '@/lib/supabase';
import { useRouter } from 'next/navigation';

// --- SENARAI KATEGORI (SAMA SEBIJIK MACAM CREATE) ---
const categoryList = [
  { group: '📱 DIGITAL - Aplikasi & OS', options: [
      { label: 'Android', value: 'android' },
      { label: 'iOS', value: 'ios' },
      { label: 'Linux & Lain', value: 'linux' },
      { label: 'macOS', value: 'macos' },
      { label: 'Windows', value: 'windows' }
  ]},
  { group: '📱 DIGITAL - Lain-lain', options: [
      { label: 'Fintech & eWallet', value: 'fintech' },
      { label: 'Gaming (E-Sukan)', value: 'gaming' },
      { label: 'Telco & Pelan', value: 'telco' }
  ]},
  { group: '🛡 DUNIA IT', options: [
      { label: 'Kreatif & Multimedia', value: 'multimedia' },
      { label: 'Siber & Sekuriti', value: 'security' },
      { label: 'Sistem & Rangkaian', value: 'network' },
      { label: 'Web & Perisian', value: 'dev' }
  ]},
  { group: '🎧 GAJET - Audio', options: [
      { label: 'Headphone', value: 'headphone' },
      { label: 'Smartwatch', value: 'smartwatch' },
      { label: 'Speaker', value: 'speaker' },
      { label: 'TWS', value: 'tws' }
  ]},
  { group: '🎧 GAJET - Komputer', options: [
      { label: 'Desktop', value: 'desktop' },
      { label: 'Laptop', value: 'laptop' },
      { label: 'Monitor', value: 'monitor' },
      { label: 'Storan & RAM', value: 'storage' }
  ]},
  { group: '🎧 GAJET - Telefon', options: [
      { label: 'Flagship', value: 'flagship' },
      { label: 'Foldable', value: 'foldable' },
      { label: 'Gaming Phone', value: 'gaming-phone' },
      { label: 'Mid-Range', value: 'midrange' }
  ]},
  { group: '📚 PANDUAN', options: [
      { label: 'Tips (Life-hacks)', value: 'tips' },
      { label: 'Trivia', value: 'trivia' },
      { label: 'Tutorial', value: 'tutorial' }
  ]},
  { group: '🔥 SOHOR', options: [
      { label: 'Berita', value: 'news' },
      { label: 'Ulasan', value: 'reviews' }
  ]},
  { group: '🚀 TEKNOLOGI', options: [
      { label: 'Automotif (EV)', value: 'automotive' },
      { label: 'AI', value: 'ai' },
      { label: 'Sains', value: 'science' },
      { label: 'Utiliti Pintar', value: 'smart-utility' }
  ]},
];

export default function EditPost({ params }: { params: Promise<{ id: string }> }) {
  // Unboxing ID dari URL
  const { id } = use(params);
  
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  
  // Data State
  const [title, setTitle] = useState('');
  const [slug, setSlug] = useState('');
  const [category, setCategory] = useState(''); // <--- State Kategori
  const [excerpt, setExcerpt] = useState('');
  const [content, setContent] = useState('');
  const [imageUrl, setImageUrl] = useState('');

  // 1. Tarik Data Lama (READ)
  useEffect(() => {
    const fetchData = async () => {
      // Security Guard 👮‍♂️
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) { router.push('/login'); return; }

      // Tarik dari DB
      const { data, error } = await supabase
        .from('posts')
        .select('*')
        .eq('id', id)
        .single();

      if (error) {
        alert('Artikel tak jumpa!');
        router.push('/admin');
      } else if (data) {
        setTitle(data.title);
        setSlug(data.slug);
        setCategory(data.category || ''); // <--- Masukkan kategori lama ke dropdown
        setExcerpt(data.excerpt || '');
        setContent(data.content);
        setImageUrl(data.image_url || '');
        setLoading(false);
      }
    };

    fetchData();
  }, [id, router]);

  // 2. Fungsi Upload Gambar (Sama macam Create)
  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    try {
      if (!e.target.files || e.target.files.length === 0) return;
      setUploading(true);
      const originalFile = e.target.files[0];
      const options = { maxSizeMB: 1, maxWidthOrHeight: 1920, useWebWorker: true };
      
      // Compress
      const compressedFile = await imageCompression(originalFile, options);
      
      const fileExt = originalFile.name.split('.').pop();
      const fileName = `${Date.now()}.${fileExt}`;

      // Upload
      const { error: uploadError } = await supabase.storage.from('images').upload(fileName, compressedFile);
      if (uploadError) throw uploadError;

      // Get URL
      const { data } = supabase.storage.from('images').getPublicUrl(fileName);
      setImageUrl(data.publicUrl);
      alert("Gambar baru siap tukar! ✅");

    } catch (error: any) {
      alert("Gagal upload: " + error.message);
    } finally {
      setUploading(false);
    }
  };

  // 3. Simpan Perubahan (UPDATE)
  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!category) { alert("Sila pilih kategori Boss!"); return; }

    setLoading(true);
    try {
      const { error } = await supabase
        .from('posts')
        .update({
          title,
          slug,
          category, // <--- Jangan lupa update kategori sekali
          excerpt,
          content,
          image_url: imageUrl,
        })
        .eq('id', id);

      if (error) throw error;
      alert('Artikel Berjaya Update! ✅');
      router.push('/admin');

    } catch (err: any) {
      alert('Error: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <div className="text-center p-10">Mengambil data artikel...</div>;

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4">
      <div className="max-w-3xl mx-auto bg-white p-8 rounded-xl shadow-lg">
        <h1 className="text-2xl font-bold text-gray-900 mb-6">Edit Artikel ✏️</h1>

        <form onSubmit={handleUpdate} className="space-y-6">
          
          {/* Tajuk & Slug */}
          <div>
            <label className="block text-sm font-medium text-gray-700">Tajuk</label>
            <input type="text" value={title} onChange={e => setTitle(e.target.value)} className="w-full border p-3 rounded-md" required />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Slug</label>
            <input type="text" value={slug} onChange={e => setSlug(e.target.value)} className="w-full border p-2 bg-gray-100 rounded-md text-sm" />
          </div>

          {/* --- PILIH KATEGORI (EDIT) --- */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Kategori Artikel</label>
            <select 
                required 
                value={category} 
                onChange={(e) => setCategory(e.target.value)}
                className="w-full border border-gray-300 p-3 rounded-md bg-white focus:ring-blue-500"
            >
                <option value="">-- Sila Pilih Kategori --</option>
                {categoryList.map((group, index) => (
                    <optgroup key={index} label={group.group}>
                        {group.options.map((option) => (
                            <option key={option.value} value={option.value}>
                                {option.label}
                            </option>
                        ))}
                    </optgroup>
                ))}
            </select>
          </div>

          {/* Gambar Upload */}
          <div>
            <label className="block text-sm font-medium text-gray-700">Gambar</label>
            <input type="file" accept="image/*" onChange={handleImageUpload} disabled={uploading} className="mt-2 block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100" />
            
            {uploading && <p className="text-xs text-blue-500 mt-1 animate-pulse">Sedang compress & upload...</p>}
            
            {imageUrl && (
                <div className="mt-3">
                    <p className="text-xs text-gray-500 mb-1">Gambar Semasa:</p>
                    <img src={imageUrl} alt="Preview" className="h-40 rounded shadow-md object-cover" />
                </div>
            )}
          </div>

          {/* Excerpt & Content */}
          <div>
            <label className="block text-sm font-medium text-gray-700">Rumusan</label>
            <textarea rows={2} value={excerpt} onChange={e => setExcerpt(e.target.value)} className="w-full border p-3 rounded-md" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Isi (Markdown)</label>
            <textarea rows={10} required value={content} onChange={e => setContent(e.target.value)} className="w-full border p-3 rounded-md font-mono text-sm" />
          </div>

          {/* Buttons */}
          <div className="flex justify-end gap-3">
            <button type="button" onClick={() => router.back()} className="px-4 py-2 bg-gray-200 rounded">Batal</button>
            <button type="submit" disabled={loading || uploading} className="px-6 py-2 bg-blue-600 text-white rounded font-bold hover:bg-blue-700">
              {loading ? 'Saving...' : 'Simpan Perubahan'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}