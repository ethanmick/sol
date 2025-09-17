import { z } from 'zod'

export const OrbitSchema = z.object({
  parentId: z.string(),
  averageRadiusKm: z.number(),
  speedKmPerSec: z.number(),
  currentAngleRad: z.number(),
})

export type Orbit = z.infer<typeof OrbitSchema>
