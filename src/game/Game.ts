import {
  GameState,
  GameScreen,
  BuildTool,
  TileType,
  ObjectType,
  ZoneType,
  StaffType,
  SecurityLevel,
  Position,
  Tile,
  Staff,
  Inmate,
  InmateState,
  SecurityEvent,
  ScheduleBlock,
  Activity
} from './types';
import { createGrid, getTile, setTile, setObject, isInBounds } from './Grid';
import { createZone, placeZone, validateZone } from './Zone';
import { createDefaultSchedule, getCurrentBlock, advanceTime } from './Schedule';
import { createStaff, updateStaff, resetStaffIdCounter } from './Staff';
import { 
  createInmate, 
  updateNeeds, 
  updateFrustration, 
  resetInmateIdCounter,
  satisfyNeed,
  updateInmatePosition,
  setInmatePath,
  isInLockdown
} from './Inmate';
import { processSecurityEvents } from './Security';
import { createEconomy, spendMoney, canAfford, processDailyEconomy, isBankrupt, Economy } from './Economy';
import {
  GRID_WIDTH,
  GRID_HEIGHT,
  TILE_COSTS,
  OBJECT_COSTS,
  STAFF_COSTS,
  BANKRUPTCY_THRESHOLD,
  DEFAULT_SCHEDULE
} from './constants';
import { findPath } from './Pathfinding';

const MAX_MESSAGES = 20;

export interface Game {
  state: GameState;
  economy: Economy;
}

export function createGame(): Game {
  resetStaffIdCounter();
  resetInmateIdCounter();
  
  const grid = createGrid();
  
  return {
    state: {
      screen: GameScreen.TITLE,
      grid,
      zones: [],
      staff: [],
      inmates: [],
      events: [],
      money: 0, // Economy handles this
      day: 1,
      hour: 6,
      minute: 0,
      paused: false,
      messages: [],
      selectedTool: BuildTool.NONE,
      selectedObject: ObjectType.NONE,
      selectedZone: ZoneType.NONE,
      schedule: [...DEFAULT_SCHEDULE]
    },
    economy: createEconomy()
  };
}

export function startGame(game: Game): void {
  game.state.screen = GameScreen.PLAYING;
  addMessage(game, 'Welcome to Lockdown!');
}

export function togglePause(game: Game): void {
  game.state.paused = !game.state.paused;
  addMessage(game, game.state.paused ? 'Game paused' : 'Game resumed');
}

export function isPaused(game: Game): boolean {
  return game.state.paused;
}

export function isGameOver(game: Game): boolean {
  return isBankrupt(game.economy, BANKRUPTCY_THRESHOLD);
}

export function setGameOver(game: Game): void {
  game.state.screen = GameScreen.GAME_OVER;
}

export function addMessage(game: Game, message: string): void {
  game.state.messages.push(message);
  
  // Keep only recent messages
  if (game.state.messages.length > MAX_MESSAGES) {
    game.state.messages.shift();
  }
}

export function getMessages(game: Game): string[] {
  return game.state.messages;
}

export function clearMessages(game: Game): void {
  game.state.messages = [];
}

// Time management
export function updateTime(game: Game, dt: number): void {
  if (game.state.paused) return;
  
  const prevDay = game.state.day;
  
  // dt is in seconds, convert to minutes (1 real second = 1 game minute)
  const minutesToAdd = Math.floor(dt);
  
  for (let i = 0; i < minutesToAdd; i++) {
    game.state.minute++;
    
    if (game.state.minute >= 60) {
      game.state.minute = 0;
      game.state.hour++;
      
      if (game.state.hour >= 24) {
        game.state.hour = 0;
        game.state.day++;
      }
    }
  }
  
  // Process daily economy when day changes
  if (game.state.day > prevDay) {
    const result = processDailyEconomy(
      game.economy,
      game.state.staff,
      game.state.inmates,
      game.state.day
    );
    
    if (result.netChange !== 0) {
      addMessage(game, `Day ${game.state.day - 1} results: +$${result.income} income, -$${result.expenses} expenses`);
    }
    
    // Check for game over
    if (isGameOver(game)) {
      setGameOver(game);
      addMessage(game, 'BANKRUPT! Game Over.');
    }
  }
}

// Map activity to inmate state
function activityToState(activity: Activity): InmateState {
  switch (activity) {
    case Activity.SLEEP: return InmateState.SLEEPING;
    case Activity.EAT: return InmateState.EATING;
    case Activity.SHOWER: return InmateState.SHOWERING;
    case Activity.YARD: return InmateState.YARD;
    case Activity.FREE: return InmateState.FREE;
    case Activity.WORK: return InmateState.YARD; // Work counts as yard for MVP
    case Activity.WAKE: return InmateState.MOVING;
    default: return InmateState.SLEEPING;
  }
}

