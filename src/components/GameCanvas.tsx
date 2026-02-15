'use client';

import { useRef, useEffect, useState, useCallback, useMemo } from 'react';
import { 
  Game, 
  createGame, 
  startGame, 
  updateGame, 
  togglePause,
  buildTile,
  placeObjectAt,
  hireStaff,
  admitInmate,
  placeZoneAt,
  setSelectedTool,
  setSelectedObject,
  setSelectedZone,
  getMoney,
  getDay,
  getHour,
  getMinute,
  getStaffCount,
  getInmateCount,
  getMessages,
  isPaused,
  isGameOver
} from '../game/Game';
import { renderGame, renderPausedOverlay, renderUI } from '../game/Renderer';
import { GameScreen, BuildTool, TileType, ObjectType, ZoneType, StaffType, SecurityLevel, Position } from '../game/types';
import { CANVAS_WIDTH, CANVAS_HEIGHT, TILE_SIZE, GRID_WIDTH, GRID_HEIGHT } from '../game/constants';

import TitleScreen from './TitleScreen';
import StatusBar from './StatusBar';
import SidePanel from './SidePanel';
import MessageLog from './MessageLog';
import GameOver from './GameOver';
import { soundSystem } from '../game/Sound';

export default function GameCanvas() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const gameRef = useRef<Game | null>(null);
  const lastTimeRef = useRef<number>(0);
  const animationRef = useRef<number>(0);
  
  const [screen, setScreen] = useState<GameScreen>(GameScreen.TITLE);
  const [money, setMoney] = useState(0);
  const [day, setDay] = useState(1);
  const [hour, setHour] = useState(6);
  const [minute, setMinute] = useState(0);
  const [staffCount, setStaffCount] = useState(0);
  const [inmateCount, setInmateCount] = useState(0);
  const [messages, setMessages] = useState<string[]>([]);
  const [paused, setPaused] = useState(false);
  
  const [currentTool, setCurrentTool] = useState<BuildTool>(BuildTool.NONE);
  const [currentTileType, setCurrentTileType] = useState<TileType | null>(null);
  const [currentObjectType, setCurrentObjectType] = useState<ObjectType | null>(null);
  const [pendingStaffType, setPendingStaffType] = useState<StaffType | null>(null);
  const [pendingZoneType, setPendingZoneType] = useState<ZoneType | null>(null);
  const [zoneDragStart, setZoneDragStart] = useState<Position | null>(null);
  const [zoneDragEnd, setZoneDragEnd] = useState<Position | null>(null);
  const [tileDragStart, setTileDragStart] = useState<Position | null>(null);
  const [tileDragEnd, setTileDragEnd] = useState<Position | null>(null);
  
  const [mouseX, setMouseX] = useState(0);
  const [mouseY, setMouseY] = useState(0);
  
  // Track previous state for sound triggers
  const prevStateRef = useRef<{
    staffCount: number;
    inmateCount: number;
    hour: number;
    messages: string[];
  } | null>(null);

  // Initialize game
  const initGame = useCallback(() => {
    const game = createGame();
    gameRef.current = game;
    setScreen(GameScreen.TITLE);
  }, []);

  // Start game
  const handleStart = useCallback(() => {
    if (gameRef.current) {
      startGame(gameRef.current);
      setScreen(GameScreen.PLAYING);
      lastTimeRef.current = performance.now();
    }
  }, []);

  // Restart game
  const handleRestart = useCallback(() => {
    initGame();
    handleStart();
  }, [initGame, handleStart]);

  // Update React state from game
  const syncState = useCallback(() => {
    const game = gameRef.current;
    if (!game) return;
    
    setMoney(getMoney(game));
    setDay(getDay(game));
    setHour(getHour(game));
    setMinute(getMinute(game));
    setStaffCount(getStaffCount(game));
    setInmateCount(getInmateCount(game));
    setMessages([...getMessages(game)]);
    setPaused(isPaused(game));
    
    if (isGameOver(game)) {
      setScreen(GameScreen.GAME_OVER);
    }
  }, []);

  // Game loop
  const gameLoop = useCallback((timestamp: number) => {
    const game = gameRef.current;
    const canvas = canvasRef.current;
    if (!game || !canvas) return;
    
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    
    // Calculate delta time in seconds
    const dt = (timestamp - lastTimeRef.current) / 1000;
    lastTimeRef.current = timestamp;
    
    // Update game (with time scaling - 1 real second = 1 game minute)
    if (screen === GameScreen.PLAYING) {
      updateGame(game, dt);
      syncState();
    }
    
    // Render
    renderGame(ctx, game.state);
    
    if (isPaused(game)) {
      renderPausedOverlay(ctx);
    }
    
    // Render UI overlay (mouse hover, build preview)
    if (currentTool !== BuildTool.NONE) {
      renderUI(ctx, mouseX, mouseY, true, currentTileType);
    }
    
    // Render zone preview during drag
    if (zoneDragStart && zoneDragEnd) {
      const minX = Math.min(zoneDragStart.x, zoneDragEnd.x);
      const maxX = Math.max(zoneDragStart.x, zoneDragEnd.x);
      const minY = Math.min(zoneDragStart.y, zoneDragEnd.y);
      const maxY = Math.max(zoneDragStart.y, zoneDragEnd.y);
      
      ctx.fillStyle = 'rgba(128, 0, 255, 0.3)';
      ctx.fillRect(
        minX * TILE_SIZE, 
        minY * TILE_SIZE, 
        (maxX - minX + 1) * TILE_SIZE, 
        (maxY - minY + 1) * TILE_SIZE
      );
      ctx.strokeStyle = '#8800ff';
      ctx.lineWidth = 2;
      ctx.strokeRect(
        minX * TILE_SIZE, 
        minY * TILE_SIZE, 
        (maxX - minX + 1) * TILE_SIZE, 
        (maxY - minY + 1) * TILE_SIZE
      );
    }
    
    // Render tile drag preview
    if (tileDragStart && tileDragEnd && currentTileType) {
      const minX = Math.min(tileDragStart.x, tileDragEnd.x);
      const maxX = Math.max(tileDragStart.x, tileDragEnd.x);
      const minY = Math.min(tileDragStart.y, tileDragEnd.y);
      const maxY = Math.max(tileDragStart.y, tileDragEnd.y);
      
      ctx.fillStyle = 'rgba(255, 200, 0, 0.3)';
      ctx.fillRect(
        minX * TILE_SIZE, 
        minY * TILE_SIZE, 
        (maxX - minX + 1) * TILE_SIZE, 
        (maxY - minY + 1) * TILE_SIZE
      );
      ctx.strokeStyle = '#ffcc00';
      ctx.lineWidth = 2;
      ctx.strokeRect(
        minX * TILE_SIZE, 
        minY * TILE_SIZE, 
        (maxX - minX + 1) * TILE_SIZE, 
        (maxY - minY + 1) * TILE_SIZE
      );
    }
    
    // Continue loop
    animationRef.current = requestAnimationFrame(gameLoop);
  }, [screen, currentTool, currentTileType, mouseX, mouseY, syncState, zoneDragStart, zoneDragEnd, tileDragStart, tileDragEnd]);

  // Start/stop game loop
  useEffect(() => {
    if (screen === GameScreen.PLAYING) {
      lastTimeRef.current = performance.now();
      animationRef.current = requestAnimationFrame(gameLoop);
    }
    
    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [screen, gameLoop]);

  // Initialize on mount
  useEffect(() => {
    initGame();
  }, [initGame]);

  // Sound effects based on state changes
  useEffect(() => {
    const prev = prevStateRef.current;
    
    if (prev && screen === GameScreen.PLAYING) {
      // Staff hired
      if (staffCount > prev.staffCount) {
        soundSystem.play('staffHired');
      }
      
      // New inmate admitted
      if (inmateCount > prev.inmateCount) {
        soundSystem.play('inmateAdmit');
      }
      
      // Time of day transitions
      if (hour !== prev.hour) {
        // Day starts at 6 AM
        if (hour === 6 && prev.hour === 5) {
          soundSystem.play('dayStart');
        }
        // Night starts at 22 (10 PM)
        if (hour === 22 && prev.hour === 21) {
          soundSystem.play('nightStart');
        }
        // Meal times: 7 AM, 12 PM, 6 PM
        if ((hour === 7 || hour === 12 || hour === 18) && 
            (prev.hour === 6 || prev.hour === 11 || prev.hour === 17)) {
          soundSystem.play('mealBell');
        }
      }
      
      // Check for fight or lockdown messages
      const newMessages = messages.filter(m => !prev.messages.includes(m));
      for (const msg of newMessages) {
        if (msg.toLowerCase().includes('fight')) {
          soundSystem.play('fightAlert');
        } else if (msg.toLowerCase().includes('lockdown')) {
          soundSystem.play('lockdownSiren');
        }
      }
    }
    
    // Update previous state
    prevStateRef.current = {
      staffCount,
      inmateCount,
      hour,
      messages: [...messages],
    };
  }, [screen, staffCount, inmateCount, hour, messages]);

  // Get grid coordinates from mouse event
  const getGridCoords = useCallback((e: React.MouseEvent<HTMLCanvasElement>): Position | null => {
    const canvas = canvasRef.current;
    if (!canvas) return null;
    
    const rect = canvas.getBoundingClientRect();
    const x = Math.floor((e.clientX - rect.left) / TILE_SIZE);
    const y = Math.floor((e.clientY - rect.top) / TILE_SIZE);
    
    if (x < 0 || x >= GRID_WIDTH || y < 0 || y >= GRID_HEIGHT) return null;
    return { x, y };
  }, []);

  // Handle mouse move
  const handleMouseMove = useCallback((e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    const rect = canvas.getBoundingClientRect();
    setMouseX(e.clientX - rect.left);
    setMouseY(e.clientY - rect.top);
    
    // Update zone drag end if dragging
    if (zoneDragStart !== null) {
      const pos = getGridCoords(e);
      if (pos) {
        setZoneDragEnd(pos);
      }
    }
    
    // Update tile drag end if dragging
    if (tileDragStart !== null) {
      const pos = getGridCoords(e);
      if (pos) {
        setTileDragEnd(pos);
      }
    }
  }, [zoneDragStart, tileDragStart, getGridCoords]);

  // Handle mouse down (start zone or tile drag)
  const handleMouseDown = useCallback((e: React.MouseEvent<HTMLCanvasElement>) => {
    const pos = getGridCoords(e);
    if (!pos) return;
    
    // Start zone drag
    if (pendingZoneType !== null) {
      setZoneDragStart(pos);
      setZoneDragEnd(pos);
    }
    
    // Start tile drag for build tools
    if (currentTool === BuildTool.WALL && currentTileType) {
      setTileDragStart(pos);
      setTileDragEnd(pos);
    }
  }, [pendingZoneType, currentTool, currentTileType, getGridCoords]);

  // Handle mouse up (complete zone drag or regular click)
  const handleMouseUp = useCallback((e: React.MouseEvent<HTMLCanvasElement>) => {
    const game = gameRef.current;
    if (!game) return;
    
    const pos = getGridCoords(e);
    if (!pos) return;
    
    // Complete zone placement
    if (pendingZoneType !== null && zoneDragStart !== null) {
      const endPos = pos;
      
      // Calculate zone rectangle
      const minX = Math.min(zoneDragStart.x, endPos.x);
      const maxX = Math.max(zoneDragStart.x, endPos.x);
      const minY = Math.min(zoneDragStart.y, endPos.y);
      const maxY = Math.max(zoneDragStart.y, endPos.y);
      
      // Create tiles array for zone
      const tiles: Position[] = [];
      for (let y = minY; y <= maxY; y++) {
        for (let x = minX; x <= maxX; x++) {
          tiles.push({ x, y });
        }
      }
      
      // Try to place zone
      placeZoneAt(game, pendingZoneType, tiles);
      soundSystem.play('zoneBuilt');
      syncState();
      
      // Clear drag state but keep zone type selected for more placements
      setZoneDragStart(null);
      setZoneDragEnd(null);
      return;
    }
    
    // Handle pending staff placement
    if (pendingStaffType !== null) {
      hireStaff(game, pendingStaffType, pos);
      setPendingStaffType(null);
      syncState();
      return;
    }
    
    // Complete tile drag build
    if (currentTool === BuildTool.WALL && currentTileType && tileDragStart !== null) {
      const minX = Math.min(tileDragStart.x, pos.x);
      const maxX = Math.max(tileDragStart.x, pos.x);
      const minY = Math.min(tileDragStart.y, pos.y);
      const maxY = Math.max(tileDragStart.y, pos.y);
      
      // Build all tiles in the rectangle
      for (let y = minY; y <= maxY; y++) {
        for (let x = minX; x <= maxX; x++) {
          buildTile(game, x, y, currentTileType);
        }
      }
      syncState();
      
      // Clear drag state but keep tool selected
      setTileDragStart(null);
      setTileDragEnd(null);
      return;
    }
    
    // Handle single-click object placement
    if (currentTool === BuildTool.OBJECT && currentObjectType) {
      placeObjectAt(game, pos.x, pos.y, currentObjectType);
      syncState();
    }
  }, [currentTool, currentTileType, currentObjectType, pendingStaffType, pendingZoneType, zoneDragStart, tileDragStart, syncState, getGridCoords]);

  // Cancel all selections
  const cancelSelection = useCallback(() => {
    setCurrentTool(BuildTool.NONE);
    setCurrentTileType(null);
    setCurrentObjectType(null);
    setPendingStaffType(null);
    setPendingZoneType(null);
    setZoneDragStart(null);
    setZoneDragEnd(null);
    setTileDragStart(null);
    setTileDragEnd(null);
  }, []);

  // Handle right-click to cancel
  const handleContextMenu = useCallback((e: React.MouseEvent<HTMLCanvasElement>) => {
    e.preventDefault();
    cancelSelection();
  }, [cancelSelection]);

  // Handle keyboard
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const game = gameRef.current;
      if (!game || screen !== GameScreen.PLAYING) return;
      
      // Helper to select a build tool
      const selectTool = (tool: BuildTool, tileType?: TileType) => {
        setCurrentTool(tool);
        setCurrentTileType(tileType || null);
        setCurrentObjectType(null);
        setPendingStaffType(null);
        setPendingZoneType(null);
        setZoneDragStart(null);
        setZoneDragEnd(null);
        setTileDragStart(null);
        setTileDragEnd(null);
      };
      
      if (e.key === ' ' || e.key === 'p' || e.key === 'P') {
        togglePause(game);
        syncState();
      } else if (e.key === 'Escape') {
        cancelSelection();
      } else if (e.key === '1') {
        selectTool(BuildTool.WALL, TileType.WALL);
      } else if (e.key === '2') {
        selectTool(BuildTool.WALL, TileType.FLOOR);
      } else if (e.key === '3') {
        selectTool(BuildTool.WALL, TileType.DOOR);
      } else if (e.key === '4') {
        selectTool(BuildTool.WALL, TileType.FENCE);
      } else if (e.key === '5') {
        selectTool(BuildTool.WALL, TileType.GRASS);
      } else if (e.key === '6') {
        cancelSelection();
      }
    };
    
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [screen, syncState, cancelSelection]);

  // Tool selection handlers
  const handleSelectTool = useCallback((tool: BuildTool, tileType?: TileType, objectType?: ObjectType) => {
    setCurrentTool(tool);
    setCurrentTileType(tileType || null);
    setCurrentObjectType(objectType || null);
    setPendingStaffType(null);
    setPendingZoneType(null);
    setZoneDragStart(null);
    setZoneDragEnd(null);
  }, []);

  const handleSelectZone = useCallback((zone: ZoneType) => {
    if (zone === ZoneType.NONE) {
      setPendingZoneType(null);
      setZoneDragStart(null);
      setZoneDragEnd(null);
    } else {
      setPendingZoneType(zone);
      setCurrentTool(BuildTool.NONE);
      setPendingStaffType(null);
    }
  }, []);

  const handleHireStaff = useCallback((type: StaffType) => {
    setPendingStaffType(type);
    setCurrentTool(BuildTool.NONE);
    setPendingZoneType(null);
  }, []);

  const handleAdmitInmate = useCallback((name: string, security: SecurityLevel, sentence: number) => {
    const game = gameRef.current;
    if (!game) return;
    
    admitInmate(game, name, security, sentence);
    syncState();
  }, [syncState]);

  // Render based on screen
  if (screen === GameScreen.TITLE) {
    return <TitleScreen onStart={handleStart} />;
  }

  if (screen === GameScreen.GAME_OVER) {
    return (
      <GameOver
        day={day}
        inmateCount={inmateCount}
        money={money}
        onRestart={handleRestart}
      />
    );
  }

  return (
    <div className="flex flex-col h-screen bg-gray-900">
      <StatusBar
        money={money}
        day={day}
        hour={hour}
        minute={minute}
        inmateCount={inmateCount}
        staffCount={staffCount}
        paused={paused}
      />
      
      <div className="flex flex-1 overflow-hidden">
        <div className="flex-1 flex flex-col">
          <div className="flex-1 flex items-center justify-center bg-black">
            <canvas
              ref={canvasRef}
              width={CANVAS_WIDTH}
              height={CANVAS_HEIGHT}
              onMouseMove={handleMouseMove}
              onMouseDown={handleMouseDown}
              onMouseUp={handleMouseUp}
              onContextMenu={handleContextMenu}
              className="cursor-crosshair"
            />
          </div>
          <MessageLog messages={messages} />
        </div>
        
        <SidePanel
          money={money}
          onSelectTool={handleSelectTool}
          onSelectZone={handleSelectZone}
          onHireStaff={handleHireStaff}
          onAdmitInmate={handleAdmitInmate}
        />
      </div>
      
      {pendingStaffType && (
        <div className="absolute bottom-36 left-4 bg-blue-600 text-white px-4 py-2 rounded">
          Click on map to place {pendingStaffType}
        </div>
      )}
      
      {pendingZoneType && (
        <div className="absolute bottom-36 left-4 bg-purple-600 text-white px-4 py-2 rounded">
          {zoneDragStart 
            ? `Drag to define ${pendingZoneType} zone (release to place)` 
            : `Click and drag to create ${pendingZoneType} zone`}
        </div>
      )}
    </div>
  );
}
