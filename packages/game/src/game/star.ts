import { z } from 'zod'
import { GameObjectSchema } from './game-object.js'

export const StarSchema = GameObjectSchema.extend({
  type: z.literal('star'),
})

export type Star = z.infer<typeof StarSchema>
