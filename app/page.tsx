'use client';

import { useRouter } from 'next/navigation';

export default function Home() {
  const router = useRouter();

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-900 via-purple-900 to-gray-900 flex items-center justify-center p-8">
      <div className="max-w-4xl w-full">
        {/* Title */}
        <div className="text-center mb-16">
          <div className="text-8xl mb-4">⚔️</div>
          <h1 className="text-6xl font-bold text-white mb-4">
            Trò Chơi Thẻ Bài
          </h1>
          <p className="text-2xl text-gray-300">Đấu trường chiến thuật!</p>
        </div>

        {/* Menu Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-12">
          {/* Multiplayer */}
          <button
            onClick={() => router.push('/multiplayer')}
            className="bg-gradient-to-br from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 
              text-white p-8 rounded-2xl shadow-2xl transform transition-all hover:scale-105"
          >
            <div className="text-6xl mb-4">🎮</div>
            <h2 className="text-3xl font-bold mb-2">Chơi Multiplayer</h2>
            <p className="text-lg text-blue-100">Tham gia phòng và chiến đấu!</p>
          </button>

          {/* Leaderboard */}
          <button
            onClick={() => router.push('/leaderboard')}
            className="bg-gradient-to-br from-yellow-600 to-orange-600 hover:from-yellow-700 hover:to-orange-700 
              text-white p-8 rounded-2xl shadow-2xl transform transition-all hover:scale-105"
          >
            <div className="text-6xl mb-4">🏆</div>
            <h2 className="text-3xl font-bold mb-2">Bảng Xếp Hạng</h2>
            <p className="text-lg text-yellow-100">Xem top cao thủ!</p>
          </button>

          {/* Admin */}
          <button
            onClick={() => router.push('/admin')}
            className="bg-gradient-to-br from-red-600 to-pink-600 hover:from-red-700 hover:to-pink-700 
              text-white p-8 rounded-2xl shadow-2xl transform transition-all hover:scale-105"
          >
            <div className="text-6xl mb-4">⚙️</div>
            <h2 className="text-3xl font-bold mb-2">Quản Trị</h2>
            <p className="text-lg text-red-100">Quản lý phòng và cấu hình</p>
          </button>

          {/* How to Play */}
          <div className="bg-gradient-to-br from-gray-700 to-gray-800 text-white p-8 rounded-2xl shadow-2xl border-2 border-gray-600">
            <div className="text-6xl mb-4">📖</div>
            <h2 className="text-3xl font-bold mb-2">Cách Chơi</h2>
            <div className="text-sm text-gray-300 text-left space-y-1">
              <p>🛡️ Phòng Thủ: +10 HP</p>
              <p>💚 Hồi Máu: +15 HP</p>
              <p>🔥 Chém Mạnh: -20 HP</p>
              <p>⚡ Siêu Phép: -25 HP</p>
              <p>💧 Giải Độc: +18 HP</p>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="text-center text-gray-400 text-sm">
          <p>Powered by Next.js & WebSocket</p>
        </div>
      </div>
    </div>
  );
}
