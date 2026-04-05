import { Link } from 'react-router-dom';

export default function PrivacyPolicyPage() {
    return (
        <div className="min-h-screen bg-black text-zinc-300 py-12 px-4 sm:px-6 lg:px-8">
            <div className="max-w-3xl mx-auto bg-zinc-900/50 border border-zinc-800/80 p-8 rounded-[2rem]">
                <h1 className="text-3xl font-bold text-white mb-2">FinPulse - Finance Tracker</h1>
                <h2 className="text-xl text-purple-400 mb-8">Privacy Policy & Terms</h2>
                
                <div className="space-y-6 text-sm leading-relaxed">
                    <section>
                        <h3 className="text-lg font-bold text-white mb-2">1. App Purpose</h3>
                        <p>FinPulse (also known as Finance Tracker) is a personal financial management tool designed to help users track their expenditures and maintain budgets through automated integrations.</p>
                    </section>

                    <section>
                        <h3 className="text-lg font-bold text-white mb-2">2. Google API Services Usage Disclosure</h3>
                        <p>Our application requires access to highly restricted Gmail scopes to function. Specifically, we request:</p>
                        <ul className="list-disc pl-5 mt-2 space-y-1 text-zinc-400">
                            <li><code className="text-purple-300 bg-purple-900/30 px-1 rounded">https://www.googleapis.com/auth/gmail.settings.basic</code></li>
                            <li><code className="text-purple-300 bg-purple-900/30 px-1 rounded">https://www.googleapis.com/auth/gmail.settings.sharing</code></li>
                        </ul>
                        <p className="mt-2">
                        <strong>We enforce Zero Inbox Access.</strong> FinPulse does <em>not</em> read your personal emails or access your inbox history. We strictly use these permissions to programmatically create an email forwarding filter. This filter securely forwards emails related to purchases directly to your authenticated user account in FinPulse.
                        </p>
                    </section>

                    <section>
                        <h3 className="text-lg font-bold text-white mb-2">3. Data Collection & Privacy</h3>
                        <p>Any purchase receipt information forwarded to our servers is stored securely and solely attached to your authenticated account. We do not sell, rent, or distribute your financial data to any third-parties under any circumstances.</p>
                    </section>
                    
                    <div className="pt-8 text-center">
                        <Link to="/" className="text-purple-500 hover:text-purple-400 underline font-medium">
                            Return to Homepage
                        </Link>
                    </div>
                </div>
            </div>
        </div>
    );
}
