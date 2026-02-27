import Link from 'next/link';

export default function PrivacyPage() {
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
          <h1 className="text-3xl font-bold text-white">Privacy Policy</h1>
          <p className="text-white/50 text-sm">Last updated: February 2026</p>
          
          <div className="space-y-6 text-white/70">
            <section className="space-y-2">
              <h2 className="text-xl font-semibold text-white">What We Collect</h2>
              <p>
                When you use our calculator, we collect the financial information you voluntarily submit 
                (age, city, industry, income, debt, savings, etc.) to calculate your &quot;cooked&quot; score.
              </p>
              <p>
                To view your full results, we ask for your <strong className="text-white">email address</strong>. 
                This is the only personally identifiable information we collect.
              </p>
            </section>

            <section className="space-y-2">
              <h2 className="text-xl font-semibold text-white">How We Use Your Email</h2>
              <p>
                We may use your email to:
              </p>
              <ul className="list-disc list-inside space-y-1">
                <li>Send you updates about your financial progress</li>
                <li>Notify you about new features or seasonal challenges</li>
                <li>Share occasional financial tips and resources</li>
              </ul>
              <p className="mt-2">
                We will <strong className="text-white">never</strong> sell your email to third parties or spam you.
                You can unsubscribe at any time.
              </p>
            </section>

            <section className="space-y-2">
              <h2 className="text-xl font-semibold text-white">How We Use It</h2>
              <ul className="list-disc list-inside space-y-1">
                <li>Calculate your financial health score</li>
                <li>Show anonymous comparisons (city averages, age group averages)</li>
                <li>Display on the public leaderboard (if you choose to submit)</li>
              </ul>
            </section>

            <section className="space-y-2">
              <h2 className="text-xl font-semibold text-white">Anonymous by Design</h2>
              <p>
                All submissions are anonymous. We don&apos;t track who you are. Your submission is identified 
                only by a random ID stored in your browser — we can&apos;t connect it back to you as a person.
              </p>
            </section>

            <section className="space-y-2">
              <h2 className="text-xl font-semibold text-white">Leaderboard</h2>
              <p>
                When you submit, your score and breakdown appear on the public leaderboard. This includes 
                your avatar, score, city, industry, and financial metrics — but never your actual dollar amounts 
                for income or specific debts.
              </p>
            </section>

            <section className="space-y-2">
              <h2 className="text-xl font-semibold text-white">Cookies & Storage</h2>
              <p>
                We use browser localStorage to remember your submission ID so you can view your results later. 
                We don&apos;t use tracking cookies or third-party analytics.
              </p>
            </section>

            <section className="space-y-2">
              <h2 className="text-xl font-semibold text-white">Third Parties</h2>
              <p>
                We don&apos;t sell your data. We don&apos;t share individual submissions with anyone. 
                Aggregate statistics (like &quot;average score in New York&quot;) may be shared publicly.
              </p>
            </section>

            <section className="space-y-2">
              <h2 className="text-xl font-semibold text-white">Questions?</h2>
              <p>
                If you have any questions about this privacy policy, feel free to reach out.
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
