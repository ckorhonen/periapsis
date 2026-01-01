/**
 * 2D Canvas rendering utilities for orbital mechanics demos
 */

export interface CanvasContext {
  ctx: CanvasRenderingContext2D;
  width: number;
  height: number;
  /** Scale factor: pixels per meter */
  scale: number;
  /** Center offset in pixels */
  centerX: number;
  centerY: number;
}

/**
 * Initialize canvas with proper scaling for high DPI displays
 */
export function initCanvas(
  canvas: HTMLCanvasElement,
  width: number,
  height: number
): CanvasContext {
  const dpr = window.devicePixelRatio || 1;

  canvas.width = width * dpr;
  canvas.height = height * dpr;
  canvas.style.width = `${width}px`;
  canvas.style.height = `${height}px`;

  const ctx = canvas.getContext("2d")!;
  ctx.scale(dpr, dpr);

  return {
    ctx,
    width,
    height,
    scale: 1,
    centerX: width / 2,
    centerY: height / 2,
  };
}

/**
 * Clear canvas with background color
 */
export function clearCanvas(context: CanvasContext, color: string = "#0a0a0f") {
  const { ctx, width, height } = context;
  ctx.fillStyle = color;
  ctx.fillRect(0, 0, width, height);
}

/**
 * Convert world coordinates (meters) to canvas pixels
 */
export function worldToCanvas(
  context: CanvasContext,
  x: number,
  y: number
): { x: number; y: number } {
  return {
    x: context.centerX + x * context.scale,
    y: context.centerY - y * context.scale, // Flip Y for standard coordinate system
  };
}

/**
 * Convert canvas pixels to world coordinates
 */
export function canvasToWorld(
  context: CanvasContext,
  x: number,
  y: number
): { x: number; y: number } {
  return {
    x: (x - context.centerX) / context.scale,
    y: (context.centerY - y) / context.scale,
  };
}

/**
 * Draw a circle
 */
export function drawCircle(
  context: CanvasContext,
  worldX: number,
  worldY: number,
  worldRadius: number,
  fillColor?: string,
  strokeColor?: string,
  lineWidth: number = 1
) {
  const { ctx } = context;
  const pos = worldToCanvas(context, worldX, worldY);
  const radius = worldRadius * context.scale;

  ctx.beginPath();
  ctx.arc(pos.x, pos.y, Math.max(radius, 1), 0, Math.PI * 2);

  if (fillColor) {
    ctx.fillStyle = fillColor;
    ctx.fill();
  }

  if (strokeColor) {
    ctx.strokeStyle = strokeColor;
    ctx.lineWidth = lineWidth;
    ctx.stroke();
  }
}

/**
 * Draw a line between two world points
 */
export function drawLine(
  context: CanvasContext,
  x1: number,
  y1: number,
  x2: number,
  y2: number,
  color: string,
  lineWidth: number = 1,
  dashed: boolean = false
) {
  const { ctx } = context;
  const start = worldToCanvas(context, x1, y1);
  const end = worldToCanvas(context, x2, y2);

  ctx.beginPath();
  ctx.moveTo(start.x, start.y);
  ctx.lineTo(end.x, end.y);
  ctx.strokeStyle = color;
  ctx.lineWidth = lineWidth;

  if (dashed) {
    ctx.setLineDash([5, 5]);
  } else {
    ctx.setLineDash([]);
  }

  ctx.stroke();
  ctx.setLineDash([]);
}

/**
 * Draw an arrow (for velocity/force vectors)
 */
export function drawArrow(
  context: CanvasContext,
  startX: number,
  startY: number,
  endX: number,
  endY: number,
  color: string,
  lineWidth: number = 2,
  headSize: number = 8
) {
  const { ctx } = context;
  const start = worldToCanvas(context, startX, startY);
  const end = worldToCanvas(context, endX, endY);

  const dx = end.x - start.x;
  const dy = end.y - start.y;
  const angle = Math.atan2(dy, dx);

  // Draw line
  ctx.beginPath();
  ctx.moveTo(start.x, start.y);
  ctx.lineTo(end.x, end.y);
  ctx.strokeStyle = color;
  ctx.lineWidth = lineWidth;
  ctx.stroke();

  // Draw arrowhead
  ctx.beginPath();
  ctx.moveTo(end.x, end.y);
  ctx.lineTo(
    end.x - headSize * Math.cos(angle - Math.PI / 6),
    end.y - headSize * Math.sin(angle - Math.PI / 6)
  );
  ctx.lineTo(
    end.x - headSize * Math.cos(angle + Math.PI / 6),
    end.y - headSize * Math.sin(angle + Math.PI / 6)
  );
  ctx.closePath();
  ctx.fillStyle = color;
  ctx.fill();
}

/**
 * Draw a path/trajectory from array of points
 */
