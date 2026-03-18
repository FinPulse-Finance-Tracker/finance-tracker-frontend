import React from 'react';
import { useForm } from 'react-hook-form';
import { useMutation, useQueryClient, useQuery } from '@tanstack/react-query';
import { expenseService, categoryService } from '../../services/financeService';
import { Modal } from '../UI/Modal';
import { Input, Select } from '../UI/Input';
import { Button } from '../UI/Button';
import { toast } from 'react-hot-toast';

export default function AddExpenseModal({ isOpen, onClose }) {
    const queryClient = useQueryClient();
    const { register, handleSubmit, reset, watch, formState: { errors } } = useForm({
        defaultValues: {
            amount: '',
            description: '',
            categoryId: '',
            date: new Date().toISOString().split('T')[0],
            notes: '',
            isRecurring: false,
            recurringInterval: 'monthly',
        }
    });

    const isRecurring = watch('isRecurring');

    const { data: categories } = useQuery({
        queryKey: ['categories'],
        queryFn: categoryService.getCategories,
    });

    const mutation = useMutation({
        mutationFn: (data) => expenseService.createExpense({
            ...data,
            amount: parseFloat(data.amount),
        }),
        onSuccess: () => {
            queryClient.invalidateQueries(['expenses']);
            queryClient.invalidateQueries(['stats']);
            toast.success('Expense added successfully');
            reset();
            onClose();
        },
        onError: (error) => {
            toast.error(error.response?.data?.message || 'Failed to add expense');
        }
    });

    const onSubmit = (data) => {
        mutation.mutate(data);
    };

    return (
        <Modal isOpen={isOpen} onClose={onClose} title="Log New Expense">
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
                <div className="grid grid-cols-2 gap-4">
                    <Input
                        label="Amount (LKR)"
                        type="number"
                        step="0.01"
                        placeholder="0.00"
                        error={errors.amount?.message}
                        {...register('amount', { required: 'Amount is required' })}
                    />
                    <Input
                        label="Date"
                        type="date"
                        error={errors.date?.message}
                        {...register('date', { required: 'Date is required' })}
                    />
                </div>

                <Input
                    label="Description"
                    placeholder="What did you spend on?"
                    error={errors.description?.message}
                    {...register('description', { required: 'Description is required' })}
                />

                <Select
                    label="Category"
                    error={errors.categoryId?.message}
                    {...register('categoryId', { required: 'Please select a category' })}
                >
                    <option value="" disabled className="bg-zinc-900">Select a category</option>
                    {categories?.map((cat) => (
                        <option key={cat.id} value={cat.id} className="bg-zinc-900">
                            {cat.icon} {cat.name}
                        </option>
                    ))}
                </Select>

                <Input
                    label="Notes (Optional)"
                    placeholder="Add more details..."
                    {...register('notes')}
                />

                <div className="space-y-3 p-4 bg-zinc-900/50 rounded-xl border border-zinc-800/50">
                    <label className="flex items-center gap-3 cursor-pointer group">
                        <div className="relative flex items-center">
                            <input
                                type="checkbox"
                                className="peer h-5 w-5 cursor-pointer appearance-none rounded border border-zinc-700 bg-zinc-800 transition-all checked:border-purple-500 checked:bg-purple-500"
                                {...register('isRecurring')}
                            />
                            <svg className="pointer-events-none absolute left-1/2 top-1/2 h-3.5 w-3.5 -translate-x-1/2 -translate-y-1/2 text-white opacity-0 transition-opacity peer-checked:opacity-100" fill="none" stroke="currentColor" strokeWidth="3" viewBox="0 0 24 24">
                                <path d="M5 13l4 4L19 7" strokeLinecap="round" strokeLinejoin="round"></path>
                            </svg>
                        </div>
                        <span className="text-sm font-medium text-zinc-300 group-hover:text-white transition-colors">Set as Recurring Expense</span>
                    </label>

                    {isRecurring && (
                        <div className="pt-2 animate-in fade-in slide-in-from-top-2 duration-200">
                            <Select
                                label="Frequency"
                                {...register('recurringInterval')}
                            >
                                <option value="daily" className="bg-zinc-900">Daily</option>
                                <option value="weekly" className="bg-zinc-900">Weekly</option>
                                <option value="monthly" className="bg-zinc-900">Monthly</option>
                                <option value="yearly" className="bg-zinc-900">Yearly</option>
                            </Select>
                            <p className="text-[10px] text-zinc-500 mt-2 ml-1 italic">
                                * This expense will be automatically logged again based on the interval.
                            </p>
                        </div>
                    )}
                </div>

                <div className="flex gap-3 pt-4">
                    <Button type="button" variant="secondary" onClick={onClose} className="flex-1">
                        Cancel
                    </Button>
                    <Button type="submit" isLoading={mutation.isPending} className="flex-1">
                        Save Expense
                    </Button>
                </div>
            </form>
        </Modal>
    );
}
