import { z } from 'zod'
import { GameObjectSchema } from './game-object.js'
import { MoonSchema } from './moon.js'
import { OrbitSchema } from './orbit.js'

export const PlanetSchema = GameObjectSchema.extend({
  radius_km: z.number(),
  orbit: OrbitSchema,
  moons: z.array(MoonSchema).default([]),
})

export type Planet = z.infer<typeof PlanetSchema>
