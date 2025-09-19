import type { ApiResponse } from '@space/api'
import type { WorldState } from '../game/world-state.js'

export const createShipFlyToHandler = (state: WorldState) => {
  return async (request: {
    ship_id: string
    target_id: string
  }): Promise<ApiResponse<WorldState>> => {
    const ship = state.ships[request.ship_id]

    if (!ship) {
      return {
        success: false,
        error: 'Ship not found',
        code: 404,
      }
    }

    // TODO: Support flying to types of bodies other than planets
    const destination = state.planets[request.target_id]

    if (!destination) {
      return {
        success: false,
        error: 'Destination not found',
        code: 404,
      }
    }

    ship.flyTo(destination)

    return {
      success: true,
      data: state,
    }
  }
}
