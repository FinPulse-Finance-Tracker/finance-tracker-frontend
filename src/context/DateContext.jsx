import React, { createContext, useContext, useState } from 'react';

const DateContext = createContext();

export function DateProvider({ children }) {
    const today = new Date();
    const [selectedMonth, setSelectedMonth] = useState(today.getMonth());
    const [selectedYear, setSelectedYear] = useState(today.getFullYear());

    // Utility to get the first day of the currently selected month
    const getStartDate = () => {
        return new Date(selectedYear, selectedMonth, 1);
    };

    // Utility to get the last day of the currently selected month
    const getEndDate = () => {
        return new Date(selectedYear, selectedMonth + 1, 0, 23, 59, 59, 999);
    };

    return (
        <DateContext.Provider value={{
            selectedMonth,
            setSelectedMonth,
            selectedYear,
            setSelectedYear,
            getStartDate,
            getEndDate
        }}>
            {children}
        </DateContext.Provider>
    );
}

export function useDateContext() {
    const context = useContext(DateContext);
    if (!context) {
        throw new Error('useDateContext must be used within a DateProvider');
    }
    return context;
}
