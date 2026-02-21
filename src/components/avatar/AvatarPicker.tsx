'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';

interface AvatarPickerProps {
  onComplete: (avatarUrl: string) => void;
}

const STYLES = [
  { id: 'style1', seed: 'Felix' },
  { id: 'style2', seed: 'Aneka' },
  { id: 'style3', seed: 'Jasper' },
  { id: 'style4', seed: 'Milo' },
  { id: 'style5', seed: 'Luna' },
  { id: 'style6', seed: 'Zara' },
  { id: 'style7', seed: 'Oscar' },
  { id: 'style8', seed: 'Ruby' },
  { id: 'style9', seed: 'Kai' },
  { id: 'style10', seed: 'Nina' },
  { id: 'style11', seed: 'Leo' },
  { id: 'style12', seed: 'Maya' },
];

const BACKGROUNDS = [
  { id: 'orange', color: 'ffdfbf', label: '🧡' },
  { id: 'pink', color: 'ffd5dc', label: '💗' },
  { id: 'purple', color: 'c0aede', label: '💜' },
  { id: 'blue', color: 'b6e3f4', label: '💙' },
  { id: 'lavender', color: 'd1d4f9', label: '💜' },
  { id: 'transparent', color: 'transparent', label: '⬜' },
];

export function AvatarPicker({ onComplete }: AvatarPickerProps) {
  const [selectedStyle, setSelectedStyle] = useState(STYLES[0]);
  const [selectedBg, setSelectedBg] = useState(BACKGROUNDS[0]);
  const [customSeed, setCustomSeed] = useState('');

  const buildAvatarUrl = (seed: string, bgColor: string) => {
    const bg = bgColor === 'transparent' ? 'transparent' : bgColor;
    return `https://api.dicebear.com/9.x/notionists/svg?seed=${encodeURIComponent(seed)}&backgroundColor=${bg}&radius=20&size=200`;
  };

  const currentSeed = customSeed || selectedStyle.seed;
  const avatarUrl = buildAvatarUrl(currentSeed, selectedBg.color);

  const handleRandomize = () => {
    const randomSeed = Math.random().toString(36).substring(7);
    setCustomSeed(randomSeed);
  };

  return (
    <div className="w-full max-w-2xl mx-auto space-y-8">
      {/* Header */}
      <div className="text-center">
        <h2 className="text-3xl font-bold mb-2">Create Your Character</h2>
        <p className="text-white/50">Pick your avatar — it&apos;s about to get roasted 🔥</p>
      </div>

      {/* Preview */}
      <div className="flex justify-center">
        <div className="relative">
          <div className="w-48 h-48 rounded-3xl overflow-hidden glass border-4 border-white/10">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img 
              src={avatarUrl} 
              alt="Your avatar" 
              className="w-full h-full object-cover"
            />
          </div>
          <button
            onClick={handleRandomize}
            className="absolute -bottom-2 -right-2 w-12 h-12 bg-gradient-to-r from-purple-500 to-pink-500 rounded-xl text-2xl hover:scale-110 transition-transform shadow-lg"
            title="Randomize"
          >
            🎲
          </button>
        </div>
      </div>

      {/* Style picker */}
      <div className="glass rounded-3xl p-6 space-y-4">
        <h3 className="text-lg font-bold text-center">Choose Your Look</h3>
        <div className="grid grid-cols-4 sm:grid-cols-6 gap-3">
          {STYLES.map((style) => {
            const url = buildAvatarUrl(style.seed, selectedBg.color);
            const isSelected = selectedStyle.id === style.id && !customSeed;
            return (
              <button
                key={style.id}
                onClick={() => {
                  setSelectedStyle(style);
                  setCustomSeed('');
                }}
                className={`aspect-square rounded-2xl overflow-hidden border-2 transition-all hover:scale-105 ${
                  isSelected ? 'border-orange-500 scale-105' : 'border-white/10'
                }`}
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={url} alt="" className="w-full h-full" />
              </button>
            );
          })}
        </div>
      </div>

      {/* Background picker */}
      <div className="glass rounded-3xl p-6 space-y-4">
        <h3 className="text-lg font-bold text-center">Background Color</h3>
        <div className="flex justify-center gap-3">
          {BACKGROUNDS.map((bg) => (
            <button
              key={bg.id}
              onClick={() => setSelectedBg(bg)}
              className={`w-12 h-12 rounded-xl flex items-center justify-center text-2xl transition-all hover:scale-110 ${
                selectedBg.id === bg.id 
                  ? 'ring-4 ring-orange-500 scale-110' 
                  : 'ring-2 ring-white/10'
              }`}
              style={{ 
                backgroundColor: bg.color === 'transparent' ? '#1a1a1a' : `#${bg.color}` 
              }}
            >
              {bg.color === 'transparent' && '⬜'}
            </button>
          ))}
        </div>
      </div>

      {/* Custom name input */}
      <div className="glass rounded-3xl p-6 space-y-4">
        <h3 className="text-lg font-bold text-center">Or Enter Your Name</h3>
        <p className="text-center text-white/50 text-sm">Type anything to generate a unique avatar</p>
        <input
          type="text"
          value={customSeed}
          onChange={(e) => setCustomSeed(e.target.value)}
          placeholder="Your name or nickname..."
          className="w-full h-14 px-6 rounded-2xl bg-white/5 border border-white/10 text-white text-center text-lg focus:border-orange-500 focus:outline-none"
        />
      </div>

      {/* Continue button */}
      <Button
        onClick={() => onComplete(avatarUrl)}
        className="w-full h-16 bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 text-white font-bold text-xl rounded-2xl"
      >
        Start Cooking 🔥
      </Button>
    </div>
  );
}
