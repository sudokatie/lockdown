'use client';

import { useState } from 'react';
import { SecurityLevel } from '../game/types';

interface InmatePanelProps {
  money: number;
  onAdmitInmate: (name: string, security: SecurityLevel, sentence: number) => void;
}

const INMATE_NAMES = [
  'Mike', 'Tony', 'Joe', 'Frank', 'Eddie',
  'Vinnie', 'Lou', 'Sal', 'Pete', 'Nicky',
  'Ray', 'Bobby', 'Jimmy', 'Tommy', 'Paulie'
];

export default function InmatePanel({ money, onAdmitInmate }: InmatePanelProps) {
  const [customName, setCustomName] = useState('');

  const getRandomName = () => {
    return INMATE_NAMES[Math.floor(Math.random() * INMATE_NAMES.length)];
  };

  const handleAdmit = (security: SecurityLevel) => {
    const name = customName.trim() || getRandomName();
    const sentence = security === SecurityLevel.MIN ? 30 
                   : security === SecurityLevel.MED ? 90 
                   : 180;
    onAdmitInmate(name, security, sentence);
    setCustomName('');
  };

  const securityLevels: { level: SecurityLevel; label: string; color: string; desc: string }[] = [
    { 
      level: SecurityLevel.MIN, 
      label: 'Minimum', 
      color: 'bg-green-600',
      desc: '30 day sentence'
    },
    { 
      level: SecurityLevel.MED, 
      label: 'Medium', 
      color: 'bg-yellow-600',
      desc: '90 day sentence'
    },
    { 
      level: SecurityLevel.MAX, 
      label: 'Maximum', 
      color: 'bg-red-600',
      desc: '180 day sentence'
    }
  ];

  return (
    <div className="p-4 text-white">
      <h3 className="text-sm font-bold text-gray-400 mb-3">Admit Inmates</h3>
      <p className="text-xs text-gray-500 mb-4">
        Each inmate earns $50/day. Requires a cell.
      </p>

      <div className="mb-4">
        <label className="block text-xs text-gray-400 mb-1">Name (optional)</label>
        <input
          type="text"
          value={customName}
          onChange={(e) => setCustomName(e.target.value)}
          placeholder="Random if empty"
          className="w-full p-2 bg-gray-700 rounded text-sm text-white placeholder-gray-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
        />
      </div>
      
      <div className="space-y-2">
        {securityLevels.map(s => (
          <button
            key={s.level}
            onClick={() => handleAdmit(s.level)}
            className="w-full p-3 bg-gray-700 hover:bg-gray-600 rounded text-left transition-colors"
          >
            <div className="flex items-center gap-2">
              <div className={`w-3 h-3 rounded-full ${s.color}`}></div>
              <span className="font-medium">{s.label} Security</span>
            </div>
            <div className="text-xs text-gray-400 mt-1">{s.desc}</div>
          </button>
        ))}
      </div>

      <div className="mt-4 p-3 bg-gray-900 rounded text-xs text-gray-400">
        <div className="font-medium text-gray-300 mb-1">Tips:</div>
        <ul className="list-disc list-inside space-y-1">
          <li>Build cells before admitting</li>
          <li>Higher security = more risk</li>
          <li>Keep needs met to avoid fights</li>
        </ul>
      </div>
    </div>
  );
}
