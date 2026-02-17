/**
 * @jest-environment jsdom
 */

import {
  getLeaderboard,
  addEntry,
  getTop,
  wouldRank,
  getRank,
  clearLeaderboard
} from '../Leaderboard';

describe('Leaderboard', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it('should return empty array when no entries', () => {
    expect(getLeaderboard()).toEqual([]);
  });

  it('should add an entry', () => {
    const entry = {
      name: 'Warden',
      score: 9000,
      inmatesManaged: 200,
      cash: 75000,
      daysOperating: 150,
      date: new Date().toISOString()
    };
    const entries = addEntry(entry);
    expect(entries[0].score).toBe(9000);
  });

  it('should sort by score descending', () => {
    addEntry({ name: 'Low', score: 3000, inmatesManaged: 60, cash: 25000, daysOperating: 40, date: '2026-01-01' });
    addEntry({ name: 'High', score: 18000, inmatesManaged: 400, cash: 150000, daysOperating: 300, date: '2026-01-02' });
    addEntry({ name: 'Mid', score: 9000, inmatesManaged: 180, cash: 70000, daysOperating: 130, date: '2026-01-03' });

    const top = getTop();
    expect(top[0].name).toBe('High');
    expect(top[1].name).toBe('Mid');
    expect(top[2].name).toBe('Low');
  });

  it('should limit to max entries', () => {
    for (let i = 0; i < 15; i++) {
      addEntry({ name: `W${i}`, score: i * 1200, inmatesManaged: i * 25, cash: i * 8000, daysOperating: i * 15, date: '2026-01-01' });
    }
    expect(getTop().length).toBe(10);
  });

  it('should persist to localStorage', () => {
    addEntry({ name: 'Saved', score: 6000, inmatesManaged: 120, cash: 45000, daysOperating: 90, date: '2026-01-01' });
    const stored = JSON.parse(localStorage.getItem('lockdown-leaderboard')!);
    expect(stored[0].name).toBe('Saved');
  });

  it('should check if score would rank', () => {
    addEntry({ name: 'First', score: 12000, inmatesManaged: 250, cash: 95000, daysOperating: 180, date: '2026-01-01' });
    expect(wouldRank(15000)).toBe(1);
    expect(wouldRank(6000)).toBe(2);
  });

  it('should get rank by score', () => {
    addEntry({ name: 'First', score: 12000, inmatesManaged: 250, cash: 95000, daysOperating: 180, date: '2026-01-01' });
    addEntry({ name: 'Second', score: 7500, inmatesManaged: 150, cash: 55000, daysOperating: 100, date: '2026-01-02' });
    expect(getRank(12000)).toBe(1);
    expect(getRank(7500)).toBe(2);
    expect(getRank(99999)).toBeNull();
  });

  it('should clear all data', () => {
    addEntry({ name: 'Gone', score: 4000, inmatesManaged: 80, cash: 30000, daysOperating: 55, date: '2026-01-01' });
    clearLeaderboard();
    expect(getLeaderboard().length).toBe(0);
  });

  it('should track prison stats', () => {
    addEntry({ name: 'Chief', score: 11000, inmatesManaged: 220, cash: 85000, daysOperating: 160, date: '2026-01-01' });
    const entry = getTop()[0];
    expect(entry.inmatesManaged).toBe(220);
    expect(entry.cash).toBe(85000);
    expect(entry.daysOperating).toBe(160);
  });
});
