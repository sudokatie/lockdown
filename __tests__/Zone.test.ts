import {
  createZone,
  generateZoneId,
  resetZoneIdCounter,
  getZoneBounds,
  meetsMinimumSize,
  hasRequiredObjects,
  isEnclosed,
  validateZone,
  getZoneAt,
  findZonesByType,
  placeZone,
  removeZone,
  countZonesByType
} from '../src/game/Zone';
import { createGrid, setTile, setObject } from '../src/game/Grid';
import { ZoneType, TileType, ObjectType } from '../src/game/types';

describe('Zone', () => {
  beforeEach(() => {
    resetZoneIdCounter();
  });

  describe('generateZoneId', () => {
    it('generates unique IDs', () => {
      const id1 = generateZoneId();
      const id2 = generateZoneId();
      expect(id1).not.toBe(id2);
    });

    it('IDs are prefixed with zone_', () => {
      const id = generateZoneId();
      expect(id.startsWith('zone_')).toBe(true);
    });
  });

  describe('createZone', () => {
    it('creates zone with type and tiles', () => {
      const tiles = [{ x: 0, y: 0 }, { x: 1, y: 0 }];
      const zone = createZone(ZoneType.CELL, tiles);
      expect(zone.type).toBe(ZoneType.CELL);
      expect(zone.tiles.length).toBe(2);
    });

    it('creates zone with unique ID', () => {
      const zone1 = createZone(ZoneType.CELL, []);
      const zone2 = createZone(ZoneType.CELL, []);
      expect(zone1.id).not.toBe(zone2.id);
    });

    it('zone starts as invalid', () => {
      const zone = createZone(ZoneType.CELL, []);
      expect(zone.valid).toBe(false);
    });
  });

  describe('getZoneBounds', () => {
    it('returns correct bounds for tiles', () => {
      const tiles = [
        { x: 5, y: 3 },
        { x: 7, y: 3 },
        { x: 5, y: 5 },
        { x: 7, y: 5 }
      ];
      const bounds = getZoneBounds(tiles);
      expect(bounds.minX).toBe(5);
      expect(bounds.minY).toBe(3);
      expect(bounds.maxX).toBe(7);
      expect(bounds.maxY).toBe(5);
      expect(bounds.width).toBe(3);
      expect(bounds.height).toBe(3);
    });

    it('returns zeros for empty tiles', () => {
      const bounds = getZoneBounds([]);
      expect(bounds.width).toBe(0);
      expect(bounds.height).toBe(0);
    });
  });

  describe('meetsMinimumSize', () => {
    it('CELL needs at least 6 tiles (2x3)', () => {
      const smallTiles = [{ x: 0, y: 0 }, { x: 1, y: 0 }];
      const validTiles = [
        { x: 0, y: 0 }, { x: 1, y: 0 },
        { x: 0, y: 1 }, { x: 1, y: 1 },
        { x: 0, y: 2 }, { x: 1, y: 2 }
      ];
      expect(meetsMinimumSize(ZoneType.CELL, smallTiles)).toBe(false);
      expect(meetsMinimumSize(ZoneType.CELL, validTiles)).toBe(true);
    });

    it('CANTEEN needs at least 16 tiles (4x4)', () => {
      const tiles = Array.from({ length: 16 }, (_, i) => ({
        x: i % 4,
        y: Math.floor(i / 4)
      }));
      expect(meetsMinimumSize(ZoneType.CANTEEN, tiles)).toBe(true);
    });

    it('NONE zone always passes', () => {
      expect(meetsMinimumSize(ZoneType.NONE, [])).toBe(true);
    });
  });

  describe('hasRequiredObjects', () => {
    it('CELL requires BED and TOILET', () => {
      const grid = createGrid();
      // Set up floor tiles
      for (let y = 0; y < 3; y++) {
        for (let x = 0; x < 2; x++) {
          setTile(grid, x, y, TileType.FLOOR);
        }
      }
      
      const zone = createZone(ZoneType.CELL, [
        { x: 0, y: 0 }, { x: 1, y: 0 },
        { x: 0, y: 1 }, { x: 1, y: 1 },
        { x: 0, y: 2 }, { x: 1, y: 2 }
      ]);
      
      // Without objects
      expect(hasRequiredObjects(grid, zone)).toBe(false);
      
      // Add bed only
      setObject(grid, 0, 0, ObjectType.BED);
      expect(hasRequiredObjects(grid, zone)).toBe(false);
      
      // Add toilet
      setObject(grid, 1, 0, ObjectType.TOILET);
      expect(hasRequiredObjects(grid, zone)).toBe(true);
    });

    it('YARD requires no objects', () => {
      const grid = createGrid();
      const zone = createZone(ZoneType.YARD, [{ x: 0, y: 0 }]);
      expect(hasRequiredObjects(grid, zone)).toBe(true);
    });

    it('CANTEEN requires TABLE and BENCH', () => {
      const grid = createGrid();
      for (let y = 0; y < 4; y++) {
        for (let x = 0; x < 4; x++) {
          setTile(grid, x, y, TileType.FLOOR);
        }
      }
      
      const tiles = [];
      for (let y = 0; y < 4; y++) {
        for (let x = 0; x < 4; x++) {
          tiles.push({ x, y });
        }
      }
      
      const zone = createZone(ZoneType.CANTEEN, tiles);
      expect(hasRequiredObjects(grid, zone)).toBe(false);
      
      setObject(grid, 1, 1, ObjectType.TABLE);
      expect(hasRequiredObjects(grid, zone)).toBe(false);
      
      setObject(grid, 2, 1, ObjectType.BENCH);
      expect(hasRequiredObjects(grid, zone)).toBe(true);
    });
  });

  describe('isEnclosed', () => {
    it('returns true for fully enclosed room', () => {
      const grid = createGrid();
      
      // Build walls around 3x3 floor
      // Top wall
      for (let x = 0; x < 5; x++) setTile(grid, x, 0, TileType.WALL);
      // Bottom wall
      for (let x = 0; x < 5; x++) setTile(grid, x, 4, TileType.WALL);
      // Left wall
      for (let y = 0; y < 5; y++) setTile(grid, 0, y, TileType.WALL);
      // Right wall
      for (let y = 0; y < 5; y++) setTile(grid, 4, y, TileType.WALL);
      // Floor inside
      for (let y = 1; y < 4; y++) {
        for (let x = 1; x < 4; x++) {
          setTile(grid, x, y, TileType.FLOOR);
        }
      }
      
      const tiles = [
        { x: 1, y: 1 }, { x: 2, y: 1 }, { x: 3, y: 1 },
        { x: 1, y: 2 }, { x: 2, y: 2 }, { x: 3, y: 2 },
        { x: 1, y: 3 }, { x: 2, y: 3 }, { x: 3, y: 3 }
      ];
      
      expect(isEnclosed(grid, tiles)).toBe(true);
    });

    it('returns true if wall has door', () => {
      const grid = createGrid();
      
      // Build walls with a door
      for (let x = 0; x < 5; x++) setTile(grid, x, 0, TileType.WALL);
      for (let x = 0; x < 5; x++) setTile(grid, x, 4, TileType.WALL);
      for (let y = 0; y < 5; y++) setTile(grid, 0, y, TileType.WALL);
      for (let y = 0; y < 5; y++) setTile(grid, 4, y, TileType.WALL);
      // Door in right wall
      setTile(grid, 4, 2, TileType.DOOR);
      // Floor inside
      for (let y = 1; y < 4; y++) {
        for (let x = 1; x < 4; x++) {
          setTile(grid, x, y, TileType.FLOOR);
        }
      }
      
      const tiles = [
        { x: 1, y: 1 }, { x: 2, y: 1 }, { x: 3, y: 1 },
        { x: 1, y: 2 }, { x: 2, y: 2 }, { x: 3, y: 2 },
        { x: 1, y: 3 }, { x: 2, y: 3 }, { x: 3, y: 3 }
      ];
      
      expect(isEnclosed(grid, tiles)).toBe(true);
    });

    it('returns false if gap in walls', () => {
      const grid = createGrid();
      
      // Build walls with a gap
      for (let x = 0; x < 5; x++) setTile(grid, x, 0, TileType.WALL);
      for (let x = 0; x < 5; x++) setTile(grid, x, 4, TileType.WALL);
      for (let y = 0; y < 5; y++) setTile(grid, 0, y, TileType.WALL);
      // Right wall with gap (leave 4,2 as EMPTY)
      setTile(grid, 4, 0, TileType.WALL);
      setTile(grid, 4, 1, TileType.WALL);
      // Gap at 4,2
      setTile(grid, 4, 3, TileType.WALL);
      setTile(grid, 4, 4, TileType.WALL);
      // Floor inside
      for (let y = 1; y < 4; y++) {
        for (let x = 1; x < 4; x++) {
          setTile(grid, x, y, TileType.FLOOR);
        }
      }
      
      const tiles = [
        { x: 1, y: 1 }, { x: 2, y: 1 }, { x: 3, y: 1 },
        { x: 1, y: 2 }, { x: 2, y: 2 }, { x: 3, y: 2 },
        { x: 1, y: 3 }, { x: 2, y: 3 }, { x: 3, y: 3 }
      ];
      
      expect(isEnclosed(grid, tiles)).toBe(false);
    });

    it('returns false for empty tiles', () => {
      expect(isEnclosed(createGrid(), [])).toBe(false);
    });
  });

  describe('validateZone', () => {
    it('validates complete CELL zone', () => {
      const grid = createGrid();
      
      // Build walls
      for (let x = 0; x < 4; x++) setTile(grid, x, 0, TileType.WALL);
      for (let x = 0; x < 4; x++) setTile(grid, x, 4, TileType.WALL);
      for (let y = 0; y < 5; y++) setTile(grid, 0, y, TileType.WALL);
      for (let y = 0; y < 5; y++) setTile(grid, 3, y, TileType.WALL);
      setTile(grid, 3, 2, TileType.DOOR);
      
      // Floor inside (2x3)
      for (let y = 1; y < 4; y++) {
        for (let x = 1; x < 3; x++) {
          setTile(grid, x, y, TileType.FLOOR);
        }
      }
      
      // Add required objects
      setObject(grid, 1, 1, ObjectType.BED);
      setObject(grid, 2, 1, ObjectType.TOILET);
      
      const zone = createZone(ZoneType.CELL, [
        { x: 1, y: 1 }, { x: 2, y: 1 },
        { x: 1, y: 2 }, { x: 2, y: 2 },
        { x: 1, y: 3 }, { x: 2, y: 3 }
      ]);
      
      expect(validateZone(grid, zone)).toBe(true);
      expect(zone.valid).toBe(true);
    });

    it('fails validation without required objects', () => {
      const grid = createGrid();
      
      // Build enclosed room
      for (let x = 0; x < 4; x++) setTile(grid, x, 0, TileType.WALL);
      for (let x = 0; x < 4; x++) setTile(grid, x, 4, TileType.WALL);
      for (let y = 0; y < 5; y++) setTile(grid, 0, y, TileType.WALL);
      for (let y = 0; y < 5; y++) setTile(grid, 3, y, TileType.WALL);
      
      for (let y = 1; y < 4; y++) {
        for (let x = 1; x < 3; x++) {
          setTile(grid, x, y, TileType.FLOOR);
        }
      }
      
      const zone = createZone(ZoneType.CELL, [
        { x: 1, y: 1 }, { x: 2, y: 1 },
        { x: 1, y: 2 }, { x: 2, y: 2 },
        { x: 1, y: 3 }, { x: 2, y: 3 }
      ]);
      
      // Missing bed and toilet
      expect(validateZone(grid, zone)).toBe(false);
    });

    it('fails validation without enclosure', () => {
      const grid = createGrid();
      
      // Just floor, no walls
      for (let y = 0; y < 3; y++) {
        for (let x = 0; x < 2; x++) {
          setTile(grid, x, y, TileType.FLOOR);
        }
      }
      
      setObject(grid, 0, 0, ObjectType.BED);
      setObject(grid, 1, 0, ObjectType.TOILET);
      
      const zone = createZone(ZoneType.CELL, [
        { x: 0, y: 0 }, { x: 1, y: 0 },
        { x: 0, y: 1 }, { x: 1, y: 1 },
        { x: 0, y: 2 }, { x: 1, y: 2 }
      ]);
      
      expect(validateZone(grid, zone)).toBe(false);
    });
  });

  describe('getZoneAt', () => {
    it('returns zone containing position', () => {
      const zone1 = createZone(ZoneType.CELL, [{ x: 0, y: 0 }, { x: 1, y: 0 }]);
      const zone2 = createZone(ZoneType.CANTEEN, [{ x: 5, y: 5 }, { x: 6, y: 5 }]);
      const zones = [zone1, zone2];
      
      expect(getZoneAt(zones, { x: 0, y: 0 })).toBe(zone1);
      expect(getZoneAt(zones, { x: 5, y: 5 })).toBe(zone2);
    });

    it('returns null if no zone at position', () => {
      const zone = createZone(ZoneType.CELL, [{ x: 0, y: 0 }]);
      expect(getZoneAt([zone], { x: 10, y: 10 })).toBeNull();
    });
  });

  describe('findZonesByType', () => {
    it('returns all zones of type', () => {
      const cell1 = createZone(ZoneType.CELL, []);
      const cell2 = createZone(ZoneType.CELL, []);
      const canteen = createZone(ZoneType.CANTEEN, []);
      const zones = [cell1, cell2, canteen];
      
      const cells = findZonesByType(zones, ZoneType.CELL);
      expect(cells.length).toBe(2);
      expect(cells).toContain(cell1);
      expect(cells).toContain(cell2);
    });

    it('returns empty array if none found', () => {
      const zones = [createZone(ZoneType.CELL, [])];
      expect(findZonesByType(zones, ZoneType.YARD)).toEqual([]);
    });
  });

  describe('countZonesByType', () => {
    it('counts zones of type', () => {
      const zones = [
        createZone(ZoneType.CELL, []),
        createZone(ZoneType.CELL, []),
        createZone(ZoneType.CANTEEN, [])
      ];
      
      expect(countZonesByType(zones, ZoneType.CELL)).toBe(2);
      expect(countZonesByType(zones, ZoneType.CANTEEN)).toBe(1);
      expect(countZonesByType(zones, ZoneType.YARD)).toBe(0);
    });
  });

  describe('removeZone', () => {
    it('removes zone from list', () => {
      const grid = createGrid();
      const zone = createZone(ZoneType.CELL, [{ x: 0, y: 0 }]);
      const zones = [zone];
      
      expect(removeZone(grid, zones, zone)).toBe(true);
      expect(zones.length).toBe(0);
    });

    it('clears zone from grid tiles', () => {
      const grid = createGrid();
      setTile(grid, 0, 0, TileType.FLOOR);
      grid[0][0].zone = ZoneType.CELL;
      
      const zone = createZone(ZoneType.CELL, [{ x: 0, y: 0 }]);
      zone.tiles = [{ x: 0, y: 0 }];
      const zones = [zone];
      
      removeZone(grid, zones, zone);
      expect(grid[0][0].zone).toBe(ZoneType.NONE);
    });

    it('returns false for unknown zone', () => {
      const grid = createGrid();
      const zone = createZone(ZoneType.CELL, []);
      expect(removeZone(grid, [], zone)).toBe(false);
    });
  });
});
