/**
 * Kepler's equations and orbital element conversions
 *
 * Reference: Vallado, "Fundamentals of Astrodynamics and Applications"
 */

import type {
  KeplerianElements,
  StateVector,
  Vector3,
  Orbit2D,
  Vector2,
} from "./types";
import {
  vec3,
  vec3Magnitude,
  vec3Cross,
  vec3Dot,
  vec3Scale,
  vec3Sub,
  vec3Normalize,
  vec3Add,
  vec2,
  vec2Magnitude,
} from "../math/vectors";

const TWO_PI = 2 * Math.PI;
const TOLERANCE = 1e-10;
const MAX_ITERATIONS = 50;

// ============ Anomaly Conversions ============

/**
 * Solve Kepler's equation: M = E - e*sin(E)
 * Uses Newton-Raphson iteration
 *
 * @param M Mean anomaly (radians)
 * @param e Eccentricity
 * @returns Eccentric anomaly (radians)
 */
export function meanToEccentricAnomaly(M: number, e: number): number {
  // Normalize M to [0, 2π)
  M = ((M % TWO_PI) + TWO_PI) % TWO_PI;

  // Initial guess
  let E = e < 0.8 ? M : Math.PI;

  // Newton-Raphson iteration
  for (let i = 0; i < MAX_ITERATIONS; i++) {
    const f = E - e * Math.sin(E) - M;
    const fPrime = 1 - e * Math.cos(E);
    const delta = f / fPrime;
    E = E - delta;

    if (Math.abs(delta) < TOLERANCE) {
      return E;
    }
  }

  console.warn("Kepler equation did not converge");
  return E;
}

/**
 * Convert eccentric anomaly to true anomaly
 *
 * @param E Eccentric anomaly (radians)
 * @param e Eccentricity
 * @returns True anomaly (radians)
 */
export function eccentricToTrueAnomaly(E: number, e: number): number {
  const cosE = Math.cos(E);
  const sinE = Math.sin(E);

  const sinNu = (Math.sqrt(1 - e * e) * sinE) / (1 - e * cosE);
  const cosNu = (cosE - e) / (1 - e * cosE);

  return Math.atan2(sinNu, cosNu);
}

/**
 * Convert true anomaly to eccentric anomaly
 *
 * @param nu True anomaly (radians)
 * @param e Eccentricity
 * @returns Eccentric anomaly (radians)
 */
export function trueToEccentricAnomaly(nu: number, e: number): number {
  const cosNu = Math.cos(nu);
  const sinNu = Math.sin(nu);

  const sinE = (Math.sqrt(1 - e * e) * sinNu) / (1 + e * cosNu);
  const cosE = (e + cosNu) / (1 + e * cosNu);

  return Math.atan2(sinE, cosE);
}

/**
 * Convert mean anomaly directly to true anomaly
 *
 * @param M Mean anomaly (radians)
 * @param e Eccentricity
 * @returns True anomaly (radians)
 */
export function meanToTrueAnomaly(M: number, e: number): number {
  const E = meanToEccentricAnomaly(M, e);
  return eccentricToTrueAnomaly(E, e);
}

/**
 * Convert true anomaly to mean anomaly
 *
 * @param nu True anomaly (radians)
 * @param e Eccentricity
 * @returns Mean anomaly (radians)
 */
export function trueToMeanAnomaly(nu: number, e: number): number {
  const E = trueToEccentricAnomaly(nu, e);
  return E - e * Math.sin(E);
}

// ============ Orbital Radius ============

/**
 * Calculate orbital radius from true anomaly
 *
 * @param a Semi-major axis
 * @param e Eccentricity
 * @param nu True anomaly (radians)
 * @returns Orbital radius
 */
export function orbitalRadius(a: number, e: number, nu: number): number {
  const p = a * (1 - e * e); // Semi-latus rectum
  return p / (1 + e * Math.cos(nu));
}

/**
 * Calculate orbital period
 *
 * @param a Semi-major axis (m)
 * @param mu Standard gravitational parameter (m³/s²)
 * @returns Orbital period (s)
 */
export function orbitalPeriod(a: number, mu: number): number {
  return TWO_PI * Math.sqrt((a * a * a) / mu);
}

/**
 * Calculate mean motion (radians per second)
 *
 * @param a Semi-major axis (m)
 * @param mu Standard gravitational parameter (m³/s²)
 * @returns Mean motion (rad/s)
 */
