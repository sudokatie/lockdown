import { Inmate, InmateState, SecurityLevel, Needs, Position, Tile } from './types';
import { NEED_DECAY_RATES, FRUSTRATION_THRESHOLD, MIN_TOLERANCE, MAX_TOLERANCE } from './constants';
import { findPath, getNextStep } from './Pathfinding';

let inmateIdCounter = 0;

export function generateInmateId(): string {
  return `inmate_${++inmateIdCounter}`;
}

export function resetInmateIdCounter(): void {
  inmateIdCounter = 0;
}

export function createNeeds(): Needs {
  return {
    food: 100,
    sleep: 100,
    hygiene: 100,
    exercise: 100,
    freedom: 100
  };
}

export function createInmate(
  name: string,
  security: SecurityLevel,
  sentence: number,
  pos: Position
): Inmate {
  // Random tolerance between MIN and MAX
  const tolerance = MIN_TOLERANCE + Math.random() * (MAX_TOLERANCE - MIN_TOLERANCE);
  
  return {
    id: generateInmateId(),
    name,
    pos: { ...pos },
    security,
    sentence,
    state: InmateState.SLEEPING,
    needs: createNeeds(),
    frustration: 0,
    tolerance: Math.floor(tolerance),
    path: []
  };
}

export function updateNeeds(inmate: Inmate, dt: number): void {
  const keys = Object.keys(inmate.needs) as (keyof Needs)[];
  
  for (const key of keys) {
    const decay = NEED_DECAY_RATES[key] * dt;
    inmate.needs[key] = Math.max(0, inmate.needs[key] - decay);
  }
}

export function satisfyNeed(inmate: Inmate, need: keyof Needs, amount: number): void {
  inmate.needs[need] = Math.min(100, inmate.needs[need] + amount);
}

export function satisfyAllNeeds(inmate: Inmate, needs: Partial<Record<keyof Needs, number>>): void {
  for (const [need, amount] of Object.entries(needs)) {
    if (amount !== undefined) {
      satisfyNeed(inmate, need as keyof Needs, amount);
    }
  }
}

export function calculateFrustration(inmate: Inmate): number {
  let frustration = 0;
  const threshold = 50; // Needs below 50 cause frustration
  
  for (const need of Object.values(inmate.needs)) {
    if (need < threshold) {
      frustration += (threshold - need);
    }
  }
  
  return frustration;
}

export function updateFrustration(inmate: Inmate): void {
  inmate.frustration = calculateFrustration(inmate);
}

export function isFrustrated(inmate: Inmate): boolean {
  return inmate.frustration > inmate.tolerance;
}

export function setInmateState(inmate: Inmate, state: InmateState): void {
  inmate.state = state;
}

export function moveInmate(inmate: Inmate, target: Position): void {
  inmate.pos = { ...target };
}

export function setInmatePath(inmate: Inmate, path: Position[]): void {
  inmate.path = [...path];
}

export function clearInmatePath(inmate: Inmate): void {
  inmate.path = [];
}

export function updateInmatePosition(inmate: Inmate): boolean {
  if (inmate.path.length < 2) {
    return false;
  }
  
  // Move to next position in path
  const next = inmate.path[1];
  inmate.pos = { ...next };
  inmate.path.shift();
  
  return true;
}

export function hasReachedDestination(inmate: Inmate): boolean {
  return inmate.path.length <= 1;
}

export function getInmateAtPosition(inmates: Inmate[], pos: Position): Inmate | null {
  return inmates.find(i => i.pos.x === pos.x && i.pos.y === pos.y) || null;
}

export function getNearbyInmates(inmates: Inmate[], pos: Position, range: number): Inmate[] {
  return inmates.filter(i => {
    const dx = Math.abs(i.pos.x - pos.x);
    const dy = Math.abs(i.pos.y - pos.y);
    return dx + dy <= range;
  });
}

export function getFrustratedInmates(inmates: Inmate[]): Inmate[] {
  return inmates.filter(i => isFrustrated(i));
}

export function decreaseSentence(inmate: Inmate): void {
  inmate.sentence = Math.max(0, inmate.sentence - 1);
}

export function isSentenceComplete(inmate: Inmate): boolean {
  return inmate.sentence <= 0;
}

export function getLowestNeed(inmate: Inmate): keyof Needs {
  let lowest: keyof Needs = 'food';
  let lowestValue = inmate.needs.food;
  
  for (const [need, value] of Object.entries(inmate.needs)) {
    if (value < lowestValue) {
      lowest = need as keyof Needs;
      lowestValue = value;
    }
  }
  
  return lowest;
}

export function getNeedValue(inmate: Inmate, need: keyof Needs): number {
  return inmate.needs[need];
}

export function isInLockdown(inmate: Inmate): boolean {
  return inmate.state === InmateState.LOCKDOWN;
}

export function sendToLockdown(inmate: Inmate): void {
  inmate.state = InmateState.LOCKDOWN;
  inmate.path = [];
}

export function releaseFromLockdown(inmate: Inmate): void {
  if (inmate.state === InmateState.LOCKDOWN) {
    inmate.state = InmateState.SLEEPING;
  }
}
