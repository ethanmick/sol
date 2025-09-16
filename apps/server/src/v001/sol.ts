import { Planet } from '../game/entities/planet.js'
import { Ship } from '../game/entities/ship.js'
import { Star } from '../game/entities/star.js'
import type { WorldState } from '../game/world-state.js'

export function setup(state: WorldState): WorldState {
  const solPosition = { x: 0, y: 0 }
  const sol = new Star(solPosition, 'Sol')

  state.entities.push(sol)

  const mercuryOrbitRadius = 80
  const mercuryStartAngle = Math.PI / 3
  const mercury = new Planet(
    {
      x: sol.position.x + mercuryOrbitRadius * Math.cos(mercuryStartAngle),
      y: sol.position.y + mercuryOrbitRadius * Math.sin(mercuryStartAngle),
    },
    'Mercury',
    sol.position,
    mercuryOrbitRadius,
    0.00004, // TODO: tune orbital speeds once simulation pacing is locked
    mercuryStartAngle
  )
  state.entities.push(mercury)

  const venusOrbitRadius = 140
  const venusStartAngle = (3 * Math.PI) / 4
  const venus = new Planet(
    {
      x: sol.position.x + venusOrbitRadius * Math.cos(venusStartAngle),
      y: sol.position.y + venusOrbitRadius * Math.sin(venusStartAngle),
    },
    'Venus',
    sol.position,
    venusOrbitRadius,
    0.000016,
    venusStartAngle
  )
  state.entities.push(venus)

  const earthOrbitRadius = 200
  const earthStartAngle = 0
  const earth = new Planet(
    {
      x: sol.position.x + earthOrbitRadius * Math.cos(earthStartAngle),
      y: sol.position.y + earthOrbitRadius * Math.sin(earthStartAngle),
    }, // initial position
    'Earth',
    sol.position, // orbital center (Sol's position)
    earthOrbitRadius, // orbital radius
    0.00001, // orbital speed in radians per second
    earthStartAngle // starting angle (starts at rightmost position)
  )
  state.entities.push(earth)

  const pioneer = new Ship('ship-1', {
    x: sol.position.x + 260,
    y: sol.position.y - 120,
  })
  state.entities.push(pioneer)

  return state
}
