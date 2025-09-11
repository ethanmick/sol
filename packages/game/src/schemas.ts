import { z } from 'zod'

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

// TypeScript types derived from schemas
export type Player = z.infer<typeof PlayerSchema>
export type Corporation = z.infer<typeof CorporationSchema>
export type Ship = z.infer<typeof ShipSchema>
export type Node = z.infer<typeof NodeSchema>
export type GameState = z.infer<typeof GameStateSchema>
