import type { GameObject as GameObjectData } from '@space/game'
import type { Position } from '../util/position.js'

export abstract class GameObject implements GameObjectData {
  constructor(public position: Position, public name: string) {}

  abstract update(delta: number): void
}
