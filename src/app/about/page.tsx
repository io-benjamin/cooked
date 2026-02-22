import Link from 'next/link';

export default function AboutPage() {
  return (
    <main className="min-h-screen bg-[#050505] relative overflow-hidden">
      {/* Background */}
      <div className="fixed inset-0 grid-bg opacity-50" />
      <div className="fixed top-0 left-1/2 -translate-x-1/2 w-[800px] h-[600px] bg-gradient-to-b from-orange-500/10 via-red-500/5 to-transparent blur-3xl pointer-events-none" />

      {/* Header */}
      <header className="relative z-50 border-b border-white/5">
        <div className="container mx-auto px-4 py-4 flex justify-between items-center">
          <Link href="/" className="flex items-center gap-3 group cursor-pointer">
            <span className="text-3xl group-hover:animate-flame">🔥</span>
            <span className="font-black text-xl tracking-tight">
              am i <span className="gradient-text">cooked</span>?
            </span>
          </Link>
          <nav className="hidden sm:flex gap-6 text-sm text-white/50">
            <Link href="/leaderboard" className="hover:text-white transition-colors">leaderboard</Link>
            <Link href="/about" className="text-white">about</Link>
          </nav>
        </div>
      </header>

      {/* Content */}
      <div className="relative z-10 container mx-auto px-4 py-16">
        <div className="max-w-2xl mx-auto text-center">
          <h1 className="text-6xl sm:text-8xl font-black mb-8">
            <span className="gradient-text">chat</span>
            <br />
            are we cooked?
          </h1>
          
          <div className="text-6xl mb-8">🔥</div>
          
          <p className="text-xl text-white/60 mb-12">
            A financial reality check for the chronically online.
          </p>

          <div className="glass rounded-3xl p-8 mb-12">
            <p className="text-white/50 text-lg">Built by</p>
            <p className="text-3xl font-bold text-white mt-2">Io</p>
          </div>

          <Link 
            href="/"
            className="inline-flex items-center gap-2 px-8 py-4 bg-gradient-to-r from-orange-500 to-red-500 rounded-2xl font-bold text-lg hover:scale-105 transition-transform"
          >
            Find Out If You&apos;re Cooked 🔥
          </Link>
        </div>
      </div>

      {/* Footer */}
      <footer className="absolute bottom-0 left-0 right-0 z-10 border-t border-white/5">
        <div className="container mx-auto px-4 py-6">
          <div className="flex flex-col sm:flex-row justify-between items-center gap-4 text-sm text-white/30">
            <span>🔥 am i cooked? © 2026</span>
            <div className="flex gap-6">
              <a href="#" className="hover:text-white/60 transition-colors">Privacy</a>
              <a href="#" className="hover:text-white/60 transition-colors">Terms</a>
            </div>
          </div>
        </div>
      </footer>
    </main>
  );
}