// Map activity to the need it satisfies
function activityToNeed(activity: Activity): keyof import('./types').Needs | null {
  switch (activity) {
    case Activity.SLEEP: return 'sleep';
    case Activity.EAT: return 'food';
    case Activity.SHOWER: return 'hygiene';
    case Activity.YARD: return 'exercise';
    case Activity.FREE: return 'freedom';
    case Activity.WORK: return 'exercise';
    default: return null;
  }
}

// Check if inmate is in any tile of a zone
function isInmateInZone(inmate: Inmate, zones: import('./types').Zone[], zoneType: ZoneType): boolean {
  const matchingZones = zones.filter(z => z.type === zoneType);
  for (const zone of matchingZones) {
    for (const tile of zone.tiles) {
      if (inmate.pos.x === tile.x && inmate.pos.y === tile.y) {
        return true;
      }
    }
  }
  return false;
}

// Find a random tile in a zone of given type
function findZoneTile(zones: import('./types').Zone[], zoneType: ZoneType): Position | null {
  const matchingZones = zones.filter(z => z.type === zoneType && z.valid);
  if (matchingZones.length === 0) return null;
  
  // Pick a random zone
  const zone = matchingZones[Math.floor(Math.random() * matchingZones.length)];
  if (zone.tiles.length === 0) return null;
  
  // Pick a random tile in that zone
  return zone.tiles[Math.floor(Math.random() * zone.tiles.length)];
}

// Main update loop
export function updateGame(game: Game, dt: number): void {
  if (game.state.paused || game.state.screen !== GameScreen.PLAYING) {
    return;
  }
  
  // Update time
  updateTime(game, dt);
  
  // Get current schedule block
  const block = getCurrentBlock(game.state.schedule, game.state.hour);
  
  // Find kitchen position for cook AI
  const kitchenZone = game.state.zones.find(z => z.type === ZoneType.KITCHEN);
  const kitchenPos = kitchenZone && kitchenZone.tiles.length > 0 
    ? kitchenZone.tiles[0] 
    : null;
  
  // Update all staff
  for (const staff of game.state.staff) {
    updateStaff(staff, game.state.grid, game.state.hour, game.state.events, kitchenPos);
  }
  
  // Update all inmates - follow schedule
  for (const inmate of game.state.inmates) {
    // Skip inmates in lockdown
    if (isInLockdown(inmate)) {
      updateNeeds(inmate, dt);
      updateFrustration(inmate);
      continue;
    }
    
    // If we have a schedule block, follow it
    if (block) {
      const targetZoneType = block.targetZone;
      const targetState = activityToState(block.activity);
      const needToSatisfy = activityToNeed(block.activity);
      
      // Check if inmate is already in the target zone
      if (isInmateInZone(inmate, game.state.zones, targetZoneType)) {
        // In correct zone - update state and satisfy need
        inmate.state = targetState;
        
        if (needToSatisfy) {
          // Satisfy need while in correct zone (10 per second)
          satisfyNeed(inmate, needToSatisfy, 10 * dt);
        }
        
        // Clear path since we're at destination
        inmate.path = [];
      } else {
        // Not in correct zone - pathfind there
        if (inmate.path.length === 0) {
          // Need a new path
          const targetTile = findZoneTile(game.state.zones, targetZoneType);
          if (targetTile) {
            const path = findPath(game.state.grid, inmate.pos, targetTile, false);
            if (path.length > 0) {
              setInmatePath(inmate, path);
              inmate.state = InmateState.MOVING;
            }
          }
        }
        
        // Move along path
        if (inmate.path.length > 1) {
          updateInmatePosition(inmate);
        }
      }
    }
    
    // Update needs (decay) and frustration
    updateNeeds(inmate, dt);
    updateFrustration(inmate);
  }
  
  // Process security events (fights)
  const newEvents = processSecurityEvents(
    game.state.events,
    game.state.inmates,
    game.state.staff
  );
  
  for (const event of newEvents) {
    addMessage(game, `FIGHT at (${event.pos.x}, ${event.pos.y})!`);
  }
}

// Building
export function setSelectedTool(game: Game, tool: BuildTool): void {
  game.state.selectedTool = tool;
}

export function setSelectedObject(game: Game, obj: ObjectType): void {
  game.state.selectedObject = obj;
}

export function setSelectedZone(game: Game, zone: ZoneType): void {
  game.state.selectedZone = zone;
}

export function buildTile(game: Game, x: number, y: number, type: TileType): boolean {
  if (!isInBounds(x, y)) return false;
  
  const cost = TILE_COSTS[type];
  
  if (!canAfford(game.economy, cost)) {
    addMessage(game, `Can't afford ${type} ($${cost})`);
    return false;
  }
  
  if (!spendMoney(game.economy, cost)) {
    return false;
  }
  
  setTile(game.state.grid, x, y, type);
  return true;
}

