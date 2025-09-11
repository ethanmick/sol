# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Structure

This is a pnpm monorepo workspace with the following structure:
- `apps/www/` - React + TypeScript + Vite client application
- `apps/server/` - Hono + TypeScript server application
- `packages/api/` - Shared API types and schemas (Zod + TypeScript)
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
cd apps/www && pnpm preview     # Preview production build

# Server
cd apps/server && pnpm dev      # Start server in development mode
cd apps/server && pnpm build    # Build server for production
cd apps/server && pnpm start    # Start production server

# API Package (shared types)
pnpm build                       # Builds all packages including @space/api
```

### From specific directories:
```bash
# From apps/www/
pnpm dev          # Start development server (Vite)
pnpm build        # TypeScript compile + Vite build
pnpm lint         # Run ESLint
pnpm preview      # Preview production build

# From apps/server/
pnpm dev          # Start server with tsx watch
pnpm build        # TypeScript compile
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
- Discriminated union types for type-safe API requests/responses

## API Architecture

The project uses a **single-endpoint JSON API** architecture:

### Server Endpoint
- **URL**: `POST /api`
- **Content-Type**: `application/json`
- **Validation**: Automatic via Zod schemas

### Request Format
All requests use discriminated union based on `action` field:
```json
{ "action": "get_game_state" }
{ "action": "ship_depart", "ship_id": "ship-1", "dest_node_id": "node-2" }
{ "action": "ship_buy", "ship_id": "ship-1", "units": 10 }
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
- **Shared schemas** in `packages/api/src/schemas.ts`
- **Client & server** import same types from `@space/api`
- **Runtime validation** with Zod on server
- **Compile-time safety** with TypeScript discriminated unions

### Client Usage
```typescript
import { apiClient } from './api-client'
const gameState = await apiClient.getGameState()
await apiClient.shipDepart('ship-1', 'node-2')
```

## Key Configuration Files

- `pnpm-workspace.yaml` - Workspace configuration
- `packages/api/tsconfig.json` - Shared API types configuration
- `apps/www/vite.config.ts` - Vite configuration
- `apps/www/tsconfig.json` - Client TypeScript config
- `apps/server/tsconfig.json` - Server TypeScript config
- `apps/www/eslint.config.js` - ESLint configuration

## Development Workflow

1. **Shared Types**: All API changes start in `packages/api/src/schemas.ts`
2. **Server**: Update handler in `apps/server/src/api.ts` 
3. **Client**: Use typed client methods from `apps/www/src/api-client.ts`
4. **Build Order**: API package must be built before server/client