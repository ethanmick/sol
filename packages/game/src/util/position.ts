import { z } from 'zod'

export const PositionSchema = z.object({
  x: z.number(),
  y: z.number(),
})

export type Position = z.infer<typeof PositionSchema>
