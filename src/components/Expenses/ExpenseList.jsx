import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { expenseService } from '../../services/financeService';
import { Card, CardBody } from '../UI/Card';
import { Button } from '../UI/Button';
import { Plus, Search, Filter, Calendar, MoreHorizontal, Tag } from 'lucide-react';
import { format } from 'date-fns';
import { motion } from 'framer-motion';

export default function ExpenseList({ onAddClick }) {
    const { data: expenses, isLoading } = useQuery({
        queryKey: ['expenses'],
        queryFn: () => expenseService.getExpenses(),
    });

    if (isLoading) {
        return (
            <div className="space-y-4">
                {[1, 2, 3].map((i) => (
                    <div key={i} className="h-24 bg-zinc-900/50 animate-pulse rounded-xl border border-zinc-800" />
                ))}
            </div>
        );
    }

    return (
        <div className="space-y-6">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                    <h2 className="text-xl font-bold text-white">Expenses</h2>
                    <p className="text-sm text-zinc-400">Track and manage your spending</p>
                </div>
                <div className="flex gap-2 w-full md:w-auto">
                    <Button variant="secondary" className="gap-2 flex-1 md:flex-none">
                        <Filter size={16} />
                        Filter
                    </Button>
                    <Button onClick={onAddClick} className="gap-2 flex-1 md:flex-none">
                        <Plus size={18} />
                        Add Expense
                    </Button>
                </div>
            </div>

            <div className="space-y-3">
                {expenses?.length === 0 ? (
                    <div className="text-center py-12 bg-zinc-900/20 rounded-2xl border border-zinc-800/50">
                        <p className="text-zinc-500">No expenses found. Start by adding one!</p>
                    </div>
                ) : (
                    expenses?.map((expense, index) => (
                        <motion.div
                            key={expense.id}
                            initial={{ opacity: 0, x: -10 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: index * 0.03 }}
                        >
                            <Card className="group hover:bg-zinc-900 transition-all duration-300">
                                <CardBody className="flex items-center justify-between p-4 px-6">
                                    <div className="flex items-center gap-4">
                                        <div
                                            className="w-12 h-12 rounded-xl flex items-center justify-center text-xl shadow-lg shadow-black/20"
                                            style={{
                                                backgroundColor: `${expense.category?.color || '#333'}20`,
                                                color: expense.category?.color || '#888',
                                                border: `1px solid ${expense.category?.color || '#333'}40`
                                            }}
                                        >
                                            {expense.category?.icon || '💰'}
                                        </div>
                                        <div>
                                            <h4 className="font-semibold text-white group-hover:text-purple-400 transition-colors">
                                                {expense.description}
                                            </h4>
                                            <div className="flex items-center gap-3 mt-0.5">
                                                <span className="text-xs text-zinc-500 flex items-center gap-1">
                                                    <Tag size={12} />
                                                    {expense.category?.name || 'Uncategorized'}
                                                </span>
                                                <span className="text-xs text-zinc-500 flex items-center gap-1">
                                                    <Calendar size={12} />
                                                    {format(new Date(expense.date), 'MMM dd, yyyy')}
                                                </span>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-6">
                                        <div className="text-right">
                                            <p className="font-bold text-white text-lg">
                                                -LKR {Number(expense.amount).toLocaleString()}
                                            </p>
                                            {expense.notes && (
                                                <p className="text-xs text-zinc-600 mt-0.5 max-w-[150px] truncate">
                                                    {expense.notes}
                                                </p>
                                            )}
                                        </div>
                                        <Button variant="ghost" size="sm" className="w-8 h-8 p-0">
                                            <MoreHorizontal size={18} />
                                        </Button>
                                    </div>
                                </CardBody>
                            </Card>
                        </motion.div>
                    ))
                )}
            </div>
        </div>
    );
}
