import type { Planet, Ship, Star, WorldEntity } from '@space/game'
import { Application, Graphics, Text } from 'pixi.js'
import React, { useEffect, useRef } from 'react'
import { useGameState } from './GameContext'

const PLANET_RADIUS_SCALE = 0.0015
const PLANET_RADIUS_MIN_PX = 4
const PLANET_RADIUS_MAX_PX = 80

const STAR_RADIUS_SCALE = 0.00005
const STAR_RADIUS_MIN_PX = 24
const STAR_RADIUS_MAX_PX = 140

const clamp = (value: number, min: number, max: number) =>
  Math.min(Math.max(value, min), max)

const computeDistanceScale = (entities: WorldEntity[]): number => {
  const planets = entities.filter(
    (entity): entity is Planet => entity.type === 'planet'
  )
  if (!planets.length) {
    return 1
  }

  const earth = planets.find((planet) => planet.name === 'Earth')
  const referenceOrbitKm = earth?.orbit.averageRadiusKm ??
    planets.reduce(
      (max, planet) => Math.max(max, planet.orbit.averageRadiusKm),
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
  entity: Planet,
  centerX: number,
  centerY: number,
  kmToPx: number
): Graphics => {
  const nodeGraphics = new Graphics()
  const radiusPx = clamp(
    entity.radiusKm * PLANET_RADIUS_SCALE,
    PLANET_RADIUS_MIN_PX,
    PLANET_RADIUS_MAX_PX
  )
  nodeGraphics.circle(0, 0, radiusPx)
  nodeGraphics.fill(0x4a90e2) // Blue color for planets
  nodeGraphics.position.set(
    centerX + entity.position.x * kmToPx,
    centerY + entity.position.y * kmToPx
  )

  const label = new Text({
    text: entity.name,
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
    })()

    return () => {
      if (appRef.current) {
        appRef.current.destroy(true)
      }
    }
  }, [])

  useEffect(() => {
    if (!appRef.current || !gameState?.entities) return

    const kmToPx = computeDistanceScale(gameState.entities)
    const centerX = window.innerWidth / 2
    const centerY = window.innerHeight / 2

    // Clear existing graphics
    appRef.current.stage.removeChildren()

    gameState.entities.forEach((entity) => {
      if (entity.type === 'star') {
        const starGraphics = renderStar(
          entity as Star,
          centerX,
          centerY,
          kmToPx
        )
        appRef.current!.stage.addChild(starGraphics)
      } else if (entity.type === 'planet') {
        const planet = entity as Planet
        if (kmToPx > 0) {
          const orbitGraphics = new Graphics()
          orbitGraphics.circle(0, 0, planet.orbit.averageRadiusKm * kmToPx)
          orbitGraphics.stroke({ width: 1, color: 0x333333, alpha: 0.45 })
          orbitGraphics.position.set(centerX, centerY)
          appRef.current!.stage.addChild(orbitGraphics)
        }

        const planetGraphics = renderPlanet(planet, centerX, centerY, kmToPx)
        appRef.current!.stage.addChild(planetGraphics)
      } else if (entity.type === 'ship') {
        const shipGraphics = renderShip(
          entity as Ship,
          centerX,
          centerY,
          kmToPx
        )
        appRef.current!.stage.addChild(shipGraphics)
      }
    })
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
