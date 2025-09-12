/* eslint-disable react-refresh/only-export-components */
import type { GameState } from '@space/api'
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
  gameState: GameState | null
  loading: boolean
  error: string | null

  // API methods
  getGameState: () => Promise<void>
  shipDepart: (shipId: string, destNodeId: string) => Promise<void>
  shipBuy: (shipId: string, units: number) => Promise<void>
  shipSell: (shipId: string, units: number) => Promise<void>

  // Debug methods
  getSimulationStatus: () => Promise<{
    running: boolean
    tick_rate: number
    current_time: number
  } | null>
  startSimulation: () => Promise<void>
  stopSimulation: () => Promise<void>
  tickSimulation: () => Promise<void>
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
  const [gameState, setGameState] = useState<GameState | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const getGameState = useCallback(async () => {
    try {
      setLoading(true)
      setError(null)
      const state = await apiClient.getGameState()
      setGameState(state)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error')
    } finally {
      setLoading(false)
    }
  }, [])

  const shipDepart = useCallback(
    async (shipId: string, destNodeId: string) => {
      try {
        setError(null)
        await apiClient.shipDepart(shipId, destNodeId)
        // Refresh game state after action
        await getGameState()
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Unknown error')
      }
    },
    [getGameState]
  )

  const shipBuy = useCallback(
    async (shipId: string, units: number) => {
      try {
        setError(null)
        await apiClient.shipBuy(shipId, units)
        // Refresh game state after action
        await getGameState()
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Unknown error')
      }
    },
    [getGameState]
  )

  const shipSell = useCallback(
    async (shipId: string, units: number) => {
      try {
        setError(null)
        await apiClient.shipSell(shipId, units)
        // Refresh game state after action
        await getGameState()
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Unknown error')
      }
    },
    [getGameState]
  )

  const getSimulationStatus = useCallback(async () => {
    try {
      setError(null)
      return await apiClient.getSimulationStatus()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error')
      return null
    }
  }, [])

  const startSimulation = useCallback(async () => {
    try {
      setError(null)
      await apiClient.startSimulation()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error')
    }
  }, [])

  const stopSimulation = useCallback(async () => {
    try {
      setError(null)
      await apiClient.stopSimulation()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error')
    }
  }, [])

  const tickSimulation = useCallback(async () => {
    try {
      setError(null)
      await apiClient.tickSimulation()
      // Refresh game state after manual tick
      await getGameState()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error')
    }
  }, [getGameState])

  // Polling effect
  useEffect(() => {
    // Initial fetch
    getGameState()

    // Set up polling interval
    const interval = setInterval(() => {
      if (!loading) {
        getGameState()
      }
    }, pollInterval)

    return () => clearInterval(interval)
  }, [pollInterval]) // Remove getGameState and loading from dependencies

  const contextValue: GameContextValue = {
    gameState,
    loading,
    error,
    getGameState,
    shipDepart,
    shipBuy,
    shipSell,
    getSimulationStatus,
    startSimulation,
    stopSimulation,
    tickSimulation,
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

// Convenience hooks for specific data
export function useGameState() {
  const { gameState, loading, error } = useGame()
  return { gameState, loading, error }
}

export function useShips() {
  const { gameState } = useGame()
  return gameState?.ships ?? []
}

export function useNodes() {
  const { gameState } = useGame()
  return gameState?.nodes ?? []
}

export function usePlayers() {
  const { gameState } = useGame()
  return gameState?.players ?? []
}

export function useCorporations() {
  const { gameState } = useGame()
  return gameState?.corporations ?? []
}

export function useShip(shipId: string) {
  const ships = useShips()
  return ships.find((ship) => ship.id === shipId) ?? null
}

export function useNode(nodeId: string) {
  const nodes = useNodes()
  return nodes.find((node) => node.id === nodeId) ?? null
}
