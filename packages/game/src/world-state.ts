import { z } from 'zod'
import { PlanetSchema } from './game/planet.js'
import { ShipSchema } from './game/ship.js'
import { StarSchema } from './game/star.js'

export const WorldEntitySchema = z.union([StarSchema, PlanetSchema, ShipSchema])

export const WorldStateSchema = z.object({
  entities: z.array(WorldEntitySchema),
})

export type WorldEntity = z.infer<typeof WorldEntitySchema>
export type WorldState = z.infer<typeof WorldStateSchema>
