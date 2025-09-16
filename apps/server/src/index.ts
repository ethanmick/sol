import { serve } from '@hono/node-server'
import { zValidator } from '@hono/zod-validator'
import { ApiRequestSchema, type ApiRequest, type ApiResponse } from '@space/api'
import { Hono } from 'hono'
import { cors } from 'hono/cors'
import { Simulation } from './game/simulation.js'
import { WorldState } from './game/world-state.js'
import { Ship } from './game/entities/ship.js'
import { setup } from './v001/sol.js'

const state = setup(new WorldState())
const simulation = new Simulation(state)
simulation.start()

export const api = new Hono()

api.use(
  '*',
  cors({
    origin: '*',
    allowMethods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowHeaders: ['Content-Type', 'Authorization'],
  })
)

api.post('/api', zValidator('json', ApiRequestSchema as any), async (c) => {
  const request = c.req.valid('json')

  try {
    const response: ApiResponse = await handle(request)
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
})

async function handle(request: ApiRequest): Promise<ApiResponse> {
  console.log('handling request', request.action)
  switch (request.action) {
    case 'get_game_state': {
      return {
        success: true,
        data: state,
      }
    }

    case 'ship_fly_to': {
      const ship = state.entities.find(
        (entity): entity is Ship => entity instanceof Ship && entity.id === request.ship_id
      )

      if (!ship) {
        return {
          success: false,
          error: 'Ship not found',
          code: 404,
        }
      }

      const destination = state.entities.find((entity) => entity.id === request.target_id)

      if (!destination) {
        return {
          success: false,
          error: 'Destination not found',
          code: 404,
        }
      }

      if (destination === ship) {
        return {
          success: false,
          error: 'Cannot fly to self',
          code: 400,
        }
      }

      ship.flyTo(destination)

      return {
        success: true,
        data: state,
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

api.get('/healthz', (c) => {
  return c.text('ok')
})

const port = process.env.PORT ? parseInt(process.env.PORT) : 3000

serve(
  {
    fetch: api.fetch,
    port,
  },
  (info) => {
    console.log(`Game Server running on http://localhost:${info.port}`)
  }
)
