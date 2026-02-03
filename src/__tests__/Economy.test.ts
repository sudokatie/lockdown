import {
  createEconomy,
  getMoney,
  addMoney,
  spendMoney,
  canAfford,
  calculateDailyIncome,
  calculateStaffWages,
  calculateFoodCost,
  calculateDailyExpenses,
  processDailyEconomy,
  isInDebt,
  isBankrupt,
  getStaffCostByType,
  getTotalStaffCount,
  getStaffCountByType
} from '../game/Economy';
import { createStaff, resetStaffIdCounter } from '../game/Staff';
import { createInmate, resetInmateIdCounter } from '../game/Inmate';
import { StaffType, SecurityLevel } from '../game/types';
import {
  STARTING_MONEY,
  DAILY_GRANT_PER_INMATE,
  DAILY_FOOD_COST_PER_INMATE,
  STAFF_COSTS,
  BANKRUPTCY_THRESHOLD
} from '../game/constants';

describe('Economy', () => {
  beforeEach(() => {
    resetStaffIdCounter();
    resetInmateIdCounter();
  });

  describe('createEconomy', () => {
    it('starts with correct starting money', () => {
      const economy = createEconomy();
      expect(economy.money).toBe(STARTING_MONEY);
      expect(economy.money).toBe(30000);
    });

    it('starts with lastDailyUpdate at 0', () => {
      const economy = createEconomy();
      expect(economy.lastDailyUpdate).toBe(0);
    });
  });

  describe('money management', () => {
    it('gets money correctly', () => {
      const economy = createEconomy();
      expect(getMoney(economy)).toBe(STARTING_MONEY);
    });

    it('adds money to balance', () => {
      const economy = createEconomy();
      addMoney(economy, 5000);
      expect(economy.money).toBe(STARTING_MONEY + 5000);
    });

    it('spends money and decreases balance', () => {
      const economy = createEconomy();
      const result = spendMoney(economy, 1000);
      expect(result).toBe(true);
      expect(economy.money).toBe(STARTING_MONEY - 1000);
    });

    it('fails to spend if insufficient funds', () => {
      const economy = createEconomy();
      const result = spendMoney(economy, STARTING_MONEY + 1);
      expect(result).toBe(false);
      expect(economy.money).toBe(STARTING_MONEY);
    });

    it('canAfford returns true when enough money', () => {
      const economy = createEconomy();
      expect(canAfford(economy, 1000)).toBe(true);
      expect(canAfford(economy, STARTING_MONEY)).toBe(true);
    });

    it('canAfford returns false when not enough', () => {
      const economy = createEconomy();
      expect(canAfford(economy, STARTING_MONEY + 1)).toBe(false);
    });
  });

  describe('income calculations', () => {
    it('calculates daily income per inmate', () => {
      const inmates = [
        createInmate('A', SecurityLevel.MIN, 30, { x: 0, y: 0 }),
        createInmate('B', SecurityLevel.MIN, 30, { x: 0, y: 0 }),
        createInmate('C', SecurityLevel.MIN, 30, { x: 0, y: 0 })
      ];
      
      const income = calculateDailyIncome(inmates);
      expect(income).toBe(3 * DAILY_GRANT_PER_INMATE);
      expect(income).toBe(150); // $50 per inmate
    });

    it('returns 0 income for no inmates', () => {
      const income = calculateDailyIncome([]);
      expect(income).toBe(0);
    });
  });

  describe('expense calculations', () => {
    it('calculates guard cost at $100/day', () => {
      const staff = [createStaff(StaffType.GUARD, { x: 0, y: 0 })];
      expect(calculateStaffWages(staff)).toBe(100);
    });

    it('calculates cook cost at $75/day', () => {
      const staff = [createStaff(StaffType.COOK, { x: 0, y: 0 })];
      expect(calculateStaffWages(staff)).toBe(75);
    });

    it('calculates janitor cost at $50/day', () => {
      const staff = [createStaff(StaffType.JANITOR, { x: 0, y: 0 })];
      expect(calculateStaffWages(staff)).toBe(50);
    });

    it('calculates total staff wages', () => {
      const staff = [
        createStaff(StaffType.GUARD, { x: 0, y: 0 }),
        createStaff(StaffType.GUARD, { x: 0, y: 0 }),
        createStaff(StaffType.COOK, { x: 0, y: 0 })
      ];
      // 100 + 100 + 75 = 275
      expect(calculateStaffWages(staff)).toBe(275);
    });

    it('calculates food cost at $5/inmate/day', () => {
      const inmates = [
        createInmate('A', SecurityLevel.MIN, 30, { x: 0, y: 0 }),
        createInmate('B', SecurityLevel.MIN, 30, { x: 0, y: 0 })
      ];
      expect(calculateFoodCost(inmates)).toBe(10);
    });

    it('calculates total daily expenses', () => {
      const staff = [
        createStaff(StaffType.GUARD, { x: 0, y: 0 }), // $100
        createStaff(StaffType.COOK, { x: 0, y: 0 })   // $75
      ];
      const inmates = [
        createInmate('A', SecurityLevel.MIN, 30, { x: 0, y: 0 }), // $5 food
        createInmate('B', SecurityLevel.MIN, 30, { x: 0, y: 0 })  // $5 food
      ];
      
      // 100 + 75 + 10 = 185
      expect(calculateDailyExpenses(staff, inmates)).toBe(185);
    });
  });

  describe('processDailyEconomy', () => {
    it('processes income and expenses', () => {
      const economy = createEconomy();
      const staff = [createStaff(StaffType.GUARD, { x: 0, y: 0 })]; // $100
      const inmates = [
        createInmate('A', SecurityLevel.MIN, 30, { x: 0, y: 0 }),
        createInmate('B', SecurityLevel.MIN, 30, { x: 0, y: 0 }),
        createInmate('C', SecurityLevel.MIN, 30, { x: 0, y: 0 })
      ]; // $150 income, $15 food
      
      const result = processDailyEconomy(economy, staff, inmates, 1);
      
      expect(result.income).toBe(150);
      expect(result.expenses).toBe(115); // 100 + 15
      expect(result.netChange).toBe(35);
      expect(economy.money).toBe(STARTING_MONEY + 35);
    });

    it('only processes once per day', () => {
      const economy = createEconomy();
      const staff = [createStaff(StaffType.GUARD, { x: 0, y: 0 })];
      const inmates = [createInmate('A', SecurityLevel.MIN, 30, { x: 0, y: 0 })];
      
      processDailyEconomy(economy, staff, inmates, 1);
      const initialMoney = economy.money;
      
      // Try to process same day again
      const result = processDailyEconomy(economy, staff, inmates, 1);
      
      expect(result.netChange).toBe(0);
      expect(economy.money).toBe(initialMoney);
    });

    it('allows negative balance (debt)', () => {
      const economy = createEconomy();
      economy.money = 50; // Low starting money
      
      const staff = [
        createStaff(StaffType.GUARD, { x: 0, y: 0 }),
        createStaff(StaffType.GUARD, { x: 0, y: 0 })
      ]; // $200 wages
      const inmates: any[] = []; // No income
      
      processDailyEconomy(economy, staff, inmates, 1);
      
      expect(economy.money).toBe(-150);
    });
  });

  describe('debt and bankruptcy', () => {
    it('detects when in debt', () => {
      const economy = createEconomy();
      expect(isInDebt(economy)).toBe(false);
      
      economy.money = -100;
      expect(isInDebt(economy)).toBe(true);
      
      economy.money = 0;
      expect(isInDebt(economy)).toBe(false);
    });

    it('detects bankruptcy at threshold', () => {
      const economy = createEconomy();
      expect(isBankrupt(economy, BANKRUPTCY_THRESHOLD)).toBe(false);
      
      economy.money = BANKRUPTCY_THRESHOLD;
      expect(isBankrupt(economy, BANKRUPTCY_THRESHOLD)).toBe(true);
      
      economy.money = BANKRUPTCY_THRESHOLD - 1;
      expect(isBankrupt(economy, BANKRUPTCY_THRESHOLD)).toBe(true);
    });
  });

  describe('staff utilities', () => {
    it('gets staff cost by type', () => {
      expect(getStaffCostByType(StaffType.GUARD)).toBe(100);
      expect(getStaffCostByType(StaffType.COOK)).toBe(75);
      expect(getStaffCostByType(StaffType.JANITOR)).toBe(50);
    });

    it('gets total staff count', () => {
      const staff = [
        createStaff(StaffType.GUARD, { x: 0, y: 0 }),
        createStaff(StaffType.COOK, { x: 0, y: 0 }),
        createStaff(StaffType.JANITOR, { x: 0, y: 0 })
      ];
      expect(getTotalStaffCount(staff)).toBe(3);
    });

    it('gets staff count by type', () => {
      const staff = [
        createStaff(StaffType.GUARD, { x: 0, y: 0 }),
        createStaff(StaffType.GUARD, { x: 0, y: 0 }),
        createStaff(StaffType.COOK, { x: 0, y: 0 })
      ];
      
      expect(getStaffCountByType(staff, StaffType.GUARD)).toBe(2);
      expect(getStaffCountByType(staff, StaffType.COOK)).toBe(1);
      expect(getStaffCountByType(staff, StaffType.JANITOR)).toBe(0);
    });
  });
});
