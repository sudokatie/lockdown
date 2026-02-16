// Tests for Lockdown leaderboard

import {
  getLeaderboard,
  addEntry,
  getTop,
  wouldRank,
  getRank,
  clearLeaderboard,
  calculateScore,
  LeaderboardEntry,
} from '../src/game/Leaderboard';

// Mock localStorage for Node test environment
const localStorageMock = (() => {
  let store: Record<string, string> = {};
  return {
    getItem: (key: string) => store[key] || null,
    setItem: (key: string, value: string) => { store[key] = value; },
    removeItem: (key: string) => { delete store[key]; },
    clear: () => { store = {}; },
  };
})();

Object.defineProperty(global, 'localStorage', { value: localStorageMock });

describe('Leaderboard', () => {
  beforeEach(() => {
    localStorageMock.clear();
  });

  describe('getLeaderboard', () => {
    it('returns empty array when no entries', () => {
      expect(getLeaderboard()).toEqual([]);
    });

    it('returns stored entries', () => {
      const entry: LeaderboardEntry = {
        name: 'Blackgate',
        score: 5000,
        inmatesManaged: 50,
        cash: 20000,
        daysOperating: 30,
        date: '2026-02-16',
      };
      addEntry(entry);
      expect(getLeaderboard()).toHaveLength(1);
      expect(getLeaderboard()[0].name).toBe('Blackgate');
    });
  });

  describe('addEntry', () => {
    it('adds entry to leaderboard', () => {
      const entry: LeaderboardEntry = {
        name: 'Iron Heights',
        score: 3500,
        inmatesManaged: 30,
        cash: 15000,
        daysOperating: 20,
        date: '2026-02-16',
      };
      const result = addEntry(entry);
      expect(result).toHaveLength(1);
      expect(result[0].score).toBe(3500);
    });

    it('sorts entries by score descending', () => {
      addEntry({ name: 'Small', score: 1000, inmatesManaged: 10, cash: 5000, daysOperating: 7, date: '2026-02-16' });
      addEntry({ name: 'Large', score: 8000, inmatesManaged: 80, cash: 50000, daysOperating: 60, date: '2026-02-16' });
      addEntry({ name: 'Medium', score: 4000, inmatesManaged: 40, cash: 25000, daysOperating: 30, date: '2026-02-16' });
      
      const entries = getLeaderboard();
      expect(entries[0].name).toBe('Large');
      expect(entries[1].name).toBe('Medium');
      expect(entries[2].name).toBe('Small');
    });

    it('sorts by days when scores equal', () => {
      addEntry({ name: 'ShortRun', score: 4000, inmatesManaged: 40, cash: 20000, daysOperating: 20, date: '2026-02-16' });
      addEntry({ name: 'LongRun', score: 4000, inmatesManaged: 40, cash: 20000, daysOperating: 50, date: '2026-02-16' });
      
      const entries = getLeaderboard();
      expect(entries[0].name).toBe('LongRun');
      expect(entries[1].name).toBe('ShortRun');
    });

    it('limits to 10 entries', () => {
      for (let i = 0; i < 15; i++) {
        addEntry({
          name: `Prison${i}`,
          score: i * 500,
          inmatesManaged: i * 5,
          cash: i * 2000,
          daysOperating: i * 5,
          date: '2026-02-16',
        });
      }
      expect(getLeaderboard()).toHaveLength(10);
    });
  });

  describe('getTop', () => {
    it('returns top N entries', () => {
      for (let i = 0; i < 5; i++) {
        addEntry({
          name: `Prison${i}`,
          score: (i + 1) * 1000,
          inmatesManaged: (i + 1) * 10,
          cash: (i + 1) * 5000,
          daysOperating: (i + 1) * 7,
          date: '2026-02-16',
        });
      }
      const top3 = getTop(3);
      expect(top3).toHaveLength(3);
      expect(top3[0].score).toBe(5000);
    });
  });

  describe('wouldRank', () => {
    it('returns rank when board not full', () => {
      addEntry({ name: 'Test', score: 3000, inmatesManaged: 30, cash: 15000, daysOperating: 20, date: '2026-02-16' });
      expect(wouldRank(5000)).toBe(1);
      expect(wouldRank(1000)).toBe(2);
    });

    it('returns null when would not rank on full board', () => {
      for (let i = 0; i < 10; i++) {
        addEntry({
          name: `Prison${i}`,
          score: (i + 1) * 500,
          inmatesManaged: (i + 1) * 5,
          cash: (i + 1) * 2000,
          daysOperating: (i + 1) * 5,
          date: '2026-02-16',
        });
      }
      expect(wouldRank(100)).toBeNull();
    });
  });

  describe('getRank', () => {
    it('returns rank for existing score', () => {
      addEntry({ name: 'First', score: 6000, inmatesManaged: 60, cash: 30000, daysOperating: 45, date: '2026-02-16' });
      addEntry({ name: 'Second', score: 3000, inmatesManaged: 30, cash: 15000, daysOperating: 20, date: '2026-02-16' });
      const entries = getLeaderboard();
      expect(getRank(entries[0].score)).toBe(1);
      expect(getRank(entries[1].score)).toBe(2);
    });

    it('returns null for non-existent score', () => {
      addEntry({ name: 'Test', score: 3000, inmatesManaged: 30, cash: 15000, daysOperating: 20, date: '2026-02-16' });
      expect(getRank(10000)).toBeNull();
    });
  });

  describe('clearLeaderboard', () => {
    it('removes all entries', () => {
      addEntry({ name: 'Test', score: 3000, inmatesManaged: 30, cash: 15000, daysOperating: 20, date: '2026-02-16' });
      clearLeaderboard();
      expect(getLeaderboard()).toEqual([]);
    });
  });

  describe('calculateScore', () => {
    it('calculates score from prison stats', () => {
      // 50 inmates * 50 = 2500
      // 3 riots * 25 = 75
      // 30 days * 10 = 300
      // 20000 cash / 100 = 200
      // 1 escape * 100 = -100
      // Total = 2975
      const score = calculateScore(50, 3, 30, 20000, 1);
      expect(score).toBe(2975);
    });

    it('handles new prison', () => {
      const score = calculateScore(10, 0, 7, 5000, 0);
      expect(score).toBe(500 + 0 + 70 + 50); // 620
    });

    it('handles troubled prison', () => {
      const score = calculateScore(20, 5, 14, 3000, 5);
      // 1000 + 125 + 140 + 30 - 500 = 795
      expect(score).toBe(795);
    });

    it('never goes below zero', () => {
      const score = calculateScore(5, 0, 3, 0, 10);
      expect(score).toBe(0);
    });
  });
});
