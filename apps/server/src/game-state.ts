import type { Corporation, GameState, Node, Player, Ship } from '@space/api'

export const Constants = {
  MAX_CAPACITY: 20,
  SHIP_SPEED: 500, // units/sec
  DOCK_RADIUS: 2000, // units
  TICK_RATE: 1, // Hz
  SYSTEM_TIME_ORIGIN: Date.now(), // epoch for orbits
}

// In-memory game state
export class GameStateManager {
  private players = new Map<string, Player>()
  private corporations = new Map<string, Corporation>()
  private ships = new Map<string, Ship>()
  private nodes = new Map<
    string,
    Omit<Node, 'pos'> & { pos?: { x: number; y: number } }
  >()

  // Simulation time tracking
  private simulationTime = 0 // Time in seconds since simulation started
  private lastRealTime = Date.now()

  // Ephemeral state (not persisted)
  private destAssignments = new Map<string, string>() // ship_id -> dest_node_id
  private lastPriceUpdate = 0

  constructor() {
    this.initializeTestData()
  }

  // Initialize solar system data
  private initializeTestData() {
    // Scale factor: SolarSystemMap uses 300px per AU, server uses larger units
    const AU_TO_UNITS = 15000 // Scale factor for server coordinates

    // Create test player
    const player: Player = {
      id: 'player-1',
      username: 'TestPilot',
    }
    this.players.set(player.id, player)

    // Create test corporation
    const corp: Corporation = {
      id: 'corp-1',
      player_id: player.id,
      credits: 10000,
    }
    this.corporations.set(corp.id, corp)

    // Create test ship (starts docked at Earth)
    const ship: Ship = {
      id: 'ship-1',
      player_id: player.id,
      corp_id: corp.id,
      mode: 'Docked',
      pos: { x: 0, y: 0 }, // Will be updated to Earth position
      cargo_units: 0,
    }
    this.ships.set(ship.id, ship)

    // Solar system nodes
    const nodes: Array<
      Omit<Node, 'pos'> & {
        orbit?: {
          centerX: number
          centerY: number
          radius: number
          omega: number
          phase: number
        }
      }
    > = [
      // Sun (stationary at center)
      {
        id: 'sun',
        name: 'Sun',
        price: 150, // High energy prices
      },
      // Mercury
      {
        id: 'mercury',
        name: 'Mercury',
        price: 180, // Expensive due to harsh conditions
        orbit: {
          centerX: 0,
          centerY: 0,
          radius: 0.39 * AU_TO_UNITS,
          omega: 0.2, // Fast orbit
          phase: 0,
        },
      },
      // Venus
      {
        id: 'venus',
        name: 'Venus',
        price: 160, // Atmospheric processing stations
        orbit: {
          centerX: 0,
          centerY: 0,
          radius: 0.72 * AU_TO_UNITS,
          omega: 0.15,
          phase: Math.PI / 3,
        },
      },
      // Earth
      {
        id: 'earth',
        name: 'Earth',
        price: 100, // Standard baseline pricing
        orbit: {
          centerX: 0,
          centerY: 0,
          radius: 1.0 * AU_TO_UNITS,
          omega: 0.1,
          phase: Math.PI,
        },
      },
      // Mars
      {
        id: 'mars',
        name: 'Mars',
        price: 120, // Colonial supplies
        orbit: {
          centerX: 0,
          centerY: 0,
          radius: 1.52 * AU_TO_UNITS,
          omega: 0.08,
          phase: Math.PI / 2,
        },
      },
      // Earth's Moon
      {
        id: 'luna',
        name: 'Luna',
        price: 90, // Mining operations
        orbit: {
          centerX: 1.0 * AU_TO_UNITS, // Orbits around Earth's position
          centerY: 0,
          radius: 2000, // Much smaller orbit around Earth
          omega: 2.0, // Fast lunar orbit
          phase: 0,
        },
      },
      // Mars moons
      {
        id: 'phobos',
        name: 'Phobos',
        price: 110,
        orbit: {
          centerX: 1.52 * AU_TO_UNITS, // Orbits around Mars
          centerY: 0,
          radius: 800,
          omega: 5.0, // Very fast orbit
          phase: 0,
        },
      },
      {
        id: 'deimos',
        name: 'Deimos',
        price: 105,
        orbit: {
          centerX: 1.52 * AU_TO_UNITS, // Orbits around Mars
          centerY: 0,
          radius: 1200,
          omega: 3.0, // Slower than Phobos
          phase: Math.PI,
        },
      },
      // Earth space stations
      {
        id: 'earth-station-1',
        name: 'Terra Station Alpha',
        price: 95,
        orbit: {
          centerX: 1.0 * AU_TO_UNITS,
          centerY: 0,
          radius: 3000, // Slightly farther than Luna
          omega: 1.5,
          phase: 0,
        },
      },
      {
        id: 'earth-station-2',
        name: 'Terra Station Beta',
        price: 98,
        orbit: {
          centerX: 1.0 * AU_TO_UNITS,
          centerY: 0,
          radius: 3500,
          omega: 1.2,
          phase: (2 * Math.PI) / 3,
        },
      },
      {
        id: 'earth-station-3',
        name: 'Terra Station Gamma',
        price: 92,
        orbit: {
          centerX: 1.0 * AU_TO_UNITS,
          centerY: 0,
          radius: 4000,
          omega: 1.0,
          phase: (4 * Math.PI) / 3,
        },
      },
    ]

    nodes.forEach((node) => {
      const { orbit, ...nodeData } = node
      this.nodes.set(node.id, nodeData)
    })
  }

