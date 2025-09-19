import type { ApiResponse, Method, Req, Res } from '@space/api'
import type { WorldState } from '@space/game'

export class ApiClient {
  private baseUrl: string

  constructor(baseUrl: string = 'http://localhost:3000') {
    this.baseUrl = baseUrl
  }

  private async call<M extends Method>(
    method: M,
    params: Req<M> = {}
  ): Promise<Res<M>> {
    const response = await fetch(`${this.baseUrl}/rpc`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ method, params }),
    })

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`)
    }

    const result = (await response.json()) as ApiResponse<Res<M>>

    if (!result.success) {
      throw new Error(result.error)
    }

    return result.data
  }

  async getGameState(): Promise<WorldState> {
    return this.call('get_game_state')
  }

  async shipFlyTo(ship_id: string, target_id: string): Promise<WorldState> {
    return this.call('ship_fly_to', { ship_id, target_id })
  }
}

export const apiClient = new ApiClient()
