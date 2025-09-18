import type { ApiResponse } from '@space/api'
import type { WorldState } from '../game/world-state.js'
import { Ship } from '../game/entities/ship.js'

export const createShipFlyToHandler = (state: WorldState) => {
  return async (request: { ship_id: string; target_id: string }): Promise<ApiResponse> => {
    const ship = state.entities.find(
      (entity): entity is Ship => entity instanceof Ship && entity.id === request.ship_id
    )

    if (!ship) {
      return {
        success: false,
        error: 'Ship not found',
        code: 404,
      }
    }

    const destination = state.entities.find((entity) => entity.id === request.target_id)

    if (!destination) {
      return {
        success: false,
        error: 'Destination not found',
        code: 404,
      }
    }

    if (destination === ship) {
      return {
        success: false,
        error: 'Cannot fly to self',
        code: 400,
      }
    }

    ship.flyTo(destination)

    return {
      success: true,
      data: state,
    }
  }
}