export function meanMotion(a: number, mu: number): number {
  return Math.sqrt(mu / (a * a * a));
}

/**
 * Calculate circular orbital velocity
 *
 * @param r Orbital radius (m)
 * @param mu Standard gravitational parameter (m³/s²)
 * @returns Orbital velocity (m/s)
 */
export function circularVelocity(r: number, mu: number): number {
  return Math.sqrt(mu / r);
}

/**
 * Calculate escape velocity
 *
 * @param r Distance from center of mass (m)
 * @param mu Standard gravitational parameter (m³/s²)
 * @returns Escape velocity (m/s)
 */
export function escapeVelocity(r: number, mu: number): number {
  return Math.sqrt((2 * mu) / r);
}

/**
 * Calculate velocity at a point in orbit (vis-viva equation)
 *
 * @param r Current radius (m)
 * @param a Semi-major axis (m)
 * @param mu Standard gravitational parameter (m³/s²)
 * @returns Velocity magnitude (m/s)
 */
export function visViva(r: number, a: number, mu: number): number {
  return Math.sqrt(mu * (2 / r - 1 / a));
}

// ============ 2D Position/Velocity (for educational demos) ============

/**
 * Get 2D position in orbital plane from orbital elements
 *
 * @param orbit 2D orbital elements
 * @returns Position vector in 2D
 */
export function orbit2DPosition(orbit: Orbit2D): Vector2 {
  const r = orbitalRadius(orbit.a, orbit.e, orbit.nu);
  const angle = orbit.nu + orbit.argp;
  return vec2(r * Math.cos(angle), r * Math.sin(angle));
}

/**
 * Get 2D velocity in orbital plane
 *
 * @param orbit 2D orbital elements
 * @param mu Standard gravitational parameter
 * @returns Velocity vector in 2D
 */
export function orbit2DVelocity(orbit: Orbit2D, mu: number): Vector2 {
  const { a, e, nu, argp } = orbit;
  const p = a * (1 - e * e);
  const h = Math.sqrt(mu * p); // Specific angular momentum

  // Velocity components in perifocal frame
  const vr = (mu / h) * e * Math.sin(nu);
  const vt = (mu / h) * (1 + e * Math.cos(nu));

  // Convert to inertial frame
  const angle = nu + argp;
  const cosAngle = Math.cos(angle);
  const sinAngle = Math.sin(angle);

  // Radial unit vector: [cosAngle, sinAngle]
  // Transverse unit vector: [-sinAngle, cosAngle]
  return vec2(
    vr * cosAngle - vt * sinAngle,
    vr * sinAngle + vt * cosAngle
  );
}

/**
 * Propagate 2D orbit by time step
 *
 * @param orbit Current orbital elements
 * @param dt Time step (s)
 * @param mu Standard gravitational parameter
 * @returns New orbital elements
 */
export function propagateOrbit2D(
  orbit: Orbit2D,
  dt: number,
  mu: number
): Orbit2D {
  const n = meanMotion(orbit.a, mu);
  const M0 = trueToMeanAnomaly(orbit.nu, orbit.e);
  const M1 = M0 + n * dt;
  const nu1 = meanToTrueAnomaly(M1, orbit.e);

  return {
    ...orbit,
    nu: nu1,
  };
}

// ============ 3D Keplerian ↔ Cartesian Conversions ============

/**
 * Convert Keplerian orbital elements to Cartesian state vector
 *
 * @param elements Keplerian orbital elements
 * @param mu Standard gravitational parameter (m³/s²)
 * @returns State vector (position and velocity)
 */
