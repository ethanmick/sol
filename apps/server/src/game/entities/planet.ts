import type { Planet as PlanetData } from '@space/game'
import type { Position } from '../util/position.js'
import { GameObject } from './game-object.js'
import { Constants } from '../constants.js'

export class Planet extends GameObject implements PlanetData {
  public type = 'planet' as const

  constructor(
    position: Position,
    name: string,
    private orbitalCenter: Position,
    private orbitalRadius: number,
    private orbitalSpeed: number, // radians per second
    private currentAngle: number = 0 // current position in orbit (radians)
  ) {
    super(position, name)
  }

  update(delta: number): void {
    // Update orbital angle based on orbital speed, delta time, and game speed
    this.currentAngle += this.orbitalSpeed * delta * Constants.GAME_SPEED

    // Wrap angle to keep it between 0 and 2π
    this.currentAngle = this.currentAngle % (2 * Math.PI)

    // Calculate new position using polar coordinates
    this.position.x = this.orbitalCenter.x + this.orbitalRadius * Math.cos(this.currentAngle)
    this.position.y = this.orbitalCenter.y + this.orbitalRadius * Math.sin(this.currentAngle)
  }
}
