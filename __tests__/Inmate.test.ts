import {
  createInmate,
  createNeeds,
  generateInmateId,
  resetInmateIdCounter,
  updateNeeds,
  satisfyNeed,
  satisfyAllNeeds,
  calculateFrustration,
  updateFrustration,
  isFrustrated,
  setInmateState,
  moveInmate,
  setInmatePath,
  clearInmatePath,
  updateInmatePosition,
  hasReachedDestination,
  getInmateAtPosition,
  getNearbyInmates,
  getFrustratedInmates,
  decreaseSentence,
  isSentenceComplete,
  getLowestNeed,
  getNeedValue,
  isInLockdown,
  sendToLockdown,
  releaseFromLockdown
} from '../src/game/Inmate';
import { InmateState, SecurityLevel } from '../src/game/types';
import { MIN_TOLERANCE, MAX_TOLERANCE } from '../src/game/constants';

describe('Inmate', () => {
  beforeEach(() => {
    resetInmateIdCounter();
  });

  describe('generateInmateId', () => {
    it('generates unique IDs', () => {
      const id1 = generateInmateId();
      const id2 = generateInmateId();
      expect(id1).not.toBe(id2);
    });
  });

  describe('createNeeds', () => {
    it('creates needs all at 100', () => {
      const needs = createNeeds();
      expect(needs.food).toBe(100);
      expect(needs.sleep).toBe(100);
      expect(needs.hygiene).toBe(100);
      expect(needs.exercise).toBe(100);
      expect(needs.freedom).toBe(100);
    });
  });

  describe('createInmate', () => {
    it('creates inmate with correct properties', () => {
      const inmate = createInmate('John', SecurityLevel.MED, 30, { x: 5, y: 5 });
      expect(inmate.name).toBe('John');
      expect(inmate.security).toBe(SecurityLevel.MED);
      expect(inmate.sentence).toBe(30);
      expect(inmate.pos.x).toBe(5);
      expect(inmate.pos.y).toBe(5);
    });

    it('starts with full needs', () => {
      const inmate = createInmate('John', SecurityLevel.MIN, 10, { x: 0, y: 0 });
      expect(inmate.needs.food).toBe(100);
      expect(inmate.needs.sleep).toBe(100);
    });

    it('starts with zero frustration', () => {
      const inmate = createInmate('John', SecurityLevel.MIN, 10, { x: 0, y: 0 });
      expect(inmate.frustration).toBe(0);
    });

    it('has tolerance within valid range', () => {
      const inmate = createInmate('John', SecurityLevel.MIN, 10, { x: 0, y: 0 });
      expect(inmate.tolerance).toBeGreaterThanOrEqual(MIN_TOLERANCE);
      expect(inmate.tolerance).toBeLessThanOrEqual(MAX_TOLERANCE);
    });

    it('starts in SLEEPING state', () => {
      const inmate = createInmate('John', SecurityLevel.MIN, 10, { x: 0, y: 0 });
      expect(inmate.state).toBe(InmateState.SLEEPING);
    });

    it('starts with empty path', () => {
      const inmate = createInmate('John', SecurityLevel.MIN, 10, { x: 0, y: 0 });
      expect(inmate.path).toEqual([]);
    });
  });

  describe('updateNeeds', () => {
    it('decreases food over time', () => {
      const inmate = createInmate('John', SecurityLevel.MIN, 10, { x: 0, y: 0 });
      updateNeeds(inmate, 1); // 1 second
      expect(inmate.needs.food).toBeLessThan(100);
    });

    it('decreases sleep over time', () => {
      const inmate = createInmate('John', SecurityLevel.MIN, 10, { x: 0, y: 0 });
      updateNeeds(inmate, 1);
      expect(inmate.needs.sleep).toBeLessThan(100);
    });

    it('decreases hygiene over time', () => {
      const inmate = createInmate('John', SecurityLevel.MIN, 10, { x: 0, y: 0 });
      updateNeeds(inmate, 1);
      expect(inmate.needs.hygiene).toBeLessThan(100);
    });

    it('needs do not go below 0', () => {
      const inmate = createInmate('John', SecurityLevel.MIN, 10, { x: 0, y: 0 });
      updateNeeds(inmate, 1000); // Large time to ensure depletion
      expect(inmate.needs.food).toBe(0);
      expect(inmate.needs.sleep).toBe(0);
    });
  });

  describe('satisfyNeed', () => {
    it('increases food', () => {
      const inmate = createInmate('John', SecurityLevel.MIN, 10, { x: 0, y: 0 });
      inmate.needs.food = 50;
      satisfyNeed(inmate, 'food', 30);
      expect(inmate.needs.food).toBe(80);
    });

    it('does not exceed 100', () => {
      const inmate = createInmate('John', SecurityLevel.MIN, 10, { x: 0, y: 0 });
      inmate.needs.food = 80;
      satisfyNeed(inmate, 'food', 50);
      expect(inmate.needs.food).toBe(100);
    });
  });

  describe('satisfyAllNeeds', () => {
    it('satisfies multiple needs', () => {
      const inmate = createInmate('John', SecurityLevel.MIN, 10, { x: 0, y: 0 });
      inmate.needs.food = 50;
      inmate.needs.sleep = 60;
      satisfyAllNeeds(inmate, { food: 20, sleep: 20 });
      expect(inmate.needs.food).toBe(70);
      expect(inmate.needs.sleep).toBe(80);
    });
  });

  describe('calculateFrustration', () => {
    it('returns 0 for full needs', () => {
      const inmate = createInmate('John', SecurityLevel.MIN, 10, { x: 0, y: 0 });
      expect(calculateFrustration(inmate)).toBe(0);
    });

    it('increases when needs below 50', () => {
      const inmate = createInmate('John', SecurityLevel.MIN, 10, { x: 0, y: 0 });
      inmate.needs.food = 30;
      // Frustration = 50 - 30 = 20
      expect(calculateFrustration(inmate)).toBe(20);
    });

    it('accumulates from multiple low needs', () => {
      const inmate = createInmate('John', SecurityLevel.MIN, 10, { x: 0, y: 0 });
      inmate.needs.food = 30;    // +20
      inmate.needs.sleep = 40;   // +10
      inmate.needs.hygiene = 20; // +30
      expect(calculateFrustration(inmate)).toBe(60);
    });

    it('needs at 50 add no frustration', () => {
      const inmate = createInmate('John', SecurityLevel.MIN, 10, { x: 0, y: 0 });
      inmate.needs.food = 50;
      expect(calculateFrustration(inmate)).toBe(0);
    });
  });

  describe('updateFrustration', () => {
    it('updates frustration value', () => {
      const inmate = createInmate('John', SecurityLevel.MIN, 10, { x: 0, y: 0 });
      inmate.needs.food = 30;
      updateFrustration(inmate);
      expect(inmate.frustration).toBe(20);
    });
  });

  describe('isFrustrated', () => {
    it('returns false when frustration below tolerance', () => {
      const inmate = createInmate('John', SecurityLevel.MIN, 10, { x: 0, y: 0 });
      inmate.frustration = 40;
      inmate.tolerance = 50;
      expect(isFrustrated(inmate)).toBe(false);
    });

    it('returns true when frustration above tolerance', () => {
      const inmate = createInmate('John', SecurityLevel.MIN, 10, { x: 0, y: 0 });
      inmate.frustration = 60;
      inmate.tolerance = 50;
      expect(isFrustrated(inmate)).toBe(true);
    });

    it('returns false when equal to tolerance', () => {
      const inmate = createInmate('John', SecurityLevel.MIN, 10, { x: 0, y: 0 });
      inmate.frustration = 50;
      inmate.tolerance = 50;
      expect(isFrustrated(inmate)).toBe(false);
    });
  });

  describe('setInmateState', () => {
    it('changes state', () => {
      const inmate = createInmate('John', SecurityLevel.MIN, 10, { x: 0, y: 0 });
      setInmateState(inmate, InmateState.EATING);
      expect(inmate.state).toBe(InmateState.EATING);
    });
  });

  describe('moveInmate', () => {
    it('updates position', () => {
      const inmate = createInmate('John', SecurityLevel.MIN, 10, { x: 0, y: 0 });
      moveInmate(inmate, { x: 5, y: 5 });
      expect(inmate.pos.x).toBe(5);
      expect(inmate.pos.y).toBe(5);
    });
  });

  describe('path operations', () => {
    it('setInmatePath sets path', () => {
      const inmate = createInmate('John', SecurityLevel.MIN, 10, { x: 0, y: 0 });
      setInmatePath(inmate, [{ x: 0, y: 0 }, { x: 1, y: 0 }]);
      expect(inmate.path.length).toBe(2);
    });

    it('clearInmatePath clears path', () => {
      const inmate = createInmate('John', SecurityLevel.MIN, 10, { x: 0, y: 0 });
      setInmatePath(inmate, [{ x: 0, y: 0 }, { x: 1, y: 0 }]);
      clearInmatePath(inmate);
      expect(inmate.path.length).toBe(0);
    });

    it('updateInmatePosition moves along path', () => {
      const inmate = createInmate('John', SecurityLevel.MIN, 10, { x: 0, y: 0 });
      setInmatePath(inmate, [{ x: 0, y: 0 }, { x: 1, y: 0 }, { x: 2, y: 0 }]);
      updateInmatePosition(inmate);
      expect(inmate.pos.x).toBe(1);
      expect(inmate.path.length).toBe(2);
    });

    it('updateInmatePosition returns false for empty path', () => {
      const inmate = createInmate('John', SecurityLevel.MIN, 10, { x: 0, y: 0 });
      expect(updateInmatePosition(inmate)).toBe(false);
    });

    it('hasReachedDestination returns true when path empty', () => {
      const inmate = createInmate('John', SecurityLevel.MIN, 10, { x: 0, y: 0 });
      expect(hasReachedDestination(inmate)).toBe(true);
    });

    it('hasReachedDestination returns false when path has steps', () => {
      const inmate = createInmate('John', SecurityLevel.MIN, 10, { x: 0, y: 0 });
      setInmatePath(inmate, [{ x: 0, y: 0 }, { x: 1, y: 0 }]);
      expect(hasReachedDestination(inmate)).toBe(false);
    });
  });

  describe('getInmateAtPosition', () => {
    it('returns inmate at position', () => {
      const inmate = createInmate('John', SecurityLevel.MIN, 10, { x: 5, y: 5 });
      expect(getInmateAtPosition([inmate], { x: 5, y: 5 })).toBe(inmate);
    });

    it('returns null if no inmate', () => {
      const inmate = createInmate('John', SecurityLevel.MIN, 10, { x: 5, y: 5 });
      expect(getInmateAtPosition([inmate], { x: 0, y: 0 })).toBeNull();
    });
  });

  describe('getNearbyInmates', () => {
    it('returns inmates within range', () => {
      const i1 = createInmate('A', SecurityLevel.MIN, 10, { x: 5, y: 5 });
      const i2 = createInmate('B', SecurityLevel.MIN, 10, { x: 6, y: 5 });
      const i3 = createInmate('C', SecurityLevel.MIN, 10, { x: 20, y: 20 });
      
      const nearby = getNearbyInmates([i1, i2, i3], { x: 5, y: 5 }, 2);
      expect(nearby).toContain(i1);
      expect(nearby).toContain(i2);
      expect(nearby).not.toContain(i3);
    });
  });

  describe('getFrustratedInmates', () => {
    it('returns only frustrated inmates', () => {
      const i1 = createInmate('A', SecurityLevel.MIN, 10, { x: 0, y: 0 });
      i1.frustration = 100;
      i1.tolerance = 50;
      
      const i2 = createInmate('B', SecurityLevel.MIN, 10, { x: 1, y: 0 });
      i2.frustration = 20;
      i2.tolerance = 50;
      
      const frustrated = getFrustratedInmates([i1, i2]);
      expect(frustrated).toContain(i1);
      expect(frustrated).not.toContain(i2);
    });
  });

  describe('sentence operations', () => {
    it('decreaseSentence reduces by 1', () => {
      const inmate = createInmate('John', SecurityLevel.MIN, 10, { x: 0, y: 0 });
      decreaseSentence(inmate);
      expect(inmate.sentence).toBe(9);
    });

    it('decreaseSentence does not go below 0', () => {
      const inmate = createInmate('John', SecurityLevel.MIN, 0, { x: 0, y: 0 });
      decreaseSentence(inmate);
      expect(inmate.sentence).toBe(0);
    });

    it('isSentenceComplete returns true when 0', () => {
      const inmate = createInmate('John', SecurityLevel.MIN, 0, { x: 0, y: 0 });
      expect(isSentenceComplete(inmate)).toBe(true);
    });

    it('isSentenceComplete returns false when > 0', () => {
      const inmate = createInmate('John', SecurityLevel.MIN, 5, { x: 0, y: 0 });
      expect(isSentenceComplete(inmate)).toBe(false);
    });
  });

  describe('getLowestNeed', () => {
    it('returns need with lowest value', () => {
      const inmate = createInmate('John', SecurityLevel.MIN, 10, { x: 0, y: 0 });
      inmate.needs.food = 30;
      inmate.needs.sleep = 50;
      inmate.needs.hygiene = 20;
      expect(getLowestNeed(inmate)).toBe('hygiene');
    });
  });

  describe('getNeedValue', () => {
    it('returns correct value', () => {
      const inmate = createInmate('John', SecurityLevel.MIN, 10, { x: 0, y: 0 });
      inmate.needs.food = 75;
      expect(getNeedValue(inmate, 'food')).toBe(75);
    });
  });

  describe('lockdown operations', () => {
    it('isInLockdown returns true when in lockdown', () => {
      const inmate = createInmate('John', SecurityLevel.MIN, 10, { x: 0, y: 0 });
      inmate.state = InmateState.LOCKDOWN;
      expect(isInLockdown(inmate)).toBe(true);
    });

    it('isInLockdown returns false otherwise', () => {
      const inmate = createInmate('John', SecurityLevel.MIN, 10, { x: 0, y: 0 });
      expect(isInLockdown(inmate)).toBe(false);
    });

    it('sendToLockdown sets state and clears path', () => {
      const inmate = createInmate('John', SecurityLevel.MIN, 10, { x: 0, y: 0 });
      setInmatePath(inmate, [{ x: 0, y: 0 }, { x: 1, y: 0 }]);
      sendToLockdown(inmate);
      expect(inmate.state).toBe(InmateState.LOCKDOWN);
      expect(inmate.path.length).toBe(0);
    });

    it('releaseFromLockdown changes state', () => {
      const inmate = createInmate('John', SecurityLevel.MIN, 10, { x: 0, y: 0 });
      sendToLockdown(inmate);
      releaseFromLockdown(inmate);
      expect(inmate.state).toBe(InmateState.SLEEPING);
    });
  });
});
