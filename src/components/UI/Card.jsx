import React from 'react';
import { cn } from '../../utils/cn';

export const Card = ({ className, children, hoverEffect = true }) => {
    return (
        <div className={cn(
            'bg-zinc-900/50 border border-zinc-800 backdrop-blur-sm rounded-xl overflow-hidden transition-all duration-300',
            hoverEffect && 'hover:border-purple-500/30 hover:bg-zinc-900/70 hover:shadow-[0_0_30px_rgba(147,51,234,0.1)]',
            className
        )}>
            {children}
        </div>
    );
};

export const CardHeader = ({ className, children }) => (
    <div className={cn('p-6 border-b border-zinc-800/50', className)}>{children}</div>
);

export const CardBody = ({ className, children }) => (
    <div className={cn('p-6', className)}>{children}</div>
);

export const CardFooter = ({ className, children }) => (
    <div className={cn('p-4 px-6 border-t border-zinc-800/50 bg-zinc-900/30', className)}>{children}</div>
);
