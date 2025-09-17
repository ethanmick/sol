import type { Star as StarData } from '@space/game'
import type { Position } from '../util/position.js'
import { GameObject } from './game-object.js'

export class Star extends GameObject implements StarData {
  public type = 'star' as const
  constructor(
    position: Position,
    name: string,
    private readonly bodyRadiusKm: number
  ) {
    super(position, name)
  }

  update(_delta: number): void {}

  get radiusKm() {
    return this.bodyRadiusKm
  }

  toJSON() {
    return {
      ...super.toJSON(),
      radiusKm: this.radiusKm,
    }
  }
}
