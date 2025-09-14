import { z } from 'zod'
import { GameObjectSchema } from './game-object.js'

export const PlanetSchema = GameObjectSchema.extend({
  type: z.literal('planet'),
})

export type Planet = z.infer<typeof PlanetSchema>
