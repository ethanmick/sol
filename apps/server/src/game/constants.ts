export const Constants = {
  /** Number of kilometers in a single Astronomical Unit (mean Earth→Sun distance). */
  KM_PER_AU: 149_597_870.7,
  // Global time scale multiplier so planetary periods remain proportional but playable.
  // TODO: Expose this as part of a pacing/fast-forward config once UX is defined.
  GAME_SPEED: 100_000,
  /** Ship cruise speed expressed in km per second before time acceleration is applied. */
  // TODO: Replace this placeholder once we model thrust/acceleration curves.
  SHIP_SPEED_KM_PER_S: 30,
  /** Distance (km) at which we consider a ship to have reached its destination. */
  ARRIVAL_TOLERANCE_KM: 50_000,
}
