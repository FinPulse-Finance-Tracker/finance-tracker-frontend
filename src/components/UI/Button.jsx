import React from 'react';
import { cn } from '../../utils/cn';

export const Button = React.forwardRef(({ className, variant = 'primary', size = 'md', isLoading, children, ...props }, ref) => {
    const variants = {
        primary: 'bg-purple-600 text-white hover:bg-purple-700 shadow-[0_0_15px_rgba(147,51,234,0.4)]',
        secondary: 'bg-zinc-900 text-zinc-300 border border-zinc-800 hover:bg-zinc-800',
        outline: 'bg-transparent border border-purple-600 text-purple-400 hover:bg-purple-600/10',
        ghost: 'bg-transparent text-zinc-400 hover:text-white hover:bg-zinc-900',
        danger: 'bg-red-900/20 text-red-400 border border-red-500/20 hover:bg-red-900/30 hover:border-red-500/50',
    };

    const sizes = {
        sm: 'px-3 py-1.5 text-xs',
        md: 'px-4 py-2 text-sm',
        lg: 'px-6 py-3 text-base',
    };

    return (
        <button
            ref={ref}
            disabled={isLoading || props.disabled}
            className={cn(
                'inline-flex items-center justify-center rounded-lg font-medium transition-all duration-200 active:scale-95 disabled:opacity-50 disabled:pointer-events-none gap-2',
                variants[variant],
                sizes[size],
                className
            )}
            {...props}
        >
            {isLoading && (
                <div className="w-4 h-4 border-2 border-white/20 border-t-white rounded-full animate-spin" />
            )}
            {children}
        </button>
    );
});

Button.displayName = 'Button';
