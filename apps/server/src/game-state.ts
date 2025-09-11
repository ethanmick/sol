import type { Corporation, GameState, Node, Player, Ship } from '@space/api'

// Global constants from v001.md
export const CONSTANTS = {
  MAX_CAPACITY: 20,
  SHIP_SPEED: 500, // units/sec
  DOCK_RADIUS: 2000, // units
  TICK_RATE: 5, // Hz
  PRICE_TICK_INTERVAL: 30, // seconds
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

  // Ephemeral state (not persisted)
  private destAssignments = new Map<string, string>() // ship_id -> dest_node_id
  private lastPriceUpdate = 0

  constructor() {
    this.initializeTestData()
  }

  // Initialize test data as specified in v001.md
  private initializeTestData() {
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

    // Create test ship (starts docked at first node)
    const ship: Ship = {
      id: 'ship-1',
      player_id: player.id,
      corp_id: corp.id,
      mode: 'Docked',
      pos: { x: 0, y: 0 }, // Will be updated to node position
      cargo_units: 0,
    }
    this.ships.set(ship.id, ship)

    // Create 5 starter nodes (2 orbital, 1 stationary hub, 2 more orbital)
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
      {
        id: 'node-hub',
        name: 'Central Hub',
        price: 100,
        // Stationary hub (no orbit)
      },
      {
        id: 'node-planet-1',
        name: 'Verdant Prime',
        price: 80,
        orbit: { centerX: 0, centerY: 0, radius: 5000, omega: 0.1, phase: 0 },
      },
      {
        id: 'node-planet-2',
        name: 'Crimson Station',
        price: 120,
        orbit: {
          centerX: 0,
          centerY: 0,
          radius: 8000,
          omega: 0.08,
          phase: Math.PI,
        },
      },
      {
        id: 'node-planet-3',
        name: 'Azure Colony',
        price: 90,
        orbit: {
          centerX: 0,
          centerY: 0,
          radius: 12000,
          omega: 0.06,
          phase: Math.PI / 2,
        },
      },
      {
        id: 'node-planet-4',
        name: 'Golden Outpost',
        price: 110,
        orbit: {
          centerX: 0,
          centerY: 0,
          radius: 15000,
          omega: 0.05,
          phase: (3 * Math.PI) / 2,
        },
      },
    ]

    nodes.forEach((node) => {
      const { orbit, ...nodeData } = node
      this.nodes.set(node.id, nodeData)
    })
  }

  // Get current game state snapshot
  getGameState(): GameState {
    const now = Date.now()

    // Update node positions based on current time
    this.updateNodePositions(now)

    return {
      server_time: now,
      tick_rate: CONSTANTS.TICK_RATE,
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
  private updateNodePositions(currentTime: number) {
    const t = (currentTime - CONSTANTS.SYSTEM_TIME_ORIGIN) / 1000 // Convert to seconds

    const orbitalConfigs = [
      { nodeId: 'node-hub', orbit: null }, // Stationary
      {
        nodeId: 'node-planet-1',
        orbit: { centerX: 0, centerY: 0, radius: 5000, omega: 0.1, phase: 0 },
      },
      {
        nodeId: 'node-planet-2',
        orbit: {
          centerX: 0,
          centerY: 0,
          radius: 8000,
          omega: 0.08,
          phase: Math.PI,
        },
      },
      {
        nodeId: 'node-planet-3',
        orbit: {
          centerX: 0,
          centerY: 0,
          radius: 12000,
          omega: 0.06,
          phase: Math.PI / 2,
        },
      },
      {
        nodeId: 'node-planet-4',
        orbit: {
          centerX: 0,
          centerY: 0,
          radius: 15000,
          omega: 0.05,
          phase: (3 * Math.PI) / 2,
        },
      },
    ]

    orbitalConfigs.forEach(({ nodeId, orbit }) => {
      const node = this.nodes.get(nodeId)
      if (!node) return

      if (!orbit) {
        // Stationary hub
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
            if (distance <= CONSTANTS.DOCK_RADIUS) {
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
      const moveDistance = CONSTANTS.SHIP_SPEED * deltaTime

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
  updatePrices(currentTime: number) {
    if (
      currentTime - this.lastPriceUpdate <
      CONSTANTS.PRICE_TICK_INTERVAL * 1000
    ) {
      return // Not time for price update yet
    }

    this.lastPriceUpdate = currentTime

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
    if (ship.cargo_units + units > CONSTANTS.MAX_CAPACITY) return false

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
