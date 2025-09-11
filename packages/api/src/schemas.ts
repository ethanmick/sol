import { z } from 'zod'

// Entity schemas (copied from @game/schemas)
export const PlayerSchema = z.object({
  id: z.string(),
  username: z.string(),
})

export const CorporationSchema = z.object({
  id: z.string(),
  player_id: z.string(),
  credits: z.number(),
})

export const ShipSchema = z.object({
  id: z.string(),
  player_id: z.string(),
  corp_id: z.string(),
  mode: z.enum(['Docked', 'Flight']),
  pos: z.object({ x: z.number(), y: z.number() }),
  cargo_units: z.number(),
})

export const NodeSchema = z.object({
  id: z.string(),
  name: z.string(),
  pos: z.object({ x: z.number(), y: z.number() }),
  price: z.number(),
})

export const GameStateSchema = z.object({
  server_time: z.number(),
  tick_rate: z.number(),
  players: z.array(PlayerSchema),
  corporations: z.array(CorporationSchema),
  ships: z.array(ShipSchema),
  nodes: z.array(NodeSchema),
})

// TypeScript types derived from entity schemas
export type Player = z.infer<typeof PlayerSchema>
export type Corporation = z.infer<typeof CorporationSchema>
export type Ship = z.infer<typeof ShipSchema>
export type Node = z.infer<typeof NodeSchema>
export type GameState = z.infer<typeof GameStateSchema>

// API Request/Response schemas for single-endpoint JSON API
export const ApiRequestSchema = z.discriminatedUnion('action', [
  // Get game state
  z.object({
    action: z.literal('get_game_state'),
  }),
  
  // Ship departure
  z.object({
    action: z.literal('ship_depart'),
    ship_id: z.string(),
    dest_node_id: z.string(),
  }),
  
  // Buy goods
  z.object({
    action: z.literal('ship_buy'),
    ship_id: z.string(),
    units: z.number().int().positive(),
  }),
  
  // Sell goods
  z.object({
    action: z.literal('ship_sell'),
    ship_id: z.string(),
    units: z.number().int().positive(),
  }),
  
  // Debug endpoints
  z.object({
    action: z.literal('debug_simulation_status'),
  }),
  
  z.object({
    action: z.literal('debug_simulation_start'),
  }),
  
  z.object({
    action: z.literal('debug_simulation_stop'),
  }),
  
  z.object({
    action: z.literal('debug_simulation_tick'),
  }),
])

// API Response schemas
export const ApiResponseSchema = z.discriminatedUnion('success', [
  // Success responses
  z.object({
    success: z.literal(true),
    data: z.union([
      GameStateSchema, // for get_game_state
      z.object({ message: z.string() }), // for simple success messages
      z.object({ // for simulation status
        running: z.boolean(),
        tick_rate: z.number(),
        current_time: z.number(),
      }),
    ]),
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