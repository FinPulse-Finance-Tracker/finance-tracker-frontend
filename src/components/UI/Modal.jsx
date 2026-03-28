import React, { useEffect } from 'react';
import { X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '../../utils/cn';
import { Button } from './Button';

export const Modal = ({ isOpen, onClose, title, children, className }) => {
    useEffect(() => {
        const handleEsc = (e) => {
            if (e.key === 'Escape') onClose();
        };
        if (isOpen) {
            document.body.style.overflow = 'hidden';
            window.addEventListener('keydown', handleEsc);
        }
        return () => {
            document.body.style.overflow = 'unset';
            window.removeEventListener('keydown', handleEsc);
        };
    }, [isOpen, onClose]);

    return (
        <AnimatePresence>
            {isOpen && (
                <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center sm:p-6">
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={onClose}
                        className="absolute inset-0 bg-black/80 backdrop-blur-sm"
                    />
                    <motion.div
                        initial={{ opacity: 0, y: 40 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: 40 }}
                        className={cn(
                            'relative w-full sm:max-w-lg bg-zinc-900 border border-zinc-800 rounded-t-2xl sm:rounded-2xl shadow-2xl overflow-hidden',
                            className
                        )}
                    >
                        <div className="flex items-center justify-between p-5 sm:p-6 border-b border-zinc-800">
                            <h3 className="text-lg sm:text-xl font-bold text-white">{title}</h3>
                            <Button
                                variant="ghost"
                                size="sm"
                                onClick={onClose}
                                className="rounded-full w-8 h-8 p-0"
                            >
                                <X size={18} />
                            </Button>
                        </div>
                        <div className="p-5 sm:p-6 max-h-[80vh] overflow-y-auto">
                            {children}
                        </div>
                    </motion.div>
                </div>
            )}
        </AnimatePresence>
    );
};
