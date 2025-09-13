import { Viewport } from 'pixi-viewport'
import { Application, Container, Graphics, Text } from 'pixi.js'
import React, { useEffect, useRef, useState } from 'react'
import { useGameState } from './GameContext'

// Constants
const AU_TO_PX = 300 // 1 AU = 300 pixels

// LOD thresholds
const LOD_FAR = 0.75
const LOD_MID = 2.0

interface CelestialBody {
  name: string
  type: string
  au?: number
  orbitKm?: number
  parent?: string
}

interface InfoPanelProps {
  body: CelestialBody | null
  position: { x: number; y: number }
  onClose: () => void
}

const InfoPanel: React.FC<InfoPanelProps> = ({ body, position, onClose }) => {
  if (!body) return null

  return (
    <div
      style={{
        position: 'fixed',
        left: position.x + 10,
        top: position.y - 10,
        background: 'rgba(0, 0, 0, 0.9)',
        color: 'white',
        padding: '8px 12px',
        borderRadius: '4px',
        fontSize: '14px',
        zIndex: 1000,
        maxWidth: '200px',
      }}
    >
      <div style={{ fontWeight: 'bold', marginBottom: '4px' }}>{body.name}</div>
      <div>Type: {body.type}</div>
      {body.au && <div>Distance: {body.au} AU</div>}
      {body.orbitKm && <div>Orbit: {body.orbitKm.toLocaleString()} km</div>}
      <button
        onClick={onClose}
        style={{
          position: 'absolute',
          top: '2px',
          right: '4px',
          background: 'none',
          border: 'none',
          color: 'white',
          cursor: 'pointer',
          fontSize: '12px',
        }}
      >
        ×
      </button>
    </div>
  )
}

