import { Tile, TileType, ZoneType, ObjectType, Position } from './types';
import { GRID_WIDTH, GRID_HEIGHT } from './constants';

export function createTile(type: TileType = TileType.EMPTY): Tile {
  return {
    type,
    zone: ZoneType.NONE,
    object: ObjectType.NONE,
    passable: type === TileType.FLOOR || type === TileType.DOOR || type === TileType.GRASS
  };
}

export function createGrid(): Tile[][] {
  const grid: Tile[][] = [];
  for (let y = 0; y < GRID_HEIGHT; y++) {
    const row: Tile[] = [];
    for (let x = 0; x < GRID_WIDTH; x++) {
      row.push(createTile(TileType.EMPTY));
    }
    grid.push(row);
  }
  return grid;
}

export function isInBounds(x: number, y: number): boolean {
  return x >= 0 && x < GRID_WIDTH && y >= 0 && y < GRID_HEIGHT;
}

export function getTile(grid: Tile[][], x: number, y: number): Tile | null {
  if (!isInBounds(x, y)) {
    return null;
  }
  return grid[y][x];
}

export function setTile(grid: Tile[][], x: number, y: number, type: TileType): boolean {
  if (!isInBounds(x, y)) {
    return false;
  }
  grid[y][x].type = type;
  grid[y][x].passable = type === TileType.FLOOR || type === TileType.DOOR || type === TileType.GRASS;
  return true;
}

export function setObject(grid: Tile[][], x: number, y: number, object: ObjectType): boolean {
  if (!isInBounds(x, y)) {
    return false;
  }
  const tile = grid[y][x];
  // Can only place objects on floor tiles
  if (tile.type !== TileType.FLOOR) {
    return false;
  }
  tile.object = object;
  return true;
}

export function removeObject(grid: Tile[][], x: number, y: number): boolean {
  if (!isInBounds(x, y)) {
    return false;
  }
  grid[y][x].object = ObjectType.NONE;
  return true;
}

export function isPassable(grid: Tile[][], x: number, y: number): boolean {
  if (!isInBounds(x, y)) {
    return false;
  }
  const tile = grid[y][x];
  // Floor, door, and grass are passable
  // Some objects might block (future consideration)
  return tile.type === TileType.FLOOR || tile.type === TileType.DOOR || tile.type === TileType.GRASS;
}

export function getNeighbors(grid: Tile[][], x: number, y: number): Position[] {
  const neighbors: Position[] = [];
  const directions = [
    { dx: 0, dy: -1 }, // up
    { dx: 0, dy: 1 },  // down
    { dx: -1, dy: 0 }, // left
    { dx: 1, dy: 0 }   // right
  ];
  
  for (const { dx, dy } of directions) {
    const nx = x + dx;
    const ny = y + dy;
    if (isInBounds(nx, ny)) {
      neighbors.push({ x: nx, y: ny });
    }
  }
  
  return neighbors;
}

export function getPassableNeighbors(grid: Tile[][], x: number, y: number): Position[] {
  return getNeighbors(grid, x, y).filter(pos => isPassable(grid, pos.x, pos.y));
}

export function setZone(grid: Tile[][], x: number, y: number, zone: ZoneType): boolean {
  if (!isInBounds(x, y)) {
    return false;
  }
  grid[y][x].zone = zone;
  return true;
}

export function clearZone(grid: Tile[][], x: number, y: number): boolean {
  return setZone(grid, x, y, ZoneType.NONE);
}
