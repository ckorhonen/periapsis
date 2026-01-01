/**
 * Core types for orbital mechanics calculations
 */

/** 3D Vector */
export interface Vector3 {
  x: number;
  y: number;
  z: number;
}

/** 2D Vector (for 2D demos) */
export interface Vector2 {
  x: number;
  y: number;
}

/** State vector: position and velocity */
export interface StateVector {
  position: Vector3;
  velocity: Vector3;
}

/** Classical Keplerian orbital elements */
export interface KeplerianElements {
  /** Semi-major axis (m) */
  a: number;
  /** Eccentricity (0 = circular, 0-1 = ellipse, 1 = parabola, >1 = hyperbola) */
  e: number;
  /** Inclination (radians) */
  i: number;
  /** Right ascension of ascending node (radians) */
  raan: number;
  /** Argument of periapsis (radians) */
  argp: number;
  /** True anomaly (radians) */
  nu: number;
}

/** Simplified 2D orbital elements for educational demos */
export interface Orbit2D {
  /** Semi-major axis (m) */
  a: number;
  /** Eccentricity */
  e: number;
  /** True anomaly (radians) */
  nu: number;
  /** Argument of periapsis (radians) - rotation of the orbit */
  argp: number;
}

/** Celestial body properties */
export interface CelestialBody {
  name: string;
  /** Mass (kg) */
  mass: number;
  /** Radius (m) */
  radius: number;
  /** Standard gravitational parameter μ = GM (m³/s²) */
  mu: number;
  /** Display color */
  color: string;
}

/** Hohmann transfer parameters */
export interface HohmannTransfer {
  /** Initial circular orbit radius (m) */
  r1: number;
  /** Final circular orbit radius (m) */
  r2: number;
  /** Semi-major axis of transfer ellipse (m) */
  aTransfer: number;
  /** Delta-v for first burn (m/s) */
  deltaV1: number;
  /** Delta-v for second burn (m/s) */
  deltaV2: number;
  /** Total delta-v (m/s) */
  totalDeltaV: number;
  /** Transfer time (s) */
  transferTime: number;
}

/** Orbital state at a point in time */
export interface OrbitalState {
  /** Position vector */
  position: Vector3;
  /** Velocity vector */
  velocity: Vector3;
  /** Time since epoch (s) */
  time: number;
}

/** Simulation parameters */
export interface SimulationParams {
  /** Time step (s) */
  dt: number;
  /** Time scale multiplier */
  timeScale: number;
  /** Whether simulation is paused */
  paused: boolean;
}

/** Common celestial bodies with realistic parameters */
export const EARTH: CelestialBody = {
  name: "Earth",
  mass: 5.972e24,
  radius: 6.371e6,
  mu: 3.986004418e14,
  color: "#4A90D9",
};

export const MOON: CelestialBody = {
  name: "Moon",
  mass: 7.342e22,
  radius: 1.7371e6,
  mu: 4.9048695e12,
  color: "#C0C0C0",
};

export const SUN: CelestialBody = {
  name: "Sun",
  mass: 1.989e30,
  radius: 6.9634e8,
  mu: 1.32712440018e20,
  color: "#FFD700",
};

/** Common orbital altitudes (m above Earth's surface) */
export const ALTITUDES = {
  ISS: 408e3,
  LEO_LOW: 200e3,
  LEO_HIGH: 2000e3,
  GPS: 20200e3,
  GEO: 35786e3,
  MOON_ORBIT: 384400e3,
};

/** Physical constants */
export const CONSTANTS = {
  /** Gravitational constant (m³/kg/s²) */
  G: 6.6743e-11,
  /** Speed of light (m/s) */
  c: 299792458,
  /** Astronomical Unit (m) */
  AU: 1.496e11,
};
