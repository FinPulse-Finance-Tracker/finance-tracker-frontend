import React from 'react';
import { X, MapPin, TrendingDown, Sparkles, Loader2 } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { budgetService } from '../../services/financeService';

export default function SuggestionsPanel({ isOpen, onClose, budget }) {
    const { data, isLoading, error } = useQuery({
        queryKey: ['budgetSuggestions', budget?.categoryId],
        queryFn: () => budgetService.getSuggestions(budget.categoryId),
        enabled: isOpen && !!budget?.categoryId,
        staleTime: 10 * 60 * 1000, // Cache for 10 min
    });

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            {/* Backdrop */}
            <div
                className="absolute inset-0 bg-black/60 backdrop-blur-sm"
                onClick={onClose}
            />

            {/* Panel */}
            <div className="relative w-full max-w-lg bg-zinc-950 border border-zinc-800 rounded-2xl shadow-2xl animate-in fade-in zoom-in-95 duration-200 max-h-[85vh] overflow-hidden flex flex-col">
                {/* Header */}
                <div className="flex items-center justify-between p-6 border-b border-zinc-800 shrink-0">
                    <div className="flex items-center gap-3">
                        <div className="p-2 bg-purple-500/10 rounded-lg text-purple-400">
                            <Sparkles size={18} />
                        </div>
                        <div>
                            <h2 className="text-lg font-bold text-white">Smart Suggestions</h2>
                            <p className="text-xs text-zinc-500">
                                {budget?.category?.icon} {budget?.category?.name} — Best places to spend wisely
                            </p>
                        </div>
                    </div>
                    <button
                        onClick={onClose}
                        className="p-1.5 rounded-lg text-zinc-500 hover:text-white hover:bg-zinc-800 transition-colors"
                    >
                        <X size={18} />
                    </button>
                </div>

                {/* Content */}
                <div className="p-6 overflow-y-auto flex-1">
                    {isLoading ? (
                        <div className="flex flex-col items-center justify-center py-12 gap-3">
                            <Loader2 size={28} className="animate-spin text-purple-400" />
                            <p className="text-sm text-zinc-500">Getting AI suggestions...</p>
                        </div>
                    ) : error ? (
                        <div className="text-center py-12">
                            <p className="text-sm text-red-400">Failed to load suggestions</p>
                            <p className="text-xs text-zinc-500 mt-1">Please try again later</p>
                        </div>
                    ) : (
                        <div className="space-y-3">
                            {data?.suggestions?.map((suggestion, idx) => (
                                <div
                                    key={idx}
                                    className="p-4 bg-zinc-900/50 border border-zinc-800 rounded-xl hover:border-purple-500/20 transition-all group"
                                >
                                    <div className="flex items-start gap-3">
                                        <div className="p-2 bg-purple-500/10 rounded-lg text-purple-400 shrink-0 mt-0.5 group-hover:bg-purple-500/20 transition-colors">
                                            <MapPin size={16} />
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <div className="flex items-center justify-between gap-2">
                                                <h4 className="font-semibold text-white text-sm">
                                                    {suggestion.name}
                                                </h4>
                                                {suggestion.estimatedSaving && (
                                                    <span className="text-[10px] font-semibold text-green-400 bg-green-500/10 border border-green-500/20 px-2 py-0.5 rounded-full shrink-0 flex items-center gap-1">
                                                        <TrendingDown size={10} />
                                                        {suggestion.estimatedSaving}
                                                    </span>
                                                )}
                                            </div>
                                            <p className="text-xs text-zinc-400 mt-1 leading-relaxed">
                                                {suggestion.tip}
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            ))}

                            {(!data?.suggestions || data.suggestions.length === 0) && (
                                <div className="text-center py-12">
                                    <p className="text-sm text-zinc-500">No suggestions available yet</p>
                                </div>
                            )}
                        </div>
                    )}
                </div>

                {/* Footer note */}
                <div className="px-6 py-3 border-t border-zinc-800 shrink-0">
                    <p className="text-[10px] text-zinc-600 text-center">
                        💡 Suggestions are AI-generated and may vary. Always verify prices yourself.
                    </p>
                </div>
            </div>
        </div>
    );
}
