import { Player, CardType } from '@/types';
import HealthBar from './HealthBar';
import CardHand from './CardHand';
import { useState } from 'react';

interface PlayerZoneProps {
  player: Player;
  isCurrentTurn: boolean;
  onCardClick: (cardId: string) => void;
  onDrawCard?: (cardType?: CardType) => void;
  cardsCount: number;
  isOpponent?: boolean; // Để biết có phải đối thủ không
}

export default function PlayerZone({ player, isCurrentTurn, onCardClick, onDrawCard, cardsCount, isOpponent = false }: PlayerZoneProps) {
  const [showCardTypeSelector, setShowCardTypeSelector] = useState(false);
  
  const borderColor = player.team === 'red' 
    ? 'border-red-500/50' 
    : 'border-blue-500/50';
  
  const teamLabel = player.team === 'red' ? '🔴 Đỏ' : '🔵 Xanh';
  const bgColor = player.team === 'red' 
    ? 'bg-red-950/30' 
    : 'bg-blue-950/30';
  
  const cardTypes: { type: CardType; name: string; icon: string; color: string }[] = [
    { type: 'defense', name: 'Phòng Thủ', icon: '🛡️', color: 'bg-blue-500' },
    { type: 'heal', name: 'Hồi Máu', icon: '💚', color: 'bg-green-500' },
    { type: 'attack', name: 'Chém Mạnh', icon: '🔥', color: 'bg-orange-500' },
    { type: 'thunder', name: 'Siêu Phép', icon: '⚡', color: 'bg-purple-500' },
    { type: 'detox', name: 'Giải Độc', icon: '💧', color: 'bg-cyan-500' },
  ];
  
  const handleDrawCard = (cardType?: CardType) => {
    if (onDrawCard) {
      onDrawCard(cardType);
      setShowCardTypeSelector(false);
    }
  };
  
  return (
    <div className="relative">
      {/* Glow effect when it's player's turn */}
      {isCurrentTurn && (
        <div className="absolute inset-0 bg-gradient-to-br from-amber-500/30 via-yellow-600/20 to-orange-700/30 rounded-2xl blur-xl animate-pulse" />
      )}
      
      <div className={`relative bg-gradient-to-br from-amber-900 via-yellow-800 to-amber-950 rounded-2xl p-1 shadow-2xl
        ${isCurrentTurn ? 'ring-4 ring-yellow-400/60 shadow-yellow-400/40' : ''}`}>
        <div className="bg-gradient-to-br from-slate-800 via-slate-900 to-black rounded-xl p-4 border-2 border-amber-200/20">
          {/* Decorative corners */}
          <div className="absolute top-3 left-3 w-6 h-6 border-t-3 border-l-3 border-amber-400/40 rounded-tl-lg" />
          <div className="absolute top-3 right-3 w-6 h-6 border-t-3 border-r-3 border-amber-400/40 rounded-tr-lg" />
          <div className="absolute bottom-3 left-3 w-6 h-6 border-b-3 border-l-3 border-amber-400/40 rounded-bl-lg" />
          <div className="absolute bottom-3 right-3 w-6 h-6 border-b-3 border-r-3 border-amber-400/40 rounded-br-lg" />
          
          {/* Header */}
          <div className="flex items-center justify-between mb-3 relative z-10">
            <div className="flex items-center gap-3">
              <div className={`w-12 h-12 rounded-full flex items-center justify-center text-2xl border-3 shadow-lg ${
                player.team === 'red' 
                  ? 'bg-gradient-to-br from-red-500 to-red-700 border-red-300' 
                  : 'bg-gradient-to-br from-blue-500 to-blue-700 border-blue-300'
              }`}>
                {player.team === 'red' ? '🔴' : '🔵'}
              </div>
              <div>
                <h2 className="text-amber-100 font-black text-lg tracking-wide"
                  style={{ textShadow: '2px 2px 4px rgba(0,0,0,0.8), 0 0 10px rgba(251, 191, 36, 0.3)' }}>
                  {teamLabel}
                </h2>
                <p className="text-amber-400/70 text-sm font-bold">{player.name}</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <div className="bg-gradient-to-br from-amber-600 to-amber-800 px-3 py-1.5 rounded-lg border-2 border-amber-400/30 shadow-md">
                <span className="text-yellow-200 font-black text-sm" style={{ textShadow: '1px 1px 2px rgba(0,0,0,0.8)' }}>
                  ⭐ {player.score}
                </span>
              </div>
              <div className="bg-gradient-to-br from-slate-700 to-slate-800 px-3 py-1.5 rounded-lg border-2 border-slate-600 shadow-md">
                <span className="text-purple-300 font-black text-sm" style={{ textShadow: '1px 1px 2px rgba(0,0,0,0.8)' }}>
                  🃏 {cardsCount}
                </span>
              </div>
            </div>
          </div>
      
      {/* Health Bar */}
      <HealthBar health={player.health} maxHealth={player.maxHealth} team={player.team} />
      
          {/* Cards Section */}
          <div className="mt-4 relative z-10">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-amber-300 text-sm font-black uppercase tracking-widest flex items-center gap-2"
                style={{ textShadow: '0 2px 4px rgba(0,0,0,0.8)' }}>
                <span className="text-xl">🃏</span> Bài trên tay
              </h3>
              {onDrawCard && (
                <div className="relative">
                  {!showCardTypeSelector ? (
                    <button
                      onClick={() => setShowCardTypeSelector(true)}
                      disabled={!isCurrentTurn}
                      className={`relative px-4 py-2 rounded-xl font-bold text-sm transition-all overflow-hidden group ${
                        isCurrentTurn
                          ? 'bg-gradient-to-br from-purple-600 to-purple-800 hover:from-purple-500 hover:to-purple-700 text-white shadow-lg hover:shadow-xl hover:scale-105 border-2 border-purple-400/30'
                          : 'bg-gradient-to-br from-gray-700 to-gray-800 text-gray-500 cursor-not-allowed border-2 border-gray-600'
                      }`}
                      style={{ textShadow: isCurrentTurn ? '1px 1px 2px rgba(0,0,0,0.8)' : 'none' }}
                    >
                      {isCurrentTurn && (
                        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                      )}
                      <span className="relative z-10">🎴 Rút thẻ</span>
                    </button>
                  ) : (
                    <div className="absolute right-0 top-0 z-50 bg-gradient-to-br from-slate-800 to-slate-900 border-2 border-purple-500 rounded-xl p-3 shadow-2xl min-w-[220px]">
                      <div className="text-amber-200 text-sm font-black mb-3 flex items-center justify-between"
                        style={{ textShadow: '0 2px 4px rgba(0,0,0,0.8)' }}>
                        <span>⚡ Chọn loại thẻ:</span>
                        <button 
                          onClick={() => setShowCardTypeSelector(false)}
                          className="w-6 h-6 rounded-full bg-red-600 hover:bg-red-700 text-white font-bold transition-all"
                        >
                          ✕
                        </button>
                      </div>
                      <div className="space-y-2">
                        {cardTypes.map((ct) => (
                          <button
                            key={ct.type}
                            onClick={() => handleDrawCard(ct.type)}
                            className={`relative w-full ${ct.color} hover:scale-105 text-white px-3 py-2 rounded-lg text-sm font-black transition-all flex items-center gap-2 shadow-md hover:shadow-lg border-2 border-white/20 overflow-hidden group`}
                            style={{ textShadow: '1px 1px 2px rgba(0,0,0,0.8)' }}
                          >
                            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                            <span className="relative z-10">{ct.icon}</span>
                            <span className="relative z-10">{ct.name}</span>
                          </button>
                        ))}
                        <button
                          onClick={() => handleDrawCard()}
                          className="relative w-full bg-gradient-to-br from-gray-600 to-gray-700 hover:from-gray-500 hover:to-gray-600 text-white px-3 py-2 rounded-lg text-sm font-black transition-all shadow-md hover:shadow-lg border-2 border-gray-500/30 overflow-hidden group"
                          style={{ textShadow: '1px 1px 2px rgba(0,0,0,0.8)' }}
                        >
                          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                          <span className="relative z-10">🎲 Ngẫu nhiên</span>
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
            <CardHand 
              cards={player.cards} 
              onCardClick={onCardClick}
              disabled={!isCurrentTurn}
              faceDown={isOpponent}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
