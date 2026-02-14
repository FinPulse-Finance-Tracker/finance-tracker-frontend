import React from 'react';
import { cn } from '../../utils/cn';

export const Input = React.forwardRef(({ className, label, error, ...props }, ref) => {
    return (
        <div className="w-full space-y-1.5">
            {label && (
                <label className="text-sm font-medium text-zinc-400 ml-1">
                    {label}
                </label>
            )}
            <input
                ref={ref}
                className={cn(
                    'flex h-10 w-full rounded-lg border border-zinc-800 bg-zinc-900/50 px-3 py-2 text-sm text-white ring-offset-black file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-zinc-500 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-purple-600 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 transition-all duration-200',
                    error && 'border-red-500/50 focus-visible:ring-red-500',
                    className
                )}
                {...props}
            />
            {error && (
                <p className="text-xs text-red-400 mt-1 ml-1">{error}</p>
            )}
        </div>
    );
});

Input.displayName = 'Input';

export const Select = React.forwardRef(({ className, label, error, children, ...props }, ref) => {
    return (
        <div className="w-full space-y-1.5">
            {label && (
                <label className="text-sm font-medium text-zinc-400 ml-1">
                    {label}
                </label>
            )}
            <select
                ref={ref}
                className={cn(
                    'flex h-10 w-full rounded-lg border border-zinc-800 bg-zinc-900/50 px-3 py-2 text-sm text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-purple-600 transition-all duration-200 appearance-none',
                    error && 'border-red-500/50 focus-visible:ring-red-500',
                    className
                )}
                {...props}
            >
                {children}
            </select>
            {error && (
                <p className="text-xs text-red-400 mt-1 ml-1">{error}</p>
            )}
        </div>
    );
});

Select.displayName = 'Select';
