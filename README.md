# Periapsis

An in-depth, interactive educational article explaining orbital mechanics to novices through hands-on visualizations.

Inspired by [Bartosz Ciechanowski's](https://ciechanow.ski/) incredible interactive explainers.

## Live Demo

Coming soon at [periapsis.v1be.codes](https://periapsis.v1be.codes)

## What You'll Learn

- **Gravity Basics** - How gravitational force works and decreases with distance
- **Orbiting is Falling** - Newton's cannonball thought experiment
- **Circular Orbits** - Altitude, velocity, and period relationships
- **Elliptical Orbits** - Kepler's laws in action
- **Delta-V** - The "currency" of spaceflight
- **Hohmann Transfers** - Efficient orbit changes
- **Gravity Assists** - Free velocity from planetary flybys
- **Lagrange Points** - Equilibrium positions in multi-body systems

## Tech Stack

- **Framework**: Next.js 14 + TypeScript
- **Rendering**: Canvas 2D + Three.js (for 3D demos)
- **Styling**: Tailwind CSS
- **Physics**: Custom orbital mechanics library
- **Math**: KaTeX for equation rendering

## Development

```bash
# Install dependencies
npm install

# Run development server
npm run dev

# Build for production
npm run build
```

## Project Structure

```
src/
├── app/                    # Next.js app router
├── components/
│   ├── demos/              # Interactive demonstrations
│   ├── ui/                 # Reusable UI components
│   └── InteractiveDemo.tsx # Base demo wrapper
└── lib/
    ├── orbital/            # Orbital mechanics library
    │   ├── types.ts        # Type definitions
    │   ├── kepler.ts       # Kepler's equations
    │   ├── propagate.ts    # Orbit propagation
    │   └── maneuvers.ts    # Delta-v calculations
    ├── render/             # Rendering utilities
    │   └── canvas2d.ts     # 2D canvas helpers
    └── math/
        └── vectors.ts      # Vector math utilities
```

## Progress

### Section 1: Gravity Basics

- [ ] Gravity Strength Visualizer
- [ ] Free-Fall Comparison
- [ ] Gravity Field

### Section 2: Falling Around the Earth

- [x] Newton's Cannonball
- [ ] What Happens Without Velocity

### Section 3: Circular Orbits

- [ ] Altitude-Velocity-Period
- [ ] Orbital Racetrack

### Section 4: Elliptical Orbits & Kepler's Laws

- [ ] Ellipse Constructor
- [ ] Orbit Shaper
- [ ] Equal Areas (Kepler 2)
- [ ] Period Comparison (Kepler 3)

### Section 5: Delta-V Concept

- [ ] Burn Direction Effects
- [ ] Delta-V Budget

### Section 6: Hohmann Transfers

- [ ] The Problem Setup
- [ ] Hohmann Transfer Sandbox
- [ ] Transfer Comparison

### Section 7: Gravity Assists

- [ ] Frame of Reference Switcher
- [ ] Gravity Assist Simulator
- [ ] Voyager Grand Tour

### Section 8: Lagrange Points

- [ ] Tug of War Balance
- [ ] All Five L-Points

## License

MIT
