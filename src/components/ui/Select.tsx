import React from 'react';

export interface SelectOption {
  value: string;
  label: string;
}

export interface SelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  label?: string;
  options: SelectOption[];
  error?: string;
  variant?: 'light' | 'dark';
}

export const Select = React.forwardRef<HTMLSelectElement, SelectProps>(
  ({ label, options, error, className = '', id, variant = 'light', ...props }, ref) => {
    const selectId = id || (label ? label.toLowerCase().replace(/\s+/g, '-') : undefined);
    const isDark = variant === 'dark';

    return (
      <div className="space-y-1.5 w-full">
        {label && (
          <label
            htmlFor={selectId}
            className={`block text-xs font-medium ${
              isDark ? 'text-slate-300' : 'text-slate-700'
            }`}
          >
            {label}
          </label>
        )}
        <select
          ref={ref}
          id={selectId}
          className={`w-full rounded-[6px] text-xs sm:text-sm px-3.5 py-2.5 transition-all duration-150 focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-600 ${
            isDark
              ? 'bg-surface-subtle border-surface-border text-white hover:border-surface-borderLight'
              : 'bg-white border-slate-300 text-navy-900 hover:border-slate-400'
          } ${
            error ? 'border-rose-500 focus:border-rose-500 focus:ring-rose-500/20' : ''
          } ${className}`}
          {...props}
        >
          {options.map((opt) => (
            <option
              key={opt.value}
              value={opt.value}
              className={isDark ? 'bg-surface-card text-white' : 'bg-white text-navy-900'}
            >
              {opt.label}
            </option>
          ))}
        </select>
        {error && <p className="text-[11px] text-rose-600">{error}</p>}
      </div>
    );
  }
);

Select.displayName = 'Select';
