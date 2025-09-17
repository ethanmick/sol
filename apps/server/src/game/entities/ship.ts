import type { Ship as ShipData } from '@space/game'
import { Constants } from '../constants.js'
import type { Position } from '../util/position.js'
import { GameObject } from './game-object.js'

type ShipStatus = 'docked' | 'flying'

interface ShipState {
  readonly name: ShipStatus
  enter(): void
  update(delta: number): void
}

class DockedState implements ShipState {
  public readonly name: ShipStatus = 'docked'

  constructor(
    private readonly ship: Ship,
    private readonly target: GameObject
  ) {}

  enter() {
    this.ship.status = this.name
    this.ship.docked_to = this.target.id
    this.ship.destination_id = null
    this.ship.start_position = null
    this.ship.position.x = this.target.position.x
    this.ship.position.y = this.target.position.y
  }

  update(_delta: number): void {
    this.ship.position.x = this.target.position.x
    this.ship.position.y = this.target.position.y
  }
}

class FlyingState implements ShipState {
  public readonly name: ShipStatus = 'flying'

  constructor(
    private readonly ship: Ship,
    private readonly destination: GameObject
  ) {}

  enter() {
    this.ship.status = this.name
    this.ship.docked_to = null
    this.ship.destination_id = this.destination.id
    this.ship.start_position = {
      x: this.ship.position.x,
      y: this.ship.position.y,
    }
  }

  update(delta: number): void {
    const targetPosition = this.destination.position
    const deltaX = targetPosition.x - this.ship.position.x
    const deltaY = targetPosition.y - this.ship.position.y
    const distance = Math.hypot(deltaX, deltaY)

    if (distance <= Constants.ARRIVAL_TOLERANCE_KM) {
      this.ship.setState(new DockedState(this.ship, this.destination))
      return
    }

    if (distance === 0) {
      return
    }

    const deltaSeconds = delta / 1000
    const travelDistance =
      Constants.SHIP_SPEED_KM_PER_S * deltaSeconds * Constants.GAME_SPEED
    const stepRatio = Math.min(1, travelDistance / distance)

    this.ship.position.x += deltaX * stepRatio
    this.ship.position.y += deltaY * stepRatio
  }
}

export class Ship extends GameObject implements ShipData {
  public type = 'ship' as const
  public status: ShipStatus = 'docked'
  public docked_to: string | null = null
  public destination_id: string | null = null
  public start_position: Position | null = null

  private state: ShipState | null = null

  constructor(position: Position, name: string, dockedTarget?: GameObject) {
    super(position, name)

    if (dockedTarget) {
      this.setState(new DockedState(this, dockedTarget))
    }
  }

  update(delta: number): void {
    this.state?.update(delta)
  }

  public flyTo(target: GameObject) {
    this.setState(new FlyingState(this, target))
  }

  public dockTo(target: GameObject) {
    this.setState(new DockedState(this, target))
  }

  public setState(state: ShipState) {
    this.state = state
    this.state.enter()
  }

  toJSON() {
    return {
      ...super.toJSON(),
      status: this.status,
      docked_to: this.docked_to,
      destination_id: this.destination_id,
      start_position: this.start_position,
    }
  }
}
