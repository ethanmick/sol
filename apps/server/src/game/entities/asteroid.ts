import type { Asteroid as AsteroidData, Orbit } from '@space/game'
import { Constants } from '../constants.js'
import {
  calculateEllipticalPosition,
  updateMeanAnomaly,
} from '../util/orbital-math.js'
import type { Position } from '../util/position.js'
import { GameObject } from './game-object.js'

interface CircularOrbitConfig {
  type: 'circular'
  anchor: GameObject
  radiusKm: number
  speedKmPerSec: number
  initialAngleRad?: number
}

interface EllipticalOrbitConfig {
  type: 'elliptical'
  anchor: GameObject
  semiMajorAxisKm: number
  eccentricity: number
  argumentOfPeriapsisRad: number
  meanAnomalyAtEpochRad: number
  orbitalPeriodSec: number
}

type OrbitConfig = CircularOrbitConfig | EllipticalOrbitConfig

export class Asteroid extends GameObject implements AsteroidData {
  private readonly orbitalAnchor: GameObject
  private readonly orbitConfig: OrbitConfig

  // Circular orbit properties
  private orbitalRadiusKm?: number
  private orbitalSpeedKmPerSec?: number
  private angularSpeedRadPerSec?: number
  private currentAngle?: number

  // Elliptical orbit properties
  private semiMajorAxisKm?: number
  private eccentricity?: number
  private argumentOfPeriapsisRad?: number
  private meanAnomalyAtEpochRad?: number
  private orbitalPeriodSec?: number
  private currentMeanAnomalyRad?: number

  constructor(name: string, public radius_km: number, orbit: OrbitConfig) {
    let initialPosition: Position
    const anchorPosition = orbit.anchor.position

    if (orbit.type === 'circular') {
      const initialAngle = orbit.initialAngleRad ?? 0
      initialPosition = {
        x: anchorPosition.x + orbit.radiusKm * Math.cos(initialAngle),
        y: anchorPosition.y + orbit.radiusKm * Math.sin(initialAngle),
      }

      // Circular orbit properties will be initialized after super()
    } else {
      // For elliptical orbit, calculate initial position from orbital elements
      // Use the proper orbital math to get the correct position at the initial mean anomaly
      const ellipticalOrbit = {
        orbit_type: 'elliptical' as const,
        parent_id: orbit.anchor.id,
        semi_major_axis_km: orbit.semiMajorAxisKm,
        eccentricity: orbit.eccentricity,
        argument_of_periapsis_rad: orbit.argumentOfPeriapsisRad,
        mean_anomaly_at_epoch_rad: orbit.meanAnomalyAtEpochRad,
        orbital_period_sec: orbit.orbitalPeriodSec,
        current_mean_anomaly_rad: orbit.meanAnomalyAtEpochRad, // Start at epoch
      }

      initialPosition = calculateEllipticalPosition(
        ellipticalOrbit,
        anchorPosition
      )

      // Elliptical orbit properties will be initialized after super()
    }

    super(initialPosition, name)
    this.orbitalAnchor = orbit.anchor
    this.orbitConfig = orbit

    // Initialize orbit-specific properties after super()
    if (orbit.type === 'circular') {
      const initialAngle = orbit.initialAngleRad ?? 0
      this.orbitalRadiusKm = orbit.radiusKm
      this.orbitalSpeedKmPerSec = orbit.speedKmPerSec
      this.currentAngle = initialAngle
      this.angularSpeedRadPerSec =
        this.orbitalSpeedKmPerSec / this.orbitalRadiusKm
    } else {
      this.semiMajorAxisKm = orbit.semiMajorAxisKm
      this.eccentricity = orbit.eccentricity
      this.argumentOfPeriapsisRad = orbit.argumentOfPeriapsisRad
      this.meanAnomalyAtEpochRad = orbit.meanAnomalyAtEpochRad
      this.orbitalPeriodSec = orbit.orbitalPeriodSec
      this.currentMeanAnomalyRad = orbit.meanAnomalyAtEpochRad
    }
  }

  update(delta: number): void {
    // Convert ms delta to seconds so we can use real-world orbital velocities.
    const deltaSeconds = delta / 1000

    if (this.orbitConfig.type === 'circular') {
      this.currentAngle! +=
        this.angularSpeedRadPerSec! * deltaSeconds * Constants.GAME_SPEED

      // Wrap angle to keep it between 0 and 2π
      this.currentAngle = this.currentAngle! % (2 * Math.PI)

      // Calculate new position using polar coordinates relative to the orbit anchor.
      const anchorPosition = this.orbitalAnchor.position
      this.position.x =
        anchorPosition.x + this.orbitalRadiusKm! * Math.cos(this.currentAngle)
      this.position.y =
        anchorPosition.y + this.orbitalRadiusKm! * Math.sin(this.currentAngle)
    } else {
      // For elliptical orbits, update the mean anomaly and calculate new position
      const ellipticalOrbit = {
        orbit_type: 'elliptical' as const,
        parent_id: this.orbitalAnchor.id,
        semi_major_axis_km: this.semiMajorAxisKm!,
        eccentricity: this.eccentricity!,
        argument_of_periapsis_rad: this.argumentOfPeriapsisRad!,
        mean_anomaly_at_epoch_rad: this.meanAnomalyAtEpochRad!,
        orbital_period_sec: this.orbitalPeriodSec!,
        current_mean_anomaly_rad: this.currentMeanAnomalyRad!,
      }

      // Update mean anomaly based on elapsed time
      this.currentMeanAnomalyRad = updateMeanAnomaly(
        ellipticalOrbit,
        deltaSeconds
      )

      // Update the orbit object with new mean anomaly for position calculation
      ellipticalOrbit.current_mean_anomaly_rad = this.currentMeanAnomalyRad

      // Calculate new position using Kepler's equation
      const anchorPosition = this.orbitalAnchor.position
      const newPosition = calculateEllipticalPosition(
        ellipticalOrbit,
        anchorPosition
      )

      this.position.x = newPosition.x
      this.position.y = newPosition.y
    }
  }

  get orbit(): Orbit {
    if (this.orbitConfig.type === 'circular') {
      return {
        orbit_type: 'circular' as const,
        parent_id: this.orbitalAnchor.id,
        average_radius_km: this.orbitalRadiusKm!,
        km_per_sec: this.orbitalSpeedKmPerSec!,
        current_angle_rad: this.currentAngle!,
      }
    } else {
      return {
        orbit_type: 'elliptical' as const,
        parent_id: this.orbitalAnchor.id,
        semi_major_axis_km: this.semiMajorAxisKm!,
        eccentricity: this.eccentricity!,
        argument_of_periapsis_rad: this.argumentOfPeriapsisRad!,
        mean_anomaly_at_epoch_rad: this.meanAnomalyAtEpochRad!,
        orbital_period_sec: this.orbitalPeriodSec!,
        current_mean_anomaly_rad: this.currentMeanAnomalyRad!,
      }
    }
  }

  toJSON() {
    return {
      ...super.toJSON(),
      radius_km: this.radius_km,
      orbit: this.orbit,
    }
  }
}
