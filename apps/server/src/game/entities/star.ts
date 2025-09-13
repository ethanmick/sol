import type { Position } from '../util/position.js'
import { GameObject } from './game-object.js'

export class Star extends GameObject {
  constructor(position: Position, public name: string) {
    super(position)
  }

  update(delta: number): void {}
}
