import { GameState, Tile, TileType, ZoneType, Staff, Inmate, StaffType, Position, ObjectType } from './types';
import { TILE_SIZE, GRID_WIDTH, GRID_HEIGHT, TILE_COLORS, ZONE_COLORS, ENTITY_COLORS } from './constants';

export function renderGame(ctx: CanvasRenderingContext2D, state: GameState): void {
  ctx.save();
  
  // Clear canvas
  ctx.fillStyle = '#0a0a0f';
  ctx.fillRect(0, 0, GRID_WIDTH * TILE_SIZE, GRID_HEIGHT * TILE_SIZE);
  
  // Draw in order: grid, zones, objects, entities, UI
  renderGrid(ctx, state.grid);
  renderZones(ctx, state.zones, state.grid);
  renderObjects(ctx, state.grid);
  renderStaff(ctx, state.staff);
  renderInmates(ctx, state.inmates);
  
  ctx.restore();
}

export function renderGrid(ctx: CanvasRenderingContext2D, grid: Tile[][]): void {
  for (let y = 0; y < grid.length; y++) {
    for (let x = 0; x < grid[y].length; x++) {
      const tile = grid[y][x];
      renderTile(ctx, x, y, tile);
    }
  }
}

export function renderTile(ctx: CanvasRenderingContext2D, x: number, y: number, tile: Tile): void {
  const px = x * TILE_SIZE;
  const py = y * TILE_SIZE;
  
  // Get tile color
  const color = getTileColor(tile.type);
  
  ctx.fillStyle = color;
  ctx.fillRect(px, py, TILE_SIZE, TILE_SIZE);
  
  // Add subtle grid lines
  ctx.strokeStyle = 'rgba(0, 0, 0, 0.2)';
  ctx.lineWidth = 1;
  ctx.strokeRect(px, py, TILE_SIZE, TILE_SIZE);
}

export function getTileColor(type: TileType): string {
  return TILE_COLORS[type] || '#1a1a2a';
}

export function renderZones(
  ctx: CanvasRenderingContext2D, 
  zones: { type: ZoneType; tiles: Position[] }[],
  grid: Tile[][]
): void {
  for (let y = 0; y < grid.length; y++) {
    for (let x = 0; x < grid[y].length; x++) {
      const tile = grid[y][x];
      if (tile.zone !== ZoneType.NONE) {
        renderZoneOverlay(ctx, x, y, tile.zone);
      }
    }
  }
}

export function renderZoneOverlay(ctx: CanvasRenderingContext2D, x: number, y: number, zone: ZoneType): void {
  const px = x * TILE_SIZE;
  const py = y * TILE_SIZE;
  
  const color = getZoneColor(zone);
  ctx.fillStyle = color;
  ctx.fillRect(px, py, TILE_SIZE, TILE_SIZE);
}

export function getZoneColor(zone: ZoneType): string {
  return ZONE_COLORS[zone] || 'transparent';
}

export function renderObjects(ctx: CanvasRenderingContext2D, grid: Tile[][]): void {
  for (let y = 0; y < grid.length; y++) {
    for (let x = 0; x < grid[y].length; x++) {
      const tile = grid[y][x];
      if (tile.object !== ObjectType.NONE) {
        renderObject(ctx, x, y, tile.object);
      }
    }
  }
}

export function renderObject(ctx: CanvasRenderingContext2D, x: number, y: number, obj: ObjectType): void {
  const px = x * TILE_SIZE;
  const py = y * TILE_SIZE;
  const padding = 4;
  
  ctx.fillStyle = getObjectColor(obj);
  ctx.fillRect(px + padding, py + padding, TILE_SIZE - padding * 2, TILE_SIZE - padding * 2);
}

export function getObjectColor(obj: ObjectType): string {
  const colors: Record<ObjectType, string> = {
    [ObjectType.NONE]: 'transparent',
    [ObjectType.BED]: '#5a4a3a',
    [ObjectType.TOILET]: '#6a6a7a',
    [ObjectType.TABLE]: '#4a3a2a',
    [ObjectType.BENCH]: '#4a3a2a',
    [ObjectType.COOKER]: '#3a3a4a',
    [ObjectType.FRIDGE]: '#5a5a6a',
    [ObjectType.SINK]: '#4a5a6a',
    [ObjectType.SHOWERHEAD]: '#5a6a7a',
    [ObjectType.DRAIN]: '#3a3a3a',
    [ObjectType.DESK]: '#4a3a2a',
    [ObjectType.CHAIR]: '#3a2a1a',
    [ObjectType.TV]: '#2a2a3a'
  };
  return colors[obj] || '#4a4a4a';
}

export function renderStaff(ctx: CanvasRenderingContext2D, staff: Staff[]): void {
  for (const s of staff) {
    renderStaffMember(ctx, s);
  }
}

