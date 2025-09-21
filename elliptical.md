# Elliptical Orbit Implementation TODO

## Current System Analysis

- [x] Research existing circular orbit implementation
- [x] Understand current OrbitSchema structure (`average_radius_km`, `km_per_sec`, `current_angle_rad`)
- [x] Analyze movement calculation in entity `update(delta)` methods
- [x] Review client-side orbit rendering with `Graphics.circle()`

## 1. Schema & Type System Updates

### Create New Elliptical Orbit Schema

- [x] Create `packages/game/src/game/elliptical-orbit.ts`
- [x] Define `EllipticalOrbitSchema` with Zod validation:
  - [x] `parent_id: string`
  - [x] `semi_major_axis_km: number` (a - half the longest diameter)
  - [x] `eccentricity: number` (e - 0 = circle, 0.99 = very elliptical)
  - [x] `argument_of_periapsis_rad: number` (ω - rotation of ellipse)
  - [x] `mean_anomaly_at_epoch_rad: number` (M0 - starting position in orbit at epoch)
  - [x] `orbital_period_sec: number` (T - time for full orbit)
  - [x] `current_mean_anomaly_rad: number` (M - current position in orbit as mean anomaly)
- [x] Export `EllipticalOrbit` TypeScript type

### Update Orbit Type System

- [x] Create orbit type discriminator union in `packages/game/src/game/orbit.ts`
- [x] Add `orbit_type: "circular" | "elliptical"` field to both schemas
- [x] Create `OrbitSchema = CircularOrbitSchema | EllipticalOrbitSchema` union
- [x] Update existing `CircularOrbitSchema` to include `orbit_type: "circular"`
- [x] Update all entity schemas to use new union type

### Update Entity Schemas

- [x] Update `PlanetSchema` in `packages/game/src/game/planet.ts`
- [x] Update `MoonSchema` in `packages/game/src/game/moon.ts`
- [x] Update `AsteroidSchema` in `packages/game/src/game/asteroid.ts`
- [x] Ensure backward compatibility with existing circular orbits

## 2. Orbital Mathematics Implementation

### Create Orbital Calculation Utilities

- [x] Create `apps/server/src/game/util/orbital-math.ts`
- [x] Implement `solveKeplersEquation(meanAnomaly, eccentricity)` using Newton-Raphson
  - [x] Handle edge cases for very eccentric orbits
  - [x] Add iteration limit and convergence tolerance
- [x] Implement `calculateEllipticalPosition(ellipticalOrbit)`
  - [x] Use `current_mean_anomaly_rad` directly (already updated each frame)
  - [x] Solve for eccentric anomaly: `E` from `M = E - e*sin(E)`
  - [x] Calculate true anomaly: `v = 2*atan(sqrt((1+e)/(1-e)) * tan(E/2))`
  - [x] Calculate distance: `r = a * (1 - e*cos(E))`
  - [x] Calculate Cartesian position with rotation
- [x] Implement `updateMeanAnomaly(orbit, deltaSeconds)` helper
  - [x] Calculate mean motion: `n = 2π / orbital_period_sec`
  - [x] Update: `current_mean_anomaly_rad += n * deltaSeconds * GAME_SPEED`
  - [x] Wrap to keep between 0 and 2π
- [x] Add utility functions for orbital parameter validation

### Update Entity Movement Logic

- [x] Modify `Asteroid` class in `apps/server/src/game/entities/asteroid.ts`
  - [x] Add support for elliptical orbit configuration
  - [x] Update `update(delta)` method to handle both orbit types
  - [x] Use new orbital math utilities
  - [x] Maintain backward compatibility with circular orbits
- [ ] Update `Planet` class in `apps/server/src/game/entities/planet.ts`
- [ ] Update `Moon` class in `apps/server/src/game/entities/moon.ts`
- [ ] Ensure all entities can handle orbit type switching

## 3. Client-Side Rendering Updates

### Ellipse Rendering Implementation

- [x] Update `SolarSystemMap.tsx` in `apps/www/src/`
- [x] Create `renderEllipticalOrbit()` function
  - [x] Calculate ellipse parameters from orbital elements
  - [x] Handle ellipse rotation via argument of periapsis
  - [x] Use parametric drawing with lineTo for ellipse
  - [x] Apply proper scaling and positioning
- [x] Update existing orbit rendering logic to detect orbit type
- [x] Add visual differentiation between circular and elliptical orbits

### Visual Enhancements

- [ ] Add orbit direction indicators (arrows)
- [ ] Show orbital focus points for elliptical orbits
- [ ] Add option to toggle orbit visibility
- [ ] Implement orbit prediction paths

## 4. Testing & Validation

### Create Test Cases

- [ ] Create realistic elliptical asteroid orbits
  - [ ] Moderate eccentricity (e=0.1-0.3) for main belt asteroids
  - [ ] High eccentricity (e=0.7+) for comet-like orbits
  - [ ] Various orbital periods and sizes
- [ ] Test orbital parameter edge cases
  - [ ] Near-circular orbits (e ≈ 0)
  - [ ] Highly eccentric orbits (e ≈ 0.9)
  - [ ] Different argument of periapsis values
- [ ] Validate orbital mechanics accuracy
  - [ ] Check position calculations against reference implementations
  - [ ] Verify orbital period consistency
  - [ ] Test conservation of orbital energy

### Integration Testing

- [ ] Test backward compatibility with existing circular orbits
- [ ] Verify client-server orbit data synchronization
- [ ] Test performance with many elliptical orbits
- [ ] Validate rendering at different zoom levels

## 5. Example Implementation

### Sample Elliptical Asteroids

- [ ] Create "Halley-like" comet with high eccentricity (e=0.967)
- [ ] Add typical main belt asteroid with moderate eccentricity (e=0.15)
- [ ] Create near-Earth asteroid with crossing orbit (e=0.4)
- [ ] Add Trojan asteroid at Jupiter's L4/L5 points

### Configuration Examples

- [ ] Document orbital parameter relationships
- [ ] Provide realistic parameter ranges for different object types
- [ ] Create preset configurations for common orbit types

## 6. Documentation & Cleanup

### Code Documentation

- [ ] Add comprehensive JSDoc comments to orbital math functions
- [ ] Document orbital parameter meanings and valid ranges
- [ ] Create examples of elliptical orbit configurations
- [ ] Update existing orbit-related documentation

### Performance Optimization

- [ ] Profile elliptical orbit calculations
- [ ] Optimize Kepler's equation solver
- [ ] Cache frequently calculated values
- [ ] Consider using lookup tables for trigonometric functions

## 7. Future Enhancements (Optional)

### Advanced Features

- [ ] Support for orbital inclination (3D-like appearance in 2D)
- [ ] Orbital perturbations and multi-body effects
- [ ] Time-variable orbital elements
- [ ] Orbital resonances between objects

### User Interface

- [ ] Orbit editor for creating custom elliptical orbits
- [ ] Orbital information display panel
- [ ] Time controls for faster/slower orbital motion
- [ ] Orbit comparison tools

## Notes

- All calculations are 2D with sun at (0,0)
- Use realistic astronomical units and time scales
- Maintain existing game performance standards
- Ensure type safety throughout implementation
- Keep existing circular orbit functionality intact
- Track `current_mean_anomaly_rad` directly instead of absolute time for consistency with existing `current_angle_rad` pattern
