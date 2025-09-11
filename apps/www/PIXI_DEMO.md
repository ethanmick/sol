implementation.md — Solar System Map (PixiJS)

Scope (MVP)
• Single 2D static map with black background.
• Pan/zoom (mouse wheel, drag, pinch), click objects for details, show ships.
• Level of detail (LOD) by zoom:
• Far: Sun + 8 planets + your ships.
• Mid: add major moons.
• Near: add asteroid belt (field + big asteroids) and other small objects.

Dependencies
• pixi.js (renderer, shapes, interactivity). ￼ ￼
• pixi-viewport (camera: drag, wheel, pinch, follow). ￼ ￼

Coordinate system & scale (consistent)
• World origin (0,0) at the Sun.
• X-axis = ecliptic radial line; place planets on +X at their semi-major axis (average Sun–planet distance).
• Distance scale: 1 AU = 300 px. 1 AU = 149,597,870.7 km. So KM*TO_PX = km * (1/149,597,870.7) \_ 300. ￼
• Size rendering: Planet/moon circle sizes are display sizes (clamped for visibility); distances stay physical at the AU scale above.

Why 300 px/AU? Neptune (~30 AU) sits ~9,000 px from the Sun; full map fits in ~20k px with margin, yet you can zoom deep enough to resolve moons.

Data (authoritative minima)

Planets (semi-major axes)

Use these AU distances (rounded) for X positions:
• Mercury 0.39, Venus 0.72, Earth 1.00, Mars 1.52, Jupiter 5.20, Saturn 9.58, Uranus 19.20, Neptune 30.07. ￼ ￼

Major moons (mean orbital distance from planet center; convert km→AU→px)
• Earth: Moon ~384,400 km. ￼ ￼
• Mars: Phobos ~9,377 km; Deimos ~23,460 km. (NASA cites ~6,000 km above surface for Phobos; mean orbital distance is ~9,377 km.) ￼ ￼
• Jupiter (Galileans): Io ~422,000 km; Europa ~671,000 km; Ganymede ~1,070,000 km; Callisto ~1,883,000 km. ￼
• Saturn: Titan ~1,221,000 km. ￼ ￼
• Neptune: Triton ~355,000 km. ￼

Keep the list short for MVP; you can add more later using the same source style.

Asteroids
• Main belt between ~2.2 AU and ~3.2 AU. Render as: (a) a light, sparse “dust” field; plus (b) named bodies: Ceres (2.77 AU), Vesta (2.36 AU), Pallas (2.77 AU), Hygiea (3.14 AU). ￼ ￼ ￼

Scene graph
• viewport (pixi-viewport)
• layer:orbits (optional faint rings for planets’ orbits; low alpha)
• layer:planets (Sun + 8 planets)
• layer:moons (major moons)
• layer:asteroids (belt “dust” + named asteroids)
• layer:ships (your ships; always on top)

All items are PIXI.Graphics circles with eventMode='static' (clickable). Labels (PIXI.Text) toggle with LOD.

LOD rules (by viewport scale)

Let z = viewport.scale.x (uniform). Use only these three bands for MVP:
• LOD_far (planets): z < 0.75
• Show: Sun, 8 planets (display radius clamp: 3–10 px), ships.
• Hide: moons, asteroid belt, labels (except planet names on hover).
• LOD_mid (moons): 0.75 ≤ z < 2.0
• Show: + major moons (display radius clamp: 2–6 px), show planet labels.
• Hide: asteroid field “dust”; show named big asteroids only if z ≥ 1.2.
• LOD_near (small bodies): z ≥ 2.0
• Show: asteroid belt dust field (several hundred points), named asteroids with labels, all moons with labels on hover.

Switch bands on viewport zoomed event; toggle entire containers’ .visible to avoid per-node churn. ￼

Rendering plan 1. Background: solid black clear color. 2. Sun: circle at (0,0); give a larger display radius (e.g., 20–30 px at LOD_far). 3. Planets: for each, compute x = AU \* 300, y = 0. Draw small circle; attach name. (Static—no orbital motion in MVP.) Planet distances from NASA/JPL table above. ￼ 4. Moons (mid scope): around each parent, place moons on a tiny local ring at their true mean orbital distance (km→AU→px). Because these are tiny at map scale, add min pixel gap = 6 px so they can be interacted with at close zoom; keep their ordering correct. Distances from NASA pages above. ￼ ￼ 5. Asteroid belt (near scope):
• Dust field: randomly scatter N points with radius band [2.2 AU, 3.2 AU], uniform in angle; jitter radius slightly to avoid rings.
• Named asteroids: place at their semi-major axes; larger display radius and labels. ￼ ￼ 6. Ships: render as distinct markers in layer:ships; always visible; label on hover; Z-order above everything.

Interactions
• Pan/zoom: enable drag().wheel().pinch().decelerate() on the viewport. ￼
• Clicks: pointertap on any body shows a minimal info panel (name, type, AU/km distance, notes). (Data comes from the tables above; keep copy minimal.)
• Focus: a helper (not required) can animate viewport to a target planet/moon.

Sizing & visibility model
• Distances are physically scaled (AU→px).
• Render sizes use a display scale: displayRadius = clamp(base, minPx, maxPx) \* f(z), where f(z) grows modestly with zoom to keep touch targets usable.
• Labels: hidden at LOD_far; name-on-hover at LOD_mid; shown near for small bodies.

Performance notes
• Use PIXI.Graphics for circles; reuse graphics objects and toggle .visible. ￼
• Keep ships and moons in separate containers for whole-group toggles.
• For the belt “dust,” batch with one Graphics per 200–300 points or pre-bake to a sprite for the MVP if needed.

QA checklist (sanity)
• Neptune X ≈ 30.07 _ 300 ≈ 9,021 px. Earth X = 1 _ 300 = 300 px. (Matches table.) ￼
• Earth–Moon separation in px: 384,400 km * (300 / 149,597,870.7) ≈ 0.77 px → only visible at near zoom (expected). ￼ ￼
• Belt dust points confined to radii in [2.2*300, 3.2\*300] = [660, 960] px. ￼

Minimal content set (ship-ready)
• Bodies: Sun; Mercury, Venus, Earth, Mars, Jupiter, Saturn, Uranus, Neptune. (Positions from AU table.) ￼
• Moons: Moon; Phobos, Deimos; Io, Europa, Ganymede, Callisto; Titan; Triton. (Mean orbital distances above.) ￼
• Asteroids: Belt dust (2.2–3.2 AU) + Ceres, Vesta, Pallas, Hygiea. ￼ ￼
