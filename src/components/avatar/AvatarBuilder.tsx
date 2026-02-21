'use client';

import { useState } from 'react';

export interface AvatarConfig {
  skinTone: string;
  hairStyle: string;
  hairColor: string;
  eyes: string;
  mouth: string;
  accessory: string;
}

const OPTIONS = {
  skinTone: [
    { id: 'light', color: '#FFDBB4' },
    { id: 'medium-light', color: '#EDB98A' },
    { id: 'medium', color: '#D08B5B' },
    { id: 'medium-dark', color: '#AE5D29' },
    { id: 'dark', color: '#614335' },
  ],
  hairStyle: [
    { id: 'none', label: '🦲' },
    { id: 'short', label: '💇' },
    { id: 'curly', label: '🦱' },
    { id: 'long', label: '💇‍♀️' },
    { id: 'mohawk', label: '🧑‍🎤' },
    { id: 'cap', label: '🧢' },
  ],
  hairColor: [
    { id: 'black', color: '#1a1a1a' },
    { id: 'brown', color: '#4a3728' },
    { id: 'blonde', color: '#d4a853' },
    { id: 'red', color: '#8b3a3a' },
    { id: 'blue', color: '#3b82f6' },
    { id: 'pink', color: '#ec4899' },
  ],
  eyes: [
    { id: 'normal', label: '👀' },
    { id: 'happy', label: '😊' },
    { id: 'cool', label: '😎' },
    { id: 'sleepy', label: '😴' },
    { id: 'wink', label: '😉' },
    { id: 'hearts', label: '😍' },
  ],
  accessory: [
    { id: 'none', label: '❌' },
    { id: 'glasses', label: '👓' },
    { id: 'earring', label: '💎' },
    { id: 'chain', label: '📿' },
    { id: 'headphones', label: '🎧' },
    { id: 'mask', label: '😷' },
  ],
};

interface AvatarBuilderProps {
  onComplete: (config: AvatarConfig) => void;
}

