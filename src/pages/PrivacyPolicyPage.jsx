import { Link } from 'react-router-dom';

export default function PrivacyPolicyPage() {
    return (
        <div className="min-h-screen bg-black text-zinc-300 py-12 px-4 sm:px-6 lg:px-8">
            <div className="max-w-3xl mx-auto">

                {/* Header */}
                <div className="mb-10">
                    <Link to="/" className="text-sm text-purple-400 hover:text-purple-300 underline underline-offset-4 transition-colors">
                        ← Back to Home (finpulse.nethmihapauarachchi.com)
                    </Link>
                    <h1 className="text-3xl font-bold text-white mt-6 mb-1">Privacy Policy &amp; Terms of Service</h1>
                    <p className="text-purple-400 font-medium text-lg mb-1">FinPulse — Finance Tracker</p>
                    <p className="text-sm text-zinc-500">Application: Finance Tracker (also known as FinPulse) | Last updated: April 2026</p>
                    <p className="text-sm text-zinc-500 mt-1">URL: https://finpulse.nethmihapauarachchi.com/privacy</p>
                </div>

                <div className="space-y-8 bg-zinc-900/50 border border-zinc-800/80 p-8 rounded-[2rem] text-sm leading-relaxed">

                    {/* Section 1 */}
                    <section>
                        <h2 className="text-lg font-bold text-white mb-3">1. About This Application</h2>
                        <p className="mb-2">
                            <strong className="text-white">FinPulse</strong> (registered with Google as <strong className="text-white">Finance Tracker</strong>) is a personal financial management web application available at{' '}
                            <a href="https://finpulse.nethmihapauarachchi.com" className="text-purple-400 underline">finpulse.nethmihapauarachchi.com</a>.
                        </p>
                        <p className="mb-2">
                            The application helps users track their personal expenditures and manage budgets. Its primary feature is automated expense detection: with the user's explicit permission, FinPulse sets up a Gmail forwarding filter to route purchase-related emails to the FinPulse system, where they are parsed and recorded as expense entries in the user's account.
                        </p>
                        <p>
                            FinPulse is developed as a university project at the University of Colombo School of Computing (UCSC) and is intended for personal use.
                        </p>
                    </section>

                    {/* Section 2 */}
                    <section>
                        <h2 className="text-lg font-bold text-white mb-3">2. Google API Services &amp; Gmail Usage</h2>
                        <p className="mb-3">
                            To enable automated expense tracking, FinPulse requests the following Gmail API scopes upon user consent:
                        </p>
                        <ul className="list-disc pl-5 space-y-2 text-zinc-400 mb-4">
                            <li>
                                <code className="text-purple-300 bg-purple-900/30 px-1 rounded">https://www.googleapis.com/auth/gmail.settings.basic</code>
                                <p className="mt-1 text-zinc-400">Used solely to create email filters in the user's Gmail account.</p>
                            </li>
                            <li>
                                <code className="text-purple-300 bg-purple-900/30 px-1 rounded">https://www.googleapis.com/auth/gmail.settings.sharing</code>
                                <p className="mt-1 text-zinc-400">Used solely to configure a forwarding address so purchase emails are routed to FinPulse.</p>
                            </li>
                        </ul>
                        <div className="bg-purple-900/20 border border-purple-700/40 rounded-xl p-4">
                            <p className="font-semibold text-purple-300 mb-1">Zero Inbox Access Guarantee</p>
                            <p className="text-zinc-400">
                                FinPulse does <strong className="text-white">not</strong> read, store, or process the contents of your Gmail inbox in any way. We do not access your email history, contacts, or any personal communication. The Gmail permissions are used exclusively to configure automated filter and forwarding rules on your behalf.
                            </p>
                        </div>
                        <p className="mt-3 text-zinc-500 text-xs">
                            FinPulse's use and transfer of information received from Google APIs adheres to the{' '}
                            <a href="https://developers.google.com/terms/api-services-user-data-policy" target="_blank" rel="noopener noreferrer" className="text-purple-400 underline">
                                Google API Services User Data Policy
                            </a>, including the Limited Use requirements.
                        </p>
                    </section>

                    {/* Section 3 */}
                    <section>
                        <h2 className="text-lg font-bold text-white mb-3">3. Data We Collect</h2>
                        <ul className="list-disc pl-5 space-y-2 text-zinc-400">
                            <li><strong className="text-zinc-200">Account information</strong> — Name and email address provided during sign-up via Clerk authentication.</li>
                            <li><strong className="text-zinc-200">Expense data</strong> — Purchase information parsed from forwarded emails (merchant name, amount, date) stored as expense records in your account.</li>
                            <li><strong className="text-zinc-200">Budget data</strong> — Budget limits and categories you configure within the app.</li>
                            <li><strong className="text-zinc-200">Usage data</strong> — Standard server logs (IP address, timestamp) for security and debugging purposes.</li>
                        </ul>
                    </section>

                    {/* Section 4 */}
                    <section>
                        <h2 className="text-lg font-bold text-white mb-3">4. How We Use Your Data</h2>
                        <ul className="list-disc pl-5 space-y-2 text-zinc-400">
                            <li>To display your expense history and budget status within the application.</li>
                            <li>To send optional reminder emails about expense logging (only if you enable this in Settings).</li>
                            <li>To sync expenses with your Google Calendar (only if you enable this in Settings).</li>
                        </ul>
                        <p className="mt-3">We <strong className="text-white">do not</strong> sell, rent, share, or transfer your data to any third parties for commercial purposes.</p>
                    </section>

                    {/* Section 5 */}
                    <section>
                        <h2 className="text-lg font-bold text-white mb-3">5. Data Retention &amp; Deletion</h2>
                        <p className="mb-2">
                            Your data is retained for as long as your account is active. You may delete your account and all associated data at any time by contacting the developer at the email address below. Upon deletion, all expense records, budget data, and personal information are permanently removed from our systems.
                        </p>
                    </section>

                    {/* Section 6 */}
                    <section>
                        <h2 className="text-lg font-bold text-white mb-3">6. Your Rights</h2>
                        <ul className="list-disc pl-5 space-y-2 text-zinc-400">
                            <li><strong className="text-zinc-200">Access</strong> — You can view all your stored data within the app at any time.</li>
                            <li><strong className="text-zinc-200">Correction</strong> — You can edit or delete any expense or budget record directly in the app.</li>
                            <li><strong className="text-zinc-200">Revoke Google access</strong> — You can revoke Gmail permissions at any time via{' '}
                                <a href="https://myaccount.google.com/permissions" target="_blank" rel="noopener noreferrer" className="text-purple-400 underline">Google Account Permissions</a>.
                            </li>
                            <li><strong className="text-zinc-200">Account deletion</strong> — Contact us to permanently delete your account and all data.</li>
                        </ul>
                    </section>

                    {/* Section 7 */}
                    <section>
                        <h2 className="text-lg font-bold text-white mb-3">7. Contact</h2>
                        <p className="text-zinc-400">
                            If you have any questions about this privacy policy or your data, please contact the developer:
                        </p>
                        <p className="mt-2 text-purple-300 font-medium">sathruvanihapauarachchi7@gmail.com</p>
                        <p className="mt-1 text-zinc-500 text-xs">Application: Finance Tracker (FinPulse) · University of Colombo School of Computing</p>
                    </section>

                </div>

                {/* Footer nav */}
                <div className="mt-8 text-center">
                    <Link to="/" className="text-purple-400 hover:text-purple-300 underline underline-offset-4 font-medium transition-colors">
                        ← Return to FinPulse Home
                    </Link>
                </div>
            </div>
        </div>
    );
}
