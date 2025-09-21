import type { EllipticalOrbit } from '@space/game'
import { Constants as GameConstants } from '@space/game'
import { Constants } from '../constants.js'
import type { Position } from './position.js'

/**
 * Solves Kepler's equation: M = E - e*sin(E) for E (eccentric anomaly)
 * given M (mean anomaly) and e (eccentricity).
 *
 * Uses the Newton-Raphson iterative method for numerical solution.
 *
 * @param meanAnomaly - The mean anomaly in radians (0 to 2π)
 * @param eccentricity - The orbital eccentricity (0 to 1)
 * @param tolerance - Convergence tolerance (default 1e-8)
 * @param maxIterations - Maximum iterations to prevent infinite loops (default 30)
 * @returns The eccentric anomaly in radians
 */
export function solveKeplersEquation(
  meanAnomaly: number,
  eccentricity: number,
  tolerance: number = 1e-8,
  maxIterations: number = 30
): number {
  // For circular orbits (e = 0), E = M
  if (eccentricity === 0) {
    return meanAnomaly
  }

  // Normalize mean anomaly to [0, 2π]
  const M = meanAnomaly % (2 * Math.PI)

  // Initial guess for E
  // For low eccentricity, E ≈ M is a good guess
  // For high eccentricity, use a better initial approximation
  let E = M
  if (eccentricity > 0.8) {
    E = Math.PI
  }

  // Newton-Raphson iteration
  for (let i = 0; i < maxIterations; i++) {
    const sinE = Math.sin(E)
    const cosE = Math.cos(E)

    // f(E) = E - e*sin(E) - M
    const f = E - eccentricity * sinE - M

    // f'(E) = 1 - e*cos(E)
    const fPrime = 1 - eccentricity * cosE

    // Avoid division by very small numbers
    if (Math.abs(fPrime) < 1e-12) {
      break
    }

    // Newton-Raphson update: E_new = E - f(E)/f'(E)
    const deltaE = f / fPrime
    E = E - deltaE

    // Check for convergence
    if (Math.abs(deltaE) < tolerance) {
      break
    }
  }

  // Normalize result to [0, 2π]
  while (E < 0) E += 2 * Math.PI
  while (E > 2 * Math.PI) E -= 2 * Math.PI

  return E
}

/**
 * Calculates the position of an object in an elliptical orbit.
 *
 * @param orbit - The elliptical orbit parameters
 * @param parentPosition - The position of the parent body (e.g., star)
 * @returns The Cartesian position of the orbiting object
 */
export function calculateEllipticalPosition(
  orbit: EllipticalOrbit,
  parentPosition: Position = { x: 0, y: 0 }
): Position {
  const {
    semi_major_axis_km: a,
    eccentricity: e,
    argument_of_periapsis_rad: omega,
    current_mean_anomaly_rad: M,
  } = orbit

  // Step 1: Solve Kepler's equation for eccentric anomaly
  const E = solveKeplersEquation(M, e)

  // Step 2: Calculate true anomaly using the relation between E and v
  // tan(v/2) = sqrt((1+e)/(1-e)) * tan(E/2)
  const sinE = Math.sin(E)
  const cosE = Math.cos(E)

  // Alternative formula that's more numerically stable:
  // sin(v) = sqrt(1 - e^2) * sin(E) / (1 - e*cos(E))
  // cos(v) = (cos(E) - e) / (1 - e*cos(E))
  const denominator = 1 - e * cosE
  const sinV = (Math.sqrt(1 - e * e) * sinE) / denominator
  const cosV = (cosE - e) / denominator
  const v = Math.atan2(sinV, cosV)

  // Step 3: Calculate distance from focus (parent body)
  // r = a * (1 - e*cos(E))
  const r = a * denominator

  // Step 4: Calculate position in orbital plane (before rotation)
  // x points toward periapsis, y is perpendicular
  const orbitalX = r * Math.cos(v)
  const orbitalY = r * Math.sin(v)

  // Step 5: Apply rotation by argument of periapsis
  const cosOmega = Math.cos(omega)
  const sinOmega = Math.sin(omega)

  const x = orbitalX * cosOmega - orbitalY * sinOmega
  const y = orbitalX * sinOmega + orbitalY * cosOmega

  // Step 6: Add parent position offset
  return {
    x: parentPosition.x + x,
    y: parentPosition.y + y,
  }
}

