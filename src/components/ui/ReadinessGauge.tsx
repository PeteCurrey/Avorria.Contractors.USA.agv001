import React from 'react';

export interface ReadinessGaugeProps {
  score: number; // 0 to 100
  size?: 'sm' | 'md' | 'lg';
  showLabel?: boolean;
  className?: string;
}

export function ReadinessGauge({
  score,
  size = 'md',
  showLabel = true,
  className = '',
}: ReadinessGaugeProps) {
  const clampedScore = Math.min(Math.max(score, 0), 100);

  // SVG Circle calculations
  const dimensions = {
    sm: { size: 64, stroke: 5, fontSize: 'text-sm' },
    md: { size: 96, stroke: 7, fontSize: 'text-xl' },
    lg: { size: 128, stroke: 9, fontSize: 'text-3xl' },
  };

  const { size: dimSize, stroke, fontSize } = dimensions[size];
  const radius = (dimSize - stroke) / 2;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (clampedScore / 100) * circumference;

  let colorClass = 'text-brand-500';
  if (clampedScore >= 90) colorClass = 'text-emerald-400';
  else if (clampedScore >= 70) colorClass = 'text-brand-400';
  else if (clampedScore >= 50) colorClass = 'text-amber-400';
  else colorClass = 'text-rose-400';

  return (
    <div className={`flex flex-col items-center justify-center ${className}`}>
      <div className="relative inline-flex items-center justify-center">
        <svg
          width={dimSize}
          height={dimSize}
          className="transform -rotate-90"
          aria-label={`Readiness score: ${clampedScore}%`}
        >
          {/* Background track */}
          <circle
            cx={dimSize / 2}
            cy={dimSize / 2}
            r={radius}
            strokeWidth={stroke}
            stroke="currentColor"
            fill="transparent"
            className="text-surface-border"
          />
          {/* Progress arc */}
          <circle
            cx={dimSize / 2}
            cy={dimSize / 2}
            r={radius}
            strokeWidth={stroke}
            strokeDasharray={circumference}
            strokeDashoffset={strokeDashoffset}
            strokeLinecap="round"
            stroke="currentColor"
            fill="transparent"
            className={`${colorClass} transition-all duration-700 ease-out`}
          />
        </svg>

        <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
          <span className={`font-black text-white ${fontSize}`}>
            {clampedScore}%
          </span>
        </div>
      </div>

      {showLabel && (
        <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider mt-2">
          Readiness Score
        </span>
      )}
    </div>
  );
}
