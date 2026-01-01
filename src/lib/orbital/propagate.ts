/**
 * Orbit propagation and numerical integration
 *
 * Implements multiple integration methods for different accuracy/speed tradeoffs
 */

import type { Vector3, StateVector, CelestialBody } from "./types";
import {
  vec3,
  vec3Add,
  vec3Scale,
  vec3Magnitude,
  vec3MagnitudeSq,
  vec3Sub,
} from "../math/vectors";

// ============ Gravitational Acceleration ============

/**
 * Calculate gravitational acceleration at a point
 *
 * @param position Position vector (m)
 * @param mu Standard gravitational parameter of central body (m³/s²)
 * @returns Acceleration vector (m/s²)
 */
export function gravitationalAcceleration(
  position: Vector3,
  mu: number
): Vector3 {
  const rMagSq = vec3MagnitudeSq(position);
  const rMag = Math.sqrt(rMagSq);

  if (rMag < 1) {
    // Avoid division by zero / collision
    return vec3(0, 0, 0);
  }

  const factor = -mu / (rMagSq * rMag);
  return vec3Scale(position, factor);
}

/**
 * Calculate gravitational acceleration with multiple bodies (n-body)
 *
 * @param position Position of test particle (m)
 * @param bodies Array of celestial bodies with positions
 * @returns Total acceleration vector (m/s²)
 */
export function nBodyAcceleration(
  position: Vector3,
  bodies: Array<{ position: Vector3; mu: number }>
): Vector3 {
  let acceleration = vec3(0, 0, 0);

  for (const body of bodies) {
    const r = vec3Sub(body.position, position);
    const rMagSq = vec3MagnitudeSq(r);
    const rMag = Math.sqrt(rMagSq);

    if (rMag > 1) {
      const factor = body.mu / (rMagSq * rMag);
      acceleration = vec3Add(acceleration, vec3Scale(r, factor));
    }
  }

  return acceleration;
}

// ============ Integration Methods ============

/**
 * Euler integration (1st order) - Fast but inaccurate
 * Good for: Quick visualization, low accuracy needs
 */
export function integrateEuler(
  state: StateVector,
  dt: number,
  acceleration: (pos: Vector3, vel: Vector3) => Vector3
): StateVector {
  const a = acceleration(state.position, state.velocity);

  return {
    position: vec3Add(state.position, vec3Scale(state.velocity, dt)),
    velocity: vec3Add(state.velocity, vec3Scale(a, dt)),
  };
}

/**
 * Velocity Verlet integration (2nd order) - Good energy conservation
 * Good for: Long-term orbital simulations, better accuracy than Euler
 */
export function integrateVerlet(
  state: StateVector,
  dt: number,
  acceleration: (pos: Vector3, vel: Vector3) => Vector3
): StateVector {
  const a0 = acceleration(state.position, state.velocity);

  // Half-step velocity
  const vHalf = vec3Add(state.velocity, vec3Scale(a0, dt / 2));

  // Full-step position
  const newPosition = vec3Add(state.position, vec3Scale(vHalf, dt));

  // New acceleration at new position
  const a1 = acceleration(newPosition, vHalf);

  // Full-step velocity
  const newVelocity = vec3Add(vHalf, vec3Scale(a1, dt / 2));

  return {
    position: newPosition,
    velocity: newVelocity,
  };
}

/**
 * Runge-Kutta 4th order integration (RK4) - High accuracy
 * Good for: Precise trajectory calculations, short-term high-accuracy needs
 */
export function integrateRK4(
  state: StateVector,
  dt: number,
  acceleration: (pos: Vector3, vel: Vector3) => Vector3
): StateVector {
  // Helper to combine position and velocity into state derivative
  const derivative = (
    pos: Vector3,
    vel: Vector3
  ): { dPos: Vector3; dVel: Vector3 } => ({
    dPos: vel,
    dVel: acceleration(pos, vel),
  });

  // k1 at current state
  const k1 = derivative(state.position, state.velocity);

  // k2 at half step using k1
  const k2 = derivative(
    vec3Add(state.position, vec3Scale(k1.dPos, dt / 2)),
    vec3Add(state.velocity, vec3Scale(k1.dVel, dt / 2))
  );

  // k3 at half step using k2
  const k3 = derivative(
    vec3Add(state.position, vec3Scale(k2.dPos, dt / 2)),
    vec3Add(state.velocity, vec3Scale(k2.dVel, dt / 2))
  );

  // k4 at full step using k3
  const k4 = derivative(
    vec3Add(state.position, vec3Scale(k3.dPos, dt)),
    vec3Add(state.velocity, vec3Scale(k3.dVel, dt))
  );

  // Combine: state + (k1 + 2*k2 + 2*k3 + k4) * dt/6
  const newPosition = vec3Add(
    state.position,
    vec3Scale(
      vec3Add(
        vec3Add(k1.dPos, vec3Scale(k2.dPos, 2)),
        vec3Add(vec3Scale(k3.dPos, 2), k4.dPos)
      ),
      dt / 6
    )
  );

  const newVelocity = vec3Add(
    state.velocity,
    vec3Scale(
      vec3Add(
        vec3Add(k1.dVel, vec3Scale(k2.dVel, 2)),
        vec3Add(vec3Scale(k3.dVel, 2), k4.dVel)
      ),
      dt / 6
    )
  );

  return {
    position: newPosition,
    velocity: newVelocity,
  };
}

