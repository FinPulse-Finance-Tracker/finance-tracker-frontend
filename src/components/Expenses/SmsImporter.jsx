import React, { useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { smsService } from '../../services/financeService';
import { Button } from '../UI/Button';
import { Card, CardBody } from '../UI/Card';
import { MessageSquarePlus, Loader2 } from 'lucide-react';
import { toast } from 'react-hot-toast';
import SmsImportModal from './SmsImportModal';

export default function SmsImporter({ onImported }) {
    const queryClient = useQueryClient();
    const [text, setText] = useState('');
    const [showModal, setShowModal] = useState(false);
    const [extractedExpenses, setExtractedExpenses] = useState([]);

    const parseMutation = useMutation({
        mutationFn: (smsText) => smsService.parse(smsText),
        onSuccess: (data) => {
            if (data.count === 0) {
                toast.error('Could not detect any expenses in the provided text.');
            } else {
                setExtractedExpenses(data.expenses);
                setShowModal(true);
                setText(''); // Clear the input
            }
        },
        onError: () => {
            toast.error('Failed to parse SMS. Please try again.');
        },
    });

    const handleParse = () => {
        if (!text.trim()) {
            toast.error('Please paste at least one SMS message.');
            return;
        }
        parseMutation.mutate(text);
    };

    const handleImportDone = () => {
        setShowModal(false);
        setExtractedExpenses([]);
        queryClient.invalidateQueries(['expenses']);
        queryClient.invalidateQueries(['stats']);
        if (onImported) onImported();
    };

    return (
        <>
            <Card className="border-zinc-800 bg-zinc-900/30 transition-all">
                <CardBody className="p-5">
                    <div className="flex flex-col sm:flex-row items-start gap-4">
                        {/* Icon & Info */}
                        <div className="flex items-center gap-3 shrink-0">
                            <div className="p-2.5 rounded-xl bg-purple-500/20 text-purple-400">
                                <MessageSquarePlus size={20} />
                            </div>
                            <div>
                                <h3 className="text-sm font-semibold text-white">Paste Bank SMS</h3>
                                <p className="text-xs text-zinc-500 mt-0.5">
                                    Extract expenses from bank notification messages
                                </p>
                            </div>
                        </div>

                        {/* Textarea & Action */}
                        <div className="flex-1 w-full space-y-3">
                            <textarea
                                value={text}
                                onChange={(e) => setText(e.target.value)}
                                placeholder="Paste one or multiple bank SMS messages here..."
                                className="w-full h-20 bg-zinc-900 border border-zinc-800 rounded-xl p-3 text-sm text-white placeholder:text-zinc-600 focus:outline-none focus:ring-1 focus:ring-purple-500 focus:border-purple-500 resize-none transition-all scrollbar-thin scrollbar-thumb-zinc-700"
                            />
                            <div className="flex justify-end">
                                <Button
                                    size="sm"
                                    onClick={handleParse}
                                    isLoading={parseMutation.isPending}
                                    disabled={!text.trim() || parseMutation.isPending}
                                    className="gap-2 text-xs"
                                >
                                    {parseMutation.isPending ? (
                                        <Loader2 size={14} className="animate-spin" />
                                    ) : (
                                        <MessageSquarePlus size={14} />
                                    )}
                                    Extract Expenses
                                </Button>
                            </div>
                        </div>
                    </div>
                </CardBody>
            </Card>

            {/* Import Modal */}
            {showModal && (
                <SmsImportModal
                    isOpen={showModal}
                    onClose={() => setShowModal(false)}
                    expenses={extractedExpenses}
                    onImportDone={handleImportDone}
                />
            )}
        </>
    );
}
