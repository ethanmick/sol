import { z } from 'zod'
import { PositionSchema } from '../util/position.js'
import { GameObjectSchema } from './game-object.js'

export const ShipSchema = GameObjectSchema.extend({
  status: z.union([z.literal('docked'), z.literal('flying')]),
  docked_to: z.string().nullable(),
  destination_id: z.string().nullable(),
  start_position: PositionSchema.nullable(),
})

export type Ship = z.infer<typeof ShipSchema>
