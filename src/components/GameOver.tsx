'use client';

interface GameOverProps {
  day: number;
  inmateCount: number;
  money: number;
  onRestart: () => void;
}

export default function GameOver({ day, inmateCount, money, onRestart }: GameOverProps) {
  return (
    <div className="flex flex-col items-center justify-center h-screen bg-gray-900 text-white">
      <h1 className="text-6xl font-bold mb-4 text-red-500">GAME OVER</h1>
      <p className="text-xl text-gray-400 mb-8">Your prison has gone bankrupt!</p>
      
      <div className="bg-gray-800 rounded-lg p-6 mb-8 min-w-64">
        <h2 className="text-lg font-bold text-gray-300 mb-4">Final Stats</h2>
        <div className="space-y-2 text-gray-400">
          <div className="flex justify-between">
            <span>Days Survived:</span>
            <span className="text-white font-bold">{day}</span>
          </div>
          <div className="flex justify-between">
            <span>Inmates Managed:</span>
            <span className="text-white font-bold">{inmateCount}</span>
          </div>
          <div className="flex justify-between">
            <span>Final Balance:</span>
            <span className="text-red-400 font-bold">
              -${Math.abs(money).toLocaleString()}
            </span>
          </div>
        </div>
      </div>
      
      <button
        onClick={onRestart}
        className="px-8 py-4 text-xl font-bold bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors"
      >
        Try Again
      </button>
    </div>
  );
}
