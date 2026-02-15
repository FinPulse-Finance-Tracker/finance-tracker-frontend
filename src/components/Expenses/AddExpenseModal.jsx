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
    const { register, handleSubmit, reset, formState: { errors } } = useForm({
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