// ============ High-Level Propagation Functions ============

export type IntegrationMethod = "euler" | "verlet" | "rk4";

/**
 * Propagate a state forward in time around a central body
 *
 * @param state Current state vector
 * @param dt Time step (s)
 * @param mu Central body gravitational parameter (m³/s²)
 * @param method Integration method
 * @returns New state vector
 */
export function propagateState(
  state: StateVector,
  dt: number,
  mu: number,
  method: IntegrationMethod = "verlet"
): StateVector {
  const accel = (pos: Vector3) => gravitationalAcceleration(pos, mu);

  switch (method) {
    case "euler":
      return integrateEuler(state, dt, accel);
    case "rk4":
      return integrateRK4(state, dt, accel);
    case "verlet":
    default:
      return integrateVerlet(state, dt, accel);
  }
}

/**
 * Propagate a state for a total duration with substeps
 *
 * @param state Initial state
 * @param totalTime Total time to propagate (s)
 * @param substeps Number of integration substeps
 * @param mu Central body gravitational parameter
 * @param method Integration method
 * @returns Final state
 */
export function propagateStateDuration(
  state: StateVector,
  totalTime: number,
  substeps: number,
  mu: number,
  method: IntegrationMethod = "verlet"
): StateVector {
  const dt = totalTime / substeps;
  let currentState = state;

  for (let i = 0; i < substeps; i++) {
    currentState = propagateState(currentState, dt, mu, method);
  }

  return currentState;
}

/**
 * Generate trajectory points by propagating orbit
 *
 * @param state Initial state
 * @param numPoints Number of points to generate
 * @param totalTime Total time span (s)
 * @param mu Central body gravitational parameter
 * @param method Integration method
 * @returns Array of positions
 */
export function generateTrajectory(
  state: StateVector,
  numPoints: number,
  totalTime: number,
  mu: number,
  method: IntegrationMethod = "verlet"
): Vector3[] {
  const points: Vector3[] = [{ ...state.position }];
  const dt = totalTime / numPoints;
  let currentState = state;

  for (let i = 1; i < numPoints; i++) {
    currentState = propagateState(currentState, dt, mu, method);
    points.push({ ...currentState.position });
  }

  return points;
}

// ============ Collision Detection ============

/**
 * Check if a position is below a given radius (collision with body surface)
 */
export function checkCollision(position: Vector3, bodyRadius: number): boolean {
  return vec3Magnitude(position) < bodyRadius;
}

/**
 * Check if orbit will escape (hyperbolic)
 */
export function checkEscape(state: StateVector, mu: number): boolean {
  const r = vec3Magnitude(state.position);
  const v = vec3Magnitude(state.velocity);
  const escapeV = Math.sqrt((2 * mu) / r);
  return v >= escapeV;
}

// ============ 2D Propagation (for simpler demos) ============

interface State2D {
  x: number;
  y: number;
  vx: number;
  vy: number;
}

/**
 * Simple 2D gravity propagation for educational demos
 */
export function propagate2D(
  state: State2D,
  dt: number,
  mu: number,
  method: IntegrationMethod = "verlet"
): State2D {
  const state3D: StateVector = {
    position: vec3(state.x, state.y, 0),
    velocity: vec3(state.vx, state.vy, 0),
  };

  const newState = propagateState(state3D, dt, mu, method);

  return {
    x: newState.position.x,
    y: newState.position.y,
    vx: newState.velocity.x,
    vy: newState.velocity.y,
  };
}

/**
 * Generate 2D trajectory for visualization
 */
export function generateTrajectory2D(
  x: number,
  y: number,
  vx: number,
  vy: number,
  numPoints: number,
  totalTime: number,
  mu: number,
  bodyRadius: number
): Array<{ x: number; y: number }> {
  const points: Array<{ x: number; y: number }> = [{ x, y }];
  let state: State2D = { x, y, vx, vy };
  const dt = totalTime / numPoints;

  for (let i = 1; i < numPoints; i++) {
    state = propagate2D(state, dt, mu, "rk4");
    points.push({ x: state.x, y: state.y });

    // Stop if we hit the body
    if (Math.sqrt(state.x * state.x + state.y * state.y) < bodyRadius) {
      break;
    }
  }

  return points;
}
