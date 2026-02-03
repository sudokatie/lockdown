import {
  createGrid,
  createTile,
  getTile,
  setTile,
  setObject,
  removeObject,
  isInBounds,
  isPassable,
  getNeighbors,
  getPassableNeighbors,
  setZone,
  clearZone
} from '../src/game/Grid';
import { TileType, ZoneType, ObjectType } from '../src/game/types';
import { GRID_WIDTH, GRID_HEIGHT } from '../src/game/constants';

describe('Grid', () => {
  describe('createGrid', () => {
    it('creates grid with correct dimensions', () => {
      const grid = createGrid();
      expect(grid.length).toBe(GRID_HEIGHT);
      expect(grid[0].length).toBe(GRID_WIDTH);
    });

    it('all tiles start as EMPTY', () => {
      const grid = createGrid();
      for (let y = 0; y < GRID_HEIGHT; y++) {
        for (let x = 0; x < GRID_WIDTH; x++) {
          expect(grid[y][x].type).toBe(TileType.EMPTY);
        }
      }
    });

    it('all tiles start with no zone', () => {
      const grid = createGrid();
      expect(grid[0][0].zone).toBe(ZoneType.NONE);
      expect(grid[15][20].zone).toBe(ZoneType.NONE);
    });

    it('all tiles start with no object', () => {
      const grid = createGrid();
      expect(grid[0][0].object).toBe(ObjectType.NONE);
      expect(grid[15][20].object).toBe(ObjectType.NONE);
    });

    it('EMPTY tiles are not passable', () => {
      const grid = createGrid();
      expect(grid[0][0].passable).toBe(false);
    });
  });

  describe('createTile', () => {
    it('creates EMPTY tile by default', () => {
      const tile = createTile();
      expect(tile.type).toBe(TileType.EMPTY);
      expect(tile.passable).toBe(false);
    });

    it('creates FLOOR tile that is passable', () => {
      const tile = createTile(TileType.FLOOR);
      expect(tile.type).toBe(TileType.FLOOR);
      expect(tile.passable).toBe(true);
    });

    it('creates WALL tile that is not passable', () => {
      const tile = createTile(TileType.WALL);
      expect(tile.type).toBe(TileType.WALL);
      expect(tile.passable).toBe(false);
    });

    it('creates DOOR tile that is passable', () => {
      const tile = createTile(TileType.DOOR);
      expect(tile.type).toBe(TileType.DOOR);
      expect(tile.passable).toBe(true);
    });

    it('creates GRASS tile that is passable', () => {
      const tile = createTile(TileType.GRASS);
      expect(tile.type).toBe(TileType.GRASS);
      expect(tile.passable).toBe(true);
    });

    it('creates FENCE tile that is not passable', () => {
      const tile = createTile(TileType.FENCE);
      expect(tile.type).toBe(TileType.FENCE);
      expect(tile.passable).toBe(false);
    });
  });

  describe('isInBounds', () => {
    it('returns true for valid positions', () => {
      expect(isInBounds(0, 0)).toBe(true);
      expect(isInBounds(20, 15)).toBe(true);
      expect(isInBounds(GRID_WIDTH - 1, GRID_HEIGHT - 1)).toBe(true);
    });

    it('returns false for negative x', () => {
      expect(isInBounds(-1, 0)).toBe(false);
    });

    it('returns false for negative y', () => {
      expect(isInBounds(0, -1)).toBe(false);
    });

    it('returns false for x >= GRID_WIDTH', () => {
      expect(isInBounds(GRID_WIDTH, 0)).toBe(false);
    });

    it('returns false for y >= GRID_HEIGHT', () => {
      expect(isInBounds(0, GRID_HEIGHT)).toBe(false);
    });
  });

  describe('getTile', () => {
    it('returns tile at valid position', () => {
      const grid = createGrid();
      const tile = getTile(grid, 10, 10);
      expect(tile).not.toBeNull();
      expect(tile!.type).toBe(TileType.EMPTY);
    });

    it('returns null for out of bounds x', () => {
      const grid = createGrid();
      expect(getTile(grid, -1, 0)).toBeNull();
      expect(getTile(grid, GRID_WIDTH, 0)).toBeNull();
    });

    it('returns null for out of bounds y', () => {
      const grid = createGrid();
      expect(getTile(grid, 0, -1)).toBeNull();
      expect(getTile(grid, 0, GRID_HEIGHT)).toBeNull();
    });
  });

  describe('setTile', () => {
    it('changes tile type', () => {
      const grid = createGrid();
      setTile(grid, 5, 5, TileType.FLOOR);
      expect(grid[5][5].type).toBe(TileType.FLOOR);
    });

    it('updates passability when setting FLOOR', () => {
      const grid = createGrid();
      setTile(grid, 5, 5, TileType.FLOOR);
      expect(grid[5][5].passable).toBe(true);
    });

    it('updates passability when setting WALL', () => {
      const grid = createGrid();
      setTile(grid, 5, 5, TileType.FLOOR);
      setTile(grid, 5, 5, TileType.WALL);
      expect(grid[5][5].passable).toBe(false);
    });

    it('returns true for valid position', () => {
      const grid = createGrid();
      expect(setTile(grid, 5, 5, TileType.FLOOR)).toBe(true);
    });

    it('returns false for out of bounds', () => {
      const grid = createGrid();
      expect(setTile(grid, -1, 0, TileType.FLOOR)).toBe(false);
      expect(setTile(grid, 0, -1, TileType.FLOOR)).toBe(false);
    });
  });

  describe('setObject', () => {
    it('places object on FLOOR tile', () => {
      const grid = createGrid();
      setTile(grid, 5, 5, TileType.FLOOR);
      const result = setObject(grid, 5, 5, ObjectType.BED);
      expect(result).toBe(true);
      expect(grid[5][5].object).toBe(ObjectType.BED);
    });

    it('fails to place object on EMPTY tile', () => {
      const grid = createGrid();
      const result = setObject(grid, 5, 5, ObjectType.BED);
      expect(result).toBe(false);
      expect(grid[5][5].object).toBe(ObjectType.NONE);
    });

    it('fails to place object on WALL tile', () => {
      const grid = createGrid();
      setTile(grid, 5, 5, TileType.WALL);
      const result = setObject(grid, 5, 5, ObjectType.BED);
      expect(result).toBe(false);
    });

    it('returns false for out of bounds', () => {
      const grid = createGrid();
      expect(setObject(grid, -1, 0, ObjectType.BED)).toBe(false);
    });
  });

  describe('removeObject', () => {
    it('removes object from tile', () => {
      const grid = createGrid();
      setTile(grid, 5, 5, TileType.FLOOR);
      setObject(grid, 5, 5, ObjectType.BED);
      removeObject(grid, 5, 5);
      expect(grid[5][5].object).toBe(ObjectType.NONE);
    });

    it('returns true for valid position', () => {
      const grid = createGrid();
      expect(removeObject(grid, 5, 5)).toBe(true);
    });

    it('returns false for out of bounds', () => {
      const grid = createGrid();
      expect(removeObject(grid, -1, 0)).toBe(false);
    });
  });

  describe('isPassable', () => {
    it('returns true for FLOOR', () => {
      const grid = createGrid();
      setTile(grid, 5, 5, TileType.FLOOR);
      expect(isPassable(grid, 5, 5)).toBe(true);
    });

    it('returns false for WALL', () => {
      const grid = createGrid();
      setTile(grid, 5, 5, TileType.WALL);
      expect(isPassable(grid, 5, 5)).toBe(false);
    });

    it('returns true for DOOR', () => {
      const grid = createGrid();
      setTile(grid, 5, 5, TileType.DOOR);
      expect(isPassable(grid, 5, 5)).toBe(true);
    });

    it('returns true for GRASS', () => {
      const grid = createGrid();
      setTile(grid, 5, 5, TileType.GRASS);
      expect(isPassable(grid, 5, 5)).toBe(true);
    });

    it('returns false for EMPTY', () => {
      const grid = createGrid();
      expect(isPassable(grid, 5, 5)).toBe(false);
    });

    it('returns false for FENCE', () => {
      const grid = createGrid();
      setTile(grid, 5, 5, TileType.FENCE);
      expect(isPassable(grid, 5, 5)).toBe(false);
    });

    it('returns false for out of bounds', () => {
      const grid = createGrid();
      expect(isPassable(grid, -1, 0)).toBe(false);
      expect(isPassable(grid, GRID_WIDTH, 0)).toBe(false);
    });
  });

  describe('getNeighbors', () => {
    it('returns 4 neighbors for center tile', () => {
      const grid = createGrid();
      const neighbors = getNeighbors(grid, 10, 10);
      expect(neighbors.length).toBe(4);
    });

    it('returns correct neighbor positions', () => {
      const grid = createGrid();
      const neighbors = getNeighbors(grid, 10, 10);
      expect(neighbors).toContainEqual({ x: 10, y: 9 });  // up
      expect(neighbors).toContainEqual({ x: 10, y: 11 }); // down
      expect(neighbors).toContainEqual({ x: 9, y: 10 });  // left
      expect(neighbors).toContainEqual({ x: 11, y: 10 }); // right
    });

    it('returns 2 neighbors for corner (0,0)', () => {
      const grid = createGrid();
      const neighbors = getNeighbors(grid, 0, 0);
      expect(neighbors.length).toBe(2);
      expect(neighbors).toContainEqual({ x: 1, y: 0 });
      expect(neighbors).toContainEqual({ x: 0, y: 1 });
    });

    it('returns 2 neighbors for corner (max,max)', () => {
      const grid = createGrid();
      const neighbors = getNeighbors(grid, GRID_WIDTH - 1, GRID_HEIGHT - 1);
      expect(neighbors.length).toBe(2);
    });

    it('returns 3 neighbors for edge tile', () => {
      const grid = createGrid();
      const neighbors = getNeighbors(grid, 10, 0);
      expect(neighbors.length).toBe(3);
    });
  });

  describe('getPassableNeighbors', () => {
    it('returns only passable neighbors', () => {
      const grid = createGrid();
      setTile(grid, 10, 9, TileType.FLOOR);
      setTile(grid, 10, 11, TileType.WALL);
      setTile(grid, 9, 10, TileType.FLOOR);
      setTile(grid, 11, 10, TileType.WALL);
      
      const passable = getPassableNeighbors(grid, 10, 10);
      expect(passable.length).toBe(2);
      expect(passable).toContainEqual({ x: 10, y: 9 });
      expect(passable).toContainEqual({ x: 9, y: 10 });
    });

    it('returns empty array if no passable neighbors', () => {
      const grid = createGrid();
      // All neighbors are EMPTY (not passable)
      const passable = getPassableNeighbors(grid, 10, 10);
      expect(passable.length).toBe(0);
    });
  });

  describe('setZone', () => {
    it('sets zone type on tile', () => {
      const grid = createGrid();
      setZone(grid, 5, 5, ZoneType.CELL);
      expect(grid[5][5].zone).toBe(ZoneType.CELL);
    });

    it('returns true for valid position', () => {
      const grid = createGrid();
      expect(setZone(grid, 5, 5, ZoneType.CELL)).toBe(true);
    });

    it('returns false for out of bounds', () => {
      const grid = createGrid();
      expect(setZone(grid, -1, 0, ZoneType.CELL)).toBe(false);
    });
  });

  describe('clearZone', () => {
    it('clears zone from tile', () => {
      const grid = createGrid();
      setZone(grid, 5, 5, ZoneType.CELL);
      clearZone(grid, 5, 5);
      expect(grid[5][5].zone).toBe(ZoneType.NONE);
    });
  });
});
