# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Structure

This is a pnpm monorepo workspace with the following structure:
- `apps/www/` - React + TypeScript + Vite application
- Uses pnpm workspaces defined in `pnpm-workspace.yaml`
- Package manager: pnpm@10.11.0

## Development Commands

All commands should be run from the workspace root or the specific app directory.

### From workspace root:
```bash
cd apps/www && pnpm dev          # Start development server
cd apps/www && pnpm build       # Build for production
cd apps/www && pnpm lint        # Run ESLint
cd apps/www && pnpm preview     # Preview production build
```

### From apps/www directory:
```bash
pnpm dev          # Start development server (Vite)
pnpm build        # TypeScript compile + Vite build
pnpm lint         # Run ESLint
pnpm preview      # Preview production build
```

## Tech Stack

The `www` app uses:
- **React 19** with TypeScript
- **Vite** for build tooling and dev server
- **ESLint** for linting
- Standard React + Vite project structure in `apps/www/src/`

## Key Configuration Files

- `pnpm-workspace.yaml` - Workspace configuration
- `apps/www/vite.config.ts` - Vite configuration
- `apps/www/tsconfig.json` - TypeScript project references
- `apps/www/tsconfig.app.json` - App-specific TypeScript config
- `apps/www/eslint.config.js` - ESLint configuration