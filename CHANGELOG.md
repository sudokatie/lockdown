# Changelog

## v0.1.0 (2026-02-03)

Initial release of Lockdown - a prison management simulator.

### Features

- **Grid System** - 40x30 tile-based map with multiple tile types
- **Zone System** - Create designated areas with required objects
- **Schedule System** - 24-hour day cycle with activity blocks
- **Inmate System** - Needs-based AI with frustration mechanics
- **Staff System** - Guards, cooks, and janitors with role-based behavior
- **Security System** - Fight detection and resolution
- **Economy System** - Income from inmates, expenses for staff and food
- **Canvas Renderer** - Real-time 2D rendering of prison
- **React UI** - Status bar, side panel with tabs, message log

### Building

- 6 tile types: Floor, Wall, Door, Grass, Fence, Empty
- 13 object types including beds, toilets, tables, cookers
- 7 zone types: Cell, Canteen, Kitchen, Shower, Yard, Common, Office

### Staff

- Guards patrol and respond to security events
- Cooks work in kitchen during meal times (7am, 12pm, 5pm)
- Janitors for facility maintenance (basic implementation)

### Inmates

- 5 needs: Food, Sleep, Hygiene, Exercise, Freedom
- Frustration builds when needs are unmet
- Fights trigger when frustrated inmates are nearby
- Lockdown state for punishment after fights

### Known Limitations

- Zone placement requires manual setup (no drag-to-select UI)
- No save/load functionality
- Basic janitor behavior (cleaning not implemented)
- No contraband or search mechanics
- Single security level only

### Technical

- 322 tests passing
- TypeScript strict mode
- Next.js 14 with App Router
- Tailwind CSS for styling
