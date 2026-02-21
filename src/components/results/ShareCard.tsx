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
  'raw': { name: 'RAW', emoji: '🥩', color: '#4ade80', bgColor: '#166534' },
  'medium-rare': { name: 'MEDIUM RARE', emoji: '🥩', color: '#84cc16', bgColor: '#3f6212' },
  'medium': { name: 'MEDIUM', emoji: '🍖', color: '#facc15', bgColor: '#854d0e' },
  'well-done': { name: 'WELL DONE', emoji: '🍖', color: '#fb923c', bgColor: '#9a3412' },
  'charcoal': { name: 'CHARCOAL', emoji: '🥓', color: '#f87171', bgColor: '#991b1b' },
  'ash': { name: 'CHARRED', emoji: '🖤', color: '#a1a1aa', bgColor: '#3f3f46' },
};

export const ShareCard = forwardRef<HTMLDivElement, ShareCardProps>(
  ({ result, avatarUrl, userCity }, ref) => {
    const tier = TIER_INFO[result.tier] || TIER_INFO['medium'];
    void userCity; // Not used in this design

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
            {/* Avatar */}
            <div style={{
              width: '100px',
              height: '100px',
              borderRadius: '20px',
              overflow: 'hidden',
              border: `3px solid ${tier.color}`,
              marginBottom: '8px',
            }}>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img 
                src={avatarUrl} 
                alt="" 
                style={{
                  width: '100%',
                  height: '100%',
                  objectFit: 'cover',
                  filter: `brightness(${1 - (result.score / 100) * 0.3}) sepia(${(result.score / 100) * 0.4})`,
                }}
              />
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

          {/* Roast */}
          <div style={{
            marginTop: '32px',
            fontSize: '18px',
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
            bottom: '32px',
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
          }}>
            <span style={{ fontSize: '24px' }}>🔥</span>
            <span style={{
              fontSize: '20px',
              fontWeight: 600,
              color: 'rgba(255,255,255,0.5)',
              letterSpacing: '0.5px',
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
