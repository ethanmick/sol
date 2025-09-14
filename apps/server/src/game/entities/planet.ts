import type { Planet as PlanetData } from '@space/game'
import type { Position } from '../util/position.js'
import { GameObject } from './game-object.js'

export class Planet extends GameObject implements PlanetData {
  public type = 'planet' as const
  constructor(public position: Position, public name: string) {
    super(position, name)
  }

  update(delta: number): void {}
}
