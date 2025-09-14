import type { WorldState } from './world-state.js'

export class Simulation {
  private lastTickTimeMS = 0
  constructor(public state: WorldState) {
    this.state = state
  }

  public start() {
    this.lastTickTimeMS = Date.now()

    setInterval(() => {
      const now = Date.now()
      const delta = now - this.lastTickTimeMS
      this.lastTickTimeMS = now
      this.update(delta)
    }, 100)
  }

  private update(delta: number) {
    this.state.update(delta)
  }
}