  // Advance simulation time (called by simulation engine each tick)
  advanceTime(deltaTimeSeconds: number) {
    this.simulationTime += deltaTimeSeconds
  }

  // Get current game state snapshot
  getGameState(): GameState {
    const now = Date.now()

    // Update node positions based on simulation time
    this.updateNodePositions(this.simulationTime)

    return {
      server_time: now,
      tick_rate: Constants.TICK_RATE,
      players: Array.from(this.players.values()),
      corporations: Array.from(this.corporations.values()),
      ships: Array.from(this.ships.values()),
      nodes: Array.from(this.nodes.values()).map((node) => ({
        ...node,
        pos: node.pos || { x: 0, y: 0 },
      })) as Node[],
    }
  }

  // Update node positions based on orbital mechanics
  private updateNodePositions(simulationTime: number) {
    const t = simulationTime // Use simulation time directly (already in seconds)
    const AU_TO_UNITS = 15000 // Same scale factor as initialization

    const orbitalConfigs = [
      { nodeId: 'sun', orbit: null }, // Stationary
      {
        nodeId: 'mercury',
        orbit: {
          centerX: 0,
          centerY: 0,
          radius: 0.39 * AU_TO_UNITS,
          omega: 0.2,
          phase: 0,
        },
      },
      {
        nodeId: 'venus',
        orbit: {
          centerX: 0,
          centerY: 0,
          radius: 0.72 * AU_TO_UNITS,
          omega: 0.15,
          phase: Math.PI / 3,
        },
      },
      {
        nodeId: 'earth',
        orbit: {
          centerX: 0,
          centerY: 0,
          radius: 1.0 * AU_TO_UNITS,
          omega: 0.1,
          phase: Math.PI,
        },
      },
      {
        nodeId: 'mars',
        orbit: {
          centerX: 0,
          centerY: 0,
          radius: 1.52 * AU_TO_UNITS,
          omega: 0.08,
          phase: Math.PI / 2,
        },
      },
      {
        nodeId: 'luna',
        orbit: {
          centerX: 1.0 * AU_TO_UNITS,
          centerY: 0,
          radius: 2000,
          omega: 2.0,
          phase: 0,
        },
      },
      {
        nodeId: 'phobos',
        orbit: {
          centerX: 1.52 * AU_TO_UNITS,
          centerY: 0,
          radius: 800,
          omega: 5.0,
          phase: 0,
        },
      },
      {
        nodeId: 'deimos',
        orbit: {
          centerX: 1.52 * AU_TO_UNITS,
          centerY: 0,
          radius: 1200,
          omega: 3.0,
          phase: Math.PI,
        },
      },
      {
        nodeId: 'earth-station-1',
        orbit: {
          centerX: 1.0 * AU_TO_UNITS,
          centerY: 0,
          radius: 3000,
          omega: 1.5,
          phase: 0,
        },
      },
      {
        nodeId: 'earth-station-2',
        orbit: {
          centerX: 1.0 * AU_TO_UNITS,
          centerY: 0,
          radius: 3500,
          omega: 1.2,
          phase: (2 * Math.PI) / 3,
        },
      },
      {
        nodeId: 'earth-station-3',
        orbit: {
          centerX: 1.0 * AU_TO_UNITS,
          centerY: 0,
          radius: 4000,
          omega: 1.0,
          phase: (4 * Math.PI) / 3,
        },
      },
    ]

    // First pass: update planets and stationary objects
    orbitalConfigs.forEach(({ nodeId, orbit }) => {
      const node = this.nodes.get(nodeId)
      if (!node) return

      // Skip moon/station objects in first pass
      if (
        nodeId.includes('luna') ||
        nodeId.includes('phobos') ||
        nodeId.includes('deimos') ||
        nodeId.includes('station')
      ) {
        return
      }

      if (!orbit) {
        // Stationary sun
        node.pos = { x: 0, y: 0 }
      } else {
        // Orbital mechanics: pos(t) = center + R * [cos(ωt+φ), sin(ωt+φ)]
        const angle = orbit.omega * t + orbit.phase
        node.pos = {
          x: orbit.centerX + orbit.radius * Math.cos(angle),
          y: orbit.centerY + orbit.radius * Math.sin(angle),
        }
      }
    })

    // Second pass: update moons and stations that orbit around planets
    const earthNode = this.nodes.get('earth')
    const marsNode = this.nodes.get('mars')

    if (earthNode?.pos) {
      // Luna orbits Earth
      const lunaNode = this.nodes.get('luna')
      if (lunaNode) {
        const angle = 2.0 * t + 0
        lunaNode.pos = {
          x: earthNode.pos.x + 2000 * Math.cos(angle),
          y: earthNode.pos.y + 2000 * Math.sin(angle),
        }
      }

      // Earth stations orbit Earth
      const station1 = this.nodes.get('earth-station-1')
      if (station1) {
        const angle = 1.5 * t + 0
        station1.pos = {
          x: earthNode.pos.x + 3000 * Math.cos(angle),
          y: earthNode.pos.y + 3000 * Math.sin(angle),
        }
      }

      const station2 = this.nodes.get('earth-station-2')
      if (station2) {
        const angle = 1.2 * t + (2 * Math.PI) / 3
        station2.pos = {
          x: earthNode.pos.x + 3500 * Math.cos(angle),
          y: earthNode.pos.y + 3500 * Math.sin(angle),
        }
      }

      const station3 = this.nodes.get('earth-station-3')
      if (station3) {
        const angle = 1.0 * t + (4 * Math.PI) / 3
        station3.pos = {
          x: earthNode.pos.x + 4000 * Math.cos(angle),
          y: earthNode.pos.y + 4000 * Math.sin(angle),
        }
      }
    }

    if (marsNode?.pos) {
      // Mars moons orbit Mars
      const phobosNode = this.nodes.get('phobos')
      if (phobosNode) {
        const angle = 5.0 * t + 0
        phobosNode.pos = {
          x: marsNode.pos.x + 800 * Math.cos(angle),
          y: marsNode.pos.y + 800 * Math.sin(angle),
        }
      }

      const deimosNode = this.nodes.get('deimos')
      if (deimosNode) {
        const angle = 3.0 * t + Math.PI
        deimosNode.pos = {
          x: marsNode.pos.x + 1200 * Math.cos(angle),
          y: marsNode.pos.y + 1200 * Math.sin(angle),
        }
      }
    }
  }

