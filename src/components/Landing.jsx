import { useNavigate } from 'react-router-dom';
import { useEffect, useState } from 'react';

export default function Landing() {
    const navigate = useNavigate();
    const [isVisible, setIsVisible] = useState(false);

    useEffect(() => {
        setIsVisible(true);
    }, []);

    return (
        <div className="min-h-screen flex flex-col items-center justify-center bg-black overflow-hidden px-4 py-12">
            <div className={`text-center w-full max-w-lg transition-all duration-700 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-6'}`}>

                {/* Logo and App Name */}
                <div className="text-center mb-8">
                    <img src="/logo.jpg" alt="FinPulse Finance Tracker Logo" className="w-28 h-28 sm:w-36 sm:h-36 mx-auto rounded-[2rem] shadow-2xl shadow-purple-500/30 object-contain mb-5" />
                    <h1 className="text-5xl sm:text-6xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-purple-600 mb-1">
                        FinPulse
                    </h1>
                    <p className="text-sm font-medium text-purple-300/60 tracking-widest uppercase mb-3">
                        Finance Tracker
                    </p>
                    <p className="text-base text-zinc-400 mb-6 leading-relaxed max-w-sm mx-auto">
                        Your privacy-first, automated personal finance manager.
                    </p>
                </div>


                {/* Auth Buttons */}
                <div className="flex flex-col gap-3 w-full max-w-xs mx-auto mb-8">
                    <button
                        id="sign-in-btn"
                        onClick={() => navigate('/sign-in')}
                        className="w-full px-6 py-3 bg-gradient-to-r from-purple-600 to-purple-700 text-white text-base font-semibold rounded-xl shadow-lg shadow-purple-700/30 hover:from-purple-500 hover:to-purple-600 transition-all duration-200"
                    >
                        Sign In
                    </button>

                    <button
                        id="sign-up-btn"
                        onClick={() => navigate('/sign-up')}
                        className="w-full px-6 py-3 bg-transparent text-purple-400 text-base font-semibold rounded-xl border-2 border-purple-600 hover:bg-purple-600/10 transition-all duration-200"
                    >
                        Sign Up
                    </button>
                </div>

                {/* Privacy Policy Link — prominent & discoverable */}
                <div className="border-t border-zinc-800 pt-6">
                    <p className="text-xs text-zinc-500 mb-2">FinPulse — Finance Tracker · finpulse.nethmihapauarachchi.com</p>
                    <a
                        href="/privacy"
                        className="inline-block text-sm text-purple-400 hover:text-purple-300 underline underline-offset-4 font-medium transition-colors"
                    >
                        Privacy Policy &amp; Terms of Service
                    </a>
                </div>
            </div>

            {/* Animated gradient background blur */}
            <div className="absolute -z-10 top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-64 h-64 sm:w-96 sm:h-96 bg-purple-600/20 rounded-full blur-3xl animate-pulse"></div>
        </div>
    );
}
