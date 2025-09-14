import { zValidator } from '@hono/zod-validator'
import { ApiRequestSchema, type ApiRequest, type ApiResponse } from '@space/api'
import { Hono } from 'hono'
import { cors } from 'hono/cors'

import { Simulation } from './game/simulation.js'
import { WorldState } from './game/world-state.js'
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