  // Update ship positions and handle movement
  updateShips(deltaTime: number) {
    const currentTime = Date.now()

    for (const ship of this.ships.values()) {
      if (ship.mode === 'Docked') {
        // Docked ships follow their node's position
        const dockedNodeId = this.getDockedNodeId(ship)
        if (dockedNodeId) {
          const node = this.nodes.get(dockedNodeId)
          if (node?.pos) {
            ship.pos = { ...node.pos }
          }
        }
      } else if (ship.mode === 'Flight') {
        // Flight ships move toward destination
        const destNodeId = this.destAssignments.get(ship.id)
        if (destNodeId) {
          const destNode = this.nodes.get(destNodeId)
          if (destNode?.pos) {
            this.moveShipToward(ship, destNode.pos, deltaTime)

            // Check if ship has arrived
            const distance = this.calculateDistance(ship.pos, destNode.pos)
            if (distance <= Constants.DOCK_RADIUS) {
              ship.mode = 'Docked'
              ship.pos = { ...destNode.pos }
              this.destAssignments.delete(ship.id)
              console.log(`Ship ${ship.id} arrived at ${destNodeId}`)
            }
          }
        }
      }
    }
  }

  // Move ship toward destination
  private moveShipToward(
    ship: Ship,
    targetPos: { x: number; y: number },
    deltaTime: number
  ) {
    const dx = targetPos.x - ship.pos.x
    const dy = targetPos.y - ship.pos.y
    const distance = Math.sqrt(dx * dx + dy * dy)

    if (distance > 0) {
      const normalizedX = dx / distance
      const normalizedY = dy / distance
      const moveDistance = Constants.SHIP_SPEED * deltaTime

      ship.pos.x += normalizedX * moveDistance
      ship.pos.y += normalizedY * moveDistance
    }
  }