export function AvatarBuilder({ onComplete }: AvatarBuilderProps) {
  const [config, setConfig] = useState<AvatarConfig>({
    skinTone: 'medium',
    hairStyle: 'short',
    hairColor: 'black',
    eyes: 'normal',
    mouth: 'smile',
    accessory: 'none',
  });

  const [step, setStep] = useState(0);
  const steps = ['skinTone', 'hairStyle', 'hairColor', 'eyes', 'accessory'] as const;
  const stepLabels = ['Skin Tone', 'Hair Style', 'Hair Color', 'Eyes', 'Accessory'];

  const currentStep = steps[step];

  const handleSelect = (value: string) => {
    setConfig(prev => ({ ...prev, [currentStep]: value }));
  };

  const handleNext = () => {
    if (step < steps.length - 1) {
      setStep(step + 1);
    } else {
      onComplete(config);
    }
  };

  return (
    <div className="w-full max-w-xl mx-auto">
      {/* Progress */}
      <div className="flex justify-center gap-2 mb-8">
        {steps.map((_, i) => (
          <div
            key={i}
            className={`h-2 w-12 rounded-full transition-all ${
              i <= step ? 'bg-orange-500' : 'bg-white/10'
            }`}
          />
        ))}
      </div>

      {/* Preview */}
      <div className="flex justify-center mb-8">
        <AvatarPreview config={config} size={200} burnLevel={0} />
      </div>

      {/* Current step */}
      <div className="glass rounded-3xl p-6">
        <h3 className="text-xl font-bold text-center mb-6">{stepLabels[step]}</h3>

        {currentStep === 'skinTone' && (
          <div className="flex justify-center gap-3">
            {OPTIONS.skinTone.map(opt => (
              <button
                key={opt.id}
                onClick={() => handleSelect(opt.id)}
                className={`w-14 h-14 rounded-full transition-all ${
                  config.skinTone === opt.id ? 'ring-4 ring-orange-500 scale-110' : 'hover:scale-105'
                }`}
                style={{ backgroundColor: opt.color }}
              />
            ))}
          </div>
        )}

        {currentStep === 'hairStyle' && (
          <div className="flex justify-center gap-3 flex-wrap">
            {OPTIONS.hairStyle.map(opt => (
              <button
                key={opt.id}
                onClick={() => handleSelect(opt.id)}
                className={`w-14 h-14 rounded-2xl bg-white/5 text-3xl transition-all ${
                  config.hairStyle === opt.id ? 'ring-4 ring-orange-500 scale-110 bg-white/10' : 'hover:scale-105 hover:bg-white/10'
                }`}
              >
                {opt.label}
              </button>
            ))}
          </div>
        )}

        {currentStep === 'hairColor' && (
          <div className="flex justify-center gap-3">
            {OPTIONS.hairColor.map(opt => (
              <button
                key={opt.id}
                onClick={() => handleSelect(opt.id)}
                className={`w-14 h-14 rounded-full transition-all ${
                  config.hairColor === opt.id ? 'ring-4 ring-orange-500 scale-110' : 'hover:scale-105'
                }`}
                style={{ backgroundColor: opt.color }}
              />
            ))}
          </div>
        )}

        {currentStep === 'eyes' && (
          <div className="flex justify-center gap-3 flex-wrap">
            {OPTIONS.eyes.map(opt => (
              <button
                key={opt.id}
                onClick={() => handleSelect(opt.id)}
                className={`w-14 h-14 rounded-2xl bg-white/5 text-3xl transition-all ${
                  config.eyes === opt.id ? 'ring-4 ring-orange-500 scale-110 bg-white/10' : 'hover:scale-105 hover:bg-white/10'
                }`}
              >
                {opt.label}
              </button>
            ))}
          </div>
        )}

        {currentStep === 'accessory' && (
          <div className="flex justify-center gap-3 flex-wrap">
            {OPTIONS.accessory.map(opt => (
              <button
                key={opt.id}
                onClick={() => handleSelect(opt.id)}
                className={`w-14 h-14 rounded-2xl bg-white/5 text-3xl transition-all ${
                  config.accessory === opt.id ? 'ring-4 ring-orange-500 scale-110 bg-white/10' : 'hover:scale-105 hover:bg-white/10'
                }`}
              >
                {opt.label}
              </button>
            ))}
          </div>
        )}

        {/* Navigation */}
        <div className="flex justify-between mt-8">
          <button
            onClick={() => setStep(s => Math.max(0, s - 1))}
            disabled={step === 0}
            className="px-6 py-3 text-white/50 hover:text-white disabled:opacity-30"
          >
            ← Back
          </button>
          <button
            onClick={handleNext}
            className="px-8 py-3 bg-gradient-to-r from-orange-500 to-red-500 rounded-xl font-bold"
          >
            {step === steps.length - 1 ? 'Start Cooking 🔥' : 'Next →'}
          </button>
        </div>
      </div>
    </div>
  );
}

// Avatar preview component - used in builder and results
interface AvatarPreviewProps {
  config: AvatarConfig;
  size: number;
  burnLevel: number; // 0-100
}

