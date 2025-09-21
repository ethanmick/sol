import type { Moon as MoonData } from '@space/game'
import { Constants } from '../constants.js'
import type { Position } from '../util/position.js'
import { GameObject } from './game-object.js'

interface OrbitConfig {
  anchor: GameObject
  radiusKm: number
  speedKmPerSec: number
  initialAngleRad?: number
}

export class Moon extends GameObject implements MoonData {
  private readonly orbitalAnchor: GameObject
  private readonly orbitalRadiusKm: number
  private readonly orbitalSpeedKmPerSec: number
  private readonly angularSpeedRadPerSec: number
  private currentAngle: number

  constructor(name: string, public radius_km: number, orbit: OrbitConfig) {
    const initialAngle = orbit.initialAngleRad ?? 0
    const anchorPosition = orbit.anchor.position
    const initialPosition: Position = {
      x: anchorPosition.x + orbit.radiusKm * Math.cos(initialAngle),
      y: anchorPosition.y + orbit.radiusKm * Math.sin(initialAngle),
    }

    super(initialPosition, name)
    this.orbitalAnchor = orbit.anchor
    this.orbitalRadiusKm = orbit.radiusKm
    this.orbitalSpeedKmPerSec = orbit.speedKmPerSec
    this.currentAngle = initialAngle
    this.angularSpeedRadPerSec =
      this.orbitalSpeedKmPerSec / this.orbitalRadiusKm
  }

  update(delta: number): void {
    // Convert ms delta to seconds so we can use real-world orbital velocities.
    const deltaSeconds = delta / 1000

    this.currentAngle +=
      this.angularSpeedRadPerSec * deltaSeconds * Constants.GAME_SPEED

    // Wrap angle to keep it between 0 and 2π
    this.currentAngle = this.currentAngle % (2 * Math.PI)

    // Calculate new position using polar coordinates relative to the orbit anchor.
    const anchorPosition = this.orbitalAnchor.position
    this.position.x =
      anchorPosition.x + this.orbitalRadiusKm * Math.cos(this.currentAngle)
    this.position.y =
      anchorPosition.y + this.orbitalRadiusKm * Math.sin(this.currentAngle)
  }

  get orbit() {
    return {
      orbit_type: 'circular' as const,
      parent_id: this.orbitalAnchor.id,
      average_radius_km: this.orbitalRadiusKm,
      km_per_sec: this.orbitalSpeedKmPerSec,
      current_angle_rad: this.currentAngle,
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
