import React, { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { gmailService, forwardingService } from '../../services/financeService';
import { Button } from '../UI/Button';
import { Card, CardBody } from '../UI/Card';
import {
    Mail, CheckCircle, Unlink, Loader2, AlertCircle,
    ShieldCheck, Copy, Check, Zap, Settings2
} from 'lucide-react';
import { toast } from 'react-hot-toast';

export default function GmailConnect({ onImported }) {
    const queryClient = useQueryClient();
    const [copied, setCopied] = useState(false);
    const [isConnecting, setIsConnecting] = useState(false);

    // Handle OAuth callback result
    useEffect(() => {
        const params = new URLSearchParams(window.location.search);
        if (params.get('gmail') === 'connected') {
            toast.success('Gmail connected! Auto-forwarding filter is being set up...');
            queryClient.invalidateQueries({ queryKey: ['gmail-forwarding-status'] });
            queryClient.invalidateQueries({ queryKey: ['forwarding-address'] });
            window.history.replaceState({}, '', window.location.pathname);
        } else if (params.get('gmail') === 'error') {
            toast.error('Failed to connect Gmail. Please try again.');
            window.history.replaceState({}, '', window.location.pathname);
        }
    }, [queryClient]);

    // Get user's unique forwarding address (auto-generated on first fetch)
    const { data: addressData, isLoading: addressLoading } = useQuery({
        queryKey: ['forwarding-address'],
        queryFn: forwardingService.getAddress,
        refetchOnWindowFocus: false,
    });

    // Get connection/forwarding status
    const { data: status, isLoading: statusLoading } = useQuery({
        queryKey: ['gmail-forwarding-status'],
        queryFn: gmailService.getStatus,
        refetchOnWindowFocus: true,
    });

    // Disconnect mutation
    const disconnectMutation = useMutation({
        mutationFn: gmailService.disconnect,
        onSuccess: () => {
            toast.success('Auto-forwarding disconnected.');
            queryClient.invalidateQueries({ queryKey: ['gmail-forwarding-status'] });
            queryClient.invalidateQueries({ queryKey: ['forwarding-address'] });
        },
    });

    const handleSetupAutoForward = async () => {
        try {
            setIsConnecting(true);
            const { authUrl } = await forwardingService.setupAutoForward();
            window.location.href = authUrl;
        } catch (error) {
            toast.error('Failed to start setup. Please try again.');
            setIsConnecting(false);
        }
    };

    const handleCopy = () => {
        if (addressData?.address) {
            navigator.clipboard.writeText(addressData.address);
            setCopied(true);
            toast.success('Forwarding address copied!');
            setTimeout(() => setCopied(false), 2000);
        }
    };

    const isConnected = status?.connected;
    const isLoading = addressLoading || statusLoading;

    return (
        <Card className={`${isConnected ? 'bg-blue-900/10 border-blue-500/20' : 'border-zinc-800 bg-zinc-900/30'} transition-all`}>
            <CardBody className="p-5">
                {/* Header Row */}
                <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
                    <div className="flex items-center gap-3 flex-1 min-w-0">
                        <div className={`p-2.5 rounded-xl shrink-0 ${isConnected ? 'bg-blue-500/20 text-blue-400' : 'bg-zinc-800 text-zinc-400'}`}>
                            <Mail size={20} />
                        </div>
                        <div className="min-w-0">
                            <div className="flex items-center gap-2">
                                <p className="text-sm font-semibold text-white">Auto-Import from Email</p>
                                {isConnected && (
                                    <span className="flex items-center gap-1 text-[10px] bg-blue-500/15 text-blue-400 px-2 py-0.5 rounded-full font-medium">
                                        <CheckCircle size={10} />
                                        Active
                                    </span>
                                )}
                            </div>
                            <p className="text-xs text-zinc-500 mt-0.5">
                                {isConnected
                                    ? `Forwarding active · Expenses auto-saved from ${status?.emailAddress}`
                                    : 'Forward purchase emails automatically — no inbox access needed'}
                            </p>
                        </div>
                    </div>

                    {/* Actions */}
                    <div className="flex items-center gap-2 shrink-0">
                        {isLoading ? (
                            <Loader2 size={18} className="text-zinc-500 animate-spin" />
                        ) : isConnected ? (
                            <button
                                onClick={() => disconnectMutation.mutate()}
                                disabled={disconnectMutation.isPending}
                                className="p-2 rounded-lg text-zinc-500 hover:text-red-400 hover:bg-zinc-800 transition-colors"
                                title="Disconnect auto-forwarding"
                            >
                                <Unlink size={14} />
                            </button>
                        ) : (
                            <Button
                                size="sm"
                                onClick={handleSetupAutoForward}
                                isLoading={isConnecting}
                                className="gap-1.5 text-xs bg-blue-600 hover:bg-blue-500"
                            >
                                <Zap size={13} />
                                Setup Auto-Forward
                            </Button>
                        )}
                    </div>
                </div>

                {/* Forwarding Address Box (always visible) */}
                {addressData?.address && (
                    <div className="mt-4 pt-4 border-t border-zinc-800">
                        <p className="text-[11px] font-medium text-zinc-400 mb-2 flex items-center gap-1.5">
                            <Mail size={11} className="text-blue-400" />
                            Your unique forwarding address
                        </p>
                        <div className="flex items-center gap-2">
                            <div className="flex-1 bg-zinc-800/60 border border-zinc-700/50 rounded-lg px-3 py-2 min-w-0">
                                <p className="text-xs font-mono text-blue-300 truncate">{addressData.address}</p>
                            </div>
                            <button
                                onClick={handleCopy}
                                className="p-2 text-zinc-400 hover:text-white hover:bg-zinc-800 rounded-lg transition-colors shrink-0"
                                title="Copy forwarding address"
                            >
                                {copied ? <Check size={14} className="text-emerald-400" /> : <Copy size={14} />}
                            </button>
                        </div>
                    </div>
                )}

                {/* Status / how-it-works section */}
                <div className="mt-3">
                    {isConnected ? (
                        <div className="flex items-start gap-2.5 bg-blue-500/5 border border-blue-500/15 rounded-xl p-3 text-xs text-zinc-400">
                            <CheckCircle size={14} className="text-blue-400 shrink-0 mt-0.5" />
                            <div>
                                <p className="font-medium text-blue-400 mb-0.5">Auto-forwarding is active</p>
                                <p>New purchase emails are automatically forwarded and saved as expenses. No manual steps needed.</p>
                                <p className="mt-2 text-zinc-500 font-medium pb-0.5">Note on past expenses:</p>
                                <p className="text-zinc-500">Because we enforce <strong>Zero Inbox Access</strong> to protect your privacy, we cannot scan your past inbox history. To add past email receipts, please use the <strong>Scan Receipt</strong> tool below.</p>
                            </div>
                        </div>
                    ) : (
                        <div className="flex items-start gap-3 bg-zinc-800/40 p-3 rounded-xl border border-emerald-500/10">
                            <ShieldCheck size={16} className="text-emerald-400 shrink-0 mt-0.5" />
                            <div className="text-xs text-zinc-400">
                                <p className="font-medium text-emerald-400/90 mb-1.5 flex items-center gap-1.5">
                                    Privacy-First Design
                                    <span className="bg-emerald-500/10 text-emerald-400 text-[10px] px-1.5 py-0.5 rounded uppercase tracking-wider font-bold">No Inbox Access</span>
                                </p>
                                <ul className="space-y-1 list-disc pl-3.5">
                                    <li>Click <strong>Setup Auto-Forward</strong> — one-time approval only</li>
                                    <li>We create a Gmail filter that forwards purchase emails automatically</li>
                                    <li>We <strong>cannot</strong> read your inbox — only manage filter settings</li>
                                    <li>All future purchases appear in your dashboard automatically</li>
                                </ul>
                                <p className="mt-2 text-amber-400/80 flex gap-1.5 items-start bg-amber-500/5 p-2 rounded-lg border border-amber-500/10">
                                    <AlertCircle size={12} className="shrink-0 mt-0.5" />
                                    <span><strong>Beta Notice:</strong> You may see a &quot;Google hasn&apos;t verified this app&quot; warning during setup — this is normal.</span>
                                </p>
                            </div>
                        </div>
                    )}
                </div>
            </CardBody>
        </Card>
    );
}
