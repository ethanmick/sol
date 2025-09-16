import { z } from 'zod'
import { GameObjectSchema } from './game-object.js'

export const ShipSchema = GameObjectSchema.extend({
  type: z.literal('ship'),
  id: z.string(),
})

export type Ship = z.infer<typeof ShipSchema>
