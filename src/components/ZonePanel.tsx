'use client';

import { ZoneType } from '../game/types';
import { ZONE_REQUIRED_OBJECTS } from '../game/constants';

interface ZonePanelProps {
  onSelectZone: (zone: ZoneType) => void;
}

export default function ZonePanel({ onSelectZone }: ZonePanelProps) {
  const zones: { type: ZoneType; label: string; desc: string }[] = [
    { type: ZoneType.CELL, label: 'Cell', desc: 'Requires bed, toilet' },
    { type: ZoneType.CANTEEN, label: 'Canteen', desc: 'Requires table, bench' },
    { type: ZoneType.KITCHEN, label: 'Kitchen', desc: 'Requires cooker, fridge, sink' },
    { type: ZoneType.SHOWER, label: 'Shower', desc: 'Requires showerhead, drain' },
    { type: ZoneType.YARD, label: 'Yard', desc: 'Outdoor exercise area' },
    { type: ZoneType.COMMON, label: 'Common Room', desc: 'Requires TV' },
    { type: ZoneType.OFFICE, label: 'Office', desc: 'Requires desk, chair' }
  ];

  return (
    <div className="p-4 text-white">
      <h3 className="text-sm font-bold text-gray-400 mb-3">Zone Types</h3>
      <p className="text-xs text-gray-500 mb-4">
        Draw zones over enclosed rooms with required objects.
      </p>
      
      <div className="space-y-2">
        {zones.map(zone => (
          <button
            key={zone.type}
            onClick={() => onSelectZone(zone.type)}
            className="w-full p-3 bg-gray-700 hover:bg-gray-600 rounded text-left transition-colors"
          >
            <div className="font-medium">{zone.label}</div>
            <div className="text-xs text-gray-400 mt-1">{zone.desc}</div>
          </button>
        ))}
      </div>

      <button
        onClick={() => onSelectZone(ZoneType.NONE)}
        className="w-full mt-4 p-2 bg-red-900 hover:bg-red-800 rounded text-sm"
      >
        Cancel Zone
      </button>
    </div>
  );
}
