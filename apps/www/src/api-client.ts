import type { ApiRequest, ApiResponse, GameState } from '@space/api'

export class ApiClient {
  private baseUrl: string

  constructor(baseUrl: string = 'http://localhost:3000') {
    this.baseUrl = baseUrl
  }

  private async makeRequest(request: ApiRequest): Promise<ApiResponse> {
    const response = await fetch(`${this.baseUrl}/api`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(request),
    })

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`)
    }

    return response.json() as Promise<ApiResponse>
  }

  async getGameState(): Promise<GameState> {
    const response = await this.makeRequest({
      action: 'get_game_state',
    })

    if (!response.success) {
      throw new Error(response.error)
    }

    return response.data as GameState
  }

  async shipDepart(shipId: string, destNodeId: string): Promise<void> {
    const response = await this.makeRequest({
      action: 'ship_depart',
      ship_id: shipId,
      dest_node_id: destNodeId,
    })

    if (!response.success) {
      throw new Error(response.error)
    }
  }

  async shipBuy(shipId: string, units: number): Promise<void> {
    const response = await this.makeRequest({
      action: 'ship_buy',
      ship_id: shipId,
      units,
    })

    if (!response.success) {
      throw new Error(response.error)
    }
  }

  async shipSell(shipId: string, units: number): Promise<void> {
    const response = await this.makeRequest({
      action: 'ship_sell',
      ship_id: shipId,
      units,
    })

    if (!response.success) {
      throw new Error(response.error)
    }
  }

  async getSimulationStatus(): Promise<{ running: boolean; tick_rate: number; current_time: number }> {
    const response = await this.makeRequest({
      action: 'debug_simulation_status',
    })

    if (!response.success) {
      throw new Error(response.error)
    }

    return response.data as { running: boolean; tick_rate: number; current_time: number }
  }

  async startSimulation(): Promise<void> {
    const response = await this.makeRequest({
      action: 'debug_simulation_start',
    })

    if (!response.success) {
      throw new Error(response.error)
    }
  }

  async stopSimulation(): Promise<void> {
    const response = await this.makeRequest({
      action: 'debug_simulation_stop',
    })

    if (!response.success) {
      throw new Error(response.error)
    }
  }

  async tickSimulation(): Promise<void> {
    const response = await this.makeRequest({
      action: 'debug_simulation_tick',
    })

    if (!response.success) {
      throw new Error(response.error)
    }
  }
}

// Create a default client instance
export const apiClient = new ApiClient()