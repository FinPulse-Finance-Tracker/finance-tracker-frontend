import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Mail, ArrowRight, X } from 'lucide-react';
import { Link } from 'react-router-dom';

export default function EmailImportBanner({ count, total, isDismissed, onDismiss }) {
    if (!count || count === 0 || isDismissed) return null;

    return (
        <AnimatePresence>
            <motion.div
                initial={{ opacity: 0, y: -20, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95, filter: 'blur(10px)' }}
                transition={{ type: "spring", stiffness: 300, damping: 25 }}
                className="relative overflow-hidden bg-blue-900/10 border border-blue-500/20 hover:border-blue-500/40 rounded-3xl p-4 sm:p-5 shadow-[0_0_30px_rgba(59,130,246,0.1)] transition-colors group mb-8"
            >
                {/* Background glow */}
                <div className="absolute top-0 right-0 w-64 h-64 bg-blue-500/10 rounded-full blur-[60px] pointer-events-none group-hover:bg-blue-500/15 transition-all duration-700" />
                
                <div className="relative z-10 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                    <div className="flex items-center gap-4">
                        <div className="p-3 bg-blue-500/20 text-blue-400 rounded-2xl shrink-0 group-hover:scale-110 group-hover:rotate-3 transition-transform duration-500">
                            <Mail size={24} strokeWidth={2} />
                        </div>
                        <div>
                            <h3 className="text-white font-bold text-lg flex items-center gap-2">
                                New Auto-Imports Ready
                                <span className="bg-blue-500/20 text-blue-400 text-[10px] px-2 py-0.5 rounded-full font-bold uppercase tracking-wider">
                                    Since Last Login
                                </span>
                            </h3>
                            <p className="text-blue-200/70 text-sm font-medium mt-0.5">
                                We automatically tracked <strong className="text-blue-300">{count} new expense{count > 1 ? 's' : ''}</strong> from your inbox, totaling <strong className="text-blue-300">LKR {Number(total).toLocaleString()}</strong>.
                            </p>
                        </div>
                    </div>
                    
                    <div className="flex items-center gap-3 self-end sm:self-auto w-full sm:w-auto mt-2 sm:mt-0">
                        <Link 
                            to="/expenses" 
                            className="flex-1 sm:flex-none flex justify-center items-center gap-1.5 px-4 py-2.5 bg-blue-500 hover:bg-blue-400 text-white text-sm font-bold rounded-xl transition-all shadow-lg hover:shadow-blue-500/25 active:scale-95"
                        >
                            View Book
                            <ArrowRight size={16} />
                        </Link>
                        <button
                            onClick={onDismiss}
                            className="p-2.5 text-zinc-400 hover:text-white hover:bg-zinc-800/80 rounded-xl transition-all active:scale-95 border border-transparent hover:border-zinc-700/50"
                            title="Dismiss"
                        >
                            <X size={18} strokeWidth={2.5} />
                        </button>
                    </div>
                </div>
            </motion.div>
        </AnimatePresence>
    );
}