export function drawPath(
  context: CanvasContext,
  points: Array<{ x: number; y: number }>,
  color: string,
  lineWidth: number = 1,
  dashed: boolean = false
) {
  if (points.length < 2) return;

  const { ctx } = context;

  ctx.beginPath();
  const first = worldToCanvas(context, points[0].x, points[0].y);
  ctx.moveTo(first.x, first.y);

  for (let i = 1; i < points.length; i++) {
    const point = worldToCanvas(context, points[i].x, points[i].y);
    ctx.lineTo(point.x, point.y);
  }

  ctx.strokeStyle = color;
  ctx.lineWidth = lineWidth;

  if (dashed) {
    ctx.setLineDash([5, 5]);
  } else {
    ctx.setLineDash([]);
  }

  ctx.stroke();
  ctx.setLineDash([]);
}

/**
 * Draw an ellipse orbit
 */
export function drawOrbit(
  context: CanvasContext,
  semiMajorAxis: number,
  eccentricity: number,
  rotation: number = 0,
  color: string = "#ffffff",
  lineWidth: number = 1,
  dashed: boolean = false
) {
  const { ctx, centerX, centerY, scale } = context;

  const a = semiMajorAxis * scale;
  const b = a * Math.sqrt(1 - eccentricity * eccentricity);
  const c = a * eccentricity; // Distance from center to focus

  ctx.save();
  ctx.translate(centerX, centerY);
  ctx.rotate(-rotation); // Negative because canvas Y is flipped
  ctx.translate(-c, 0); // Move so focus is at origin

  ctx.beginPath();
  ctx.ellipse(0, 0, a, b, 0, 0, Math.PI * 2);
  ctx.strokeStyle = color;
  ctx.lineWidth = lineWidth;

  if (dashed) {
    ctx.setLineDash([5, 5]);
  } else {
    ctx.setLineDash([]);
  }

  ctx.stroke();
  ctx.setLineDash([]);
  ctx.restore();
}

/**
 * Draw text at world coordinates
 */
export function drawText(
  context: CanvasContext,
  text: string,
  worldX: number,
  worldY: number,
  color: string = "#ffffff",
  fontSize: number = 12,
  align: CanvasTextAlign = "left",
  baseline: CanvasTextBaseline = "middle"
) {
  const { ctx } = context;
  const pos = worldToCanvas(context, worldX, worldY);

  ctx.font = `${fontSize}px system-ui, sans-serif`;
  ctx.fillStyle = color;
  ctx.textAlign = align;
  ctx.textBaseline = baseline;
  ctx.fillText(text, pos.x, pos.y);
}

/**
 * Draw text at canvas coordinates (pixels)
 */
export function drawTextPixels(
  context: CanvasContext,
  text: string,
  x: number,
  y: number,
  color: string = "#ffffff",
  fontSize: number = 12,
  align: CanvasTextAlign = "left",
  baseline: CanvasTextBaseline = "middle"
) {
  const { ctx } = context;

  ctx.font = `${fontSize}px system-ui, sans-serif`;
  ctx.fillStyle = color;
  ctx.textAlign = align;
  ctx.textBaseline = baseline;
  ctx.fillText(text, x, y);
}

/**
 * Draw stars in background
 */
export function drawStars(context: CanvasContext, seed: number = 42) {
  const { ctx, width, height } = context;

  // Simple pseudo-random based on seed
  const random = (n: number) => {
    const x = Math.sin(seed + n) * 10000;
    return x - Math.floor(x);
  };

  const starCount = 100;
  for (let i = 0; i < starCount; i++) {
    const x = random(i) * width;
    const y = random(i + 100) * height;
    const size = random(i + 200) * 1.5 + 0.5;
    const brightness = random(i + 300) * 0.5 + 0.3;

    ctx.beginPath();
    ctx.arc(x, y, size, 0, Math.PI * 2);
    ctx.fillStyle = `rgba(255, 255, 255, ${brightness})`;
    ctx.fill();
  }
}

/**
 * Draw Earth with basic shading
 */
export function drawEarth(
  context: CanvasContext,
  radius: number,
  x: number = 0,
  y: number = 0
) {
  const { ctx } = context;
  const pos = worldToCanvas(context, x, y);
  const r = radius * context.scale;

  // Create radial gradient for 3D effect
  const gradient = ctx.createRadialGradient(
    pos.x - r * 0.3,
    pos.y - r * 0.3,
    0,
    pos.x,
    pos.y,
    r
  );
  gradient.addColorStop(0, "#6BB5FF");
  gradient.addColorStop(0.5, "#4A90D9");
  gradient.addColorStop(1, "#1E3A5F");

  ctx.beginPath();
  ctx.arc(pos.x, pos.y, r, 0, Math.PI * 2);
  ctx.fillStyle = gradient;
  ctx.fill();

  // Add atmosphere glow
  const atmosphereGradient = ctx.createRadialGradient(
    pos.x,
    pos.y,
    r * 0.95,
    pos.x,
    pos.y,
    r * 1.15
  );
  atmosphereGradient.addColorStop(0, "rgba(135, 206, 250, 0.3)");
  atmosphereGradient.addColorStop(1, "rgba(135, 206, 250, 0)");

  ctx.beginPath();
  ctx.arc(pos.x, pos.y, r * 1.15, 0, Math.PI * 2);
  ctx.fillStyle = atmosphereGradient;
  ctx.fill();
}
