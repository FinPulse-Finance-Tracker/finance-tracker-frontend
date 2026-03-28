import React from 'react';
import Sidebar from './Sidebar';
import MobileNav from './MobileNav';

export default function AppLayout({ children }) {
    return (
        <div className="min-h-screen bg-black text-white overflow-x-hidden">
            <Sidebar />
            <MobileNav />
            <main className="pl-0 md:pl-64 min-h-screen pb-20 md:pb-0 min-w-0">
                <div className="max-w-7xl mx-auto p-3 sm:p-4 md:p-8 min-w-0">
                    {children}
                </div>
            </main>

            {/* Animated background highlights */}
            <div className="fixed -z-10 top-0 left-1/4 w-96 h-96 bg-purple-600/5 rounded-full blur-3xl" />
            <div className="fixed -z-10 bottom-0 right-1/4 w-96 h-96 bg-purple-600/5 rounded-full blur-3xl" />
        </div>
    );
}
