import { z } from 'zod'

/**
 * Schema for elliptical orbit parameters using Keplerian orbital elements.
 * All angles are in radians, distances in kilometers, and time in seconds.
 * Note: orbit_type field is added when used in the discriminated union.
 */
export const EllipticalOrbitSchema = z.object({
  // The ID of the parent body (e.g., star or planet) that this object orbits
  parent_id: z.string(),

  // Semi-major axis: half the longest diameter of the ellipse (in km)
  // For reference: Earth's semi-major axis is ~149,597,870 km (1 AU)
  semi_major_axis_km: z.number().positive(),

  // Eccentricity: shape of the ellipse
  // 0 = perfect circle, 0-1 = ellipse, 1 = parabola, >1 = hyperbola
  // Most planets have e < 0.1, comets can have e > 0.9
  eccentricity: z.number().min(0).max(0.99),

  // Argument of periapsis: angle from reference direction to periapsis (closest point)
  // Defines the orientation of the ellipse in the orbital plane
  argument_of_periapsis_rad: z.number(),

  // Mean anomaly at epoch: starting position in the orbit at time = 0
  // This is the initial mean anomaly when the simulation starts
  mean_anomaly_at_epoch_rad: z.number(),

  // Orbital period: time for one complete orbit (in seconds)
  // Can be calculated from semi-major axis using Kepler's third law
  orbital_period_sec: z.number().positive(),

  // Current mean anomaly: current position in the orbit
  // This value is updated each frame as the object moves
  current_mean_anomaly_rad: z.number(),
})

export type EllipticalOrbit = z.infer<typeof EllipticalOrbitSchema>
