import React from 'react';
import { useForm } from 'react-hook-form';
import { useMutation, useQueryClient, useQuery } from '@tanstack/react-query';
import { expenseService, categoryService } from '../../services/financeService';
import { Modal } from '../UI/Modal';
import CategoryModal from '../Categories/CategoryModal';
import { Input, Select } from '../UI/Input';
import { Button } from '../UI/Button';
import { toast } from 'react-hot-toast';

export default function AddExpenseModal({ isOpen, onClose }) {
    const queryClient = useQueryClient();
    const [isCategoryModalOpen, setIsCategoryModalOpen] = React.useState(false);

    const { register, handleSubmit, reset, watch, formState: { errors } } = useForm({
        defaultValues: {
            amount: '',
            description: '',
            categoryId: '',
            date: new Date().toISOString().split('T')[0],
            notes: '',
        }
    });

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
            queryClient.invalidateQueries({ queryKey: ['expenses'] });
            queryClient.invalidateQueries({ queryKey: ['stats'] });
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
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
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

                <div className="space-y-1.5">
                    <label className="block text-sm font-medium text-zinc-300 ml-1">
                        Category <span className="text-red-500">*</span>
                    </label>
                    <div className="relative">
                        <select
                            className="w-full bg-zinc-900 border border-zinc-800 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-purple-500 transition-colors appearance-none cursor-pointer"
                            {...register('categoryId', { required: 'Please select a category' })}
                            onChange={(e) => {
                                if (e.target.value === 'ADD_NEW') {
                                    e.target.value = ''; // Reset select
                                    setIsCategoryModalOpen(true);
                                } else {
                                    // Let React Hook Form handle the normal change
                                    register('categoryId').onChange(e);
                                }
                            }}
                        >
                            <option value="" disabled>Select a category</option>
                            {categories?.map((cat) => (
                                <option key={cat.id} value={cat.id} className="bg-zinc-900">
                                    {cat.icon} {cat.name}
                                </option>
                            ))}
                            <option value="ADD_NEW" className="bg-purple-900/20 text-purple-400 font-medium">
                                + Add New Category
                            </option>
                        </select>
                        {errors.categoryId && (
                            <p className="text-xs text-red-500 mt-1 ml-1">{errors.categoryId.message}</p>
                        )}
                        <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-4 text-zinc-400">
                            <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
                            </svg>
                        </div>
                    </div>
                </div>

                <Input
                    label="Notes (Optional)"
                    placeholder="Add more details..."
                    {...register('notes')}
                />


                <div className="flex gap-3 pt-4">
                    <Button type="button" variant="secondary" onClick={onClose} className="flex-1">
                        Cancel
                    </Button>
                    <Button type="submit" isLoading={mutation.isPending} className="flex-1">
                        Save Expense
                    </Button>
                </div>
            </form>

            <CategoryModal 
                isOpen={isCategoryModalOpen} 
                onClose={() => setIsCategoryModalOpen(false)} 
            />
        </Modal>
    );
}
