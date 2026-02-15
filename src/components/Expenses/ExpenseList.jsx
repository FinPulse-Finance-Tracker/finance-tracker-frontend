import React, { useState, useMemo } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { expenseService, categoryService } from '../../services/financeService';
import { Card, CardBody } from '../UI/Card';
import { Button } from '../UI/Button';
import { Plus, Search, Tag, Calendar, Pencil, Trash2 } from 'lucide-react';
import { format, isToday, isYesterday, parseISO } from 'date-fns';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'react-hot-toast';
import { ConfirmModal } from '../UI/ConfirmModal';

function getDateLabel(dateStr) {
    const date = parseISO(dateStr);
    if (isToday(date)) return 'Today';
    if (isYesterday(date)) return 'Yesterday';
    return format(date, 'MMMM dd, yyyy');
}

function groupByDate(expenses) {
    if (!expenses) return {};
    const groups = {};
    expenses.forEach((expense) => {
        const key = format(parseISO(expense.date), 'yyyy-MM-dd');
        if (!groups[key]) groups[key] = [];
        groups[key].push(expense);
    });
    return groups;
}

export default function ExpenseList({ onAddClick, onEditClick }) {
    const queryClient = useQueryClient();
    const [searchTerm, setSearchTerm] = useState('');
    const [categoryFilter, setCategoryFilter] = useState('');
    const [startDate, setStartDate] = useState('');
    const [endDate, setEndDate] = useState('');
    const [deleteId, setDeleteId] = useState(null);
    const [showFilters, setShowFilters] = useState(false);

    const { data: expenses, isLoading } = useQuery({
        queryKey: ['expenses', categoryFilter, startDate, endDate],
        queryFn: () => expenseService.getExpenses({
            categoryId: categoryFilter || undefined,
            startDate: startDate || undefined,
            endDate: endDate || undefined,
        }),
    });

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
        if (!searchTerm.trim()) return expenses;
        const term = searchTerm.toLowerCase();
        return expenses.filter(e =>
            e.description?.toLowerCase().includes(term) ||
            e.category?.name?.toLowerCase().includes(term) ||
            e.notes?.toLowerCase().includes(term)
        );
    }, [expenses, searchTerm]);

    const groupedExpenses = useMemo(() => groupByDate(filteredExpenses), [filteredExpenses]);
    const sortedDateKeys = useMemo(() => Object.keys(groupedExpenses).sort((a, b) => b.localeCompare(a)), [groupedExpenses]);

    const handleClearFilters = () => {
        setCategoryFilter('');
        setStartDate('');
        setEndDate('');
        setSearchTerm('');
    };

    const hasActiveFilters = categoryFilter || startDate || endDate || searchTerm;

    if (isLoading) {
        return (
            <div className="space-y-4">
                {[1, 2, 3].map((i) => (
                    <div key={i} className="h-20 bg-zinc-900/50 animate-pulse rounded-xl border border-zinc-800" />
                ))}
            </div>
        );
    }

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                    <h2 className="text-xl font-bold text-white">Expenses</h2>
                    <p className="text-sm text-zinc-400">Track and manage your spending</p>
                </div>
                <Button onClick={onAddClick} className="gap-2">
                    <Plus size={18} />
                    Add Expense
                </Button>
            </div>

            {/* Search & Filter Bar */}
            <div className="space-y-3">
                <div className="flex gap-3">
                    <div className="relative flex-1">
                        <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500" />
                        <input
                            type="text"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            placeholder="Search expenses..."
                            className="w-full h-10 pl-10 pr-4 rounded-lg border border-zinc-800 bg-zinc-900/50 text-sm text-white placeholder:text-zinc-500 focus:outline-none focus:ring-2 focus:ring-purple-600 focus:ring-offset-2 ring-offset-black transition-all"
                        />
                    </div>
                    <Button
                        variant={showFilters ? 'outline' : 'secondary'}
                        onClick={() => setShowFilters(!showFilters)}
                        className="gap-2"
                    >
                        <Calendar size={16} />
                        Filters
                    </Button>
                </div>

                {/* Expandable Filter Panel */}
                <AnimatePresence>
                    {showFilters && (
                        <motion.div
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: 'auto' }}
                            exit={{ opacity: 0, height: 0 }}
                            className="overflow-hidden"
                        >
                            <Card className="border-zinc-800">
                                <CardBody className="p-4">
                                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                        <div className="space-y-1.5">
                                            <label className="text-xs font-medium text-zinc-400 ml-1">Category</label>
                                            <select
                                                value={categoryFilter}
                                                onChange={(e) => setCategoryFilter(e.target.value)}
                                                className="w-full h-10 rounded-lg border border-zinc-800 bg-zinc-900/50 px-3 text-sm text-white focus:outline-none focus:ring-2 focus:ring-purple-600 transition-all appearance-none"
                                            >
                                                <option value="" className="bg-zinc-900">All Categories</option>
                                                {categories?.map((cat) => (
                                                    <option key={cat.id} value={cat.id} className="bg-zinc-900">
                                                        {cat.icon} {cat.name}
                                                    </option>
                                                ))}
                                            </select>
                                        </div>
                                        <div className="space-y-1.5">
                                            <label className="text-xs font-medium text-zinc-400 ml-1">From Date</label>
                                            <input
                                                type="date"
                                                value={startDate}
                                                onChange={(e) => setStartDate(e.target.value)}
                                                className="w-full h-10 rounded-lg border border-zinc-800 bg-zinc-900/50 px-3 text-sm text-white focus:outline-none focus:ring-2 focus:ring-purple-600 transition-all"
                                            />
                                        </div>
                                        <div className="space-y-1.5">
                                            <label className="text-xs font-medium text-zinc-400 ml-1">To Date</label>
                                            <input
                                                type="date"
                                                value={endDate}
                                                onChange={(e) => setEndDate(e.target.value)}
                                                className="w-full h-10 rounded-lg border border-zinc-800 bg-zinc-900/50 px-3 text-sm text-white focus:outline-none focus:ring-2 focus:ring-purple-600 transition-all"
                                            />
                                        </div>
                                    </div>
                                    {hasActiveFilters && (
                                        <div className="mt-3 pt-3 border-t border-zinc-800 flex justify-end">
                                            <button
                                                onClick={handleClearFilters}
                                                className="text-xs text-purple-400 hover:text-purple-300 transition-colors"
                                            >
                                                Clear All Filters
                                            </button>
                                        </div>
                                    )}
                                </CardBody>
                            </Card>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>

            {/* Results count */}
            {hasActiveFilters && (
                <p className="text-xs text-zinc-500">
                    Showing {filteredExpenses.length} result{filteredExpenses.length !== 1 ? 's' : ''}
                </p>
            )}

            {/* Expense List Grouped by Date */}
            <div className="space-y-6">
                {sortedDateKeys.length === 0 ? (
                    <div className="text-center py-20 bg-gradient-to-b from-zinc-900/20 to-transparent rounded-2xl border border-zinc-800/50">
                        <div className="text-6xl mb-4 animate-bounce">💸</div>
                        <p className="text-zinc-300 font-semibold text-lg">No expenses found</p>
                        <p className="text-zinc-500 text-sm mt-2 max-w-xs mx-auto">
                            {hasActiveFilters
                                ? 'Try adjusting your filters to see more results'
                                : 'Start tracking your spending by adding your first expense!'}
                        </p>
                        {!hasActiveFilters && (
                            <button
                                onClick={onAddClick}
                                className="mt-6 px-5 py-2.5 bg-purple-600 hover:bg-purple-500 text-white text-sm font-medium rounded-lg transition-colors"
                            >
                                + Add Your First Expense
                            </button>
                        )}
                    </div>
                ) : (
                    sortedDateKeys.map((dateKey) => (
                        <div key={dateKey} className="space-y-2">
                            {/* Date Header */}
                            <div className="flex items-center gap-3 py-1">
                                <h3 className="text-xs font-bold text-zinc-500 uppercase tracking-widest whitespace-nowrap">
                                    {getDateLabel(dateKey)}
                                </h3>
                                <div className="flex-1 h-px bg-zinc-800/50" />
                                <span className="text-xs text-zinc-600 whitespace-nowrap">
                                    LKR {groupedExpenses[dateKey].reduce((s, e) => s + Number(e.amount), 0).toLocaleString()}
                                </span>
                            </div>

                            {/* Expense Rows */}
                            <div className="space-y-2">
                                {groupedExpenses[dateKey].map((expense, index) => (
                                    <motion.div
                                        key={expense.id}
                                        initial={{ opacity: 0, x: -10 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        transition={{ delay: index * 0.02 }}
                                    >
                                        <Card className="group hover:border-zinc-700 transition-all duration-200">
                                            <CardBody className="flex items-center justify-between p-4 px-5">
                                                <div className="flex items-center gap-4 min-w-0">
                                                    <div
                                                        className="w-10 h-10 rounded-xl flex items-center justify-center text-lg shrink-0"
                                                        style={{
                                                            backgroundColor: `${expense.category?.color || '#333'}15`,
                                                            color: expense.category?.color || '#888',
                                                        }}
                                                    >
                                                        {expense.category?.icon || '💰'}
                                                    </div>
                                                    <div className="min-w-0">
                                                        <h4 className="font-semibold text-white text-sm truncate">
                                                            {expense.description}
                                                        </h4>
                                                        <div className="flex items-center gap-2 mt-0.5">
                                                            <span className="text-[11px] text-zinc-500 flex items-center gap-1">
                                                                <Tag size={10} />
                                                                {expense.category?.name || 'Uncategorized'}
                                                            </span>
                                                            {expense.notes && (
                                                                <>
                                                                    <span className="text-zinc-700">·</span>
                                                                    <span className="text-[11px] text-zinc-600 truncate max-w-[120px]">
                                                                        {expense.notes}
                                                                    </span>
                                                                </>
                                                            )}
                                                        </div>
                                                    </div>
                                                </div>
                                                <div className="flex items-center gap-3 shrink-0">
                                                    <p className="font-bold text-white text-sm tabular-nums">
                                                        -LKR {Number(expense.amount).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                                                    </p>
                                                    <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity duration-150">
                                                        <button
                                                            onClick={() => onEditClick(expense)}
                                                            className="p-1.5 rounded-lg text-zinc-500 hover:text-white hover:bg-zinc-800 transition-colors"
                                                            title="Edit"
                                                        >
                                                            <Pencil size={14} />
                                                        </button>
                                                        <button
                                                            onClick={() => setDeleteId(expense.id)}
                                                            className="p-1.5 rounded-lg text-zinc-500 hover:text-red-400 hover:bg-zinc-800 transition-colors"
                                                            title="Delete"
                                                        >
                                                            <Trash2 size={14} />
                                                        </button>
                                                    </div>
                                                </div>
                                            </CardBody>
                                        </Card>
                                    </motion.div>
                                ))}
                            </div>
                        </div>
                    ))
                )}
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
