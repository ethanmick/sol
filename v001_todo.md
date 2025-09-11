# Implementation Roadmap

## Phase 1: Shared Package Foundation (`packages/game/`)

- [x] Create shared package with Zod schemas
- [x] Define Player, Corporation, Ship, Node schemas
- [x] Export TypeScript types from schemas
- [x] Set up proper package.json and exports

## Phase 2: Server Foundation (`apps/server/`)

- [x] Hono server with TypeScript setup (`apps/server`)
- [x] Import shared schemas from packages/game
- [x] In-memory game state management
- [x] Basic orbital mechanics implementation
- [x] Ship movement simulation
- [x] Tick-based simulation loop (5 Hz)
- [x] Hono RPC API endpoints with zValidator
- [x] Export AppType for client consumption

## Phase 3: Client Frontend (`apps/www/`)

- [ ] Install Hono client dependencies
- [ ] Configure pnpm workspace imports from server
- [ ] Type-safe API service using Hono RPC client
- [ ] React components for game view
- [ ] Canvas/SVG rendering of space
- [ ] Polling service (fetch every 1s) with full type safety
- [ ] Ship control UI
- [ ] Trading interface

## Phase 4: Game Mechanics

- [ ] Price fluctuation system (30s intervals)
- [ ] Multi-player interactions (visible arrivals/departures)
- [ ] Persistence layer (snapshots + WAL)
- [ ] Error handling and reconnection logic

## Phase 5: Polish & Optimization

- [ ] Client-side interpolation for smooth movement
- [ ] Performance optimization for tick loop
- [ ] Background persistence tuning
- [ ] Testing and debugging tools
