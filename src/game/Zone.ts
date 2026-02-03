import { Zone, ZoneType, Tile, Position, ObjectType } from './types';
import { getTile, setZone, isInBounds } from './Grid';
import { ZONE_MIN_SIZE, ZONE_REQUIRED_OBJECTS } from './constants';

let zoneIdCounter = 0;

export function generateZoneId(): string {
  return `zone_${++zoneIdCounter}`;
}

export function resetZoneIdCounter(): void {
  zoneIdCounter = 0;
}

export function createZone(type: ZoneType, tiles: Position[]): Zone {
  return {
    id: generateZoneId(),
    type,
    tiles: [...tiles],
    valid: false
  };
}

export function getZoneBounds(tiles: Position[]): { minX: number; minY: number; maxX: number; maxY: number; width: number; height: number } {
  if (tiles.length === 0) {
    return { minX: 0, minY: 0, maxX: 0, maxY: 0, width: 0, height: 0 };
  }
  
  let minX = tiles[0].x;
  let minY = tiles[0].y;
  let maxX = tiles[0].x;
  let maxY = tiles[0].y;
  
  for (const tile of tiles) {
    minX = Math.min(minX, tile.x);
    minY = Math.min(minY, tile.y);
    maxX = Math.max(maxX, tile.x);
    maxY = Math.max(maxY, tile.y);
  }
  
  return {
    minX,
    minY,
    maxX,
    maxY,
    width: maxX - minX + 1,
    height: maxY - minY + 1
  };
}

export function meetsMinimumSize(type: ZoneType, tiles: Position[]): boolean {
  const minSize = ZONE_MIN_SIZE[type];
  if (!minSize || (minSize.w === 0 && minSize.h === 0)) {
    return true;
  }
  
  const bounds = getZoneBounds(tiles);
  return tiles.length >= minSize.w * minSize.h;
}

export function getObjectsInZone(grid: Tile[][], tiles: Position[]): ObjectType[] {
  const objects: ObjectType[] = [];
  for (const pos of tiles) {
    const tile = getTile(grid, pos.x, pos.y);
    if (tile && tile.object !== ObjectType.NONE) {
      objects.push(tile.object);
    }
  }
  return objects;
}

export function hasRequiredObjects(grid: Tile[][], zone: Zone): boolean {
  const required = ZONE_REQUIRED_OBJECTS[zone.type];
  if (!required || required.length === 0) {
    return true;
  }
  
  const objects = getObjectsInZone(grid, zone.tiles);
  
  for (const reqObj of required) {
    if (!objects.includes(reqObj)) {
      return false;
    }
  }
  
  return true;
}

export function isEnclosed(grid: Tile[][], tiles: Position[]): boolean {
  if (tiles.length === 0) return false;
  
  // Create a set of zone positions for fast lookup
  const zoneSet = new Set(tiles.map(t => `${t.x},${t.y}`));
  
  // Check each tile in the zone
  for (const pos of tiles) {
    const tile = getTile(grid, pos.x, pos.y);
    if (!tile) return false;
    
    // Check all 4 neighbors
    const neighbors = [
      { x: pos.x, y: pos.y - 1 },
      { x: pos.x, y: pos.y + 1 },
      { x: pos.x - 1, y: pos.y },
      { x: pos.x + 1, y: pos.y }
    ];
    
    for (const neighbor of neighbors) {
      // If neighbor is in the zone, it's fine
      if (zoneSet.has(`${neighbor.x},${neighbor.y}`)) {
        continue;
      }
      
      // If neighbor is out of bounds, that's an enclosure (edge of map)
      if (!isInBounds(neighbor.x, neighbor.y)) {
        continue;
      }
      
      // Neighbor must be a wall, door, or fence to enclose
      const neighborTile = getTile(grid, neighbor.x, neighbor.y);
      if (!neighborTile) return false;
      
      const isBarrier = neighborTile.type === 'WALL' || 
                        neighborTile.type === 'DOOR' || 
                        neighborTile.type === 'FENCE';
      
      if (!isBarrier) {
        return false;
      }
    }
  }
  
  return true;
}

export function validateZone(grid: Tile[][], zone: Zone): boolean {
  // Check minimum size
  if (!meetsMinimumSize(zone.type, zone.tiles)) {
    return false;
  }
  
  // YARD zones don't need to be enclosed (outdoor)
  if (zone.type !== ZoneType.YARD) {
    if (!isEnclosed(grid, zone.tiles)) {
      return false;
    }
  }
  
  // Check required objects
  if (!hasRequiredObjects(grid, zone)) {
    return false;
  }
  
  zone.valid = true;
  return true;
}

export function getZoneAt(zones: Zone[], pos: Position): Zone | null {
  for (const zone of zones) {
    for (const tile of zone.tiles) {
      if (tile.x === pos.x && tile.y === pos.y) {
        return zone;
      }
    }
  }
  return null;
}

export function findZonesByType(zones: Zone[], type: ZoneType): Zone[] {
  return zones.filter(zone => zone.type === type);
}

export function placeZone(
  grid: Tile[][],
  zones: Zone[],
  topLeft: Position,
  width: number,
  height: number,
  type: ZoneType
): Zone | null {
  const tiles: Position[] = [];
  
  // Gather all tiles in the rectangle
  for (let y = topLeft.y; y < topLeft.y + height; y++) {
    for (let x = topLeft.x; x < topLeft.x + width; x++) {
      if (!isInBounds(x, y)) {
        return null;
      }
      
      // Check tile is floor (or grass for yard)
      const tile = getTile(grid, x, y);
      if (!tile) return null;
      
      if (type === ZoneType.YARD) {
        if (tile.type !== 'FLOOR' && tile.type !== 'GRASS') {
          return null;
        }
      } else {
        if (tile.type !== 'FLOOR') {
          return null;
        }
      }
      
      // Check no existing zone
      if (tile.zone !== ZoneType.NONE) {
        return null;
      }
      
      tiles.push({ x, y });
    }
  }
  
  // Create zone
  const zone = createZone(type, tiles);
  
  // Validate
  if (!validateZone(grid, zone)) {
    return null;
  }
  
  // Apply zone to grid
  for (const pos of tiles) {
    setZone(grid, pos.x, pos.y, type);
  }
  
  zones.push(zone);
  return zone;
}

export function removeZone(grid: Tile[][], zones: Zone[], zone: Zone): boolean {
  const index = zones.findIndex(z => z.id === zone.id);
  if (index === -1) return false;
  
  // Clear zone from grid tiles
  for (const pos of zone.tiles) {
    setZone(grid, pos.x, pos.y, ZoneType.NONE);
  }
  
  zones.splice(index, 1);
  return true;
}

export function countZonesByType(zones: Zone[], type: ZoneType): number {
  return zones.filter(z => z.type === type).length;
}
