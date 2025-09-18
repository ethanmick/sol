import type { ApiResponse } from '@space/api'
import type { WorldState } from '../game/world-state.js'

export const createGetGameStateHandler = (state: WorldState) => {
  return async (): Promise<ApiResponse> => {
    return {
      success: true,
      data: state,
    }
  }
}
