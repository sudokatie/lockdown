# Lockdown

A prison management simulator inspired by Prison Architect. Build and manage your own prison - keep inmates happy or face riots!

## Gameplay

You are the warden of a new prison. Your job is to:

- **Build facilities** - Construct cells, canteens, kitchens, showers, and yards
- **Hire staff** - Guards keep order, cooks prepare meals, janitors clean
- **Manage inmates** - Keep their needs met to prevent frustration and fights
- **Balance budget** - Earn money from inmate grants, pay staff wages and food costs
- **Audio cues** - Sound effects for events, alarms, and daily routines

## Controls

- **Left Click + Drag** - Build walls/floors in an area
- **Right Click** - Cancel current tool
- **Space/P** - Pause/unpause game
- **Escape** - Cancel current tool
- **1** - Select Wall
- **2** - Select Floor
- **3** - Select Door
- **4** - Select Fence
- **5** - Select Grass
- **6** - Cancel selection

## Building

### Tiles
- **Floor** ($10) - Basic walkable surface
- **Wall** ($50) - Blocks movement, creates rooms
- **Door** ($100) - Entry points for rooms
- **Grass** ($5) - Outdoor areas
- **Fence** ($25) - Outdoor barriers

### Objects
- **Bed** ($100) - Required for cells
- **Toilet** ($75) - Required for cells
- **Table** ($50) - Required for canteen
- **Bench** ($25) - Required for canteen
- **Cooker** ($300) - Required for kitchen
- **Fridge** ($200) - Required for kitchen
- **Sink** ($100) - Required for kitchen
- **Showerhead** ($150) - Required for shower
- **Drain** ($50) - Required for shower
- **TV** ($200) - Required for common room

## Zones

Create zones by enclosing areas with walls/doors and placing required objects:

- **Cell** - Bed + Toilet (2x3 minimum)
- **Canteen** - Table + Bench (4x4 minimum)
- **Kitchen** - Cooker + Fridge + Sink (3x3 minimum)
- **Shower** - Showerhead + Drain (3x3 minimum)
- **Yard** - Outdoor exercise area (5x5 minimum)
- **Common Room** - TV + Bench (4x4 minimum)

## Staff

- **Guard** ($100/day) - Patrols and responds to fights
- **Cook** ($75/day) - Prepares meals during meal times (7am, 12pm, 5pm)
- **Janitor** ($50/day) - Cleans facilities

## Economy

- **Income**: $50 per inmate per day
- **Expenses**: Staff wages + $5 food per inmate per day
- **Game Over**: Debt exceeds $10,000

## Inmate Needs

Inmates have needs that decay over time:
- **Food** - Satisfied by eating in canteen
- **Sleep** - Satisfied by sleeping in cell
- **Hygiene** - Satisfied by showering
- **Exercise** - Satisfied by time in yard
- **Freedom** - Satisfied by free time in common room

When needs get too low, inmates become frustrated. Two frustrated inmates near each other will fight!

## Tips

1. Start by building a basic cell block with a few cells
2. Hire a guard before admitting inmates
3. Build a kitchen and canteen before meal times
4. Keep at least one guard per 5-10 inmates
5. Balance expansion with your budget

## Development

```bash
# Install dependencies
npm install

# Run development server
npm run dev

# Run tests
npm test

# Build for production
npm run build
```

## Tech Stack

- Next.js 14
- TypeScript
- Tailwind CSS
- Jest for testing
- HTML5 Canvas for rendering

## Changelog

### v0.1.4
- Add: Drag-to-build for tiles (walls, floors, doors, etc.)
- Visual preview during tile drag

### v0.1.3
- Add: Keyboard shortcuts 1-6 for build tools
- Add: Right-click to cancel current tool

### v0.1.2
- Add: Inmate admission UI (Inmates tab in side panel)
- Add: Zone placement with drag-to-select UI
- Add: Visual preview while dragging zones

### v0.1.1
- Fix: Inmates now follow daily schedule (pathfind to zones, satisfy needs)
- Fix: Nearby frustrated inmates join existing fights
- Fix: Common room requires TV + seating per spec

### v0.1.0
- Initial release

## License

MIT
