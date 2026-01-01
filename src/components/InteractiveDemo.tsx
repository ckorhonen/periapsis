"use client";

import { ReactNode, useRef, useEffect, useState } from "react";

interface InteractiveDemoProps {
  /** Demo title */
  title: string;
  /** Optional description shown below title */
  description?: string;
  /** Width of the canvas/demo area */
  width?: number;
  /** Height of the canvas/demo area */
  height?: number;
  /** Control panel content (sliders, buttons, etc.) */
  controls?: ReactNode;
  /** Info panel content (readouts, stats, etc.) */
  info?: ReactNode;
  /** The demo content (canvas, Three.js, etc.) */
  children: ReactNode;
  /** Optional className for the container */
  className?: string;
}

/**
 * Base wrapper component for all interactive demos.
 * Provides consistent layout, styling, and responsive behavior.
 */
export function InteractiveDemo({
  title,
  description,
  width = 600,
  height = 400,
  controls,
  info,
  children,
  className = "",
}: InteractiveDemoProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [scale, setScale] = useState(1);

  // Handle responsive scaling
  useEffect(() => {
    const updateScale = () => {
      if (containerRef.current) {
        const containerWidth = containerRef.current.clientWidth;
        const newScale = Math.min(1, containerWidth / width);
        setScale(newScale);
      }
    };

    updateScale();
    window.addEventListener("resize", updateScale);
    return () => window.removeEventListener("resize", updateScale);
  }, [width]);

  return (
    <div
      ref={containerRef}
      className={`my-8 rounded-xl bg-gray-900 border border-gray-800 overflow-hidden ${className}`}
    >
      {/* Header */}
      <div className="px-4 py-3 border-b border-gray-800">
        <h3 className="text-lg font-semibold text-white">{title}</h3>
        {description && (
          <p className="text-sm text-gray-400 mt-1">{description}</p>
        )}
      </div>

      {/* Main content area */}
      <div className="flex flex-col lg:flex-row">
        {/* Demo canvas area */}
        <div
          className="flex-1 flex items-center justify-center bg-gray-950 p-4"
          style={{
            minHeight: height * scale,
          }}
        >
          <div
            style={{
              width: width * scale,
              height: height * scale,
              transform: `scale(${scale})`,
              transformOrigin: "center center",
            }}
          >
            {children}
          </div>
        </div>

        {/* Side panel (controls + info) */}
        {(controls || info) && (
          <div className="w-full lg:w-64 border-t lg:border-t-0 lg:border-l border-gray-800 bg-gray-900">
            {controls && (
              <div className="p-4 border-b border-gray-800">
                <h4 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">
                  Controls
                </h4>
                <div className="space-y-4">{controls}</div>
              </div>
            )}
            {info && (
              <div className="p-4">
                <h4 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">
                  Info
                </h4>
                <div className="space-y-2 text-sm">{info}</div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

/**
 * Info row component for displaying labeled values
 */
export function InfoRow({
  label,
  value,
  unit,
}: {
  label: string;
  value: string | number;
  unit?: string;
}) {
  return (
    <div className="flex justify-between items-center">
      <span className="text-gray-400">{label}</span>
      <span className="text-white font-mono">
        {value}
        {unit && <span className="text-gray-500 ml-1 text-xs">{unit}</span>}
      </span>
    </div>
  );
}
