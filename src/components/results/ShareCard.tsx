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

const TIER_INFO: Record<string, { name: string; emoji: string; color: string; bgColor: string }> = {
  'raw': { name: 'RAW', emoji: '🥶', color: '#22d3ee', bgColor: '#164e63' },
  'light-sizzle': { name: 'LIGHT SIZZLE', emoji: '🍳', color: '#4ade80', bgColor: '#166534' },
  'simmering': { name: 'SIMMERING', emoji: '🥘', color: '#facc15', bgColor: '#854d0e' },
  'sauteed': { name: 'SAUTÉED', emoji: '🔥', color: '#fb923c', bgColor: '#9a3412' },
  'well-done': { name: 'WELL DONE', emoji: '☠️', color: '#f87171', bgColor: '#991b1b' },
  'charred': { name: 'CHARRED', emoji: '💀', color: '#a1a1aa', bgColor: '#3f3f46' },
  // Legacy tiers for backwards compat
  'medium-rare': { name: 'LIGHT SIZZLE', emoji: '🍳', color: '#4ade80', bgColor: '#166534' },
  'medium': { name: 'SIMMERING', emoji: '🥘', color: '#facc15', bgColor: '#854d0e' },
  'charcoal': { name: 'WELL DONE', emoji: '☠️', color: '#f87171', bgColor: '#991b1b' },
  'ash': { name: 'CHARRED', emoji: '💀', color: '#a1a1aa', bgColor: '#3f3f46' },
};

export const ShareCard = forwardRef<HTMLDivElement, ShareCardProps>(
  ({ result, avatarUrl, userCity }, ref) => {
    const tier = TIER_INFO[result.tier] || TIER_INFO['simmering'];
    
    // Convert DiceBear SVG to PNG for html2canvas compatibility
    const pngAvatarUrl = avatarUrl.includes('dicebear.com') 
      ? avatarUrl.replace('/svg?', '/png?').replace('&size=200', '&size=200&scale=100')
      : avatarUrl;

    return (
      <div
        ref={ref}
        style={{
          width: '600px',
          height: '600px',
          background: '#111111',
          fontFamily: 'system-ui, -apple-system, sans-serif',
          position: 'relative',
          overflow: 'hidden',
        }}
      >
        {/* Grid background */}
        <div
          style={{
            position: 'absolute',
            inset: 0,
            backgroundImage: 'linear-gradient(rgba(255,255,255,0.03) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.03) 1px, transparent 1px)',
            backgroundSize: '40px 40px',
          }}
        />

        {/* Top branding */}
        <div style={{
          position: 'absolute',
          top: '24px',
          left: '0',
          right: '0',
          textAlign: 'center',
        }}>
          <div style={{
            fontSize: '14px',
            color: 'rgba(255,255,255,0.4)',
            letterSpacing: '2px',
            textTransform: 'uppercase',
          }}>
            Financial Reality Check
          </div>
        </div>

        {/* Content */}
        <div style={{
          position: 'relative',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '40px',
        }}>
          
          {/* Big colored circle */}
          <div style={{
            width: '320px',
            height: '320px',
            borderRadius: '50%',
            background: `radial-gradient(circle at 30% 30%, ${tier.bgColor} 0%, ${tier.bgColor}90 100%)`,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            boxShadow: `0 0 80px ${tier.color}30`,
            position: 'relative',
          }}>
            {/* Avatar - "Becoming Uncanny" effect */}
            <div style={{
              width: '100px',
              height: '100px',
              borderRadius: '20px',
              overflow: 'hidden',
              border: `3px solid ${tier.color}`,
              marginBottom: '8px',
              position: 'relative',
              backgroundColor: '#e8dcc8',
            }}>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img 
                src={pngAvatarUrl} 
                alt="" 
                width={100}
                height={100}
                style={{
                  width: '100%',
                  height: '100%',
                  objectFit: 'cover',
                  objectPosition: 'center top',
                  filter: `brightness(${1 - (result.score / 100) * 0.5}) contrast(${1 + (result.score / 100) * 0.4}) saturate(${1 - (result.score / 100) * 0.9})`,
                }}
              />
              {/* Dark vignette overlay */}
              <div style={{
                position: 'absolute',
                inset: 0,
                background: `radial-gradient(circle, transparent 30%, rgba(0,0,0,${(result.score / 100) * 0.7}) 100%)`,
                pointerEvents: 'none',
              }} />
              {/* Red tint for high scores */}
              {result.score > 70 && (
                <div style={{
                  position: 'absolute',
                  inset: 0,
                  backgroundColor: `rgba(139, 0, 0, ${((result.score - 70) / 30) * 0.4})`,
                  mixBlendMode: 'multiply',
                  pointerEvents: 'none',
                }} />
              )}
            </div>
            
            {/* Score */}
            <div style={{
              fontSize: '90px',
              fontWeight: 900,
              color: tier.color,
              lineHeight: 0.9,
            }}>
              {result.score}%
            </div>
            
            {/* Tier name */}
            <div style={{
              fontSize: '26px',
              fontWeight: 800,
              color: tier.color,
              letterSpacing: '4px',
              marginTop: '4px',
            }}>
              {tier.name}
            </div>
          </div>

          {/* City badge */}
          {userCity && (
            <div style={{
              marginTop: '16px',
              fontSize: '14px',
              color: 'rgba(255,255,255,0.4)',
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
            }}>
              <span>📍</span>
              <span>{userCity}</span>
            </div>
          )}

          {/* Roast */}
          <div style={{
            marginTop: '20px',
            fontSize: '16px',
            color: 'rgba(255,255,255,0.5)',
            textAlign: 'center',
            fontStyle: 'italic',
            maxWidth: '450px',
            lineHeight: 1.4,
          }}>
            &ldquo;{result.roast}&rdquo;
          </div>

          {/* Footer */}
          <div style={{
            position: 'absolute',
            bottom: '28px',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: '4px',
          }}>
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
            }}>
              <span style={{ fontSize: '24px' }}>🔥</span>
              <span style={{
                fontSize: '20px',
                fontWeight: 700,
                color: 'rgba(255,255,255,0.6)',
                letterSpacing: '0.5px',
              }}>
                financiallycooked.com
              </span>
            </div>
            <div style={{
              fontSize: '12px',
              color: 'rgba(255,255,255,0.3)',
            }}>
              Check your financial health
            </div>
          </div>
        </div>
      </div>
    );
  }
);

ShareCard.displayName = 'ShareCard';
