import { SecurityEvent, EventType, Position, Inmate, Staff, StaffType } from './types';
import { isFrustrated, getNearbyInmates as getInmatesNearby, sendToLockdown } from './Inmate';
import { getNearbyStaff, canResolveEvent } from './Staff';
import { getDistance } from './Pathfinding';
import { FIGHT_RANGE, GUARD_RESPONSE_RANGE } from './constants';

let eventIdCounter = 0;

export function generateEventId(): string {
  return `event_${++eventIdCounter}`;
}

export function resetEventIdCounter(): void {
  eventIdCounter = 0;
}

export function createSecurityEvent(
  type: EventType,
  pos: Position,
  participants: string[]
): SecurityEvent {
  return {
    id: generateEventId(),
    type,
    pos: { ...pos },
    participants: [...participants],
    resolved: false
  };
}

export function getNearbyInmates(inmates: Inmate[], pos: Position, range: number): Inmate[] {
  return getInmatesNearby(inmates, pos, range);
}

export function getFrustratedInmatesNear(inmates: Inmate[], pos: Position, range: number): Inmate[] {
  return getNearbyInmates(inmates, pos, range).filter(i => isFrustrated(i));
}

export function checkForFight(inmates: Inmate[]): SecurityEvent | null {
  // Find frustrated inmates
  const frustrated = inmates.filter(i => isFrustrated(i));
  
  if (frustrated.length < 2) {
    return null;
  }
  
  // Check if any two frustrated inmates are near each other
  for (let i = 0; i < frustrated.length; i++) {
    for (let j = i + 1; j < frustrated.length; j++) {
      const dist = getDistance(frustrated[i].pos, frustrated[j].pos);
      if (dist <= FIGHT_RANGE) {
        // Start a fight between these two, plus any nearby frustrated inmates
        const fightPos = frustrated[i].pos;
        const participants = [frustrated[i], frustrated[j]];
        
        // Check for other nearby frustrated inmates who join the fight
        for (let k = 0; k < frustrated.length; k++) {
          if (k !== i && k !== j) {
            const distToFight = getDistance(frustrated[k].pos, fightPos);
            if (distToFight <= FIGHT_RANGE) {
              participants.push(frustrated[k]);
            }
          }
        }
        
        return startFight(participants);
      }
    }
  }
  
  return null;
}

export function startFight(participants: Inmate[]): SecurityEvent {
  if (participants.length < 2) {
    throw new Error('Fight requires at least 2 participants');
  }
  
  // Use first participant's position as fight location
  const pos = { ...participants[0].pos };
  const ids = participants.map(p => p.id);
  
  return createSecurityEvent(EventType.FIGHT, pos, ids);
}

export function canResolveFight(staff: Staff[], event: SecurityEvent): boolean {
  if (event.resolved) return false;
  
  // Check if any guard is within response range
  const guards = staff.filter(s => s.type === StaffType.GUARD);
  
  for (const guard of guards) {
    if (canResolveEvent(guard, event, GUARD_RESPONSE_RANGE)) {
      return true;
    }
  }
  
  return false;
}

export function resolveFight(
  event: SecurityEvent,
  inmates: Inmate[]
): void {
  // Mark event as resolved
  event.resolved = true;
  
  // Send all participants to lockdown
  for (const inmateId of event.participants) {
    const inmate = inmates.find(i => i.id === inmateId);
    if (inmate) {
      sendToLockdown(inmate);
    }
  }
}

export function getUnresolvedEvents(events: SecurityEvent[]): SecurityEvent[] {
  return events.filter(e => !e.resolved);
}

export function getEventsByType(events: SecurityEvent[], type: EventType): SecurityEvent[] {
  return events.filter(e => e.type === type);
}

export function getUnresolvedFights(events: SecurityEvent[]): SecurityEvent[] {
  return events.filter(e => e.type === EventType.FIGHT && !e.resolved);
}

export function isEventAtPosition(event: SecurityEvent, pos: Position): boolean {
  return event.pos.x === pos.x && event.pos.y === pos.y;
}

export function getEventAtPosition(events: SecurityEvent[], pos: Position): SecurityEvent | null {
  return events.find(e => isEventAtPosition(e, pos)) || null;
}

export function processSecurityEvents(
  events: SecurityEvent[],
  inmates: Inmate[],
  staff: Staff[]
): SecurityEvent[] {
  const newEvents: SecurityEvent[] = [];
  
  // Check for new fights
  const fight = checkForFight(inmates);
  if (fight) {
    newEvents.push(fight);
    events.push(fight);
  }
  
  // Try to resolve existing fights
  for (const event of getUnresolvedFights(events)) {
    if (canResolveFight(staff, event)) {
      resolveFight(event, inmates);
    }
  }
  
  return newEvents;
}
