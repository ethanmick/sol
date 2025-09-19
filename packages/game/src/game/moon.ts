import { z } from 'zod'
import { GameObjectSchema } from './game-object.js'
import { OrbitSchema } from './orbit.js'

export const MoonSchema = GameObjectSchema.extend({
  radius_km: z.number(),
  orbit: OrbitSchema,
})

export type Moon = z.infer<typeof MoonSchema>
