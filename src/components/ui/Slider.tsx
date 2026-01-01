"use client";

import { useId } from "react";

interface SliderProps {
  label: string;
  value: number;
  min: number;
  max: number;
  step?: number;
  onChange: (value: number) => void;
  formatValue?: (value: number) => string;
  unit?: string;
  className?: string;
}

export function Slider({
  label,
  value,
  min,
  max,
  step = 1,
  onChange,
  formatValue,
  unit,
  className = "",
}: SliderProps) {
  const id = useId();

  const displayValue = formatValue ? formatValue(value) : value.toString();

  return (
    <div className={`flex flex-col gap-1 ${className}`}>
      <div className="flex justify-between items-center text-sm">
        <label htmlFor={id} className="text-gray-300 font-medium">
          {label}
        </label>
        <span className="text-gray-400 font-mono text-xs">
          {displayValue}
          {unit && <span className="text-gray-500 ml-1">{unit}</span>}
        </span>
      </div>
      <input
        id={id}
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={(e) => onChange(parseFloat(e.target.value))}
        className="w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer
                   [&::-webkit-slider-thumb]:appearance-none
                   [&::-webkit-slider-thumb]:w-4
                   [&::-webkit-slider-thumb]:h-4
                   [&::-webkit-slider-thumb]:bg-blue-500
                   [&::-webkit-slider-thumb]:rounded-full
                   [&::-webkit-slider-thumb]:cursor-pointer
                   [&::-webkit-slider-thumb]:hover:bg-blue-400
                   [&::-webkit-slider-thumb]:transition-colors
                   [&::-moz-range-thumb]:w-4
                   [&::-moz-range-thumb]:h-4
                   [&::-moz-range-thumb]:bg-blue-500
                   [&::-moz-range-thumb]:rounded-full
                   [&::-moz-range-thumb]:cursor-pointer
                   [&::-moz-range-thumb]:border-0"
      />
    </div>
  );
}
