import { serve } from '@hono/node-server'
import { zValidator } from '@hono/zod-validator'
import {
  rpc,
  type ApiResponse,
  type Method,
  type Req,
  type Res,
} from '@space/api'
import { Hono } from 'hono'
import { cors } from 'hono/cors'
import { z } from 'zod'
import { Simulation } from './game/simulation.js'
import { WorldState } from './game/world-state.js'
import { createShipFlyToHandler } from './handlers/index.js'
import { setup } from './v001/sol.js'

const state = setup(new WorldState())
const simulation = new Simulation(state)
simulation.start()

const rpcHandler = async <M extends Method>(
  method: M,
  input: Req<M>
): Promise<Res<M>> => {
  switch (method) {
    case 'get_game_state':
      return state as Res<M>
    case 'ship_fly_to': {
      const handler = createShipFlyToHandler(state)
      const response = await handler(input as Req<'ship_fly_to'>)
      if (!response.success) {
        throw new Error(response.error)
      }
      return response.data as Res<M>
    }
    default:
      throw new Error(`Unknown method: ${method}`)
  }
}

export const api = new Hono()

api.use(
  '*',
  cors({
    origin: '*',
    allowMethods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowHeaders: ['Content-Type', 'Authorization'],
  })
)

// Create RPC endpoint schema
const RpcRequestSchema = z.object({
  method: z.enum(Object.keys(rpc) as [Method, ...Method[]]),
  params: z.any(), // Will be validated per-method
})

api.post('/rpc', zValidator('json', RpcRequestSchema), async (c) => {
  const { method, params } = c.req.valid('json')

  try {
    const methodSchema = rpc[method]
    const validatedParams = methodSchema.req.parse(params)

    console.log('handling RPC:', method, validatedParams)

    // Execute the RPC handler
    const result = await rpcHandler(method, validatedParams)

    // Validate response
    const validatedResult = methodSchema.res.parse(result)

    const response: ApiResponse<any> = {
      success: true,
      data: validatedResult,
    }
    return c.json(response)
  } catch (error) {
    console.error('RPC error:', error)
    const errorMessage =
      error instanceof Error ? error.message : 'Internal server error'
    const errorResponse: ApiResponse<any> = {
      success: false,
      error: errorMessage,
      code: 500,
    }
    return c.json(errorResponse, 500)
  }
})

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
