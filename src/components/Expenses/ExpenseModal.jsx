import React, { useEffect, useState, useRef } from 'react';
import { useForm } from 'react-hook-form';
import { useMutation, useQueryClient, useQuery } from '@tanstack/react-query';
import { expenseService, categoryService } from '../../services/financeService';
import { Modal } from '../UI/Modal';
import { Input, Select } from '../UI/Input';
import { Button } from '../UI/Button';
import { toast } from 'react-hot-toast';
import { Calendar, ChevronLeft, ChevronRight } from 'lucide-react';
import { format, startOfMonth, endOfMonth, eachDayOfInterval, isSameDay, isSameMonth, addMonths, subMonths, isAfter } from 'date-fns';

// Simple inline calendar component
function MiniCalendar({ selected, onChange, onClose }) {
    const [viewDate, setViewDate] = useState(selected || new Date());
    const calRef = useRef(null);

    const monthStart = startOfMonth(viewDate);
    const monthEnd = endOfMonth(viewDate);
    const days = eachDayOfInterval({ start: monthStart, end: monthEnd });

    // Pad start to align weekdays
    const startDayOfWeek = monthStart.getDay();
    const paddedDays = Array(startDayOfWeek).fill(null).concat(days);

    useEffect(() => {
        function handleClickOutside(e) {
            if (calRef.current && !calRef.current.contains(e.target)) {
                onClose();
            }
        }
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, [onClose]);

    const today = new Date();

    return (
        <div ref={calRef} className="absolute top-full left-0 mt-2 z-50 bg-zinc-900 border border-zinc-700 rounded-xl p-4 shadow-2xl shadow-black/50 w-[280px]">
            <div className="flex items-center justify-between mb-3">
                <button type="button" onClick={() => setViewDate(subMonths(viewDate, 1))} className="p-1 hover:bg-zinc-800 rounded-lg text-zinc-400 hover:text-white transition-colors">
                    <ChevronLeft size={16} />
                </button>
                <span className="text-sm font-semibold text-white">{format(viewDate, 'MMMM yyyy')}</span>
                <button type="button" onClick={() => setViewDate(addMonths(viewDate, 1))} className="p-1 hover:bg-zinc-800 rounded-lg text-zinc-400 hover:text-white transition-colors">
                    <ChevronRight size={16} />
                </button>
            </div>
            <div className="grid grid-cols-7 gap-0.5 mb-1">
                {['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'].map(d => (
                    <div key={d} className="text-center text-[10px] font-bold text-zinc-500 uppercase py-1">{d}</div>
                ))}
            </div>
            <div className="grid grid-cols-7 gap-0.5">
                {paddedDays.map((day, i) => {
                    if (!day) return <div key={`pad-${i}`} />;
                    const isSelected = selected && isSameDay(day, selected);
                    const isToday = isSameDay(day, today);
                    const isFuture = isAfter(day, today);
                    return (
                        <button
                            key={i}
                            type="button"
                            disabled={isFuture}
                            onClick={() => { onChange(day); onClose(); }}
                            className={`w-8 h-8 flex items-center justify-center text-xs rounded-lg transition-all
                                ${isSelected ? 'bg-purple-600 text-white font-bold' : ''}
                                ${isToday && !isSelected ? 'text-purple-400 font-bold ring-1 ring-purple-500/40' : ''}
                                ${!isSelected && !isToday && !isFuture ? 'text-zinc-300 hover:bg-zinc-800' : ''}
                                ${isFuture ? 'text-zinc-700 cursor-not-allowed' : ''}
                            `}
                        >
                            {day.getDate()}
                        </button>
                    );
                })}
            </div>
        </div>
    );
}

export default function ExpenseModal({ isOpen, onClose, expense = null }) {
    const isEditing = !!expense;
    const queryClient = useQueryClient();
    const [selectedDate, setSelectedDate] = useState(new Date());
    const [showCalendar, setShowCalendar] = useState(false);

    const { register, handleSubmit, reset, formState: { errors } } = useForm({
        defaultValues: {
            amount: '',
            description: '',
            categoryId: '',
            notes: '',
        }
    });

    const { data: categories } = useQuery({
        queryKey: ['categories'],
        queryFn: categoryService.getCategories,
    });

    useEffect(() => {
        if (expense) {
            setSelectedDate(new Date(expense.date));
            reset({
                amount: expense.amount,
                description: expense.description,
                categoryId: expense.categoryId || '',
                notes: expense.notes || '',
            });
        } else {
            setSelectedDate(new Date());
            reset({
                amount: '',
                description: '',
                categoryId: '',
                notes: '',
            });
        }
    }, [expense, reset]);

    const mutation = useMutation({
        mutationFn: (data) => {
            const payload = {
                ...data,
                amount: parseFloat(data.amount),
                date: selectedDate.toISOString().split('T')[0],
            };
            if (isEditing) {
                return expenseService.updateExpense(expense.id, payload);
            }
            return expenseService.createExpense(payload);
        },
        onSuccess: () => {
            queryClient.invalidateQueries(['expenses']);
            queryClient.invalidateQueries(['stats']);
            queryClient.invalidateQueries(['categories']);
            toast.success(`Expense ${isEditing ? 'updated' : 'added'} successfully`);
            reset();
            onClose();
        },
        onError: (error) => {
            toast.error(error.response?.data?.message || `Failed to ${isEditing ? 'update' : 'add'} expense`);
        }
    });

    const onSubmit = (data) => {
        mutation.mutate(data);
    };

    return (
        <Modal isOpen={isOpen} onClose={onClose} title={isEditing ? 'Edit Expense' : 'Log New Expense'}>
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
                    <div className="w-full space-y-1.5">
                        <label className="text-sm font-medium text-zinc-400 ml-1">Date</label>
                        <div className="relative">
                            <button
                                type="button"
                                onClick={() => setShowCalendar(!showCalendar)}
                                className="flex h-10 w-full items-center gap-2 rounded-lg border border-zinc-800 bg-zinc-900/50 pl-10 pr-3 py-2 text-sm text-white focus:outline-none focus:ring-2 focus:ring-purple-600 focus:ring-offset-2 ring-offset-black transition-all hover:border-zinc-700"
                            >
                                {format(selectedDate, 'MMM dd, yyyy')}
                            </button>
                            <Calendar size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500 pointer-events-none" />
                            {showCalendar && (
                                <MiniCalendar
                                    selected={selectedDate}
                                    onChange={setSelectedDate}
                                    onClose={() => setShowCalendar(false)}
                                />
                            )}
                        </div>
                    </div>
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
                        {isEditing ? 'Update Expense' : 'Save Expense'}
                    </Button>
                </div>
            </form>
        </Modal>
    );
}
