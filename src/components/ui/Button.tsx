import React from 'react';
import Link from 'next/link';

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'secondary-dark' | 'outline' | 'outline-white' | 'ghost' | 'danger';
  size?: 'sm' | 'md' | 'lg';
  href?: string;
  target?: string;
  icon?: React.ReactNode;
  iconPosition?: 'left' | 'right';
  isLoading?: boolean;
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      children,
      className = '',
      variant = 'primary',
      size = 'md',
      href,
      target,
      icon,
      iconPosition = 'left',
      isLoading = false,
      disabled,
      ...props
    },
    ref
  ) => {
    const baseStyles =
      'inline-flex items-center justify-center font-normal rounded-[6px] tracking-tight transition-all duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-600 focus-visible:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed select-none active:scale-[0.99]';

    const variants = {
      primary:
        'bg-brand-600 hover:bg-brand-700 text-white shadow-sm border border-brand-700/50',
      secondary:
        'bg-white hover:bg-slate-50 text-navy-900 border border-slate-300 shadow-sm dark:bg-surface-elevated dark:hover:bg-surface-card dark:text-slate-200 dark:border-surface-border dark:shadow-none',
      'secondary-dark':
        'bg-white/[0.08] hover:bg-white/[0.14] text-white border border-white/20',
      outline:
        'bg-transparent hover:bg-slate-100 text-navy-900 border border-slate-300 dark:text-slate-200 dark:border-surface-border dark:hover:bg-surface-elevated',
      'outline-white':
        'bg-transparent hover:bg-white/10 text-white border border-white/30',
      ghost:
        'bg-transparent hover:bg-slate-100 text-slate-700 hover:text-navy-900 dark:text-slate-300 dark:hover:bg-surface-elevated dark:hover:text-white',
      danger:
        'bg-rose-600 hover:bg-rose-700 text-white border border-rose-700/50',
    };

    const sizes = {
      sm: 'text-xs h-8 px-3 gap-1.5',
      md: 'text-sm h-10 px-4 gap-2',
      lg: 'text-base h-12 px-6 gap-2.5',
    };

    const combinedClasses = `${baseStyles} ${variants[variant]} ${sizes[size]} ${className}`;

    const content = (
      <>
        {isLoading && (
          <span className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
        )}
        {!isLoading && icon && iconPosition === 'left' && <span>{icon}</span>}
        <span>{children}</span>
        {!isLoading && icon && iconPosition === 'right' && <span>{icon}</span>}
      </>
    );

    if (href) {
      return (
        <Link href={href} target={target} className={combinedClasses}>
          {content}
        </Link>
      );
    }

    return (
      <button
        ref={ref}
        disabled={disabled || isLoading}
        className={combinedClasses}
        {...props}
      >
        {content}
      </button>
    );
  }
);

Button.displayName = 'Button';
