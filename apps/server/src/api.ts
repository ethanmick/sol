import { zValidator } from '@hono/zod-validator'
import { Hono } from 'hono'
import { z } from 'zod'
import { gameState } from './game-state.js'
import { simulation } from './simulation.js'

// Create Hono app with typed routes
export const api = new Hono()
  // Get current game state
  .get('/api/game/state', (c) => {
    const currentState = gameState.getGameState()
    return c.json(currentState) // Type-safe response using GameStateSchema
  })

  // Ship departure endpoint
  .post(
    '/api/ship/depart',
    zValidator(
      'json',
      z.object({
        ship_id: z.string(),
        dest_node_id: z.string(),
      })
    ),
    (c) => {
      const { ship_id, dest_node_id } = c.req.valid('json')

      // Validate ship exists and is docked
      const ship = gameState.getShip(ship_id)
      if (!ship) {
        return c.json({ success: false, error: 'Ship not found' }, 404)
      }

      if (ship.mode !== 'Docked') {
        return c.json(
          { success: false, error: 'Ship must be docked to depart' },
          400
        )
      }

      // Validate destination exists
      const destNode = gameState.getNode(dest_node_id)
      if (!destNode) {
        return c.json(
          { success: false, error: 'Destination node not found' },
          404
        )
      }

      // Execute departure
      const success = gameState.departShip(ship_id, dest_node_id)
      if (!success) {
        return c.json({ success: false, error: 'Failed to depart ship' }, 500)
      }

      return c.json({ success: true })
    }
  )

  // Buy goods endpoint
  .post(
    '/api/ship/buy',
    zValidator(
      'json',
      z.object({
        ship_id: z.string(),
        units: z.number().int().positive(),
      })
    ),
    (c) => {
      const { ship_id, units } = c.req.valid('json')

      // Validate ship exists and is docked
      const ship = gameState.getShip(ship_id)
      if (!ship) {
        return c.json({ success: false, error: 'Ship not found' }, 404)
      }

      if (ship.mode !== 'Docked') {
        return c.json(
          { success: false, error: 'Ship must be docked to trade' },
          400
        )
      }

      // Execute purchase
      const success = gameState.buyGoods(ship_id, units)
      if (!success) {
        return c.json(
          {
            success: false,
            error: 'Failed to buy goods (insufficient credits or capacity)',
          },
          400
        )
      }

      return c.json({ success: true })
    }
  )

  // Sell goods endpoint
  .post(
    '/api/ship/sell',
    zValidator(
      'json',
      z.object({
        ship_id: z.string(),
        units: z.number().int().positive(),
      })
    ),
    (c) => {
      const { ship_id, units } = c.req.valid('json')

      // Validate ship exists and is docked
      const ship = gameState.getShip(ship_id)
      if (!ship) {
        return c.json({ success: false, error: 'Ship not found' }, 404)
      }

      if (ship.mode !== 'Docked') {
        return c.json(
          { success: false, error: 'Ship must be docked to trade' },
          400
        )
      }

      // Execute sale
      const success = gameState.sellGoods(ship_id, units)
      if (!success) {
        return c.json(
          {
            success: false,
            error: 'Failed to sell goods (insufficient cargo)',
          },
          400
        )
      }

      return c.json({ success: true })
    }
  )

  // Debug/admin endpoints
  .get('/api/debug/simulation/status', (c) => {
    return c.json({
      running: simulation.isRunning(),
      tick_rate: simulation.getTickRate(),
      current_time: Date.now(),
    })
  })

  .post('/api/debug/simulation/start', (c) => {
    simulation.start()
    return c.json({ success: true, message: 'Simulation started' })
  })

  .post('/api/debug/simulation/stop', (c) => {
    simulation.stop()
    return c.json({ success: true, message: 'Simulation stopped' })
  })

  .post('/api/debug/simulation/tick', (c) => {
    simulation.forceTick()
    return c.json({ success: true, message: 'Forced simulation tick' })
  })

// Export the app type for client consumption (as specified in v001.md)
export type ApiType = typeof api
