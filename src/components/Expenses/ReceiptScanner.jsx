import React, { useState, useRef } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { receiptService } from '../../services/financeService';
import { Button } from '../UI/Button';
import { Card, CardBody } from '../UI/Card';
import { ScanLine, UploadCloud, Loader2, FileText, Image as ImageIcon, X } from 'lucide-react';
import { toast } from 'react-hot-toast';
import ReceiptImportModal from './ReceiptImportModal';

export default function ReceiptScanner({ onImported }) {
    const queryClient = useQueryClient();
    const fileInputRef = useRef(null);
    const [file, setFile] = useState(null);
    const [previewUrl, setPreviewUrl] = useState(null);
    const [isDragging, setIsDragging] = useState(false);

    const [showModal, setShowModal] = useState(false);
    const [extractedExpense, setExtractedExpense] = useState(null);

    const scanMutation = useMutation({
        mutationFn: (uploadFile) => receiptService.scan(uploadFile),
        onSuccess: (data) => {
            setExtractedExpense(data.expense);
            setShowModal(true);
        },
        onError: (err) => {
            toast.error(err.response?.data?.message || 'Failed to scan receipt. Please try again.');
        },
    });

    const handleFileSelect = (e) => {
        const selected = e.target.files[0];
        if (!selected) return;
        handleFile(selected);
    };

    const handleFile = (selected) => {
        if (!selected.type.includes('image') && !selected.type.includes('pdf')) {
            toast.error('Please upload an image or PDF file.');
            return;
        }

        if (selected.size > 10 * 1024 * 1024) {
            toast.error('File size must be less than 10MB.');
            return;
        }

        setFile(selected);

        // Create preview if image
        if (selected.type.includes('image')) {
            const url = URL.createObjectURL(selected);
            setPreviewUrl(url);
        } else {
            setPreviewUrl(null);
        }
    };

    const handleDragOver = (e) => {
        e.preventDefault();
        setIsDragging(true);
    };

    const handleDragLeave = (e) => {
        e.preventDefault();
        setIsDragging(false);
    };

    const handleDrop = (e) => {
        e.preventDefault();
        setIsDragging(false);
        const dropped = e.dataTransfer.files[0];
        if (dropped) handleFile(dropped);
    };

    const handleClear = () => {
        setFile(null);
        if (previewUrl) URL.revokeObjectURL(previewUrl);
        setPreviewUrl(null);
        if (fileInputRef.current) fileInputRef.current.value = '';
    };

    const handleScan = () => {
        if (!file) return;
        scanMutation.mutate(file);
    };

    const handleImportDone = () => {
        setShowModal(false);
        setExtractedExpense(null);
        handleClear();
        queryClient.invalidateQueries(['expenses']);
        queryClient.invalidateQueries(['stats']);
        if (onImported) onImported();
    };

    return (
        <>
            <Card className="border-zinc-800 bg-zinc-900/30 transition-all h-full">
                <CardBody className="p-5 flex flex-col h-full">
                    <div className="flex items-center gap-3 mb-4">
                        <div className="p-2.5 rounded-xl bg-orange-500/20 text-orange-400">
                            <ScanLine size={20} />
                        </div>
                        <div className="flex-1">
                            <h3 className="text-sm font-semibold text-white">Scan Receipt</h3>
                            <p className="text-xs text-zinc-500 mt-0.5">
                                Upload a photo or PDF to extract expense data
                            </p>
                        </div>
                    </div>

                    <div className="flex-1 flex flex-col justify-center">
                        {!file ? (
                            <div
                                onDragOver={handleDragOver}
                                onDragLeave={handleDragLeave}
                                onDrop={handleDrop}
                                onClick={() => fileInputRef.current?.click()}
                                className={`w-full border-2 border-dashed rounded-xl p-6 flex flex-col items-center justify-center text-center cursor-pointer transition-all ${isDragging
                                    ? 'border-orange-500 bg-orange-500/10'
                                    : 'border-zinc-700 hover:border-orange-500/50 hover:bg-zinc-800/50'
                                    }`}
                            >
                                <input
                                    type="file"
                                    ref={fileInputRef}
                                    onChange={handleFileSelect}
                                    className="hidden"
                                    accept="image/*,application/pdf"
                                />
                                <div className="p-3 bg-zinc-800 rounded-full mb-3 text-zinc-400">
                                    <UploadCloud size={24} />
                                </div>
                                <p className="text-sm font-medium text-white mb-1">Click to upload or drag and drop</p>
                                <p className="text-xs text-zinc-500">Image (JPG, PNG) or PDF up to 10MB</p>
                            </div>
                        ) : (
                            <div className="w-full border border-zinc-700 rounded-xl p-3 bg-zinc-800/50 flex flex-col gap-3">
                                <div className="flex items-start gap-3 relative">
                                    {previewUrl ? (
                                        <div className="w-16 h-16 rounded-lg overflow-hidden shrink-0 border border-zinc-700 bg-black">
                                            <img src={previewUrl} alt="Preview" className="w-full h-full object-cover" />
                                        </div>
                                    ) : (
                                        <div className="w-16 h-16 rounded-lg shrink-0 border border-zinc-700 bg-zinc-900 flex items-center justify-center text-orange-400">
                                            <FileText size={24} />
                                        </div>
                                    )}
                                    <div className="flex-1 min-w-0 py-1">
                                        <p className="text-sm font-medium text-white truncate break-all pr-6">{file.name}</p>
                                        <p className="text-xs text-zinc-400 mt-1">{(file.size / 1024 / 1024).toFixed(2)} MB</p>
                                    </div>
                                    <button
                                        onClick={handleClear}
                                        className="absolute top-1 right-0 p-1 text-zinc-400 hover:text-white bg-zinc-800 rounded-md"
                                        disabled={scanMutation.isPending}
                                    >
                                        <X size={14} />
                                    </button>
                                </div>
                                <Button
                                    className="w-full"
                                    onClick={handleScan}
                                    isLoading={scanMutation.isPending}
                                >
                                    <ScanLine size={16} className="mr-2" />
                                    Scan & Extract Data
                                </Button>
                            </div>
                        )}
                    </div>
                </CardBody>
            </Card>

            {/* Import Modal */}
            {showModal && extractedExpense && (
                <ReceiptImportModal
                    isOpen={showModal}
                    onClose={() => setShowModal(false)}
                    expense={extractedExpense}
                    onImportDone={handleImportDone}
                />
            )}
        </>
    );
}
