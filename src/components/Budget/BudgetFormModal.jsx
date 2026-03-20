import React, { useState, useEffect } from 'react';
import { X } from 'lucide-react';
import { Button } from '../UI/Button';
import { useQuery } from '@tanstack/react-query';
import { categoryService } from '../../services/financeService';

export default function BudgetFormModal({ isOpen, onClose, onSubmit, editBudget, defaultCategoryId }) {
    const [categoryId, setCategoryId] = useState('');
    const [amount, setAmount] = useState('');
    const [period, setPeriod] = useState('monthly');
    const [isSubmitting, setIsSubmitting] = useState(false);

    const { data: categories = [] } = useQuery({
        queryKey: ['categories'],
        queryFn: categoryService.getCategories,
    });

    // Populate form when editing
    useEffect(() => {
        if (editBudget) {
            setCategoryId(editBudget.categoryId);
            setAmount(String(editBudget.amount));
            setPeriod(editBudget.period || 'monthly');
        } else {
            setCategoryId(defaultCategoryId || '');
            setAmount('');
            setPeriod('monthly');
        }
    }, [editBudget, isOpen, defaultCategoryId]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!categoryId || !amount) return;

        setIsSubmitting(true);
        try {
            await onSubmit({
                categoryId,
                amount: Number(amount),
                period,
            });
            onClose();
        } catch (err) {
            console.error('Failed to save budget:', err);
        } finally {
            setIsSubmitting(false);
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            {/* Backdrop */}
            <div
                className="absolute inset-0 bg-black/60 backdrop-blur-sm"
                onClick={onClose}
            />

            {/* Modal */}
            <div className="relative w-full max-w-md bg-zinc-950 border border-zinc-800 rounded-2xl shadow-2xl animate-in fade-in zoom-in-95 duration-200">
                {/* Header */}
                <div className="flex items-center justify-between p-6 border-b border-zinc-800">
                    <h2 className="text-lg font-bold text-white">
                        {editBudget ? 'Edit Budget' : 'Set New Budget'}
                    </h2>
                    <button
                        onClick={onClose}
                        className="p-1.5 rounded-lg text-zinc-500 hover:text-white hover:bg-zinc-800 transition-colors"
                    >
                        <X size={18} />
                    </button>
                </div>

                {/* Form */}
                <form onSubmit={handleSubmit} className="p-6 space-y-5">
                    {/* Category Picker */}
                    <div>
                        <label className="text-xs text-zinc-400 uppercase tracking-wider font-medium mb-2 block">
                            Category
                        </label>
                        <select
                            value={categoryId}
                            onChange={(e) => setCategoryId(e.target.value)}
                            disabled={!!editBudget}
                            className="w-full bg-zinc-900 border border-zinc-800 rounded-lg px-4 py-2.5 text-sm text-white focus:outline-none focus:border-purple-500 transition-colors disabled:opacity-50"
                        >
                            <option value="">Select a category</option>
                            {categories.map((cat) => (
                                <option key={cat.id} value={cat.id}>
                                    {cat.icon} {cat.name}
                                </option>
                            ))}
                        </select>
                    </div>

                    {/* Amount */}
                    <div>
                        <label className="text-xs text-zinc-400 uppercase tracking-wider font-medium mb-2 block">
                            Budget Amount (LKR)
                        </label>
                        <input
                            type="number"
                            min="0"
                            step="100"
                            value={amount}
                            onChange={(e) => setAmount(e.target.value)}
                            placeholder="e.g. 15000"
                            className="w-full bg-zinc-900 border border-zinc-800 rounded-lg px-4 py-2.5 text-sm text-white placeholder-zinc-600 focus:outline-none focus:border-purple-500 transition-colors"
                        />
                    </div>

                    {/* Period (Hidden, defaults to monthly) */}
                    <input type="hidden" value={period} />

                    {/* Submit */}
                    <div className="flex gap-3 pt-2">
                        <Button
                            type="button"
                            variant="secondary"
                            size="md"
                            onClick={onClose}
                            className="flex-1"
                        >
                            Cancel
                        </Button>
                        <Button
                            type="submit"
                            variant="primary"
                            size="md"
                            isLoading={isSubmitting}
                            disabled={!categoryId || !amount}
                            className="flex-1"
                        >
                            {editBudget ? 'Update Budget' : 'Set Budget'}
                        </Button>
                    </div>
                </form>
            </div>
        </div>
    );
}
