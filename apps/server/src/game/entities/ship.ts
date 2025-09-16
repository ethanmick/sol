import type { Ship as ShipData } from '@space/game'
import type { Position } from '../util/position.js'
import { GameObject } from './game-object.js'

export class Ship extends GameObject implements ShipData {
  public type = 'ship' as const

  constructor(public id: string, position: Position) {
    // TODO: revisit GameObject base once ships have distinct naming needs
    super(position, id)
  }

  update(delta: number): void {}
}
