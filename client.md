# Pixi.js Map Implementation Plan

## Overview

Based on research, Pixi.js can handle all the requested map features. The best approach is to use the `pixi-viewport` library, which provides a comprehensive solution for interactive 2D camera controls.

## Feature Assessment & Implementation

### 1. Panning (Click & Drag) ✅ **Fully Supported**

- **Solution**: `pixi-viewport` package provides drag functionality out of the box
- **Implementation**: `viewport.drag()` enables panning with momentum and deceleration
- **Conflict handling**: When dragging objects vs map, temporarily disable viewport dragging during object interaction

### 2. Zooming with Min/Max Limits ✅ **Fully Supported**

- **Solution**: `pixi-viewport` has built-in zoom constraints
- **Implementation**:
  - `viewport.wheel()` for mouse wheel zooming
  - `viewport.pinch()` for touch pinch-to-zoom
  - Set `minWidth/minHeight` and `maxWidth/maxHeight` for zoom limits
- **Zoom to cursor**: Built-in support for zooming toward mouse position

### 3. Map Bounds ✅ **Fully Supported**

- **Solution**: `pixi-viewport` clamp plugin prevents panning outside defined area
- **Implementation**: `viewport.clamp({ left, right, top, bottom })`
- **Alternative**: Pixi.js native bounds/masking for more complex boundary shapes

### 4. Level of Detail (LOD) Rendering ⚠️ **Manual Implementation Required**

- **Current capability**: No built-in LOD system in Pixi.js
- **Solution**: Manual asset swapping based on zoom level
- **Implementation approach**:
  - Listen to viewport scale changes
  - Define zoom thresholds (e.g., 1x, 2x, 4x)
  - Swap sprite textures when crossing thresholds
  - Use texture atlases or separate asset files for different detail levels

## Recommended Architecture

```typescript
// Core setup
const viewport = new Viewport({
  screenWidth: window.innerWidth,
  screenHeight: window.innerHeight,
  worldWidth: WORLD_WIDTH,
  worldHeight: WORLD_HEIGHT,
  events: app.renderer.events,
})

// Enable features
viewport
  .drag({ mouseButtons: 'left' })
  .wheel({ smooth: 3 })
  .clamp({
    left: 0,
    top: 0,
    right: WORLD_WIDTH,
    bottom: WORLD_HEIGHT,
  })
  .clampZoom({
    minWidth: MIN_ZOOM_WIDTH,
    maxWidth: MAX_ZOOM_WIDTH,
  })

// LOD system
viewport.on('zoomed', () => {
  const scale = viewport.scale.x
  updateLOD(scale)
})

function updateLOD(scale: number) {
  objects.forEach((obj) => {
    if (scale < 1) {
      obj.texture = lowDetailTexture
    } else if (scale < 2) {
      obj.texture = mediumDetailTexture
    } else {
      obj.texture = highDetailTexture
    }
  })
}
```

## Dependencies Required

- `pixi-viewport`: Primary package for camera controls
- Current `pixi.js`: Already in use

## Implementation Complexity

- **Low**: Panning, zooming, bounds (using pixi-viewport)
- **Medium**: LOD system (custom implementation)

## Performance Considerations

- Use `cacheAsBitmap` for static content
- Implement culling for off-screen objects
- Consider using texture atlases for LOD assets
- Batch sprite updates during LOD transitions

## Conclusion

Pixi.js + pixi-viewport can handle all requirements effectively. The only custom work needed is the LOD system, which is straightforward to implement with zoom event listeners and texture swapping.
