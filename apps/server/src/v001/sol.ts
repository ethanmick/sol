import { Constants } from '../game/constants.js'
import { Planet } from '../game/entities/planet.js'
import { Ship } from '../game/entities/ship.js'
import { Star } from '../game/entities/star.js'
import type { WorldState } from '../game/world-state.js'

export function setup(state: WorldState): WorldState {
  const solPosition = { x: 0, y: 0 }
  const sol = new Star(solPosition, 'Sol', 696_340)

  state.entities.push(sol)
  state.stars.push(sol)

  const planetConfigs = [
    {
      name: 'Mercury',
      radiusKm: 2_439.7,
      orbitRadiusKm: 0.387_098 * Constants.KM_PER_AU,
      orbitSpeedKmPerSec: 47.36,
      initialAngleRad: Math.PI / 3,
    },
    {
      name: 'Venus',
      radiusKm: 6_051.8,
      orbitRadiusKm: 0.723_332 * Constants.KM_PER_AU,
      orbitSpeedKmPerSec: 35.02,
      initialAngleRad: (3 * Math.PI) / 4,
    },
    {
      name: 'Earth',
      radiusKm: 6_371,
      orbitRadiusKm: 1 * Constants.KM_PER_AU,
      orbitSpeedKmPerSec: 29.78,
      initialAngleRad: 0,
    },
    {
      name: 'Mars',
      radiusKm: 3_389.5,
      orbitRadiusKm: 1.523_679 * Constants.KM_PER_AU,
      orbitSpeedKmPerSec: 24.077,
      initialAngleRad: Math.PI / 6,
    },
    {
      name: 'Jupiter',
      radiusKm: 69_911,
      orbitRadiusKm: 5.204_4 * Constants.KM_PER_AU,
      orbitSpeedKmPerSec: 13.07,
      initialAngleRad: Math.PI / 2,
    },
    {
      name: 'Saturn',
      radiusKm: 58_232,
      orbitRadiusKm: 9.582_6 * Constants.KM_PER_AU,
      orbitSpeedKmPerSec: 9.69,
      initialAngleRad: (5 * Math.PI) / 6,
    },
    {
      name: 'Uranus',
      radiusKm: 25_362,
      orbitRadiusKm: 19.218_4 * Constants.KM_PER_AU,
      orbitSpeedKmPerSec: 6.81,
      initialAngleRad: (7 * Math.PI) / 6,
    },
    {
      name: 'Neptune',
      radiusKm: 24_622,
      orbitRadiusKm: 30.110_4 * Constants.KM_PER_AU,
      orbitSpeedKmPerSec: 5.43,
      initialAngleRad: (4 * Math.PI) / 3,
    },
  ] as const

  const planets = planetConfigs.map(
    ({ name, radiusKm, orbitRadiusKm, orbitSpeedKmPerSec, initialAngleRad }) =>
      new Planet(name, radiusKm, {
        anchor: sol,
        radiusKm: orbitRadiusKm,
        speedKmPerSec: orbitSpeedKmPerSec,
        initialAngleRad,
      })
  )

  planets.forEach((planet) => state.entities.push(planet))

  const pioneer = new Ship(
    {
      x: planets[0].position.x,
      y: planets[0].position.y,
    },
    'Pioneer',
    planets[0]
  )
  state.entities.push(pioneer)

  return state
}
