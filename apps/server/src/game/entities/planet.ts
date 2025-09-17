import type { Planet as PlanetData } from '@space/game'
import type { Position } from '../util/position.js'
import { GameObject } from './game-object.js'
import { Constants } from '../constants.js'

interface OrbitConfig {
  anchor: GameObject
  radiusKm: number
  speedKmPerSec: number
  initialAngleRad?: number
}

export class Planet extends GameObject implements PlanetData {
  public type = 'planet' as const
  private readonly orbitalAnchor: GameObject
  private readonly orbitalRadiusKm: number
  private readonly orbitalSpeedKmPerSec: number
  private readonly angularSpeedRadPerSec: number
  private currentAngle: number
  private readonly bodyRadiusKm: number

  constructor(name: string, radiusKm: number, orbit: OrbitConfig) {
    const initialAngle = orbit.initialAngleRad ?? 0
    const anchorPosition = orbit.anchor.position
    const initialPosition: Position = {
      x: anchorPosition.x + orbit.radiusKm * Math.cos(initialAngle),
      y: anchorPosition.y + orbit.radiusKm * Math.sin(initialAngle),
    }

    super(initialPosition, name)
    this.bodyRadiusKm = radiusKm
    this.orbitalAnchor = orbit.anchor
    this.orbitalRadiusKm = orbit.radiusKm
    this.orbitalSpeedKmPerSec = orbit.speedKmPerSec
    this.currentAngle = initialAngle
    this.angularSpeedRadPerSec = this.orbitalSpeedKmPerSec / this.orbitalRadiusKm
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

  get radiusKm() {
    return this.bodyRadiusKm
  }

  get orbit() {
    return {
      parentId: this.orbitalAnchor.id,
      averageRadiusKm: this.orbitalRadiusKm,
      speedKmPerSec: this.orbitalSpeedKmPerSec,
      currentAngleRad: this.currentAngle,
    }
  }

  toJSON() {
    return {
      ...super.toJSON(),
      radiusKm: this.radiusKm,
      orbit: this.orbit,
    }
  }
}
