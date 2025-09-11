import { gameState, CONSTANTS } from './game-state.js'

export class SimulationEngine {
  private running = false
  private lastTickTime = 0
  private intervalHandle: NodeJS.Timeout | null = null

  constructor() {
    this.lastTickTime = Date.now()
  }

  start() {
    if (this.running) return
    
    this.running = true
    this.lastTickTime = Date.now()
    
    console.log(`Starting simulation at ${CONSTANTS.TICK_RATE} Hz`)
    
    // Run tick loop at specified rate (5 Hz = 200ms intervals)
    const tickInterval = 1000 / CONSTANTS.TICK_RATE
    this.intervalHandle = setInterval(() => {
      this.tick()
    }, tickInterval)
  }

  stop() {
    if (!this.running) return
    
    this.running = false
    if (this.intervalHandle) {
      clearInterval(this.intervalHandle)
      this.intervalHandle = null
    }
    
    console.log('Simulation stopped')
  }

  private tick() {
    const now = Date.now()
    const deltaTime = (now - this.lastTickTime) / 1000 // Convert to seconds
    this.lastTickTime = now

    try {
      // Tick Pipeline as specified in v001.md:
      
      // 1. Advance Time - already done with 'now'
      
      // 2. Update Nodes - positions computed in gameState.getGameState()
      //    Price updates handled separately
      gameState.updatePrices(now)
      
      // 3. Integrate Ships - update positions based on movement
      gameState.updateShips(deltaTime)
      
      // 4. Arrival Checks - handled in updateShips()
      
      // 5. Encounter Phase - NOT IMPLEMENTED (marked as "NOT DOING FOR NOW" in v001.md)
      
      // 6. Event Dispatch - state changes are immediately available via getGameState()
      
      // 7. Housekeeping - could add connection cleanup, caching limits here
      this.housekeeping()
      
    } catch (error) {
      console.error('Error in simulation tick:', error)
    }
  }

  private housekeeping() {
    // Placeholder for future housekeeping tasks:
    // - Cull idle connections
    // - Clean bounded caches  
    // - Log statistics
    // - Memory cleanup
  }

  isRunning(): boolean {
    return this.running
  }

  // Get current tick rate
  getTickRate(): number {
    return CONSTANTS.TICK_RATE
  }

  // Force a single tick (useful for testing)
  forceTick() {
    this.tick()
  }
}

// Global simulation instance
export const simulation = new SimulationEngine()