'use client';

interface TitleScreenProps {
  onStart: () => void;
}

export default function TitleScreen({ onStart }: TitleScreenProps) {
  return (
    <div className="flex flex-col items-center justify-center h-screen bg-gray-900 text-white">
      <h1 className="text-6xl font-bold mb-4 text-gray-100">LOCKDOWN</h1>
      <p className="text-xl text-gray-400 mb-8">Prison Management Simulator</p>
      
      <button
        onClick={onStart}
        className="px-8 py-4 text-xl font-bold bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors"
      >
        Start Game
      </button>
      
      <div className="mt-12 text-gray-500 text-sm">
        <p>Build and manage your own prison</p>
        <p className="mt-2">Keep inmates happy or face riots!</p>
      </div>
    </div>
  );
}
