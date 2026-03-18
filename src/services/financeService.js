import api from './api';

export const expenseService = {
    getExpenses: (params) => api.get('/expenses', { params }).then(res => res.data),
    getExpense: (id) => api.get(`/expenses/${id}`).then(res => res.data),
    createExpense: (data) => api.post('/expenses', data).then(res => res.data),
    updateExpense: (id, data) => api.patch(`/expenses/${id}`, data).then(res => res.data),
    deleteExpense: (id) => api.delete(`/expenses/${id}`).then(res => res.data),
    getStats: (params) => api.get('/expenses/stats', { params }).then(res => res.data),
};

export const categoryService = {
    getCategories: async () => {
        try {
            const data = await api.get('/categories').then(res => res.data);
            // Cache successful result
            localStorage.setItem('cached_categories', JSON.stringify(data));
            return data;
        } catch (error) {
            console.warn('Failed to fetch categories, falling back to cache:', error);
            const cached = localStorage.getItem('cached_categories');
            if (cached) {
                return JSON.parse(cached);
            }
            throw error; // No cache, still fail
        }
    },
    getCategory: (id) => api.get(`/categories/${id}`).then(res => res.data),
    createCategory: (data) => api.post('/categories', data).then(res => res.data),
    updateCategory: (id, data) => api.patch(`/categories/${id}`, data).then(res => res.data),
    deleteCategory: (id) => api.delete(`/categories/${id}`).then(res => res.data),
};

export const budgetService = {
    setBudget: (data) => api.post('/budgets', data).then(res => res.data),
};

export const gmailService = {
    getConnectUrl: () => api.get('/gmail/connect').then(res => res.data),
    getStatus: () => api.get('/gmail/status').then(res => res.data),
    sync: () => api.post('/gmail/sync').then(res => res.data),
    importExpenses: (expenses) => api.post('/gmail/import', { expenses }).then(res => res.data),
    disconnect: () => api.delete('/gmail/disconnect').then(res => res.data),
};

export const smsService = {
    parse: (text) => api.post('/sms/parse', { text }).then(res => res.data),
    importExpenses: (expenses) => api.post('/sms/import', { expenses }).then(res => res.data),
};

export const receiptService = {
    scan: (file) => {
        const formData = new FormData();
        formData.append('file', file);
        return api.post('/receipt/scan', formData, {
            headers: { 'Content-Type': 'multipart/form-data' }
        }).then(res => res.data);
    },
    importExpense: (expense) => api.post('/receipt/import', { expense }).then(res => res.data),
};
