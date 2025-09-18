import { z } from 'zod'
import { GameObjectSchema } from './game-object.js'
import { OrbitSchema } from './orbit.js'

export const PlanetSchema = GameObjectSchema.extend({
  radiusKm: z.number(),
  orbit: OrbitSchema,
})

export type Planet = z.infer<typeof PlanetSchema>
