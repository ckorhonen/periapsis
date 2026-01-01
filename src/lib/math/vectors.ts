/**
 * Vector math utilities for orbital mechanics
 */

import type { Vector2, Vector3 } from "../orbital/types";

// ============ Vector3 Operations ============

export function vec3(x: number, y: number, z: number): Vector3 {
  return { x, y, z };
}

export function vec3Zero(): Vector3 {
  return { x: 0, y: 0, z: 0 };
}

export function vec3Add(a: Vector3, b: Vector3): Vector3 {
  return { x: a.x + b.x, y: a.y + b.y, z: a.z + b.z };
}

export function vec3Sub(a: Vector3, b: Vector3): Vector3 {
  return { x: a.x - b.x, y: a.y - b.y, z: a.z - b.z };
}

export function vec3Scale(v: Vector3, s: number): Vector3 {
  return { x: v.x * s, y: v.y * s, z: v.z * s };
}

export function vec3Dot(a: Vector3, b: Vector3): number {
  return a.x * b.x + a.y * b.y + a.z * b.z;
}

export function vec3Cross(a: Vector3, b: Vector3): Vector3 {
  return {
    x: a.y * b.z - a.z * b.y,
    y: a.z * b.x - a.x * b.z,
    z: a.x * b.y - a.y * b.x,
  };
}

export function vec3Magnitude(v: Vector3): number {
  return Math.sqrt(v.x * v.x + v.y * v.y + v.z * v.z);
}

export function vec3MagnitudeSq(v: Vector3): number {
  return v.x * v.x + v.y * v.y + v.z * v.z;
}

export function vec3Normalize(v: Vector3): Vector3 {
  const mag = vec3Magnitude(v);
  if (mag === 0) return vec3Zero();
  return vec3Scale(v, 1 / mag);
}

export function vec3Distance(a: Vector3, b: Vector3): number {
  return vec3Magnitude(vec3Sub(a, b));
}

export function vec3Lerp(a: Vector3, b: Vector3, t: number): Vector3 {
  return {
    x: a.x + (b.x - a.x) * t,
    y: a.y + (b.y - a.y) * t,
    z: a.z + (b.z - a.z) * t,
  };
}

export function vec3Negate(v: Vector3): Vector3 {
  return { x: -v.x, y: -v.y, z: -v.z };
}

/** Rotate vector around Z axis */
export function vec3RotateZ(v: Vector3, angle: number): Vector3 {
  const cos = Math.cos(angle);
  const sin = Math.sin(angle);
  return {
    x: v.x * cos - v.y * sin,
    y: v.x * sin + v.y * cos,
    z: v.z,
  };
}

/** Rotate vector around X axis */
export function vec3RotateX(v: Vector3, angle: number): Vector3 {
  const cos = Math.cos(angle);
  const sin = Math.sin(angle);
  return {
    x: v.x,
    y: v.y * cos - v.z * sin,
    z: v.y * sin + v.z * cos,
  };
}

/** Rotate vector around Y axis */
export function vec3RotateY(v: Vector3, angle: number): Vector3 {
  const cos = Math.cos(angle);
  const sin = Math.sin(angle);
  return {
    x: v.x * cos + v.z * sin,
    y: v.y,
    z: -v.x * sin + v.z * cos,
  };
}

// ============ Vector2 Operations ============

export function vec2(x: number, y: number): Vector2 {
  return { x, y };
}

export function vec2Zero(): Vector2 {
  return { x: 0, y: 0 };
}

export function vec2Add(a: Vector2, b: Vector2): Vector2 {
  return { x: a.x + b.x, y: a.y + b.y };
}

export function vec2Sub(a: Vector2, b: Vector2): Vector2 {
  return { x: a.x - b.x, y: a.y - b.y };
}

export function vec2Scale(v: Vector2, s: number): Vector2 {
  return { x: v.x * s, y: v.y * s };
}

export function vec2Dot(a: Vector2, b: Vector2): number {
  return a.x * b.x + a.y * b.y;
}

export function vec2Magnitude(v: Vector2): number {
  return Math.sqrt(v.x * v.x + v.y * v.y);
}

export function vec2MagnitudeSq(v: Vector2): number {
  return v.x * v.x + v.y * v.y;
}

export function vec2Normalize(v: Vector2): Vector2 {
  const mag = vec2Magnitude(v);
  if (mag === 0) return vec2Zero();
  return vec2Scale(v, 1 / mag);
}

export function vec2Distance(a: Vector2, b: Vector2): number {
  return vec2Magnitude(vec2Sub(a, b));
}

export function vec2Rotate(v: Vector2, angle: number): Vector2 {
  const cos = Math.cos(angle);
  const sin = Math.sin(angle);
  return {
    x: v.x * cos - v.y * sin,
    y: v.x * sin + v.y * cos,
  };
}

export function vec2Perpendicular(v: Vector2): Vector2 {
  return { x: -v.y, y: v.x };
}

export function vec2Angle(v: Vector2): number {
  return Math.atan2(v.y, v.x);
}

export function vec2FromAngle(angle: number, magnitude: number = 1): Vector2 {
  return {
    x: Math.cos(angle) * magnitude,
    y: Math.sin(angle) * magnitude,
  };
}

export function vec2Lerp(a: Vector2, b: Vector2, t: number): Vector2 {
  return {
    x: a.x + (b.x - a.x) * t,
    y: a.y + (b.y - a.y) * t,
  };
}

// ============ Conversion ============

export function vec3To2D(v: Vector3): Vector2 {
  return { x: v.x, y: v.y };
}

export function vec2To3D(v: Vector2, z: number = 0): Vector3 {
  return { x: v.x, y: v.y, z };
}

// ============ Math utilities ============

export function clamp(value: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, value));
}

export function lerp(a: number, b: number, t: number): number {
  return a + (b - a) * t;
}

export function map(
  value: number,
  inMin: number,
  inMax: number,
  outMin: number,
  outMax: number
): number {
  return ((value - inMin) / (inMax - inMin)) * (outMax - outMin) + outMin;
}

/** Normalize angle to [0, 2π) */
export function normalizeAngle(angle: number): number {
  const TWO_PI = 2 * Math.PI;
  angle = angle % TWO_PI;
  return angle < 0 ? angle + TWO_PI : angle;
}

/** Normalize angle to [-π, π) */
export function normalizeAngleSigned(angle: number): number {
  const TWO_PI = 2 * Math.PI;
  angle = ((angle + Math.PI) % TWO_PI) - Math.PI;
  return angle < -Math.PI ? angle + TWO_PI : angle;
}

/** Convert degrees to radians */
export function degToRad(deg: number): number {
  return (deg * Math.PI) / 180;
}

/** Convert radians to degrees */
export function radToDeg(rad: number): number {
  return (rad * 180) / Math.PI;
}
