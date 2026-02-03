import {
  createDefaultSchedule,
  getCurrentBlock,
  getNextBlock,
  getActivityForHour,
  getTargetZoneForHour,
  advanceTime,
  getTimeString,
  getTimeUntilNextBlock,
  isActivityTime,
  getMealTimes
} from '../src/game/Schedule';
import { Activity, ZoneType, GameScreen, BuildTool, ObjectType, GameState } from '../src/game/types';

function createTestGameState(): GameState {
  return {
    screen: GameScreen.PLAYING,
    grid: [],
    zones: [],
    staff: [],
    inmates: [],
    events: [],
    money: 30000,
    day: 1,
    hour: 8,
    minute: 0,
    paused: false,
    messages: [],
    selectedTool: BuildTool.NONE,
    selectedObject: ObjectType.NONE,
    selectedZone: ZoneType.NONE,
    schedule: createDefaultSchedule()
  };
}

describe('Schedule', () => {
  describe('createDefaultSchedule', () => {
    it('creates schedule covering 24 hours', () => {
      const schedule = createDefaultSchedule();
      expect(schedule.length).toBeGreaterThan(0);
      
      // Verify schedule covers all hours
      for (let hour = 0; hour < 24; hour++) {
        const block = getCurrentBlock(schedule, hour);
        expect(block).not.toBeNull();
      }
    });

    it('returns new array each time', () => {
      const s1 = createDefaultSchedule();
      const s2 = createDefaultSchedule();
      expect(s1).not.toBe(s2);
    });
  });

  describe('getCurrentBlock', () => {
    it('returns SLEEP block at 3 AM', () => {
      const schedule = createDefaultSchedule();
      const block = getCurrentBlock(schedule, 3);
      expect(block).not.toBeNull();
      expect(block!.activity).toBe(Activity.SLEEP);
    });

    it('returns SHOWER block at 6:30 AM', () => {
      const schedule = createDefaultSchedule();
      const block = getCurrentBlock(schedule, 6);
      expect(block).not.toBeNull();
      expect(block!.activity).toBe(Activity.SHOWER);
    });

    it('returns EAT block at 7 AM (breakfast)', () => {
      const schedule = createDefaultSchedule();
      const block = getCurrentBlock(schedule, 7);
      expect(block).not.toBeNull();
      expect(block!.activity).toBe(Activity.EAT);
    });

    it('returns YARD block at 10 AM', () => {
      const schedule = createDefaultSchedule();
      const block = getCurrentBlock(schedule, 10);
      expect(block).not.toBeNull();
      expect(block!.activity).toBe(Activity.YARD);
    });

    it('returns EAT block at 12 PM (lunch)', () => {
      const schedule = createDefaultSchedule();
      const block = getCurrentBlock(schedule, 12);
      expect(block).not.toBeNull();
      expect(block!.activity).toBe(Activity.EAT);
    });

    it('returns FREE block at 20:00 (8 PM)', () => {
      const schedule = createDefaultSchedule();
      const block = getCurrentBlock(schedule, 20);
      expect(block).not.toBeNull();
      expect(block!.activity).toBe(Activity.FREE);
    });

    it('returns SLEEP block at 22:00 (10 PM)', () => {
      const schedule = createDefaultSchedule();
      const block = getCurrentBlock(schedule, 22);
      expect(block).not.toBeNull();
      expect(block!.activity).toBe(Activity.SLEEP);
    });
  });

  describe('getNextBlock', () => {
    it('returns following block', () => {
      const schedule = createDefaultSchedule();
      const current = getCurrentBlock(schedule, 6); // SHOWER
      const next = getNextBlock(schedule, 6);
      
      expect(current!.activity).toBe(Activity.SHOWER);
      expect(next).not.toBeNull();
      expect(next!.activity).toBe(Activity.EAT);
    });

    it('wraps around to first block', () => {
      const schedule = createDefaultSchedule();
      // Last block is SLEEP (21:00-24:00)
      const next = getNextBlock(schedule, 22);
      expect(next).not.toBeNull();
      // Should wrap to first block (SLEEP 0:00-6:00)
      expect(next!.activity).toBe(Activity.SLEEP);
    });
  });

  describe('getActivityForHour', () => {
    it('returns correct activity', () => {
      const schedule = createDefaultSchedule();
      expect(getActivityForHour(schedule, 7)).toBe(Activity.EAT);
      expect(getActivityForHour(schedule, 10)).toBe(Activity.YARD);
      expect(getActivityForHour(schedule, 20)).toBe(Activity.FREE);
    });

    it('returns null for empty schedule', () => {
      expect(getActivityForHour([], 10)).toBeNull();
    });
  });

  describe('getTargetZoneForHour', () => {
    it('returns correct target zone', () => {
      const schedule = createDefaultSchedule();
      expect(getTargetZoneForHour(schedule, 3)).toBe(ZoneType.CELL);
      expect(getTargetZoneForHour(schedule, 7)).toBe(ZoneType.CANTEEN);
      expect(getTargetZoneForHour(schedule, 10)).toBe(ZoneType.YARD);
      expect(getTargetZoneForHour(schedule, 20)).toBe(ZoneType.COMMON);
    });
  });

  describe('advanceTime', () => {
    it('increments minutes', () => {
      const state = createTestGameState();
      state.hour = 8;
      state.minute = 0;
      
      advanceTime(state, 30);
      expect(state.minute).toBe(30);
      expect(state.hour).toBe(8);
    });

    it('rolls over to next hour', () => {
      const state = createTestGameState();
      state.hour = 8;
      state.minute = 45;
      
      advanceTime(state, 30);
      expect(state.minute).toBe(15);
      expect(state.hour).toBe(9);
    });

    it('rolls over to next day', () => {
      const state = createTestGameState();
      state.day = 1;
      state.hour = 23;
      state.minute = 45;
      
      advanceTime(state, 30);
      expect(state.minute).toBe(15);
      expect(state.hour).toBe(0);
      expect(state.day).toBe(2);
    });

    it('handles multiple hour rollover', () => {
      const state = createTestGameState();
      state.hour = 10;
      state.minute = 0;
      
      advanceTime(state, 150); // 2.5 hours
      expect(state.hour).toBe(12);
      expect(state.minute).toBe(30);
    });
  });

  describe('getTimeString', () => {
    it('formats time with leading zeros', () => {
      expect(getTimeString(8, 5)).toBe('08:05');
      expect(getTimeString(12, 30)).toBe('12:30');
      expect(getTimeString(0, 0)).toBe('00:00');
      expect(getTimeString(23, 59)).toBe('23:59');
    });

    it('truncates decimal minutes', () => {
      expect(getTimeString(8, 30.5)).toBe('08:30');
    });
  });

  describe('getTimeUntilNextBlock', () => {
    it('returns minutes until block ends', () => {
      const schedule = createDefaultSchedule();
      // At 7:00, EAT block ends at 8:00 = 60 minutes
      const minutes = getTimeUntilNextBlock(schedule, 7, 0);
      expect(minutes).toBe(60);
    });

    it('returns correct time mid-block', () => {
      const schedule = createDefaultSchedule();
      // At 7:30, EAT block ends at 8:00 = 30 minutes
      const minutes = getTimeUntilNextBlock(schedule, 7, 30);
      expect(minutes).toBe(30);
    });
  });

  describe('isActivityTime', () => {
    it('returns true when activity matches', () => {
      const schedule = createDefaultSchedule();
      expect(isActivityTime(schedule, 7, Activity.EAT)).toBe(true);
      expect(isActivityTime(schedule, 10, Activity.YARD)).toBe(true);
    });

    it('returns false when activity does not match', () => {
      const schedule = createDefaultSchedule();
      expect(isActivityTime(schedule, 7, Activity.SLEEP)).toBe(false);
      expect(isActivityTime(schedule, 10, Activity.EAT)).toBe(false);
    });
  });

  describe('getMealTimes', () => {
    it('returns all meal start times', () => {
      const schedule = createDefaultSchedule();
      const mealTimes = getMealTimes(schedule);
      
      expect(mealTimes).toContain(7);  // Breakfast
      expect(mealTimes).toContain(12); // Lunch
      expect(mealTimes).toContain(17); // Dinner
      expect(mealTimes.length).toBe(3);
    });
  });
});