export function placeObjectAt(game: Game, x: number, y: number, obj: ObjectType): boolean {
  if (!isInBounds(x, y)) return false;
  
  const tile = getTile(game.state.grid, x, y);
  if (!tile || tile.type !== TileType.FLOOR) {
    addMessage(game, 'Objects can only be placed on floor tiles');
    return false;
  }
  
  if (tile.object !== ObjectType.NONE) {
    addMessage(game, 'Tile already has an object');
    return false;
  }
  
  const cost = OBJECT_COSTS[obj];
  
  if (!canAfford(game.economy, cost)) {
    addMessage(game, `Can't afford ${obj} ($${cost})`);
    return false;
  }
  
  if (!spendMoney(game.economy, cost)) {
    return false;
  }
  
  setObject(game.state.grid, x, y, obj);
  return true;
}

export function removeObject(game: Game, x: number, y: number): boolean {
  if (!isInBounds(x, y)) return false;
  
  const tile = getTile(game.state.grid, x, y);
  if (!tile || tile.object === ObjectType.NONE) {
    return false;
  }
  
  setObject(game.state.grid, x, y, ObjectType.NONE);
  return true;
}

// Staffing
export function hireStaff(game: Game, type: StaffType, pos: Position): Staff | null {
  const cost = STAFF_COSTS[type];
  
  // Check if position is valid (walkable)
  const tile = getTile(game.state.grid, pos.x, pos.y);
  if (!tile || (tile.type !== TileType.FLOOR && tile.type !== TileType.GRASS)) {
    addMessage(game, 'Invalid position for staff');
    return null;
  }
  
  if (!canAfford(game.economy, cost)) {
    addMessage(game, `Can't afford ${type} ($${cost})`);
    return null;
  }
  
  if (!spendMoney(game.economy, cost)) {
    return null;
  }
  
  const staff = createStaff(type, pos);
  game.state.staff.push(staff);
  addMessage(game, `Hired ${type}`);
  
  return staff;
}

export function fireStaff(game: Game, staffId: string): boolean {
  const index = game.state.staff.findIndex(s => s.id === staffId);
  if (index === -1) return false;
  
  game.state.staff.splice(index, 1);
  addMessage(game, 'Staff fired');
  return true;
}

// Inmates
export function admitInmate(
  game: Game, 
  name: string, 
  security: SecurityLevel, 
  sentence: number
): Inmate | null {
  // Find a cell to place the inmate
  const cell = game.state.zones.find(z => z.type === ZoneType.CELL);
  
  if (!cell || cell.tiles.length === 0) {
    addMessage(game, 'No cell available for new inmate');
    return null;
  }
  
  // Use first tile in cell as spawn point
  const pos = cell.tiles[0];
  
  const inmate = createInmate(name, security, sentence, pos);
  game.state.inmates.push(inmate);
  addMessage(game, `Inmate ${name} admitted`);
  
  return inmate;
}

export function releaseInmate(game: Game, inmateId: string): boolean {
  const index = game.state.inmates.findIndex(i => i.id === inmateId);
  if (index === -1) return false;
  
  const inmate = game.state.inmates[index];
  game.state.inmates.splice(index, 1);
  addMessage(game, `Inmate ${inmate.name} released`);
  return true;
}

// Zones
export function placeZoneAt(
  game: Game, 
  type: ZoneType, 
  tiles: Position[]
): boolean {
  const zone = createZone(type, tiles);
  
  // Validate zone
  if (!validateZone(game.state.grid, zone)) {
    addMessage(game, `Invalid ${type} zone - check enclosure and required objects`);
    return false;
  }
  
  // Check for overlapping zones
  for (const tile of tiles) {
    const existingZone = game.state.zones.find(z => 
      z.tiles.some(t => t.x === tile.x && t.y === tile.y)
    );
    if (existingZone) {
      addMessage(game, 'Zone overlaps with existing zone');
      return false;
    }
  }
  
  game.state.zones.push(zone);
  
  // Mark tiles as belonging to zone
  for (const tile of tiles) {
    const gridTile = getTile(game.state.grid, tile.x, tile.y);
    if (gridTile) {
      gridTile.zone = type;
    }
  }
  
  addMessage(game, `${type} zone created`);
  return true;
}

export function removeZone(game: Game, zoneId: string): boolean {
  const index = game.state.zones.findIndex(z => z.id === zoneId);
  if (index === -1) return false;
  
  const zone = game.state.zones[index];
  
  // Clear zone from tiles
  for (const tile of zone.tiles) {
    const gridTile = getTile(game.state.grid, tile.x, tile.y);
    if (gridTile) {
      gridTile.zone = ZoneType.NONE;
    }
  }
  
  game.state.zones.splice(index, 1);
  return true;
}

// Getters
export function getMoney(game: Game): number {
  return game.economy.money;
}

export function getDay(game: Game): number {
  return game.state.day;
}

export function getHour(game: Game): number {
  return game.state.hour;
}

export function getMinute(game: Game): number {
  return game.state.minute;
}

export function getStaffCount(game: Game): number {
  return game.state.staff.length;
}

export function getInmateCount(game: Game): number {
  return game.state.inmates.length;
}

export function getGrid(game: Game): Tile[][] {
  return game.state.grid;
}
