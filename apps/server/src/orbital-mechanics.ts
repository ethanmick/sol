// Orbital mechanics calculations as specified in v001.md

export interface OrbitConfig {
  centerX: number
  centerY: number
  radius: number
  omega: number // angular velocity (radians per second)
  phase: number // phase offset (radians)
}

export interface Position {
  x: number
  y: number
}

/**
 * Calculate orbital position at given time
 * pos(t) = center + R * [cos(ωt+φ), sin(ωt+φ)]
 */
export function calculateOrbitalPosition(
  orbit: OrbitConfig,
  currentTime: number,
  systemTimeOrigin: number
): Position {
  const t = (currentTime - systemTimeOrigin) / 1000 // Convert to seconds
  const angle = orbit.omega * t + orbit.phase

  return {
    x: orbit.centerX + orbit.radius * Math.cos(angle),
    y: orbit.centerY + orbit.radius * Math.sin(angle),
  }
}

/**
 * Calculate velocity vector for an orbiting body
 * velocity = R * ω * [-sin(ωt+φ), cos(ωt+φ)]
 */
export function calculateOrbitalVelocity(
  orbit: OrbitConfig,
  currentTime: number,
  systemTimeOrigin: number
): Position {
  const t = (currentTime - systemTimeOrigin) / 1000
  const angle = orbit.omega * t + orbit.phase
  const speed = orbit.radius * orbit.omega

  return {
    x: -speed * Math.sin(angle),
    y: speed * Math.cos(angle),
  }
}

/**
 * Calculate distance between two positions
 */
export function calculateDistance(pos1: Position, pos2: Position): number {
  const dx = pos2.x - pos1.x
  const dy = pos2.y - pos1.y
  return Math.sqrt(dx * dx + dy * dy)
}

/**
 * Normalize a vector to unit length
 */
export function normalize(vector: Position): Position {
  const magnitude = Math.sqrt(vector.x * vector.x + vector.y * vector.y)
  if (magnitude === 0) return { x: 0, y: 0 }

  return {
    x: vector.x / magnitude,
    y: vector.y / magnitude,
  }
}

/**
 * Calculate intercept course for ship to reach moving target
 * This is a simplified version - in reality would need more sophisticated targeting
 */
export function calculateInterceptCourse(
  shipPos: Position,
  targetPos: Position,
  targetVelocity: Position,
  shipSpeed: number
): Position | null {
  // Simple approach: aim for where target will be based on current trajectory
  const dx = targetPos.x - shipPos.x
  const dy = targetPos.y - shipPos.y
  const distance = Math.sqrt(dx * dx + dy * dy)

  if (distance === 0) return { x: 0, y: 0 }

  // Estimate time to intercept
  const timeToIntercept = distance / shipSpeed

  // Predicted target position
  const predictedTarget = {
    x: targetPos.x + targetVelocity.x * timeToIntercept,
    y: targetPos.y + targetVelocity.y * timeToIntercept,
  }

  // Direction to predicted target
  const interceptDx = predictedTarget.x - shipPos.x
  const interceptDy = predictedTarget.y - shipPos.y
  const interceptDistance = Math.sqrt(
    interceptDx * interceptDx + interceptDy * interceptDy
  )

  if (interceptDistance === 0) return { x: 0, y: 0 }

  return {
    x: interceptDx / interceptDistance,
    y: interceptDy / interceptDistance,
  }
}
