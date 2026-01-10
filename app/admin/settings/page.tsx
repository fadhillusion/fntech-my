'use client';

import React, { useState, useEffect } from 'react';
// Menggunakan import standard Next.js
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
// Menukar kepada laluan relatif untuk mengelakkan ralat resolusi alias @/
import { createClient } from '../../../lib/supabase-client';

/**
 * --- KOMPONEN FANCYMODAL (INLINED) ---
 */
interface FancyModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm?: () => void;
  title: string;
  description: string;
  type?: "danger" | "success" | "info" | "warning";
  confirmText?: string;
  isLoading?: boolean;
}

const FancyModal: React.FC<FancyModalProps> = ({
  isOpen,
  onClose,
  onConfirm,
  title,
  description,
  type = "info",
  confirmText = "Teruskan",
  isLoading = false,
}) => {
  if (!isOpen) return null;

  const styles = {
    danger: { bgIcon: "bg-red-100", textIcon: "text-red-600", btnColor: "bg-red-600 hover:bg-red-700", iconPath: "M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" },
    success: { bgIcon: "bg-green-100", textIcon: "text-green-600", btnColor: "bg-green-600 hover:bg-green-700", iconPath: "M5 13l4 4L19 7" },
    info: { bgIcon: "bg-blue-100", textIcon: "text-blue-600", btnColor: "bg-blue-600 hover:bg-blue-700", iconPath: "M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" },
    warning: { bgIcon: "bg-yellow-100", textIcon: "text-yellow-600", btnColor: "bg-yellow-500 hover:bg-yellow-600", iconPath: "M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" }
  };

  const currentStyle = styles[type];

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200 font-sans">
      <div className="relative bg-white rounded-2xl shadow-2xl max-w-sm w-full p-6 animate-in zoom-in-95 duration-200 border border-zinc-100">
        <div className={`flex items-center justify-center w-12 h-12 mx-auto rounded-full mb-4 ${currentStyle.bgIcon}`}>
          <svg className={`w-6 h-6 ${currentStyle.textIcon}`} fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2">
            <path strokeLinecap="round" strokeLinejoin="round" d={currentStyle.iconPath} />
          </svg>
        </div>
        <div className="text-center mb-6">
          <h3 className="text-xl font-bold text-gray-900 mb-2">{title}</h3>
          <p className="text-sm text-gray-500 leading-relaxed">{description}</p>
        </div>
        <div className="flex gap-3">
          <button onClick={onClose} disabled={isLoading} className="flex-1 px-4 py-2.5 text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-xl transition-colors">
            {onConfirm ? "Batal" : "Tutup"}
          </button>
          {onConfirm && (
            <button onClick={onConfirm} disabled={isLoading} className={`flex-1 px-4 py-2.5 text-sm font-medium text-white rounded-xl shadow-lg transition-all flex justify-center items-center gap-2 ${currentStyle.btnColor}`}>
              {isLoading ? <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : confirmText}
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

/**
 * --- UTAMA: App Component ---
 */
export default function App() {
  const router = useRouter();
  const supabase = createClient();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [activeTab, setActiveTab] = useState<'system' | 'profile' | 'team' | 'levels'>('system');

  // --- DATA STATES ---
  const [user, setUser] = useState<any>(null);
  const [profileName, setProfileName] = useState('');
  const [settings, setSettings] = useState({
    site_title: 'FNDigital.my',
    fire_gray: 50,
    fire_orange: 500,
    fire_red: 1000,
  });

  const [levels, setLevels] = useState<any[]>([]);
  const [teamMembers, setTeamMembers] = useState<any[]>([]);
  const [newMember, setNewMember] = useState({ email: '', password: '', name: '', role: 'editor' });
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [selectedUserId, setSelectedUserId] = useState<string | null>(null);

  // 1. Ambil data dengan pengiraan statistik
  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      try {
        const { data: authData } = await supabase.auth.getUser();
        const authUser = authData?.user;
        
        if (authUser) {
          setUser(authUser);
          const { data: profile } = await supabase.from('profiles').select('full_name').eq('id', authUser.id).single();
          setProfileName(profile?.full_name || authUser.email?.split('@')[0] || 'Admin');
        }

        // Ambil tetapan sistem & levels
        const { data: settingData } = await supabase.from('settings').select('*').eq('id', 1).single();
        let currentLevels: any[] = [];
        if (settingData) {
          setSettings({
            site_title: settingData.site_title || 'FNDigital.my',
            fire_gray: settingData.fire_gray || 50,
            fire_orange: settingData.fire_orange || 500,
            fire_red: settingData.fire_red || 1000,
          });
          currentLevels = settingData.commission_levels || [];
          setLevels(currentLevels);
        }

        // Ambil ahli pasukan
        const { data: members } = await supabase.from('users_view').select('*');
        
        // Ambil data post untuk pengiraan statistik
        const { data: allPosts } = await supabase
          .from('posts')
          .select('user_id, views, is_published')
          .eq('is_published', true);

        if (members) {
          const enrichedMembers = members.map((m: any) => {
            const userPosts = (allPosts || []).filter(p => p.user_id === m.id);
            const totalPosts = userPosts.length;
            const totalViews = userPosts.reduce((acc, curr) => acc + (curr.views || 0), 0);
            
            // Cari level semasa editor berdasarkan totalPosts
            let userLevel = currentLevels[0] || { label: 'Asas', rate_post: 0, rate_view: 0, min_posts: 0 };
            const sortedLevels = [...currentLevels].sort((a, b) => b.min_posts - a.min_posts);
            for (const lvl of sortedLevels) {
              if (totalPosts >= lvl.min_posts) {
                userLevel = lvl;
                break;
              }
            }

            // Pengiraan komisen (RM / Post + RM / 1k Views)
            const commission = (totalPosts * (userLevel.rate_post || 0)) + ((totalViews / 1000) * (userLevel.rate_view || 0));

            return {
              ...m,
              postCount: totalPosts,
              viewCount: totalViews,
              commission: commission.toFixed(2),
              levelLabel: userLevel.label
            };
          });
          setTeamMembers(enrichedMembers);
        }

      } catch (error) {
        console.error('Ralat memuatkan data:', error);
        toast.error('Gagal memuatkan data statistik.');
      } finally {
        setLoading(false);
      }
    };
    loadData();
  }, [supabase]);

  // 2. Fungsi simpan tetapan
  const handleUpdateSettings = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    const toastId = toast.loading('Menyimpan tetapan sistem...');
    try {
      const { error } = await supabase.from('settings').upsert({ 
        id: 1, 
        ...settings, 
        commission_levels: levels,
        updated_at: new Date().toISOString()
      });
      if (error) throw error;
      toast.success('Tetapan berjaya disimpan! ✅', { id: toastId });
    } catch (error: any) {
      toast.error('Ralat simpan: ' + error.message, { id: toastId });
    } finally {
      setSaving(false);
    }
  };

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    const toastId = toast.loading('Mengemaskini profil...');
    try {
      const { error } = await supabase.from('profiles').upsert({ 
        id: user.id, 
        full_name: profileName, 
        updated_at: new Date().toISOString() 
      });
      if (error) throw error;
      toast.success('Profil dikemaskini! 👤', { id: toastId });
    } catch (error: any) {
      toast.error('Ralat profil: ' + error.message, { id: toastId });
    } finally {
      setSaving(false);
    }
  };

  const handleAddMember = async (e: React.FormEvent) => {
    e.preventDefault();
    if (newMember.password.length < 6) { 
      toast.warning('Katalaluan mesti sekurang-kurangnya 6 aksara.'); 
      return; 
    }
    setSaving(true);
    const toastId = toast.loading('Menambah ahli...');
    try {
      const { error } = await supabase.rpc('create_new_user', {
        email: newMember.email, 
        password: newMember.password, 
        full_name: newMember.name, 
        role_input: newMember.role
      });
      if (error) throw error;
      toast.success('Ahli pasukan berjaya ditambah! 👥', { id: toastId });
      setNewMember({ email: '', password: '', name: '', role: 'editor' });
      // Refresh page to show updated team with stats
      window.location.reload();
    } catch (error: any) { 
      toast.error('Ralat tambah ahli: ' + error.message, { id: toastId }); 
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteMember = async () => {
    if (!selectedUserId) return;
    setSaving(true);
    const toastId = toast.loading('Memadam akses...');
    try {
      const { error } = await supabase.rpc('delete_user', { user_id: selectedUserId });
      if (error) throw error;
      setTeamMembers(teamMembers.filter(m => m.id !== selectedUserId));
      setShowDeleteModal(false);
      toast.success('Akses pengguna dipadamkan.', { id: toastId });
    } catch (error: any) { 
      toast.error('Ralat padam: ' + error.message, { id: toastId }); 
    } finally {
      setSaving(false);
    }
  };

  const updateLevel = (index: number, field: string, value: any) => {
    const newLevels = [...levels];
    const safeValue = (field !== 'label' && (value === '' || isNaN(value))) ? 0 : value;
    newLevels[index] = { ...newLevels[index], [field]: safeValue };
    setLevels(newLevels);
  };

  if (loading) return (
    <div className="flex items-center justify-center min-h-screen bg-white">
      <div className="flex flex-col items-center gap-3 text-gray-500 font-bold">
        <div className="w-10 h-10 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
        <p className="animate-pulse">Mengira Statistik Pasukan...</p>
      </div>
    </div>
  );

  return (
    <div className="max-w-6xl mx-auto pb-20 p-4 min-h-screen bg-zinc-50/20 font-sans">
      
      <div className="mb-10">
        <h1 className="text-4xl font-black text-gray-900 tracking-tight mb-2 uppercase italic">Pentadbiran Sistem</h1>
        <p className="text-gray-500 font-medium">Pantau prestasi ahli pasukan dan urus tetapan ganjaran editor.</p>
      </div>

      {/* Navigasi Tab */}
      <div className="flex gap-1 border-b border-gray-200 mb-8 overflow-x-auto pb-1 no-scrollbar">
        {[
          { id: 'system', label: '⚙️ Portal' },
          { id: 'profile', label: '👤 Profil' },
          { id: 'team', label: '👥 Pasukan & Statistik' },
          { id: 'levels', label: '🏆 Prestasi Editor' },
        ].map((tab) => (
          <button 
            key={tab.id}
            onClick={() => setActiveTab(tab.id as any)}
            className={`px-6 py-3 text-sm font-bold transition-all whitespace-nowrap rounded-t-2xl ${
              activeTab === tab.id 
                ? 'bg-white border-x border-t border-gray-200 text-blue-600 shadow-sm' 
                : 'text-gray-400 hover:text-gray-700 hover:bg-gray-100/50'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* --- TAB 1: PORTAL --- */}
      {activeTab === 'system' && (
        <form onSubmit={handleUpdateSettings} className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
          <div className="bg-white p-8 rounded-3xl border border-gray-200 shadow-sm">
            <h3 className="text-xl font-bold text-gray-800 mb-6 flex items-center gap-2 uppercase tracking-tight">
              <span className="p-2 bg-blue-50 rounded-xl">🌐</span> Identiti Portal
            </h3>
            <div className="max-w-md">
              <label className="block text-xs font-bold text-gray-400 uppercase tracking-widest mb-2">Nama Laman Web</label>
              <input 
                type="text" 
                value={settings.site_title} 
                onChange={(e) => setSettings({ ...settings, site_title: e.target.value })} 
                className="w-full p-4 border border-gray-200 rounded-2xl focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 outline-none transition-all font-semibold text-gray-800" 
              />
            </div>
          </div>

          <div className="bg-white p-8 rounded-3xl border border-gray-200 shadow-sm">
            <h3 className="text-xl font-bold text-gray-800 mb-2 flex items-center gap-2 uppercase tracking-tight">
              <span className="p-2 bg-orange-50 rounded-xl">🔥</span> Logik Artikel Tular
            </h3>
            <p className="text-sm text-gray-400 mb-8 tracking-tight">Tetapkan jumlah tontonan bagi perubahan warna ikon status tular.</p>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {[
                { label: 'Level 1 (Biasa)', field: 'fire_gray' },
                { label: 'Level 2 (Hangat)', field: 'fire_orange' },
                { label: 'Level 3 (Meletup!)', field: 'fire_red' }
              ].map((item) => (
                <div key={item.field} className="p-6 bg-zinc-50 rounded-3xl border border-gray-100">
                  <span className="font-bold text-gray-500 block mb-3 text-xs uppercase tracking-widest">{item.label}</span>
                  <input 
                    type="number" 
                    value={(settings as any)[item.field]} 
                    onChange={(e) => setSettings({ ...settings, [item.field]: parseInt(e.target.value) || 0 })} 
                    className="w-full p-3 border border-gray-200 rounded-xl font-black text-2xl text-gray-800 bg-white" 
                  />
                </div>
              ))}
            </div>
          </div>
          <div className="flex justify-end pt-4">
            <button type="submit" disabled={saving} className="bg-gray-900 text-white px-10 py-4 rounded-2xl font-bold shadow-xl hover:bg-black transition-all disabled:opacity-50">
              {saving ? 'Menyimpan...' : 'Simpan Konfigurasi'}
            </button>
          </div>
        </form>
      )}

      {/* --- TAB 2: PROFILE --- */}
      {activeTab === 'profile' && (
        <form onSubmit={handleUpdateProfile} className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
          <div className="bg-white p-10 rounded-[3rem] border border-gray-200 shadow-sm flex flex-col lg:flex-row gap-12 items-center">
            <div className="relative group">
              <div className="w-48 h-48 bg-gradient-to-br from-blue-600 to-indigo-700 rounded-full flex items-center justify-center text-6xl text-white font-black shadow-2xl border-8 border-white transition-transform group-hover:scale-105 duration-500 uppercase">
                {profileName.charAt(0)}
              </div>
            </div>
            
            <div className="flex-1 w-full space-y-8">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div>
                  <label className="block text-xs font-bold text-gray-400 uppercase tracking-widest mb-3">Nama Paparan Penulis</label>
                  <input type="text" value={profileName} onChange={(e) => setProfileName(e.target.value)} className="w-full p-4 border border-gray-200 rounded-2xl outline-none text-xl font-bold text-gray-800 focus:ring-4 focus:ring-blue-500/10 transition-all" />
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-400 uppercase tracking-widest mb-3">Email Akaun</label>
                  <input type="text" value={user?.email || ''} disabled className="w-full p-4 border border-gray-100 bg-zinc-50 rounded-2xl text-gray-400 cursor-not-allowed font-mono text-sm" />
                </div>
              </div>
              <button type="submit" disabled={saving} className="bg-blue-600 text-white px-12 py-4 rounded-2xl font-bold shadow-xl hover:bg-blue-700 transition-all">
                {saving ? 'Mengemaskini...' : 'Simpan Profil'}
              </button>
            </div>
          </div>
        </form>
      )}

      {/* --- TAB 3: TEAM MANAGEMENT & STATS --- */}
      {activeTab === 'team' && (
        <div className="space-y-10 animate-in fade-in slide-in-from-bottom-4 duration-500">
          <div className="bg-white p-8 rounded-[2.5rem] border border-gray-200 shadow-sm">
            <h3 className="text-xl font-bold text-gray-800 mb-8 flex items-center gap-3">
              <span className="p-3 bg-zinc-100 rounded-2xl">👥</span> Daftar Ahli Team Baru
            </h3>
            <form onSubmit={handleAddMember} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 items-end">
              <div>
                <label className="block text-xs font-bold text-gray-400 mb-2 uppercase tracking-widest">Nama Penuh</label>
                <input required type="text" value={newMember.name} onChange={e => setNewMember({...newMember, name: e.target.value})} className="w-full p-3.5 border border-gray-200 rounded-2xl focus:ring-2 focus:ring-blue-500/20 outline-none transition-all font-bold text-gray-800" />
              </div>
              <div>
                <label className="block text-xs font-bold text-gray-400 mb-2 uppercase tracking-widest">Email Kerja</label>
                <input required type="email" value={newMember.email} onChange={e => setNewMember({...newMember, email: e.target.value})} className="w-full p-3.5 border border-gray-200 rounded-2xl focus:ring-2 focus:ring-blue-500/20 outline-none transition-all font-bold text-gray-800" />
              </div>
              <div>
                <label className="block text-xs font-bold text-gray-400 mb-2 uppercase tracking-widest">Akses</label>
                <select value={newMember.role} onChange={e => setNewMember({...newMember, role: e.target.value})} className="w-full p-3.5 border border-gray-200 rounded-2xl bg-white text-sm font-black focus:ring-2 focus:ring-blue-500/20 transition-all">
                  <option value="editor">Editor (Penulis)</option>
                  <option value="admin">Admin (Pentadbir)</option>
                </select>
              </div>
              <div>
                <label className="block text-xs font-bold text-gray-400 mb-2 uppercase tracking-widest">Katalaluan</label>
                <input required type="text" value={newMember.password} onChange={e => setNewMember({...newMember, password: e.target.value})} className="w-full p-3.5 border border-gray-200 rounded-2xl focus:ring-2 focus:ring-blue-500/20 transition-all font-bold text-gray-800" />
              </div>
              <div className="lg:col-span-4 flex justify-end">
                <button type="submit" disabled={saving} className="bg-blue-600 text-white px-10 py-4 rounded-2xl font-black uppercase tracking-widest text-xs shadow-lg hover:bg-blue-700 transition-all active:scale-95 flex items-center gap-2">
                  {saving ? 'Sedang Proses...' : '➕ Tambah Ahli'}
                </button>
              </div>
            </form>
          </div>

          <div className="bg-white rounded-[2.5rem] border border-gray-200 shadow-sm overflow-hidden">
            <div className="bg-zinc-50/50 px-8 py-6 border-b border-gray-100 font-black text-gray-500 uppercase text-[10px] tracking-[0.3em]">
              Kakitangan Berdaftar & Prestasi
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm border-collapse min-w-[1000px]">
                <thead className="bg-zinc-25 text-gray-400 uppercase text-[10px] font-black">
                  <tr>
                    <th className="px-8 py-5">Nama Ahli</th>
                    <th className="px-4 py-5 text-center">Taraf</th>
                    <th className="px-4 py-5 text-center">Pangkat</th>
                    <th className="px-4 py-5 text-center">Post Published</th>
                    <th className="px-4 py-5 text-center">Total Klik</th>
                    <th className="px-4 py-5 text-center">Anggaran Komisen</th>
                    <th className="px-8 py-5 text-right">Aksi</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {teamMembers.map((m) => (
                    <tr key={m.id} className="hover:bg-zinc-50/50 transition-colors group">
                      <td className="px-8 py-6">
                        <div className="flex items-center gap-4">
                          <div className="w-12 h-12 rounded-2xl bg-blue-100 text-blue-600 flex items-center justify-center font-black text-lg uppercase shadow-sm">
                            {m.full_name?.charAt(0)}
                          </div>
                          <div>
                            <div className="font-bold text-gray-900 text-base leading-none mb-1">{m.full_name}</div>
                            <div className="text-[10px] text-gray-400 font-mono tracking-tighter italic">{m.email}</div>
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-6 text-center">
                        <span className={`px-4 py-1.5 rounded-full text-[10px] font-black border tracking-widest uppercase ${
                          m.role === 'admin' 
                            ? 'bg-purple-100 text-purple-700 border-purple-200 shadow-sm' 
                            : 'bg-blue-50 text-blue-700 border-blue-100 shadow-sm'
                        }`}>
                          {m.role}
                        </span>
                      </td>
                      <td className="px-4 py-6 text-center font-black text-gray-600 text-xs uppercase tracking-tight">
                        {m.levelLabel}
                      </td>
                      <td className="px-4 py-6 text-center font-bold text-gray-900 text-base">
                        {m.postCount || 0}
                      </td>
                      <td className="px-4 py-6 text-center font-bold text-gray-900 text-base">
                        {(m.viewCount || 0).toLocaleString()}
                      </td>
                      <td className="px-4 py-6 text-center">
                        <div className="bg-emerald-50 text-emerald-700 px-4 py-2 rounded-xl font-black text-xs border border-emerald-100 shadow-sm inline-block">
                          RM {m.commission || "0.00"}
                        </div>
                      </td>
                      <td className="px-8 py-6 text-right">
                        {m.id !== user?.id ? (
                          <button 
                            onClick={() => { setSelectedUserId(m.id); setShowDeleteModal(true); }} 
                            className="text-red-500 hover:text-red-700 font-black text-[10px] uppercase tracking-widest px-5 py-2 rounded-xl hover:bg-red-50 transition-all border border-transparent hover:border-red-100"
                          >
                            Padam Akses
                          </button>
                        ) : (
                          <span className="text-[10px] text-green-600 font-black tracking-widest bg-green-50 px-5 py-2 rounded-xl border border-green-100 uppercase">Akaun Ini</span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <div className="bg-gray-50 p-4 border-t border-gray-100 text-[10px] text-gray-400 font-medium text-center uppercase tracking-[0.2em]">
              * Anggaran komisen berdasarkan kadar ganjaran tahap semasa editor.
            </div>
          </div>
        </div>
      )}

      {/* --- TAB 4: LEVELS (10 TAHAP) --- */}
      {activeTab === 'levels' && (
        <form onSubmit={handleUpdateSettings} className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
          <div className="bg-white p-8 rounded-3xl border border-gray-200 shadow-sm overflow-hidden">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-10 gap-6">
              <div>
                <h3 className="text-2xl font-black text-gray-800 tracking-tight italic uppercase">🏆 Skim Komisen 10 Tahap</h3>
                <p className="text-sm text-gray-500 mt-1 tracking-tight font-medium">Uruskan syarat pangkat automatik dan ganjaran prestasi editor.</p>
              </div>
              <button type="submit" disabled={saving} className="bg-green-600 text-white px-10 py-4 rounded-2xl font-black uppercase tracking-widest text-xs shadow-xl hover:bg-green-700 transition-all flex items-center gap-2 active:scale-95">
                {saving ? 'Menyimpan...' : '🚀 Kemaskini Skim'}
              </button>
            </div>
            
            <div className="overflow-x-auto -mx-8">
              <table className="w-full text-sm text-left border-collapse min-w-[800px]">
                <thead className="bg-zinc-50/50 text-gray-400 border-y border-gray-100 uppercase text-[10px] font-black tracking-widest">
                  <tr>
                    <th className="px-8 py-5 text-center">No</th>
                    <th className="px-8 py-5">Nama Pangkat / Badge</th>
                    <th className="px-8 py-5 text-center">Syarat (Min Post)</th>
                    <th className="px-8 py-5 text-center">Bayaran / Post</th>
                    <th className="px-8 py-5 text-center">CPM / 1k View</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50 font-sans">
                  {levels.length > 0 ? levels.map((lvl, idx) => (
                    <tr key={idx} className="hover:bg-blue-50/30 transition-colors group">
                      <td className="px-8 py-5 text-center font-black text-gray-300 italic text-2xl group-hover:text-blue-200 transition-colors">#{lvl.level}</td>
                      <td className="px-8 py-5">
                        <input 
                          type="text" 
                          value={lvl.label} 
                          onChange={(e) => updateLevel(idx, 'label', e.target.value)} 
                          className="w-full bg-transparent border-b border-transparent focus:border-blue-500 focus:outline-none font-black text-blue-600 text-lg placeholder-gray-300 transition-all" 
                        />
                      </td>
                      <td className="px-8 py-5 text-center">
                        <input type="number" value={lvl.min_posts} onChange={(e) => updateLevel(idx, 'min_posts', parseInt(e.target.value))} className="w-24 text-center bg-zinc-100 rounded-xl p-2.5 border border-gray-200 font-black text-gray-800 focus:bg-white transition-all shadow-sm" />
                      </td>
                      <td className="px-8 py-5 text-center font-mono font-bold">
                        <div className="flex items-center justify-center gap-1 bg-white border border-gray-200 rounded-xl p-2 shadow-sm">
                          <span className="text-xs text-gray-400 font-sans uppercase tracking-tighter">RM</span>
                          <input type="number" step="0.10" value={lvl.rate_post} onChange={(e) => updateLevel(idx, 'rate_post', parseFloat(e.target.value))} className="w-16 text-center focus:outline-none" />
                        </div>
                      </td>
                      <td className="px-8 py-5 text-center font-mono font-bold">
                        <div className="flex items-center justify-center gap-1 bg-white border border-gray-200 rounded-xl p-2 shadow-sm">
                          <span className="text-xs text-gray-400 font-sans uppercase tracking-tighter">RM</span>
                          <input type="number" step="0.10" value={lvl.rate_view} onChange={(e) => updateLevel(idx, 'rate_view', parseFloat(e.target.value))} className="w-16 text-center focus:outline-none" />
                        </div>
                      </td>
                    </tr>
                  )) : (
                    <tr>
                      <td colSpan={5} className="p-10 text-center text-gray-400 font-medium italic font-sans uppercase tracking-widest text-xs">
                        Sila kemaskini database untuk melihat tahap komisen.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </form>
      )}

      {/* Modal Padam */}
      <FancyModal 
        isOpen={showDeleteModal} 
        onClose={() => setShowDeleteModal(false)} 
        onConfirm={handleDeleteMember} 
        title="Tarik Balik Akses?" 
        description="Akses pengguna ini akan dibatalkan serta-merta. Pengguna tidak lagi dapat menguruskan kandungan portal." 
        type="danger" 
        confirmText="Padam Sekarang" 
        isLoading={saving}
      />
    </div>
  );
}