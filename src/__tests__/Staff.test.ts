import {
  createStaff,
  resetStaffIdCounter,
  assignToZone,
  setStaffState,
  setStaffPath,
  clearStaffPath,
  moveStaff,
  hasReachedDestination,
  increaseTiredness,
  decreaseTiredness,
  isTired,
  isStaffNearby,
  getNearbyStaff,
  getStaffAtPosition,
  getStaffByType,
  getIdleStaff,
  getRespondingGuards,
  startPatrol,
  respondToEvent,
  isGuardAtEvent,
  canResolveEvent,
  isMealTime,
  startWorking,
  stopWorking,
  updateStaff
} from '../game/Staff';
import { createGrid, setTile } from '../game/Grid';
import { Staff, StaffType, StaffState, Position, Tile, TileType, SecurityEvent, EventType } from '../game/types';

describe('Staff', () => {
  beforeEach(() => {
    resetStaffIdCounter();
  });

  describe('createStaff', () => {
    it('creates a GUARD correctly', () => {
      const guard = createStaff(StaffType.GUARD, { x: 5, y: 5 });
      expect(guard.id).toBe('staff_1');
      expect(guard.type).toBe(StaffType.GUARD);
      expect(guard.pos).toEqual({ x: 5, y: 5 });
      expect(guard.state).toBe(StaffState.IDLE);
      expect(guard.tiredness).toBe(0);
      expect(guard.assignedZone).toBeNull();
      expect(guard.path).toEqual([]);
    });

    it('creates a COOK correctly', () => {
      const cook = createStaff(StaffType.COOK, { x: 10, y: 10 });
      expect(cook.id).toBe('staff_1');
      expect(cook.type).toBe(StaffType.COOK);
      expect(cook.pos).toEqual({ x: 10, y: 10 });
      expect(cook.state).toBe(StaffState.IDLE);
    });

    it('creates a JANITOR correctly', () => {
      const janitor = createStaff(StaffType.JANITOR, { x: 3, y: 3 });
      expect(janitor.id).toBe('staff_1');
      expect(janitor.type).toBe(StaffType.JANITOR);
      expect(janitor.pos).toEqual({ x: 3, y: 3 });
    });

    it('generates unique IDs', () => {
      const s1 = createStaff(StaffType.GUARD, { x: 0, y: 0 });
      const s2 = createStaff(StaffType.COOK, { x: 1, y: 1 });
      const s3 = createStaff(StaffType.JANITOR, { x: 2, y: 2 });
      expect(s1.id).toBe('staff_1');
      expect(s2.id).toBe('staff_2');
      expect(s3.id).toBe('staff_3');
    });
  });

  describe('assignToZone', () => {
    it('assigns zone to staff', () => {
      const guard = createStaff(StaffType.GUARD, { x: 5, y: 5 });
      assignToZone(guard, 'zone_1');
      expect(guard.assignedZone).toBe('zone_1');
    });

    it('clears zone assignment', () => {
      const guard = createStaff(StaffType.GUARD, { x: 5, y: 5 });
      assignToZone(guard, 'zone_1');
      assignToZone(guard, null);
      expect(guard.assignedZone).toBeNull();
    });
  });

  describe('state management', () => {
    it('sets staff state', () => {
      const guard = createStaff(StaffType.GUARD, { x: 5, y: 5 });
      setStaffState(guard, StaffState.PATROLLING);
      expect(guard.state).toBe(StaffState.PATROLLING);
    });

    it('sets and clears path', () => {
      const guard = createStaff(StaffType.GUARD, { x: 5, y: 5 });
      const path: Position[] = [{ x: 5, y: 5 }, { x: 6, y: 5 }, { x: 7, y: 5 }];
      setStaffPath(guard, path);
      expect(guard.path).toEqual(path);
      clearStaffPath(guard);
      expect(guard.path).toEqual([]);
    });
  });

  describe('movement', () => {
    it('moves staff along path', () => {
      const guard = createStaff(StaffType.GUARD, { x: 5, y: 5 });
      guard.path = [{ x: 5, y: 5 }, { x: 6, y: 5 }, { x: 7, y: 5 }];
      
      const moved = moveStaff(guard);
      expect(moved).toBe(true);
      expect(guard.pos).toEqual({ x: 6, y: 5 });
      expect(guard.path.length).toBe(2);
    });

    it('returns false when no path', () => {
      const guard = createStaff(StaffType.GUARD, { x: 5, y: 5 });
      const moved = moveStaff(guard);
      expect(moved).toBe(false);
    });

    it('returns false when path has single point', () => {
      const guard = createStaff(StaffType.GUARD, { x: 5, y: 5 });
      guard.path = [{ x: 5, y: 5 }];
      const moved = moveStaff(guard);
      expect(moved).toBe(false);
    });

    it('detects reached destination', () => {
      const guard = createStaff(StaffType.GUARD, { x: 5, y: 5 });
      expect(hasReachedDestination(guard)).toBe(true);
      
      guard.path = [{ x: 5, y: 5 }];
      expect(hasReachedDestination(guard)).toBe(true);
      
      guard.path = [{ x: 5, y: 5 }, { x: 6, y: 5 }];
      expect(hasReachedDestination(guard)).toBe(false);
    });
  });

  describe('tiredness', () => {
    it('increases tiredness', () => {
      const guard = createStaff(StaffType.GUARD, { x: 5, y: 5 });
      increaseTiredness(guard, 30);
      expect(guard.tiredness).toBe(30);
    });

    it('caps tiredness at 100', () => {
      const guard = createStaff(StaffType.GUARD, { x: 5, y: 5 });
      increaseTiredness(guard, 150);
      expect(guard.tiredness).toBe(100);
    });

    it('decreases tiredness', () => {
      const guard = createStaff(StaffType.GUARD, { x: 5, y: 5 });
      guard.tiredness = 50;
      decreaseTiredness(guard, 20);
      expect(guard.tiredness).toBe(30);
    });

    it('caps tiredness at 0', () => {
      const guard = createStaff(StaffType.GUARD, { x: 5, y: 5 });
      guard.tiredness = 30;
      decreaseTiredness(guard, 50);
      expect(guard.tiredness).toBe(0);
    });

    it('detects tired staff', () => {
      const guard = createStaff(StaffType.GUARD, { x: 5, y: 5 });
      expect(isTired(guard)).toBe(false);
      
      guard.tiredness = 80;
      expect(isTired(guard)).toBe(true);
      
      guard.tiredness = 79;
      expect(isTired(guard)).toBe(false);
    });
  });

  describe('proximity checks', () => {
    it('detects staff nearby', () => {
      const staff: Staff[] = [
        createStaff(StaffType.GUARD, { x: 5, y: 5 }),
        createStaff(StaffType.COOK, { x: 10, y: 10 })
      ];
      
      expect(isStaffNearby(staff, { x: 6, y: 5 }, 2)).toBe(true);
      expect(isStaffNearby(staff, { x: 20, y: 20 }, 5)).toBe(false);
    });

    it('filters by staff type', () => {
      const staff: Staff[] = [
        createStaff(StaffType.GUARD, { x: 5, y: 5 }),
        createStaff(StaffType.COOK, { x: 6, y: 5 })
      ];
      
      expect(isStaffNearby(staff, { x: 7, y: 5 }, 3, StaffType.GUARD)).toBe(true);
      expect(isStaffNearby(staff, { x: 7, y: 5 }, 3, StaffType.COOK)).toBe(true);
      expect(isStaffNearby(staff, { x: 5, y: 5 }, 0, StaffType.COOK)).toBe(false);
    });

    it('gets nearby staff list', () => {
      const staff: Staff[] = [
        createStaff(StaffType.GUARD, { x: 5, y: 5 }),
        createStaff(StaffType.GUARD, { x: 6, y: 5 }),
        createStaff(StaffType.COOK, { x: 20, y: 20 })
      ];
      
      const nearby = getNearbyStaff(staff, { x: 5, y: 5 }, 2);
      expect(nearby.length).toBe(2);
    });

    it('gets staff at position', () => {
      const staff: Staff[] = [
        createStaff(StaffType.GUARD, { x: 5, y: 5 }),
        createStaff(StaffType.COOK, { x: 10, y: 10 })
      ];
      
      const found = getStaffAtPosition(staff, { x: 5, y: 5 });
      expect(found).not.toBeNull();
      expect(found!.type).toBe(StaffType.GUARD);
      
      const notFound = getStaffAtPosition(staff, { x: 0, y: 0 });
      expect(notFound).toBeNull();
    });
  });

  describe('staff filtering', () => {
    it('gets staff by type', () => {
      const staff: Staff[] = [
        createStaff(StaffType.GUARD, { x: 5, y: 5 }),
        createStaff(StaffType.GUARD, { x: 6, y: 6 }),
        createStaff(StaffType.COOK, { x: 10, y: 10 })
      ];
      
      const guards = getStaffByType(staff, StaffType.GUARD);
      expect(guards.length).toBe(2);
      
      const cooks = getStaffByType(staff, StaffType.COOK);
      expect(cooks.length).toBe(1);
      
      const janitors = getStaffByType(staff, StaffType.JANITOR);
      expect(janitors.length).toBe(0);
    });

    it('gets idle staff', () => {
      const staff: Staff[] = [
        createStaff(StaffType.GUARD, { x: 5, y: 5 }),
        createStaff(StaffType.COOK, { x: 10, y: 10 })
      ];
      staff[0].state = StaffState.PATROLLING;
      
      const idle = getIdleStaff(staff);
      expect(idle.length).toBe(1);
      expect(idle[0].type).toBe(StaffType.COOK);
    });

    it('gets responding guards', () => {
      const staff: Staff[] = [
        createStaff(StaffType.GUARD, { x: 5, y: 5 }),
        createStaff(StaffType.GUARD, { x: 6, y: 6 }),
        createStaff(StaffType.COOK, { x: 10, y: 10 })
      ];
      staff[0].state = StaffState.RESPONDING;
      
      const responding = getRespondingGuards(staff);
      expect(responding.length).toBe(1);
      expect(responding[0].id).toBe('staff_1');
    });
  });

  describe('guard functions', () => {
    let grid: Tile[][];

    beforeEach(() => {
      grid = createGrid();
      // Set up floor tiles
      for (let y = 0; y < 15; y++) {
        for (let x = 0; x < 15; x++) {
          setTile(grid, x, y, TileType.FLOOR);
        }
      }
    });

    it('starts patrol', () => {
      const guard = createStaff(StaffType.GUARD, { x: 5, y: 5 });
      const patrolPoints: Position[] = [{ x: 10, y: 5 }];
      
      startPatrol(guard, grid, patrolPoints);
      expect(guard.state).toBe(StaffState.PATROLLING);
      expect(guard.path.length).toBeGreaterThan(0);
    });

    it('does not patrol if not a guard', () => {
      const cook = createStaff(StaffType.COOK, { x: 5, y: 5 });
      const patrolPoints: Position[] = [{ x: 10, y: 5 }];
      
      startPatrol(cook, grid, patrolPoints);
      expect(cook.state).toBe(StaffState.IDLE);
      expect(cook.path.length).toBe(0);
    });

    it('responds to security event', () => {
      const guard = createStaff(StaffType.GUARD, { x: 5, y: 5 });
      const event: SecurityEvent = {
        id: 'event_1',
        type: EventType.FIGHT,
        participants: ['inmate_1', 'inmate_2'],
        pos: { x: 10, y: 5 },
        resolved: false
      };
      
      respondToEvent(guard, grid, event);
      expect(guard.state).toBe(StaffState.RESPONDING);
      expect(guard.path.length).toBeGreaterThan(0);
    });

    it('detects guard at event location', () => {
      const guard = createStaff(StaffType.GUARD, { x: 10, y: 5 });
      const event: SecurityEvent = {
        id: 'event_1',
        type: EventType.FIGHT,
        participants: [],
        pos: { x: 10, y: 5 },
        resolved: false
      };
      
      expect(isGuardAtEvent(guard, event)).toBe(true);
      
      guard.pos = { x: 11, y: 5 };
      expect(isGuardAtEvent(guard, event)).toBe(false);
    });

    it('checks if guard can resolve event', () => {
      const guard = createStaff(StaffType.GUARD, { x: 10, y: 5 });
      const event: SecurityEvent = {
        id: 'event_1',
        type: EventType.FIGHT,
        participants: [],
        pos: { x: 12, y: 5 },
        resolved: false
      };
      
      expect(canResolveEvent(guard, event, 3)).toBe(true);
      expect(canResolveEvent(guard, event, 1)).toBe(false);
      
      const cook = createStaff(StaffType.COOK, { x: 12, y: 5 });
      expect(canResolveEvent(cook, event, 3)).toBe(false);
    });
  });

  describe('cook functions', () => {
    it('identifies meal times', () => {
      expect(isMealTime(7)).toBe(true);
      expect(isMealTime(12)).toBe(true);
      expect(isMealTime(17)).toBe(true);
      expect(isMealTime(8)).toBe(false);
      expect(isMealTime(0)).toBe(false);
      expect(isMealTime(23)).toBe(false);
    });

    it('starts working', () => {
      const grid = createGrid();
      for (let y = 0; y < 15; y++) {
        for (let x = 0; x < 15; x++) {
          setTile(grid, x, y, TileType.FLOOR);
        }
      }
      
      const cook = createStaff(StaffType.COOK, { x: 5, y: 5 });
      startWorking(cook, grid, { x: 10, y: 5 });
      
      expect(cook.state).toBe(StaffState.WORKING);
      expect(cook.path.length).toBeGreaterThan(0);
    });

    it('stops working', () => {
      const cook = createStaff(StaffType.COOK, { x: 5, y: 5 });
      cook.state = StaffState.WORKING;
      cook.path = [{ x: 5, y: 5 }, { x: 6, y: 5 }];
      
      stopWorking(cook);
      expect(cook.state).toBe(StaffState.IDLE);
      expect(cook.path.length).toBe(0);
    });
  });

  describe('updateStaff', () => {
    let grid: Tile[][];

    beforeEach(() => {
      grid = createGrid();
      for (let y = 0; y < 20; y++) {
        for (let x = 0; x < 20; x++) {
          setTile(grid, x, y, TileType.FLOOR);
        }
      }
    });

    it('increases tiredness over time', () => {
      const guard = createStaff(StaffType.GUARD, { x: 5, y: 5 });
      const initialTiredness = guard.tiredness;
      
      updateStaff(guard, grid, 8, [], null);
      expect(guard.tiredness).toBeGreaterThan(initialTiredness);
    });

    it('guard responds to events during update', () => {
      const guard = createStaff(StaffType.GUARD, { x: 5, y: 5 });
      const event: SecurityEvent = {
        id: 'event_1',
        type: EventType.FIGHT,
        participants: [],
        pos: { x: 10, y: 5 },
        resolved: false
      };
      
      updateStaff(guard, grid, 8, [event], null);
      expect(guard.state).toBe(StaffState.RESPONDING);
    });

    it('guard ignores resolved events', () => {
      const guard = createStaff(StaffType.GUARD, { x: 5, y: 5 });
      const event: SecurityEvent = {
        id: 'event_1',
        type: EventType.FIGHT,
        participants: [],
        pos: { x: 10, y: 5 },
        resolved: true
      };
      
      updateStaff(guard, grid, 8, [event], null);
      expect(guard.state).toBe(StaffState.IDLE);
    });

    it('cook works during meal time', () => {
      const cook = createStaff(StaffType.COOK, { x: 5, y: 5 });
      const kitchenPos: Position = { x: 10, y: 10 };
      
      updateStaff(cook, grid, 12, [], kitchenPos);
      expect(cook.state).toBe(StaffState.WORKING);
    });

    it('cook is idle outside meal time', () => {
      const cook = createStaff(StaffType.COOK, { x: 5, y: 5 });
      cook.state = StaffState.WORKING;
      const kitchenPos: Position = { x: 10, y: 10 };
      
      updateStaff(cook, grid, 8, [], kitchenPos);
      expect(cook.state).toBe(StaffState.IDLE);
    });
  });
});
