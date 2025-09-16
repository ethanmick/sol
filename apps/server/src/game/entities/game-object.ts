import type { GameObject as GameObjectData } from '@space/game'
import { randomUUID } from 'node:crypto'
import type { Position } from '../util/position.js'

export abstract class GameObject implements GameObjectData {
  public readonly id: string

  constructor(public position: Position, public name: string) {
    this.id = randomUUID()
  }

  abstract update(delta: number): void

  toJSON() {
    const { x, y } = this.position
    return {
      id: this.id,
      name: this.name,
      position: { x, y },
      type: (this as { type?: string }).type,
    }
  }
}
