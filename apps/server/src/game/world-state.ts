import type { GameObject } from './entities/game-object.js'

export class WorldState {
  public entities: GameObject[] = []

  public update(delta: number) {
    this.entities.forEach((entity) => entity.update(delta))
  }
}
