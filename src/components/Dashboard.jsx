import { useUser } from '@clerk/clerk-react';
import { useEffect, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { expenseService, budgetService } from '../services/financeService';
import { Card, CardBody } from './UI/Card';
import { motion } from 'framer-motion';
import { TrendingUp, Coins, Tags, ArrowRight, Wallet } from 'lucide-react';
import { Link } from 'react-router-dom';
import { cn } from '../utils/cn';
import { useDateContext } from '../context/DateContext';
import MonthSelector from './UI/MonthSelector';

export default function Dashboard() {
    const { user } = useUser();
    const firstName = user?.firstName || user?.emailAddresses[0]?.emailAddress?.split('@')[0];
    const [isVisible, setIsVisible] = useState(false);
    const { getStartDate, getEndDate, selectedMonth, selectedYear } = useDateContext();

    const { data: stats, isLoading } = useQuery({
        queryKey: ['stats', selectedMonth, selectedYear],
        queryFn: () => expenseService.getStats({
            startDate: getStartDate().toISOString(),
            endDate: getEndDate().toISOString()
        }),
    });

    const { data: budgetData } = useQuery({
        queryKey: ['budgets', selectedMonth, selectedYear],
        queryFn: () => budgetService.getBudgets({ month: selectedMonth, year: selectedYear }),
    });

    // Get top 3 most critical budgets (sorted by percentUsed descending)
    const criticalBudgets = (budgetData?.budgets || [])
        .sort((a, b) => b.percentUsed - a.percentUsed)
        .slice(0, 3);

    useEffect(() => {
        setIsVisible(true);
    }, []);

    return (
        <div className="space-y-8">
            {/* Welcome Card */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-purple-900/20 border border-purple-500/30 rounded-2xl p-5 sm:p-8 transition-all hover:bg-purple-900/30 relative"
            >
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-2">
                    <h2 className="text-2xl sm:text-4xl font-bold text-white">
                        Welcome back, {firstName}!
                    </h2>
                    <MonthSelector />
                </div>
                <p className="text-purple-300 text-sm sm:text-lg">
                    Here's what's happening with your finances this month.
                </p>
            </motion.div>

            {/* Stats Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
                <Card>
                    <CardBody className="space-y-4">
                        <div className="flex items-center justify-between">
                            <h3 className="text-zinc-400 text-sm font-medium">Total Spent</h3>
                            <div className="p-2 bg-purple-500/10 rounded-lg text-purple-400">
                                <Coins size={16} />
                            </div>
                        </div>
                        <p className="text-3xl font-bold text-white">
                            LKR {stats?.total?.toLocaleString() || '0'}
                        </p>
                        <p className="text-xs text-zinc-500">This month so far</p>
                    </CardBody>
                </Card>

                <Card>
                    <CardBody className="space-y-4">
                        <div className="flex items-center justify-between">
                            <h3 className="text-zinc-400 text-sm font-medium">Daily Avg</h3>
                            <div className="p-2 bg-green-500/10 rounded-lg text-green-400">
                                <TrendingUp size={16} />
                            </div>
                        </div>
                        <p className="text-3xl font-bold text-white">
                            LKR {(stats?.total / 30 || 0).toLocaleString(undefined, { maximumFractionDigits: 0 })}
                        </p>
                        <p className="text-xs text-zinc-500 font-medium text-green-400/80">+2% from last week</p>
                    </CardBody>
                </Card>

                <Card>
                    <CardBody className="space-y-4">
                        <div className="flex items-center justify-between">
                            <h3 className="text-zinc-400 text-sm font-medium">Categories</h3>
                            <div className="p-2 bg-blue-500/10 rounded-lg text-blue-400">
                                <Tags size={16} />
                            </div>
                        </div>
                        <p className="text-3xl font-bold text-white">
                            {Object.keys(stats?.byCategory || {}).length || 0}
                        </p>
                        <p className="text-xs text-zinc-500 inline-flex items-center gap-1 hover:text-purple-400 cursor-pointer">
                            View active categories <ArrowRight size={10} />
                        </p>
                    </CardBody>
                </Card>
            </div>

            {/* Recent Activity & Quick Actions */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                <Card className="h-full">
                    <div className="p-6 border-b border-zinc-800 flex justify-between items-center">
                        <h3 className="font-bold text-white">Recent Transactions</h3>
                        <Link to="/expenses" className="text-xs text-purple-400 hover:text-purple-300">View All</Link>
                    </div>
                    <CardBody className="space-y-4">
                        {stats?.expenses?.length === 0 ? (
                            <p className="text-zinc-500 text-sm text-center py-8">No transactions yet</p>
                        ) : (
                            stats?.expenses?.map((expense) => (
                                <div key={expense.id} className="flex items-center justify-between p-3 rounded-xl bg-zinc-900/30 hover:bg-zinc-900/50 transition-colors">
                                    <div className="flex items-center gap-3">
                                        <div className="text-lg">{expense.category?.icon || '💰'}</div>
                                        <div>
                                            <p className="text-sm font-medium text-white">{expense.description}</p>
                                            <p className="text-xs text-zinc-500">{expense.category?.name}</p>
                                        </div>
                                    </div>
                                    <p className="text-sm font-bold text-white">LKR {Number(expense.amount).toLocaleString()}</p>
                                </div>
                            ))
                        )}
                    </CardBody>
                </Card>

                <div className="space-y-6">
                    <h3 className="text-xl font-bold text-white">Quick Start</h3>
                    <div className="grid gap-4">
                        {[
                            { title: 'Add Expense', desc: 'Log your latest spending', path: '/expenses', color: 'bg-purple-600' },
                            { title: 'New Category', desc: 'Create a custom tag', path: '/categories', color: 'bg-zinc-800' },
                        ].map((action, i) => (
                            <Link key={i} to={action.path}>
                                <div className="p-4 rounded-xl border border-zinc-800 hover:border-purple-500/30 hover:bg-purple-900/5 transition-all group">
                                    <div className="flex items-center justify-between">
                                        <div>
                                            <h4 className="font-bold text-white group-hover:text-purple-400 transition-colors">{action.title}</h4>
                                            <p className="text-sm text-zinc-500">{action.desc}</p>
                                        </div>
                                        <div className={cn("p-2 rounded-lg text-white", action.color)}>
                                            <ArrowRight size={18} />
                                        </div>
                                    </div>
                                </div>
                            </Link>
                        ))}
                    </div>
                </div>

                {/* Budget Health */}
                {criticalBudgets.length > 0 && (
                    <div className="space-y-6">
                        <div className="flex items-center justify-between">
                            <h3 className="text-xl font-bold text-white">Budget Health</h3>
                            <Link to="/budgets" className="text-xs text-purple-400 hover:text-purple-300 inline-flex items-center gap-1">
                                View All <ArrowRight size={10} />
                            </Link>
                        </div>
                        <div className="grid gap-3">
                            {criticalBudgets.map(budget => {
                                const getColor = () => {
                                    if (budget.percentUsed >= 90) return { bar: 'bg-red-500', bg: 'bg-red-500/10', text: 'text-red-400' };
                                    if (budget.percentUsed >= 70) return { bar: 'bg-yellow-500', bg: 'bg-yellow-500/10', text: 'text-yellow-400' };
                                    return { bar: 'bg-green-500', bg: 'bg-green-500/10', text: 'text-green-400' };
                                };
                                const colors = getColor();
                                return (
                                    <div key={budget.id} className="p-3 rounded-xl bg-zinc-900/30 border border-zinc-800 hover:border-purple-500/20 transition-all">
                                        <div className="flex items-center justify-between mb-2">
                                            <div className="flex items-center gap-2">
                                                <span className="text-lg">{budget.category?.icon || '💰'}</span>
                                                <span className="text-sm font-medium text-white">{budget.category?.name}</span>
                                            </div>
                                            <span className={`text-xs font-semibold ${colors.text}`}>
                                                {budget.percentUsed}%
                                            </span>
                                        </div>
                                        <div className={`h-1.5 rounded-full overflow-hidden ${colors.bg}`}>
                                            <div
                                                className={`h-full rounded-full transition-all duration-700 ${colors.bar}`}
                                                style={{ width: `${Math.min(budget.percentUsed, 100)}%` }}
                                            />
                                        </div>
                                        <div className="flex justify-between mt-1">
                                            <span className="text-[10px] text-zinc-500">LKR {budget.spent.toLocaleString()} spent</span>
                                            <span className="text-[10px] text-zinc-500">of LKR {budget.amount.toLocaleString()}</span>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
