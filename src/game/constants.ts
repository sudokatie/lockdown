import { StaffType, TileType, ObjectType, ZoneType, Activity, ScheduleBlock } from './types';

// Grid
export const GRID_WIDTH = 40;
export const GRID_HEIGHT = 30;
export const TILE_SIZE = 24;
export const CANVAS_WIDTH = GRID_WIDTH * TILE_SIZE; // 960
export const CANVAS_HEIGHT = GRID_HEIGHT * TILE_SIZE; // 720

// Economy
export const STARTING_MONEY = 30000;
export const DAILY_GRANT_PER_INMATE = 50;
export const DAILY_FOOD_COST_PER_INMATE = 5;

// Staff costs per day
export const STAFF_COSTS: Record<StaffType, number> = {
  [StaffType.GUARD]: 100,
  [StaffType.COOK]: 75,
  [StaffType.JANITOR]: 50
};

// Construction costs
export const TILE_COSTS: Record<TileType, number> = {
  [TileType.EMPTY]: 0,
  [TileType.FLOOR]: 10,
  [TileType.WALL]: 50,
  [TileType.DOOR]: 100,
  [TileType.FENCE]: 25,
  [TileType.GRASS]: 5
};

export const OBJECT_COSTS: Record<ObjectType, number> = {
  [ObjectType.NONE]: 0,
  [ObjectType.BED]: 100,
  [ObjectType.TOILET]: 75,
  [ObjectType.TABLE]: 50,
  [ObjectType.BENCH]: 25,
  [ObjectType.COOKER]: 300,
  [ObjectType.FRIDGE]: 200,
  [ObjectType.SINK]: 100,
  [ObjectType.SHOWERHEAD]: 150,
  [ObjectType.DRAIN]: 50,
  [ObjectType.DESK]: 75,
  [ObjectType.CHAIR]: 25,
  [ObjectType.TV]: 200
};

// Zone minimum sizes (width x height)
export const ZONE_MIN_SIZE: Record<ZoneType, { w: number; h: number }> = {
  [ZoneType.NONE]: { w: 0, h: 0 },
  [ZoneType.CELL]: { w: 2, h: 3 },
  [ZoneType.CANTEEN]: { w: 4, h: 4 },
  [ZoneType.KITCHEN]: { w: 3, h: 3 },
  [ZoneType.YARD]: { w: 5, h: 5 },
  [ZoneType.SHOWER]: { w: 3, h: 3 },
  [ZoneType.OFFICE]: { w: 2, h: 2 },
  [ZoneType.COMMON]: { w: 4, h: 4 }
};

// Required objects for each zone type
export const ZONE_REQUIRED_OBJECTS: Record<ZoneType, ObjectType[]> = {
  [ZoneType.NONE]: [],
  [ZoneType.CELL]: [ObjectType.BED, ObjectType.TOILET],
  [ZoneType.CANTEEN]: [ObjectType.TABLE, ObjectType.BENCH],
  [ZoneType.KITCHEN]: [ObjectType.COOKER, ObjectType.FRIDGE, ObjectType.SINK],
  [ZoneType.YARD]: [],
  [ZoneType.SHOWER]: [ObjectType.SHOWERHEAD, ObjectType.DRAIN],
  [ZoneType.OFFICE]: [ObjectType.DESK, ObjectType.CHAIR],
  [ZoneType.COMMON]: [ObjectType.TV]
};

// Needs decay rates per second
export const NEED_DECAY_RATES: Record<keyof import('./types').Needs, number> = {
  food: 0.5,      // Hungry after ~3 minutes
  sleep: 0.3,     // Tired after ~5 minutes
  hygiene: 0.4,   // Dirty after ~4 minutes
  exercise: 0.3,  // Restless after ~5 minutes
  freedom: 0.2    // Stir crazy after ~8 minutes
};

// Frustration
export const FRUSTRATION_THRESHOLD = 70;
export const FRUSTRATION_PER_UNMET_NEED = 5;
export const MIN_TOLERANCE = 50;
export const MAX_TOLERANCE = 80;

// Security
export const FIGHT_RANGE = 2;
export const GUARD_RESPONSE_RANGE = 3;
export const LOCKDOWN_DURATION = 6; // hours

// Game over
export const BANKRUPTCY_THRESHOLD = -10000;

// Default schedule
export const DEFAULT_SCHEDULE: ScheduleBlock[] = [
  { startHour: 0, endHour: 6, activity: Activity.SLEEP, targetZone: ZoneType.CELL },
  { startHour: 6, endHour: 7, activity: Activity.SHOWER, targetZone: ZoneType.SHOWER },
  { startHour: 7, endHour: 8, activity: Activity.EAT, targetZone: ZoneType.CANTEEN },
  { startHour: 8, endHour: 12, activity: Activity.YARD, targetZone: ZoneType.YARD },
  { startHour: 12, endHour: 13, activity: Activity.EAT, targetZone: ZoneType.CANTEEN },
  { startHour: 13, endHour: 17, activity: Activity.YARD, targetZone: ZoneType.YARD },
  { startHour: 17, endHour: 18, activity: Activity.EAT, targetZone: ZoneType.CANTEEN },
  { startHour: 18, endHour: 21, activity: Activity.FREE, targetZone: ZoneType.COMMON },
  { startHour: 21, endHour: 24, activity: Activity.SLEEP, targetZone: ZoneType.CELL }
];

// Colors for rendering
export const TILE_COLORS: Record<TileType, string> = {
  [TileType.EMPTY]: '#1a1a2a',
  [TileType.FLOOR]: '#4a4a5a',
  [TileType.WALL]: '#2a2a3a',
  [TileType.DOOR]: '#6a5a4a',
  [TileType.FENCE]: '#3a3a3a',
  [TileType.GRASS]: '#3a5a3a'
};

export const ZONE_COLORS: Record<ZoneType, string> = {
  [ZoneType.NONE]: 'transparent',
  [ZoneType.CELL]: 'rgba(100, 100, 150, 0.3)',
  [ZoneType.CANTEEN]: 'rgba(150, 150, 100, 0.3)',
  [ZoneType.KITCHEN]: 'rgba(150, 100, 100, 0.3)',
  [ZoneType.YARD]: 'rgba(100, 150, 100, 0.3)',
  [ZoneType.SHOWER]: 'rgba(100, 150, 150, 0.3)',
  [ZoneType.OFFICE]: 'rgba(150, 100, 150, 0.3)',
  [ZoneType.COMMON]: 'rgba(150, 120, 100, 0.3)'
};

export const ENTITY_COLORS = {
  inmate: '#ff8844',
  guard: '#4488ff',
  cook: '#ffffff',
  janitor: '#88ff88'
};
