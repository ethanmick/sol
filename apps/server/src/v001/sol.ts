import { Constants } from '@space/game'
import { Asteroid } from '../game/entities/asteroid.js'
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
        type: 'circular',
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

  // Add Pluto with its highly elliptical orbit
  const pluto = new Planet('Pluto', 1_188.3, {
    type: 'elliptical',
    anchor: sol,
    semiMajorAxisKm: 39.48 * Constants.AU, // Average distance from Sun
    eccentricity: 0.2488, // Notably eccentric for a planet
    argumentOfPeriapsisRad: 1.925, // ~110.3 degrees
    meanAnomalyAtEpochRad: Math.random() * 2 * Math.PI,
    orbitalPeriodSec: 247.68 * 365.25 * 24 * 3600, // ~248 Earth years
  })
  pluto.id = 'pluto'
  state.addPlanet(pluto)

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

  // Add test asteroid in the asteroid belt (between Mars and Jupiter)
  const ceres = new Asteroid('Ceres', 473, {
    type: 'circular',
    anchor: sol,
    radiusKm: 2.77 * Constants.AU, // Typical asteroid belt distance
    speedKmPerSec: 17.9, // Orbital speed for asteroid belt
    initialAngleRad: Math.PI / 8,
  })
  ceres.id = 'ceres'
  state.addAsteroid(ceres)

  // Add new asteroid with elliptical orbit
  // This asteroid has periapsis near Earth's orbit (1 AU) and apoapsis in the asteroid belt
  const eros = new Asteroid('Eros', 8.4, {
    type: 'elliptical',
    anchor: sol,
    semiMajorAxisKm: 1.885 * Constants.AU, // Semi-major axis between periapsis and apoapsis
    eccentricity: 0.47, // Moderate eccentricity (periapsis ~1 AU, apoapsis ~2.77 AU)
    argumentOfPeriapsisRad: Math.PI / 4, // 45 degrees rotation of ellipse
    meanAnomalyAtEpochRad: 0, // Start at periapsis
    orbitalPeriodSec: 2.59 * 365.25 * 24 * 3600, // ~2.59 years orbital period
  })
  eros.id = 'eros'
  state.addAsteroid(eros)

  // Add a collection of inner solar system asteroids with varied elliptical orbits
  // All stay within Mars orbit (1.52 AU)
  for (let i = 1; i <= 20; i++) {
    // Generate varied but constrained orbital parameters
    const semiMajorAxis = 0.7 + Math.random() * 0.7 // 0.7 to 1.4 AU
    let eccentricity = 0.1 + Math.random() * 0.35 // 0.1 to 0.45

    // Ensure aphelion doesn't exceed Mars orbit
    const aphelion = semiMajorAxis * (1 + eccentricity)
    if (aphelion > 1.5) {
      // Adjust eccentricity to keep within bounds
      const maxEccentricity = 1.5 / semiMajorAxis - 1
      eccentricity = Math.min(eccentricity, maxEccentricity)
    }

    const asteroid = new Asteroid(`Asteroid-${i}`, 1 + Math.random() * 4, {
      type: 'elliptical',
      anchor: sol,
      semiMajorAxisKm: semiMajorAxis * Constants.AU,
      eccentricity: eccentricity,
      argumentOfPeriapsisRad: (i * Math.PI) / 10, // Evenly distributed orientations
      meanAnomalyAtEpochRad: Math.random() * 2 * Math.PI,
      orbitalPeriodSec: Math.pow(semiMajorAxis, 1.5) * 365.25 * 24 * 3600, // Kepler's 3rd law
    })
    asteroid.id = `asteroid-${i}`
    state.addAsteroid(asteroid)
  }

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
