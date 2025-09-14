import { Planet } from '../game/entities/planet.js'
import { Star } from '../game/entities/star.js'
import type { WorldState } from '../game/world-state.js'

export function setup(state: WorldState): WorldState {
  const sol = new Star({ x: 0, y: 0 }, 'Sol')

  state.entities.push(sol)

  const earth = new Planet({ x: 200, y: 0 }, 'Earth')
  state.entities.push(earth)

  return state
}
