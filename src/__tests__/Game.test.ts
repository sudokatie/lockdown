import {
  createGame,
  startGame,
  togglePause,
  isPaused,
  isGameOver,
  setGameOver,
  addMessage,
  getMessages,
  clearMessages,
  updateTime,
  updateGame,
  setSelectedTool,
  setSelectedObject,
  setSelectedZone,
  buildTile,
  placeObjectAt,
  removeObject,
  hireStaff,
  fireStaff,
  admitInmate,
  releaseInmate,
  placeZoneAt,
  removeZone,
  getMoney,
  getDay,
  getHour,
  getMinute,
  getStaffCount,
  getInmateCount,
  getGrid
} from '../game/Game';
import { setTile } from '../game/Grid';
import { resetStaffIdCounter } from '../game/Staff';
import { resetInmateIdCounter } from '../game/Inmate';
import {
  GameScreen,
  BuildTool,
  TileType,
  ObjectType,
  ZoneType,
  StaffType,
  SecurityLevel
} from '../game/types';
import { STARTING_MONEY, TILE_COSTS, OBJECT_COSTS, STAFF_COSTS, BANKRUPTCY_THRESHOLD } from '../game/constants';

describe('Game', () => {
  beforeEach(() => {
    resetStaffIdCounter();
    resetInmateIdCounter();
  });

  describe('createGame', () => {
    it('initializes with title screen', () => {
      const game = createGame();
      expect(game.state.screen).toBe(GameScreen.TITLE);
    });

    it('initializes with empty grid', () => {
      const game = createGame();
      expect(game.state.grid).toBeDefined();
      expect(game.state.grid.length).toBe(30); // GRID_HEIGHT
      expect(game.state.grid[0].length).toBe(40); // GRID_WIDTH
    });

    it('sets starting money', () => {
      const game = createGame();
      expect(game.economy.money).toBe(STARTING_MONEY);
    });

    it('creates empty staff list', () => {
      const game = createGame();
      expect(game.state.staff).toEqual([]);
    });

    it('creates empty inmate list', () => {
      const game = createGame();
      expect(game.state.inmates).toEqual([]);
    });

    it('creates empty events list', () => {
      const game = createGame();
      expect(game.state.events).toEqual([]);
    });

    it('starts at day 1, hour 6', () => {
      const game = createGame();
      expect(game.state.day).toBe(1);
      expect(game.state.hour).toBe(6);
      expect(game.state.minute).toBe(0);
    });
  });

  describe('game control', () => {
    it('starts game', () => {
      const game = createGame();
      startGame(game);
      expect(game.state.screen).toBe(GameScreen.PLAYING);
    });

    it('toggles pause', () => {
      const game = createGame();
      expect(isPaused(game)).toBe(false);
      togglePause(game);
      expect(isPaused(game)).toBe(true);
      togglePause(game);
      expect(isPaused(game)).toBe(false);
    });

    it('detects game over at bankruptcy', () => {
      const game = createGame();
      expect(isGameOver(game)).toBe(false);
      
      game.economy.money = BANKRUPTCY_THRESHOLD;
      expect(isGameOver(game)).toBe(true);
    });

    it('sets game over screen', () => {
      const game = createGame();
      setGameOver(game);
      expect(game.state.screen).toBe(GameScreen.GAME_OVER);
    });
  });

  describe('messages', () => {
    it('adds messages', () => {
      const game = createGame();
      addMessage(game, 'Test message');
      expect(getMessages(game)).toContain('Test message');
    });

    it('limits messages to 20', () => {
      const game = createGame();
      for (let i = 0; i < 25; i++) {
        addMessage(game, `Message ${i}`);
      }
      expect(getMessages(game).length).toBe(20);
      expect(getMessages(game)[0]).toBe('Message 5');
    });

    it('clears messages', () => {
      const game = createGame();
      addMessage(game, 'Test');
      clearMessages(game);
      expect(getMessages(game).length).toBe(0);
    });
  });

  describe('time management', () => {
    it('advances time', () => {
      const game = createGame();
      startGame(game);
      game.state.minute = 0;
      
      updateTime(game, 5);
      expect(game.state.minute).toBe(5);
    });

    it('rolls to next hour at 60 minutes', () => {
      const game = createGame();
      startGame(game);
      game.state.hour = 6;
      game.state.minute = 58;
      
      updateTime(game, 5);
      expect(game.state.hour).toBe(7);
      expect(game.state.minute).toBe(3);
    });

    it('rolls to next day at 24 hours', () => {
      const game = createGame();
      startGame(game);
      game.state.day = 1;
      game.state.hour = 23;
      game.state.minute = 58;
      
      updateTime(game, 5);
      expect(game.state.day).toBe(2);
      expect(game.state.hour).toBe(0);
    });

    it('does not advance when paused', () => {
      const game = createGame();
      startGame(game);
      togglePause(game);
      
      const initialMinute = game.state.minute;
      updateTime(game, 10);
      expect(game.state.minute).toBe(initialMinute);
    });
  });

  describe('updateGame', () => {
    it('does nothing when paused', () => {
      const game = createGame();
      startGame(game);
      togglePause(game);
      
      const initialHour = game.state.hour;
      updateGame(game, 60);
      expect(game.state.hour).toBe(initialHour);
    });

    it('does nothing on title screen', () => {
      const game = createGame();
      const initialHour = game.state.hour;
      updateGame(game, 60);
      expect(game.state.hour).toBe(initialHour);
    });
  });

  describe('building', () => {
    it('sets selected tool', () => {
      const game = createGame();
      setSelectedTool(game, BuildTool.WALL);
      expect(game.state.selectedTool).toBe(BuildTool.WALL);
    });

    it('sets selected object', () => {
      const game = createGame();
      setSelectedObject(game, ObjectType.BED);
      expect(game.state.selectedObject).toBe(ObjectType.BED);
    });

    it('sets selected zone', () => {
      const game = createGame();
      setSelectedZone(game, ZoneType.CELL);
      expect(game.state.selectedZone).toBe(ZoneType.CELL);
    });

    it('builds wall tile', () => {
      const game = createGame();
      const result = buildTile(game, 5, 5, TileType.WALL);
      
      expect(result).toBe(true);
      expect(game.state.grid[5][5].type).toBe(TileType.WALL);
      expect(game.economy.money).toBe(STARTING_MONEY - TILE_COSTS[TileType.WALL]);
    });

    it('fails to build when cant afford', () => {
      const game = createGame();
      game.economy.money = 10;
      
      const result = buildTile(game, 5, 5, TileType.WALL);
      expect(result).toBe(false);
    });

    it('places object on floor', () => {
      const game = createGame();
      setTile(game.state.grid, 5, 5, TileType.FLOOR);
      
      const result = placeObjectAt(game, 5, 5, ObjectType.BED);
      expect(result).toBe(true);
      expect(game.state.grid[5][5].object).toBe(ObjectType.BED);
    });

    it('fails to place object on non-floor', () => {
      const game = createGame();
      setTile(game.state.grid, 5, 5, TileType.WALL);
      
      const result = placeObjectAt(game, 5, 5, ObjectType.BED);
      expect(result).toBe(false);
    });

    it('removes object', () => {
      const game = createGame();
      setTile(game.state.grid, 5, 5, TileType.FLOOR);
      placeObjectAt(game, 5, 5, ObjectType.BED);
      
      const result = removeObject(game, 5, 5);
      expect(result).toBe(true);
      expect(game.state.grid[5][5].object).toBe(ObjectType.NONE);
    });
  });

  describe('staffing', () => {
    it('hires staff', () => {
      const game = createGame();
      setTile(game.state.grid, 5, 5, TileType.FLOOR);
      
      const staff = hireStaff(game, StaffType.GUARD, { x: 5, y: 5 });
      expect(staff).not.toBeNull();
      expect(game.state.staff.length).toBe(1);
      expect(game.economy.money).toBe(STARTING_MONEY - STAFF_COSTS[StaffType.GUARD]);
    });

    it('fails to hire on invalid tile', () => {
      const game = createGame();
      // Default tile is EMPTY
      
      const staff = hireStaff(game, StaffType.GUARD, { x: 5, y: 5 });
      expect(staff).toBeNull();
    });

    it('fires staff', () => {
      const game = createGame();
      setTile(game.state.grid, 5, 5, TileType.FLOOR);
      const staff = hireStaff(game, StaffType.GUARD, { x: 5, y: 5 });
      
      const result = fireStaff(game, staff!.id);
      expect(result).toBe(true);
      expect(game.state.staff.length).toBe(0);
    });
  });

  describe('inmates', () => {
    it('fails to admit without cell', () => {
      const game = createGame();
      const inmate = admitInmate(game, 'John', SecurityLevel.MIN, 30);
      expect(inmate).toBeNull();
    });

    it('releases inmate', () => {
      const game = createGame();
      
      // Create a cell zone
      setTile(game.state.grid, 5, 5, TileType.FLOOR);
      game.state.zones.push({
        id: 'zone_1',
        type: ZoneType.CELL,
        tiles: [{ x: 5, y: 5 }],
        valid: true
      });
      
      const inmate = admitInmate(game, 'John', SecurityLevel.MIN, 30);
      expect(inmate).not.toBeNull();
      
      const result = releaseInmate(game, inmate!.id);
      expect(result).toBe(true);
      expect(game.state.inmates.length).toBe(0);
    });
  });

  describe('getters', () => {
    it('gets money', () => {
      const game = createGame();
      expect(getMoney(game)).toBe(STARTING_MONEY);
    });

    it('gets day/hour/minute', () => {
      const game = createGame();
      expect(getDay(game)).toBe(1);
      expect(getHour(game)).toBe(6);
      expect(getMinute(game)).toBe(0);
    });

    it('gets staff count', () => {
      const game = createGame();
      setTile(game.state.grid, 5, 5, TileType.FLOOR);
      hireStaff(game, StaffType.GUARD, { x: 5, y: 5 });
      expect(getStaffCount(game)).toBe(1);
    });

    it('gets inmate count', () => {
      const game = createGame();
      expect(getInmateCount(game)).toBe(0);
    });

    it('gets grid', () => {
      const game = createGame();
      const grid = getGrid(game);
      expect(grid.length).toBe(30);
    });
  });
});
