import { z } from 'zod'
import { PlanetSchema } from './game/planet.js'
import { ShipSchema } from './game/ship.js'
import { StarSchema } from './game/star.js'

export const WorldStateSchema = z.object({
  stars: z.record(z.string(), StarSchema),
  planets: z.record(z.string(), PlanetSchema),
  ships: z.record(z.string(), ShipSchema),
})

export type WorldState = z.infer<typeof WorldStateSchema>
