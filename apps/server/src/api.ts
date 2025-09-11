import { zValidator } from '@hono/zod-validator'
import { ApiRequestSchema, type ApiRequest, type ApiResponse } from '@space/api'
import { Hono } from 'hono'
import { gameState } from './game-state.js'
import { simulation } from './simulation.js'

// Create Hono app with single JSON API endpoint
export const api = new Hono().post(
  '/api',
  zValidator('json', ApiRequestSchema),
  async (c) => {
    const request = c.req.valid('json')

    try {
      const response: ApiResponse = await handleApiRequest(request)

      // Set appropriate HTTP status code for errors
      if (!response.success && response.code) {
        return c.json(response, response.code as any)
      }

      return c.json(response)
    } catch (error) {
      console.error('API error:', error)
      const errorResponse: ApiResponse = {
        success: false,
        error: 'Internal server error',
        code: 500,
      }
      return c.json(errorResponse, 500)
    }
  }
)

async function handleApiRequest(request: ApiRequest): Promise<ApiResponse> {
  switch (request.action) {
    case 'get_game_state': {
      const currentState = gameState.getGameState()
      return {
        success: true,
        data: currentState,
      }
    }

    case 'ship_depart': {
      const { ship_id, dest_node_id } = request

      // Validate ship exists and is docked
      const ship = gameState.getShip(ship_id)
      if (!ship) {
        return {
          success: false,
          error: 'Ship not found',
          code: 404,
        }
      }

      if (ship.mode !== 'Docked') {
        return {
          success: false,
          error: 'Ship must be docked to depart',
          code: 400,
        }
      }

      // Validate destination exists
      const destNode = gameState.getNode(dest_node_id)
      if (!destNode) {
        return {
          success: false,
          error: 'Destination node not found',
          code: 404,
        }
      }

      // Execute departure
      const success = gameState.departShip(ship_id, dest_node_id)
      if (!success) {
        return {
          success: false,
          error: 'Failed to depart ship',
          code: 500,
        }
      }

      return {
        success: true,
        data: { message: 'Ship departed successfully' },
      }
    }

    case 'ship_buy': {
      const { ship_id, units } = request

      // Validate ship exists and is docked
      const ship = gameState.getShip(ship_id)
      if (!ship) {
        return {
          success: false,
          error: 'Ship not found',
          code: 404,
        }
      }

      if (ship.mode !== 'Docked') {
        return {
          success: false,
          error: 'Ship must be docked to trade',
          code: 400,
        }
      }

      // Execute purchase
      const success = gameState.buyGoods(ship_id, units)
      if (!success) {
        return {
          success: false,
          error: 'Failed to buy goods (insufficient credits or capacity)',
          code: 400,
        }
      }

      return {
        success: true,
        data: { message: 'Goods purchased successfully' },
      }
    }

    case 'ship_sell': {
      const { ship_id, units } = request

      // Validate ship exists and is docked
      const ship = gameState.getShip(ship_id)
      if (!ship) {
        return {
          success: false,
          error: 'Ship not found',
          code: 404,
        }
      }

      if (ship.mode !== 'Docked') {
        return {
          success: false,
          error: 'Ship must be docked to trade',
          code: 400,
        }
      }

      // Execute sale
      const success = gameState.sellGoods(ship_id, units)
      if (!success) {
        return {
          success: false,
          error: 'Failed to sell goods (insufficient cargo)',
          code: 400,
        }
      }

      return {
        success: true,
        data: { message: 'Goods sold successfully' },
      }
    }

    case 'debug_simulation_status': {
      return {
        success: true,
        data: {
          running: simulation.isRunning(),
          tick_rate: simulation.getTickRate(),
          current_time: Date.now(),
        },
      }
    }

    case 'debug_simulation_start': {
      simulation.start()
      return {
        success: true,
        data: { message: 'Simulation started' },
      }
    }

    case 'debug_simulation_stop': {
      simulation.stop()
      return {
        success: true,
        data: { message: 'Simulation stopped' },
      }
    }

    case 'debug_simulation_tick': {
      simulation.forceTick()
      return {
        success: true,
        data: { message: 'Forced simulation tick' },
      }
    }

    default:
      return {
        success: false,
        error: 'Unknown action',
        code: 400,
      }
  }
}

// Export the app type for client consumption
export type ApiType = typeof api
