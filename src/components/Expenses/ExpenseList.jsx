import React, { useState, useMemo, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { expenseService, categoryService } from '../../services/financeService';
import { Card, CardBody } from '../UI/Card';
import { Button } from '../UI/Button';
import { Plus, Search, Calendar, Pencil, Trash2, Tag, CalendarDays, Download, ChevronLeft, ChevronRight, RefreshCw } from 'lucide-react';
import { format, parseISO, startOfMonth, endOfMonth } from 'date-fns';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'react-hot-toast';
import { ConfirmModal } from '../UI/ConfirmModal';
import { useDateContext } from '../../context/DateContext';

export default function ExpenseList({ onAddClick, onEditClick }) {
    const queryClient = useQueryClient();
    const [searchTerm, setSearchTerm] = useState('');
    const [categoryFilter, setCategoryFilter] = useState('');

    const { getStartDate, getEndDate } = useDateContext();

    // Pagination State
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 20;

    const [deleteId, setDeleteId] = useState(null);

    // Compute start and end dates based on global month/year selection
    const filterDates = useMemo(() => {
        return {
            start: getStartDate().toISOString(),
            end: getEndDate().toISOString()
        };
    }, [getStartDate, getEndDate]);

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

    // Reset to page 1 when filters change
    const handleClearFilters = () => {
        setCategoryFilter('');
        setSearchTerm('');
        setCurrentPage(1);
    };

    // Client-side search filter
    const filteredExpenses = useMemo(() => {
        let result = expenses;
        if (searchTerm.trim()) {
            const term = searchTerm.toLowerCase();
            result = expenses.filter(e =>
                e.description?.toLowerCase().includes(term) ||
                e.category?.name?.toLowerCase().includes(term) ||
                e.notes?.toLowerCase().includes(term) ||
                e.merchant?.toLowerCase().includes(term)
            );
        }
        return result.sort((a, b) => new Date(b.date) - new Date(a.date));
    }, [expenses, searchTerm]);

    // Pagination Logic
    const totalPages = Math.ceil(filteredExpenses.length / itemsPerPage);
    const paginatedExpenses = useMemo(() => {
        const startIndex = (currentPage - 1) * itemsPerPage;
        return filteredExpenses.slice(startIndex, startIndex + itemsPerPage);
    }, [filteredExpenses, currentPage, itemsPerPage]);

    // Reset page if filtered list is smaller than current page
    useEffect(() => {
        if (currentPage > totalPages && totalPages > 0) {
            setCurrentPage(1);
        }
    }, [filteredExpenses.length, totalPages, currentPage]);

    // CSV Export Logic
    const handleExportCSV = () => {
        if (!filteredExpenses.length) return toast.error('No expenses to export');

        try {
            // CSV Header
            const headers = ['Date', 'Description', 'Merchant', 'Category', 'Amount (LKR)', 'Notes'];

            // Map data to CSV rows
            const rows = filteredExpenses.map(e => {
                return [
                    format(parseISO(e.date), 'yyyy-MM-dd'),
                    `"${(e.description || '').replace(/"/g, '""')}"`,
                    `"${(e.merchant || '').replace(/"/g, '""')}"`,
                    `"${(e.category?.name || 'Uncategorized').replace(/"/g, '""')}"`,
                    e.amount,
                    `"${(e.notes || '').replace(/"/g, '""')}"`
                ].join(',');
            });

            const csvContent = [headers.join(','), ...rows].join('\n');
            const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
            const url = URL.createObjectURL(blob);
            const link = document.createElement('a');
            link.href = url;
            link.setAttribute('download', `expenses_export_${format(new Date(), 'yyyy-MM-dd')}.csv`);
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            URL.revokeObjectURL(url);
            toast.success('Expenses exported successfully');
        } catch (error) {
            console.error('Export Error:', error);
            toast.error('Failed to export expenses');
        }
    };

    const hasActiveFilters = categoryFilter || searchTerm;

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
                <div className="flex gap-2">
                    <Button
                        variant="secondary"
                        onClick={() => queryClient.invalidateQueries(['expenses'])}
                        className="p-2 shrink-0"
                        title="Refresh Data"
                    >
                        <RefreshCw size={18} className={isFetching ? 'animate-spin' : ''} />
                    </Button>
                    <Button variant="secondary" onClick={handleExportCSV} className="gap-2 shrink-0">
                        <Download size={18} />
                        Export CSV
                    </Button>
                    <Button onClick={onAddClick} className="gap-2 shrink-0">
                        <Plus size={18} />
                        Add Expense
                    </Button>
                </div>
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
                    Showing {paginatedExpenses.length} of {filteredExpenses.length} expense{filteredExpenses.length !== 1 ? 's' : ''}
                </p>
                {isFetching && !isLoading && (
                    <div className="flex items-center gap-2 text-xs text-purple-400">
                        <div className="animate-spin rounded-full h-3 w-3 border-[1.5px] border-purple-500 border-t-transparent"></div>
                        Refreshing...
                    </div>
                )}
            </div>

            {/* Mobile Filters (visible on small screens) */}
            <div className="md:hidden w-full mb-4">
                <select
                    value={categoryFilter}
                    onChange={(e) => setCategoryFilter(e.target.value)}
                    className="w-full h-10 rounded-xl border border-zinc-800 bg-zinc-900/50 px-3 text-sm text-white focus:outline-none focus:border-purple-500 transition-all"
                >
                    <option value="">Category: All</option>
                    {categories?.map((cat) => (
                        <option key={cat.id} value={cat.id}>{cat.name}</option>
                    ))}
                </select>
            </div>

            {/* Expenses Desktop Table */}
            <div className="hidden md:block w-full border border-zinc-800 rounded-xl overflow-hidden bg-zinc-900/30">
                <div className="overflow-x-auto">
                    <table className="w-full text-left text-sm whitespace-nowrap">
                        <thead className="bg-zinc-800/80 text-zinc-400 text-xs uppercase tracking-wider">
                            <tr>
                                <th className="px-5 py-3 font-semibold align-top w-32">
                                    <div className="mb-2.5 mt-0.5">Date</div>
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
                            {paginatedExpenses.length === 0 ? (
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
                                paginatedExpenses.map((expense, index) => (
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
                                        <td className="px-5 py-4">
                                            <div className="flex flex-col">
                                                <div className="flex items-center gap-2">
                                                    <span className="text-sm font-medium text-white line-clamp-1">{expense.description}</span>
                                                </div>
                                                {expense.merchant && (
                                                    <span className="text-[11px] text-zinc-500 mt-0.5 line-clamp-1 flex items-center gap-1">
                                                        <Tag size={10} className="opacity-50" />
                                                        {expense.merchant}
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

            {/* Expenses Mobile Card View */}
            <div className="md:hidden space-y-3">
                {paginatedExpenses.length === 0 ? (
                    <div className="py-12 text-center border border-zinc-800 rounded-xl bg-zinc-900/30">
                        <div className="flex flex-col items-center justify-center text-zinc-500">
                            <CalendarDays size={32} className="mb-3 opacity-20" />
                            <p className="text-sm font-medium text-zinc-400">No expenses found</p>
                            <p className="text-xs mt-1">Try adjusting filters or add a new expense.</p>
                        </div>
                    </div>
                ) : (
                    paginatedExpenses.map((expense, index) => (
                        <motion.div
                            key={expense.id}
                            initial={{ opacity: 0, y: 5 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.2, delay: index * 0.02 }}
                            className="bg-zinc-900/50 border border-zinc-800 rounded-xl p-4 flex flex-col gap-3 relative hover:border-zinc-700 transition-colors"
                        >
                            <div className="flex justify-between items-start gap-4">
                                <div className="flex-1 min-w-0">
                                    <div className="flex items-center gap-2 mb-1">
                                        <h3 className="text-sm font-bold text-white truncate w-full">{expense.description}</h3>
                                    </div>
                                    <p className="text-xs text-zinc-400 font-medium">{format(parseISO(expense.date), 'MMM dd, yyyy')}</p>
                                    {expense.merchant && (
                                        <p className="text-[11px] text-zinc-500 mt-0.5 truncate flex items-center gap-1">
                                            <Tag size={10} className="opacity-50" />
                                            {expense.merchant}
                                        </p>
                                    )}
                                </div>
                                <div className="text-right shrink-0">
                                    <p className="font-bold text-white text-base LKR">
                                        LKR {Number(expense.amount).toLocaleString(undefined, { minimumFractionDigits: 0, maximumFractionDigits: 0 })}
                                    </p>
                                    <div className="mt-1 flex justify-end">
                                        <div className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] font-medium border"
                                            style={{
                                                backgroundColor: `${expense.category?.color || '#333'}15`,
                                                color: expense.category?.color || '#888',
                                                borderColor: `${expense.category?.color || '#333'}30`
                                            }}
                                        >
                                            <span>{expense.category?.icon || '🏷️'}</span>
                                            <span className="truncate max-w-[80px]">{expense.category?.name || 'Uncategorized'}</span>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <div className="flex justify-end gap-2 pt-3 border-t border-zinc-800/50 mt-1">
                                <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => onEditClick(expense)}
                                    className="h-8 text-zinc-400 hover:text-white hover:bg-zinc-800 flex-1 border border-zinc-800/50"
                                >
                                    <Pencil size={14} className="mr-1.5" /> Edit
                                </Button>
                                <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => setDeleteId(expense.id)}
                                    className="h-8 text-red-500/70 hover:text-red-400 hover:bg-zinc-800 flex-1 border border-zinc-800/50"
                                >
                                    <Trash2 size={14} className="mr-1.5" /> Delete
                                </Button>
                            </div>
                        </motion.div>
                    ))
                )}
            </div>

            {/* Pagination Controls */}
            {totalPages > 1 && (
                <div className="flex items-center justify-between px-2 py-4">
                    <p className="text-xs text-zinc-500">
                        Page {currentPage} of {totalPages}
                    </p>
                    <div className="flex gap-2">
                        <Button
                            variant="secondary"
                            onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                            disabled={currentPage === 1}
                            className="px-3 py-1.5 min-w-[36px]"
                        >
                            <ChevronLeft size={16} />
                        </Button>
                        <Button
                            variant="secondary"
                            onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                            disabled={currentPage === totalPages}
                            className="px-3 py-1.5 min-w-[36px]"
                        >
                            <ChevronRight size={16} />
                        </Button>
                    </div>
                </div>
            )}

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
