import {
  createSecurityEvent,
  resetEventIdCounter,
  getNearbyInmates,
  getFrustratedInmatesNear,
  checkForFight,
  startFight,
  canResolveFight,
  resolveFight,
  getUnresolvedEvents,
  getEventsByType,
  getUnresolvedFights,
  isEventAtPosition,
  getEventAtPosition,
  processSecurityEvents
} from '../game/Security';
import { createStaff, resetStaffIdCounter } from '../game/Staff';
import { createInmate, resetInmateIdCounter } from '../game/Inmate';
import { Inmate, Staff, SecurityEvent, EventType, InmateState, SecurityLevel, StaffType, StaffState } from '../game/types';
import { FIGHT_RANGE, GUARD_RESPONSE_RANGE } from '../game/constants';

describe('Security', () => {
  beforeEach(() => {
    resetEventIdCounter();
    resetInmateIdCounter();
    resetStaffIdCounter();
  });

  describe('createSecurityEvent', () => {
    it('creates event with correct properties', () => {
      const event = createSecurityEvent(EventType.FIGHT, { x: 5, y: 5 }, ['inmate_1', 'inmate_2']);
      expect(event.id).toBe('event_1');
      expect(event.type).toBe(EventType.FIGHT);
      expect(event.pos).toEqual({ x: 5, y: 5 });
      expect(event.participants).toEqual(['inmate_1', 'inmate_2']);
      expect(event.resolved).toBe(false);
    });

    it('generates unique event IDs', () => {
      const e1 = createSecurityEvent(EventType.FIGHT, { x: 0, y: 0 }, []);
      const e2 = createSecurityEvent(EventType.SEARCH, { x: 1, y: 1 }, []);
      expect(e1.id).toBe('event_1');
      expect(e2.id).toBe('event_2');
    });
  });

  describe('getNearbyInmates', () => {
    it('finds inmates within range', () => {
      const inmates: Inmate[] = [
        createInmate('Inmate A', SecurityLevel.MIN, 30, { x: 5, y: 5 }),
        createInmate('Inmate B', SecurityLevel.MIN, 30, { x: 7, y: 5 }),
        createInmate('Inmate C', SecurityLevel.MIN, 30, { x: 20, y: 20 })
      ];
      
      const nearby = getNearbyInmates(inmates, { x: 6, y: 5 }, 3);
      expect(nearby.length).toBe(2);
    });

    it('returns empty if none nearby', () => {
      const inmates: Inmate[] = [
        createInmate('Inmate A', SecurityLevel.MIN, 30, { x: 5, y: 5 })
      ];
      
      const nearby = getNearbyInmates(inmates, { x: 20, y: 20 }, 2);
      expect(nearby.length).toBe(0);
    });
  });

  describe('getFrustratedInmatesNear', () => {
    it('finds only frustrated inmates nearby', () => {
      const inmates: Inmate[] = [
        createInmate('Inmate A', SecurityLevel.MIN, 30, { x: 5, y: 5 }),
        createInmate('Inmate B', SecurityLevel.MIN, 30, { x: 6, y: 5 }),
        createInmate('Inmate C', SecurityLevel.MIN, 30, { x: 7, y: 5 })
      ];
      
      // Make first two frustrated
      inmates[0].frustration = 100;
      inmates[0].tolerance = 50;
      inmates[1].frustration = 100;
      inmates[1].tolerance = 50;
      inmates[2].frustration = 0;
      
      const frustrated = getFrustratedInmatesNear(inmates, { x: 6, y: 5 }, 3);
      expect(frustrated.length).toBe(2);
    });
  });

  describe('checkForFight', () => {
    it('returns null if no frustrated inmates', () => {
      const inmates: Inmate[] = [
        createInmate('Inmate A', SecurityLevel.MIN, 30, { x: 5, y: 5 }),
        createInmate('Inmate B', SecurityLevel.MIN, 30, { x: 6, y: 5 })
      ];
      
      const fight = checkForFight(inmates);
      expect(fight).toBeNull();
    });

    it('returns null if only one frustrated inmate', () => {
      const inmates: Inmate[] = [
        createInmate('Inmate A', SecurityLevel.MIN, 30, { x: 5, y: 5 }),
        createInmate('Inmate B', SecurityLevel.MIN, 30, { x: 6, y: 5 })
      ];
      
      inmates[0].frustration = 100;
      inmates[0].tolerance = 50;
      
      const fight = checkForFight(inmates);
      expect(fight).toBeNull();
    });

    it('returns fight event when frustrated inmates near each other', () => {
      const inmates: Inmate[] = [
        createInmate('Inmate A', SecurityLevel.MIN, 30, { x: 5, y: 5 }),
        createInmate('Inmate B', SecurityLevel.MIN, 30, { x: 6, y: 5 })
      ];
      
      inmates[0].frustration = 100;
      inmates[0].tolerance = 50;
      inmates[1].frustration = 100;
      inmates[1].tolerance = 50;
      
      const fight = checkForFight(inmates);
      expect(fight).not.toBeNull();
      expect(fight!.type).toBe(EventType.FIGHT);
      expect(fight!.participants.length).toBe(2);
    });

    it('returns null when frustrated inmates too far apart', () => {
      const inmates: Inmate[] = [
        createInmate('Inmate A', SecurityLevel.MIN, 30, { x: 5, y: 5 }),
        createInmate('Inmate B', SecurityLevel.MIN, 30, { x: 20, y: 20 })
      ];
      
      inmates[0].frustration = 100;
      inmates[0].tolerance = 50;
      inmates[1].frustration = 100;
      inmates[1].tolerance = 50;
      
      const fight = checkForFight(inmates);
      expect(fight).toBeNull();
    });

    it('includes nearby frustrated inmates in fight', () => {
      const inmates: Inmate[] = [
        createInmate('Inmate A', SecurityLevel.MIN, 30, { x: 5, y: 5 }),
        createInmate('Inmate B', SecurityLevel.MIN, 30, { x: 6, y: 5 }),
        createInmate('Inmate C', SecurityLevel.MIN, 30, { x: 5, y: 6 }), // Also within range
        createInmate('Inmate D', SecurityLevel.MIN, 30, { x: 20, y: 20 }) // Far away
      ];
      
      // Make first three frustrated
      inmates[0].frustration = 100;
      inmates[0].tolerance = 50;
      inmates[1].frustration = 100;
      inmates[1].tolerance = 50;
      inmates[2].frustration = 100;
      inmates[2].tolerance = 50;
      inmates[3].frustration = 100;
      inmates[3].tolerance = 50;
      
      const fight = checkForFight(inmates);
      expect(fight).not.toBeNull();
      expect(fight!.type).toBe(EventType.FIGHT);
      // Should include 3 participants (A, B, C) but not D (too far)
      expect(fight!.participants.length).toBe(3);
      expect(fight!.participants).toContain(inmates[0].id);
      expect(fight!.participants).toContain(inmates[1].id);
      expect(fight!.participants).toContain(inmates[2].id);
      expect(fight!.participants).not.toContain(inmates[3].id);
    });
  });

  describe('startFight', () => {
    it('creates fight event with participants', () => {
      const inmates: Inmate[] = [
        createInmate('Inmate A', SecurityLevel.MIN, 30, { x: 5, y: 5 }),
        createInmate('Inmate B', SecurityLevel.MIN, 30, { x: 6, y: 5 })
      ];
      
      const fight = startFight(inmates);
      expect(fight.type).toBe(EventType.FIGHT);
      expect(fight.participants).toContain(inmates[0].id);
      expect(fight.participants).toContain(inmates[1].id);
      expect(fight.pos).toEqual({ x: 5, y: 5 });
    });

    it('throws error for less than 2 participants', () => {
      const inmates: Inmate[] = [
        createInmate('Inmate A', SecurityLevel.MIN, 30, { x: 5, y: 5 })
      ];
      
      expect(() => startFight(inmates)).toThrow('Fight requires at least 2 participants');
    });
  });

  describe('canResolveFight', () => {
    it('returns false if event already resolved', () => {
      const event = createSecurityEvent(EventType.FIGHT, { x: 5, y: 5 }, []);
      event.resolved = true;
      
      const staff: Staff[] = [
        createStaff(StaffType.GUARD, { x: 5, y: 5 })
      ];
      
      expect(canResolveFight(staff, event)).toBe(false);
    });

    it('returns true if guard within response range', () => {
      const event = createSecurityEvent(EventType.FIGHT, { x: 5, y: 5 }, []);
      
      const staff: Staff[] = [
        createStaff(StaffType.GUARD, { x: 7, y: 5 }) // Distance 2, within range 3
      ];
      
      expect(canResolveFight(staff, event)).toBe(true);
    });

    it('returns false if guard too far away', () => {
      const event = createSecurityEvent(EventType.FIGHT, { x: 5, y: 5 }, []);
      
      const staff: Staff[] = [
        createStaff(StaffType.GUARD, { x: 20, y: 20 })
      ];
      
      expect(canResolveFight(staff, event)).toBe(false);
    });

    it('returns false if only non-guards nearby', () => {
      const event = createSecurityEvent(EventType.FIGHT, { x: 5, y: 5 }, []);
      
      const staff: Staff[] = [
        createStaff(StaffType.COOK, { x: 5, y: 5 }),
        createStaff(StaffType.JANITOR, { x: 5, y: 5 })
      ];
      
      expect(canResolveFight(staff, event)).toBe(false);
    });
  });

  describe('resolveFight', () => {
    it('sets event resolved to true', () => {
      const event = createSecurityEvent(EventType.FIGHT, { x: 5, y: 5 }, ['inmate_1']);
      const inmates: Inmate[] = [
        createInmate('Inmate A', SecurityLevel.MIN, 30, { x: 5, y: 5 })
      ];
      inmates[0].id = 'inmate_1';
      
      resolveFight(event, inmates);
      expect(event.resolved).toBe(true);
    });

    it('puts participants in lockdown', () => {
      const inmates: Inmate[] = [
        createInmate('Inmate A', SecurityLevel.MIN, 30, { x: 5, y: 5 }),
        createInmate('Inmate B', SecurityLevel.MIN, 30, { x: 6, y: 5 })
      ];
      
      const event = createSecurityEvent(
        EventType.FIGHT, 
        { x: 5, y: 5 }, 
        [inmates[0].id, inmates[1].id]
      );
      
      resolveFight(event, inmates);
      expect(inmates[0].state).toBe(InmateState.LOCKDOWN);
      expect(inmates[1].state).toBe(InmateState.LOCKDOWN);
    });
  });

  describe('event filtering', () => {
    it('gets unresolved events', () => {
      const events: SecurityEvent[] = [
        createSecurityEvent(EventType.FIGHT, { x: 5, y: 5 }, []),
        createSecurityEvent(EventType.FIGHT, { x: 10, y: 10 }, [])
      ];
      events[0].resolved = true;
      
      const unresolved = getUnresolvedEvents(events);
      expect(unresolved.length).toBe(1);
    });

    it('gets events by type', () => {
      const events: SecurityEvent[] = [
        createSecurityEvent(EventType.FIGHT, { x: 5, y: 5 }, []),
        createSecurityEvent(EventType.SEARCH, { x: 10, y: 10 }, []),
        createSecurityEvent(EventType.FIGHT, { x: 15, y: 15 }, [])
      ];
      
      const fights = getEventsByType(events, EventType.FIGHT);
      expect(fights.length).toBe(2);
    });

    it('gets unresolved fights', () => {
      const events: SecurityEvent[] = [
        createSecurityEvent(EventType.FIGHT, { x: 5, y: 5 }, []),
        createSecurityEvent(EventType.FIGHT, { x: 10, y: 10 }, []),
        createSecurityEvent(EventType.SEARCH, { x: 15, y: 15 }, [])
      ];
      events[0].resolved = true;
      
      const fights = getUnresolvedFights(events);
      expect(fights.length).toBe(1);
    });
  });

  describe('event position', () => {
    it('checks event at position', () => {
      const event = createSecurityEvent(EventType.FIGHT, { x: 5, y: 5 }, []);
      
      expect(isEventAtPosition(event, { x: 5, y: 5 })).toBe(true);
      expect(isEventAtPosition(event, { x: 6, y: 5 })).toBe(false);
    });

    it('gets event at position', () => {
      const events: SecurityEvent[] = [
        createSecurityEvent(EventType.FIGHT, { x: 5, y: 5 }, []),
        createSecurityEvent(EventType.FIGHT, { x: 10, y: 10 }, [])
      ];
      
      const found = getEventAtPosition(events, { x: 5, y: 5 });
      expect(found).not.toBeNull();
      expect(found!.id).toBe('event_1');
      
      const notFound = getEventAtPosition(events, { x: 20, y: 20 });
      expect(notFound).toBeNull();
    });
  });

  describe('processSecurityEvents', () => {
    it('detects new fights', () => {
      const inmates: Inmate[] = [
        createInmate('Inmate A', SecurityLevel.MIN, 30, { x: 5, y: 5 }),
        createInmate('Inmate B', SecurityLevel.MIN, 30, { x: 6, y: 5 })
      ];
      inmates[0].frustration = 100;
      inmates[0].tolerance = 50;
      inmates[1].frustration = 100;
      inmates[1].tolerance = 50;
      
      const events: SecurityEvent[] = [];
      const staff: Staff[] = [];
      
      const newEvents = processSecurityEvents(events, inmates, staff);
      expect(newEvents.length).toBe(1);
      expect(events.length).toBe(1);
    });

    it('resolves fights when guards nearby', () => {
      const inmates: Inmate[] = [
        createInmate('Inmate A', SecurityLevel.MIN, 30, { x: 5, y: 5 }),
        createInmate('Inmate B', SecurityLevel.MIN, 30, { x: 6, y: 5 })
      ];
      
      const events: SecurityEvent[] = [
        createSecurityEvent(EventType.FIGHT, { x: 5, y: 5 }, [inmates[0].id, inmates[1].id])
      ];
      
      const staff: Staff[] = [
        createStaff(StaffType.GUARD, { x: 6, y: 5 }) // Within range
      ];
      
      processSecurityEvents(events, inmates, staff);
      expect(events[0].resolved).toBe(true);
      expect(inmates[0].state).toBe(InmateState.LOCKDOWN);
    });

    it('does not resolve fights without guards', () => {
      const inmates: Inmate[] = [
        createInmate('Inmate A', SecurityLevel.MIN, 30, { x: 5, y: 5 }),
        createInmate('Inmate B', SecurityLevel.MIN, 30, { x: 6, y: 5 })
      ];
      
      const events: SecurityEvent[] = [
        createSecurityEvent(EventType.FIGHT, { x: 5, y: 5 }, [inmates[0].id, inmates[1].id])
      ];
      
      const staff: Staff[] = [
        createStaff(StaffType.COOK, { x: 5, y: 5 })
      ];
      
      processSecurityEvents(events, inmates, staff);
      expect(events[0].resolved).toBe(false);
    });
  });
});