  // Calculate distance between two points
  private calculateDistance(
    pos1: { x: number; y: number },
    pos2: { x: number; y: number }
  ): number {
    const dx = pos2.x - pos1.x
    const dy = pos2.y - pos1.y
    return Math.sqrt(dx * dx + dy * dy)
  }

  // Update commodity prices with bounded random walk
  updatePrices() {
    if (true) {
      return // Not time for price update yet
    }

    this.lastPriceUpdate = this.simulationTime

    for (const node of this.nodes.values()) {
      // Bounded random walk: ±10% change, with bounds [50, 200]
      const changePercent = (Math.random() - 0.5) * 0.2 // ±10%
      const newPrice = node.price * (1 + changePercent)
      node.price = Math.max(50, Math.min(200, newPrice))
    }
  }

  // Ship departure command
  departShip(shipId: string, destNodeId: string): boolean {
    const ship = this.ships.get(shipId)
    const destNode = this.nodes.get(destNodeId)

    if (!ship || !destNode || ship.mode !== 'Docked') {
      return false
    }

    ship.mode = 'Flight'
    this.destAssignments.set(shipId, destNodeId)
    console.log(`Ship ${shipId} departing for ${destNodeId}`)
    return true
  }

  // Buy goods command
  buyGoods(shipId: string, units: number): boolean {
    const ship = this.ships.get(shipId)
    if (!ship || ship.mode !== 'Docked') return false

    const dockedNodeId = this.getDockedNodeId(ship)
    if (!dockedNodeId) return false

    const node = this.nodes.get(dockedNodeId)
    const corp = this.corporations.get(ship.corp_id)
    if (!node || !corp) return false

    // Check capacity and credits
    if (ship.cargo_units + units > Constants.MAX_CAPACITY) return false

    const totalCost = units * node.price
    if (corp.credits < totalCost) return false

    // Execute trade
    ship.cargo_units += units
    corp.credits -= totalCost
    console.log(
      `Ship ${shipId} bought ${units} units at ${node.name} for ${totalCost}`
    )
    return true
  }

  // Sell goods command
  sellGoods(shipId: string, units: number): boolean {
    const ship = this.ships.get(shipId)
    if (!ship || ship.mode !== 'Docked') return false

    const dockedNodeId = this.getDockedNodeId(ship)
    if (!dockedNodeId) return false

    const node = this.nodes.get(dockedNodeId)
    const corp = this.corporations.get(ship.corp_id)
    if (!node || !corp) return false

    // Check cargo
    if (ship.cargo_units < units) return false

    // Execute trade
    const totalEarnings = units * node.price
    ship.cargo_units -= units
    corp.credits += totalEarnings
    console.log(
      `Ship ${shipId} sold ${units} units at ${node.name} for ${totalEarnings}`
    )
    return true
  }

  // Helper to determine which node a docked ship is at
  private getDockedNodeId(ship: Ship): string | null {
    // For simplicity, find the closest node (in docked state they should be exactly at node position)
    let closestNodeId = null
    let minDistance = Infinity

    for (const [nodeId, node] of this.nodes.entries()) {
      if (node.pos) {
        const distance = this.calculateDistance(ship.pos, node.pos)
        if (distance < minDistance) {
          minDistance = distance
          closestNodeId = nodeId
        }
      }
    }

    return closestNodeId
  }

  // Get ship by ID
  getShip(id: string): Ship | undefined {
    return this.ships.get(id)
  }

  // Get corporation by ID
  getCorporation(id: string): Corporation | undefined {
    return this.corporations.get(id)
  }

  // Get node by ID
  getNode(
    id: string
  ): (Omit<Node, 'pos'> & { pos?: { x: number; y: number } }) | undefined {
    return this.nodes.get(id)
  }
}

// Global game state instance
export const gameState = new GameStateManager()
