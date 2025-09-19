import { z } from 'zod'

export const OrbitSchema = z.object({
  parent_id: z.string(),
  average_radius_km: z.number(),
  km_per_sec: z.number(),
  current_angle_rad: z.number(),
})

export type Orbit = z.infer<typeof OrbitSchema>
