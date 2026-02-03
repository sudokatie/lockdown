'use client';

import { BuildTool, TileType, ObjectType } from '../game/types';
import { TILE_COSTS, OBJECT_COSTS } from '../game/constants';

interface BuildPanelProps {
  money: number;
  onSelectTool: (tool: BuildTool, tileType?: TileType, objectType?: ObjectType) => void;
}

export default function BuildPanel({ money, onSelectTool }: BuildPanelProps) {
  const tiles: { type: TileType; label: string }[] = [
    { type: TileType.FLOOR, label: 'Floor' },
    { type: TileType.WALL, label: 'Wall' },
    { type: TileType.DOOR, label: 'Door' },
    { type: TileType.GRASS, label: 'Grass' },
    { type: TileType.FENCE, label: 'Fence' }
  ];

  const objects: { type: ObjectType; label: string }[] = [
    { type: ObjectType.BED, label: 'Bed' },
    { type: ObjectType.TOILET, label: 'Toilet' },
    { type: ObjectType.TABLE, label: 'Table' },
    { type: ObjectType.BENCH, label: 'Bench' },
    { type: ObjectType.COOKER, label: 'Cooker' },
    { type: ObjectType.FRIDGE, label: 'Fridge' },
    { type: ObjectType.SINK, label: 'Sink' },
    { type: ObjectType.SHOWERHEAD, label: 'Shower' },
    { type: ObjectType.DRAIN, label: 'Drain' },
    { type: ObjectType.TV, label: 'TV' }
  ];

  const canAfford = (cost: number) => money >= cost;

  return (
    <div className="p-4 text-white">
      <h3 className="text-sm font-bold text-gray-400 mb-3">Tiles</h3>
      <div className="grid grid-cols-2 gap-2 mb-6">
        {tiles.map(tile => {
          const cost = TILE_COSTS[tile.type];
          const affordable = canAfford(cost);
          return (
            <button
              key={tile.type}
              onClick={() => onSelectTool(BuildTool.WALL, tile.type)}
              disabled={!affordable}
              className={`p-2 text-sm rounded transition-colors ${
                affordable
                  ? 'bg-gray-700 hover:bg-gray-600'
                  : 'bg-gray-800 text-gray-600 cursor-not-allowed'
              }`}
            >
              <div>{tile.label}</div>
              <div className="text-xs text-gray-400">${cost}</div>
            </button>
          );
        })}
      </div>

      <h3 className="text-sm font-bold text-gray-400 mb-3">Objects</h3>
      <div className="grid grid-cols-2 gap-2">
        {objects.map(obj => {
          const cost = OBJECT_COSTS[obj.type];
          const affordable = canAfford(cost);
          return (
            <button
              key={obj.type}
              onClick={() => onSelectTool(BuildTool.OBJECT, undefined, obj.type)}
              disabled={!affordable}
              className={`p-2 text-sm rounded transition-colors ${
                affordable
                  ? 'bg-gray-700 hover:bg-gray-600'
                  : 'bg-gray-800 text-gray-600 cursor-not-allowed'
              }`}
            >
              <div>{obj.label}</div>
              <div className="text-xs text-gray-400">${cost}</div>
            </button>
          );
        })}
      </div>

      <button
        onClick={() => onSelectTool(BuildTool.NONE)}
        className="w-full mt-4 p-2 bg-red-900 hover:bg-red-800 rounded text-sm"
      >
        Cancel Tool
      </button>
    </div>
  );
}
