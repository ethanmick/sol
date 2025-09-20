import { z } from 'zod'
import { EllipticalOrbitSchema } from './elliptical-orbit.js'

/**
 * Schema for circular orbit parameters.
 * Uses simple circular motion with constant radius and angular velocity.
 */
export const CircularOrbitSchema = z.object({
  orbit_type: z.literal('circular'),
  parent_id: z.string(),
  average_radius_km: z.number(),
  km_per_sec: z.number(),
  current_angle_rad: z.number(),
})

export type CircularOrbit = z.infer<typeof CircularOrbitSchema>

/**
 * Discriminated union for all orbit types.
 * Use the orbit_type field to determine which type of orbit this is.
 */
export const OrbitSchema = z.discriminatedUnion('orbit_type', [
  CircularOrbitSchema,
  EllipticalOrbitSchema.extend({ orbit_type: z.literal('elliptical') }),
])

export type Orbit = z.infer<typeof OrbitSchema>
