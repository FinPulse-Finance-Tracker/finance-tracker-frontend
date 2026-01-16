import { SignIn as ClerkSignIn } from '@clerk/clerk-react';
import { useEffect, useState } from 'react';

export default function SignIn() {
    const [isVisible, setIsVisible] = useState(false);

    useEffect(() => {
        setIsVisible(true);
    }, []);

    return (
        <div className="min-h-screen flex items-center justify-center px-4 py-12 bg-black">
            <div className="max-w-md w-full">
                {/* Header with fade in */}
                <div
                    className={`text-center mb-8 transition-all duration-700 ${isVisible ? 'opacity-100 scale-100' : 'opacity-0 scale-95'
                        }`}
                >
                    <h1 className="text-5xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-pink-400 mb-2">
                        FinPulse
                    </h1>
                    <p className="text-gray-400 text-lg">
                        Welcome back! Sign in to continue
                    </p>
                </div>

                {/* Clerk Sign In Component with slide up */}
                <div
                    className={`bg-purple-900/10 border border-purple-500/20 rounded-2xl p-8 transition-all duration-700 hover:border-purple-500/40 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
                        }`}
                    style={{ transitionDelay: '200ms' }}
                >
                    <ClerkSignIn
                        appearance={{
                            elements: {
                                rootBox: "w-full",
                                card: "bg-transparent shadow-none",
                                headerTitle: "hidden",
                                headerSubtitle: "hidden",
                                socialButtonsBlockButton: "bg-white/10 border-purple-500/30 hover:bg-white/20 text-white transition-all duration-200 hover:scale-105",
                                formButtonPrimary: "bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 transition-all duration-200 hover:scale-105",
                                formFieldInput: "bg-white/10 border-purple-500/30 text-white placeholder:text-gray-400 transition-all duration-200 focus:border-purple-500/60",
                                footerActionLink: "text-purple-400 hover:text-purple-300 transition-colors duration-200",
                                identityPreviewText: "text-white",
                                formFieldLabel: "text-gray-300",
                                dividerLine: "bg-purple-500/30",
                                dividerText: "text-gray-400",
                            },
                        }}
                        routing="path"
                        path="/sign-in"
                        signUpUrl="/sign-up"
                    />
                </div>

                {/* Footer with fade in */}
                <p
                    className={`text-center text-gray-400 mt-6 text-sm transition-all duration-700 ${isVisible ? 'opacity-100' : 'opacity-0'
                        }`}
                    style={{ transitionDelay: '400ms' }}
                >
                    Secure authentication powered by Clerk
                </p>

                {/* Animated background */}
                <div className="fixed -z-10 top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-purple-600/20 rounded-full blur-3xl animate-pulse"></div>
            </div>
        </div>
    );
}
