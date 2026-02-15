import React, { useMemo } from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts';
import { Card, CardBody } from '../UI/Card';

const FALLBACK_COLORS = ['#9333ea', '#3b82f6', '#22c55e', '#f59e0b', '#ef4444', '#ec4899', '#06b6d4', '#8b5cf6'];

function CustomTooltip({ active, payload }) {
    if (!active || !payload?.length) return null;
    const data = payload[0].payload;
    return (
        <div className="bg-zinc-900 border border-zinc-700 rounded-lg px-3 py-2 shadow-xl">
            <p className="text-xs text-zinc-400">{data.name}</p>
            <p className="text-sm font-bold text-white">LKR {data.value.toLocaleString()}</p>
            <p className="text-[10px] text-zinc-500">{data.percentage}%</p>
        </div>
    );
}

export default function CategoryBreakdown({ expenses }) {
    const chartData = useMemo(() => {
        if (!expenses || expenses.length === 0) return [];

        const categoryMap = {};
        expenses.forEach(exp => {
            const catName = exp.category?.name || 'Uncategorized';
            const catColor = exp.category?.color || '#71717a';
            const catIcon = exp.category?.icon || '💰';
            if (!categoryMap[catName]) {
                categoryMap[catName] = { name: catName, value: 0, color: catColor, icon: catIcon };
            }
            categoryMap[catName].value += Number(exp.amount);
        });

        const data = Object.values(categoryMap).sort((a, b) => b.value - a.value);
        const total = data.reduce((sum, d) => sum + d.value, 0);
        return data.map((d, i) => ({
            ...d,
            percentage: total > 0 ? ((d.value / total) * 100).toFixed(1) : '0',
            color: d.color || FALLBACK_COLORS[i % FALLBACK_COLORS.length],
        }));
    }, [expenses]);

    if (!chartData.length) return null;

    const total = chartData.reduce((sum, d) => sum + d.value, 0);

    return (
        <Card>
            <CardBody className="p-6">
                <div className="mb-4">
                    <h3 className="text-sm font-bold text-white">Category Breakdown</h3>
                    <p className="text-xs text-zinc-500">Where your money goes</p>
                </div>

                <div className="flex items-center gap-6">
                    {/* Donut Chart */}
                    <div className="w-[140px] h-[140px] shrink-0 relative">
                        <ResponsiveContainer width="100%" height="100%">
                            <PieChart>
                                <Pie
                                    data={chartData}
                                    cx="50%"
                                    cy="50%"
                                    innerRadius={40}
                                    outerRadius={65}
                                    paddingAngle={2}
                                    dataKey="value"
                                    stroke="none"
                                >
                                    {chartData.map((entry, index) => (
                                        <Cell key={index} fill={entry.color} />
                                    ))}
                                </Pie>
                                <Tooltip content={<CustomTooltip />} />
                            </PieChart>
                        </ResponsiveContainer>
                        <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                            <span className="text-[10px] text-zinc-500">Total</span>
                            <span className="text-xs font-bold text-white">
                                {total >= 1000 ? `${(total / 1000).toFixed(1)}k` : total.toLocaleString()}
                            </span>
                        </div>
                    </div>

                    {/* Legend */}
                    <div className="flex-1 space-y-2 max-h-[140px] overflow-y-auto pr-1">
                        {chartData.map((cat, i) => (
                            <div key={i} className="flex items-center justify-between gap-2">
                                <div className="flex items-center gap-2 min-w-0">
                                    <div className="w-2.5 h-2.5 rounded-full shrink-0" style={{ backgroundColor: cat.color }} />
                                    <span className="text-xs text-zinc-300 truncate">{cat.icon} {cat.name}</span>
                                </div>
                                <div className="flex items-center gap-2 shrink-0">
                                    <span className="text-xs font-medium text-white tabular-nums">
                                        {Number(cat.value).toLocaleString()}
                                    </span>
                                    <span className="text-[10px] text-zinc-500 w-10 text-right tabular-nums">
                                        {cat.percentage}%
                                    </span>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </CardBody>
        </Card>
    );
}
