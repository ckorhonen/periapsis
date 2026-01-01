/**
 * Orbital maneuver calculations
 *
 * Delta-v calculations, Hohmann transfers, and other maneuvers
 */

import type { HohmannTransfer, Vector3 } from "./types";
import { circularVelocity, visViva, orbitalPeriod } from "./kepler";
import { vec3Sub, vec3Magnitude, vec3Add, vec3Scale, vec3Normalize } from "../math/vectors";

// ============ Delta-V Calculations ============

/**
 * Calculate delta-v magnitude between two velocity vectors
 */
export function deltaV(v1: Vector3, v2: Vector3): number {
  return vec3Magnitude(vec3Sub(v2, v1));
}

/**
 * Calculate total delta-v for a series of maneuvers
 */
export function totalDeltaV(maneuvers: number[]): number {
  return maneuvers.reduce((sum, dv) => sum + Math.abs(dv), 0);
}

// ============ Hohmann Transfer ============

/**
 * Calculate Hohmann transfer parameters between two circular orbits
 *
 * @param r1 Initial orbit radius (m)
 * @param r2 Final orbit radius (m)
 * @param mu Standard gravitational parameter (m³/s²)
 * @returns Hohmann transfer parameters
 */
export function calculateHohmannTransfer(
  r1: number,
  r2: number,
  mu: number
): HohmannTransfer {
  // Semi-major axis of transfer ellipse
  const aTransfer = (r1 + r2) / 2;

  // Velocities in initial circular orbit
  const v1Circular = circularVelocity(r1, mu);

  // Velocities in final circular orbit
  const v2Circular = circularVelocity(r2, mu);

  // Velocities at periapsis and apoapsis of transfer ellipse
  const v1Transfer = visViva(r1, aTransfer, mu); // At departure
  const v2Transfer = visViva(r2, aTransfer, mu); // At arrival

  // Delta-v for each burn
  let deltaV1: number;
  let deltaV2: number;

  if (r2 > r1) {
    // Transfer to higher orbit
    deltaV1 = v1Transfer - v1Circular; // Prograde burn
    deltaV2 = v2Circular - v2Transfer; // Prograde burn at apoapsis
  } else {
    // Transfer to lower orbit
    deltaV1 = v1Circular - v1Transfer; // Retrograde burn
    deltaV2 = v2Transfer - v2Circular; // Retrograde burn at periapsis
  }

  // Transfer time is half the period of the transfer ellipse
  const transferTime = orbitalPeriod(aTransfer, mu) / 2;

  return {
    r1,
    r2,
    aTransfer,
    deltaV1: Math.abs(deltaV1),
    deltaV2: Math.abs(deltaV2),
    totalDeltaV: Math.abs(deltaV1) + Math.abs(deltaV2),
    transferTime,
  };
}

/**
 * Calculate bi-elliptic transfer parameters
 * More efficient than Hohmann for large ratio changes (r2/r1 > 11.94)
 *
 * @param r1 Initial orbit radius
 * @param r2 Final orbit radius
 * @param rb Intermediate apoapsis radius (must be > max(r1, r2))
 * @param mu Standard gravitational parameter
 */
export function calculateBiEllipticTransfer(
  r1: number,
  r2: number,
  rb: number,
  mu: number
): {
  deltaV1: number;
  deltaV2: number;
  deltaV3: number;
  totalDeltaV: number;
  transferTime: number;
} {
  // First ellipse: r1 to rb
  const a1 = (r1 + rb) / 2;
  const v1Circular = circularVelocity(r1, mu);
  const v1Transfer1 = visViva(r1, a1, mu);
  const deltaV1 = v1Transfer1 - v1Circular;

  // At rb: transition between ellipses
  const v1AtRb = visViva(rb, a1, mu);
  const a2 = (rb + r2) / 2;
  const v2AtRb = visViva(rb, a2, mu);
  const deltaV2 = v2AtRb - v1AtRb;

  // At r2: circularize
  const v2AtR2 = visViva(r2, a2, mu);
  const v2Circular = circularVelocity(r2, mu);
  const deltaV3 = v2Circular - v2AtR2;

  // Total transfer time
  const t1 = orbitalPeriod(a1, mu) / 2;
  const t2 = orbitalPeriod(a2, mu) / 2;

  return {
    deltaV1: Math.abs(deltaV1),
    deltaV2: Math.abs(deltaV2),
    deltaV3: Math.abs(deltaV3),
    totalDeltaV: Math.abs(deltaV1) + Math.abs(deltaV2) + Math.abs(deltaV3),
    transferTime: t1 + t2,
  };
}

