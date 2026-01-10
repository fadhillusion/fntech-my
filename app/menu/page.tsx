'use client';

import { useState, useEffect } from 'react';
import { createClient } from '@/lib/supabase-client'; // Guna client yang kita dah fix tadi
import Link from 'next/link';

export default function MenuPage() {
  const [menus, setMenus] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  
  // State untuk Form
  const [label, setLabel] = useState('');
  const [url, setUrl] = useState('');
  const [sortOrder, setSortOrder] = useState('0');

  const supabase = createClient();

  // 1. Tarik Data Menu
  const fetchMenus = async () => {
    const { data } = await supabase
      .from('menus')
      .select('*')
      .order('sort_order', { ascending: true });
    
    if (data) setMenus(data);
    setLoading(false);
  };

  useEffect(() => {
    fetchMenus();
  }, []);

  // 2. Fungsi Tambah Menu
  const handleAddMenu = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!label || !url) return alert('Sila isi Label dan URL!');

    const { error } = await supabase.from('menus').insert({
      label,
      url,
      sort_order: parseInt(sortOrder)
    });

    if (error) {
      alert('Error: ' + error.message);
    } else {
      // Reset Form & Refresh Table
      setLabel('');
      setUrl('');
      setSortOrder(prev => (parseInt(prev) + 1).toString()); // Auto naikkan nombor
      fetchMenus();
    }
  };

  // 3. Fungsi Padam Menu
  const handleDelete = async (id: string) => {
    if (!confirm('Nak buang menu ni?')) return;
    
    const { error } = await supabase.from('menus').delete().eq('id', id);
    if (!error) fetchMenus();
  };

  return (
    <div className="max-w-4xl mx-auto">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-800">Pengurusan Menu (Navbar)</h1>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* --- KIRI: FORM TAMBAH (Macam WordPress) --- */}
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200 h-fit">
          <h3 className="font-bold text-gray-700 mb-4 border-b pb-2">Tambah Item Baru</h3>
          <form onSubmit={handleAddMenu} className="space-y-4">
            
            <div>
              <label className="block text-sm font-medium text-gray-600 mb-1">Nama Menu</label>
              <input 
                type="text" 
                placeholder="Contoh: Hubungi Kami"
                className="w-full px-3 py-2 border rounded-lg focus:ring-blue-500 focus:border-blue-500 text-sm"
                value={label}
                onChange={(e) => setLabel(e.target.value)}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-600 mb-1">Link URL</label>
              <input 
                type="text" 
                placeholder="Contoh: /contact atau https://google.com"
                className="w-full px-3 py-2 border rounded-lg focus:ring-blue-500 focus:border-blue-500 text-sm"
                value={url}
                onChange={(e) => setUrl(e.target.value)}
              />
              <p className="text-xs text-gray-400 mt-1">Gunakan '/' untuk link dalaman.</p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-600 mb-1">Urutan</label>
              <input 
                type="number" 
                className="w-20 px-3 py-2 border rounded-lg focus:ring-blue-500 focus:border-blue-500 text-sm"
                value={sortOrder}
                onChange={(e) => setSortOrder(e.target.value)}
              />
            </div>

            <button type="submit" className="w-full py-2 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 transition text-sm">
              + Tambah Menu
            </button>
          </form>
        </div>

        {/* --- KANAN: SENARAI MENU --- */}
        <div className="lg:col-span-2 bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
          <table className="w-full text-left">
            <thead className="bg-gray-50 border-b">
              <tr>
                <th className="px-6 py-3 text-xs font-bold text-gray-500 uppercase">Urutan</th>
                <th className="px-6 py-3 text-xs font-bold text-gray-500 uppercase">Label</th>
                <th className="px-6 py-3 text-xs font-bold text-gray-500 uppercase">URL</th>
                <th className="px-6 py-3 text-right text-xs font-bold text-gray-500 uppercase">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {menus.map((menu) => (
                <tr key={menu.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 text-gray-500 font-mono text-sm">{menu.sort_order}</td>
                  <td className="px-6 py-4 font-medium text-gray-900">{menu.label}</td>
                  <td className="px-6 py-4 text-blue-600 text-sm">{menu.url}</td>
                  <td className="px-6 py-4 text-right">
                    <button 
                      onClick={() => handleDelete(menu.id)}
                      className="text-red-500 hover:text-red-700 text-sm font-medium"
                    >
                      Padam
                    </button>
                  </td>
                </tr>
              ))}
              {menus.length === 0 && (
                <tr>
                  <td colSpan={4} className="p-8 text-center text-gray-400">Belum ada menu. Tambah satu kat sebelah kiri! 👉</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

      </div>
    </div>
  );
}