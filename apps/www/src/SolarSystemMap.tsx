import type { Asteroid, Moon, Planet, Ship, Star } from '@space/game'
import { Viewport } from 'pixi-viewport'
import { Application, Graphics, Text } from 'pixi.js'
import React, { useEffect, useRef } from 'react'
import { useGameState } from './GameContext'

const PLANET_RADIUS_SCALE = 0.0015
const PLANET_RADIUS_MIN_PX = 4
const PLANET_RADIUS_MAX_PX = 80

const STAR_RADIUS_SCALE = 0.00005
const STAR_RADIUS_MIN_PX = 24
const STAR_RADIUS_MAX_PX = 140

const MOON_RADIUS_SCALE = 0.003
const MOON_RADIUS_MIN_PX = 2
const MOON_RADIUS_MAX_PX = 20

const ASTEROID_RADIUS_SCALE = 0.008
const ASTEROID_RADIUS_MIN_PX = 1
const ASTEROID_RADIUS_MAX_PX = 8

const clamp = (value: number, min: number, max: number) =>
  Math.min(Math.max(value, min), max)

const computeDistanceScale = (planets: Planet[]): number => {
  if (!planets.length) {
    return 1
  }

  const earth = planets.find((planet) => planet.name === 'Earth')
  const referenceOrbitKm =
    earth?.orbit.average_radius_km ??
    planets.reduce(
      (max, planet) => Math.max(max, planet.orbit.average_radius_km),
      0
    )

  if (!referenceOrbitKm) {
    return 1
  }

  const viewportMin = Math.min(window.innerWidth, window.innerHeight)

  // Keep the reference orbit within 40% of the smallest viewport dimension.
  return Math.max((viewportMin * 0.4) / referenceOrbitKm, 1e-6)
}

// Render method for star entities
const renderStar = (
  entity: Star,
  centerX: number,
  centerY: number,
  kmToPx: number
): Graphics => {
  const nodeGraphics = new Graphics()
  const radiusPx = clamp(
    entity.radiusKm * STAR_RADIUS_SCALE,
    STAR_RADIUS_MIN_PX,
    STAR_RADIUS_MAX_PX
  )
  nodeGraphics.circle(0, 0, radiusPx)
  nodeGraphics.fill(0xffd700)
  nodeGraphics.position.set(
    centerX + entity.position.x * kmToPx,
    centerY + entity.position.y * kmToPx
  )

  const label = new Text({
    text: entity.name,
    style: {
      fontSize: 16,
      fill: 0xffffff,
    },
  })
  label.anchor.set(0.5)
  label.position.set(0, -40)
  nodeGraphics.addChild(label)

  return nodeGraphics
}

// Render method for planet entities
const renderPlanet = (
  planet: Planet,
  centerX: number,
  centerY: number,
  kmToPx: number
): Graphics => {
  const nodeGraphics = new Graphics()
  const radiusPx = clamp(
    planet.radius_km * PLANET_RADIUS_SCALE,
    PLANET_RADIUS_MIN_PX,
    PLANET_RADIUS_MAX_PX
  )
  nodeGraphics.circle(0, 0, radiusPx)
  nodeGraphics.fill(0x4a90e2) // Blue color for planets
  nodeGraphics.position.set(
    centerX + planet.position.x * kmToPx,
    centerY + planet.position.y * kmToPx
  )

  const label = new Text({
    text: planet.name,
    style: {
      fontSize: 14,
      fill: 0xffffff,
    },
  })
  label.anchor.set(0.5)
  label.position.set(0, -30)
  nodeGraphics.addChild(label)

  return nodeGraphics
}

// Render method for moon entities
const renderMoon = (
  moon: Moon,
  centerX: number,
  centerY: number,
  kmToPx: number
): Graphics => {
  const nodeGraphics = new Graphics()
  const radiusPx = clamp(
    moon.radius_km * MOON_RADIUS_SCALE,
    MOON_RADIUS_MIN_PX,
    MOON_RADIUS_MAX_PX
  )
  nodeGraphics.circle(0, 0, radiusPx)
  nodeGraphics.fill(0x999999) // Gray color for moons
  nodeGraphics.position.set(
    centerX + moon.position.x * kmToPx,
    centerY + moon.position.y * kmToPx
  )

  const label = new Text({
    text: moon.name,
    style: {
      fontSize: 10,
      fill: 0xcccccc,
    },
  })
  label.anchor.set(0.5)
  label.position.set(0, -15)
  nodeGraphics.addChild(label)

  return nodeGraphics
}

// Render method for asteroid entities
const renderAsteroid = (
  asteroid: Asteroid,
  centerX: number,
  centerY: number,
  kmToPx: number
): Graphics => {
  const nodeGraphics = new Graphics()
  const radiusPx = clamp(
    asteroid.radius_km * ASTEROID_RADIUS_SCALE,
    ASTEROID_RADIUS_MIN_PX,
    ASTEROID_RADIUS_MAX_PX
  )
  nodeGraphics.circle(0, 0, radiusPx)
  nodeGraphics.fill(0x8B4513) // Brown color for asteroids
  nodeGraphics.position.set(
    centerX + asteroid.position.x * kmToPx,
    centerY + asteroid.position.y * kmToPx
  )

  const label = new Text({
    text: asteroid.name,
    style: {
      fontSize: 8,
      fill: 0xaaaaaa,
    },
  })
  label.anchor.set(0.5)
  label.position.set(0, -12)
  nodeGraphics.addChild(label)

  return nodeGraphics
}