const SolarSystemMap: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const appRef = useRef<Application | null>(null)
  const viewportRef = useRef<Viewport | null>(null)
  const [selectedBody, setSelectedBody] = useState<CelestialBody | null>(null)
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 })

  const state = useGameState()

  // Containers for different layers
  const layersRef = useRef<{
    orbits?: Container
    planets?: Container
    moons?: Container
    asteroids?: Container
    ships?: Container
  }>({})

  useEffect(() => {
    if (!canvasRef.current) return

    const initPIXI = async () => {
      // Create PIXI application
      const app = new Application()
      await app.init({
        canvas: canvasRef.current!,
        width: window.innerWidth,
        height: window.innerHeight,
        background: 0x000000,
      })
      appRef.current = app

      // Create viewport
      const viewport = new Viewport({
        screenWidth: window.innerWidth,
        screenHeight: window.innerHeight,
        worldWidth: 20000,
        worldHeight: 20000,
        events: app.renderer.events,
      })
      viewportRef.current = viewport

      app.stage.addChild(viewport)

      // Enable viewport interactions
      viewport.drag().wheel().pinch().decelerate()

      // Center viewport on the sun
      viewport.moveCenter(0, 0)

      // Create layer containers
      layersRef.current = {
        orbits: new Container(),
        planets: new Container(),
        moons: new Container(),
        asteroids: new Container(),
        ships: new Container(),
      }

      // Add layers to viewport in order
      viewport.addChild(layersRef.current.orbits!)
      viewport.addChild(layersRef.current.planets!)
      viewport.addChild(layersRef.current.moons!)
      viewport.addChild(layersRef.current.asteroids!)
      viewport.addChild(layersRef.current.ships!)

      // Initial render will happen via useEffect when data arrives

      // Set up LOD system
      viewport.on('zoomed', updateLOD)
      updateLOD() // Initial LOD update

      // Handle window resize
      const handleResize = () => {
        app.renderer.resize(window.innerWidth, window.innerHeight)
        viewport.resize(window.innerWidth, window.innerHeight)
      }

      window.addEventListener('resize', handleResize)

      return () => {
        window.removeEventListener('resize', handleResize)
        app.destroy(true)
      }
    }

    const updateLOD = () => {
      if (!viewportRef.current || !layersRef.current) return

      const scale = viewportRef.current.scale.x

      // LOD_far: show only planets and ships
      if (scale < LOD_FAR) {
        layersRef.current.planets!.visible = true
        layersRef.current.moons!.visible = false
        layersRef.current.asteroids!.visible = false
        layersRef.current.ships!.visible = true
      }
      // LOD_mid: add moons, show some asteroids
      else if (scale < LOD_MID) {
        layersRef.current.planets!.visible = true
        layersRef.current.moons!.visible = true
        layersRef.current.asteroids!.visible = scale >= 1.2 // Named asteroids only
        layersRef.current.ships!.visible = true
      }
      // LOD_near: show everything
      else {
        layersRef.current.planets!.visible = true
        layersRef.current.moons!.visible = true
        layersRef.current.asteroids!.visible = true
        layersRef.current.ships!.visible = true
      }
    }

    initPIXI()

    return () => {
      if (appRef.current) {
        appRef.current.destroy(true)
      }
    }
  }, [])

  // Update visuals when server data changes
  useEffect(() => {
    if (layersRef.current.planets && nodes.length > 0) {
      // Clear existing graphics
      layersRef.current.planets?.removeChildren()
      layersRef.current.moons?.removeChildren()
      layersRef.current.asteroids?.removeChildren()
      layersRef.current.ships?.removeChildren()

      // Re-render with current data
      const updateVisuals = () => {
        const SERVER_AU_TO_UNITS = 15000
        const SCALE_FACTOR = AU_TO_PX / SERVER_AU_TO_UNITS

        nodes.forEach((node) => {
          if (!node.pos) return

          const x = node.pos.x * SCALE_FACTOR
          const y = node.pos.y * SCALE_FACTOR

          // Determine node type and visual properties
          const getNodeVisuals = (nodeName: string) => {
            if (nodeName.toLowerCase() === 'sun') {
              return {
                radius: 25,
                color: 0xffd700,
                type: 'Star',
                layer: 'planets',
                fontSize: 12,
              }
            } else if (nodeName.toLowerCase().includes('mercury')) {
              return {
                radius: 4,
                color: 0x8c7853,
                type: 'Planet',
                layer: 'planets',
                fontSize: 10,
              }
            } else if (nodeName.toLowerCase().includes('venus')) {
              return {
                radius: 5,
                color: 0xffc649,
                type: 'Planet',
                layer: 'planets',
                fontSize: 10,
              }
            } else if (nodeName.toLowerCase().includes('earth')) {
              return {
                radius: 6,
                color: 0x6b93d6,
                type: 'Planet',
                layer: 'planets',
                fontSize: 10,
              }
            } else if (nodeName.toLowerCase().includes('mars')) {
              return {
                radius: 5,
                color: 0xcd5c5c,
                type: 'Planet',
                layer: 'planets',
                fontSize: 10,
              }
            } else if (
              nodeName.toLowerCase().includes('luna') ||
              nodeName.toLowerCase().includes('moon')
            ) {
              return {
                radius: 3,
                color: 0xcccccc,
                type: 'Moon',
                layer: 'moons',
                fontSize: 8,
              }
            } else if (
              nodeName.toLowerCase().includes('phobos') ||
              nodeName.toLowerCase().includes('deimos')
            ) {
              return {
                radius: 2,
                color: 0xaaaaaa,
                type: 'Moon',
                layer: 'moons',
                fontSize: 8,
              }
            } else if (nodeName.toLowerCase().includes('station')) {
              return {
                radius: 4,
                color: 0x00ffff,
                type: 'Station',
                layer: 'asteroids',
                fontSize: 9,
              }
            } else {
              return {
                radius: 3,
                color: 0x888888,
                type: 'Unknown',
                layer: 'asteroids',
                fontSize: 8,
              }
            }
          }

          const visuals = getNodeVisuals(node.name)

          const nodeGraphics = new Graphics()
          if (visuals.type === 'Station') {
            // Draw stations as rectangles
            nodeGraphics.rect(
              -visuals.radius,
              -visuals.radius,
              visuals.radius * 2,
              visuals.radius * 2
            )
          } else {
            nodeGraphics.circle(0, 0, visuals.radius)
          }
          nodeGraphics.fill(visuals.color)
          nodeGraphics.position.set(x, y)
          nodeGraphics.eventMode = 'static'
          nodeGraphics.cursor = 'pointer'

          const label = new Text({
            text: node.name,
            style: {
              fontSize: visuals.fontSize,
              fill: 0xffffff,
            },
          })
          label.anchor.set(0.5)
          label.position.set(0, -visuals.radius - 15)

          // Moons and stations start with labels hidden
          if (visuals.type === 'Moon' || visuals.type === 'Station') {
            label.visible = false

            nodeGraphics.on('pointerover', () => {
              label.visible = true
            })

            nodeGraphics.on('pointerout', () => {
              label.visible = false
            })
          }

          nodeGraphics.addChild(label)

          nodeGraphics.on('pointertap', (event) => {
            const globalPos = event.global
            setMousePos({ x: globalPos.x, y: globalPos.y })

            // Calculate AU distance from center for display
            const distanceUnits = Math.sqrt(
              node.pos!.x * node.pos!.x + node.pos!.y * node.pos!.y
            )
            const distanceAU = distanceUnits / SERVER_AU_TO_UNITS

            setSelectedBody({
              name: node.name,
              type: visuals.type,
              au: visuals.type === 'Star' ? 0 : distanceAU,
            })
          })

          // Add to appropriate layer
          const targetLayer =
            layersRef.current[visuals.layer as keyof typeof layersRef.current]
          targetLayer?.addChild(nodeGraphics)
        })

        // Render ships

        ships.forEach((ship) => {
          if (!ship.pos) return

          const x = ship.pos.x * SCALE_FACTOR
          const y = ship.pos.y * SCALE_FACTOR

          const shipGraphics = new Graphics()
          shipGraphics.star(0, 0, 5, 6, 3)

          // Color ships based on their mode
          const shipColor = ship.mode === 'Docked' ? 0x00aa00 : 0x00ff00
          shipGraphics.fill(shipColor)

          shipGraphics.position.set(x, y)
          shipGraphics.eventMode = 'static'
          shipGraphics.cursor = 'pointer'

          const label = new Text({
            text: ship.id,
            style: {
              fontSize: 9,
              fill: shipColor,
            },
          })
          label.anchor.set(0.5)
          label.position.set(0, -15)
          shipGraphics.addChild(label)

          shipGraphics.on('pointertap', (event) => {
            const globalPos = event.global
            setMousePos({ x: globalPos.x, y: globalPos.y })
            setSelectedBody({
              name: ship.id,
              type: 'Ship',
            })
          })

          layersRef.current.ships?.addChild(shipGraphics)
        })
      }

      updateVisuals()
    }
  }, [nodes, ships])

  const handleCloseInfoPanel = () => {
    setSelectedBody(null)
  }

  return (
    <div
      style={{
        position: 'relative',
        width: '100vw',
        height: '100vh',
        overflow: 'hidden',
      }}
    >
      <canvas ref={canvasRef} />
      <InfoPanel
        body={selectedBody}
        position={mousePos}
        onClose={handleCloseInfoPanel}
      />
      <div
        style={{
          position: 'absolute',
          top: '10px',
          left: '10px',
          color: 'white',
          background: 'rgba(0, 0, 0, 0.7)',
          padding: '10px',
          borderRadius: '4px',
          fontSize: '12px',
        }}
      >
        <div>
          <strong>Solar System Map</strong>
        </div>
        <div>Mouse wheel: Zoom</div>
        <div>Drag: Pan</div>
        <div>Click: Info</div>
      </div>
    </div>
  )
}

export default SolarSystemMap
