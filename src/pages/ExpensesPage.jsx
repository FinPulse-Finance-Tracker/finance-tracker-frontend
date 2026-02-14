import React, { useState } from 'react';
import ExpenseList from '../components/Expenses/ExpenseList';
import AddExpenseModal from '../components/Expenses/AddExpenseModal';
import { Card, CardBody } from '../components/UI/Card';
import { useQuery } from '@tanstack/react-query';
import { expenseService } from '../services/financeService';
import { TrendingUp, TrendingDown, DollarSign } from 'lucide-react';

export default function ExpensesPage() {
    const [isModalOpen, setIsModalOpen] = useState(false);
    const { data: stats } = useQuery({
        queryKey: ['stats'],
        queryFn: () => expenseService.getStats(),
    });

    return (
        <div className="space-y-8 animate-in fade-in duration-500">
            {/* Quick Stats Summary */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <Card className="bg-purple-900/10 border-purple-500/20">
                    <CardBody className="flex items-center gap-4">
                        <div className="p-3 bg-purple-500/20 rounded-xl text-purple-400">
                            <DollarSign size={24} />
                        </div>
                        <div>
                            <p className="text-sm text-zinc-400">Total Spent</p>
                            <h3 className="text-2xl font-bold text-white">
                                LKR {stats?.total?.toLocaleString() || '0'}
                            </h3>
                        </div>
                    </CardBody>
                </Card>

                <Card>
                    <CardBody className="flex items-center gap-4">
                        <div className="p-3 bg-green-500/10 rounded-xl text-green-400">
                            <TrendingUp size={24} />
                        </div>
                        <div>
                            <p className="text-sm text-zinc-400">Daily Average</p>
                            <h3 className="text-2xl font-bold text-white">
                                LKR {(stats?.total / 30 || 0).toLocaleString(undefined, { maximumFractionDigits: 0 })}
                            </h3>
                        </div>
                    </CardBody>
                </Card>

                <Card>
                    <CardBody className="flex items-center gap-4">
                        <div className="p-3 bg-blue-500/10 rounded-xl text-blue-400">
                            <TrendingDown size={24} />
                        </div>
                        <div>
                            <p className="text-sm text-zinc-400">Transactions</p>
                            <h3 className="text-2xl font-bold text-white">
                                {stats?.count || 0}
                            </h3>
                        </div>
                    </CardBody>
                </Card>
            </div>

            <ExpenseList onAddClick={() => setIsModalOpen(true)} />

            <AddExpenseModal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
            />
        </div>
    );
}
