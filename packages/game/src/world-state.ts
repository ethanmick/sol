import { z } from 'zod'
import { GameObjectSchema } from './game/game-object.js'

export const WorldStateSchema = z.object({
  entities: z.array(GameObjectSchema),
})

export type WorldState = z.infer<typeof WorldStateSchema>
