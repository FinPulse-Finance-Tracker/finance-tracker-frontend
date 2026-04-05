import { useNavigate } from 'react-router-dom';
import { useEffect, useState } from 'react';

export default function Landing() {
    const navigate = useNavigate();
    const [isVisible, setIsVisible] = useState(false);

    useEffect(() => {
        setIsVisible(true);
    }, []);

    return (
        <div className="min-h-screen flex items-center justify-center bg-black overflow-hidden px-4">
            <div className="text-center w-full max-w-xs">
                {/* Logo and App Name with fade in animation */}
                    <div className="text-center">
                        <img src="/logo.jpg" alt="FinPulse Logo" className="w-32 h-32 sm:w-40 sm:h-40 mx-auto rounded-[2rem] shadow-2xl shadow-purple-500/30 object-contain mb-4" />
                        <h1 className="text-5xl sm:text-6xl md:text-7xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-purple-600 mb-2">
                            FinPulse
                        </h1>
                        <h2 className="text-xl sm:text-2xl font-medium text-purple-200/80 mb-2">
                            Automated Finance Tracker
                        </h2>
                        <p className="text-sm text-zinc-400 mt-2 px-2">
                            Connect your Gmail to automatically track receipts, set secure budgets, and take control of your financial health without manual data entry.
                        </p>
                    </div>

                {/* Auth Buttons */}
                <div className="flex flex-col gap-3 w-full mx-auto">
                    <button
                        onClick={() => navigate('/sign-in')}
                        className={`w-full px-6 py-2.5 bg-gradient-to-r from-purple-600 to-purple-700 text-white text-base font-medium rounded-lg transition-opacity duration-300 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'
                            }`}
                        style={{ transitionDelay: '300ms' }}
                    >
                        Sign In
                    </button>

                    <button
                        onClick={() => navigate('/sign-up')}
                        className={`w-full px-6 py-2.5 bg-transparent text-purple-400 text-base font-medium rounded-lg border-2 border-purple-600 transition-opacity duration-300 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'
                            }`}
                        style={{ transitionDelay: '400ms' }}
                    >
                        Sign Up
                    </button>
                </div>

                {/* Privacy Policy Link for Google Verification */}
                <div 
                    className={`mt-10 mb-4 transition-opacity duration-1000 ${isVisible ? 'opacity-100' : 'opacity-0'}`}
                    style={{ transitionDelay: '600ms' }}
                >
                    <a href="/privacy" className="text-xs text-zinc-500 hover:text-purple-400 transition-colors underline underline-offset-2">
                        Privacy Policy & Terms of Service
                    </a>
                </div>

                {/* Animated gradient background blur */}
                <div className="absolute -z-10 top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-64 h-64 sm:w-96 sm:h-96 bg-purple-600/20 rounded-full blur-3xl animate-pulse"></div>
            </div>
        </div>
    );
}
