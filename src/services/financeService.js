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
    getCategories: () => api.get('/categories').then(res => res.data),
    getCategory: (id) => api.get(`/categories/${id}`).then(res => res.data),
    createCategory: (data) => api.post('/categories', data).then(res => res.data),
    updateCategory: (id, data) => api.patch(`/categories/${id}`, data).then(res => res.data),
    deleteCategory: (id) => api.delete(`/categories/${id}`).then(res => res.data),
};

export const budgetService = {
    setBudget: (data) => api.post('/budgets', data).then(res => res.data),
};
