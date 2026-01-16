import { UserButton, useUser } from '@clerk/clerk-react';
import { useEffect, useState } from 'react';

export default function Dashboard() {
    const { user } = useUser();
    const firstName = user?.firstName || user?.emailAddresses[0]?.emailAddress?.split('@')[0];
    const [isVisible, setIsVisible] = useState(false);

    useEffect(() => {
        setIsVisible(true);
    }, []);

    return (
        <div className="min-h-screen bg-black">
            {/* Navbar with slide down animation */}
            <nav className={`bg-black border-b border-purple-900/50 transition-all duration-700 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 -translate-y-4'
                }`}>
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex justify-between items-center h-16">
                        <h1 className="text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-purple-600">
                            FinPulse
                        </h1>

                        <div className="flex items-center gap-4">
                            <span className="text-gray-400">Hey, {firstName}!</span>
                            <UserButton
                                afterSignOutUrl="/"
                                appearance={{
                                    elements: {
                                        avatarBox: "w-10 h-10",
                                    },
                                }}
                            />
                        </div>
                    </div>
                </div>
            </nav>

            {/* Main Content */}
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                {/* Welcome Card with fade and slide up */}
                <div
                    className={`bg-purple-900/20 border border-purple-500/30 rounded-2xl p-8 mb-8 transition-all duration-700 hover:border-purple-500/50 hover:bg-purple-900/30 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
                        }`}
                    style={{ transitionDelay: '100ms' }}
                >
                    <h2 className="text-4xl font-bold text-white mb-2">
                        Welcome to FinPulse!
                    </h2>
                    <p className="text-purple-300 text-lg">
                        Your financial journey starts here.
                    </p>
                </div>

                {/* Stats Grid with staggered animations */}
                <div className="grid md:grid-cols-3 gap-6 mb-8">
                    {[
                        { title: 'Total Expenses', value: '$0.00', subtitle: 'This month', delay: '200ms' },
                        { title: 'Categories', value: '10', subtitle: 'Default categories', delay: '300ms' },
                        { title: 'Budget Status', value: '--', subtitle: 'Not set yet', delay: '400ms' }
                    ].map((stat, index) => (
                        <div
                            key={index}
                            className={`bg-purple-900/10 border border-purple-500/20 rounded-xl p-6 transition-all duration-700 hover:scale-105 hover:border-purple-500/40 hover:bg-purple-900/20 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
                                }`}
                            style={{ transitionDelay: stat.delay }}
                        >
                            <h3 className="text-gray-400 text-sm font-medium mb-4">{stat.title}</h3>
                            <p className="text-3xl font-bold text-white mb-1">{stat.value}</p>
                            <p className="text-sm text-gray-500">{stat.subtitle}</p>
                        </div>
                    ))}
                </div>

                {/* Next Steps with slide in animation */}
                <div
                    className={`bg-purple-900/10 border border-purple-500/20 rounded-xl p-8 transition-all duration-700 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
                        }`}
                    style={{ transitionDelay: '500ms' }}
                >
                    <h3 className="text-2xl font-bold text-white mb-6">Quick Start</h3>

                    <div className="space-y-4">
                        {[
                            { title: 'Account Created', desc: 'You\'re all set up with Clerk authentication', active: true, delay: '600ms' },
                            { title: 'Categories Ready', desc: '10 default categories added to your account', active: true, delay: '700ms' },
                            { title: 'Add Your First Expense', desc: 'Coming soon', active: false, delay: '800ms' },
                            { title: 'View Analytics', desc: 'Coming soon', active: false, delay: '900ms' }
                        ].map((step, index) => (
                            <div
                                key={index}
                                className={`flex items-start gap-4 p-4 rounded-lg transition-all duration-700 hover:scale-102 ${step.active
                                        ? 'bg-purple-500/10 border border-purple-500/20 hover:bg-purple-500/20'
                                        : 'bg-gray-900/50 border border-gray-700/20 hover:bg-gray-900/70'
                                    } ${isVisible ? 'opacity-100 translate-x-0' : 'opacity-0 -translate-x-8'
                                    }`}
                                style={{ transitionDelay: step.delay }}
                            >
                                <div>
                                    <h4 className={`${step.active ? 'text-white' : 'text-gray-400'} font-semibold mb-1`}>
                                        {step.title}
                                    </h4>
                                    <p className={`${step.active ? 'text-gray-400' : 'text-gray-500'} text-sm`}>
                                        {step.desc}
                                    </p>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Animated background gradient */}
                <div className="fixed -z-10 top-0 left-1/4 w-96 h-96 bg-purple-600/10 rounded-full blur-3xl animate-pulse"></div>
                <div className="fixed -z-10 bottom-0 right-1/4 w-96 h-96 bg-purple-600/10 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }}></div>
            </div>
        </div>
    );
}
