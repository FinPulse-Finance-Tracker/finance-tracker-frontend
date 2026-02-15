import React from 'react';
import Sidebar from './Sidebar';

export default function AppLayout({ children }) {
    return (
        <div className="min-h-screen bg-black text-white">
            <Sidebar />
            <main className="pl-64 min-h-screen">
                <div className="max-w-7xl mx-auto p-8">
                    {children}
                </div>
            </main>

            {/* Animated background highlights */}
            <div className="fixed -z-10 top-0 left-1/4 w-96 h-96 bg-purple-600/5 rounded-full blur-3xl" />
            <div className="fixed -z-10 bottom-0 right-1/4 w-96 h-96 bg-purple-600/5 rounded-full blur-3xl" />
        </div>
    );
}
