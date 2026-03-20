import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { budgetService, categoryService } from '../services/financeService';
import { Card, CardBody } from '../components/UI/Card';
import { Button } from '../components/UI/Button';
import BudgetCard from '../components/Budget/BudgetCard';
import BudgetFormModal from '../components/Budget/BudgetFormModal';
import SuggestionsPanel from '../components/Budget/SuggestionsPanel';
import UnbudgetedCard from '../components/Budget/UnbudgetedCard';
import { motion } from 'framer-motion';
import { Plus, Wallet, TrendingDown, PiggyBank, AlertTriangle } from 'lucide-react';
import { toast } from 'react-hot-toast';

export default function BudgetPage() {
    const queryClient = useQueryClient();
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editBudget, setEditBudget] = useState(null);
    const [suggestBudget, setSuggestBudget] = useState(null);
    const [defaultCategoryId, setDefaultCategoryId] = useState('');

    // Fetch budgets
    const { data, isLoading: isBudgetsLoading, isFetching: isBudgetsFetching } = useQuery({
        queryKey: ['budgets'],
        queryFn: budgetService.getBudgets,
    });

    const budgets = data?.budgets || [];
    const summary = data?.summary || { totalAllocated: 0, totalSpent: 0, totalRemaining: 0, budgetCount: 0 };

    // Fetch categories
    const { data: categories = [], isLoading: isCategoriesLoading } = useQuery({
        queryKey: ['categories'],
        queryFn: categoryService.getCategories,
    });

    // We want specifically isBudgetsFetching or isCategoriesFetching to trigger the soft-overlay
    // but not the hard-skeleton `isLoading`
    const isLoading = isBudgetsLoading || isCategoriesLoading;
    const isFetching = isBudgetsFetching && !isLoading; // only show overlay if not already hard-loading

    const unbudgetedCategories = categories.filter(
        c => !budgets.some(b => b.categoryId === c.id)
    );

    // Set/update budget mutation
    const setBudgetMutation = useMutation({
        mutationFn: budgetService.setBudget,
        onSuccess: () => {
            queryClient.invalidateQueries(['budgets']);
            toast.success(editBudget ? 'Budget updated!' : 'Budget created!');
            setIsModalOpen(false);
            setEditBudget(null);
        },
        onError: () => toast.error('Failed to save budget'),
    });

    // Delete budget mutation
    const deleteBudgetMutation = useMutation({
        mutationFn: budgetService.deleteBudget,
        onSuccess: () => {
            queryClient.invalidateQueries(['budgets']);
            toast.success('Budget deleted');
        },
        onError: () => toast.error('Failed to delete budget'),
    });

    const handleAdd = () => {
        setEditBudget(null);
        setDefaultCategoryId('');
        setIsModalOpen(true);
    };

    const handleAddForCategory = (category) => {
        setEditBudget(null);
        setDefaultCategoryId(category.id);
        setIsModalOpen(true);
    };

    const handleEdit = (budget) => {
        setEditBudget(budget);
        setDefaultCategoryId('');
        setIsModalOpen(true);
    };

    const handleDelete = (budgetId) => {
        if (window.confirm('Delete this budget?')) {
            deleteBudgetMutation.mutate(budgetId);
        }
    };

    const handleSubmit = async (data) => {
        await setBudgetMutation.mutateAsync(data);
    };

    const overBudgetCount = budgets.filter(b => b.isOverBudget).length;

    if (isLoading) {
        return (
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4 mt-20">
                {[1, 2, 3].map((i) => (
                    <div key={i} className="h-40 bg-zinc-900/50 animate-pulse rounded-xl border border-zinc-800" />
                ))}
            </div>
        );
    }

    return (
        <div className="space-y-8 animate-in fade-in duration-500">
            {/* Header */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4"
            >
                <div>
                    <h1 className="text-3xl font-bold text-white">Budgets</h1>
                    <p className="text-sm text-zinc-500 mt-1">Track your spending limits and get smart suggestions</p>
                </div>
                <Button variant="primary" size="md" onClick={handleAdd} className="gap-2 shrink-0">
                    <Plus size={16} />
                    Add Budget
                </Button>
            </motion.div>

            {/* Summary Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <Card className="bg-purple-900/10 border-purple-500/20">
                    <CardBody className="flex items-center gap-4 p-5">
                        <div className="p-3 bg-purple-500/20 rounded-xl text-purple-400">
                            <Wallet size={20} />
                        </div>
                        <div>
                            <p className="text-[10px] text-zinc-500 uppercase tracking-wider font-medium">Total Budget</p>
                            <h3 className="text-xl font-bold text-white">
                                LKR {summary.totalAllocated.toLocaleString()}
                            </h3>
                        </div>
                    </CardBody>
                </Card>

                <Card className="bg-blue-900/10 border-blue-500/20">
                    <CardBody className="flex items-center gap-4 p-5">
                        <div className="p-3 bg-blue-500/20 rounded-xl text-blue-400">
                            <TrendingDown size={20} />
                        </div>
                        <div>
                            <p className="text-[10px] text-zinc-500 uppercase tracking-wider font-medium">Total Spent</p>
                            <h3 className="text-xl font-bold text-white">
                                LKR {summary.totalSpent.toLocaleString()}
                            </h3>
                        </div>
                    </CardBody>
                </Card>

                <Card className={summary.totalRemaining >= 0 ? 'bg-green-900/10 border-green-500/20' : 'bg-red-900/10 border-red-500/20'}>
                    <CardBody className="flex items-center gap-4 p-5">
                        <div className={`p-3 rounded-xl ${summary.totalRemaining >= 0 ? 'bg-green-500/20 text-green-400' : 'bg-red-500/20 text-red-400'}`}>
                            <PiggyBank size={20} />
                        </div>
                        <div>
                            <p className="text-[10px] text-zinc-500 uppercase tracking-wider font-medium">Remaining</p>
                            <h3 className={`text-xl font-bold ${summary.totalRemaining >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                                LKR {Math.abs(summary.totalRemaining).toLocaleString()}
                            </h3>
                        </div>
                    </CardBody>
                </Card>

                <Card className={overBudgetCount > 0 ? 'bg-red-900/10 border-red-500/20' : 'bg-zinc-900/10 border-zinc-500/20'}>
                    <CardBody className="flex items-center gap-4 p-5">
                        <div className={`p-3 rounded-xl ${overBudgetCount > 0 ? 'bg-red-500/20 text-red-400' : 'bg-zinc-500/20 text-zinc-400'}`}>
                            <AlertTriangle size={20} />
                        </div>
                        <div>
                            <p className="text-[10px] text-zinc-500 uppercase tracking-wider font-medium">Over Budget</p>
                            <h3 className="text-xl font-bold text-white">
                                {overBudgetCount} {overBudgetCount === 1 ? 'category' : 'categories'}
                            </h3>
                        </div>
                    </CardBody>
                </Card>
            </div>

            {/* Budget Cards Grid with Loading Overlay */}
            <div className="relative min-h-[200px]">
                {/* Refetching Overlay */}
                {isFetching && (
                    <div className="absolute inset-0 z-10 bg-black/10 backdrop-blur-[2px] rounded-xl flex items-center justify-center transition-all duration-300 animate-in fade-in">
                        <div className="bg-zinc-900/80 p-3 rounded-full shadow-xl border border-zinc-800">
                            <div className="animate-spin rounded-full h-5 w-5 border-2 border-purple-500 border-t-transparent"></div>
                        </div>
                    </div>
                )}

                <div className={`transition-all duration-300 ${isFetching ? 'opacity-60 scale-[0.99] filter blur-[1px]' : 'opacity-100 scale-100'}`}>
                    {budgets.length === 0 ? (
                        <Card>
                            <CardBody className="text-center py-16">
                                <div className="p-4 bg-purple-500/10 rounded-full inline-block mb-4">
                                    <Wallet size={32} className="text-purple-400" />
                                </div>
                                <h3 className="text-lg font-bold text-white mb-2">No budgets set yet</h3>
                                <p className="text-sm text-zinc-500 mb-6 max-w-sm mx-auto">
                                    Start by creating your first budget to track spending and get smart suggestions on where to save.
                                </p>
                                <Button variant="primary" size="md" onClick={handleAdd} className="gap-2">
                                    <Plus size={16} />
                                    Create Your First Budget
                                </Button>
                            </CardBody>
                        </Card>
                    ) : (
                        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
                            {budgets.map((budget) => (
                                <motion.div
                                    key={budget.id}
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ duration: 0.2 }}
                                >
                                    <BudgetCard
                                        budget={budget}
                                        onEdit={handleEdit}
                                        onDelete={handleDelete}
                                        onViewSuggestions={(b) => setSuggestBudget(b)}
                                    />
                                </motion.div>
                            ))}
                        </div>
                    )}
                </div>
            </div>

            {/* Unbudgeted Categories */}
            {unbudgetedCategories.length > 0 && (
                <div className="pt-8 mt-8 border-t border-zinc-900 border-dashed space-y-4">
                    <div>
                        <h2 className="text-xl font-bold text-white">Unbudgeted Categories</h2>
                        <p className="text-sm text-zinc-500">Set limits for your other spending categories.</p>
                    </div>
                    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
                        {unbudgetedCategories.map((cat) => (
                            <motion.div
                                key={cat.id}
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ duration: 0.2 }}
                            >
                                <UnbudgetedCard category={cat} onAdd={handleAddForCategory} />
                            </motion.div>
                        ))}
                    </div>
                </div>
            )}

            {/* Budget Form Modal */}
            <BudgetFormModal
                isOpen={isModalOpen}
                onClose={() => { setIsModalOpen(false); setEditBudget(null); setDefaultCategoryId(''); }}
                onSubmit={handleSubmit}
                editBudget={editBudget}
                defaultCategoryId={defaultCategoryId}
            />

            {/* Suggestions Panel */}
            <SuggestionsPanel
                isOpen={!!suggestBudget}
                onClose={() => setSuggestBudget(null)}
                budget={suggestBudget}
            />
        </div>
    );
}