export function keplerianToCartesian(
  elements: KeplerianElements,
  mu: number
): StateVector {
  const { a, e, i, raan, argp, nu } = elements;

  // Semi-latus rectum
  const p = a * (1 - e * e);

  // Position and velocity in perifocal frame
  const r = p / (1 + e * Math.cos(nu));
  const h = Math.sqrt(mu * p);

  // Position in perifocal coordinates
  const rPQW: Vector3 = {
    x: r * Math.cos(nu),
    y: r * Math.sin(nu),
    z: 0,
  };

  // Velocity in perifocal coordinates
  const vPQW: Vector3 = {
    x: (-mu / h) * Math.sin(nu),
    y: (mu / h) * (e + Math.cos(nu)),
    z: 0,
  };

  // Rotation matrices components
  const cosRaan = Math.cos(raan);
  const sinRaan = Math.sin(raan);
  const cosArgp = Math.cos(argp);
  const sinArgp = Math.sin(argp);
  const cosI = Math.cos(i);
  const sinI = Math.sin(i);

  // Rotation matrix from perifocal to inertial (ECI)
  const R11 = cosRaan * cosArgp - sinRaan * sinArgp * cosI;
  const R12 = -cosRaan * sinArgp - sinRaan * cosArgp * cosI;
  const R21 = sinRaan * cosArgp + cosRaan * sinArgp * cosI;
  const R22 = -sinRaan * sinArgp + cosRaan * cosArgp * cosI;
  const R31 = sinArgp * sinI;
  const R32 = cosArgp * sinI;

  // Transform position
  const position: Vector3 = {
    x: R11 * rPQW.x + R12 * rPQW.y,
    y: R21 * rPQW.x + R22 * rPQW.y,
    z: R31 * rPQW.x + R32 * rPQW.y,
  };

  // Transform velocity
  const velocity: Vector3 = {
    x: R11 * vPQW.x + R12 * vPQW.y,
    y: R21 * vPQW.x + R22 * vPQW.y,
    z: R31 * vPQW.x + R32 * vPQW.y,
  };

  return { position, velocity };
}

/**
 * Convert Cartesian state vector to Keplerian orbital elements
 *
 * @param state State vector (position and velocity)
 * @param mu Standard gravitational parameter (m³/s²)
 * @returns Keplerian orbital elements
 */
export function cartesianToKeplerian(
  state: StateVector,
  mu: number
): KeplerianElements {
  const { position: r, velocity: v } = state;

  const rMag = vec3Magnitude(r);
  const vMag = vec3Magnitude(v);

  // Specific angular momentum
  const h = vec3Cross(r, v);
  const hMag = vec3Magnitude(h);

  // Node vector (z × h)
  const n: Vector3 = { x: -h.y, y: h.x, z: 0 };
  const nMag = vec3Magnitude(n);

  // Eccentricity vector
  const eVec = vec3Sub(
    vec3Scale(r, (vMag * vMag - mu / rMag)),
    vec3Scale(v, vec3Dot(r, v))
  );
  const e = vec3Magnitude(eVec) / mu;

  // Specific orbital energy
  const energy = (vMag * vMag) / 2 - mu / rMag;

  // Semi-major axis
  let a: number;
  if (Math.abs(1 - e) < TOLERANCE) {
    // Parabolic
    a = Infinity;
  } else {
    a = -mu / (2 * energy);
  }

  // Inclination
  const i = Math.acos(h.z / hMag);

  // Right ascension of ascending node
  let raan: number;
  if (nMag < TOLERANCE) {
    raan = 0;
  } else {
    raan = Math.acos(n.x / nMag);
    if (n.y < 0) raan = TWO_PI - raan;
  }

  // Argument of periapsis
  let argp: number;
  if (e < TOLERANCE || nMag < TOLERANCE) {
    argp = 0;
  } else {
    argp = Math.acos(vec3Dot(n, eVec) / (nMag * e * mu));
    if (eVec.z < 0) argp = TWO_PI - argp;
  }

  // True anomaly
  let nu: number;
  if (e < TOLERANCE) {
    nu = 0;
  } else {
    const cosNu = vec3Dot(eVec, r) / (e * mu * rMag);
    nu = Math.acos(Math.max(-1, Math.min(1, cosNu)));
    if (vec3Dot(r, v) < 0) nu = TWO_PI - nu;
  }

  return { a, e, i, raan, argp, nu };
}

// ============ Orbit Classification ============

/**
 * Determine orbit type from eccentricity
 */
export function orbitType(
  e: number
): "circular" | "elliptical" | "parabolic" | "hyperbolic" {
  if (e < 0.001) return "circular";
  if (e < 0.999) return "elliptical";
  if (e < 1.001) return "parabolic";
  return "hyperbolic";
}

/**
 * Check if orbit is bound (closed)
 */
export function isBoundOrbit(e: number): boolean {
  return e < 1;
}

/**
 * Calculate specific orbital energy
 */
export function specificEnergy(a: number, mu: number): number {
  return -mu / (2 * a);
}

/**
 * Calculate specific angular momentum magnitude
 */
export function specificAngularMomentum(a: number, e: number, mu: number): number {
  const p = a * (1 - e * e);
  return Math.sqrt(mu * p);
}