export function AvatarPreview({ config, size, burnLevel }: AvatarPreviewProps) {
  const skinColors: Record<string, string> = {
    'light': '#FFDBB4',
    'medium-light': '#EDB98A',
    'medium': '#D08B5B',
    'medium-dark': '#AE5D29',
    'dark': '#614335',
  };

  const hairColors: Record<string, string> = {
    'black': '#1a1a1a',
    'brown': '#4a3728',
    'blonde': '#d4a853',
    'red': '#8b3a3a',
    'blue': '#3b82f6',
    'pink': '#ec4899',
  };

  // Calculate burn effects
  const burnOverlay = burnLevel / 100;
  const charLevel = Math.max(0, (burnLevel - 60) / 40); // Starts charring at 60%

  // Eye expression based on burn level
  const getEyeExpression = () => {
    if (burnLevel > 80) return '💀';
    if (burnLevel > 60) return '😵';
    if (burnLevel > 40) return '😰';
    if (burnLevel > 20) return '😅';
    return config.eyes === 'cool' ? '😎' : config.eyes === 'happy' ? '😊' : '🙂';
  };

  return (
    <div 
      className="relative"
      style={{ width: size, height: size }}
    >
      {/* Base face */}
      <svg viewBox="0 0 100 100" className="w-full h-full">
        {/* Head */}
        <ellipse
          cx="50"
          cy="50"
          rx="40"
          ry="45"
          fill={skinColors[config.skinTone]}
          style={{
            filter: `brightness(${1 - burnOverlay * 0.5}) saturate(${1 - charLevel * 0.8})`,
          }}
        />

        {/* Burn overlay */}
        {burnLevel > 30 && (
          <ellipse
            cx="50"
            cy="50"
            rx="40"
            ry="45"
            fill={`rgba(139, 69, 19, ${burnOverlay * 0.6})`}
            style={{ mixBlendMode: 'multiply' }}
          />
        )}

        {/* Char marks */}
        {burnLevel > 60 && (
          <>
            <ellipse cx="35" cy="40" rx="5" ry="3" fill={`rgba(0,0,0,${charLevel * 0.5})`} />
            <ellipse cx="65" cy="55" rx="4" ry="2" fill={`rgba(0,0,0,${charLevel * 0.4})`} />
            <ellipse cx="50" cy="70" rx="6" ry="2" fill={`rgba(0,0,0,${charLevel * 0.3})`} />
          </>
        )}

        {/* Hair */}
        {config.hairStyle !== 'none' && config.hairStyle !== 'cap' && (
          <path
            d={
              config.hairStyle === 'short'
                ? 'M20 35 Q50 5 80 35 Q75 25 50 20 Q25 25 20 35'
                : config.hairStyle === 'curly'
                ? 'M15 40 Q20 10 50 5 Q80 10 85 40 Q80 20 50 15 Q20 20 15 40'
                : config.hairStyle === 'long'
                ? 'M15 50 Q20 10 50 5 Q80 10 85 50 L85 80 Q50 85 15 80 Z'
                : config.hairStyle === 'mohawk'
                ? 'M40 5 Q50 -10 60 5 L55 30 Q50 35 45 30 Z'
                : ''
            }
            fill={hairColors[config.hairColor]}
            style={{
              filter: burnLevel > 50 ? `brightness(${1 - charLevel * 0.7})` : undefined,
            }}
          />
        )}

        {/* Cap */}
        {config.hairStyle === 'cap' && (
          <>
            <ellipse cx="50" cy="25" rx="42" ry="20" fill={hairColors[config.hairColor]} />
            <rect x="10" y="20" width="80" height="10" fill={hairColors[config.hairColor]} />
            <rect x="70" y="22" width="25" height="6" fill={hairColors[config.hairColor]} rx="2" />
          </>
        )}

        {/* Accessory */}
        {config.accessory === 'glasses' && (
          <>
            <circle cx="35" cy="45" r="10" fill="none" stroke="#333" strokeWidth="2" />
            <circle cx="65" cy="45" r="10" fill="none" stroke="#333" strokeWidth="2" />
            <line x1="45" y1="45" x2="55" y2="45" stroke="#333" strokeWidth="2" />
          </>
        )}

        {config.accessory === 'headphones' && (
          <>
            <path d="M15 45 Q15 20 50 15 Q85 20 85 45" fill="none" stroke="#333" strokeWidth="4" />
            <rect x="10" y="40" width="12" height="18" rx="4" fill="#333" />
            <rect x="78" y="40" width="12" height="18" rx="4" fill="#333" />
          </>
        )}

        {config.accessory === 'chain' && (
          <path d="M30 85 Q50 95 70 85" fill="none" stroke="#ffd700" strokeWidth="3" />
        )}

        {config.accessory === 'earring' && (
          <circle cx="15" cy="55" r="4" fill="#ffd700" />
        )}
      </svg>

      {/* Expression overlay */}
      <div 
        className="absolute inset-0 flex items-center justify-center"
        style={{ fontSize: size * 0.4 }}
      >
        {getEyeExpression()}
      </div>

      {/* Smoke effect for high burn */}
      {burnLevel > 70 && (
        <div className="absolute -top-4 left-1/2 -translate-x-1/2 text-3xl animate-float opacity-60">
          💨
        </div>
      )}

      {/* Sweat for medium burn */}
      {burnLevel > 30 && burnLevel < 80 && (
        <div 
          className="absolute top-2 -right-2 text-xl animate-bounce"
          style={{ animationDelay: '0.3s' }}
        >
          💧
        </div>
      )}
    </div>
  );
}
