import React from 'react';
import { ChevronLeft, ChevronRight, Calendar } from 'lucide-react';
import { useDateContext } from '../../context/DateContext';

export default function MonthSelector() {
    const { selectedMonth, setSelectedMonth, selectedYear, setSelectedYear } = useDateContext();

    const months = [
        'January', 'February', 'March', 'April', 'May', 'June',
        'July', 'August', 'September', 'October', 'November', 'December'
    ];

    const handlePrevMonth = () => {
        if (selectedMonth === 0) {
            setSelectedMonth(11);
            setSelectedYear(prev => prev - 1);
        } else {
            setSelectedMonth(prev => prev - 1);
        }
    };

    const handleNextMonth = () => {
        if (selectedMonth === 11) {
            setSelectedMonth(0);
            setSelectedYear(prev => prev + 1);
        } else {
            setSelectedMonth(prev => prev + 1);
        }
    };

    const handleResetToCurrent = () => {
        const today = new Date();
        setSelectedMonth(today.getMonth());
        setSelectedYear(today.getFullYear());
    };

    const isCurrentMonth = () => {
        const today = new Date();
        return selectedMonth === today.getMonth() && selectedYear === today.getFullYear();
    };

    return (
        <div className="flex items-center gap-2 bg-zinc-900/80 border border-zinc-800 rounded-lg p-1">
            <button
                onClick={handlePrevMonth}
                className="p-1.5 text-zinc-400 hover:text-white hover:bg-zinc-800 rounded-md transition-all"
                title="Previous Month"
            >
                <ChevronLeft size={18} />
            </button>
            
            <div className="flex flex-col items-center justify-center min-w-[110px] sm:min-w-[130px]" title="Currently viewing this month">
                <span className="text-sm font-bold text-white leading-tight">
                    {months[selectedMonth]} {selectedYear}
                </span>
                {!isCurrentMonth() && (
                    <button 
                        onClick={handleResetToCurrent}
                        className="text-[10px] text-purple-400 hover:text-purple-300 transition-colors flex items-center gap-1 mt-0.5"
                    >
                        <Calendar size={10} /> Back to current
                    </button>
                )}
            </div>

            <button
                onClick={handleNextMonth}
                className="p-1.5 text-zinc-400 hover:text-white hover:bg-zinc-800 rounded-md transition-all"
                title="Next Month"
            >
                <ChevronRight size={18} />
            </button>
        </div>
    );
}