/**
 * Updates the mean anomaly of an elliptical orbit based on elapsed time.
 *
 * @param orbit - The elliptical orbit to update
 * @param deltaSeconds - Time elapsed in seconds
 * @returns The updated mean anomaly in radians (wrapped to [0, 2π])
 */
export function updateMeanAnomaly(
  orbit: EllipticalOrbit,
  deltaSeconds: number
): number {
  // Calculate mean motion (n = 2π / T)
  const meanMotion = (2 * Math.PI) / orbit.orbital_period_sec

  // Update mean anomaly with game speed multiplier
  let newMeanAnomaly =
    orbit.current_mean_anomaly_rad +
    meanMotion * deltaSeconds * Constants.GAME_SPEED

  // Wrap to keep between 0 and 2π
  while (newMeanAnomaly < 0) {
    newMeanAnomaly += 2 * Math.PI
  }
  while (newMeanAnomaly >= 2 * Math.PI) {
    newMeanAnomaly -= 2 * Math.PI
  }

  return newMeanAnomaly
}

/**
 * Validates orbital parameters for physical consistency.
 *
 * @param orbit - The elliptical orbit to validate
 * @returns An object with validation result and any error messages
 */
export function validateOrbitalParameters(orbit: EllipticalOrbit): {
  valid: boolean
  errors: string[]
} {
  const errors: string[] = []

  // Check semi-major axis
  if (orbit.semi_major_axis_km <= 0) {
    errors.push('Semi-major axis must be positive')
  }

  // Check eccentricity (0 to 1 for closed orbits)
  if (orbit.eccentricity < 0 || orbit.eccentricity >= 1) {
    errors.push(
      'Eccentricity must be between 0 (inclusive) and 1 (exclusive) for elliptical orbits'
    )
  }

  // Check orbital period
  if (orbit.orbital_period_sec <= 0) {
    errors.push('Orbital period must be positive')
  }

  // Check mean anomaly range
  if (
    orbit.current_mean_anomaly_rad < 0 ||
    orbit.current_mean_anomaly_rad >= 2 * Math.PI
  ) {
    errors.push('Mean anomaly should be between 0 and 2π')
  }

  // Verify Kepler's third law (approximately)
  // T^2 ∝ a^3 (for the same parent body)
  // This is a sanity check - the actual constant depends on the parent mass
  // For the Sun: T (years) ≈ a^(3/2) (where a is in AU)
  const aInAU = orbit.semi_major_axis_km / GameConstants.AU
  const tInYears = orbit.orbital_period_sec / (365.25 * 24 * 3600)
  const keplerRatio = (tInYears * tInYears) / (aInAU * aInAU * aInAU)

  // The ratio should be close to 1 for solar orbits
  // Allow some tolerance for different parent bodies or calculation methods
  if (keplerRatio < 0.5 || keplerRatio > 2.0) {
    errors.push(
      `Orbital period and semi-major axis may be inconsistent (Kepler ratio: ${keplerRatio.toFixed(
        2
      )})`
    )
  }

  return {
    valid: errors.length === 0,
    errors,
  }
}

/**
 * Calculates orbital velocity at a given point in an elliptical orbit.
 * Uses the vis-viva equation: v^2 = GM(2/r - 1/a)
 *
 * @param semiMajorAxis - Semi-major axis in km
 * @param currentRadius - Current distance from focus in km
 * @param parentMass - Mass of parent body (optional, uses solar mass if not provided)
 * @returns Orbital velocity in km/s
 */
export function calculateOrbitalVelocity(
  semiMajorAxis: number,
  currentRadius: number,
  parentMass: number = 1.989e30 // Solar mass in kg
): number {
  const G = 6.6743e-11 // Gravitational constant in m^3 kg^-1 s^-2

  // Convert km to meters
  const a = semiMajorAxis * 1000
  const r = currentRadius * 1000

  // Vis-viva equation
  const vSquared = G * parentMass * (2 / r - 1 / a)

  // Convert back to km/s
  return Math.sqrt(vSquared) / 1000
}
