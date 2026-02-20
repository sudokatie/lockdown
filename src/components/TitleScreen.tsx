'use client';

import { useState } from 'react';
import { Music } from '@/game/Music';
import { soundSystem as Sound } from '@/game/Sound';

interface TitleScreenProps {
  onStart: () => void;
}

export default function TitleScreen({ onStart }: TitleScreenProps) {
  const [musicVolume, setMusicVolume] = useState(Music.getVolume());
  const [soundVolume, setSoundVolume] = useState(Sound.getVolume());
  const [musicEnabled, setMusicEnabled] = useState(Music.isEnabled());
  const [soundEnabled, setSoundEnabled] = useState(Sound.isEnabled());

  const handleMusicVolumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const vol = parseFloat(e.target.value);
    setMusicVolume(vol);
    Music.setVolume(vol);
  };

  const handleSoundVolumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const vol = parseFloat(e.target.value);
    setSoundVolume(vol);
    Sound.setVolume(vol);
  };

  const toggleMusic = () => {
    const newState = !musicEnabled;
    setMusicEnabled(newState);
    Music.setEnabled(newState);
  };

  const toggleSound = () => {
    const newState = !soundEnabled;
    setSoundEnabled(newState);
    Sound.setEnabled(newState);
  };

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

      {/* Audio Settings */}
      <div className="mt-8 p-4 bg-gray-800 rounded-lg w-64">
        <h3 className="text-sm font-medium text-gray-300 mb-3 text-center">Audio</h3>
        
        <div className="mb-3">
          <div className="flex justify-between items-center mb-1">
            <label className="text-sm text-gray-400">Music</label>
            <button
              onClick={toggleMusic}
              className={`px-2 py-0.5 rounded text-xs ${
                musicEnabled ? 'bg-blue-600 text-white' : 'bg-gray-600 text-gray-300'
              }`}
            >
              {musicEnabled ? 'ON' : 'OFF'}
            </button>
          </div>
          <input
            type="range"
            min="0"
            max="1"
            step="0.01"
            value={musicVolume}
            onChange={handleMusicVolumeChange}
            disabled={!musicEnabled}
            className="w-full h-1.5 bg-gray-700 rounded-lg appearance-none cursor-pointer accent-blue-500 disabled:opacity-50"
          />
        </div>

        <div>
          <div className="flex justify-between items-center mb-1">
            <label className="text-sm text-gray-400">Sound</label>
            <button
              onClick={toggleSound}
              className={`px-2 py-0.5 rounded text-xs ${
                soundEnabled ? 'bg-blue-600 text-white' : 'bg-gray-600 text-gray-300'
              }`}
            >
              {soundEnabled ? 'ON' : 'OFF'}
            </button>
          </div>
          <input
            type="range"
            min="0"
            max="1"
            step="0.01"
            value={soundVolume}
            onChange={handleSoundVolumeChange}
            disabled={!soundEnabled}
            className="w-full h-1.5 bg-gray-700 rounded-lg appearance-none cursor-pointer accent-blue-500 disabled:opacity-50"
          />
        </div>
      </div>
    </div>
  );
}
