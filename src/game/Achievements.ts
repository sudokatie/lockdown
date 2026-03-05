/**
 * Achievement system for Lockdown (Prison Architect)
 */

export interface Achievement {
  id: string;
  name: string;
  description: string;
  icon: string;
  category: 'skill' | 'exploration' | 'mastery' | 'daily';
}

export interface AchievementProgress { unlockedAt: number; }
export type AchievementStore = Record<string, AchievementProgress>;

export const ACHIEVEMENTS: Achievement[] = [
  // Skill
  { id: 'first_cell', name: 'Warden', description: 'Build your first cell', icon: '🔒', category: 'skill' },
  { id: 'first_intake', name: 'Operator', description: 'Accept your first prisoner', icon: '👤', category: 'skill' },
  { id: 'first_guard', name: 'Security', description: 'Hire your first guard', icon: '👮', category: 'skill' },
  { id: 'riot_handled', name: 'Crisis Manager', description: 'Handle a riot', icon: '🚨', category: 'skill' },
  { id: 'escape_prevented', name: 'Vigilant', description: 'Prevent an escape', icon: '🚫', category: 'skill' },
  { id: 'release', name: 'Rehabilitator', description: 'Release a reformed prisoner', icon: '🎓', category: 'skill' },

  // Exploration
  { id: 'all_programs', name: 'Reformer', description: 'Run all reform programs', icon: '📚', category: 'exploration' },
  { id: 'all_rooms', name: 'Architect', description: 'Build all room types', icon: '🏗️', category: 'exploration' },
  { id: 'contraband', name: 'Detective', description: 'Find contraband', icon: '🔍', category: 'exploration' },

  // Mastery
  { id: 'capacity_50', name: 'Growing', description: 'House 50 prisoners', icon: '👥', category: 'mastery' },
  { id: 'capacity_200', name: 'Supermax', description: 'House 200 prisoners', icon: '🏢', category: 'mastery' },
  { id: 'profit_100000', name: 'Profitable', description: 'Earn $100,000 profit', icon: '💰', category: 'mastery' },
  { id: 'no_deaths', name: 'Safe', description: 'Go 30 days without deaths', icon: '👼', category: 'mastery' },
  { id: 'no_escapes', name: 'Secure', description: 'Go 30 days without escapes', icon: '🔐', category: 'mastery' },
  { id: 'five_star', name: 'Excellence', description: 'Achieve 5-star rating', icon: '⭐', category: 'mastery' },

  // Daily
  { id: 'daily_complete', name: 'Daily Warden', description: 'Complete a daily prison', icon: '📅', category: 'daily' },
  { id: 'daily_top_10', name: 'Daily Contender', description: 'Top 10 in daily', icon: '🔟', category: 'daily' },
  { id: 'daily_top_3', name: 'Daily Champion', description: 'Top 3 in daily', icon: '🥉', category: 'daily' },
  { id: 'daily_first', name: 'Daily Legend', description: 'First place in daily', icon: '🥇', category: 'daily' },
  { id: 'daily_streak_3', name: 'Consistent', description: '3-day streak', icon: '🔥', category: 'daily' },
  { id: 'daily_streak_7', name: 'Dedicated', description: '7-day streak', icon: '💪', category: 'daily' },
];

const STORAGE_KEY = 'lockdown_achievements';
const STREAK_KEY = 'lockdown_daily_streak';

export class AchievementManager {
  private store: AchievementStore;
  private dailyStreak: { lastDate: string; count: number };
  constructor() { this.store = this.load(); this.dailyStreak = this.loadStreak(); }
  private load(): AchievementStore { try { return JSON.parse(localStorage.getItem(STORAGE_KEY) || '{}'); } catch { return {}; } }
  private save(): void { try { localStorage.setItem(STORAGE_KEY, JSON.stringify(this.store)); } catch {} }
  private loadStreak() { try { return JSON.parse(localStorage.getItem(STREAK_KEY) || '{"lastDate":"","count":0}'); } catch { return { lastDate: '', count: 0 }; } }
  private saveStreak(): void { try { localStorage.setItem(STREAK_KEY, JSON.stringify(this.dailyStreak)); } catch {} }
  isUnlocked(id: string): boolean { return id in this.store; }
  getProgress(): AchievementStore { return { ...this.store }; }
  getUnlockedCount(): number { return Object.keys(this.store).length; }
  getTotalCount(): number { return ACHIEVEMENTS.length; }
  getAchievement(id: string) { return ACHIEVEMENTS.find((a) => a.id === id); }
  getAllAchievements() { return ACHIEVEMENTS; }
  unlock(id: string): Achievement | null {
    if (this.isUnlocked(id)) return null;
    const a = this.getAchievement(id); if (!a) return null;
    this.store[id] = { unlockedAt: Date.now() }; this.save(); return a;
  }
  checkAndUnlock(ids: string[]): Achievement[] {
    return ids.map((id) => this.unlock(id)).filter((a): a is Achievement => a !== null);
  }
  recordDailyCompletion(rank: number): Achievement[] {
    const unlocked: Achievement[] = [];
    let a = this.unlock('daily_complete'); if (a) unlocked.push(a);
    if (rank <= 10) { a = this.unlock('daily_top_10'); if (a) unlocked.push(a); }
    if (rank <= 3) { a = this.unlock('daily_top_3'); if (a) unlocked.push(a); }
    if (rank === 1) { a = this.unlock('daily_first'); if (a) unlocked.push(a); }
    const today = new Date().toISOString().split('T')[0];
    const yesterday = new Date(Date.now() - 86400000).toISOString().split('T')[0];
    if (this.dailyStreak.lastDate === yesterday) this.dailyStreak.count++;
    else if (this.dailyStreak.lastDate !== today) this.dailyStreak.count = 1;
    this.dailyStreak.lastDate = today; this.saveStreak();
    if (this.dailyStreak.count >= 3) { a = this.unlock('daily_streak_3'); if (a) unlocked.push(a); }
    if (this.dailyStreak.count >= 7) { a = this.unlock('daily_streak_7'); if (a) unlocked.push(a); }
    return unlocked;
  }
  reset(): void { this.store = {}; this.dailyStreak = { lastDate: '', count: 0 }; this.save(); this.saveStreak(); }
}

let instance: AchievementManager | null = null;
export function getAchievementManager(): AchievementManager { if (!instance) instance = new AchievementManager(); return instance; }
