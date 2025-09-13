import { Application, Graphics, Text } from 'pixi.js'
import React, { useEffect, useRef } from 'react'
import { useGameState } from './GameContext'

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

    // Render first entity (the sun)
    const entity = gameState.entities[0]
    if (entity) {
      const nodeGraphics = new Graphics()
      nodeGraphics.circle(0, 0, 25)
      nodeGraphics.fill(0xffd700)
      nodeGraphics.position.set(
        window.innerWidth / 2 + entity.position.x,
        window.innerHeight / 2 + entity.position.y
      )

      const label = new Text({
        text: entity.name || '',
        style: {
          fontSize: 16,
          fill: 0xffffff,
        },
      })
      label.anchor.set(0.5)
      label.position.set(0, -40)
      nodeGraphics.addChild(label)

      appRef.current.stage.addChild(nodeGraphics)
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
