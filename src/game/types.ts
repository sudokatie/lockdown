// Enums
export enum TileType {
  EMPTY = 'EMPTY',
  FLOOR = 'FLOOR',
  WALL = 'WALL',
  DOOR = 'DOOR',
  FENCE = 'FENCE',
  GRASS = 'GRASS'
}

export enum ZoneType {
  NONE = 'NONE',
  CELL = 'CELL',
  CANTEEN = 'CANTEEN',
  KITCHEN = 'KITCHEN',
  YARD = 'YARD',
  SHOWER = 'SHOWER',
  OFFICE = 'OFFICE',
  COMMON = 'COMMON'
}

export enum ObjectType {
  NONE = 'NONE',
  BED = 'BED',
  TOILET = 'TOILET',
  TABLE = 'TABLE',
  BENCH = 'BENCH',
  COOKER = 'COOKER',
  FRIDGE = 'FRIDGE',
  SINK = 'SINK',
  SHOWERHEAD = 'SHOWERHEAD',
  DRAIN = 'DRAIN',
  DESK = 'DESK',
  CHAIR = 'CHAIR',
  TV = 'TV'
}

export enum StaffType {
  GUARD = 'GUARD',
  COOK = 'COOK',
  JANITOR = 'JANITOR'
}

export enum StaffState {
  IDLE = 'IDLE',
  WORKING = 'WORKING',
  PATROLLING = 'PATROLLING',
  RESPONDING = 'RESPONDING'
}

export enum InmateState {
  SLEEPING = 'SLEEPING',
  EATING = 'EATING',
  SHOWERING = 'SHOWERING',
  YARD = 'YARD',
  FREE = 'FREE',
  LOCKDOWN = 'LOCKDOWN',
  MOVING = 'MOVING'
}

export enum SecurityLevel {
  MIN = 'MIN',
  MED = 'MED',
  MAX = 'MAX'
}

export enum EventType {
  FIGHT = 'FIGHT',
  SEARCH = 'SEARCH',
  LOCKDOWN = 'LOCKDOWN'
}

export enum Activity {
  SLEEP = 'SLEEP',
  WAKE = 'WAKE',
  EAT = 'EAT',
  WORK = 'WORK',
  YARD = 'YARD',
  FREE = 'FREE',
  SHOWER = 'SHOWER'
}

export enum GameScreen {
  TITLE = 'TITLE',
  PLAYING = 'PLAYING',
  PAUSED = 'PAUSED',
  GAME_OVER = 'GAME_OVER'
}

export enum BuildTool {
  NONE = 'NONE',
  WALL = 'WALL',
  FLOOR = 'FLOOR',
  DOOR = 'DOOR',
  FENCE = 'FENCE',
  GRASS = 'GRASS',
  OBJECT = 'OBJECT',
  ZONE = 'ZONE'
}

// Interfaces
export interface Position {
  x: number;
  y: number;
}

export interface Tile {
  type: TileType;
  zone: ZoneType;
  object: ObjectType;
  passable: boolean;
}

export interface Zone {
  id: string;
  type: ZoneType;
  tiles: Position[];
  valid: boolean;
}

export interface Staff {
  id: string;
  type: StaffType;
  pos: Position;
  state: StaffState;
  tiredness: number;
  assignedZone: string | null;
  path: Position[];
}

export interface Needs {
  food: number;
  sleep: number;
  hygiene: number;
  exercise: number;
  freedom: number;
}

export interface Inmate {
  id: string;
  name: string;
  pos: Position;
  security: SecurityLevel;
  sentence: number;
  state: InmateState;
  needs: Needs;
  frustration: number;
  tolerance: number;
  path: Position[];
}

export interface ScheduleBlock {
  startHour: number;
  endHour: number;
  activity: Activity;
  targetZone: ZoneType;
}

export interface SecurityEvent {
  id: string;
  type: EventType;
  participants: string[];
  pos: Position;
  resolved: boolean;
}

export interface GameState {
  screen: GameScreen;
  grid: Tile[][];
  zones: Zone[];
  staff: Staff[];
  inmates: Inmate[];
  events: SecurityEvent[];
  money: number;
  day: number;
  hour: number;
  minute: number;
  paused: boolean;
  messages: string[];
  selectedTool: BuildTool;
  selectedObject: ObjectType;
  selectedZone: ZoneType;
  schedule: ScheduleBlock[];
}
