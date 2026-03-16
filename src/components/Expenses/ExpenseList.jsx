import React, { useState, useMemo } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { expenseService, categoryService } from '../../services/financeService';
import { Card, CardBody } from '../UI/Card';
import { Button } from '../UI/Button';
import { Plus, Search, Calendar, Pencil, Trash2, Tag, CalendarDays } from 'lucide-react';
import { format, parseISO, startOfMonth, endOfMonth } from 'date-fns';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'react-hot-toast';
import { ConfirmModal } from '../UI/ConfirmModal';

export default function ExpenseList({ onAddClick, onEditClick }) {
    const queryClient = useQueryClient();
    const [searchTerm, setSearchTerm] = useState('');
    const [categoryFilter, setCategoryFilter] = useState('');

    // Start with current month and year
    const currentDate = new Date();
    const [selectedMonth, setSelectedMonth] = useState((currentDate.getMonth() + 1).toString().padStart(2, '0'));
    const [selectedYear, setSelectedYear] = useState(currentDate.getFullYear().toString());

    const [deleteId, setDeleteId] = useState(null);

    // Compute start and end dates based on month/year selection
    const filterDates = useMemo(() => {
        if (!selectedMonth && !selectedYear) return { start: undefined, end: undefined };

        const year = selectedYear ? parseInt(selectedYear) : currentDate.getFullYear();
        // If a month is selected, filter by that month. Else use the whole year.
        if (selectedMonth) {
            const dateStr = `${year}-${selectedMonth}-01`;
            const date = parseISO(dateStr);
            return {
                start: format(startOfMonth(date), 'yyyy-MM-dd'),
                end: format(endOfMonth(date), 'yyyy-MM-dd')
            };
        } else {
            return {
                start: `${year}-01-01`,
                end: `${year}-12-31`
            };
        }
    }, [selectedMonth, selectedYear]);

    const { data: expensesResponse, isLoading, isFetching } = useQuery({
        queryKey: ['expenses', categoryFilter, filterDates.start, filterDates.end],
        queryFn: () => expenseService.getExpenses({
            categoryId: categoryFilter || undefined,
            startDate: filterDates.start,
            endDate: filterDates.end,
            limit: 500, // Get plenty for client-side filtering
        }),
    });

    const expenses = expensesResponse?.data || expensesResponse || [];

    const { data: categories } = useQuery({
        queryKey: ['categories'],
        queryFn: categoryService.getCategories,
    });

    const deleteMutation = useMutation({
        mutationFn: (id) => expenseService.deleteExpense(id),
        onSuccess: () => {
            queryClient.invalidateQueries(['expenses']);
            queryClient.invalidateQueries(['stats']);
            queryClient.invalidateQueries(['categories']);
            toast.success('Expense deleted');
            setDeleteId(null);
        },
        onError: (error) => {
            toast.error(error.response?.data?.message || 'Failed to delete expense');
            setDeleteId(null);
        }
    });

    // Client-side search filter
    const filteredExpenses = useMemo(() => {
        if (!expenses) return [];
        if (!searchTerm.trim()) return expenses.sort((a, b) => new Date(b.date) - new Date(a.date));
        const term = searchTerm.toLowerCase();
        return expenses.filter(e =>
            e.description?.toLowerCase().includes(term) ||
            e.category?.name?.toLowerCase().includes(term) ||
            e.notes?.toLowerCase().includes(term) ||
            e.merchant?.toLowerCase().includes(term)
        ).sort((a, b) => new Date(b.date) - new Date(a.date));
    }, [expenses, searchTerm]);

    const hasActiveFilters = categoryFilter || selectedMonth || selectedYear || searchTerm;

    // Helper arrays for dropdowns
    const months = [
        { value: '01', label: 'January' }, { value: '02', label: 'February' },
        { value: '03', label: 'March' }, { value: '04', label: 'April' },
        { value: '05', label: 'May' }, { value: '06', label: 'June' },
        { value: '07', label: 'July' }, { value: '08', label: 'August' },
        { value: '09', label: 'September' }, { value: '10', label: 'October' },
        { value: '11', label: 'November' }, { value: '12', label: 'December' },
    ];

    // Generate recent years dynamically
    const currentY = currentDate.getFullYear();
    const years = [currentY, currentY - 1, currentY - 2, currentY - 3];

    if (isLoading) {
        return (
            <div className="space-y-4 shadow-xl border border-zinc-800 rounded-xl overflow-hidden bg-zinc-900/50">
                {[1, 2, 3, 4, 5].map((i) => (
                    <div key={i} className="h-16 border-b border-zinc-800/50 bg-zinc-900/20 animate-pulse" />
                ))}
            </div>
        );
    }

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                    <h2 className="text-xl font-bold text-white">Expenses Data</h2>
                    <p className="text-sm text-zinc-400">View and manage all your expense records</p>
                </div>
                <Button onClick={onAddClick} className="gap-2 shrink-0">
                    <Plus size={18} />
                    Add Expense
                </Button>
            </div>

            {/* Search Bar */}
            <div className="flex gap-3">
                <div className="relative flex-1">
                    <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500" />
                    <input
                        type="text"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        placeholder="Search by description, merchant, or notes..."
                        className="w-full h-10 pl-10 pr-4 rounded-xl border border-zinc-800 bg-zinc-900/50 text-sm text-white placeholder:text-zinc-500 focus:outline-none focus:ring-2 focus:ring-purple-600 focus:ring-offset-2 ring-offset-black transition-all"
                    />
                </div>
            </div>

            {/* Results count & loading status */}
            <div className="flex justify-between items-center px-1">
                <p className="text-xs font-medium text-zinc-500">
                    Showing {filteredExpenses.length} expense{filteredExpenses.length !== 1 ? 's' : ''}
                </p>
                {isFetching && !isLoading && (
                    <div className="flex items-center gap-2 text-xs text-purple-400">
                        <div className="animate-spin rounded-full h-3 w-3 border-[1.5px] border-purple-500 border-t-transparent"></div>
                        Refreshing...
                    </div>
                )}
            </div>

            {/* Expenses Table */}
            <div className="w-full border border-zinc-800 rounded-xl overflow-hidden bg-zinc-900/30">
                <div className="overflow-x-auto">
                    <table className="w-full text-left text-sm whitespace-nowrap">
                        <thead className="bg-zinc-800/80 text-zinc-400 text-xs uppercase tracking-wider">
                            <tr>
                                <th className="px-5 py-3 font-semibold align-top w-56">
                                    <div className="mb-2.5 mt-0.5">Date</div>
                                    <div className="flex gap-1.5">
                                        <select
                                            value={selectedMonth}
                                            onChange={(e) => setSelectedMonth(e.target.value)}
                                            className="w-full h-8 rounded-md border border-zinc-700 bg-zinc-900 px-1.5 text-xs text-zinc-300 focus:outline-none focus:border-purple-500 transition-all cursor-pointer"
                                        >
                                            <option value="">All</option>
                                            {months.map(m => <option key={m.value} value={m.value}>{m.label.substring(0, 3)}</option>)}
                                        </select>
                                        <select
                                            value={selectedYear}
                                            onChange={(e) => setSelectedYear(e.target.value)}
                                            className="w-full h-8 rounded-md border border-zinc-700 bg-zinc-900 px-1.5 text-xs text-zinc-300 focus:outline-none focus:border-purple-500 transition-all cursor-pointer"
                                        >
                                            <option value="">All</option>
                                            {years.map(y => <option key={y} value={y.toString()}>{y}</option>)}
                                        </select>
                                    </div>
                                </th>
                                <th className="px-5 py-3 font-semibold align-top">
                                    <div className="mb-2 mt-0.5">Description</div>
                                </th>
                                <th className="px-5 py-3 font-semibold align-top w-48">
                                    <div className="mb-2.5 mt-0.5">Category</div>
                                    <select
                                        value={categoryFilter}
                                        onChange={(e) => setCategoryFilter(e.target.value)}
                                        className="w-full h-8 rounded-md border border-zinc-700 bg-zinc-900 px-1.5 text-xs text-zinc-300 focus:outline-none focus:border-purple-500 transition-all cursor-pointer"
                                    >
                                        <option value="">All Categories</option>
                                        {categories?.map((cat) => (
                                            <option key={cat.id} value={cat.id}>
                                                {cat.name}
                                            </option>
                                        ))}
                                    </select>
                                </th>
                                <th className="px-5 py-3 font-semibold align-top text-right">
                                    <div className="mb-2 mt-0.5">Amount (LKR)</div>
                                </th>
                                <th className="px-5 py-3 font-semibold align-top text-center rounded-tr-xl">
                                    <div className="mb-2 mt-0.5">Actions</div>
                                </th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-zinc-800/50">
                            {filteredExpenses.length === 0 ? (
                                <tr>
                                    <td colSpan="5" className="px-5 py-12 text-center">
                                        <div className="flex flex-col items-center justify-center text-zinc-500">
                                            <CalendarDays size={32} className="mb-3 opacity-20" />
                                            <p className="text-sm font-medium text-zinc-400">No expenses found</p>
                                            <p className="text-xs mt-1">Try adjusting your filters or add a new expense.</p>
                                        </div>
                                    </td>
                                </tr>
                            ) : (
                                filteredExpenses.map((expense, index) => (
                                    <motion.tr
                                        key={expense.id}
                                        initial={{ opacity: 0, y: 5 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        transition={{ duration: 0.2, delay: index * 0.02 }}
                                        className="hover:bg-zinc-800/30 transition-colors group"
                                    >
                                        <td className="px-5 py-4">
                                            <span className="text-zinc-300 font-medium">{format(parseISO(expense.date), 'MMM dd, yyyy')}</span>
                                        </td>
                                        <td className="px-5 py-4 min-w-[200px]">
                                            <div className="flex flex-col">
                                                <span className="text-white font-medium truncate max-w-[250px]">{expense.description}</span>
                                                {(expense.merchant || expense.notes) && (
                                                    <span className="text-[11px] text-zinc-500 truncate max-w-[250px] mt-0.5">
                                                        {expense.merchant ? `Merchant: ${expense.merchant}` : expense.notes}
                                                    </span>
                                                )}
                                            </div>
                                        </td>
                                        <td className="px-5 py-4">
                                            <div className="inline-flex items-center gap-1.5 px-2 py-1 rounded-md text-[11px] font-medium border"
                                                style={{
                                                    backgroundColor: `${expense.category?.color || '#333'}15`,
                                                    color: expense.category?.color || '#888',
                                                    borderColor: `${expense.category?.color || '#333'}30`
                                                }}
                                            >
                                                <span>{expense.category?.icon || '🏷️'}</span>
                                                <span>{expense.category?.name || 'Uncategorized'}</span>
                                            </div>
                                        </td>
                                        <td className="px-5 py-4 text-right">
                                            <span className="font-bold text-white tabular-nums">
                                                {Number(expense.amount).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                                            </span>
                                        </td>
                                        <td className="px-5 py-4 text-center">
                                            <div className="flex items-center justify-center gap-1 opacity-0 group-hover:opacity-100 focus-within:opacity-100 transition-opacity duration-200">
                                                <button
                                                    onClick={() => onEditClick(expense)}
                                                    className="p-1.5 rounded-md text-zinc-400 hover:text-white hover:bg-zinc-700 transition-all focus:outline-none focus:ring-2 focus:ring-purple-500"
                                                    title="Edit"
                                                >
                                                    <Pencil size={14} />
                                                </button>
                                                <button
                                                    onClick={() => setDeleteId(expense.id)}
                                                    className="p-1.5 rounded-md text-zinc-400 hover:text-red-400 hover:bg-zinc-700 transition-all focus:outline-none focus:ring-2 focus:ring-red-500"
                                                    title="Delete"
                                                >
                                                    <Trash2 size={14} />
                                                </button>
                                            </div>
                                        </td>
                                    </motion.tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            <ConfirmModal
                isOpen={!!deleteId}
                onClose={() => setDeleteId(null)}
                onConfirm={() => deleteId && deleteMutation.mutate(deleteId)}
                isLoading={deleteMutation.isPending}
                title="Delete Expense"
                message="Are you sure you want to delete this expense?"
            />
        </div>
    );
}
