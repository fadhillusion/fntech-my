'use client';

import { useState, useEffect } from 'react';
import { createClient } from '@/lib/supabase-client';

export default function MediaLibrary() {
  const [files, setFiles] = useState<any[]>([]);
  const [uploading, setUploading] = useState(false);
  const [loading, setLoading] = useState(true);
  const supabase = createClient();

  const CDNURL = process.env.NEXT_PUBLIC_SUPABASE_URL + '/storage/v1/object/public/images/';

  // --- 1. Tarik Senarai Gambar ---
  const fetchImages = async () => {
    const { data, error } = await supabase
      .storage
      .from('images')
      .list('', { limit: 100, offset: 0, sortBy: { column: 'created_at', order: 'desc' } });

    if (data) setFiles(data);
    setLoading(false);
  };

  useEffect(() => {
    fetchImages();
  }, []);

  // --- 2. Fungsi Upload ---
  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    try {
      setUploading(true);

      if (!e.target.files || e.target.files.length === 0) {
        throw new Error('Sila pilih gambar dahulu.');
      }

      const file = e.target.files[0];
      // Buat nama fail unik (contoh: 1723456-namafile.jpg) elak bertindih
      const fileExt = file.name.split('.').pop();
      const fileName = `${Date.now()}.${fileExt}`;
      const filePath = `${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from('images')
        .upload(filePath, file);

      if (uploadError) throw uploadError;

      alert('Gambar berjaya diupload! ✅');
      fetchImages(); // Refresh list
    } catch (error: any) {
      alert('Error upload: ' + error.message);
    } finally {
      setUploading(false);
    }
  };

  // --- 3. Fungsi Padam ---
  const handleDelete = async (fileName: string) => {
    if (!confirm('Betul nak padam gambar ni?')) return;

    const { error } = await supabase.storage
      .from('images')
      .remove([fileName]);

    if (error) {
      alert('Error delete: ' + error.message);
    } else {
      fetchImages(); // Refresh list
      alert('Gambar dah padam. 🗑️');
    }
  };

  // --- 4. Fungsi Copy Link ---
  const handleCopy = (fileName: string) => {
    const fullUrl = CDNURL + fileName;
    navigator.clipboard.writeText(fullUrl);
    alert('Link disalin! Boleh paste dalam artikel. 🔗');
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-800">Pustaka Media</h1>
        
        {/* Butang Upload Custom */}
        <div className="relative">
            <label className={`cursor-pointer bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-bold hover:bg-blue-700 transition flex items-center gap-2 ${uploading ? 'opacity-50 cursor-not-allowed' : ''}`}>
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12"></path></svg>
                {uploading ? 'Uploading...' : 'Upload Gambar'}
                <input 
                    type="file" 
                    className="hidden" 
                    accept="image/*"
                    onChange={handleUpload}
                    disabled={uploading}
                />
            </label>
        </div>
      </div>

      {/* --- Grid Gambar --- */}
      {loading ? (
          <div className="text-center p-10 animate-pulse text-gray-500">Memuatkan galeri...</div>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-4">
            {files.length === 0 && (
                <div className="col-span-full text-center p-10 bg-white rounded-lg border border-dashed border-gray-300 text-gray-400">
                    Tiada gambar. Sila upload gambar pertama anda!
                </div>
            )}

            {files.map((file) => (
                <div key={file.id} className="group relative bg-white border border-gray-200 rounded-lg overflow-hidden shadow-sm hover:shadow-md transition">
                    
                    {/* Preview Gambar */}
                    <div className="aspect-square bg-gray-100 relative overflow-hidden">
                         {/* Kita guna img tag biasa sebab URL external */}
                        <img 
                            src={CDNURL + file.name} 
                            alt={file.name}
                            className="w-full h-full object-cover object-center group-hover:scale-105 transition duration-300"
                        />
                    </div>

                    {/* Info & Action Buttons */}
                    <div className="p-2 bg-white">
                        <p className="text-xs text-gray-500 truncate mb-2">{file.name}</p>
                        <div className="flex gap-2">
                            <button 
                                onClick={() => handleCopy(file.name)}
                                className="flex-1 bg-gray-100 hover:bg-gray-200 text-gray-600 text-xs py-1 rounded flex justify-center items-center gap-1"
                                title="Copy Link"
                            >
                                🔗 Copy
                            </button>
                            <button 
                                onClick={() => handleDelete(file.name)}
                                className="flex-1 bg-red-50 hover:bg-red-100 text-red-600 text-xs py-1 rounded flex justify-center items-center gap-1"
                                title="Padam"
                            >
                                🗑️
                            </button>
                        </div>
                    </div>
                </div>
            ))}
        </div>
      )}
    </div>
  );
}