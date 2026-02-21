import { ImageResponse } from '@vercel/og';
import { NextRequest } from 'next/server';

export const runtime = 'edge';

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  
  const score = searchParams.get('score') || '69';
  const tier = searchParams.get('tier') || 'medium';
  const emoji = searchParams.get('emoji') || '🔥';
  const roast = searchParams.get('roast') || "You're cooking, but not in a good way";

  const tierColors: Record<string, { text: string; glow: string }> = {
    'raw': { text: '#4ade80', glow: '#22c55e' },
    'medium-rare': { text: '#a3e635', glow: '#84cc16' },
    'medium': { text: '#facc15', glow: '#eab308' },
    'well-done': { text: '#fb923c', glow: '#f97316' },
    'charcoal': { text: '#f87171', glow: '#ef4444' },
    'ash': { text: '#9ca3af', glow: '#6b7280' },
  };

  const tierLabels: Record<string, string> = {
    'raw': 'RAW',
    'medium-rare': 'MEDIUM RARE', 
    'medium': 'MEDIUM',
    'well-done': 'WELL DONE',
    'charcoal': 'CHARCOAL',
    'ash': 'ASH',
  };

  const colors = tierColors[tier] || tierColors['medium'];
  const label = tierLabels[tier] || 'COOKED';

  return new ImageResponse(
    (
      <div
        style={{
          width: '1200px',
          height: '630px',
          background: 'linear-gradient(135deg, #0f0f0f 0%, #1a1a1a 50%, #0a0a0a 100%)',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          fontFamily: 'system-ui, -apple-system, sans-serif',
          position: 'relative',
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
            width: '500px',
            height: '500px',
            background: colors.glow,
            filter: 'blur(150px)',
            opacity: 0.3,
            borderRadius: '50%',
          }}
        />

        {/* Main content */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '60px', position: 'relative' }}>
          {/* Left - Emoji */}
          <div style={{ fontSize: '180px' }}>
            {emoji}
          </div>

          {/* Right - Score */}
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start' }}>
            <div
              style={{
                fontSize: '180px',
                fontWeight: 900,
                color: colors.text,
                lineHeight: 1,
                textShadow: `0 0 80px ${colors.glow}60`,
              }}
            >
              {score}%
            </div>
            <div
              style={{
                fontSize: '48px',
                fontWeight: 700,
                color: 'rgba(255,255,255,0.7)',
                marginTop: '8px',
                textTransform: 'uppercase',
                letterSpacing: '8px',
              }}
            >
              {label}
            </div>
          </div>
        </div>

        {/* Roast */}
        <div
          style={{
            fontSize: '24px',
            color: 'rgba(255,255,255,0.5)',
            marginTop: '40px',
            maxWidth: '800px',
            textAlign: 'center',
            fontStyle: 'italic',
            position: 'relative',
          }}
        >
          "{roast}"
        </div>

        {/* Footer */}
        <div
          style={{
            position: 'absolute',
            bottom: '40px',
            display: 'flex',
            alignItems: 'center',
            gap: '12px',
          }}
        >
          <span style={{ fontSize: '36px' }}>🔥</span>
          <span
            style={{
              fontSize: '28px',
              fontWeight: 700,
              color: 'rgba(255,255,255,0.4)',
              letterSpacing: '2px',
            }}
          >
            amicooked.com
          </span>
        </div>
      </div>
    ),
    {
      width: 1200,
      height: 630,
    }
  );
}
