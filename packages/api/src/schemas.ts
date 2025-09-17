import { WorldStateSchema } from '@space/game'
import { z } from 'zod'

export { WorldStateSchema }

// API Request/Response schemas for single-endpoint JSON API
export const ApiRequestSchema = z.discriminatedUnion('action', [
  z.object({
    action: z.literal('get_game_state'),
  }),
  z.object({
    action: z.literal('ship_fly_to'),
    ship_id: z.string(),
    target_id: z.string(),
  }),
])

// API Response schemas
export const ApiResponseSchema = z.discriminatedUnion('success', [
  z.object({
    success: z.literal(true),
    data: WorldStateSchema,
  }),

  // Error responses
  z.object({
    success: z.literal(false),
    error: z.string(),
    code: z.number().optional(), // HTTP status code
  }),
])

// TypeScript types derived from API schemas
export type ApiRequest = z.infer<typeof ApiRequestSchema>
export type ApiResponse = z.infer<typeof ApiResponseSchema>
