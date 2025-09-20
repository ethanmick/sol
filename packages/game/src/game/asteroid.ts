import { z } from 'zod'
import { GameObjectSchema } from './game-object.js'
import { OrbitSchema } from './orbit.js'

export const AsteroidSchema = GameObjectSchema.extend({
  radius_km: z.number(),
  orbit: OrbitSchema,
})

export type Asteroid = z.infer<typeof AsteroidSchema>