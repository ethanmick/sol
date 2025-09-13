import type { Position } from '../util/position.js'

export abstract class GameObject {
  public position: Position

  constructor(position: Position) {
    this.position = position
  }

  abstract update(delta: number): void
}