// ============ Burn Calculations ============

export type BurnDirection = "prograde" | "retrograde" | "radialIn" | "radialOut" | "normal" | "antinormal";

/**
 * Get unit vector for burn direction in orbital frame
 *
 * @param position Current position vector
 * @param velocity Current velocity vector
 * @param direction Burn direction
 * @returns Unit vector for burn direction
 */
export function getBurnVector(
  position: Vector3,
  velocity: Vector3,
  direction: BurnDirection
): Vector3 {
  const prograde = vec3Normalize(velocity);
  const radialOut = vec3Normalize(position);

  // Normal is perpendicular to orbital plane (cross of r and v)
  const normal = vec3Normalize({
    x: position.y * velocity.z - position.z * velocity.y,
    y: position.z * velocity.x - position.x * velocity.z,
    z: position.x * velocity.y - position.y * velocity.x,
  });

  switch (direction) {
    case "prograde":
      return prograde;
    case "retrograde":
      return vec3Scale(prograde, -1);
    case "radialOut":
      return radialOut;
    case "radialIn":
      return vec3Scale(radialOut, -1);
    case "normal":
      return normal;
    case "antinormal":
      return vec3Scale(normal, -1);
  }
}

/**
 * Apply a delta-v burn to current velocity
 *
 * @param velocity Current velocity
 * @param position Current position (for computing direction)
 * @param deltaVMagnitude Delta-v magnitude (m/s)
 * @param direction Burn direction
 * @returns New velocity after burn
 */
export function applyBurn(
  velocity: Vector3,
  position: Vector3,
  deltaVMagnitude: number,
  direction: BurnDirection
): Vector3 {
  const burnVector = getBurnVector(position, velocity, direction);
  const deltaVVector = vec3Scale(burnVector, deltaVMagnitude);
  return vec3Add(velocity, deltaVVector);
}

// ============ Rendezvous ============

/**
 * Calculate phase angle for Hohmann transfer rendezvous
 * (angle target should be ahead/behind for optimal transfer)
 *
 * @param r1 Chaser orbit radius
 * @param r2 Target orbit radius
 * @param mu Standard gravitational parameter
 * @returns Required phase angle (radians) - positive means target ahead
 */
export function hohmannPhaseAngle(r1: number, r2: number, mu: number): number {
  const transfer = calculateHohmannTransfer(r1, r2, mu);
  const targetPeriod = orbitalPeriod(r2, mu);
  const targetAngularVelocity = (2 * Math.PI) / targetPeriod;

  // Angle traveled by target during transfer
  const targetAngleDuringTransfer = targetAngularVelocity * transfer.transferTime;

  // Phase angle: target should be 180° - (angle traveled during transfer) ahead
  return Math.PI - targetAngleDuringTransfer;
}

// ============ Orbital Energy ============

/**
 * Calculate specific orbital energy (vis-viva)
 */
export function specificOrbitalEnergy(r: number, v: number, mu: number): number {
  return (v * v) / 2 - mu / r;
}

/**
 * Calculate semi-major axis from energy
 */
export function semiMajorAxisFromEnergy(energy: number, mu: number): number {
  if (Math.abs(energy) < 1e-10) return Infinity; // Parabolic
  return -mu / (2 * energy);
}

/**
 * Calculate eccentricity from energy and angular momentum
 */
export function eccentricityFromEnergyAndMomentum(
  energy: number,
  angularMomentum: number,
  mu: number
): number {
  const p = (angularMomentum * angularMomentum) / mu;
  const a = semiMajorAxisFromEnergy(energy, mu);
  if (!isFinite(a)) return 1; // Parabolic
  return Math.sqrt(1 - p / a);
}
