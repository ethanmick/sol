import { serve } from '@hono/node-server'
import { api } from './api.js'
import { Constants } from './game-state.js'
import { simulation } from './simulation.js'

// Use the API app (CORS is configured in api.ts)
const app = api

// Health check endpoint
app.get('/', (c) => {
  return c.json({
    name: 'Space Trading Game Server',
    version: '0.1.0',
    status: 'running',
    simulation: {
      running: simulation.isRunning(),
      tick_rate: Constants.TICK_RATE,
    },
    endpoints: {
      game_state: '/api/game/state',
      ship_depart: '/api/ship/depart',
      ship_buy: '/api/ship/buy',
      ship_sell: '/api/ship/sell',
      debug: '/api/debug/*',
    },
  })
})

// Start the simulation when server starts
simulation.start()

// Export app type for Hono RPC client usage
export type AppType = typeof app
export default app

// Start server
const port = process.env.PORT ? parseInt(process.env.PORT) : 3000

serve(
  {
    fetch: app.fetch,
    port,
  },
  (info) => {
    console.log(
      `🚀 Space Trading Game Server running on http://localhost:${info.port}`
    )
    console.log(`📊 Game state: /api/game/state`)
    console.log(`🔧 Debug: /api/debug/simulation/status`)
    console.log(`⚡ Simulation: ${Constants.TICK_RATE} Hz tick rate`)
  }
)
