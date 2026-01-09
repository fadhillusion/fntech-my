'use client';

import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { useRouter } from 'next/navigation';

export default function SettingsPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  
  // State untuk nombor threshold
  const [orangeLimit, setOrangeLimit] = useState(50);
  const [redLimit, setRedLimit] = useState(100);

  // 1. Tarik Data Setting Semasa
  useEffect(() => {
    const fetchSettings = async () => {
      // Check Lesen Admin
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) { router.push('/login'); return; }

      // Tarik dari table 'settings'
      // Kita ambil row pertama je (id: 1) sebab setting ni global
      const { data, error } = await supabase
        .from('settings')
        .select('*')
        .limit(1)
        .single();

      if (data) {
        setOrangeLimit(data.fire_orange);
        setRedLimit(data.fire_red);
      }
      setLoading(false);
    };

    fetchSettings();
  }, [router]);

  // 2. Simpan Setting Baru
  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);

    // Kita update row yang mana ID dia wujud (biasanya ID 1)
    // Atau cara selamat: update semua row (sebab ada 1 je)
    const { error } = await supabase
      .from('settings')
      .update({ 
        fire_orange: orangeLimit, 
        fire_red: redLimit 
      })
      .gt('id', 0); // Update row yang wujud

    if (error) {
      alert('Gagal simpan: ' + error.message);
    } else {
      alert('Setting Berjaya Disimpan! ✅');
      router.push('/admin'); // Balik ke dashboard
    }
    setSaving(false);
  };

  if (loading) return <div className="p-10 text-center">Loading Settings...</div>;

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4">
      <div className="max-w-xl mx-auto bg-white p-8 rounded-xl shadow-lg">
        <h1 className="text-2xl font-bold text-gray-900 mb-2">Tetapan Logik Api 🔥</h1>
        <p className="text-gray-500 mb-8 text-sm">Ubah had jumlah pembaca untuk tukar warna api.</p>

        <form onSubmit={handleSave} className="space-y-6">
          
          {/* Setting Api Jingga */}
          <div className="bg-orange-50 p-4 rounded-lg border border-orange-100">
            <div className="flex items-center gap-2 mb-2">
              <span className="text-2xl">🟠</span>
              <label className="font-bold text-orange-800">Had Api Jingga (Sederhana)</label>
            </div>
            <p className="text-xs text-gray-600 mb-3">Jika pembaca capai nombor ini, api jadi Jingga.</p>
            <input 
              type="number" 
              value={orangeLimit} 
              onChange={(e) => setOrangeLimit(parseInt(e.target.value))}
              className="w-full p-3 border rounded-md font-bold text-lg"
            />
          </div>

          {/* Setting Api Merah */}
          <div className="bg-red-50 p-4 rounded-lg border border-red-100">
            <div className="flex items-center gap-2 mb-2">
              <span className="text-2xl">🔴</span>
              <label className="font-bold text-red-800">Had Api Merah (Panas!)</label>
            </div>
            <p className="text-xs text-gray-600 mb-3">Jika pembaca capai nombor ini, api jadi Merah menyala.</p>
            <input 
              type="number" 
              value={redLimit} 
              onChange={(e) => setRedLimit(parseInt(e.target.value))}
              className="w-full p-3 border rounded-md font-bold text-lg"
            />
          </div>

          <div className="flex justify-end gap-3 mt-6">
            <button type="button" onClick={() => router.back()} className="px-4 py-2 bg-gray-200 rounded text-gray-700">Batal</button>
            <button type="submit" disabled={saving} className="px-6 py-2 bg-blue-600 text-white rounded font-bold hover:bg-blue-700">
              {saving ? 'Menyimpan...' : 'Simpan Perubahan'}
            </button>
          </div>

        </form>
      </div>
    </div>
  );
}