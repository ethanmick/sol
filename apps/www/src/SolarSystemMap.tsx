import React, { useEffect, useRef, useState } from 'react';
import { Application, Container, Graphics, Text } from 'pixi.js';
import { Viewport } from 'pixi-viewport';

// Constants
const AU_TO_PX = 300; // 1 AU = 300 pixels
const KM_TO_AU = 1 / 149597870.7; // Conversion factor from km to AU

// LOD thresholds
const LOD_FAR = 0.75;
const LOD_MID = 2.0;

// Celestial body data
const PLANETS = [
  { name: 'Mercury', au: 0.39, color: 0x8C7853 },
  { name: 'Venus', au: 0.72, color: 0xFFC649 },
  { name: 'Earth', au: 1.00, color: 0x6B93D6 },
  { name: 'Mars', au: 1.52, color: 0xCD5C5C },
  { name: 'Jupiter', au: 5.20, color: 0xD8CA9D },
  { name: 'Saturn', au: 9.58, color: 0xFAD5A5 },
  { name: 'Uranus', au: 19.20, color: 0x4FD0E7 },
  { name: 'Neptune', au: 30.07, color: 0x4B70DD },
];

const MOONS = [
  // Earth
  { name: 'Moon', parent: 'Earth', orbitKm: 384400 },
  // Mars
  { name: 'Phobos', parent: 'Mars', orbitKm: 9377 },
  { name: 'Deimos', parent: 'Mars', orbitKm: 23460 },
  // Jupiter
  { name: 'Io', parent: 'Jupiter', orbitKm: 422000 },
  { name: 'Europa', parent: 'Jupiter', orbitKm: 671000 },
  { name: 'Ganymede', parent: 'Jupiter', orbitKm: 1070000 },
  { name: 'Callisto', parent: 'Jupiter', orbitKm: 1883000 },
  // Saturn
  { name: 'Titan', parent: 'Saturn', orbitKm: 1221000 },
  // Neptune
  { name: 'Triton', parent: 'Neptune', orbitKm: 355000 },
];

const ASTEROIDS = [
  { name: 'Ceres', au: 2.77, color: 0x888888 },
  { name: 'Vesta', au: 2.36, color: 0xAAAAAA },
  { name: 'Pallas', au: 2.77, color: 0x999999 },
  { name: 'Hygiea', au: 3.14, color: 0x777777 },
];

interface CelestialBody {
  name: string;
  type: string;
  au?: number;
  orbitKm?: number;
  parent?: string;
}

interface InfoPanelProps {
  body: CelestialBody | null;
  position: { x: number; y: number };
  onClose: () => void;
}

const InfoPanel: React.FC<InfoPanelProps> = ({ body, position, onClose }) => {
  if (!body) return null;

  return (
    <div
      style={{
        position: 'fixed',
        left: position.x + 10,
        top: position.y - 10,
        background: 'rgba(0, 0, 0, 0.9)',
        color: 'white',
        padding: '8px 12px',
        borderRadius: '4px',
        fontSize: '14px',
        zIndex: 1000,
        maxWidth: '200px',
      }}
    >
      <div style={{ fontWeight: 'bold', marginBottom: '4px' }}>{body.name}</div>
      <div>Type: {body.type}</div>
      {body.au && <div>Distance: {body.au} AU</div>}
      {body.orbitKm && <div>Orbit: {body.orbitKm.toLocaleString()} km</div>}
      <button
        onClick={onClose}
        style={{
          position: 'absolute',
          top: '2px',
          right: '4px',
          background: 'none',
          border: 'none',
          color: 'white',
          cursor: 'pointer',
          fontSize: '12px',
        }}
      >
        ×
      </button>
    </div>
  );
};

