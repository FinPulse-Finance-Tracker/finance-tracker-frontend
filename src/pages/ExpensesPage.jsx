import React, { useState, useMemo } from 'react';
import ExpenseList from '../components/Expenses/ExpenseList';
import ExpenseModal from '../components/Expenses/ExpenseModal';
import SpendingChart from '../components/Expenses/SpendingChart';
import CategoryBreakdown from '../components/Expenses/CategoryBreakdown';
import { Card, CardBody } from '../components/UI/Card';
import { useQuery } from '@tanstack/react-query';
import { expenseService } from '../services/financeService';
import { DollarSign, TrendingUp, TrendingDown, Download, CalendarDays } from 'lucide-react';
import { Button } from '../components/UI/Button';
import { toast } from 'react-hot-toast';
import { format } from 'date-fns';

export default function ExpensesPage() {
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedExpense, setSelectedExpense] = useState(null);

    const today = useMemo(() => new Date().toISOString().split('T')[0], []);
    const monthStart = useMemo(() => {
        const now = new Date();
        return new Date(now.getFullYear(), now.getMonth(), 1).toISOString().split('T')[0];
    }, []);
    const lastMonthStart = useMemo(() => {
        const now = new Date();
        const lm = new Date(now.getFullYear(), now.getMonth() - 1, 1);
        return lm.toISOString().split('T')[0];
    }, []);
    const lastMonthEnd = useMemo(() => {
        const now = new Date();
        const lme = new Date(now.getFullYear(), now.getMonth(), 0); // last day of prev month
        return lme.toISOString().split('T')[0];
    }, []);

    // Current month stats
    const { data: monthlyStats } = useQuery({
        queryKey: ['stats', 'monthly', monthStart, today],
        queryFn: () => expenseService.getStats({ startDate: monthStart, endDate: today }),
    });

    // Today's stats
    const { data: todayStats } = useQuery({
        queryKey: ['stats', 'today', today],
        queryFn: () => expenseService.getStats({ startDate: today, endDate: today }),
    });

    // Last month stats (for comparison)
    const { data: lastMonthStats } = useQuery({
        queryKey: ['stats', 'lastMonth', lastMonthStart, lastMonthEnd],
        queryFn: () => expenseService.getStats({ startDate: lastMonthStart, endDate: lastMonthEnd }),
    });

    // Current month expenses (for charts)
    const { data: monthExpensesResponse } = useQuery({
        queryKey: ['expenses', 'monthly', monthStart, today],
        queryFn: () => expenseService.getExpenses({ startDate: monthStart, endDate: today, limit: 500 }),
    });

    const monthExpenses = monthExpensesResponse?.data || monthExpensesResponse || [];

    // Monthly comparison
    const comparison = useMemo(() => {
        const thisMonth = monthlyStats?.total || 0;
        const lastMonth = lastMonthStats?.total || 0;
        if (lastMonth === 0) return { percent: 0, direction: 'same', text: 'No data from last month' };
        const diff = ((thisMonth - lastMonth) / lastMonth) * 100;
        if (diff > 0) return { percent: Math.abs(diff).toFixed(0), direction: 'up', text: `${Math.abs(diff).toFixed(0)}% more than last month` };
        if (diff < 0) return { percent: Math.abs(diff).toFixed(0), direction: 'down', text: `${Math.abs(diff).toFixed(0)}% less than last month` };
        return { percent: 0, direction: 'same', text: 'Same as last month' };
    }, [monthlyStats, lastMonthStats]);

    const handleAddClick = () => {
        setSelectedExpense(null);
        setIsModalOpen(true);
    };

    const handleEditClick = (expense) => {
        setSelectedExpense(expense);
        setIsModalOpen(true);
    };

    // CSV Export
    const handleExportCSV = () => {
        if (!monthExpenses || monthExpenses.length === 0) {
            toast.error('No expenses to export');
            return;
        }

        const headers = ['Date', 'Description', 'Category', 'Amount (LKR)', 'Notes'];
        const rows = monthExpenses.map(exp => [
            format(new Date(exp.date), 'yyyy-MM-dd'),
            `"${exp.description || ''}"`,
            `"${exp.category?.name || 'Uncategorized'}"`,
            Number(exp.amount).toFixed(2),
            `"${exp.notes || ''}"`,
        ]);

        const csv = [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
        const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `expenses_${format(new Date(), 'yyyy-MM')}.csv`;
        link.click();
        URL.revokeObjectURL(url);
        toast.success('Expenses exported!');
    };

    return (
        <div className="space-y-8 animate-in fade-in duration-500">
            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {/* Total Spent This Month */}
                <Card className="bg-purple-900/10 border-purple-500/20">
                    <CardBody className="flex items-center gap-4 p-5">
                        <div className="p-3 bg-purple-500/20 rounded-xl text-purple-400">
                            <DollarSign size={22} />
                        </div>
                        <div>
                            <p className="text-xs text-zinc-500 uppercase tracking-wider font-medium">This Month</p>
                            <h3 className="text-xl font-bold text-white mt-0.5">
                                LKR {monthlyStats?.total?.toLocaleString() || '0'}
                            </h3>
                        </div>
                    </CardBody>
                </Card>

                {/* Today's Expenses */}
                <Card className="bg-green-900/10 border-green-500/20">
                    <CardBody className="flex items-center gap-4 p-5">
                        <div className="p-3 bg-green-500/20 rounded-xl text-green-400">
                            <CalendarDays size={22} />
                        </div>
                        <div>
                            <p className="text-xs text-zinc-500 uppercase tracking-wider font-medium">Today</p>
                            <h3 className="text-xl font-bold text-white mt-0.5">
                                LKR {todayStats?.total?.toLocaleString() || '0'}
                            </h3>
                        </div>
                    </CardBody>
                </Card>

                {/* Monthly Comparison */}
                <Card className={`${comparison.direction === 'down' ? 'bg-emerald-900/10 border-emerald-500/20' : comparison.direction === 'up' ? 'bg-red-900/10 border-red-500/20' : 'border-zinc-800'}`}>
                    <CardBody className="flex items-center gap-4 p-5">
                        <div className={`p-3 rounded-xl ${comparison.direction === 'down' ? 'bg-emerald-500/20 text-emerald-400' : comparison.direction === 'up' ? 'bg-red-500/20 text-red-400' : 'bg-zinc-800 text-zinc-400'}`}>
                            {comparison.direction === 'up' ? <TrendingUp size={22} /> : <TrendingDown size={22} />}
                        </div>
                        <div>
                            <p className="text-xs text-zinc-500 uppercase tracking-wider font-medium">vs Last Month</p>
                            <h3 className={`text-sm font-bold mt-0.5 ${comparison.direction === 'down' ? 'text-emerald-400' : comparison.direction === 'up' ? 'text-red-400' : 'text-zinc-400'}`}>
                                {comparison.text}
                            </h3>
                        </div>
                    </CardBody>
                </Card>
            </div>

            {/* Charts Row */}
            <div className="grid grid-cols-1 lg:grid-cols-5 gap-4">
                <div className="lg:col-span-3">
                    <SpendingChart expenses={monthExpenses} />
                </div>
                <div className="lg:col-span-2">
                    <CategoryBreakdown expenses={monthExpenses} />
                </div>
            </div>

            {/* Export Button */}
            <div className="flex justify-end">
                <Button variant="secondary" size="sm" onClick={handleExportCSV} className="gap-2">
                    <Download size={14} />
                    Export CSV
                </Button>
            </div>

            {/* Expense List */}
            <ExpenseList
                onAddClick={handleAddClick}
                onEditClick={handleEditClick}
            />

            {/* Expense Modal */}
            <ExpenseModal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                expense={selectedExpense}
            />
        </div>
    );
}
