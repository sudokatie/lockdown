'use client';

import { StaffType } from '../game/types';
import { STAFF_COSTS } from '../game/constants';

interface StaffPanelProps {
  money: number;
  onHireStaff: (type: StaffType) => void;
}

export default function StaffPanel({ money, onHireStaff }: StaffPanelProps) {
  const staff: { type: StaffType; label: string; desc: string; color: string }[] = [
    { 
      type: StaffType.GUARD, 
      label: 'Guard', 
      desc: 'Patrols and resolves fights',
      color: 'bg-blue-600'
    },
    { 
      type: StaffType.COOK, 
      label: 'Cook', 
      desc: 'Prepares meals in kitchen',
      color: 'bg-white text-black'
    },
    { 
      type: StaffType.JANITOR, 
      label: 'Janitor', 
      desc: 'Cleans facilities',
      color: 'bg-green-600'
    }
  ];

  const canAfford = (cost: number) => money >= cost;

  return (
    <div className="p-4 text-white">
      <h3 className="text-sm font-bold text-gray-400 mb-3">Hire Staff</h3>
      <p className="text-xs text-gray-500 mb-4">
        Click to hire, then click on the map to place.
      </p>
      
      <div className="space-y-2">
        {staff.map(s => {
          const cost = STAFF_COSTS[s.type];
          const affordable = canAfford(cost);
          
          return (
            <button
              key={s.type}
              onClick={() => onHireStaff(s.type)}
              disabled={!affordable}
              className={`w-full p-3 rounded text-left transition-colors ${
                affordable
                  ? 'bg-gray-700 hover:bg-gray-600'
                  : 'bg-gray-800 text-gray-600 cursor-not-allowed'
              }`}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className={`w-4 h-4 rounded-full ${s.color}`}></div>
                  <span className="font-medium">{s.label}</span>
                </div>
                <span className="text-gray-400">${cost}</span>
              </div>
              <div className="text-xs text-gray-400 mt-1">{s.desc}</div>
              <div className="text-xs text-gray-500 mt-1">
                Daily wage: ${cost}
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}
