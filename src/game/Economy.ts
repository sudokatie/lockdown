import { Staff, Inmate, StaffType } from './types';
import {
  STARTING_MONEY,
  DAILY_GRANT_PER_INMATE,
  DAILY_FOOD_COST_PER_INMATE,
  STAFF_COSTS
} from './constants';

export interface Economy {
  money: number;
  lastDailyUpdate: number;
}

export function createEconomy(): Economy {
  return {
    money: STARTING_MONEY,
    lastDailyUpdate: 0
  };
}

export function getMoney(economy: Economy): number {
  return economy.money;
}

export function addMoney(economy: Economy, amount: number): void {
  economy.money += amount;
}

export function spendMoney(economy: Economy, amount: number): boolean {
  if (economy.money < amount) {
    return false;
  }
  economy.money -= amount;
  return true;
}

export function canAfford(economy: Economy, amount: number): boolean {
  return economy.money >= amount;
}

export function calculateDailyIncome(inmates: Inmate[]): number {
  return inmates.length * DAILY_GRANT_PER_INMATE;
}

export function calculateStaffWages(staff: Staff[]): number {
  let total = 0;
  
  for (const s of staff) {
    total += STAFF_COSTS[s.type];
  }
  
  return total;
}

export function calculateFoodCost(inmates: Inmate[]): number {
  return inmates.length * DAILY_FOOD_COST_PER_INMATE;
}

export function calculateDailyExpenses(staff: Staff[], inmates: Inmate[]): number {
  return calculateStaffWages(staff) + calculateFoodCost(inmates);
}

export function processDailyEconomy(
  economy: Economy,
  staff: Staff[],
  inmates: Inmate[],
  currentDay: number
): { income: number; expenses: number; netChange: number } {
  // Only process once per day
  if (currentDay <= economy.lastDailyUpdate) {
    return { income: 0, expenses: 0, netChange: 0 };
  }
  
  const income = calculateDailyIncome(inmates);
  const expenses = calculateDailyExpenses(staff, inmates);
  const netChange = income - expenses;
  
  economy.money += netChange;
  economy.lastDailyUpdate = currentDay;
  
  return { income, expenses, netChange };
}

export function isInDebt(economy: Economy): boolean {
  return economy.money < 0;
}

export function isBankrupt(economy: Economy, threshold: number): boolean {
  return economy.money <= threshold;
}

export function getStaffCostByType(type: StaffType): number {
  return STAFF_COSTS[type];
}

export function getTotalStaffCount(staff: Staff[]): number {
  return staff.length;
}

export function getStaffCountByType(staff: Staff[], type: StaffType): number {
  return staff.filter(s => s.type === type).length;
}
