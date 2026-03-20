import React from 'react';
import { cn } from '../../utils/cn';
import { Edit3, Trash2, Lightbulb } from 'lucide-react';
import { Button } from '../UI/Button';

export default function BudgetCard({ budget, onEdit, onDelete, onViewSuggestions }) {
    const { category, amount, spent, remaining, percentUsed, isOverBudget, period } = budget;

    // Color coding based on percentage used
    const getProgressColor = () => {
        if (percentUsed >= 90) return 'bg-red-500';
        if (percentUsed >= 70) return 'bg-yellow-500';
        return 'bg-green-500';
    };

    const getProgressBg = () => {
        if (percentUsed >= 90) return 'bg-red-500/10';
        if (percentUsed >= 70) return 'bg-yellow-500/10';
        return 'bg-green-500/10';
    };

    const getStatusText = () => {
        if (isOverBudget) return 'Over Budget!';
        if (percentUsed >= 90) return 'Almost reached';
        if (percentUsed >= 70) return 'Getting close';
        return 'On track';
    };

    const getStatusColor = () => {
        if (isOverBudget || percentUsed >= 90) return 'text-red-400 bg-red-500/10 border-red-500/20';
        if (percentUsed >= 70) return 'text-yellow-400 bg-yellow-500/10 border-yellow-500/20';
        return 'text-green-400 bg-green-500/10 border-green-500/20';
    };

    return (
        <div className="bg-zinc-900/50 border border-zinc-800 rounded-xl overflow-hidden transition-all duration-300 hover:border-purple-500/30 hover:bg-zinc-900/70 hover:shadow-[0_0_30px_rgba(147,51,234,0.1)]">
            {/* Header */}
            <div className="p-5 pb-3">
                <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-3">
                        <div className="text-2xl">{category?.icon || '💰'}</div>
                        <div>
                            <h3 className="font-bold text-white text-sm">{category?.name || 'Unknown'}</h3>
                        </div>
                    </div>
                    <span className={cn(
                        'text-[10px] font-semibold px-2 py-0.5 rounded-full border',
                        getStatusColor()
                    )}>
                        {getStatusText()}
                    </span>
                </div>

                {/* Amounts */}
                <div className="flex items-baseline justify-between mb-3">
                    <div>
                        <p className="text-xl font-bold text-white">
                            LKR {spent.toLocaleString()}
                        </p>
                        <p className="text-xs text-zinc-500">
                            of LKR {amount.toLocaleString()}
                        </p>
                    </div>
                    <div className="text-right">
                        <p className={cn(
                            'text-sm font-bold',
                            remaining >= 0 ? 'text-green-400' : 'text-red-400'
                        )}>
                            {remaining >= 0 ? `LKR ${remaining.toLocaleString()} left` : `LKR ${Math.abs(remaining).toLocaleString()} over`}
                        </p>
                    </div>
                </div>

                {/* Progress Bar */}
                <div className={cn('h-2 rounded-full overflow-hidden', getProgressBg())}>
                    <div
                        className={cn(
                            'h-full rounded-full transition-all duration-700 ease-out',
                            getProgressColor()
                        )}
                        style={{ width: `${Math.min(percentUsed, 100)}%` }}
                    />
                </div>
                <p className="text-[10px] text-zinc-500 mt-1 text-right">{percentUsed}% used</p>
            </div>

            {/* Actions */}
            <div className="px-5 pb-4 flex items-center gap-2">
                <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => onViewSuggestions(budget)}
                    className="gap-1.5 text-purple-400 hover:text-purple-300 flex-1"
                >
                    <Lightbulb size={13} />
                    Suggestions
                </Button>
                <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => onEdit(budget)}
                    className="gap-1 text-zinc-400"
                >
                    <Edit3 size={13} />
                </Button>
                <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => onDelete(budget.id)}
                    className="gap-1 text-red-400 hover:text-red-300"
                >
                    <Trash2 size={13} />
                </Button>
            </div>
        </div>
    );
}
