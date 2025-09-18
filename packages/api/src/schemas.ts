import { WorldStateSchema } from '@space/game'
import { z } from 'zod'

export const rpc = {
  get_game_state: {
    req: z.object({}),
    res: WorldStateSchema,
  },
  ship_fly_to: {
    req: z.object({
      ship_id: z.string(),
      target_id: z.string(),
    }),
    res: WorldStateSchema,
  },
} as const

export type Rpc = typeof rpc
export type Method = keyof Rpc

export type Req<M extends Method> = z.infer<Rpc[M]['req']>
export type Res<M extends Method> = z.infer<Rpc[M]['res']>

export type RpcHandler = <M extends Method>(
  method: M,
  input: Req<M>
) => Promise<Res<M>>

export type ApiResponse<T = any> =
  | {
      success: true
      data: T
    }
  | {
      success: false
      error: string
      code?: number
    }
