"use client";

import { useRef, useEffect, useState, useCallback } from "react";
import { InteractiveDemo, InfoRow } from "../InteractiveDemo";
import { Slider } from "../ui/Slider";
import { PlayPause } from "../ui/PlayPause";
import {
  initCanvas,
  clearCanvas,
  drawStars,
  drawEarth,
  drawCircle,
  drawPath,
  drawArrow,
  drawTextPixels,
  CanvasContext,
} from "@/lib/render/canvas2d";
import { generateTrajectory2D } from "@/lib/orbital/propagate";
import { circularVelocity, escapeVelocity } from "@/lib/orbital/kepler";
import { EARTH } from "@/lib/orbital/types";

const CANVAS_WIDTH = 600;
const CANVAS_HEIGHT = 500;

// Scaled Earth for visualization (much smaller than real)
const VISUAL_EARTH_RADIUS = 100; // pixels
const SCALE_FACTOR = EARTH.radius / VISUAL_EARTH_RADIUS;

// Mountain height where cannon is placed
const MOUNTAIN_HEIGHT = VISUAL_EARTH_RADIUS * 0.15;
const LAUNCH_RADIUS = VISUAL_EARTH_RADIUS + MOUNTAIN_HEIGHT;

// Convert display velocity to real velocity
const VELOCITY_SCALE = 1000; // 1 display unit = 1000 m/s

interface TrajectoryResult {
  points: Array<{ x: number; y: number }>;
  outcome: "crash" | "orbit" | "escape";
  orbitType?: string;
}

