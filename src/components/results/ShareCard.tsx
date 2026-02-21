'use client';

import { forwardRef } from 'react';
import { CookedResult } from '@/types/calculator';

interface ShareCardProps {
  result: CookedResult;
  avatarUrl: string;
  userCity: string;
  userAge?: number;
  userRank?: number;
  totalUsers?: number;
}

const TIER_INFO: Record<string, { name: string; emoji: string; color: string }> = {
  'raw': { name: 'RAW', emoji: '🥶', color: '#22d3ee' },
  'medium-rare': { name: 'LIGHT SIZZLE', emoji: '🍳', color: '#4ade80' },
  'medium': { name: 'SIMMERING', emoji: '🥘', color: '#facc15' },
  'well-done': { name: 'SAUTÉED', emoji: '🔥', color: '#fb923c' },
  'charcoal': { name: 'WELL DONE', emoji: '☠️', color: '#f87171' },
  'ash': { name: 'CHARRED', emoji: '💀', color: '#a1a1aa' },
};

export const ShareCard = forwardRef<HTMLDivElement, ShareCardProps>(
  ({ result, avatarUrl, userCity, userAge = 25, userRank = 3482, totalUsers = 9120 }, ref) => {
    const tier = TIER_INFO[result.tier] || TIER_INFO['medium'];
    const burnLevel = result.score / 100;

    return (
      <div
        ref={ref}
        style={{
          width: '600px',
          height: '600px',
          background: '#0a0a0a',
          fontFamily: 'system-ui, -apple-system, sans-serif',
          position: 'relative',
          overflow: 'hidden',
        }}
      >
        {/* Background glow */}
        <div
          style={{
            position: 'absolute',
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
            width: '400px',
            height: '400px',
            background: `radial-gradient(ellipse at center, ${tier.color}25 0%, transparent 70%)`,
            filter: 'blur(60px)',
          }}
        />

        {/* Content container */}
        <div style={{
          position: 'relative',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '40px',
        }}>
          
          {/* Avatar with flames */}
          <div style={{ position: 'relative', marginBottom: '24px' }}>
            {/* Flames */}
            <div style={{
              position: 'absolute',
              bottom: '-16px',
              left: '50%',
              transform: 'translateX(-50%)',
              fontSize: '40px',
              opacity: 0.8,
            }}>
              🔥🔥🔥
            </div>
            
            {/* Avatar */}
            <div style={{
              width: '120px',
              height: '120px',
              borderRadius: '20px',
              overflow: 'hidden',
              border: `3px solid ${tier.color}`,
              boxShadow: `0 0 30px ${tier.color}50`,
            }}>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img 
                src={avatarUrl} 
                alt="" 
                style={{
                  width: '100%',
                  height: '100%',
                  objectFit: 'cover',
                  filter: `brightness(${1 - burnLevel * 0.25}) sepia(${burnLevel * 0.3})`,
                }}
              />
            </div>
            
            {/* Expression */}
            <div style={{
              position: 'absolute',
              bottom: '-4px',
              right: '-8px',
              fontSize: '32px',
            }}>
              {result.score > 80 ? '💀' : result.score > 60 ? '😵' : result.score > 40 ? '😰' : result.score > 20 ? '😅' : '😎'}
            </div>
          </div>

          {/* "I am" text */}
          <div style={{
            fontSize: '18px',
            color: 'rgba(255,255,255,0.5)',
            marginBottom: '8px',
            letterSpacing: '2px',
          }}>
            I AM
          </div>

          {/* Score */}
          <div style={{
            fontSize: '120px',
            fontWeight: 900,
            color: tier.color,
            lineHeight: 0.9,
            textShadow: `0 0 80px ${tier.color}50`,
          }}>
            {result.score}%
          </div>

          {/* Tier */}
          <div style={{
            fontSize: '32px',
            fontWeight: 800,
            color: tier.color,
            letterSpacing: '4px',
            marginTop: '4px',
          }}>
            {tier.emoji} {tier.name}
          </div>

          {/* Ranking */}
          <div style={{
            marginTop: '24px',
            padding: '12px 24px',
            background: 'rgba(255,255,255,0.05)',
            borderRadius: '12px',
            border: '1px solid rgba(255,255,255,0.1)',
          }}>
            <div style={{
              fontSize: '16px',
              color: 'rgba(255,255,255,0.7)',
              textAlign: 'center',
            }}>
              <span style={{ fontWeight: 700, color: '#fff' }}>#{userRank.toLocaleString()}</span>
              <span style={{ color: 'rgba(255,255,255,0.4)' }}> of {totalUsers.toLocaleString()}</span>
            </div>
            <div style={{
              fontSize: '14px',
              color: 'rgba(255,255,255,0.4)',
              textAlign: 'center',
              marginTop: '4px',
            }}>
              {userCity} • Age {userAge}
            </div>
          </div>

          {/* Footer */}
          <div style={{
            position: 'absolute',
            bottom: '24px',
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
          }}>
            <span style={{ fontSize: '20px' }}>🔥</span>
            <span style={{
              fontSize: '18px',
              fontWeight: 700,
              color: 'rgba(255,255,255,0.4)',
              letterSpacing: '1px',
            }}>
              amicooked.com
            </span>
          </div>
        </div>
      </div>
    );
  }
);

ShareCard.displayName = 'ShareCard';
