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

}

// Create a default client instance
export const apiClient = new ApiClient()