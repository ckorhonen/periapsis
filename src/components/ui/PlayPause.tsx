"use client";

interface PlayPauseProps {
  isPlaying: boolean;
  onToggle: () => void;
  onReset?: () => void;
  className?: string;
}

export function PlayPause({
  isPlaying,
  onToggle,
  onReset,
  className = "",
}: PlayPauseProps) {
  return (
    <div className={`flex items-center gap-2 ${className}`}>
      <button
        onClick={onToggle}
        className="flex items-center justify-center w-10 h-10 rounded-full
                   bg-gray-700 hover:bg-gray-600 transition-colors
                   text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
        aria-label={isPlaying ? "Pause" : "Play"}
      >
        {isPlaying ? (
          // Pause icon
          <svg
            width="16"
            height="16"
            viewBox="0 0 16 16"
            fill="currentColor"
          >
            <rect x="3" y="2" width="4" height="12" rx="1" />
            <rect x="9" y="2" width="4" height="12" rx="1" />
          </svg>
        ) : (
          // Play icon
          <svg
            width="16"
            height="16"
            viewBox="0 0 16 16"
            fill="currentColor"
          >
            <path d="M4 2.5v11l9-5.5-9-5.5z" />
          </svg>
        )}
      </button>

      {onReset && (
        <button
          onClick={onReset}
          className="flex items-center justify-center w-10 h-10 rounded-full
                     bg-gray-700 hover:bg-gray-600 transition-colors
                     text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
          aria-label="Reset"
        >
          {/* Reset icon */}
          <svg
            width="16"
            height="16"
            viewBox="0 0 16 16"
            fill="currentColor"
          >
            <path d="M8 2a6 6 0 00-6 6h2a4 4 0 118 0 4 4 0 01-4 4v2a6 6 0 006-6 6 6 0 00-6-6z" />
            <path d="M2 4v4h4L2 4z" />
          </svg>
        </button>
      )}
    </div>
  );
}
