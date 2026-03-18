import React, { useState, useMemo } from 'react';
import { useMutation, useQuery } from '@tanstack/react-query';
import { smsService, categoryService } from '../../services/financeService';
import { Modal } from '../UI/Modal';
import { Button } from '../UI/Button';
import { MessageSquare, CheckCircle2, Package } from 'lucide-react';
import { toast } from 'react-hot-toast';
import { format, parseISO } from 'date-fns';

export default function SmsImportModal({ isOpen, onClose, expenses, onImportDone }) {
    const [selected, setSelected] = useState(() => new Set(expenses.map(e => e.id)));
    const [categoryMap, setCategoryMap] = useState({});

    const { data: categories } = useQuery({
        queryKey: ['categories'],
        queryFn: categoryService.getCategories,
    });

    const importMutation = useMutation({
        mutationFn: (items) => smsService.importExpenses(items),
        onSuccess: (data) => {
            toast.success(`${data.imported} expense${data.imported !== 1 ? 's' : ''} imported!`);
            onImportDone();
        },
        onError: () => {
            toast.error('Failed to import SMS expenses. Please try again.');
        },
    });

    const handleToggle = (id) => {
        setSelected(prev => {
            const next = new Set(prev);
            if (next.has(id)) next.delete(id);
            else next.add(id);
            return next;
        });
    };

    const handleSelectAll = () => {
        if (selected.size === expenses.length) {
            setSelected(new Set());
        } else {
            setSelected(new Set(expenses.map(e => e.id)));
        }
    };

    const handleCategoryChange = (expenseId, categoryId) => {
        setCategoryMap(prev => ({ ...prev, [expenseId]: categoryId }));
    };

    const handleImport = () => {
        const toImport = expenses
            .filter(e => selected.has(e.id))
            .map(e => ({
                merchant: e.merchant,
                amount: e.amount,
                date: e.date,
                description: e.description,
                categoryId: categoryMap[e.id] || undefined,
            }));

        if (toImport.length === 0) {
            toast.error('Please select at least one expense to import.');
            return;
        }
        importMutation.mutate(toImport);
    };

    const totalSelected = useMemo(() => {
        return expenses
            .filter(e => selected.has(e.id))
            .reduce((sum, e) => sum + e.amount, 0);
    }, [expenses, selected]);

    return (
        <Modal
            isOpen={isOpen}
            onClose={onClose}
            title="Review SMS Expenses"
        >
            <div className="space-y-4">
                {/* Header info */}
                <div className="flex items-center gap-2 p-3 bg-purple-500/10 border border-purple-500/20 rounded-lg text-xs text-purple-300">
                    <MessageSquare size={14} className="shrink-0" />
                    <span>Found <strong>{expenses.length}</strong> transactions from the text. Review and select which to import.</span>
                </div>

                {/* Select all + summary */}
                <div className="flex items-center justify-between text-xs text-zinc-400">
                    <button
                        onClick={handleSelectAll}
                        className="flex items-center gap-1.5 hover:text-white transition-colors"
                    >
                        <div className={`w-4 h-4 rounded border flex items-center justify-center transition-colors ${selected.size === expenses.length ? 'bg-purple-600 border-purple-600' : 'border-zinc-600'}`}>
                            {selected.size === expenses.length && <CheckCircle2 size={10} className="text-white" />}
                        </div>
                        Select all ({expenses.length})
                    </button>
                    <span className="text-zinc-500">
                        {selected.size} selected · <span className="text-white font-semibold">LKR {totalSelected.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
                    </span>
                </div>

                {/* Expense list */}
                <div className="space-y-2 max-h-[380px] overflow-y-auto pr-1 -mr-1 scrollbar-thin scrollbar-thumb-zinc-700">
                    {expenses.map((expense) => (
                        <div
                            key={expense.id}
                            onClick={() => handleToggle(expense.id)}
                            className={`flex flex-col gap-2 p-3.5 rounded-xl border cursor-pointer transition-all ${selected.has(expense.id)
                                ? 'border-purple-500/40 bg-purple-900/10'
                                : 'border-zinc-800 bg-zinc-900/30 hover:border-zinc-700'
                                }`}
                        >
                            <div className="flex items-start gap-3">
                                {/* Checkbox */}
                                <div className={`mt-0.5 w-4 h-4 rounded border flex items-center justify-center shrink-0 transition-colors ${selected.has(expense.id) ? 'bg-purple-600 border-purple-600' : 'border-zinc-600'}`}>
                                    {selected.has(expense.id) && <CheckCircle2 size={10} className="text-white" />}
                                </div>

                                {/* Details */}
                                <div className="flex-1 min-w-0 space-y-1.5">
                                    <div className="flex items-start justify-between gap-2">
                                        <div className="min-w-0">
                                            <p className="text-sm font-semibold text-white truncate">{expense.merchant}</p>
                                            <p className="text-[11px] text-zinc-500 truncate mt-0.5">{expense.bank} • {expense.description}</p>
                                        </div>
                                        <div className="text-right shrink-0">
                                            <p className="text-sm font-bold text-white tabular-nums">
                                                LKR {expense.amount.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                                            </p>
                                            <p className="text-[10px] text-zinc-600 mt-0.5">
                                                {format(parseISO(expense.date), 'MMM dd, yyyy')}
                                            </p>
                                        </div>
                                    </div>

                                    {/* Category selector */}
                                    {selected.has(expense.id) && (
                                        <select
                                            value={categoryMap[expense.id] || ''}
                                            onChange={(e) => { e.stopPropagation(); handleCategoryChange(expense.id, e.target.value); }}
                                            onClick={(e) => e.stopPropagation()}
                                            className="w-full mt-2 h-8 rounded-lg border border-zinc-700 bg-zinc-900 px-2 text-xs text-white focus:outline-none focus:ring-1 focus:ring-purple-600 transition-all appearance-none"
                                        >
                                            <option value="" className="bg-zinc-900">Assign category (optional)</option>
                                            {categories?.map((cat) => (
                                                <option key={cat.id} value={cat.id} className="bg-zinc-900">
                                                    {cat.icon} {cat.name}
                                                </option>
                                            ))}
                                        </select>
                                    )}
                                </div>
                            </div>
                            {/* Raw SMS snippet */}
                            <div className="ml-7 text-[10px] text-zinc-600 bg-zinc-900/50 p-2 rounded-lg italic line-clamp-2">
                                "{expense.rawSms}"
                            </div>
                        </div>
                    ))}
                </div>

                {/* Footer actions */}
                <div className="flex gap-3 pt-2 border-t border-zinc-800">
                    <Button type="button" variant="secondary" onClick={onClose} className="flex-1">
                        Cancel
                    </Button>
                    <Button
                        onClick={handleImport}
                        isLoading={importMutation.isPending}
                        className="flex-1"
                        disabled={selected.size === 0}
                    >
                        <Package size={15} className="mr-1.5" />
                        Import {selected.size > 0 ? `${selected.size} ` : ''}Expense{selected.size !== 1 ? 's' : ''}
                    </Button>
                </div>
            </div>
        </Modal>
    );
}