const SolarSystemMap: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const appRef = useRef<Application | null>(null);
  const viewportRef = useRef<Viewport | null>(null);
  const [selectedBody, setSelectedBody] = useState<CelestialBody | null>(null);
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });

  // Containers for different layers
  const layersRef = useRef<{
    orbits?: Container;
    planets?: Container;
    moons?: Container;
    asteroids?: Container;
    ships?: Container;
  }>({});

  useEffect(() => {
    if (!canvasRef.current) return;

    const initPIXI = async () => {
      // Create PIXI application
      const app = new Application();
      await app.init({
        canvas: canvasRef.current!,
        width: window.innerWidth,
        height: window.innerHeight,
        background: 0x000000,
      });
      appRef.current = app;

      // Create viewport
      const viewport = new Viewport({
        screenWidth: window.innerWidth,
        screenHeight: window.innerHeight,
        worldWidth: 20000,
        worldHeight: 20000,
        events: app.renderer.events,
      });
      viewportRef.current = viewport;

      app.stage.addChild(viewport);

      // Enable viewport interactions
      viewport.drag().wheel().pinch().decelerate();

      // Center viewport on the sun
      viewport.moveCenter(0, 0);

      // Create layer containers
      layersRef.current = {
        orbits: new Container(),
        planets: new Container(),
        moons: new Container(),
        asteroids: new Container(),
        ships: new Container(),
      };

      // Add layers to viewport in order
      viewport.addChild(layersRef.current.orbits!);
      viewport.addChild(layersRef.current.planets!);
      viewport.addChild(layersRef.current.moons!);
      viewport.addChild(layersRef.current.asteroids!);
      viewport.addChild(layersRef.current.ships!);

      // Render celestial bodies
      renderSun();
      renderPlanets();
      renderMoons();
      renderAsteroids();
      renderShips();

      // Set up LOD system
      viewport.on('zoomed', updateLOD);
      updateLOD(); // Initial LOD update

      // Handle window resize
      const handleResize = () => {
        app.renderer.resize(window.innerWidth, window.innerHeight);
        viewport.resize(window.innerWidth, window.innerHeight);
      };

      window.addEventListener('resize', handleResize);

      return () => {
        window.removeEventListener('resize', handleResize);
        app.destroy(true);
      };
    };

    const renderSun = () => {
      const sun = new Graphics();
      sun.circle(0, 0, 25);
      sun.fill(0xFFD700);
      sun.eventMode = 'static';
      sun.cursor = 'pointer';

      const label = new Text({
        text: 'Sun',
        style: {
          fontSize: 12,
          fill: 0xFFFFFF,
        },
      });
      label.anchor.set(0.5);
      label.position.set(0, -35);

      sun.addChild(label);

      sun.on('pointertap', (event) => {
        const globalPos = event.global;
        setMousePos({ x: globalPos.x, y: globalPos.y });
        setSelectedBody({
          name: 'Sun',
          type: 'Star',
          au: 0,
        });
      });

      layersRef.current.planets?.addChild(sun);
    };

    const renderPlanets = () => {
      PLANETS.forEach((planet) => {
        const x = planet.au * AU_TO_PX;
        const y = 0;

        const planetGraphics = new Graphics();
        const displayRadius = Math.max(3, Math.min(10, planet.au * 2));
        planetGraphics.circle(0, 0, displayRadius);
        planetGraphics.fill(planet.color);
        planetGraphics.position.set(x, y);
        planetGraphics.eventMode = 'static';
        planetGraphics.cursor = 'pointer';

        const label = new Text({
          text: planet.name,
          style: {
            fontSize: 10,
            fill: 0xFFFFFF,
          },
        });
        label.anchor.set(0.5);
        label.position.set(0, -displayRadius - 15);
        planetGraphics.addChild(label);

        planetGraphics.on('pointertap', (event) => {
          const globalPos = event.global;
          setMousePos({ x: globalPos.x, y: globalPos.y });
          setSelectedBody({
            name: planet.name,
            type: 'Planet',
            au: planet.au,
          });
        });

        layersRef.current.planets?.addChild(planetGraphics);
      });
    };

    const renderMoons = () => {
      MOONS.forEach((moon) => {
        const parent = PLANETS.find(p => p.name === moon.parent);
        if (!parent) return;

        const parentX = parent.au * AU_TO_PX;
        const orbitRadius = Math.max(6, moon.orbitKm * KM_TO_AU * AU_TO_PX);

        // Place moon at a random angle around parent
        const angle = Math.random() * Math.PI * 2;
        const moonX = parentX + Math.cos(angle) * orbitRadius;
        const moonY = Math.sin(angle) * orbitRadius;

        const moonGraphics = new Graphics();
        moonGraphics.circle(0, 0, 2);
        moonGraphics.fill(0xCCCCCC);
        moonGraphics.position.set(moonX, moonY);
        moonGraphics.eventMode = 'static';
        moonGraphics.cursor = 'pointer';

        const label = new Text({
          text: moon.name,
          style: {
            fontSize: 8,
            fill: 0xFFFFFF,
          },
        });
        label.anchor.set(0.5);
        label.position.set(0, -12);
        label.visible = false; // Initially hidden, shown on hover
        moonGraphics.addChild(label);

        moonGraphics.on('pointerover', () => {
          label.visible = true;
        });

        moonGraphics.on('pointerout', () => {
          label.visible = false;
        });

        moonGraphics.on('pointertap', (event) => {
          const globalPos = event.global;
          setMousePos({ x: globalPos.x, y: globalPos.y });
          setSelectedBody({
            name: moon.name,
            type: 'Moon',
            parent: moon.parent,
            orbitKm: moon.orbitKm,
          });
        });

        layersRef.current.moons?.addChild(moonGraphics);
      });
    };

    const renderAsteroids = () => {
      // Render named asteroids
      ASTEROIDS.forEach((asteroid) => {
        const x = asteroid.au * AU_TO_PX;
        const y = 0;

        const asteroidGraphics = new Graphics();
        asteroidGraphics.circle(0, 0, 3);
        asteroidGraphics.fill(asteroid.color);
        asteroidGraphics.position.set(x, y);
        asteroidGraphics.eventMode = 'static';
        asteroidGraphics.cursor = 'pointer';

        const label = new Text({
          text: asteroid.name,
          style: {
            fontSize: 8,
            fill: 0xFFFFFF,
          },
        });
        label.anchor.set(0.5);
        label.position.set(0, -12);
        label.visible = false;
        asteroidGraphics.addChild(label);

        asteroidGraphics.on('pointerover', () => {
          label.visible = true;
        });

        asteroidGraphics.on('pointerout', () => {
          label.visible = false;
        });

        asteroidGraphics.on('pointertap', (event) => {
          const globalPos = event.global;
          setMousePos({ x: globalPos.x, y: globalPos.y });
          setSelectedBody({
            name: asteroid.name,
            type: 'Asteroid',
            au: asteroid.au,
          });
        });

        layersRef.current.asteroids?.addChild(asteroidGraphics);
      });

      // Render asteroid belt dust field
      const dustField = new Graphics();
      const dustCount = 300;

      for (let i = 0; i < dustCount; i++) {
        const radius = 2.2 + Math.random() * (3.2 - 2.2); // Between 2.2 and 3.2 AU
        const angle = Math.random() * Math.PI * 2;
        const jitter = (Math.random() - 0.5) * 0.1; // Small radius jitter
        const actualRadius = (radius + jitter) * AU_TO_PX;

        const x = Math.cos(angle) * actualRadius;
        const y = Math.sin(angle) * actualRadius;

        dustField.circle(x, y, 0.5);
        dustField.fill(0x444444);
      }

      layersRef.current.asteroids?.addChild(dustField);
    };

    const renderShips = () => {
      // Add a few example ships
      const ships = [
        { name: 'USS Enterprise', x: 1.1 * AU_TO_PX, y: 50 },
        { name: 'Millennium Falcon', x: 5.3 * AU_TO_PX, y: -30 },
      ];

      ships.forEach((ship) => {
        const shipGraphics = new Graphics();
        shipGraphics.star(0, 0, 5, 6, 3);
        shipGraphics.fill(0x00FF00);
        shipGraphics.position.set(ship.x, ship.y);
        shipGraphics.eventMode = 'static';
        shipGraphics.cursor = 'pointer';

        const label = new Text({
          text: ship.name,
          style: {
            fontSize: 9,
            fill: 0x00FF00,
          },
        });
        label.anchor.set(0.5);
        label.position.set(0, -15);
        shipGraphics.addChild(label);

        shipGraphics.on('pointertap', (event) => {
          const globalPos = event.global;
          setMousePos({ x: globalPos.x, y: globalPos.y });
          setSelectedBody({
            name: ship.name,
            type: 'Ship',
          });
        });

        layersRef.current.ships?.addChild(shipGraphics);
      });
    };

    const updateLOD = () => {
      if (!viewportRef.current || !layersRef.current) return;

      const scale = viewportRef.current.scale.x;

      // LOD_far: show only planets and ships
      if (scale < LOD_FAR) {
        layersRef.current.planets!.visible = true;
        layersRef.current.moons!.visible = false;
        layersRef.current.asteroids!.visible = false;
        layersRef.current.ships!.visible = true;
      }
      // LOD_mid: add moons, show some asteroids
      else if (scale < LOD_MID) {
        layersRef.current.planets!.visible = true;
        layersRef.current.moons!.visible = true;
        layersRef.current.asteroids!.visible = scale >= 1.2; // Named asteroids only
        layersRef.current.ships!.visible = true;
      }
      // LOD_near: show everything
      else {
        layersRef.current.planets!.visible = true;
        layersRef.current.moons!.visible = true;
        layersRef.current.asteroids!.visible = true;
        layersRef.current.ships!.visible = true;
      }
    };

    initPIXI();

    return () => {
      if (appRef.current) {
        appRef.current.destroy(true);
      }
    };
  }, []);

  const handleCloseInfoPanel = () => {
    setSelectedBody(null);
  };

  return (
    <div style={{ position: 'relative', width: '100vw', height: '100vh', overflow: 'hidden' }}>
      <canvas ref={canvasRef} />
      <InfoPanel
        body={selectedBody}
        position={mousePos}
        onClose={handleCloseInfoPanel}
      />
      <div
        style={{
          position: 'absolute',
          top: '10px',
          left: '10px',
          color: 'white',
          background: 'rgba(0, 0, 0, 0.7)',
          padding: '10px',
          borderRadius: '4px',
          fontSize: '12px',
        }}
      >
        <div><strong>Solar System Map</strong></div>
        <div>Mouse wheel: Zoom</div>
        <div>Drag: Pan</div>
        <div>Click: Info</div>
      </div>
    </div>
  );
};

export default SolarSystemMap;