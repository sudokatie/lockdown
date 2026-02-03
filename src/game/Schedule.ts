import { ScheduleBlock, Activity, ZoneType, GameState } from './types';
import { DEFAULT_SCHEDULE } from './constants';

export function createDefaultSchedule(): ScheduleBlock[] {
  return DEFAULT_SCHEDULE.map(block => ({ ...block }));
}

export function getCurrentBlock(schedule: ScheduleBlock[], hour: number): ScheduleBlock | null {
  for (const block of schedule) {
    // Handle blocks that wrap around midnight
    if (block.startHour > block.endHour) {
      // Block wraps midnight (e.g., 21:00 to 00:00)
      if (hour >= block.startHour || hour < block.endHour) {
        return block;
      }
    } else {
      if (hour >= block.startHour && hour < block.endHour) {
        return block;
      }
    }
  }
  return null;
}

export function getNextBlock(schedule: ScheduleBlock[], hour: number): ScheduleBlock | null {
  const current = getCurrentBlock(schedule, hour);
  if (!current) return null;
  
  const currentIndex = schedule.indexOf(current);
  const nextIndex = (currentIndex + 1) % schedule.length;
  return schedule[nextIndex];
}

export function getActivityForHour(schedule: ScheduleBlock[], hour: number): Activity | null {
  const block = getCurrentBlock(schedule, hour);
  return block ? block.activity : null;
}

export function getTargetZoneForHour(schedule: ScheduleBlock[], hour: number): ZoneType | null {
  const block = getCurrentBlock(schedule, hour);
  return block ? block.targetZone : null;
}

export function advanceTime(state: GameState, deltaSeconds: number): void {
  // Convert delta seconds to game minutes
  // 1 real second = 1 game minute
  state.minute += deltaSeconds;
  
  // Roll over minutes to hours
  while (state.minute >= 60) {
    state.minute -= 60;
    state.hour += 1;
  }
  
  // Roll over hours to days
  while (state.hour >= 24) {
    state.hour -= 24;
    state.day += 1;
  }
}

export function getTimeString(hour: number, minute: number): string {
  const h = hour.toString().padStart(2, '0');
  const m = Math.floor(minute).toString().padStart(2, '0');
  return `${h}:${m}`;
}

export function getTimeUntilNextBlock(schedule: ScheduleBlock[], hour: number, minute: number): number {
  const current = getCurrentBlock(schedule, hour);
  if (!current) return 0;
  
  // Minutes until end of current block
  let endHour = current.endHour;
  if (endHour === 0) endHour = 24; // Handle midnight
  
  const currentMinutes = hour * 60 + minute;
  const endMinutes = endHour * 60;
  
  return Math.max(0, endMinutes - currentMinutes);
}

export function isActivityTime(schedule: ScheduleBlock[], hour: number, activity: Activity): boolean {
  const block = getCurrentBlock(schedule, hour);
  return block !== null && block.activity === activity;
}

export function getMealTimes(schedule: ScheduleBlock[]): number[] {
  return schedule
    .filter(block => block.activity === Activity.EAT)
    .map(block => block.startHour);
}
