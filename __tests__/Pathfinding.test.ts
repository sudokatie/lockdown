import {
  findPath,
  hasPath,
  getDistance,
  heuristic,
  getPathLength,
  getNextStep,
  isPassableForPath,
  getNeighborsForPath
} from '../src/game/Pathfinding';
import { createGrid, setTile } from '../src/game/Grid';
import { TileType } from '../src/game/types';

describe('Pathfinding', () => {
  describe('getDistance', () => {
    it('returns 0 for same position', () => {
      expect(getDistance({ x: 5, y: 5 }, { x: 5, y: 5 })).toBe(0);
    });

    it('returns Manhattan distance', () => {
      expect(getDistance({ x: 0, y: 0 }, { x: 3, y: 4 })).toBe(7);
      expect(getDistance({ x: 5, y: 5 }, { x: 8, y: 2 })).toBe(6);
    });

    it('handles negative offsets', () => {
      expect(getDistance({ x: 5, y: 5 }, { x: 2, y: 2 })).toBe(6);
    });
  });

  describe('heuristic', () => {
    it('returns same as getDistance', () => {
      const a = { x: 3, y: 4 };
      const b = { x: 7, y: 1 };
      expect(heuristic(a, b)).toBe(getDistance(a, b));
    });
  });

  describe('isPassableForPath', () => {
    it('returns true for FLOOR', () => {
      const grid = createGrid();
      setTile(grid, 5, 5, TileType.FLOOR);
      expect(isPassableForPath(grid, 5, 5, false)).toBe(true);
    });

    it('returns true for GRASS', () => {
      const grid = createGrid();
      setTile(grid, 5, 5, TileType.GRASS);
      expect(isPassableForPath(grid, 5, 5, false)).toBe(true);
    });

    it('returns false for WALL', () => {
      const grid = createGrid();
      setTile(grid, 5, 5, TileType.WALL);
      expect(isPassableForPath(grid, 5, 5, false)).toBe(false);
    });

    it('returns false for EMPTY', () => {
      const grid = createGrid();
      expect(isPassableForPath(grid, 5, 5, false)).toBe(false);
    });

    it('returns false for DOOR without canOpenDoors', () => {
      const grid = createGrid();
      setTile(grid, 5, 5, TileType.DOOR);
      expect(isPassableForPath(grid, 5, 5, false)).toBe(false);
    });

    it('returns true for DOOR with canOpenDoors', () => {
      const grid = createGrid();
      setTile(grid, 5, 5, TileType.DOOR);
      expect(isPassableForPath(grid, 5, 5, true)).toBe(true);
    });

    it('returns false for out of bounds', () => {
      const grid = createGrid();
      expect(isPassableForPath(grid, -1, 0, true)).toBe(false);
      expect(isPassableForPath(grid, 100, 100, true)).toBe(false);
    });
  });

  describe('getNeighborsForPath', () => {
    it('returns passable neighbors only', () => {
      const grid = createGrid();
      setTile(grid, 5, 4, TileType.FLOOR); // up
      setTile(grid, 5, 6, TileType.WALL);  // down
      setTile(grid, 4, 5, TileType.FLOOR); // left
      setTile(grid, 6, 5, TileType.WALL);  // right
      
      const neighbors = getNeighborsForPath(grid, { x: 5, y: 5 }, false);
      expect(neighbors.length).toBe(2);
      expect(neighbors).toContainEqual({ x: 5, y: 4 });
      expect(neighbors).toContainEqual({ x: 4, y: 5 });
    });
  });

  describe('findPath', () => {
    it('returns empty array when start equals end', () => {
      const grid = createGrid();
      const path = findPath(grid, { x: 5, y: 5 }, { x: 5, y: 5 });
      expect(path).toEqual([]);
    });

    it('finds direct path between adjacent tiles', () => {
      const grid = createGrid();
      setTile(grid, 5, 5, TileType.FLOOR);
      setTile(grid, 5, 6, TileType.FLOOR);
      
      const path = findPath(grid, { x: 5, y: 5 }, { x: 5, y: 6 });
      expect(path.length).toBe(2);
      expect(path[0]).toEqual({ x: 5, y: 5 });
      expect(path[1]).toEqual({ x: 5, y: 6 });
    });

    it('finds path around obstacle', () => {
      const grid = createGrid();
      // Create a floor corridor with wall in middle
      for (let x = 5; x <= 9; x++) {
        setTile(grid, x, 5, TileType.FLOOR);
        setTile(grid, x, 6, TileType.FLOOR);
        setTile(grid, x, 7, TileType.FLOOR);
      }
      // Wall blocking direct path
      setTile(grid, 7, 5, TileType.WALL);
      setTile(grid, 7, 6, TileType.WALL);
      
      const path = findPath(grid, { x: 5, y: 5 }, { x: 9, y: 5 });
      expect(path.length).toBeGreaterThan(4); // Must go around
      expect(path[0]).toEqual({ x: 5, y: 5 });
      expect(path[path.length - 1]).toEqual({ x: 9, y: 5 });
    });

    it('returns empty array when no path exists', () => {
      const grid = createGrid();
      setTile(grid, 5, 5, TileType.FLOOR);
      setTile(grid, 10, 10, TileType.FLOOR);
      // No connecting floors
      
      const path = findPath(grid, { x: 5, y: 5 }, { x: 10, y: 10 });
      expect(path).toEqual([]);
    });

    it('returns empty array when end is not passable', () => {
      const grid = createGrid();
      setTile(grid, 5, 5, TileType.FLOOR);
      setTile(grid, 5, 6, TileType.WALL);
      
      const path = findPath(grid, { x: 5, y: 5 }, { x: 5, y: 6 });
      expect(path).toEqual([]);
    });

    it('finds optimal path length', () => {
      const grid = createGrid();
      // Create 5x5 open floor
      for (let y = 0; y < 5; y++) {
        for (let x = 0; x < 5; x++) {
          setTile(grid, x, y, TileType.FLOOR);
        }
      }
      
      const path = findPath(grid, { x: 0, y: 0 }, { x: 4, y: 4 });
      // Optimal path is 8 steps (Manhattan distance)
      expect(path.length).toBe(9); // 9 positions = 8 steps
    });

    it('cannot pass through door without canOpenDoors', () => {
      const grid = createGrid();
      setTile(grid, 5, 5, TileType.FLOOR);
      setTile(grid, 5, 6, TileType.DOOR);
      setTile(grid, 5, 7, TileType.FLOOR);
      
      const path = findPath(grid, { x: 5, y: 5 }, { x: 5, y: 7 }, false);
      expect(path).toEqual([]);
    });

    it('can pass through door with canOpenDoors', () => {
      const grid = createGrid();
      setTile(grid, 5, 5, TileType.FLOOR);
      setTile(grid, 5, 6, TileType.DOOR);
      setTile(grid, 5, 7, TileType.FLOOR);
      
      const path = findPath(grid, { x: 5, y: 5 }, { x: 5, y: 7 }, true);
      expect(path.length).toBe(3);
    });

    it('handles larger open area', () => {
      const grid = createGrid();
      // 10x10 open area
      for (let y = 0; y < 10; y++) {
        for (let x = 0; x < 10; x++) {
          setTile(grid, x, y, TileType.FLOOR);
        }
      }
      
      const path = findPath(grid, { x: 0, y: 0 }, { x: 9, y: 9 });
      expect(path.length).toBe(19); // Manhattan distance + 1
    });
  });

  describe('hasPath', () => {
    it('returns true when path exists', () => {
      const grid = createGrid();
      setTile(grid, 5, 5, TileType.FLOOR);
      setTile(grid, 5, 6, TileType.FLOOR);
      
      expect(hasPath(grid, { x: 5, y: 5 }, { x: 5, y: 6 })).toBe(true);
    });

    it('returns false when no path exists', () => {
      const grid = createGrid();
      setTile(grid, 5, 5, TileType.FLOOR);
      setTile(grid, 10, 10, TileType.FLOOR);
      
      expect(hasPath(grid, { x: 5, y: 5 }, { x: 10, y: 10 })).toBe(false);
    });

    it('returns true for same position', () => {
      const grid = createGrid();
      expect(hasPath(grid, { x: 5, y: 5 }, { x: 5, y: 5 })).toBe(true);
    });
  });

  describe('getPathLength', () => {
    it('returns 0 for empty path', () => {
      expect(getPathLength([])).toBe(0);
    });

    it('returns 0 for single position', () => {
      expect(getPathLength([{ x: 0, y: 0 }])).toBe(0);
    });

    it('returns correct step count', () => {
      const path = [
        { x: 0, y: 0 },
        { x: 1, y: 0 },
        { x: 2, y: 0 }
      ];
      expect(getPathLength(path)).toBe(2);
    });
  });

  describe('getNextStep', () => {
    it('returns null for empty path', () => {
      expect(getNextStep([])).toBeNull();
    });

    it('returns null for single position', () => {
      expect(getNextStep([{ x: 0, y: 0 }])).toBeNull();
    });

    it('returns second position in path', () => {
      const path = [
        { x: 0, y: 0 },
        { x: 1, y: 0 },
        { x: 2, y: 0 }
      ];
      expect(getNextStep(path)).toEqual({ x: 1, y: 0 });
    });
  });
});
