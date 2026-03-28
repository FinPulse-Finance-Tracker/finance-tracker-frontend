import React, { useState, useEffect } from 'react';
import { X } from 'lucide-react';
import { Button } from '../UI/Button';
import { useQuery } from '@tanstack/react-query';
import { categoryService } from '../../services/financeService';
import CategoryModal from '../Categories/CategoryModal';

export default function BudgetFormModal({ isOpen, onClose, onSubmit, editBudget, defaultCategoryId }) {
    const [categoryId, setCategoryId] = useState('');
    const [amount, setAmount] = useState('');
    const [period, setPeriod] = useState('monthly');
    const [isRecurring, setIsRecurring] = useState(false);
    const [recurringType, setRecurringType] = useState('all');
    const [recurringMonths, setRecurringMonths] = useState([]);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isCategoryModalOpen, setIsCategoryModalOpen] = useState(false);

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
            setIsRecurring(editBudget.isRecurring || false);
            if (editBudget.recurringMonths) {
                try {
                    const parsed = JSON.parse(editBudget.recurringMonths);
                    if (Array.isArray(parsed) && parsed.length > 0) {
                        setRecurringType('specific');
                        setRecurringMonths(parsed);
                    } else {
                        setRecurringType('all');
                        setRecurringMonths([]);
                    }
                } catch {
                    setRecurringType('all');
                    setRecurringMonths([]);
                }
            } else {
                setRecurringType('all');
                setRecurringMonths([]);
            }
        } else {
            setCategoryId(defaultCategoryId || '');
            setAmount('');
            setPeriod('monthly');
            setIsRecurring(false);
            setRecurringType('all');
            setRecurringMonths([]);
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
                isRecurring,
                recurringMonths: isRecurring && recurringType === 'specific' ? recurringMonths : null
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
                    {/* Edit Warning */}
                    {editBudget && isRecurring && (
                        <div className="bg-orange-500/10 border border-orange-500/20 text-orange-400 p-3 rounded-xl text-xs font-medium flex gap-2 items-start mt-[-10px]">
                            <span className="shrink-0 text-base">⚠️</span>
                            <span>Editing this recurring budget updates the template for newly generated future months.</span>
                        </div>
                    )}

                    {/* Category Picker */}
                    <div>
                        <label className="text-xs text-zinc-400 uppercase tracking-wider font-medium mb-2 block">
                            Category <span className="text-red-500">*</span>
                        </label>
                        <div className="relative">
                            <select
                                value={categoryId}
                                onChange={(e) => {
                                    if (e.target.value === 'ADD_NEW') {
                                        setCategoryId(''); // Reset select
                                        setIsCategoryModalOpen(true);
                                    } else {
                                        setCategoryId(e.target.value);
                                    }
                                }}
                                disabled={!!editBudget}
                                className="w-full bg-zinc-900 border border-zinc-800 rounded-lg px-4 py-2.5 text-sm text-white focus:outline-none focus:border-purple-500 transition-colors disabled:opacity-50 appearance-none cursor-pointer"
                            >
                                <option value="" disabled>Select a category</option>
                                {categories.map((cat) => (
                                    <option key={cat.id} value={cat.id} className="bg-zinc-900">
                                        {cat.icon} {cat.name}
                                    </option>
                                ))}
                                {!editBudget && (
                                    <option value="ADD_NEW" className="bg-purple-900/20 text-purple-400 font-medium">
                                        + Add New Category
                                    </option>
                                )}
                            </select>
                            <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-4 text-zinc-400">
                                <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
                                </svg>
                            </div>
                        </div>
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

                    {/* Recurring Options block */}
                    <div className="space-y-3">
                        <label className="flex items-center gap-3 p-3 bg-purple-500/5 border border-purple-500/20 rounded-xl cursor-pointer hover:bg-purple-500/10 transition-colors">
                            <div className="relative flex items-center">
                                <input
                                    type="checkbox"
                                    checked={isRecurring}
                                    onChange={(e) => setIsRecurring(e.target.checked)}
                                    className="peer appearance-none w-5 h-5 border-2 border-purple-500/50 rounded-md checked:bg-purple-500 checked:border-purple-500 transition-colors cursor-pointer"
                                />
                                <svg className="absolute w-3 h-3 top-1 left-1 pointer-events-none opacity-0 peer-checked:opacity-100 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="3">
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                                </svg>
                            </div>
                            <div>
                                <p className="text-sm font-medium text-white">Repeat Monthly</p>
                                <p className="text-xs text-zinc-400">Automatically renew this budget for future months</p>
                            </div>
                        </label>

                        {/* Extended Recurring Options */}
                        {isRecurring && (
                            <div className="pl-4 sm:pl-8 space-y-3 animate-in fade-in slide-in-from-top-2">
                                <div className="flex gap-4">
                                    <label className="flex items-center gap-2 cursor-pointer text-sm text-zinc-300">
                                        <input
                                            type="radio"
                                            checked={recurringType === 'all'}
                                            onChange={() => setRecurringType('all')}
                                            className="accent-purple-500"
                                        />
                                        Every Month
                                    </label>
                                    <label className="flex items-center gap-2 cursor-pointer text-sm text-zinc-300">
                                        <input
                                            type="radio"
                                            checked={recurringType === 'specific'}
                                            onChange={() => setRecurringType('specific')}
                                            className="accent-purple-500"
                                        />
                                        Specific Months
                                    </label>
                                </div>

                                {recurringType === 'specific' && (
                                    <div className="grid grid-cols-4 sm:grid-cols-6 gap-2 pt-1">
                                        {['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'].map((month, index) => (
                                            <button
                                                key={month}
                                                type="button"
                                                onClick={() => {
                                                    setRecurringMonths(prev => 
                                                        prev.includes(index) ? prev.filter(m => m !== index) : [...prev, index]
                                                    );
                                                }}
                                                className={`py-1.5 px-1 text-[11px] font-medium rounded-md border transition-all ${
                                                    recurringMonths.includes(index)
                                                        ? 'bg-purple-500 text-white border-purple-400'
                                                        : 'bg-zinc-900 text-zinc-400 border-zinc-800 hover:border-zinc-700'
                                                }`}
                                            >
                                                {month}
                                            </button>
                                        ))}
                                    </div>
                                )}
                            </div>
                        )}
                    </div>

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
            
            <CategoryModal 
                isOpen={isCategoryModalOpen} 
                onClose={() => setIsCategoryModalOpen(false)} 
            />
        </div>
    );
}
