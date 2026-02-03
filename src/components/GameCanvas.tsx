'use client';

import { useRef, useEffect, useState, useCallback } from 'react';
import { 
  Game, 
  createGame, 
  startGame, 
  updateGame, 
  togglePause,
  buildTile,
  placeObjectAt,
  hireStaff,
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
import { GameScreen, BuildTool, TileType, ObjectType, ZoneType, StaffType } from '../game/types';
import { CANVAS_WIDTH, CANVAS_HEIGHT, TILE_SIZE } from '../game/constants';

import TitleScreen from './TitleScreen';
import StatusBar from './StatusBar';
import SidePanel from './SidePanel';
import MessageLog from './MessageLog';
import GameOver from './GameOver';

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
  
  const [mouseX, setMouseX] = useState(0);
  const [mouseY, setMouseY] = useState(0);

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
    
    // Continue loop
    animationRef.current = requestAnimationFrame(gameLoop);
  }, [screen, currentTool, currentTileType, mouseX, mouseY, syncState]);

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

  // Handle mouse move
  const handleMouseMove = useCallback((e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    const rect = canvas.getBoundingClientRect();
    setMouseX(e.clientX - rect.left);
    setMouseY(e.clientY - rect.top);
  }, []);

  // Handle click
  const handleClick = useCallback((e: React.MouseEvent<HTMLCanvasElement>) => {
    const game = gameRef.current;
    if (!game) return;
    
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    const rect = canvas.getBoundingClientRect();
    const x = Math.floor((e.clientX - rect.left) / TILE_SIZE);
    const y = Math.floor((e.clientY - rect.top) / TILE_SIZE);
    
    // Handle pending staff placement
    if (pendingStaffType !== null) {
      hireStaff(game, pendingStaffType, { x, y });
      setPendingStaffType(null);
      syncState();
      return;
    }
    
    // Handle build tool
    if (currentTool === BuildTool.WALL && currentTileType) {
      buildTile(game, x, y, currentTileType);
      syncState();
    } else if (currentTool === BuildTool.OBJECT && currentObjectType) {
      placeObjectAt(game, x, y, currentObjectType);
      syncState();
    }
  }, [currentTool, currentTileType, currentObjectType, pendingStaffType, syncState]);

  // Handle keyboard
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const game = gameRef.current;
      if (!game || screen !== GameScreen.PLAYING) return;
      
      if (e.key === ' ' || e.key === 'p' || e.key === 'P') {
        togglePause(game);
        syncState();
      } else if (e.key === 'Escape') {
        setCurrentTool(BuildTool.NONE);
        setCurrentTileType(null);
        setCurrentObjectType(null);
        setPendingStaffType(null);
      }
    };
    
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [screen, syncState]);

  // Tool selection handlers
  const handleSelectTool = useCallback((tool: BuildTool, tileType?: TileType, objectType?: ObjectType) => {
    setCurrentTool(tool);
    setCurrentTileType(tileType || null);
    setCurrentObjectType(objectType || null);
    setPendingStaffType(null);
  }, []);

  const handleSelectZone = useCallback((zone: ZoneType) => {
    // Zone placement would need more complex UI (drag to select area)
    // For MVP, just log it
    console.log('Zone selected:', zone);
  }, []);

  const handleHireStaff = useCallback((type: StaffType) => {
    setPendingStaffType(type);
    setCurrentTool(BuildTool.NONE);
  }, []);

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
              onClick={handleClick}
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
        />
      </div>
      
      {pendingStaffType && (
        <div className="absolute bottom-36 left-4 bg-blue-600 text-white px-4 py-2 rounded">
          Click on map to place {pendingStaffType}
        </div>
      )}
    </div>
  );
}
