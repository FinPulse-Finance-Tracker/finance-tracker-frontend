import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { MessageSquarePlus, X, Star, Loader2, Send } from 'lucide-react';
import { systemService } from '../../services/financeService';
import { toast } from 'react-hot-toast';

export default function FeedbackWidget() {
    const [isOpen, setIsOpen] = useState(false);
    const [rating, setRating] = useState(0);
    const [hoveredRating, setHoveredRating] = useState(0);
    const [message, setMessage] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!message.trim()) return;

        setIsSubmitting(true);
        try {
            await systemService.submitFeedback({ rating, message });
            toast.success('Thanks for your feedback! We truly appreciate it.');
            setIsOpen(false);
            setMessage('');
            setRating(0);
        } catch (error) {
            toast.error('Failed to submit feedback. Please try again.');
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="fixed bottom-24 right-4 md:bottom-6 md:right-6 z-50 flex flex-col items-end">
            <AnimatePresence>
                {isOpen && (
                    <motion.div
                        initial={{ opacity: 0, scale: 0.9, y: 20 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.9, y: 20 }}
                        transition={{ type: "spring", stiffness: 300, damping: 25 }}
                        className="mb-4 w-[340px] bg-zinc-900 border border-zinc-800 rounded-2xl shadow-2xl overflow-hidden"
                    >
                        {/* Header */}
                        <div className="bg-gradient-to-r from-purple-600 to-purple-800 px-5 py-4 flex justify-between items-center">
                            <div>
                                <h3 className="font-bold text-white text-lg">Beta Feedback</h3>
                                <p className="text-purple-200 text-xs">Help us improve FinPulse</p>
                            </div>
                            <button 
                                onClick={() => setIsOpen(false)}
                                className="text-white/70 hover:text-white bg-black/10 hover:bg-black/20 p-1.5 rounded-full transition-colors"
                            >
                                <X size={16} />
                            </button>
                        </div>

                        {/* Form */}
                        <form onSubmit={handleSubmit} className="p-5 flex flex-col gap-4">
                            {/* Star Rating */}
                            <div>
                                <label className="block text-sm font-medium text-zinc-300 mb-2">How are we doing?</label>
                                <div className="flex gap-1 justify-center">
                                    {[1, 2, 3, 4, 5].map((star) => (
                                        <button
                                            key={star}
                                            type="button"
                                            onClick={() => setRating(star)}
                                            onMouseEnter={() => setHoveredRating(star)}
                                            onMouseLeave={() => setHoveredRating(0)}
                                            className="focus:outline-none transition-transform hover:scale-110 p-1"
                                        >
                                            <Star 
                                                size={28} 
                                                className={`transition-colors duration-200 ${(hoveredRating || rating) >= star ? 'fill-yellow-400 text-yellow-400' : 'text-zinc-600'}`} 
                                            />
                                        </button>
                                    ))}
                                </div>
                            </div>

                            {/* Text Area */}
                            <div>
                                <label className="block text-sm font-medium text-zinc-300 mb-2">Your thoughts</label>
                                <textarea
                                    required
                                    rows={4}
                                    placeholder="Found a bug? Have a suggestion? Let us know!"
                                    value={message}
                                    onChange={(e) => setMessage(e.target.value)}
                                    className="w-full bg-zinc-950/50 border border-zinc-800 rounded-xl px-4 py-3 text-sm text-white placeholder-zinc-500 focus:outline-none focus:border-purple-500/50 focus:ring-1 focus:ring-purple-500/50 resize-none transition-all"
                                />
                            </div>

                            {/* Submit Button */}
                            <button
                                type="submit"
                                disabled={isSubmitting || !message.trim()}
                                className="w-full flex items-center justify-center gap-2 bg-white text-black font-semibold py-3 px-4 rounded-xl hover:bg-zinc-200 transition-colors disabled:opacity-50 disabled:cursor-not-allowed mt-2"
                            >
                                {isSubmitting ? (
                                    <Loader2 size={18} className="animate-spin text-black" />
                                ) : (
                                    <>
                                        <Send size={16} />
                                        Send Feedback
                                    </>
                                )}
                            </button>
                        </form>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Floating Trigger Button */}
            <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setIsOpen(!isOpen)}
                className="bg-purple-600 text-white p-4 rounded-full shadow-lg shadow-purple-900/20 hover:bg-purple-500 transition-colors flex items-center justify-center border border-purple-500/50 group"
            >
                <MessageSquarePlus size={24} className="group-hover:-rotate-6 transition-transform" />
            </motion.button>
        </div>
    );
}
