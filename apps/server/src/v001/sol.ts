import { Constants } from '@space/game'
import { Moon } from '../game/entities/moon.js'
import { Planet } from '../game/entities/planet.js'
import { Ship } from '../game/entities/ship.js'
import { Star } from '../game/entities/star.js'
import type { WorldState } from '../game/world-state.js'

export function setup(state: WorldState): WorldState {
  const solPosition = { x: 0, y: 0 }
  const sol = new Star(solPosition, 'Sol', 696_340)
  state.addStar(sol)

  const planetConfigs = [
    {
      id: 'mercury',
      name: 'Mercury',
      radiusKm: 2_439.7,
      orbitRadiusKm: 0.387_098 * Constants.AU,
      orbitSpeedKmPerSec: 47.36,
      initialAngleRad: Math.PI / 3,
    },
    {
      id: 'venus',
      name: 'Venus',
      radiusKm: 6_051.8,
      orbitRadiusKm: 0.723_332 * Constants.AU,
      orbitSpeedKmPerSec: 35.02,
      initialAngleRad: (3 * Math.PI) / 4,
    },
    {
      id: 'earth',
      name: 'Earth',
      radiusKm: 6_371,
      orbitRadiusKm: 1 * Constants.AU,
      orbitSpeedKmPerSec: 29.78,
      initialAngleRad: 0,
    },
    {
      id: 'mars',
      name: 'Mars',
      radiusKm: 3_389.5,
      orbitRadiusKm: 1.523_679 * Constants.AU,
      orbitSpeedKmPerSec: 24.077,
      initialAngleRad: Math.PI / 6,
    },
    {
      id: 'jupiter',
      name: 'Jupiter',
      radiusKm: 69_911,
      orbitRadiusKm: 5.204_4 * Constants.AU,
      orbitSpeedKmPerSec: 13.07,
      initialAngleRad: Math.PI / 2,
    },
    {
      id: 'saturn',
      name: 'Saturn',
      radiusKm: 58_232,
      orbitRadiusKm: 9.582_6 * Constants.AU,
      orbitSpeedKmPerSec: 9.69,
      initialAngleRad: (5 * Math.PI) / 6,
    },
    {
      id: 'uranus',
      name: 'Uranus',
      radiusKm: 25_362,
      orbitRadiusKm: 19.218_4 * Constants.AU,
      orbitSpeedKmPerSec: 6.81,
      initialAngleRad: (7 * Math.PI) / 6,
    },
    {
      id: 'neptune',
      name: 'Neptune',
      radiusKm: 24_622,
      orbitRadiusKm: 30.110_4 * Constants.AU,
      orbitSpeedKmPerSec: 5.43,
      initialAngleRad: (4 * Math.PI) / 3,
    },
  ] as const

  const planets = planetConfigs.map(
    ({
      id,
      name,
      radiusKm,
      orbitRadiusKm,
      orbitSpeedKmPerSec,
      initialAngleRad,
    }) => {
      const planet = new Planet(name, radiusKm, {
        anchor: sol,
        radiusKm: orbitRadiusKm,
        speedKmPerSec: orbitSpeedKmPerSec,
        initialAngleRad,
      })
      planet.id = id
      state.addPlanet(planet)
      return planet
    }
  )

  // Find Earth and Mars for moon placement
  const earth = planets.find((p) => p.id === 'earth')!
  const mars = planets.find((p) => p.id === 'mars')!

  // Add Luna (Earth's moon)
  const luna = new Moon('Luna', 1_737.4, {
    anchor: earth,
    radiusKm: 384_400, // Average distance from Earth
    speedKmPerSec: 10.022, // Average orbital speed
    initialAngleRad: 0,
  })
  luna.id = 'luna'
  earth.addMoon(luna)

  // Add Phobos (Mars' inner moon)
  const phobos = new Moon('Phobos', 11.3, {
    anchor: mars,
    radiusKm: 9_376, // Average distance from Mars
    speedKmPerSec: 2.138, // Average orbital speed
    initialAngleRad: Math.PI / 4,
  })
  phobos.id = 'phobos'
  mars.addMoon(phobos)

  // Add Deimos (Mars' outer moon)
  const deimos = new Moon('Deimos', 6.2, {
    anchor: mars,
    radiusKm: 23_463, // Average distance from Mars
    speedKmPerSec: 1.351, // Average orbital speed
    initialAngleRad: (3 * Math.PI) / 4,
  })
  deimos.id = 'deimos'
  mars.addMoon(deimos)

  const pioneer = new Ship(
    {
      x: planets[0].position.x,
      y: planets[0].position.y,
    },
    'Pioneer',
    planets[0]
  )
  pioneer.id = 'pioneer-1'
  state.addShip(pioneer)

  return state
}
