import React, { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { gmailService } from '../../services/financeService';
import { Button } from '../UI/Button';
import { Card, CardBody } from '../UI/Card';
import { Mail, CheckCircle, RefreshCw, Unlink, Loader2, AlertCircle, ShieldCheck } from 'lucide-react';
import { toast } from 'react-hot-toast';
import { useDateContext } from '../../context/DateContext';
import GmailImportModal from './GmailImportModal';

export default function GmailConnect({ onImported }) {
    const queryClient = useQueryClient();
    const { getStartDate, getEndDate } = useDateContext();
    const [showImportModal, setShowImportModal] = useState(false);
    const [extractedExpenses, setExtractedExpenses] = useState([]);

    // Check URL params for callback result
    useEffect(() => {
        const params = new URLSearchParams(window.location.search);
        if (params.get('gmail') === 'connected') {
            toast.success('Gmail connected successfully!');
            queryClient.invalidateQueries(['gmail-status']);
            // Clean URL
            window.history.replaceState({}, '', window.location.pathname);
        } else if (params.get('gmail') === 'error') {
            toast.error('Failed to connect Gmail. Please try again.');
            window.history.replaceState({}, '', window.location.pathname);
        }
    }, [queryClient]);

    // Get connection status
    const { data: status, isLoading: statusLoading } = useQuery({
        queryKey: ['gmail-status'],
        queryFn: gmailService.getStatus,
        refetchOnWindowFocus: true,
    });

    const syncMutation = useMutation({
        mutationFn: (dateRange) => gmailService.sync(dateRange),
        onSuccess: (data) => {
            if (data.count === 0) {
                toast('No new bill emails found for this month.', { icon: '📭' });
            } else {
                setExtractedExpenses(data.expenses);
                setShowImportModal(true);
            }
        },
        onError: (error) => {
            const errorMessage = error.response?.data?.message || 'Failed to sync emails. Please reconnect Gmail.';
            toast.error(errorMessage);
        },
    });

    // Disconnect mutation
    const disconnectMutation = useMutation({
        mutationFn: gmailService.disconnect,
        onSuccess: () => {
            toast.success('Gmail disconnected.');
            queryClient.invalidateQueries(['gmail-status']);
        },
    });

    const [isConnecting, setIsConnecting] = useState(false);

    const handleConnect = async () => {
        try {
            setIsConnecting(true);
            const { authUrl } = await gmailService.getConnectUrl();
            window.location.href = authUrl;
        } catch (error) {
            const errorMessage = error.response?.data?.message || 'Failed to start Gmail connection. Please try again.';
            toast.error(errorMessage);
            setIsConnecting(false);
        }
    };

    const handleImportDone = () => {
        setShowImportModal(false);
        setExtractedExpenses([]);
        queryClient.invalidateQueries(['expenses']);
        queryClient.invalidateQueries(['stats']);
        if (onImported) onImported();
    };

    const isConnected = status?.connected;

    return (
        <>
            <Card className={`${isConnected ? 'bg-blue-900/10 border-blue-500/20' : 'border-zinc-800 bg-zinc-900/30'} transition-all`}>
                <CardBody className="p-5">
                    <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
                        {/* Icon & Info */}
                        <div className="flex items-center gap-3 flex-1 min-w-0">
                            <div className={`p-2.5 rounded-xl shrink-0 ${isConnected ? 'bg-blue-500/20 text-blue-400' : 'bg-zinc-800 text-zinc-400'}`}>
                                <Mail size={20} />
                            </div>
                            <div className="min-w-0">
                                <div className="flex items-center gap-2">
                                    <p className="text-sm font-semibold text-white">Auto-Import from Gmail</p>
                                    {isConnected && (
                                        <span className="flex items-center gap-1 text-[10px] bg-blue-500/15 text-blue-400 px-2 py-0.5 rounded-full font-medium">
                                            <CheckCircle size={10} />
                                            Connected
                                        </span>
                                    )}
                                </div>
                                <p className="text-xs text-zinc-500 mt-0.5 truncate">
                                    {isConnected
                                        ? `Syncing: ${status.emailAddress}${status.lastSynced ? ` · Last sync: ${new Date(status.lastSynced).toLocaleDateString()}` : ''}`
                                        : 'Connect Gmail to auto-import expenses from bill & receipt emails'}
                                </p>
                            </div>
                        </div>

                        {/* Actions */}
                        <div className="flex items-center gap-2 shrink-0">
                            {statusLoading ? (
                                <Loader2 size={18} className="text-zinc-500 animate-spin" />
                            ) : isConnected ? (
                                <>
                                    <Button
                                        variant="secondary"
                                        size="sm"
                                        onClick={() => syncMutation.mutate({ startDate: getStartDate().toISOString(), endDate: getEndDate().toISOString() })}
                                        isLoading={syncMutation.isPending}
                                        className="gap-1.5 text-xs"
                                    >
                                        <RefreshCw size={13} />
                                        Scan Emails
                                    </Button>
                                    <button
                                        onClick={() => disconnectMutation.mutate()}
                                        disabled={disconnectMutation.isPending}
                                        className="p-2 rounded-lg text-zinc-500 hover:text-red-400 hover:bg-zinc-800 transition-colors"
                                        title="Disconnect Gmail"
                                    >
                                        <Unlink size={14} />
                                    </button>
                                </>
                            ) : (
                                <Button
                                    size="sm"
                                    onClick={handleConnect}
                                    isLoading={isConnecting}
                                    className="gap-1.5 text-xs bg-blue-600 hover:bg-blue-500"
                                >
                                    <Mail size={13} />
                                    Connect Gmail
                                </Button>
                            )}
                        </div>
                    </div>

                    {/* Syncing indicator */}
                    {syncMutation.isPending && (
                        <div className="mt-3 pt-3 border-t border-zinc-800 flex items-center gap-2 text-xs text-zinc-400">
                            <Loader2 size={12} className="animate-spin text-blue-400" />
                            Scanning your Gmail for bill and receipt emails...
                        </div>
                    )}

                    {/* Safe Mode Assurance UI for non-connected state */}
                    {!isConnected && (
                        <div className="mt-4 pt-4 border-t border-zinc-800">
                            <div className="flex items-start gap-3 bg-zinc-800/40 p-3 rounded-xl border border-emerald-500/10 hover:border-emerald-500/30 transition-colors">
                                <ShieldCheck size={18} className="text-emerald-400 shrink-0 mt-0.5" />
                                <div className="text-xs text-zinc-400">
                                    <p className="font-medium text-emerald-400/90 mb-1 flex items-center gap-1.5">
                                        Safe Mode Enabled
                                        <span className="bg-emerald-500/10 text-emerald-400 text-[10px] px-1.5 py-0.5 rounded uppercase tracking-wider font-bold">Privacy First</span>
                                    </p>
                                    <ul className="list-disc pl-3.5 space-y-1 mt-1.5">
                                        <li>We only scan for receipts, bills, and order confirmations.</li>
                                        <li>We <strong>cannot</strong> send emails or read your personal conversations.</li>
                                        <li>You can disconnect and delete your synced data at any time.</li>
                                        <li className="text-amber-400/80 mt-2.5 list-none text-[11px] flex gap-1.5 items-start -ml-3.5 bg-amber-500/5 p-2 rounded-lg border border-amber-500/10">
                                            <AlertCircle size={14} className="shrink-0" />
                                            <span><strong>Beta Notice:</strong> You may see a "Google hasn't verified this app" warning. This is perfectly normal during our testing phase.</span>
                                        </li>
                                    </ul>
                                </div>
                            </div>
                        </div>
                    )}
                </CardBody>
            </Card>

            {/* Import Modal */}
            {showImportModal && (
                <GmailImportModal
                    isOpen={showImportModal}
                    onClose={() => setShowImportModal(false)}
                    expenses={extractedExpenses}
                    onImportDone={handleImportDone}
                />
            )}
        </>
    );
}
