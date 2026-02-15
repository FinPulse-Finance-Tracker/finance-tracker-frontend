import React from 'react';
import { NavLink } from 'react-router-dom';
import {
    LayoutDashboard,
    Receipt,
    Tags,
    Wallet,
    Settings,
    LogOut
} from 'lucide-react';
import { cn } from '../../utils/cn';
import { UserButton, useUser } from '@clerk/clerk-react';

export default function Sidebar() {
    const { user } = useUser();
    const menuItems = [
        { icon: LayoutDashboard, label: 'Dashboard', path: '/' },
        { icon: Receipt, label: 'Expenses', path: '/expenses' },
        { icon: Tags, label: 'Categories', path: '/categories' },
        { icon: Wallet, label: 'Budgets', path: '/budgets' },
        { icon: Settings, label: 'Settings', path: '/settings' },
    ];

    return (
        <div className="w-64 h-screen bg-black border-r border-zinc-900 flex flex-col fixed left-0 top-0 z-40">
            <div className="p-6">
                <h1 className="text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-purple-600">
                    FinPulse
                </h1>
            </div>

            <nav className="flex-1 px-4 space-y-2 mt-4">
                {menuItems.map((item) => (
                    <NavLink
                        key={item.path}
                        to={item.path}
                        className={({ isActive }) => cn(
                            'flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-all duration-200',
                            isActive
                                ? 'bg-purple-600/10 text-purple-400 border border-purple-500/20'
                                : 'text-zinc-500 hover:text-white hover:bg-zinc-900'
                        )}
                    >
                        <item.icon size={20} />
                        {item.label}
                    </NavLink>
                ))}
            </nav>

            <div className="p-4 border-t border-zinc-900">
                <div className="flex items-center gap-3 p-2 rounded-lg bg-zinc-900/50">
                    <UserButton afterSignOutUrl="/" />
                    <div className="flex flex-col overflow-hidden">
                        <span className="text-sm font-medium text-white truncate">
                            {user?.firstName || 'User'}
                        </span>
                        <span className="text-xs text-zinc-500 truncate">
                            {user?.primaryEmailAddress?.emailAddress}
                        </span>
                    </div>
                </div>
            </div>
        </div>
    );
}
