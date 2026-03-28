import React, { useState, useMemo } from 'react';
import ExpenseList from '../components/Expenses/ExpenseList';
import ExpenseModal from '../components/Expenses/ExpenseModal';
import SmsImporter from '../components/Expenses/SmsImporter';
import ReceiptScanner from '../components/Expenses/ReceiptScanner';
import GmailConnect from '../components/Gmail/GmailConnect';
import { Card, CardBody } from '../components/UI/Card';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { expenseService } from '../services/financeService';
import { DollarSign, Download, CalendarDays } from 'lucide-react';
import { Button } from '../components/UI/Button';
import { toast } from 'react-hot-toast';
import { format, startOfMonth } from 'date-fns';
import { useDateContext } from '../context/DateContext';
import MonthSelector from '../components/UI/MonthSelector';

export default function ExpensesPage() {
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedExpense, setSelectedExpense] = useState(null);
    const { getStartDate, getEndDate, selectedMonth, selectedYear } = useDateContext();

    const monthStartIso = getStartDate().toISOString();
    const monthEndIso = getEndDate().toISOString();

    const today = useMemo(() => format(new Date(), 'yyyy-MM-dd'), []);

    // Current selected month stats
    const { data: monthlyStats } = useQuery({
        queryKey: ['stats', 'monthly', selectedMonth, selectedYear],
        queryFn: () => expenseService.getStats({ startDate: monthStartIso, endDate: monthEndIso }),
    });

    // Today's stats
    const { data: todayStats } = useQuery({
        queryKey: ['stats', 'today', today],
        queryFn: () => expenseService.getStats({ startDate: today, endDate: today }),
    });


    // Current selected month expenses (for charts and list)
    const { data: monthExpensesResponse } = useQuery({
        queryKey: ['expenses', 'monthly', selectedMonth, selectedYear],
        queryFn: () => expenseService.getExpenses({ startDate: monthStartIso, endDate: monthEndIso, limit: 500 }),
    });

    const monthExpenses = monthExpensesResponse?.data || monthExpensesResponse || [];


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
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <h1 className="text-2xl font-bold text-white">Expenses</h1>
                <MonthSelector />
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
            </div>

            {/* Import Tools */}
            <div className="grid grid-cols-1 gap-4">
                <GmailConnect onImported={() => queryClient.invalidateQueries(['expenses', 'stats'])} />
                <SmsImporter onImported={() => queryClient.invalidateQueries(['expenses', 'stats'])} />
                <ReceiptScanner onImported={() => queryClient.invalidateQueries(['expenses', 'stats'])} />
            </div>

            {/* Export Button */}
            <div className="flex justify-end">
                <Button variant="secondary" size="sm" onClick={handleExportCSV} className="gap-2">
                    <Download size={14} />
                    Monthly Export CSV
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
