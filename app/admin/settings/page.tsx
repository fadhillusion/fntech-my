'use client';

import { useState, useEffect } from 'react';
import { createClient } from '@/lib/supabase-client'; // <--- Import Client Baru
import { useRouter } from 'next/navigation';

export default function SettingsPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  
  // State untuk borang
  const [siteTitle, setSiteTitle] = useState('FNDigital.my');
  const [apiThreshold, setApiThreshold] = useState('50'); // Default value

  // 1. HIDUPKAN SUPABASE KAT SINI
  const supabase = createClient();

  // --- Load Data Tetapan ---
  useEffect(() => {
    const fetchSettings = async () => {
      // Kita anggap settings ada dalam table 'settings' atau kita hardcode dulu kalau belum ada table
      // Untuk tutorial ni, saya buat simple fetch kalau Boss dah ada table settings.
      // Kalau belum ada, dia akan pakai default value kat atas.
      
      try {
        const { data, error } = await supabase
          .from('settings')
          .select('*')
          .single();

        if (data) {
          setSiteTitle(data.site_title || 'FNDigital.my');
          setApiThreshold(data.api_threshold || '50');
        }
      } catch (err) {
        console.log('Belum ada setting, guna default.');
      }
    };

    fetchSettings();
  }, []); // Jalan sekali je

  // --- Simpan Data ---
  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    const settingsData = {
      site_title: siteTitle,
      api_threshold: apiThreshold,
      updated_at: new Date(),
    };

    // Upsert: Kalau ada dia update, kalau takde dia create
    // Pastikan Boss dah buat table 'settings' di Supabase. 
    // Kalau belum, kod ni mungkin error sikit tapi takkan crashkan app.
    const { error } = await supabase
      .from('settings')
      .upsert(settingsData, { onConflict: 'id' }); // Anggap ada column ID 1

    if (error) {
      alert('Gagal simpan: ' + error.message);
    } else {
      alert('Tetapan berjaya disimpan! ✅');
      router.refresh();
    }
    setLoading(false);
  };

  return (
    <div className="max-w-2xl mx-auto">
      <h1 className="text-2xl font-bold text-gray-800 mb-6">Tetapan Sistem</h1>

      <div className="bg-white p-8 rounded-xl shadow-sm border border-gray-200">
        <form onSubmit={handleSave} className="space-y-6">
          
          {/* Tajuk Website */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Tajuk Website</label>
            <input
              type="text"
              value={siteTitle}
              onChange={(e) => setSiteTitle(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition"
              placeholder="Contoh: FNDigital"
            />
          </div>

          {/* Threshold Api (Untuk Logic Warna) */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Had Ambang "Sohor/Trending" (Views)
            </label>
            <p className="text-xs text-gray-500 mb-2">
              Artikel dengan views lebih tinggi dari nombor ini akan dapat ikon 🔥 api.
            </p>
            <input
              type="number"
              value={apiThreshold}
              onChange={(e) => setApiThreshold(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition"
            />
          </div>

          {/* Butang Simpan */}
          <div className="pt-4 border-t border-gray-100 flex justify-end">
            <button
              type="submit"
              disabled={loading}
              className="px-6 py-2 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 focus:ring-4 focus:ring-blue-200 transition disabled:opacity-70"
            >
              {loading ? 'Menyimpan...' : 'Simpan Perubahan'}
            </button>
          </div>

        </form>
      </div>
    </div>
  );
}