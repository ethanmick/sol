import { z } from 'zod'
import { GameObjectSchema } from './game-object.js'

export const StarSchema = GameObjectSchema.extend({})

export type Star = z.infer<typeof StarSchema>
