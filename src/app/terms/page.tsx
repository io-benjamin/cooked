import Link from 'next/link';

export default function TermsPage() {
  return (
    <main className="min-h-screen bg-[#050505] relative overflow-hidden">
      {/* Background effects */}
      <div className="fixed inset-0 grid-bg opacity-50" />
      
      {/* Header */}
      <header className="relative z-50 border-b border-white/5">
        <div className="container mx-auto px-4 py-4 flex justify-between items-center">
          <Link href="/" className="flex items-center gap-3 group">
            <span className="text-3xl group-hover:animate-pulse">🔥</span>
            <span className="font-black text-xl tracking-tight">
              am i <span className="text-transparent bg-clip-text bg-gradient-to-r from-orange-500 to-red-500">cooked</span>?
            </span>
          </Link>
        </div>
      </header>

      {/* Content */}
      <div className="relative z-10 container mx-auto px-4 py-12 max-w-2xl">
        <div className="glass rounded-3xl p-8 space-y-6">
          <h1 className="text-3xl font-bold text-white">Terms of Use</h1>
          <p className="text-white/50 text-sm">Last updated: February 2026</p>
          
          <div className="space-y-6 text-white/70">
            <section className="space-y-2">
              <h2 className="text-xl font-semibold text-white">What This Is</h2>
              <p>
                &quot;Am I Cooked?&quot; is a free financial health calculator for entertainment and educational purposes. 
                It&apos;s designed to give you a fun reality check on your finances — not professional financial advice.
              </p>
            </section>

            <section className="space-y-2">
              <h2 className="text-xl font-semibold text-white">Not Financial Advice</h2>
              <p>
                The scores, comparisons, and &quot;roasts&quot; provided by this tool are for entertainment purposes only. 
                We are not financial advisors. Your actual financial situation is more nuanced than any calculator can capture.
              </p>
              <p>
                If you need real financial advice, please consult a qualified financial professional.
              </p>
            </section>

            <section className="space-y-2">
              <h2 className="text-xl font-semibold text-white">Accuracy</h2>
              <p>
                We do our best to make the calculations reasonable, but we make no guarantees about accuracy. 
                The comparisons are based on user-submitted data, which may not be representative of the general population.
              </p>
            </section>

            <section className="space-y-2">
              <h2 className="text-xl font-semibold text-white">Your Submissions</h2>
              <p>
                By submitting your information, you agree that it can be displayed anonymously on the public leaderboard 
                and used to calculate aggregate statistics. You represent that the information you provide is your own 
                (not someone else&apos;s).
              </p>
            </section>

            <section className="space-y-2">
              <h2 className="text-xl font-semibold text-white">Be Nice</h2>
              <p>
                Don&apos;t abuse the service. Don&apos;t submit fake data to mess with the averages. 
                Don&apos;t try to identify other users. Just have fun with it.
              </p>
            </section>

            <section className="space-y-2">
              <h2 className="text-xl font-semibold text-white">Changes</h2>
              <p>
                We might update these terms from time to time. If we do, we&apos;ll update the date at the top. 
                Continued use of the site means you accept the updated terms.
              </p>
            </section>
          </div>
        </div>

        <div className="mt-8 text-center">
          <Link 
            href="/"
            className="text-white/50 hover:text-white transition-colors"
          >
            ← Back to calculator
          </Link>
        </div>
      </div>
    </main>
  );
}