// Render method for ship entities (small dots)
const renderShip = (
  entity: Ship,
  centerX: number,
  centerY: number,
  kmToPx: number
): Graphics => {
  const shipGraphics = new Graphics()
  shipGraphics.circle(0, 0, 5)
  shipGraphics.fill(0xffffff)
  shipGraphics.position.set(
    centerX + entity.position.x * kmToPx,
    centerY + entity.position.y * kmToPx
  )

  return shipGraphics
}

const SolarSystemMap: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const appRef = useRef<Application | null>(null)
  const viewportRef = useRef<Viewport | null>(null)
  const isInitialCenterRef = useRef<boolean>(false)
  const { gameState } = useGameState()

  useEffect(() => {
    if (!canvasRef.current) return
    ;(async function () {
      const app = new Application()
      await app.init({
        canvas: canvasRef.current!,
        width: window.innerWidth,
        height: window.innerHeight,
        background: 0x000000,
      })
      appRef.current = app

      // Calculate world dimensions based on content
      // We'll use a reasonable multiplier of the screen dimensions
      const worldWidth = window.innerWidth * 20
      const worldHeight = window.innerHeight * 20

      // Create viewport with panning/dragging capabilities
      const viewport = new Viewport({
        screenWidth: window.innerWidth,
        screenHeight: window.innerHeight,
        worldWidth: worldWidth,
        worldHeight: worldHeight,
        events: app.renderer.events,
      })

      // Enable drag functionality
      viewport.drag({
        mouseButtons: 'left',
      })

      // Enable wheel zooming
      viewport.wheel({
        smooth: 3,
      })

      // Enable pinch-to-zoom for touch devices
      viewport.pinch()

      viewport.clampZoom({
        minScale: 0.05,
        maxScale: 10,
      })

      // CRITICAL: Add clamping with underflow center
      // This prevents the viewport from moving off-screen when zoomed out
      viewport.clamp({
        left: 0,
        right: worldWidth,
        top: 0,
        bottom: worldHeight,
        direction: 'all',
        underflow: 'center', // This is the key - keeps content centered when smaller than screen
      })

      // Add viewport to stage
      app.stage.addChild(viewport)
      viewportRef.current = viewport
    })()

    return () => {
      if (appRef.current) {
        appRef.current.destroy(true)
      }
    }
  }, [])

  useEffect(() => {
    const viewport = viewportRef.current
    if (!viewport || !gameState) return

    const kmToPx = computeDistanceScale(Object.values(gameState.planets))
    const centerX = viewport.worldWidth / 2
    const centerY = viewport.worldHeight / 2

    // Clear existing graphics from viewport
    viewport.removeChildren()

    Object.values(gameState.stars).forEach((star) => {
      viewport.addChild(renderStar(star, centerX, centerY, kmToPx))
    })

    Object.values(gameState.planets).forEach((planet) => {
      if (kmToPx > 0) {
        const orbitGraphics = new Graphics()
        orbitGraphics.circle(0, 0, planet.orbit.average_radius_km * kmToPx)
        orbitGraphics.stroke({ width: 1, color: 0x333333, alpha: 0.45 })
        orbitGraphics.position.set(centerX, centerY)
        viewport.addChild(orbitGraphics)
      }

      viewport.addChild(renderPlanet(planet, centerX, centerY, kmToPx))

      // Render moons for this planet
      planet.moons?.forEach((moon) => {
        if (kmToPx > 0) {
          const orbitGraphics = new Graphics()
          orbitGraphics.circle(0, 0, moon.orbit.average_radius_km * kmToPx)
          orbitGraphics.stroke({ width: 1, color: 0x666666, alpha: 0.3 })
          orbitGraphics.position.set(
            centerX + planet.position.x * kmToPx,
            centerY + planet.position.y * kmToPx
          )
          viewport.addChild(orbitGraphics)
        }

        viewport.addChild(renderMoon(moon, centerX, centerY, kmToPx))
      })
    })

    Object.values(gameState.asteroids || {}).forEach((asteroid) => {
      if (kmToPx > 0) {
        const orbitGraphics = new Graphics()
        orbitGraphics.circle(0, 0, asteroid.orbit.average_radius_km * kmToPx)
        orbitGraphics.stroke({ width: 1, color: 0x444444, alpha: 0.25 })
        orbitGraphics.position.set(centerX, centerY)
        viewport.addChild(orbitGraphics)
      }

      viewport.addChild(renderAsteroid(asteroid, centerX, centerY, kmToPx))
    })

    Object.values(gameState.ships).forEach((ship) => {
      viewport.addChild(renderShip(ship, centerX, centerY, kmToPx))
    })

    // Center the viewport on the solar system only on initial load
    if (!isInitialCenterRef.current) {
      viewport.moveCenter(centerX, centerY)
      isInitialCenterRef.current = true
    }
  }, [gameState])

  return (
    <div
      style={{
        width: '100vw',
        height: '100vh',
        overflow: 'hidden',
      }}
    >
      <canvas ref={canvasRef} />
    </div>
  )
}

export default SolarSystemMap
