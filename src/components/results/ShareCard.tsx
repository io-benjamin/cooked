'use client';

import { forwardRef } from 'react';
import { CookedResult } from '@/types/calculator';

interface ShareCardProps {
  result: CookedResult;
  avatarUrl: string;
  userCity: string;
}

const TIER_INFO: Record<string, { name: string; color: string }> = {
  'raw': { name: 'RAW', color: '#22d3ee' },
  'medium-rare': { name: 'LIGHT SIZZLE', color: '#4ade80' },
  'medium': { name: 'SIMMERING', color: '#facc15' },
  'well-done': { name: 'SAUTÉED', color: '#fb923c' },
  'charcoal': { name: 'WELL DONE', color: '#f87171' },
  'ash': { name: 'CHARRED', color: '#a1a1aa' },
};

// This is the card that gets converted to an image
export const ShareCard = forwardRef<HTMLDivElement, ShareCardProps>(
  ({ result, avatarUrl, userCity }, ref) => {
    const tier = TIER_INFO[result.tier] || TIER_INFO['medium'];
    const burnLevel = result.score / 100;

    return (
      <div
        ref={ref}
        style={{
          width: '600px',
          height: '600px',
          background: 'linear-gradient(180deg, #0a0a0a 0%, #1a1a1a 50%, #0f0f0f 100%)',
          padding: '40px',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
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
            backgroundImage: 'linear-gradient(rgba(255,255,255,0.02) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.02) 1px, transparent 1px)',
            backgroundSize: '30px 30px',
          }}
        />

        {/* Fire glow at bottom */}
        <div
          style={{
            position: 'absolute',
            bottom: '-100px',
            left: '50%',
            transform: 'translateX(-50%)',
            width: '500px',
            height: '300px',
            background: `radial-gradient(ellipse at center, ${tier.color}40 0%, transparent 70%)`,
            filter: 'blur(40px)',
          }}
        />

        {/* Header */}
        <div style={{ 
          display: 'flex', 
          flexDirection: 'column',
          alignItems: 'center', 
          gap: '4px',
          marginBottom: '16px',
          position: 'relative',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span style={{ fontSize: '24px' }}>🔥</span>
            <span style={{ 
              fontSize: '20px', 
              fontWeight: 800, 
              color: 'rgba(255,255,255,0.7)',
              letterSpacing: '3px',
            }}>
              AM I COOKED?
            </span>
            <span style={{ fontSize: '24px' }}>🔥</span>
          </div>
          <span style={{
            fontSize: '12px',
            color: 'rgba(255,255,255,0.35)',
            letterSpacing: '1px',
          }}>
            THE FINANCIAL REALITY CHECK
          </span>
        </div>

        {/* Avatar with burn effects */}
        <div style={{ 
          position: 'relative',
          marginBottom: '20px',
        }}>
          {/* Flames behind avatar */}
          <div style={{
            position: 'absolute',
            bottom: '-20px',
            left: '50%',
            transform: 'translateX(-50%)',
            fontSize: '60px',
            opacity: Math.min(burnLevel * 1.5, 1),
          }}>
            🔥🔥🔥
          </div>
          
          {/* Avatar */}
          <div style={{
            width: '160px',
            height: '160px',
            borderRadius: '24px',
            overflow: 'hidden',
            border: `4px solid ${tier.color}`,
            position: 'relative',
            boxShadow: `0 0 40px ${tier.color}40`,
          }}>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img 
              src={avatarUrl} 
              alt="" 
              style={{
                width: '100%',
                height: '100%',
                objectFit: 'cover',
                filter: `brightness(${1 - burnLevel * 0.3}) sepia(${burnLevel * 0.4})`,
              }}
            />
            {/* Burn overlay */}
            <div style={{
              position: 'absolute',
              inset: 0,
              background: `radial-gradient(ellipse at center, transparent 40%, rgba(139, 69, 19, ${burnLevel * 0.4}) 100%)`,
            }} />
          </div>
          
          {/* Expression */}
          <div style={{
            position: 'absolute',
            bottom: '0',
            right: '-10px',
            fontSize: '40px',
          }}>
            {result.score > 80 ? '💀' : result.score > 60 ? '😵' : result.score > 40 ? '😰' : result.score > 20 ? '😅' : '😎'}
          </div>
        </div>

        {/* Score */}
        <div style={{
          fontSize: '100px',
          fontWeight: 900,
          color: tier.color,
          lineHeight: 1,
          textShadow: `0 0 60px ${tier.color}60`,
          position: 'relative',
        }}>
          {result.score}%
        </div>

        {/* Tier name */}
        <div style={{
          fontSize: '28px',
          fontWeight: 800,
          color: tier.color,
          marginTop: '4px',
          letterSpacing: '6px',
          textShadow: `0 0 20px ${tier.color}40`,
        }}>
          {tier.name}
        </div>

        {/* Location */}
        <div style={{
          fontSize: '16px',
          color: 'rgba(255,255,255,0.5)',
          marginTop: '16px',
        }}>
          in {userCity}
        </div>

        {/* Roast */}
        <div style={{
          fontSize: '16px',
          color: 'rgba(255,255,255,0.4)',
          marginTop: '12px',
          maxWidth: '400px',
          textAlign: 'center',
          fontStyle: 'italic',
        }}>
          &ldquo;{result.roast}&rdquo;
        </div>

        {/* Footer */}
        <div style={{
          position: 'absolute',
          bottom: '20px',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: '4px',
        }}>
          <span style={{
            fontSize: '13px',
            color: 'rgba(255,255,255,0.4)',
            letterSpacing: '0.5px',
          }}>
            See how financially cooked you are
          </span>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <span style={{ fontSize: '18px' }}>🔥</span>
            <span style={{
              fontSize: '16px',
              fontWeight: 700,
              color: 'rgba(255,255,255,0.5)',
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