export function NewtonCannonball() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const contextRef = useRef<CanvasContext | null>(null);
  const animationRef = useRef<number>(0);

  // State
  const [velocity, setVelocity] = useState(5.5); // display units (km/s)
  const [isPlaying, setIsPlaying] = useState(false);
  const [animationProgress, setAnimationProgress] = useState(0);
  const [trajectory, setTrajectory] = useState<TrajectoryResult | null>(null);

  // Real physics values
  const realLaunchRadius = LAUNCH_RADIUS * SCALE_FACTOR;
  const realVelocity = velocity * VELOCITY_SCALE;
  const vCircular = circularVelocity(realLaunchRadius, EARTH.mu) / VELOCITY_SCALE;
  const vEscape = escapeVelocity(realLaunchRadius, EARTH.mu) / VELOCITY_SCALE;

  // Calculate trajectory
  const calculateTrajectory = useCallback(() => {
    const realVel = velocity * VELOCITY_SCALE;
    const realRadius = LAUNCH_RADIUS * SCALE_FACTOR;

    // Initial position at top of mountain (top of Earth + mountain)
    const x0 = 0;
    const y0 = realRadius;
    // Velocity is horizontal (tangent to surface)
    const vx0 = realVel;
    const vy0 = 0;

    // Generate trajectory points
    const simTime = 20000; // seconds
    const numPoints = 2000;
    const points = generateTrajectory2D(
      x0,
      y0,
      vx0,
      vy0,
      numPoints,
      simTime,
      EARTH.mu,
      EARTH.radius
    );

    // Scale points for display
    const scaledPoints = points.map((p) => ({
      x: p.x / SCALE_FACTOR,
      y: p.y / SCALE_FACTOR,
    }));

    // Determine outcome
    let outcome: "crash" | "orbit" | "escape";
    let orbitType: string | undefined;

    if (realVel >= vEscape * VELOCITY_SCALE * 0.99) {
      outcome = "escape";
      orbitType = "Hyperbolic escape";
    } else {
      // Check if trajectory hits Earth
      const lastPoint = points[points.length - 1];
      const lastRadius = Math.sqrt(
        lastPoint.x * lastPoint.x + lastPoint.y * lastPoint.y
      );

      // Check if any point crosses back near starting altitude
      // (indicating a complete orbit)
      let completedOrbit = false;
      let crashed = false;

      for (let i = 1; i < points.length; i++) {
        const r = Math.sqrt(
          points[i].x * points[i].x + points[i].y * points[i].y
        );

        if (r < EARTH.radius) {
          crashed = true;
          break;
        }

        // Check if we've completed approximately one orbit
        // by seeing if we come back near starting position
        if (i > numPoints / 4) {
          const distFromStart = Math.sqrt(
            (points[i].x - x0) ** 2 + (points[i].y - y0) ** 2
          );
          if (distFromStart < realRadius * 0.1) {
            completedOrbit = true;
            break;
          }
        }
      }

      if (crashed) {
        outcome = "crash";
      } else if (completedOrbit || realVel >= vCircular * VELOCITY_SCALE * 0.95) {
        outcome = "orbit";
        if (Math.abs(realVel - vCircular * VELOCITY_SCALE) < 200) {
          orbitType = "Circular orbit";
        } else {
          orbitType = "Elliptical orbit";
        }
      } else {
        outcome = "crash";
      }
    }

    return { points: scaledPoints, outcome, orbitType };
  }, [velocity, vCircular, vEscape]);

  // Update trajectory when velocity changes
  useEffect(() => {
    const result = calculateTrajectory();
    setTrajectory(result);
    setAnimationProgress(0);
    setIsPlaying(false);
  }, [calculateTrajectory]);

  // Animation loop
  useEffect(() => {
    if (!isPlaying || !trajectory) return;

    const startTime = Date.now();
    const duration = 3000; // 3 seconds for full animation

    const animate = () => {
      const elapsed = Date.now() - startTime;
      const progress = Math.min(elapsed / duration, 1);
      setAnimationProgress(progress);

      if (progress < 1) {
        animationRef.current = requestAnimationFrame(animate);
      } else {
        setIsPlaying(false);
      }
    };

    animationRef.current = requestAnimationFrame(animate);

    return () => {
      cancelAnimationFrame(animationRef.current);
    };
  }, [isPlaying, trajectory]);

  // Render
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    if (!contextRef.current) {
      contextRef.current = initCanvas(canvas, CANVAS_WIDTH, CANVAS_HEIGHT);
      contextRef.current.scale = 1;
      contextRef.current.centerX = CANVAS_WIDTH / 2;
      contextRef.current.centerY = CANVAS_HEIGHT / 2 + 50; // Offset down to show more trajectory
    }

    const context = contextRef.current;
    clearCanvas(context, "#0a0a12");
    drawStars(context);

    // Draw Earth
    drawEarth(context, VISUAL_EARTH_RADIUS);

    // Draw mountain (small triangle at top)
    const { ctx, centerX, centerY } = context;
    const mountainTop = centerY - LAUNCH_RADIUS;
    ctx.beginPath();
    ctx.moveTo(centerX - 15, centerY - VISUAL_EARTH_RADIUS);
    ctx.lineTo(centerX, mountainTop);
    ctx.lineTo(centerX + 15, centerY - VISUAL_EARTH_RADIUS);
    ctx.closePath();
    ctx.fillStyle = "#4a3728";
    ctx.fill();

    // Draw cannon
    ctx.fillStyle = "#333";
    ctx.fillRect(centerX - 3, mountainTop - 10, 20, 6);

    // Draw trajectory
    if (trajectory) {
      const pointsToDraw = Math.floor(
        trajectory.points.length * animationProgress
      );
      const visiblePoints = trajectory.points.slice(0, Math.max(pointsToDraw, 2));

      // Color based on outcome
      let pathColor = "#666";
      if (trajectory.outcome === "crash") pathColor = "#ff6b6b";
      if (trajectory.outcome === "orbit") pathColor = "#4ecdc4";
      if (trajectory.outcome === "escape") pathColor = "#ffd93d";

      drawPath(context, visiblePoints, pathColor, 2);

      // Draw cannonball at current position
      if (pointsToDraw > 0 && pointsToDraw < trajectory.points.length) {
        const currentPoint = trajectory.points[pointsToDraw - 1];
        drawCircle(context, currentPoint.x, currentPoint.y, 4, "#fff");
      }
    }

    // Draw velocity vector from cannon
    const velocityArrowScale = 8;
    drawArrow(
      context,
      10,
      LAUNCH_RADIUS,
      10 + velocity * velocityArrowScale,
      LAUNCH_RADIUS,
      "#3b82f6",
      2,
      8
    );

    // Draw orbital velocity reference line
    const vCircDisplay = vCircular * velocityArrowScale;
    ctx.setLineDash([4, 4]);
    ctx.beginPath();
    ctx.moveTo(centerX + 10 + vCircDisplay, mountainTop - 20);
    ctx.lineTo(centerX + 10 + vCircDisplay, mountainTop + 20);
    ctx.strokeStyle = "#4ecdc4";
    ctx.lineWidth = 1;
    ctx.stroke();
    ctx.setLineDash([]);

    // Labels
    drawTextPixels(context, "Orbital velocity", centerX + 10 + vCircDisplay + 5, mountainTop - 25, "#4ecdc4", 10, "left");

    // Outcome label
    if (trajectory && animationProgress > 0) {
      let outcomeText = "";
      let outcomeColor = "#fff";

      if (trajectory.outcome === "crash") {
        outcomeText = "Impact!";
        outcomeColor = "#ff6b6b";
      } else if (trajectory.outcome === "orbit") {
        outcomeText = trajectory.orbitType || "Orbit achieved!";
        outcomeColor = "#4ecdc4";
      } else if (trajectory.outcome === "escape") {
        outcomeText = "Escape trajectory!";
        outcomeColor = "#ffd93d";
      }

      if (animationProgress === 1) {
        drawTextPixels(
          context,
          outcomeText,
          CANVAS_WIDTH / 2,
          30,
          outcomeColor,
          16,
          "center"
        );
      }
    }

    // Instructions
    drawTextPixels(
      context,
      "Adjust velocity to achieve orbit",
      CANVAS_WIDTH / 2,
      CANVAS_HEIGHT - 20,
      "#666",
      12,
      "center"
    );
  }, [velocity, trajectory, animationProgress, vCircular]);

  const handleReset = () => {
    setAnimationProgress(0);
    setIsPlaying(false);
  };

  const formatVelocity = (v: number) => v.toFixed(1);

  return (
    <InteractiveDemo
      title="Newton's Cannonball"
      description="Fire a cannon from a mountaintop. At the right velocity, the cannonball falls around the Earth instead of into it."
      width={CANVAS_WIDTH}
      height={CANVAS_HEIGHT}
      controls={
        <>
          <Slider
            label="Launch Velocity"
            value={velocity}
            min={1}
            max={12}
            step={0.1}
            onChange={setVelocity}
            formatValue={formatVelocity}
            unit="km/s"
          />
          <div className="pt-2">
            <PlayPause
              isPlaying={isPlaying}
              onToggle={() => setIsPlaying(!isPlaying)}
              onReset={handleReset}
            />
          </div>
        </>
      }
      info={
        <>
          <InfoRow
            label="Velocity"
            value={formatVelocity(velocity)}
            unit="km/s"
          />
          <InfoRow
            label="Orbital velocity"
            value={formatVelocity(vCircular)}
            unit="km/s"
          />
          <InfoRow
            label="Escape velocity"
            value={formatVelocity(vEscape)}
            unit="km/s"
          />
          <div className="mt-3 pt-3 border-t border-gray-700">
            <div className="flex items-center gap-2 text-xs">
              <span
                className="w-3 h-3 rounded-full"
                style={{ backgroundColor: "#ff6b6b" }}
              />
              <span className="text-gray-400">Impact</span>
            </div>
            <div className="flex items-center gap-2 text-xs mt-1">
              <span
                className="w-3 h-3 rounded-full"
                style={{ backgroundColor: "#4ecdc4" }}
              />
              <span className="text-gray-400">Orbit</span>
            </div>
            <div className="flex items-center gap-2 text-xs mt-1">
              <span
                className="w-3 h-3 rounded-full"
                style={{ backgroundColor: "#ffd93d" }}
              />
              <span className="text-gray-400">Escape</span>
            </div>
          </div>
        </>
      }
    >
      <canvas
        ref={canvasRef}
        style={{ width: CANVAS_WIDTH, height: CANVAS_HEIGHT }}
      />
    </InteractiveDemo>
  );
}
