import { Planet } from '../game/entities/planet.js'
import { Star } from '../game/entities/star.js'
import type { WorldState } from '../game/world-state.js'

export function setup(state: WorldState): WorldState {
  const sol = new Star({ x: 0, y: 0 }, 'Sol')

  state.entities.push(sol)

  const earth = new Planet(
    { x: 200, y: 0 }, // initial position
    'Earth',
    { x: 0, y: 0 }, // orbital center (Sol's position)
    200, // orbital radius
    0.00001, // orbital speed in radians per second
    0 // starting angle (starts at rightmost position)
  )
  state.entities.push(earth)

  return state
}
