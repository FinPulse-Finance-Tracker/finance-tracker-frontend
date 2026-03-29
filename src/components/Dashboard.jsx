import { useUser } from '@clerk/clerk-react';
import { useEffect, useState, useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { expenseService, budgetService } from '../services/financeService';
import { motion } from 'framer-motion';
import { TrendingUp, Coins, Tags, ArrowRight, Activity, Wallet, Plus, CreditCard } from 'lucide-react';
import { Link } from 'react-router-dom';
import { cn } from '../utils/cn';
import { useDateContext } from '../context/DateContext';
import MonthSelector from './UI/MonthSelector';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { format, parseISO } from 'date-fns';

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

    const criticalBudgets = (budgetData?.budgets || [])
        .sort((a, b) => b.percentUsed - a.percentUsed)
        .slice(0, 3);

    const chartData = useMemo(() => {
        if (!stats?.expenses?.length) return [];
        const daily = stats.expenses.reduce((acc, exp) => {
            const dateStr = exp.date.split('T')[0];
            acc[dateStr] = (acc[dateStr] || 0) + Number(exp.amount);
            return acc;
        }, {});
        
        return Object.entries(daily)
            .sort(([a], [b]) => a.localeCompare(b))
            .map(([date, amount]) => ({
                date: format(parseISO(date), 'MMM dd'),
                amount
            }));
    }, [stats?.expenses]);

    useEffect(() => {
        setIsVisible(true);
    }, []);

    const containerVariants = {
        hidden: { opacity: 0 },
        show: {
            opacity: 1,
            transition: { staggerChildren: 0.1 }
        }
    };

    const itemVariants = {
        hidden: { opacity: 0, y: 30 },
        show: { opacity: 1, y: 0, transition: { type: "spring", stiffness: 300, damping: 24 } }
    };

    return (
        <div className="relative w-full h-full">
            {isLoading && (
                <div className="absolute inset-0 z-50 bg-black/5 backdrop-blur-[3px] rounded-3xl flex items-start justify-center pt-32 transition-all duration-300 animate-in fade-in">
                    <div className="bg-zinc-900/80 p-4 rounded-full shadow-2xl border border-zinc-800/80">
                        <div className="animate-spin rounded-full h-6 w-6 border-[2.5px] border-purple-500 border-t-transparent"></div>
                    </div>
                </div>
            )}
            <motion.div 
                variants={containerVariants}
                initial="hidden"
                animate="show"
                className={`space-y-8 transition-all duration-500 ${isLoading ? 'opacity-50 scale-[0.98] blur-[2px] pointer-events-none' : 'opacity-100 scale-100'}`}
            >
            {/* Welcome Hero */}
            <motion.div
                variants={itemVariants}
                className="relative overflow-hidden rounded-[2rem] p-8 sm:p-10 border border-white/10 shadow-2xl bg-zinc-950"
            >
                {/* Background Art */}
                <div className="absolute inset-0 bg-gradient-to-br from-indigo-900/60 via-purple-900/40 to-black/95 pointer-events-none" />
                <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-purple-500/20 rounded-full blur-[120px] pointer-events-none -translate-y-1/2 translate-x-1/3" />
                <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-blue-500/10 rounded-full blur-[100px] pointer-events-none translate-y-1/3 -translate-x-1/3" />
                
                <div className="relative z-10 flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
                    <div>
                        <h2 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-white via-purple-100 to-purple-300 tracking-tight mb-3">
                            Welcome back, {firstName}
                        </h2>
                        <p className="text-purple-200/70 text-lg sm:text-xl font-medium max-w-xl">
                            Here is the pulse of your finances. It looks like you're on track this month.
                        </p>
                    </div>
                    <div className="bg-black/40 backdrop-blur-xl border border-white/10 p-2.5 rounded-3xl shadow-[0_0_30px_rgba(0,0,0,0.5)] shrink-0">
                        <MonthSelector />
                    </div>
                </div>
            </motion.div>

            {/* Metrics Row */}
            <motion.div variants={itemVariants} className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-zinc-900/60 backdrop-blur-2xl border border-zinc-800/80 hover:border-purple-500/50 rounded-3xl p-7 transition-all duration-500 group hover:shadow-[0_0_40px_rgba(168,85,247,0.15)] relative overflow-hidden flex flex-col justify-between">
                    <div className="absolute top-0 right-0 w-40 h-40 bg-purple-500/10 rounded-full blur-3xl group-hover:bg-purple-500/20 transition-all duration-700 opacity-0 group-hover:opacity-100" />
                    <div className="relative z-10">
                        <div className="flex justify-between items-start mb-6">
                            <div className="p-3.5 bg-purple-500/10 text-purple-400 rounded-2xl group-hover:scale-110 group-hover:bg-purple-500/20 transition-transform duration-500">
                                <Coins size={24} strokeWidth={2.5} />
                            </div>
                            <span className="text-xs font-bold text-purple-400/90 bg-purple-500/10 px-3 py-1.5 rounded-full border border-purple-500/20 uppercase tracking-wider">Total Spent</span>
                        </div>
                        <div>
                            <p className="text-4xl lg:text-5xl font-extrabold text-white tracking-tight mb-2">
                                <span className="text-2xl text-zinc-500 font-bold mr-1">LKR</span>
                                {stats?.total?.toLocaleString() || '0'}
                            </p>
                            <p className="text-sm font-medium text-zinc-500 group-hover:text-purple-300/70 transition-colors">Across {stats?.expenses?.length || 0} secure transactions</p>
                        </div>
                    </div>
                </div>

                <div className="bg-zinc-900/60 backdrop-blur-2xl border border-zinc-800/80 hover:border-emerald-500/50 rounded-3xl p-7 transition-all duration-500 group hover:shadow-[0_0_40px_rgba(16,185,129,0.15)] relative overflow-hidden flex flex-col justify-between">
                    <div className="absolute top-0 right-0 w-40 h-40 bg-emerald-500/10 rounded-full blur-3xl group-hover:bg-emerald-500/20 transition-all duration-700 opacity-0 group-hover:opacity-100" />
                    <div className="relative z-10">
                        <div className="flex justify-between items-start mb-6">
                            <div className="p-3.5 bg-emerald-500/10 text-emerald-400 rounded-2xl group-hover:scale-110 group-hover:bg-emerald-500/20 transition-transform duration-500">
                                <TrendingUp size={24} strokeWidth={2.5} />
                            </div>
                            <span className="text-xs font-bold text-emerald-400/90 bg-emerald-500/10 px-3 py-1.5 rounded-full border border-emerald-500/20 uppercase tracking-wider">Daily Average</span>
                        </div>
                        <div>
                            <p className="text-4xl lg:text-5xl font-extrabold text-white tracking-tight mb-2">
                                <span className="text-2xl text-zinc-500 font-bold mr-1">LKR</span>
                                {(stats?.total / 30 || 0).toLocaleString(undefined, { maximumFractionDigits: 0 })}
                            </p>
                            <p className="text-sm font-medium text-emerald-500/70 group-hover:text-emerald-400 transition-colors">Paced healthy spending</p>
                        </div>
                    </div>
                </div>

                <div className="bg-zinc-900/60 backdrop-blur-2xl border border-zinc-800/80 hover:border-blue-500/50 rounded-3xl p-7 transition-all duration-500 group hover:shadow-[0_0_40px_rgba(59,130,246,0.15)] relative overflow-hidden flex flex-col justify-between">
                    <div className="absolute top-0 right-0 w-40 h-40 bg-blue-500/10 rounded-full blur-3xl group-hover:bg-blue-500/20 transition-all duration-700 opacity-0 group-hover:opacity-100" />
                    <div className="relative z-10">
                        <div className="flex justify-between items-start mb-6">
                            <div className="p-3.5 bg-blue-500/10 text-blue-400 rounded-2xl group-hover:scale-110 group-hover:bg-blue-500/20 transition-transform duration-500">
                                <Tags size={24} strokeWidth={2.5} />
                            </div>
                            <span className="text-xs font-bold text-blue-400/90 bg-blue-500/10 px-3 py-1.5 rounded-full border border-blue-500/20 uppercase tracking-wider">Active Categories</span>
                        </div>
                        <div>
                            <p className="text-4xl lg:text-5xl font-extrabold text-white tracking-tight mb-2">
                                {Object.keys(stats?.byCategory || {}).length || 0}
                            </p>
                            <Link to="/categories" className="text-sm font-medium text-blue-400 hover:text-blue-300 inline-flex items-center gap-1.5 group-hover:translate-x-2 transition-transform cursor-pointer">
                                Manage allocations <ArrowRight size={14} />
                            </Link>
                        </div>
                    </div>
                </div>
            </motion.div>

            {/* Layout Grid for Footer Sections */}
            <motion.div variants={itemVariants} className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Visual Transactions */}
                <div className="bg-zinc-900/40 border border-zinc-800/80 rounded-[2rem] flex flex-col overflow-hidden shadow-xl">
                    <div className="p-8 border-b border-zinc-800/50 flex justify-between items-center bg-zinc-900/60 backdrop-blur-md">
                        <div>
                            <h3 className="font-bold text-white text-xl tracking-tight">Recent Activity</h3>
                            <p className="text-xs text-zinc-500 font-medium mt-1">Your latest verified entries</p>
                        </div>
                        <Link to="/expenses" className="text-sm font-bold text-purple-400 hover:text-purple-300 hover:bg-purple-500/20 bg-purple-500/10 px-4 py-2 rounded-xl transition-all">
                            View Book
                        </Link>
                    </div>
                    <div className="p-4 sm:p-6 space-y-3 flex-1">
                        {stats?.expenses?.length === 0 ? (
                            <div className="h-full flex flex-col items-center justify-center opacity-50 py-16">
                                <CreditCard size={56} className="text-zinc-600 mb-5" strokeWidth={1.5} />
                                <p className="text-zinc-400 font-semibold text-lg">No transactions found</p>
                                <p className="text-zinc-500 text-sm mt-1">Your ledger is completely clean.</p>
                            </div>
                        ) : (
                            stats?.expenses?.slice(0, 5).map((expense) => (
                                <div key={expense.id} className="group flex items-center justify-between p-4 sm:p-5 rounded-2xl bg-zinc-900 border border-zinc-800/50 hover:border-purple-500/30 hover:bg-zinc-800/80 hover:shadow-lg transition-all duration-300 cursor-pointer">
                                    <div className="flex items-center gap-4 sm:gap-5">
                                        <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-2xl bg-gradient-to-br from-zinc-800 to-zinc-900 flex items-center justify-center text-2xl shadow-inner group-hover:scale-110 group-hover:rotate-3 transition-transform duration-300 border border-white/5">
                                            {expense.category?.icon || '🧾'}
                                        </div>
                                        <div>
                                            <p className="text-base font-bold text-white group-hover:text-purple-300 transition-colors line-clamp-1">{expense.description}</p>
                                            <p className="text-xs sm:text-sm text-zinc-500 font-medium mt-0.5">{format(parseISO(expense.date), 'MMM dd, yyyy')} • {expense.category?.name || 'Uncategorized'}</p>
                                        </div>
                                    </div>
                                    <p className="text-base sm:text-lg font-extrabold text-white tracking-tight">
                                        LKR {Number(expense.amount).toLocaleString()}
                                    </p>
                                </div>
                            ))
                        )}
                    </div>
                </div>

                {/* Quick Actions & Budget Health */}
                <div className="space-y-8 flex flex-col">
                    <div className="grid grid-cols-2 gap-4 sm:gap-6">
                        <Link to="/expenses" className="block focus:outline-none">
                            <div className="h-full bg-gradient-to-br from-purple-900/20 to-purple-900/5 hover:from-purple-900/30 hover:to-purple-900/10 border border-purple-500/30 hover:border-purple-500/50 p-6 sm:p-8 rounded-[2rem] transition-all duration-300 group flex flex-col justify-between shadow-lg">
                                <div className="bg-purple-500/20 w-max text-purple-400 p-4 rounded-2xl group-hover:scale-110 group-hover:rotate-3 transition-transform duration-300 border border-purple-500/20 mb-6">
                                    <Plus size={24} strokeWidth={2.5} />
                                </div>
                                <div>
                                    <h4 className="font-bold text-white text-xl">Log Expense</h4>
                                    <p className="text-sm font-medium text-purple-300/70 mt-1">Record a new payment</p>
                                </div>
                            </div>
                        </Link>
                        <Link to="/budgets" className="block focus:outline-none">
                            <div className="h-full bg-gradient-to-br from-blue-900/20 to-blue-900/5 hover:from-blue-900/30 hover:to-blue-900/10 border border-blue-500/30 hover:border-blue-500/50 p-6 sm:p-8 rounded-[2rem] transition-all duration-300 group flex flex-col justify-between shadow-lg">
                                <div className="bg-blue-500/20 w-max text-blue-400 p-4 rounded-2xl group-hover:scale-110 group-hover:-rotate-3 transition-transform duration-300 border border-blue-500/20 mb-6">
                                    <Wallet size={24} strokeWidth={2.5} />
                                </div>
                                <div>
                                    <h4 className="font-bold text-white text-xl">Budgets</h4>
                                    <p className="text-sm font-medium text-blue-300/70 mt-1">Manage safety nets</p>
                                </div>
                            </div>
                        </Link>
                    </div>

                    {criticalBudgets.length > 0 && (
                        <div className="bg-zinc-900/40 border border-zinc-800/80 rounded-[2rem] p-6 sm:p-8 flex-1 shadow-xl">
                            <div className="flex justify-between items-center mb-8">
                                <div>
                                    <h3 className="font-bold text-white text-xl tracking-tight">Critical Budgets</h3>
                                    <p className="text-xs font-medium text-zinc-500 mt-1">Categories approaching limits</p>
                                </div>
                            </div>
                            <div className="space-y-6">
                                {criticalBudgets.map(budget => {
                                    const isDanger = budget.percentUsed >= 90;
                                    const isWarning = budget.percentUsed >= 70 && !isDanger;
                                    const colorClass = isDanger ? 'bg-red-500' : isWarning ? 'bg-yellow-500' : 'bg-emerald-500';
                                    const glowClass = isDanger ? 'shadow-[0_0_15px_rgba(239,68,68,0.6)]' : isWarning ? 'shadow-[0_0_15px_rgba(234,179,8,0.6)]' : 'shadow-[0_0_15px_rgba(16,185,129,0.6)]';
                                    const textClass = isDanger ? 'text-red-400' : isWarning ? 'text-yellow-400' : 'text-emerald-400';
                                    const bgLight = isDanger ? 'bg-red-500/10 border-red-500/20 text-red-400' : isWarning ? 'bg-yellow-500/10 border-yellow-500/20 text-yellow-400' : 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400';

                                    return (
                                        <div key={budget.id} className="group cursor-pointer">
                                            <div className="flex justify-between items-center mb-3">
                                                <div className="flex items-center gap-3.5">
                                                    <div className={`p-2.5 rounded-xl border ${bgLight} shadow-inner group-hover:scale-110 transition-transform`}>
                                                        <span className="text-xl">{budget.category?.icon || '💰'}</span>
                                                    </div>
                                                    <div>
                                                        <p className="font-extrabold text-white text-base tracking-tight">{budget.category?.name}</p>
                                                        <div className="flex gap-1.5 items-baseline mt-0.5">
                                                            <span className="text-sm font-bold text-zinc-400">LKR {Number(budget.spent).toLocaleString()}</span>
                                                            <span className="text-xs text-zinc-600 font-medium">/</span>
                                                            <span className="text-xs text-zinc-500 font-bold">{Number(budget.amount).toLocaleString()}</span>
                                                        </div>
                                                    </div>
                                                </div>
                                                <div className={`px-3 py-1 rounded-full border border-current ${bgLight}`}>
                                                    <span className={`text-sm font-extrabold tracking-tight`}>{Math.min(budget.percentUsed, 100)}%</span>
                                                </div>
                                            </div>
                                            <div className="h-2.5 w-full bg-zinc-950 rounded-full overflow-hidden border border-zinc-800">
                                                <div 
                                                    className={`h-full rounded-full transition-all duration-1000 ease-out ${colorClass} ${glowClass}`}
                                                    style={{ width: `${Math.min(budget.percentUsed, 100)}%` }}
                                                />
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        </div>
                    )}
                </div>
            </motion.div>
        </motion.div>
        </div>
    );
}
