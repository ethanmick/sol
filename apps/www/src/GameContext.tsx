/* eslint-disable react-refresh/only-export-components */
import type { WorldState } from '@space/game'
import {
  createContext,
  type ReactNode,
  useCallback,
  useContext,
  useEffect,
  useState,
} from 'react'
import { apiClient } from './api-client'

interface GameContextValue {
  state: WorldState | null
  getGameState: () => Promise<void>
}

const GameContext = createContext<GameContextValue | null>(null)

interface GameProviderProps {
  children: ReactNode
  pollInterval?: number // milliseconds
}

export function GameProvider({
  children,
  pollInterval = 1000,
}: GameProviderProps) {
  const [world, setWorld] = useState<WorldState | null>(null)

  const getGameState = useCallback(async () => {
    try {
      const state = await apiClient.getGameState()
      setWorld(state)
    } catch (err) {
      console.error(err)
    }
  }, [])

  useEffect(() => {
    const interval = setInterval(() => {
      getGameState()
    }, pollInterval)

    return () => clearInterval(interval)
  }, [pollInterval, getGameState])

  const contextValue: GameContextValue = {
    state: world,
    getGameState,
  }

  return (
    <GameContext.Provider value={contextValue}>{children}</GameContext.Provider>
  )
}

export function useGame(): GameContextValue {
  const context = useContext(GameContext)
  if (!context) {
    throw new Error('useGame must be used within a GameProvider')
  }
  return context
}

export function useGameState() {
  const { state: gameState } = useGame()
  return { gameState }
}
