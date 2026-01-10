'use client';

import { useEffect, useState } from 'react';
import { createClient } from '@/lib/supabase-client';

export default function CommentsManager() {
  const [comments, setComments] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'pending' | 'approved'>('pending'); // Tab Filter

  const supabase = createClient();

  // --- 1. Tarik Komen dari DB ---
  const fetchComments = async () => {
    setLoading(true);
    // Kita tarik data komen DAN tajuk post berkaitan (Relasi Table)
    const { data, error } = await supabase
      .from('comments')
      .select(`
        *,
        posts (title) 
      `)
      .order('created_at', { ascending: false });

    if (data) setComments(data);
    setLoading(false);
  };

  useEffect(() => {
    fetchComments();
  }, []);

  // --- 2. Approve Komen ---
  const handleApprove = async (id: string) => {
    const { error } = await supabase
      .from('comments')
      .update({ is_approved: true })
      .eq('id', id);

    if (!error) {
      alert('Komen diluluskan! ✅');
      fetchComments(); // Refresh list
    }
  };

  // --- 3. Padam Komen ---
  const handleDelete = async (id: string) => {
    if (!confirm('Nak padam komen ni selamanya?')) return;

    const { error } = await supabase
      .from('comments')
      .delete()
      .eq('id', id);

    if (!error) {
      // Buang dari state terus (biar rasa laju)
      setComments(comments.filter((c) => c.id !== id));
    }
  };

  // Filter data ikut Tab (Pending / Approved)
  const filteredComments = comments.filter((c) => 
    filter === 'pending' ? !c.is_approved : c.is_approved
  );

  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-800 mb-6">Pengurusan Komen</h1>

      {/* --- TABS --- */}
      <div className="flex gap-4 border-b border-gray-200 mb-6">
        <button
          onClick={() => setFilter('pending')}
          className={`pb-2 px-4 text-sm font-bold transition ${
            filter === 'pending' 
              ? 'border-b-2 border-yellow-500 text-yellow-600' 
              : 'text-gray-400 hover:text-gray-600'
          }`}
        >
          Menunggu ({comments.filter(c => !c.is_approved).length})
        </button>
        <button
          onClick={() => setFilter('approved')}
          className={`pb-2 px-4 text-sm font-bold transition ${
            filter === 'approved' 
              ? 'border-b-2 border-green-500 text-green-600' 
              : 'text-gray-400 hover:text-gray-600'
          }`}
        >
          Diluluskan ({comments.filter(c => c.is_approved).length})
        </button>
      </div>

      {/* --- LIST KOMEN --- */}
      {loading ? (
        <div className="p-10 text-center text-gray-400 animate-pulse">Memuatkan komen...</div>
      ) : (
        <div className="space-y-4">
          
          {filteredComments.length === 0 && (
            <div className="p-8 text-center bg-gray-50 rounded-lg border border-gray-200 text-gray-500">
              Tiada komen dalam senarai ini. Aman damai. 🍃
            </div>
          )}

          {filteredComments.map((comment) => (
            <div key={comment.id} className="bg-white p-6 rounded-xl shadow-sm border border-gray-200 flex flex-col md:flex-row gap-4">
              
              {/* Info Pengomen */}
              <div className="md:w-1/4">
                <div className="flex items-center gap-2 mb-1">
                  <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 font-bold text-xs">
                    {comment.user_name.charAt(0).toUpperCase()}
                  </div>
                  <span className="font-bold text-gray-800 text-sm">{comment.user_name}</span>
                </div>
                <p className="text-xs text-gray-400 mb-2">{comment.user_email || 'Tiada Email'}</p>
                <p className="text-xs text-gray-400">
                  {new Date(comment.created_at).toLocaleDateString('ms-MY')}
                </p>
              </div>

              {/* Isi Komen */}
              <div className="md:w-2/4">
                <div className="mb-2">
                  <span className="text-xs font-bold text-gray-400 uppercase">Pada Artikel:</span>
                  <p className="text-sm font-semibold text-blue-600 truncate">
                    {comment.posts?.title || 'Artikel Telah Dipadam'}
                  </p>
                </div>
                <div className="p-3 bg-gray-50 rounded-lg text-sm text-gray-700 italic border border-gray-100">
                  "{comment.content}"
                </div>
              </div>

              {/* Butang Aksi */}
              <div className="md:w-1/4 flex flex-col justify-center gap-2">
                {!comment.is_approved && (
                  <button 
                    onClick={() => handleApprove(comment.id)}
                    className="w-full py-2 bg-green-50 text-green-600 hover:bg-green-100 rounded-lg text-sm font-bold border border-green-200 transition"
                  >
                    ✅ Luluskan
                  </button>
                )}
                
                <button 
                  onClick={() => handleDelete(comment.id)}
                  className="w-full py-2 bg-red-50 text-red-600 hover:bg-red-100 rounded-lg text-sm font-bold border border-red-200 transition"
                >
                  🗑️ Padam
                </button>
              </div>

            </div>
          ))}
        </div>
      )}
    </div>
  );
}