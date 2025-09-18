import type { Star, WorldState as WorldStateData } from '@space/game'
import type { GameObject } from './entities/game-object.js'

export class WorldState implements WorldStateData {
  public entities: GameObject[] = []
  public stars: Star[] = []

  public update(delta: number) {
    this.entities.forEach((entity) => entity.update(delta))
  }
}
