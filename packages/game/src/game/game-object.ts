import { z } from 'zod'
import { PositionSchema } from '../util/position.js'

export const GameObjectSchema = z.object({
  id: z.string(),
  name: z.string(),
  position: PositionSchema,
})

export type GameObject = z.infer<typeof GameObjectSchema>
