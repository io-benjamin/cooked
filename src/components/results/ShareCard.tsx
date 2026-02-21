'use client';

import { forwardRef } from 'react';
import { CookedResult } from '@/types/calculator';
import { getTierLabel } from '@/lib/scoring';

interface ShareCardProps {
  result: CookedResult;
}

// This is the card that gets converted to an image
export const ShareCard = forwardRef<HTMLDivElement, ShareCardProps>(
  ({ result }, ref) => {
    const tierColors: Record<string, { text: string; gradient: string }> = {
      'raw': { text: '#4ade80', gradient: 'linear-gradient(135deg, #22c55e 0%, #16a34a 100%)' },
      'medium-rare': { text: '#a3e635', gradient: 'linear-gradient(135deg, #84cc16 0%, #65a30d 100%)' },
      'medium': { text: '#facc15', gradient: 'linear-gradient(135deg, #eab308 0%, #ca8a04 100%)' },
      'well-done': { text: '#fb923c', gradient: 'linear-gradient(135deg, #f97316 0%, #ea580c 100%)' },
      'charcoal': { text: '#f87171', gradient: 'linear-gradient(135deg, #ef4444 0%, #dc2626 100%)' },
      'ash': { text: '#9ca3af', gradient: 'linear-gradient(135deg, #6b7280 0%, #4b5563 100%)' },
    };

    const colors = tierColors[result.tier];

    return (
      <div
        ref={ref}
        style={{
          width: '600px',
          height: '600px',
          background: 'linear-gradient(135deg, #0f0f0f 0%, #1a1a1a 50%, #0a0a0a 100%)',
          padding: '40px',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          fontFamily: 'system-ui, -apple-system, sans-serif',
          position: 'relative',
          overflow: 'hidden',
        }}
      >
        {/* Background grid */}
        <div
          style={{
            position: 'absolute',
            inset: 0,
            backgroundImage: 'linear-gradient(rgba(255,255,255,0.03) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.03) 1px, transparent 1px)',
            backgroundSize: '40px 40px',
          }}
        />
        
        {/* Glow effect */}
        <div
          style={{
            position: 'absolute',
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
            width: '400px',
            height: '400px',
            background: colors.gradient,
            filter: 'blur(100px)',
            opacity: 0.3,
            borderRadius: '50%',
          }}
        />

        {/* Content */}
        <div style={{ position: 'relative', textAlign: 'center' }}>
          {/* Emoji */}
          <div style={{ fontSize: '100px', marginBottom: '16px' }}>
            {result.emoji}
          </div>

          {/* Score */}
          <div
            style={{
              fontSize: '120px',
              fontWeight: 900,
              color: colors.text,
              lineHeight: 1,
              textShadow: `0 0 60px ${colors.text}40`,
            }}
          >
            {result.score}%
          </div>

          {/* Tier */}
          <div
            style={{
              fontSize: '32px',
              fontWeight: 700,
              color: 'rgba(255,255,255,0.7)',
              marginTop: '8px',
              textTransform: 'uppercase',
              letterSpacing: '4px',
            }}
          >
            {getTierLabel(result.tier)}
          </div>

          {/* Roast */}
          <div
            style={{
              fontSize: '18px',
              color: 'rgba(255,255,255,0.5)',
              marginTop: '24px',
              maxWidth: '400px',
              fontStyle: 'italic',
            }}
          >
            "{result.roast}"
          </div>
        </div>

        {/* Footer */}
        <div
          style={{
            position: 'absolute',
            bottom: '30px',
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
          }}
        >
          <span style={{ fontSize: '28px' }}>🔥</span>
          <span
            style={{
              fontSize: '20px',
              fontWeight: 700,
              color: 'rgba(255,255,255,0.4)',
              letterSpacing: '1px',
            }}
          >
            amicooked.com
          </span>
        </div>
      </div>
    );
  }
);

ShareCard.displayName = 'ShareCard';
