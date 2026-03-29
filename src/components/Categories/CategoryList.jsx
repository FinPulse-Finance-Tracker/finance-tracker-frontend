import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { categoryService } from '../../services/financeService';
import { Card, CardBody } from '../UI/Card';
import { Button } from '../UI/Button';
import { Plus, Tag, Pencil, Trash2 } from 'lucide-react';
import { motion } from 'framer-motion';
import { toast } from 'react-hot-toast';
import CategoryModal from './CategoryModal';
import { ConfirmModal } from '../UI/ConfirmModal';

export default function CategoryList() {
    const queryClient = useQueryClient();
    const [selectedCategory, setSelectedCategory] = useState(null);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [deleteId, setDeleteId] = useState(null);

    const { data: categories, isLoading, isFetching } = useQuery({
        queryKey: ['categories'],
        queryFn: categoryService.getCategories,
    });

    const deleteMutation = useMutation({
        mutationFn: (id) => categoryService.deleteCategory(id),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['categories'] });
            toast.success('Category deleted successfully');
            setDeleteId(null);
        },
        onError: (error) => {
            toast.error(error.response?.data?.message || 'Failed to delete category');
            setDeleteId(null);
        }
    });

    const handleEdit = (category) => {
        setSelectedCategory(category);
        setIsModalOpen(true);
    };

    const handleDelete = (id) => {
        setDeleteId(id);
    };

    const handleConfirmDelete = () => {
        if (deleteId) {
            deleteMutation.mutate(deleteId);
        }
    };

    const handleAddClick = () => {
        setSelectedCategory(null);
        setIsModalOpen(true);
    };

    if (isLoading) {
        return (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                {[1, 2, 3, 4].map((i) => (
                    <div key={i} className="h-32 bg-zinc-900/50 animate-pulse rounded-xl border border-zinc-800" />
                ))}
            </div>
        );
    }

    return (
        <div className="space-y-6">
            <div className="flex flex-wrap justify-between items-center gap-3">
                <div>
                    <h2 className="text-xl font-bold text-white">Categories</h2>
                    <p className="text-sm text-zinc-400">Manage your spending categories and budgets</p>
                </div>
                <Button onClick={handleAddClick} className="gap-2 shrink-0">
                    <Plus size={18} />
                    Add Category
                </Button>
            </div>

            <div className="relative min-h-[200px]">
                {/* Loading Overlay */}
                {isFetching && !isLoading && (
                    <div className="absolute inset-0 z-10 bg-black/10 backdrop-blur-[2px] rounded-xl flex items-center justify-center transition-all duration-300 animate-in fade-in">
                        <div className="bg-zinc-900/80 p-3 rounded-full shadow-xl border border-zinc-800">
                            <div className="animate-spin rounded-full h-5 w-5 border-2 border-purple-500 border-t-transparent"></div>
                        </div>
                    </div>
                )}

                <div className={`grid grid-cols-2 md:grid-cols-2 lg:grid-cols-3 2xl:grid-cols-4 gap-4 transition-all duration-300 ${isFetching ? 'opacity-60 scale-[0.99] filter blur-[1px]' : 'opacity-100 scale-100'}`}>
                    {categories?.map((category, index) => (
                        <motion.div
                            key={category.id}
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: index * 0.05 }}
                        >
                            <Card className="h-full group relative overflow-hidden transition-all duration-300 hover:border-zinc-700">
                                <CardBody className="p-6">
                                    <div className="flex justify-between items-start">
                                        <div
                                            className="w-12 h-12 rounded-2xl flex items-center justify-center text-2xl transition-transform group-hover:scale-110 shadow-lg"
                                            style={{
                                                backgroundColor: `${category.color}20`,
                                                color: category.color,
                                                boxShadow: `0 0 20px -5px ${category.color}40`
                                            }}
                                        >
                                            {category.icon || <Tag size={20} />}
                                        </div>
                                        <div className="flex gap-1 transform translate-x-2 opacity-0 group-hover:translate-x-0 group-hover:opacity-100 transition-all duration-200">
                                            {!category.isDefault && (
                                                <button
                                                    onClick={() => handleEdit(category)}
                                                    className="p-1.5 rounded-lg bg-zinc-800 text-zinc-400 hover:text-white hover:bg-zinc-700 transition-colors"
                                                    title="Edit"
                                                >
                                                    <Pencil size={14} />
                                                </button>
                                            )}
                                            {!category.isDefault && (
                                                <button
                                                    onClick={() => handleDelete(category.id)}
                                                    className="p-1.5 rounded-lg bg-zinc-800 text-red-500/70 hover:text-red-400 hover:bg-zinc-700 transition-colors"
                                                    title="Delete"
                                                >
                                                    <Trash2 size={14} />
                                                </button>
                                            )}
                                        </div>
                                    </div>

                                    <div className="mt-4">
                                        <h3 className="font-bold text-white flex items-center gap-2">
                                            {category.name}
                                            {category.isDefault && (
                                                <span className="text-[10px] px-1.5 py-0.5 rounded bg-zinc-800 text-zinc-500 uppercase tracking-tighter">System</span>
                                            )}
                                        </h3>
                                    </div>
                                </CardBody>
                            </Card>
                        </motion.div>
                    ))}
                </div>
            </div>

            <CategoryModal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                category={selectedCategory}
            />

            <ConfirmModal
                isOpen={!!deleteId}
                onClose={() => setDeleteId(null)}
                onConfirm={handleConfirmDelete}
                isLoading={deleteMutation.isPending}
                title="Delete Category"
                message="Are you sure you want to delete this category?"
            />
        </div>
    );
}
