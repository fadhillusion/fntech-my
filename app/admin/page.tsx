import Link from 'next/link';

export default function AdminDashboard() {
  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="mx-auto max-w-4xl">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">Dashboard Admin</h1>
        
        <div className="grid gap-6 md:grid-cols-2">
          {/* Kad Menu 1: Tulis Artikel */}
          <Link href="/admin/create" className="block p-6 bg-white rounded-xl shadow-md hover:shadow-lg transition border-l-4 border-blue-600">
            <h2 className="text-xl font-bold text-gray-800 mb-2">+ Tulis Artikel Baru</h2>
            <p className="text-gray-600">Karang content baru untuk blog.</p>
          </Link>

          {/* Kad Menu 2: Balik Home */}
          <Link href="/" className="block p-6 bg-white rounded-xl shadow-md hover:shadow-lg transition border-l-4 border-green-600">
            <h2 className="text-xl font-bold text-gray-800 mb-2">Lihat Website</h2>
            <p className="text-gray-600">Tengok hasil kerja di fndigital.my</p>
          </Link>
        </div>
      </div>
    </div>
  );
}