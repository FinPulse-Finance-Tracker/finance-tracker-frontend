import React, { useMemo } from 'react';
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts';
import { Card, CardBody } from '../UI/Card';
import { format, eachDayOfInterval, startOfMonth, endOfMonth, parseISO, isSameDay } from 'date-fns';

function CustomTooltip({ active, payload, label }) {
    if (!active || !payload?.length) return null;
    return (
        <div className="bg-zinc-900 border border-zinc-700 rounded-lg px-3 py-2 shadow-xl">
            <p className="text-xs text-zinc-400">{label}</p>
            <p className="text-sm font-bold text-white">LKR {payload[0].value.toLocaleString()}</p>
        </div>
    );
}

export default function SpendingChart({ expenses }) {
    const chartData = useMemo(() => {
        if (!expenses || expenses.length === 0) return [];

        const now = new Date();
        const start = startOfMonth(now);
        const end = now; // up to today
        const allDays = eachDayOfInterval({ start, end });

        return allDays.map(day => {
            const dayExpenses = expenses.filter(e => {
                const expDate = typeof e.date === 'string' ? parseISO(e.date) : new Date(e.date);
                return isSameDay(expDate, day);
            });
            const total = dayExpenses.reduce((sum, e) => sum + Number(e.amount), 0);
            return {
                day: format(day, 'MMM dd'),
                shortDay: format(day, 'dd'),
                amount: total,
            };
        });
    }, [expenses]);

    if (!chartData.length) {
        return null;
    }

    const maxAmount = Math.max(...chartData.map(d => d.amount), 1);

    return (
        <Card>
            <CardBody className="p-6">
                <div className="flex items-center justify-between mb-4">
                    <div>
                        <h3 className="text-sm font-bold text-white">Spending Trend</h3>
                        <p className="text-xs text-zinc-500">Daily spending this month</p>
                    </div>
                    <div className="text-right">
                        <p className="text-lg font-bold text-white">
                            LKR {chartData.reduce((s, d) => s + d.amount, 0).toLocaleString()}
                        </p>
                        <p className="text-[10px] text-zinc-500 uppercase tracking-wider">Total this month</p>
                    </div>
                </div>
                <div className="h-[200px] -ml-2">
                    <ResponsiveContainer width="100%" height="100%">
                        <AreaChart data={chartData} margin={{ top: 5, right: 5, bottom: 0, left: 0 }}>
                            <defs>
                                <linearGradient id="spendingGradient" x1="0" y1="0" x2="0" y2="1">
                                    <stop offset="5%" stopColor="#9333ea" stopOpacity={0.3} />
                                    <stop offset="95%" stopColor="#9333ea" stopOpacity={0} />
                                </linearGradient>
                            </defs>
                            <CartesianGrid strokeDasharray="3 3" stroke="#27272a" vertical={false} />
                            <XAxis
                                dataKey="shortDay"
                                axisLine={false}
                                tickLine={false}
                                tick={{ fill: '#71717a', fontSize: 10 }}
                                interval="preserveStartEnd"
                            />
                            <YAxis
                                axisLine={false}
                                tickLine={false}
                                tick={{ fill: '#71717a', fontSize: 10 }}
                                tickFormatter={(v) => v >= 1000 ? `${(v / 1000).toFixed(0)}k` : v}
                                width={35}
                            />
                            <Tooltip content={<CustomTooltip />} cursor={{ stroke: '#9333ea', strokeWidth: 1, strokeDasharray: '3 3' }} />
                            <Area
                                type="monotone"
                                dataKey="amount"
                                stroke="#9333ea"
                                strokeWidth={2}
                                fill="url(#spendingGradient)"
                                dot={false}
                                activeDot={{ r: 4, fill: '#9333ea', stroke: '#fff', strokeWidth: 2 }}
                            />
                        </AreaChart>
                    </ResponsiveContainer>
                </div>
            </CardBody>
        </Card>
    );
}
