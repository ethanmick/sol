export const Constants = {
  // Global time scale multiplier so planetary periods remain proportional but playable.
  // TODO: Expose this as part of a pacing/fast-forward config once UX is defined.
  GAME_SPEED: 300_000,
  /** Ship cruise speed expressed in km per second before time acceleration is applied. */
  // TODO: Replace this placeholder once we model thrust/acceleration curves.
  SHIP_SPEED_KM_PER_S: 30,
  /** Distance (km) at which we consider a ship to have reached its destination. */
  ARRIVAL_TOLERANCE_KM: 50_000,
}
