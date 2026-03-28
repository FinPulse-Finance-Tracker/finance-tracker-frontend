import React, { useState } from 'react';
import { UserProfile } from '@clerk/clerk-react';
import { dark } from '@clerk/themes';
import { motion } from 'framer-motion';
import { Settings, Plug, User } from 'lucide-react';
import GmailConnect from '../components/Gmail/GmailConnect';
import { useQueryClient } from '@tanstack/react-query';

export default function SettingsPage() {
    const [activeTab, setActiveTab] = useState('account');
    const queryClient = useQueryClient();

    return (
        <div className="space-y-8 animate-in fade-in duration-500 max-w-5xl mx-auto">
            {/* Header */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex flex-col gap-2"
            >
                <div className="flex items-center gap-3">
                    <div className="p-2.5 bg-purple-500/20 rounded-xl text-purple-400">
                        <Settings size={24} />
                    </div>
                    <div>
                        <h1 className="text-2xl sm:text-3xl font-bold text-white">Settings</h1>
                        <p className="text-sm text-zinc-500 mt-1">Manage your account preferences and connected integrations</p>
                    </div>
                </div>
            </motion.div>

            {/* Tabs */}
            <div className="flex gap-4 border-b border-zinc-800 pb-px">
                <button
                    onClick={() => setActiveTab('account')}
                    className={`pb-3 px-1 text-sm font-medium transition-colors relative ${
                        activeTab === 'account' ? 'text-purple-400' : 'text-zinc-500 hover:text-zinc-300'
                    }`}
                >
                    <div className="flex items-center gap-2">
                        <User size={16} />
                        Account Details
                    </div>
                    {activeTab === 'account' && (
                        <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-purple-500 rounded-t-full shadow-[0_0_8px_rgba(168,85,247,0.5)]" />
                    )}
                </button>
                <button
                    onClick={() => setActiveTab('integrations')}
                    className={`pb-3 px-1 text-sm font-medium transition-colors relative ${
                        activeTab === 'integrations' ? 'text-purple-400' : 'text-zinc-500 hover:text-zinc-300'
                    }`}
                >
                    <div className="flex items-center gap-2">
                        <Plug size={16} />
                        Integrations
                    </div>
                    {activeTab === 'integrations' && (
                        <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-purple-500 rounded-t-full shadow-[0_0_8px_rgba(168,85,247,0.5)]" />
                    )}
                </button>
            </div>

            {/* Tab Content */}
            <motion.div
                key={activeTab}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3 }}
                className="pt-2"
            >
                {activeTab === 'account' && (
                    <div className="flex justify-start">
                        <UserProfile 
                            appearance={{ 
                                baseTheme: dark,
                                elements: {
                                    rootBox: "w-full max-w-4xl shadow-2xl",
                                    card: "bg-zinc-900 shadow-xl border border-zinc-800 rounded-xl",
                                    navbar: "border-r border-zinc-800",
                                    navbarButton: "text-zinc-400 hover:text-white hover:bg-zinc-800",
                                    pageScrollBox: "bg-zinc-900 border-l-0",
                                    headerTitle: "text-white",
                                    headerSubtitle: "text-zinc-400",
                                    profileSectionTitleText: "text-white font-semibold",
                                    profileSectionPrimaryButton: "text-purple-400 hover:bg-purple-500/10",
                                    badge: "bg-purple-500/20 text-purple-400 border border-purple-500/30",
                                    formButtonPrimary: "bg-purple-600 hover:bg-purple-700 text-white",
                                }
                            }} 
                        />
                    </div>
                )}

                {activeTab === 'integrations' && (
                    <div className="flex flex-col gap-6 max-w-2xl">
                        <div>
                            <h2 className="text-lg font-bold text-white mb-1">Email Integrations</h2>
                            <p className="text-sm text-zinc-400 mb-4">
                                Automate your tracking by syncing your inbox for digital receipts.
                            </p>
                            <GmailConnect onImported={() => queryClient.invalidateQueries(['expenses', 'stats'])} />
                        </div>
                    </div>
                )}
            </motion.div>
        </div>
    );
}
