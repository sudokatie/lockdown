import { Position, Tile, TileType } from './types';
import { getTile, isInBounds } from './Grid';
import { GRID_WIDTH, GRID_HEIGHT } from './constants';

export function getDistance(a: Position, b: Position): number {
  return Math.abs(a.x - b.x) + Math.abs(a.y - b.y);
}

export function heuristic(a: Position, b: Position): number {
  return getDistance(a, b);
}

export function posKey(pos: Position): string {
  return `${pos.x},${pos.y}`;
}

export function isPassableForPath(grid: Tile[][], x: number, y: number, canOpenDoors: boolean): boolean {
  if (!isInBounds(x, y)) return false;
  
  const tile = getTile(grid, x, y);
  if (!tile) return false;
  
  if (tile.type === TileType.FLOOR || tile.type === TileType.GRASS) {
    return true;
  }
  
  if (tile.type === TileType.DOOR) {
    return canOpenDoors;
  }
  
  return false;
}

export function getNeighborsForPath(grid: Tile[][], pos: Position, canOpenDoors: boolean): Position[] {
  const neighbors: Position[] = [];
  const directions = [
    { dx: 0, dy: -1 }, // up
    { dx: 0, dy: 1 },  // down
    { dx: -1, dy: 0 }, // left
    { dx: 1, dy: 0 }   // right
  ];
  
  for (const { dx, dy } of directions) {
    const nx = pos.x + dx;
    const ny = pos.y + dy;
    if (isPassableForPath(grid, nx, ny, canOpenDoors)) {
      neighbors.push({ x: nx, y: ny });
    }
  }
  
  return neighbors;
}

export function reconstructPath(cameFrom: Map<string, Position>, current: Position): Position[] {
  const path: Position[] = [current];
  let currentKey = posKey(current);
  
  while (cameFrom.has(currentKey)) {
    const prev = cameFrom.get(currentKey)!;
    path.unshift(prev);
    currentKey = posKey(prev);
  }
  
  return path;
}

export function findPath(
  grid: Tile[][],
  start: Position,
  end: Position,
  canOpenDoors: boolean = false
): Position[] {
  // If start equals end, return empty path
  if (start.x === end.x && start.y === end.y) {
    return [];
  }
  
  // Check if end is reachable
  if (!isPassableForPath(grid, end.x, end.y, canOpenDoors)) {
    return [];
  }
  
  // A* algorithm
  const openSet: Position[] = [start];
  const cameFrom = new Map<string, Position>();
  
  const gScore = new Map<string, number>();
  gScore.set(posKey(start), 0);
  
  const fScore = new Map<string, number>();
  fScore.set(posKey(start), heuristic(start, end));
  
  while (openSet.length > 0) {
    // Find node with lowest fScore
    let lowestIndex = 0;
    let lowestFScore = fScore.get(posKey(openSet[0])) ?? Infinity;
    
    for (let i = 1; i < openSet.length; i++) {
      const f = fScore.get(posKey(openSet[i])) ?? Infinity;
      if (f < lowestFScore) {
        lowestIndex = i;
        lowestFScore = f;
      }
    }
    
    const current = openSet[lowestIndex];
    
    // Check if we reached the goal
    if (current.x === end.x && current.y === end.y) {
      return reconstructPath(cameFrom, current);
    }
    
    // Remove current from openSet
    openSet.splice(lowestIndex, 1);
    
    // Check neighbors
    const neighbors = getNeighborsForPath(grid, current, canOpenDoors);
    
    for (const neighbor of neighbors) {
      const tentativeGScore = (gScore.get(posKey(current)) ?? Infinity) + 1;
      
      if (tentativeGScore < (gScore.get(posKey(neighbor)) ?? Infinity)) {
        cameFrom.set(posKey(neighbor), current);
        gScore.set(posKey(neighbor), tentativeGScore);
        fScore.set(posKey(neighbor), tentativeGScore + heuristic(neighbor, end));
        
        // Add to openSet if not already there
        if (!openSet.some(p => p.x === neighbor.x && p.y === neighbor.y)) {
          openSet.push(neighbor);
        }
      }
    }
  }
  
  // No path found
  return [];
}

export function hasPath(
  grid: Tile[][],
  start: Position,
  end: Position,
  canOpenDoors: boolean = false
): boolean {
  if (start.x === end.x && start.y === end.y) return true;
  return findPath(grid, start, end, canOpenDoors).length > 0;
}

export function getPathLength(path: Position[]): number {
  return Math.max(0, path.length - 1);
}

export function getNextStep(path: Position[]): Position | null {
  if (path.length < 2) return null;
  return path[1];
}
