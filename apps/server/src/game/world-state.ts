import type { WorldState as WorldStateData } from '@space/game'
import type { Asteroid } from './entities/asteroid.js'
import type { Planet } from './entities/planet.js'
import type { Ship } from './entities/ship.js'
import type { Star } from './entities/star.js'

export class WorldState implements WorldStateData {
  public stars: Record<string, Star> = {}
  public planets: Record<string, Planet> = {}
  public asteroids: Record<string, Asteroid> = {}
  public ships: Record<string, Ship> = {}

  public update(delta: number) {
    ;[
      ...Object.values(this.stars),
      ...Object.values(this.planets),
      ...Object.values(this.asteroids),
      ...Object.values(this.ships),
    ].forEach((e) => e.update(delta))
  }

  public addStar(star: Star) {
    this.stars[star.id] = star
  }

  public addPlanet(planet: Planet) {
    this.planets[planet.id] = planet
  }

  public addAsteroid(asteroid: Asteroid) {
    this.asteroids[asteroid.id] = asteroid
  }

  public addShip(ship: Ship) {
    this.ships[ship.id] = ship
  }
}
