import React from 'react';
import { NavLink } from 'react-router-dom';
import {
    LayoutDashboard,
    Receipt,
    Tags,
    Wallet,
    Settings
} from 'lucide-react';
import { cn } from '../../utils/cn';

export default function MobileNav() {
    const menuItems = [
        { icon: LayoutDashboard, label: 'Dashboard', path: '/' },
        { icon: Receipt, label: 'Expenses', path: '/expenses' },
        { icon: Wallet, label: 'Budgets', path: '/budgets' },
        { icon: Tags, label: 'Categories', path: '/categories' },
        // Settings might be less critical on mobile or can be top right in specific pages, 
        // but let's include it for completeness as 5 items fit well.
        { icon: Settings, label: 'Settings', path: '/settings' },
    ];

    return (
        <div className="fixed bottom-0 left-0 right-0 bg-zinc-950 border-t border-zinc-900 md:hidden z-50 pb-safe">
            <nav className="flex justify-around items-center h-16 px-2">
                {menuItems.map((item) => (
                    <NavLink
                        key={item.path}
                        to={item.path}
                        className={({ isActive }) => cn(
                            'flex flex-col items-center justify-center gap-1 p-2 rounded-xl transition-all duration-200 min-w-[60px]',
                            isActive
                                ? 'text-purple-400'
                                : 'text-zinc-500 hover:text-zinc-300'
                        )}
                    >
                        {({ isActive }) => (
                            <>
                                <div className={cn(
                                    "p-1.5 rounded-full transition-all duration-200",
                                    isActive ? "bg-purple-500/10" : "bg-transparent"
                                )}>
                                    <item.icon size={20} strokeWidth={isActive ? 2.5 : 2} />
                                </div>
                                <span className="text-[10px] font-medium">{item.label}</span>
                            </>
                        )}
                    </NavLink>
                ))}
            </nav>
        </div>
    );
}
