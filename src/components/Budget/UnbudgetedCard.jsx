import React from 'react';
import { Plus } from 'lucide-react';
import { Button } from '../UI/Button';

export default function UnbudgetedCard({ category, onAdd }) {
    return (
        <div className="bg-zinc-900/30 border border-zinc-800/50 border-dashed rounded-xl overflow-hidden transition-all duration-300 hover:border-purple-500/30 hover:bg-zinc-900/50">
            <div className="p-5 flex flex-col items-center text-center justify-center h-full min-h-[160px] gap-3">
                <div className="flex items-center justify-center w-12 h-12 rounded-full bg-zinc-800/50 text-2xl">
                    {category?.icon || '🏷️'}
                </div>
                <div>
                    <h3 className="font-bold text-white text-sm">{category?.name || 'Unknown'}</h3>
                    <p className="text-[10px] text-zinc-500 mt-1">No budget set</p>
                </div>
                <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => onAdd(category)}
                    className="gap-1.5 text-purple-400 hover:text-purple-300 mt-2"
                >
                    <Plus size={14} />
                    Add Budget
                </Button>
            </div>
        </div>
    );
}
