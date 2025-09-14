import type { Star as StarData } from '@space/game'
import type { Position } from '../util/position.js'
import { GameObject } from './game-object.js'

export class Star extends GameObject implements StarData {
  public type = 'star' as const
  constructor(position: Position, name: string) {
    super(position, name)
  }

  update(delta: number): void {}
}
