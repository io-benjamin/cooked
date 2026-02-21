'use client';

import { useState, useEffect, useRef } from 'react';
import { CookedResult } from '@/types/calculator';
import { Button } from '@/components/ui/button';
import { getTierLabel } from '@/lib/scoring';
import { ShareCard } from './ShareCard';

interface ResultsCardProps {
  result: CookedResult;
  onReset: () => void;
}

export function ResultsCard({ result, onReset }: ResultsCardProps) {
  const [showScore, setShowScore] = useState(false);
  const [animatedScore, setAnimatedScore] = useState(0);
  const [isGenerating, setIsGenerating] = useState(false);
  const shareCardRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Trigger animations
    setTimeout(() => setShowScore(true), 300);
    
    // Animate score counting up
    const duration = 1500;
    const steps = 60;
    const increment = result.score / steps;
    let current = 0;
    
    const timer = setInterval(() => {
      current += increment;
      if (current >= result.score) {
        setAnimatedScore(result.score);
        clearInterval(timer);
      } else {
        setAnimatedScore(Math.floor(current));
      }
    }, duration / steps);

    return () => clearInterval(timer);
  }, [result.score]);

  const tierColors: Record<string, { text: string; bg: string; glow: string }> = {
    'raw': { text: 'text-green-400', bg: 'from-green-500/20 to-green-500/5', glow: 'shadow-green-500/20' },
    'medium-rare': { text: 'text-lime-400', bg: 'from-lime-500/20 to-lime-500/5', glow: 'shadow-lime-500/20' },
    'medium': { text: 'text-yellow-400', bg: 'from-yellow-500/20 to-yellow-500/5', glow: 'shadow-yellow-500/20' },
    'well-done': { text: 'text-orange-400', bg: 'from-orange-500/20 to-orange-500/5', glow: 'shadow-orange-500/20' },
    'charcoal': { text: 'text-red-400', bg: 'from-red-500/20 to-red-500/5', glow: 'shadow-red-500/20' },
    'ash': { text: 'text-gray-400', bg: 'from-gray-500/20 to-gray-500/5', glow: 'shadow-gray-500/20' },
  };

  const colors = tierColors[result.tier];

  const generateImage = async (): Promise<Blob | null> => {
    if (!shareCardRef.current) return null;
    
    const html2canvas = (await import('html2canvas')).default;
    const canvas = await html2canvas(shareCardRef.current, {
      backgroundColor: '#0a0a0a',
      scale: 2,
      logging: false,
    });
    
    return new Promise((resolve) => {
      canvas.toBlob((blob) => resolve(blob), 'image/png', 1.0);
    });
  };

  const handleDownload = async () => {
    setIsGenerating(true);
    try {
      const blob = await generateImage();
      if (blob) {
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `cooked-${result.score}percent.png`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
      }
    } finally {
      setIsGenerating(false);
    }
  };

  const handleShare = async () => {
    const text = `I'm ${result.score}% cooked ${result.emoji}\n\n"${result.roast}"\n\nFind out if you're cooked: amicooked.com`;
    
    // Try to share with image
    if (navigator.share && navigator.canShare) {
      setIsGenerating(true);
      try {
        const blob = await generateImage();
        if (blob) {
          const file = new File([blob], 'cooked.png', { type: 'image/png' });
          const shareData = { text, files: [file] };
          
          if (navigator.canShare(shareData)) {
            await navigator.share(shareData);
            return;
          }
        }
      } catch {
        // Fall back to text only
      } finally {
        setIsGenerating(false);
      }
    }
    
    // Fallback: share text only
    if (navigator.share) {
      try {
        await navigator.share({ text });
      } catch {
        // User cancelled
      }
    } else {
      navigator.clipboard.writeText(text);
    }
  };

  return (
    <div className="w-full max-w-2xl mx-auto space-y-6">
      {/* Main Score Card */}
      <div className={`glass rounded-3xl p-8 text-center relative overflow-hidden ${showScore ? 'animate-slide-up' : 'opacity-0'}`}>
        {/* Glow effect */}
        <div className={`absolute inset-0 bg-gradient-to-b ${colors.bg} opacity-50`} />
        
        <div className="relative z-10 space-y-6">
          {/* Emoji */}
          <div className={`text-8xl ${showScore ? 'animate-score-reveal' : 'opacity-0'}`} style={{ animationDelay: '0.2s' }}>
            {result.emoji}
          </div>
          
          {/* Score */}
          <div className={showScore ? 'animate-score-reveal' : 'opacity-0'} style={{ animationDelay: '0.4s' }}>
            <div className={`text-7xl sm:text-8xl font-black ${colors.text}`}>
              {animatedScore}%
            </div>
            <div className="text-2xl font-bold text-white/70 mt-2">
              {getTierLabel(result.tier)}
            </div>
          </div>

          {/* Roast */}
          <div className={`max-w-md mx-auto ${showScore ? 'animate-slide-up' : 'opacity-0'}`} style={{ animationDelay: '0.6s' }}>
            <p className="text-xl text-white/60 italic">
              &ldquo;{result.roast}&rdquo;
            </p>
          </div>

          {/* Progress bar */}
          <div className={`pt-4 ${showScore ? 'animate-slide-up' : 'opacity-0'}`} style={{ animationDelay: '0.8s' }}>
            <div className="text-sm text-white/40 mb-2">Cooked-ness Level</div>
            <div className="h-3 bg-white/5 rounded-full overflow-hidden">
              <div 
                className="h-full bg-gradient-to-r from-green-500 via-yellow-500 via-orange-500 to-red-500 rounded-full transition-all duration-1000 ease-out"
                style={{ width: `${animatedScore}%` }}
              />
            </div>
            <div className="flex justify-between text-xs text-white/30 mt-1">
              <span>Raw</span>
              <span>Ash</span>
            </div>
          </div>
        </div>
      </div>

      {/* Stats Grid */}
      <div className={`grid grid-cols-3 gap-4 ${showScore ? 'animate-slide-up' : 'opacity-0'}`} style={{ animationDelay: '1s' }}>
        <div className="glass rounded-2xl p-4 text-center">
          <div className="text-2xl font-bold text-white">{result.percentile}%</div>
          <div className="text-xs text-white/50">vs all users</div>
        </div>
        <div className="glass rounded-2xl p-4 text-center">
          <div className="text-2xl font-bold text-white">{result.cityPercentile || result.percentile}%</div>
          <div className="text-xs text-white/50">vs city</div>
        </div>
        <div className="glass rounded-2xl p-4 text-center">
          <div className="text-2xl font-bold text-white">{result.industryPercentile || result.percentile}%</div>
          <div className="text-xs text-white/50">vs your field</div>
        </div>
      </div>

      {/* What's Cooking You */}
      {result.topIssues.length > 0 && (
        <div className={`glass rounded-3xl p-6 ${showScore ? 'animate-slide-up' : 'opacity-0'}`} style={{ animationDelay: '1.2s' }}>
          <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
            🔥 What&apos;s Cooking You
          </h3>
          <div className="space-y-3">
            {result.topIssues.map((issue, i) => (
              <div 
                key={i} 
                className={`p-4 rounded-xl border-l-4 ${
                  issue.severity === 'critical' ? 'border-l-red-500 bg-red-500/10' :
                  issue.severity === 'high' ? 'border-l-orange-500 bg-orange-500/10' :
                  issue.severity === 'medium' ? 'border-l-yellow-500 bg-yellow-500/10' :
                  'border-l-blue-500 bg-blue-500/10'
                }`}
              >
                <div className="font-semibold text-white">{issue.category}</div>
                <div className="text-sm text-white/60">{issue.description}</div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Recommendations */}
      {result.recommendations.length > 0 && (
        <div className={`glass rounded-3xl p-6 ${showScore ? 'animate-slide-up' : 'opacity-0'}`} style={{ animationDelay: '1.4s' }}>
          <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
            🧯 How to Un-Cook Yourself
          </h3>
          <div className="space-y-4">
            {result.recommendations.map((rec, i) => (
              <div key={i} className="flex gap-3">
                <span className="text-xl">💡</span>
                <div>
                  <div className="font-semibold text-white">{rec.title}</div>
                  <p className="text-sm text-white/60">{rec.description}</p>
                  {rec.link && (
                    <a href={rec.link} className="text-sm text-orange-400 hover:text-orange-300 mt-1 inline-block">
                      {rec.linkText} →
                    </a>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Action Buttons */}
      <div className={`flex flex-col sm:flex-row gap-4 ${showScore ? 'animate-slide-up' : 'opacity-0'}`} style={{ animationDelay: '1.6s' }}>
        <Button 
          onClick={handleShare}
          disabled={isGenerating}
          className="flex-1 h-14 bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 text-white font-bold text-lg rounded-2xl disabled:opacity-50"
        >
          {isGenerating ? 'Generating...' : 'Share Results 🔥'}
        </Button>
        <Button 
          onClick={handleDownload}
          disabled={isGenerating}
          className="flex-1 h-14 bg-white/10 hover:bg-white/20 text-white font-bold text-lg rounded-2xl border border-white/10 disabled:opacity-50"
        >
          {isGenerating ? '...' : 'Download Card 📸'}
        </Button>
      </div>

      {/* Try Again */}
      <div className={`${showScore ? 'animate-slide-up' : 'opacity-0'}`} style={{ animationDelay: '1.7s' }}>
        <Button 
          variant="outline"
          onClick={onReset}
          className="w-full h-12 bg-white/5 border-white/10 hover:bg-white/10 text-white/60 hover:text-white font-semibold rounded-2xl"
        >
          Calculate Again
        </Button>
      </div>

      {/* Hidden ShareCard for capture */}
      <div 
        style={{ 
          position: 'absolute', 
          left: '-9999px', 
          top: '-9999px',
          pointerEvents: 'none',
        }}
      >
        <ShareCard ref={shareCardRef} result={result} />
      </div>
    </div>
  );
}
