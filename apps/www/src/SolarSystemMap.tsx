import type { Star } from '@space/game'
import { Application, Graphics, Text } from 'pixi.js'
import React, { useEffect, useRef } from 'react'
import { useGameState } from './GameContext'

// Render method for star entities
const renderStar = (
  entity: Star,
  centerX: number,
  centerY: number
): Graphics => {
  const nodeGraphics = new Graphics()
  nodeGraphics.circle(0, 0, 25)
  nodeGraphics.fill(0xffd700)
  nodeGraphics.position.set(
    centerX + entity.position.x,
    centerY + entity.position.y
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

    // Clear existing graphics
    appRef.current.stage.removeChildren()

    // Render entities using appropriate render methods
    gameState.entities.forEach((entity) => {
      if (entity.type === 'star') {
        const starGraphics = renderStar(
          entity as Star,
          window.innerWidth / 2,
          window.innerHeight / 2
        )
        appRef.current!.stage.addChild(starGraphics)
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
