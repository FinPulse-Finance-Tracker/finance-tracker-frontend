import React, { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { categoryService } from '../../services/financeService';
import { Modal } from '../UI/Modal';
import { Input } from '../UI/Input';
import { Button } from '../UI/Button';
import { toast } from 'react-hot-toast';

const PRESET_COLORS = [
    '#FF6B6B', '#4ECDC4', '#45B7D1', '#96CEB4', '#FFEEAD',
    '#D4A5A5', '#9B59B6', '#3498DB', '#E67E22', '#2ECC71'
];

const PRESET_ICONS = [
    '🍔', '🏠', '🚗', '🛒', '🎬', '💊', '👕', '🎮', '✈️', '🎓', '🏋️', '🎁', '🔌', '💰', '📁'
];

export default function CategoryModal({ isOpen, onClose, category = null, isBudgetOnly = false }) {
    const isEditing = !!category;
    const queryClient = useQueryClient();

    const { register, handleSubmit, reset, watch, setValue, formState: { errors } } = useForm({
        defaultValues: {
            name: '',
            icon: '📁',
            color: '#A855F7',
            budgetAmount: '',
        }
    });

    // Update form when category prop changes (for editing)
    useEffect(() => {
        if (category) {
            reset({
                name: category.name,
                icon: category.icon,
                color: category.color,
                budgetAmount: category.budgetAmount || '',
            });
        } else {
            reset({
                name: '',
                icon: '📁',
                color: '#A855F7',
                budgetAmount: '',
            });
        }
    }, [category, reset, isBudgetOnly]);

    const selectedColor = watch('color');
    const selectedIcon = watch('icon');

    const mutation = useMutation({
        mutationFn: (data) => {
            const payload = {
                ...data,
                budgetAmount: data.budgetAmount ? parseFloat(data.budgetAmount) : null,
            };
            if (isEditing) {
                return categoryService.updateCategory(category.id, payload);
            }
            return categoryService.createCategory(payload);
        },
        onSuccess: () => {
            queryClient.invalidateQueries(['categories']);
            toast.success(isBudgetOnly ? 'Budget goal updated' : `Category ${isEditing ? 'updated' : 'created'} successfully`);
            onClose();
        },
        onError: (error) => {
            toast.error(error.response?.data?.message || `Failed to ${isEditing ? 'update' : 'create'} category`);
        }
    });

    const onSubmit = (data) => {
        mutation.mutate(data);
    };

    const getModalTitle = () => {
        if (isBudgetOnly) return 'Set Budget Goal';
        return isEditing ? 'Edit Category' : 'Add Custom Category';
    };

    return (
        <Modal
            isOpen={isOpen}
            onClose={onClose}
            title={getModalTitle()}
        >
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                <div className={`grid grid-cols-1 ${isBudgetOnly ? '' : 'md:grid-cols-2'} gap-6`}>
                    {!isBudgetOnly && (
                        <Input
                            label="Category Name"
                            placeholder="e.g. Subscriptions"
                            error={errors.name?.message}
                            {...register('name', { required: 'Name is required' })}
                        />
                    )}
                    <Input
                        label={isBudgetOnly ? "Monthly Budget Amount" : "Monthly Budget (Optional)"}
                        type="number"
                        step="0.01"
                        placeholder="e.g. 500"
                        error={errors.budgetAmount?.message}
                        {...register('budgetAmount', {
                            required: isBudgetOnly ? 'Budget amount is required' : false,
                            min: { value: 0.01, message: 'Amount must be greater than 0' }
                        })}
                    />
                </div>

                {!isBudgetOnly && (
                    <>
                        <div className="space-y-3">
                            <label className="text-sm font-medium text-zinc-400 ml-1">Select Icon</label>
                            <div className="flex flex-wrap gap-2 p-3 rounded-xl bg-zinc-900/50 border border-zinc-800">
                                {PRESET_ICONS.map((icon) => (
                                    <button
                                        key={icon}
                                        type="button"
                                        onClick={() => setValue('icon', icon)}
                                        className={`w-10 h-10 flex items-center justify-center text-xl rounded-lg transition-all ${selectedIcon === icon ? 'bg-purple-500/20 border-2 border-purple-500' : 'bg-zinc-800 hover:bg-zinc-700 border-2 border-transparent'
                                            }`}
                                    >
                                        {icon}
                                    </button>
                                ))}
                                <div className="w-px h-10 bg-zinc-800 mx-1" />
                                <input
                                    {...register('icon')}
                                    placeholder="Emoji"
                                    className="w-12 h-10 bg-zinc-800 border-2 border-zinc-700 rounded-lg text-center focus:border-purple-500 outline-none transition-all"
                                />
                            </div>
                        </div>

                        <div className="space-y-3">
                            <label className="text-sm font-medium text-zinc-400 ml-1">Color Theme</label>
                            <div className="flex flex-wrap gap-2">
                                {PRESET_COLORS.map((color) => (
                                    <button
                                        key={color}
                                        type="button"
                                        onClick={() => setValue('color', color)}
                                        className={`w-8 h-8 rounded-full border-2 transition-all ${selectedColor === color ? 'border-white scale-110' : 'border-transparent'
                                            }`}
                                        style={{ backgroundColor: color }}
                                    />
                                ))}
                                <input
                                    type="color"
                                    {...register('color')}
                                    className="w-8 h-8 rounded-full bg-zinc-800 border-none cursor-pointer overflow-hidden"
                                />
                            </div>
                        </div>
                    </>
                )}

                <div className="flex gap-3 pt-4">
                    <Button type="button" variant="secondary" onClick={onClose} className="flex-1">
                        Cancel
                    </Button>
                    <Button type="submit" isLoading={mutation.isPending} className="flex-1">
                        {isBudgetOnly ? 'Set Goal' : isEditing ? 'Update Category' : 'Create Category'}
                    </Button>
                </div>
            </form>
        </Modal>
    );
}
