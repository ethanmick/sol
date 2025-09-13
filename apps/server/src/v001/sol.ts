import { Star } from '../game/entities/star.js'
import type { WorldState } from '../game/world-state.js'

export function setup(state: WorldState): WorldState {
  const sol = new Star({ x: 0, y: 0 })

  state.entities.push(sol)

  return state
}
