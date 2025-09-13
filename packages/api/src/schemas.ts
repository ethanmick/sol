import { z } from 'zod'

export const GameObjectSchema = z.object({
  position: z.object({ x: z.number(), y: z.number() }),
})

export const WorldStateSchema = z.object({
  entities: z.array(GameObjectSchema),
})

// TypeScript types derived from entity schemas
export type GameObject = z.infer<typeof GameObjectSchema>
export type WorldState = z.infer<typeof WorldStateSchema>

// API Request/Response schemas for single-endpoint JSON API
export const ApiRequestSchema = z.discriminatedUnion('action', [
  // Get game state
  z.object({
    action: z.literal('get_game_state'),
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
