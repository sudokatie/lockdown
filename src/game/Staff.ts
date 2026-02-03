import { Staff, StaffType, StaffState, Position, Tile, SecurityEvent } from './types';
import { findPath, getNextStep, getDistance } from './Pathfinding';

let staffIdCounter = 0;

export function generateStaffId(): string {
  return `staff_${++staffIdCounter}`;
}

export function resetStaffIdCounter(): void {
  staffIdCounter = 0;
}

export function createStaff(type: StaffType, pos: Position): Staff {
  return {
    id: generateStaffId(),
    type,
    pos: { ...pos },
    state: StaffState.IDLE,
    tiredness: 0,
    assignedZone: null,
    path: []
  };
}

export function assignToZone(staff: Staff, zoneId: string | null): void {
  staff.assignedZone = zoneId;
}

export function setStaffState(staff: Staff, state: StaffState): void {
  staff.state = state;
}

export function setStaffPath(staff: Staff, path: Position[]): void {
  staff.path = [...path];
}

export function clearStaffPath(staff: Staff): void {
  staff.path = [];
}

export function moveStaff(staff: Staff): boolean {
  if (staff.path.length < 2) {
    return false;
  }
  
  // Move to next position in path
  const next = staff.path[1];
  staff.pos = { ...next };
  staff.path.shift();
  
  return true;
}

export function hasReachedDestination(staff: Staff): boolean {
  return staff.path.length <= 1;
}

export function increaseTiredness(staff: Staff, amount: number): void {
  staff.tiredness = Math.min(100, staff.tiredness + amount);
}

export function decreaseTiredness(staff: Staff, amount: number): void {
  staff.tiredness = Math.max(0, staff.tiredness - amount);
}

export function isTired(staff: Staff): boolean {
  return staff.tiredness >= 80;
}

export function isStaffNearby(staff: Staff[], pos: Position, range: number, type?: StaffType): boolean {
  return staff.some(s => {
    if (type && s.type !== type) return false;
    const dist = getDistance(s.pos, pos);
    return dist <= range;
  });
}

export function getNearbyStaff(staff: Staff[], pos: Position, range: number, type?: StaffType): Staff[] {
  return staff.filter(s => {
    if (type && s.type !== type) return false;
    const dist = getDistance(s.pos, pos);
    return dist <= range;
  });
}

export function getStaffAtPosition(staff: Staff[], pos: Position): Staff | null {
  return staff.find(s => s.pos.x === pos.x && s.pos.y === pos.y) || null;
}

export function getStaffByType(staff: Staff[], type: StaffType): Staff[] {
  return staff.filter(s => s.type === type);
}

export function getIdleStaff(staff: Staff[]): Staff[] {
  return staff.filter(s => s.state === StaffState.IDLE);
}

export function getRespondingGuards(staff: Staff[]): Staff[] {
  return staff.filter(s => s.type === StaffType.GUARD && s.state === StaffState.RESPONDING);
}

// Guard-specific functions
export function startPatrol(staff: Staff, grid: Tile[][], patrolPoints: Position[]): void {
  if (staff.type !== StaffType.GUARD) return;
  if (patrolPoints.length === 0) return;
  
  staff.state = StaffState.PATROLLING;
  const path = findPath(grid, staff.pos, patrolPoints[0], true);
  staff.path = path;
}

export function respondToEvent(staff: Staff, grid: Tile[][], event: SecurityEvent): void {
  if (staff.type !== StaffType.GUARD) return;
  
  staff.state = StaffState.RESPONDING;
  const path = findPath(grid, staff.pos, event.pos, true);
  staff.path = path;
}

export function isGuardAtEvent(staff: Staff, event: SecurityEvent): boolean {
  if (staff.type !== StaffType.GUARD) return false;
  return staff.pos.x === event.pos.x && staff.pos.y === event.pos.y;
}

export function canResolveEvent(staff: Staff, event: SecurityEvent, range: number): boolean {
  if (staff.type !== StaffType.GUARD) return false;
  const dist = getDistance(staff.pos, event.pos);
  return dist <= range;
}

// Cook-specific functions
export function isMealTime(hour: number): boolean {
  // Breakfast: 7, Lunch: 12, Dinner: 17
  return hour === 7 || hour === 12 || hour === 17;
}

export function startWorking(staff: Staff, grid: Tile[][], targetPos: Position): void {
  staff.state = StaffState.WORKING;
  const path = findPath(grid, staff.pos, targetPos, true);
  staff.path = path;
}

export function stopWorking(staff: Staff): void {
  staff.state = StaffState.IDLE;
  staff.path = [];
}

// Update function for staff AI
export function updateStaff(
  staff: Staff,
  grid: Tile[][],
  hour: number,
  events: SecurityEvent[],
  kitchenPos: Position | null
): void {
  // Increase tiredness over time
  increaseTiredness(staff, 0.1);
  
  switch (staff.type) {
    case StaffType.GUARD:
      updateGuard(staff, grid, events);
      break;
    case StaffType.COOK:
      updateCook(staff, grid, hour, kitchenPos);
      break;
    case StaffType.JANITOR:
      updateJanitor(staff);
      break;
  }
}

function updateGuard(staff: Staff, grid: Tile[][], events: SecurityEvent[]): void {
  // Check for unresolved events
  const unresolvedEvents = events.filter(e => !e.resolved);
  
  if (unresolvedEvents.length > 0 && staff.state !== StaffState.RESPONDING) {
    // Find nearest event
    let nearest = unresolvedEvents[0];
    let nearestDist = getDistance(staff.pos, nearest.pos);
    
    for (const event of unresolvedEvents) {
      const dist = getDistance(staff.pos, event.pos);
      if (dist < nearestDist) {
        nearest = event;
        nearestDist = dist;
      }
    }
    
    respondToEvent(staff, grid, nearest);
  }
  
  // Move along path if we have one
  if (staff.path.length > 1) {
    moveStaff(staff);
  } else if (staff.state === StaffState.RESPONDING) {
    // Arrived at event location
    staff.state = StaffState.IDLE;
  }
}

function updateCook(staff: Staff, grid: Tile[][], hour: number, kitchenPos: Position | null): void {
  if (isMealTime(hour)) {
    if (staff.state !== StaffState.WORKING && kitchenPos) {
      startWorking(staff, grid, kitchenPos);
    }
    
    // Move toward kitchen if not there
    if (staff.path.length > 1) {
      moveStaff(staff);
    }
  } else {
    if (staff.state === StaffState.WORKING) {
      stopWorking(staff);
    }
  }
}

function updateJanitor(staff: Staff): void {
  // Basic MVP - janitors just stay idle for now
  // Future: Clean dirty areas
  if (staff.path.length > 1) {
    moveStaff(staff);
  }
}
