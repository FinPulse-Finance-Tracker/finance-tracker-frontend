import React, { useState } from 'react';
import { useMutation, useQuery } from '@tanstack/react-query';
import { receiptService, categoryService } from '../../services/financeService';
import { Modal } from '../UI/Modal';
import { Button } from '../UI/Button';
import { Package, ScanLine } from 'lucide-react';
import { toast } from 'react-hot-toast';
import { format, parseISO } from 'date-fns';

export default function ReceiptImportModal({ isOpen, onClose, expense, onImportDone }) {
    // Keep local editable state so user can fix OCR mistakes
    const [editableExpense, setEditableExpense] = useState({
        merchant: expense.merchant || '',
        amount: expense.amount || 0,
        date: expense.date || format(new Date(), 'yyyy-MM-dd'),
        description: expense.description || '',
        categoryId: '',
    });

    const { data: categories } = useQuery({
        queryKey: ['categories'],
        queryFn: categoryService.getCategories,
    });

    const importMutation = useMutation({
        mutationFn: (data) => receiptService.importExpense(data),
        onSuccess: () => {
            toast.success('Receipt expense imported!');
            onImportDone();
        },
        onError: () => {
            toast.error('Failed to import receipt expense. Please try again.');
        },
    });

    const handleChange = (e) => {
        const { name, value } = e.target;
        setEditableExpense(prev => ({
            ...prev,
            [name]: name === 'amount' ? parseFloat(value) || 0 : value
        }));
    };

    const handleImport = () => {
        if (!editableExpense.merchant || editableExpense.amount <= 0) {
            toast.error('Please ensure merchant and a valid amount are provided.');
            return;
        }

        importMutation.mutate({
            ...editableExpense,
            categoryId: editableExpense.categoryId || undefined,
        });
    };

    return (
        <Modal
            isOpen={isOpen}
            onClose={onClose}
            title="Review Scanned Receipt"
        >
            <div className="space-y-4">
                <div className="flex items-center gap-2 p-3 bg-orange-500/10 border border-orange-500/20 rounded-lg text-xs text-orange-300">
                    <ScanLine size={14} className="shrink-0" />
                    <span>Review the extracted details below. You can correct any OCR mistakes before importing.</span>
                </div>

                <div className="space-y-4">
                    {/* Merchant & Amount Row */}
                    <div className="flex gap-3">
                        <div className="flex-1 space-y-1">
                            <label className="text-xs font-semibold text-zinc-400">Merchant</label>
                            <input
                                type="text"
                                name="merchant"
                                value={editableExpense.merchant}
                                onChange={handleChange}
                                className="w-full h-10 px-3 rounded-xl border border-zinc-700 bg-zinc-900 text-sm text-white focus:outline-none focus:border-orange-500 transition-colors"
                            />
                        </div>
                        <div className="w-1/3 space-y-1">
                            <label className="text-xs font-semibold text-zinc-400">Amount (LKR)</label>
                            <input
                                type="number"
                                name="amount"
                                step="0.01"
                                value={editableExpense.amount || ''}
                                onChange={handleChange}
                                className="w-full h-10 px-3 rounded-xl border border-zinc-700 bg-zinc-900 text-sm text-white focus:outline-none focus:border-orange-500 transition-colors"
                            />
                        </div>
                    </div>

                    {/* Date & Category Row */}
                    <div className="flex gap-3">
                        <div className="flex-1 space-y-1">
                            <label className="text-xs font-semibold text-zinc-400">Date</label>
                            <input
                                type="date"
                                name="date"
                                value={editableExpense.date}
                                onChange={handleChange}
                                className="w-full h-10 px-3 rounded-xl border border-zinc-700 bg-zinc-900 text-sm text-white focus:outline-none focus:border-orange-500 transition-colors"
                            />
                        </div>
                        <div className="flex-1 space-y-1">
                            <label className="text-xs font-semibold text-zinc-400">Category</label>
                            <select
                                name="categoryId"
                                value={editableExpense.categoryId}
                                onChange={handleChange}
                                className="w-full h-10 px-3 rounded-xl border border-zinc-700 bg-zinc-900 text-sm text-white focus:outline-none focus:border-orange-500 transition-colors appearance-none"
                            >
                                <option value="">None (Uncategorized)</option>
                                {categories?.map((cat) => (
                                    <option key={cat.id} value={cat.id}>
                                        {cat.icon} {cat.name}
                                    </option>
                                ))}
                            </select>
                        </div>
                    </div>

                    {/* Description */}
                    <div className="space-y-1">
                        <label className="text-xs font-semibold text-zinc-400">Description</label>
                        <input
                            type="text"
                            name="description"
                            value={editableExpense.description}
                            onChange={handleChange}
                            className="w-full h-10 px-3 rounded-xl border border-zinc-700 bg-zinc-900 text-sm text-white focus:outline-none focus:border-orange-500 transition-colors"
                        />
                    </div>

                    {/* Raw Text Snippet */}
                    <div className="space-y-1">
                        <label className="text-xs font-semibold text-zinc-500">Extracted Raw Text Snippet</label>
                        <div className="w-full h-24 overflow-y-auto p-3 rounded-xl border border-zinc-800 bg-zinc-900/50 text-xs text-zinc-400 whitespace-pre-wrap font-mono">
                            {expense.rawText || 'No text extracted.'}
                        </div>
                    </div>
                </div>

                <div className="flex gap-3 pt-4 border-t border-zinc-800">
                    <Button type="button" variant="secondary" onClick={onClose} className="flex-1">
                        Cancel
                    </Button>
                    <Button
                        onClick={handleImport}
                        isLoading={importMutation.isPending}
                        className="flex-1 gap-2 border-orange-600 bg-orange-600 hover:bg-orange-500 text-white"
                        style={{ backgroundColor: '#ea580c', borderColor: '#ea580c' }} // Override variants for specific theme
                    >
                        <Package size={15} />
                        Import Expense
                    </Button>
                </div>
            </div>
        </Modal>
    );
}
