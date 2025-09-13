import { serve } from '@hono/node-server'
import { api } from './api.js'

api.get('/healthz', (c) => {
  return c.text('ok')
})

export type AppType = typeof api
export default api

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
