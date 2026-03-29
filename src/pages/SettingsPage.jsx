import React, { useState } from 'react';
import { UserProfile } from '@clerk/clerk-react';
import { dark } from '@clerk/themes';
import { motion } from 'framer-motion';
import { Settings, Plug, User, LifeBuoy, Database, Download, AlertTriangle, ExternalLink } from 'lucide-react';
import GmailConnect from '../components/Gmail/GmailConnect';
import { expenseService } from '../services/financeService';
import { useQueryClient } from '@tanstack/react-query';
import { toast } from 'react-hot-toast';

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
            <div className="flex gap-2 sm:gap-4 border-b border-zinc-800 pb-px overflow-x-auto scrollbar-hide w-full">
                <button
                    onClick={() => setActiveTab('account')}
                    className={`pb-3 px-1 text-sm font-medium transition-colors relative whitespace-nowrap ${activeTab === 'account' ? 'text-purple-400' : 'text-zinc-500 hover:text-zinc-300'
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
                    className={`pb-3 px-1 text-sm font-medium transition-colors relative whitespace-nowrap ${activeTab === 'integrations' ? 'text-purple-400' : 'text-zinc-500 hover:text-zinc-300'
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
                <button
                    onClick={() => setActiveTab('support')}
                    className={`pb-3 px-1 text-sm font-medium transition-colors relative whitespace-nowrap ${activeTab === 'support' ? 'text-purple-400' : 'text-zinc-500 hover:text-zinc-300'
                        }`}
                >
                    <div className="flex items-center gap-2">
                        <LifeBuoy size={16} />
                        Help & Support
                    </div>
                    {activeTab === 'support' && (
                        <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-purple-500 rounded-t-full shadow-[0_0_8px_rgba(168,85,247,0.5)]" />
                    )}
                </button>
                <button
                    onClick={() => setActiveTab('data')}
                    className={`pb-3 px-1 text-sm font-medium transition-colors relative whitespace-nowrap ${activeTab === 'data' ? 'text-purple-400' : 'text-zinc-500 hover:text-zinc-300'
                        }`}
                >
                    <div className="flex items-center gap-2">
                        <Database size={16} />
                        Data Privacy
                    </div>
                    {activeTab === 'data' && (
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
                            <GmailConnect onImported={() => { queryClient.invalidateQueries({ queryKey: ['expenses'] }); queryClient.invalidateQueries({ queryKey: ['stats'] }); }} />
                        </div>

                        <div className="bg-zinc-900/50 border border-zinc-800 rounded-2xl p-6 shadow-sm mt-2">
                            <h2 className="text-xl font-bold text-white mb-2 flex items-center gap-2">
                                <Plug size={20} className="text-purple-400" />
                                Google Calendar Reminders
                            </h2>
                            <p className="text-sm text-zinc-400 mb-6">
                                Want a daily push notification to log your expenses? Add a recurring 9 PM reminder directly to your personal Google Calendar.
                            </p>
                            <a
                                href="https://calendar.google.com/calendar/r/eventedit?text=Log+Daily+Expenses+-+Finance+Tracker&details=Friendly+reminder+to+add+your+daily+expenses+in+the+Finance+Tracker.+Log+them+here:+https://finpulse.nethmihapuarachchi.com/&recur=RRULE:FREQ=DAILY"
                                target="_blank"
                                rel="noopener noreferrer"
                                className="inline-flex items-center gap-2 bg-purple-600 hover:bg-purple-500 text-white px-5 py-2.5 rounded-xl font-medium transition-colors"
                            >
                                <ExternalLink size={16} />
                                Add to Google Calendar
                            </a>
                        </div>
                    </div>
                )}

                {activeTab === 'support' && (
                    <div className="flex flex-col gap-6 max-w-2xl text-zinc-300">
                        <div className="bg-zinc-900/50 border border-zinc-800 rounded-2xl p-6 shadow-sm">
                            <h2 className="text-xl font-bold text-white mb-2 flex items-center gap-2">
                                <LifeBuoy size={20} className="text-purple-400" />
                                Contact Us
                            </h2>
                            <p className="text-sm text-zinc-400 mb-6">
                                Run into a bug or have a feature request? Reach out to support directly and we'll help you get it sorted!
                            </p>
                            <a
                                href="mailto:sathruwanihapuarachchi7@gmail.com?subject=FinPulse Support Request"
                                className="inline-flex items-center gap-2 bg-purple-600 hover:bg-purple-500 text-white px-5 py-2.5 rounded-xl font-medium transition-colors"
                            >
                                <ExternalLink size={16} />
                                Email Support Team
                            </a>
                        </div>

                        <div className="bg-zinc-900/50 border border-zinc-800 rounded-2xl p-6 shadow-sm">
                            <h2 className="text-xl font-bold text-white mb-4">Frequently Asked Questions</h2>
                            <div className="space-y-4">
                                <div>
                                    <h3 className="text-md font-semibold text-zinc-200">Is my bank data secure?</h3>
                                    <p className="text-sm text-zinc-500 mt-1">We do not connect directly to your bank account. The Gmail importer securely scans receipts and bills locally within the application space via official Google verified APIs.</p>
                                </div>
                                <div>
                                    <h3 className="text-md font-semibold text-zinc-200">Do you read my personal emails?</h3>
                                    <p className="text-sm text-zinc-500 mt-1">Absolutely not! Our system uses strict automated search filters to only target emails containing receipts, invoices, or billing alerts. We never download, read, or store any of your private conversations or personal email content.</p>
                                </div>
                                <div>
                                    <h3 className="text-md font-semibold text-zinc-200">How do Smart Suggestions work?</h3>
                                    <p className="text-sm text-zinc-500 mt-1">Our AI analyzes your spending ratios against optimal standard distributions and factors in where you're bleeding cash to provide highly actionable saving targets.</p>
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {activeTab === 'data' && (
                    <div className="flex flex-col gap-6 max-w-2xl">
                        <div className="bg-zinc-900/50 border border-zinc-800 rounded-2xl p-6 shadow-sm">
                            <h2 className="text-xl font-bold text-white mb-2 flex items-center gap-2">
                                <Download size={20} className="text-blue-400" />
                                Export as CSV
                            </h2>
                            <p className="text-sm text-zinc-400 mb-6">
                                Download a complete historical copy of all your tracked expenses formatted as a CSV spreadsheet.
                            </p>
                            <button
                                onClick={async () => {
                                    try {
                                        toast.loading('Preparing download...', { id: 'csv-download' });
                                        const blob = await expenseService.exportCsv();
                                        const url = window.URL.createObjectURL(blob);
                                        const a = document.createElement('a');
                                        a.href = url;
                                        a.download = 'finpulse_expenses.csv';
                                        a.click();
                                        window.URL.revokeObjectURL(url);
                                        toast.success('Download complete', { id: 'csv-download' });
                                    } catch (err) {
                                        toast.error('Failed to export data', { id: 'csv-download' });
                                    }
                                }}
                                className="inline-flex items-center gap-2 bg-zinc-800 hover:bg-zinc-700 text-white px-4 py-2.5 rounded-xl text-sm font-medium transition-colors border border-zinc-700"
                            >
                                <Download size={15} />
                                Download CSV File
                            </button>
                        </div>

                        <div className="bg-red-900/10 border border-red-900/30 rounded-2xl p-6 shadow-sm">
                            <h2 className="text-xl font-bold text-red-500 flex items-center gap-2 mb-2">
                                <AlertTriangle size={20} />
                                Danger Zone
                            </h2>
                            <p className="text-sm text-zinc-400 mb-6">
                                This will instantly and permanently delete all your expenses, budgets,  and notifications. Your user profile will remain, but your financial tracking history will be blank. This cannot be undone.
                            </p>
                            <button
                                onClick={async () => {
                                    if (window.confirm('Are you absolutely certain you want to wipe all your data forever?')) {
                                        try {
                                            toast.loading('Wiping data...', { id: 'wipe' });
                                            await expenseService.wipeData();
                                            queryClient.clear();
                                            queryClient.invalidateQueries();
                                            toast.success('Your data has been permanently wiped.', { id: 'wipe', duration: 4000 });
                                        } catch (err) {
                                            toast.error('Failed to wipe data.', { id: 'wipe' });
                                        }
                                    }
                                }}
                                className="inline-flex items-center gap-2 bg-red-600/20 hover:bg-red-600/30 text-red-500 px-4 py-2.5 rounded-xl text-sm font-bold transition-colors border border-red-500/20"
                            >
                                <Database size={15} />
                                Wipe All My Data
                            </button>
                        </div>
                    </div>
                )}
            </motion.div>
        </div>
    );
}