export function renderStaffMember(ctx: CanvasRenderingContext2D, staff: Staff): void {
  const px = staff.pos.x * TILE_SIZE + TILE_SIZE / 2;
  const py = staff.pos.y * TILE_SIZE + TILE_SIZE / 2;
  const radius = TILE_SIZE / 3;
  
  ctx.beginPath();
  ctx.arc(px, py, radius, 0, Math.PI * 2);
  ctx.fillStyle = getStaffColor(staff.type);
  ctx.fill();
  
  // Border
  ctx.strokeStyle = '#ffffff';
  ctx.lineWidth = 2;
  ctx.stroke();
}

export function getStaffColor(type: StaffType): string {
  const colors: Record<StaffType, string> = {
    [StaffType.GUARD]: ENTITY_COLORS.guard,
    [StaffType.COOK]: ENTITY_COLORS.cook,
    [StaffType.JANITOR]: ENTITY_COLORS.janitor
  };
  return colors[type] || '#ffffff';
}

export function renderInmates(ctx: CanvasRenderingContext2D, inmates: Inmate[]): void {
  for (const inmate of inmates) {
    renderInmate(ctx, inmate);
  }
}

export function renderInmate(ctx: CanvasRenderingContext2D, inmate: Inmate): void {
  const px = inmate.pos.x * TILE_SIZE + TILE_SIZE / 2;
  const py = inmate.pos.y * TILE_SIZE + TILE_SIZE / 2;
  const radius = TILE_SIZE / 3;
  
  ctx.beginPath();
  ctx.arc(px, py, radius, 0, Math.PI * 2);
  ctx.fillStyle = ENTITY_COLORS.inmate;
  ctx.fill();
  
  // Border
  ctx.strokeStyle = '#000000';
  ctx.lineWidth = 2;
  ctx.stroke();
  
  // Frustration indicator (red glow when frustrated)
  if (inmate.frustration > inmate.tolerance) {
    ctx.beginPath();
    ctx.arc(px, py, radius + 3, 0, Math.PI * 2);
    ctx.strokeStyle = 'rgba(255, 0, 0, 0.6)';
    ctx.lineWidth = 2;
    ctx.stroke();
  }
}

export function renderSelection(
  ctx: CanvasRenderingContext2D, 
  x: number, 
  y: number, 
  valid: boolean
): void {
  const px = x * TILE_SIZE;
  const py = y * TILE_SIZE;
  
  ctx.strokeStyle = valid ? '#00ff00' : '#ff0000';
  ctx.lineWidth = 2;
  ctx.strokeRect(px + 1, py + 1, TILE_SIZE - 2, TILE_SIZE - 2);
}

export function renderBuildPreview(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  type: TileType
): void {
  const px = x * TILE_SIZE;
  const py = y * TILE_SIZE;
  
  ctx.fillStyle = getTileColor(type);
  ctx.globalAlpha = 0.5;
  ctx.fillRect(px, py, TILE_SIZE, TILE_SIZE);
  ctx.globalAlpha = 1.0;
  
  ctx.strokeStyle = '#ffff00';
  ctx.lineWidth = 2;
  ctx.strokeRect(px, py, TILE_SIZE, TILE_SIZE);
}

export function renderUI(
  ctx: CanvasRenderingContext2D,
  mouseX: number,
  mouseY: number,
  showPreview: boolean,
  previewType: TileType | null
): void {
  // Convert mouse to grid coords
  const gx = Math.floor(mouseX / TILE_SIZE);
  const gy = Math.floor(mouseY / TILE_SIZE);
  
  if (gx >= 0 && gx < GRID_WIDTH && gy >= 0 && gy < GRID_HEIGHT) {
    if (showPreview && previewType !== null) {
      renderBuildPreview(ctx, gx, gy, previewType);
    } else {
      renderSelection(ctx, gx, gy, true);
    }
  }
}

export function renderPausedOverlay(ctx: CanvasRenderingContext2D): void {
  ctx.fillStyle = 'rgba(0, 0, 0, 0.5)';
  ctx.fillRect(0, 0, GRID_WIDTH * TILE_SIZE, GRID_HEIGHT * TILE_SIZE);
  
  ctx.fillStyle = '#ffffff';
  ctx.font = 'bold 48px sans-serif';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText('PAUSED', (GRID_WIDTH * TILE_SIZE) / 2, (GRID_HEIGHT * TILE_SIZE) / 2);
}

export function renderGameOver(ctx: CanvasRenderingContext2D, day: number, inmates: number): void {
  ctx.fillStyle = 'rgba(0, 0, 0, 0.8)';
  ctx.fillRect(0, 0, GRID_WIDTH * TILE_SIZE, GRID_HEIGHT * TILE_SIZE);
  
  ctx.fillStyle = '#ff4444';
  ctx.font = 'bold 64px sans-serif';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText('GAME OVER', (GRID_WIDTH * TILE_SIZE) / 2, (GRID_HEIGHT * TILE_SIZE) / 2 - 40);
  
  ctx.fillStyle = '#ffffff';
  ctx.font = '24px sans-serif';
  ctx.fillText(`Survived ${day} days with ${inmates} inmates`, 
    (GRID_WIDTH * TILE_SIZE) / 2, 
    (GRID_HEIGHT * TILE_SIZE) / 2 + 30
  );
}
