'use client';

import { useState } from 'react';
import BuildPanel from './BuildPanel';
import ZonePanel from './ZonePanel';
import StaffPanel from './StaffPanel';
import InmatePanel from './InmatePanel';
import { BuildTool, TileType, ObjectType, ZoneType, StaffType, SecurityLevel } from '../game/types';

type TabType = 'build' | 'zones' | 'staff' | 'inmates';

interface SidePanelProps {
  money: number;
  onSelectTool: (tool: BuildTool, tileType?: TileType, objectType?: ObjectType) => void;
  onSelectZone: (zone: ZoneType) => void;
  onHireStaff: (type: StaffType) => void;
  onAdmitInmate: (name: string, security: SecurityLevel, sentence: number) => void;
}

export default function SidePanel({ money, onSelectTool, onSelectZone, onHireStaff, onAdmitInmate }: SidePanelProps) {
  const [activeTab, setActiveTab] = useState<TabType>('build');

  const tabs: { id: TabType; label: string }[] = [
    { id: 'build', label: 'Build' },
    { id: 'zones', label: 'Zones' },
    { id: 'staff', label: 'Staff' },
    { id: 'inmates', label: 'Inmates' }
  ];

  return (
    <div className="w-64 bg-gray-800 border-l border-gray-700 flex flex-col">
      {/* Tab buttons */}
      <div className="flex border-b border-gray-700">
        {tabs.map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`flex-1 py-2 text-sm font-medium transition-colors ${
              activeTab === tab.id
                ? 'bg-gray-700 text-white'
                : 'bg-gray-800 text-gray-400 hover:text-white'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Tab content */}
      <div className="flex-1 overflow-y-auto">
        {activeTab === 'build' && (
          <BuildPanel money={money} onSelectTool={onSelectTool} />
        )}
        {activeTab === 'zones' && (
          <ZonePanel onSelectZone={onSelectZone} />
        )}
        {activeTab === 'staff' && (
          <StaffPanel money={money} onHireStaff={onHireStaff} />
        )}
        {activeTab === 'inmates' && (
          <InmatePanel money={money} onAdmitInmate={onAdmitInmate} />
        )}
      </div>
    </div>
  );
}
