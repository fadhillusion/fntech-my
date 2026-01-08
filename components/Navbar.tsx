import Link from 'next/link';

export default function Navbar() {
  return (
    <nav className="bg-white border-b border-gray-200 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex items-center">
            {/* Logo / Nama Blog */}
            <Link href="/" className="text-2xl font-bold text-blue-600">
              FNDigital<span className="text-gray-900">.my</span>
            </Link>
          </div>
          <div className="flex items-center space-x-4">
            <Link href="/" className="text-gray-600 hover:text-blue-600 font-medium">
              Home
            </Link>
            <Link href="#" className="text-gray-600 hover:text-blue-600 font-medium">
              About
            </Link>
          </div>
        </div>
      </div>
    </nav>
  );
}