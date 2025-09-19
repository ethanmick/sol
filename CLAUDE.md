# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Structure

This is a pnpm monorepo workspace with the following structure:
- `apps/www/` - React + TypeScript + Vite client application
- `apps/server/` - Hono + TypeScript server application
- `packages/api/` - Shared API types and schemas (Zod + TypeScript)
- `packages/game/` - Core game logic and world state schemas
- Uses pnpm workspaces defined in `pnpm-workspace.yaml`
- Package manager: pnpm@10.11.0

## Development Commands

All commands should be run from the workspace root or the specific app directory.

### From workspace root:
```bash
# Client (www)
cd apps/www && pnpm dev          # Start development server
cd apps/www && pnpm build       # Build for production
cd apps/www && pnpm lint        # Run ESLint
cd apps/www && pnpm typecheck   # TypeScript type checking
cd apps/www && pnpm preview     # Preview production build

# Server
cd apps/server && pnpm dev      # Start server in development mode
cd apps/server && pnpm build    # Build server for production
cd apps/server && pnpm typecheck # TypeScript type checking
cd apps/server && pnpm start    # Start production server

# Packages (shared types and game logic)
pnpm build                       # Builds all packages including @space/api and @space/game
pnpm typecheck                   # TypeScript type checking for all packages
```

### From specific directories:
```bash
# From apps/www/
pnpm dev          # Start development server (Vite)
pnpm build        # TypeScript compile + Vite build
pnpm lint         # Run ESLint
pnpm typecheck    # TypeScript type checking
pnpm preview      # Preview production build

# From apps/server/
pnpm dev          # Start server with tsx watch
pnpm build        # TypeScript compile
pnpm typecheck    # TypeScript type checking
pnpm start        # Start compiled server
```

## Tech Stack

### Client (`apps/www/`)
- **React 19** with TypeScript
- **Vite** for build tooling and dev server
- **ESLint** for linting
- **PIXI.js** for 2D graphics rendering
- **@space/api** for shared API types

### Server (`apps/server/`)
- **Hono** web framework with TypeScript
- **tsx** for development with hot reload
- **@space/api** for shared API types
- **Zod** for runtime validation (via shared API package)

### Shared API (`packages/api/`)
- **Zod** schemas for runtime validation
- **TypeScript** types generated from Zod schemas
- RPC-style API with type-safe method definitions

### Game Package (`packages/game/`)
- **Zod** schemas for game entities (Ships, Planets, Stars)
- **WorldState** schema and type definitions
- Core game logic and data structures

## API Architecture

The project uses a **RPC-style JSON API** architecture:

### Server Endpoint
- **URL**: `POST /rpc`
- **Content-Type**: `application/json`
- **Validation**: Automatic via Zod schemas

### Request Format
All requests use RPC format with method and params:
```json
{ "method": "get_game_state", "params": {} }
{ "method": "ship_fly_to", "params": { "ship_id": "ship-1", "target_id": "node-2" } }
```

### Response Format
All responses follow success/error pattern:
```json
// Success
{ "success": true, "data": { ... } }

// Error  
{ "success": false, "error": "Error message", "code": 404 }
```

### Type Safety
- **RPC definitions** in `packages/api/src/schemas.ts` with method schemas
- **Client & server** import same types from `@space/api`
- **Runtime validation** with Zod on server
- **Compile-time safety** with TypeScript for method parameters and return types

### Client Usage
```typescript
import { apiClient } from './api-client'
const gameState = await apiClient.getGameState()
await apiClient.shipFlyTo('ship-1', 'node-2')
```

## Key Configuration Files

- `pnpm-workspace.yaml` - Workspace configuration
- `packages/api/tsconfig.json` - Shared API types configuration
- `packages/game/tsconfig.json` - Game logic types configuration
- `apps/www/vite.config.ts` - Vite configuration
- `apps/www/tsconfig.json` - Client TypeScript config
- `apps/server/tsconfig.json` - Server TypeScript config
- `apps/www/eslint.config.js` - ESLint configuration

## Development Workflow

1. **Game Types**: Game entities and world state defined in `packages/game/src/`
2. **API Types**: RPC method definitions in `packages/api/src/schemas.ts`
3. **Server**: RPC handlers in `apps/server/src/handlers/` and routing in `apps/server/src/index.ts`
4. **Client**: Use typed client methods from `apps/www/src/api-client.ts`
5. **Build Order**: Game and API packages must be built before server/client