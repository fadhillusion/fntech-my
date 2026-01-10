"use client";

interface FancyModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm?: () => void; // Kalau takde function ni, dia jadi alert biasa (bukan confirm)
  title: string;
  description: string;
  type?: "danger" | "success" | "info" | "warning"; // Pilihan jenis popup
  confirmText?: string;
  isLoading?: boolean;
}

export default function FancyModal({
  isOpen,
  onClose,
  onConfirm,
  title,
  description,
  type = "info", // Default warna biru
  confirmText = "Teruskan",
  isLoading = false,
}: FancyModalProps) {
  if (!isOpen) return null;

  // Konfigurasi Warna & Ikon ikut Type
  const styles = {
    danger: {
      bgIcon: "bg-red-100",
      textIcon: "text-red-600",
      btnColor: "bg-red-600 hover:bg-red-700",
      ring: "focus:ring-red-500",
      iconPath: "M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" // Segitiga Amaran
    },
    success: {
      bgIcon: "bg-green-100",
      textIcon: "text-green-600",
      btnColor: "bg-green-600 hover:bg-green-700",
      ring: "focus:ring-green-500",
      iconPath: "M5 13l4 4L19 7" // Tanda Right / Check
    },
    info: {
      bgIcon: "bg-blue-100",
      textIcon: "text-blue-600",
      btnColor: "bg-blue-600 hover:bg-blue-700",
      ring: "focus:ring-blue-500",
      iconPath: "M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" // Huruf 'i'
    },
    warning: {
      bgIcon: "bg-yellow-100",
      textIcon: "text-yellow-600",
      btnColor: "bg-yellow-500 hover:bg-yellow-600",
      ring: "focus:ring-yellow-400",
      iconPath: "M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" // Tanda seru bulat
    }
  };

  const currentStyle = styles[type];

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm transition-opacity animate-in fade-in duration-200">
      <div className="relative bg-white dark:bg-zinc-900 rounded-2xl shadow-2xl max-w-sm w-full p-6 transform transition-all scale-100 animate-in zoom-in-95 duration-200 border border-zinc-100 dark:border-zinc-800">
        
        {/* Ikon */}
        <div className={`flex items-center justify-center w-12 h-12 mx-auto rounded-full mb-4 ${currentStyle.bgIcon}`}>
          <svg className={`w-6 h-6 ${currentStyle.textIcon}`} fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2">
            <path strokeLinecap="round" strokeLinejoin="round" d={currentStyle.iconPath} />
          </svg>
        </div>

        {/* Text */}
        <div className="text-center mb-6">
          <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">{title}</h3>
          <p className="text-sm text-gray-500 dark:text-gray-400 leading-relaxed">{description}</p>
        </div>

        {/* Buttons */}
        <div className="flex gap-3">
          {/* Butang Batal (Sentiasa ada) */}
          <button
            onClick={onClose}
            disabled={isLoading}
            className="flex-1 px-4 py-2.5 text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-xl transition-colors dark:bg-zinc-800 dark:text-gray-300 dark:hover:bg-zinc-700"
          >
            {onConfirm ? "Batal" : "Tutup"}
          </button>
          
          {/* Butang Confirm (Hanya muncul jika ada onConfirm action) */}
          {onConfirm && (
            <button
              onClick={onConfirm}
              disabled={isLoading}
              className={`flex-1 px-4 py-2.5 text-sm font-medium text-white rounded-xl shadow-lg shadow-gray-200/50 dark:shadow-none transition-all flex justify-center items-center gap-2 ${currentStyle.btnColor} ${currentStyle.ring}`}
            >
              {isLoading ? (
                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                confirmText
              )}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}