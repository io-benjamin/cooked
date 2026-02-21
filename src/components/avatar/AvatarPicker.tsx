'use client';

import { useState, useRef } from 'react';
import { Button } from '@/components/ui/button';

interface AvatarPickerProps {
  onComplete: (avatarUrl: string) => void;
}

export function AvatarPicker({ onComplete }: AvatarPickerProps) {
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = (file: File) => {
    if (!file.type.startsWith('image/')) {
      alert('Please upload an image file');
      return;
    }

    const reader = new FileReader();
    reader.onload = (e) => {
      const url = e.target?.result as string;
      setAvatarUrl(url);
    };
    reader.readAsDataURL(file);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files[0];
    if (file) handleFileSelect(file);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const openAvatartion = () => {
    window.open('https://www.avatartion.com/', '_blank', 'width=800,height=700');
  };

  return (
    <div className="w-full max-w-xl mx-auto space-y-8">
      {/* Header */}
      <div className="text-center">
        <h2 className="text-3xl font-bold mb-2">Create Your Character</h2>
        <p className="text-white/50">Make your Notion-style avatar, then watch it get roasted 🔥</p>
      </div>

      {!avatarUrl ? (
        <>
          {/* Step 1: Create avatar */}
          <div className="glass rounded-3xl p-8 text-center space-y-6">
            <div className="text-6xl">🎨</div>
            <div>
              <h3 className="text-xl font-bold mb-2">Step 1: Create Your Avatar</h3>
              <p className="text-white/50 text-sm mb-6">
                Click below to open Avatartion. Design your character, then download it.
              </p>
              <Button
                onClick={openAvatartion}
                className="bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white font-bold px-8 py-6 text-lg rounded-2xl"
              >
                Open Avatar Creator ↗
              </Button>
            </div>
          </div>

          {/* Step 2: Upload */}
          <div 
            className={`glass rounded-3xl p-8 text-center space-y-4 transition-all cursor-pointer border-2 border-dashed ${
              isDragging 
                ? 'border-orange-500 bg-orange-500/10' 
                : 'border-white/10 hover:border-white/30'
            }`}
            onClick={() => fileInputRef.current?.click()}
            onDrop={handleDrop}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
          >
            <div className="text-5xl">📤</div>
            <div>
              <h3 className="text-xl font-bold mb-2">Step 2: Upload Your Avatar</h3>
              <p className="text-white/50 text-sm">
                Drag and drop your avatar here, or click to browse
              </p>
            </div>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={(e) => {
                const file = e.target.files?.[0];
                if (file) handleFileSelect(file);
              }}
            />
          </div>

          {/* Or use sample */}
          <div className="text-center">
            <p className="text-white/30 text-sm mb-4">Don&apos;t have time? Use a sample:</p>
            <div className="flex justify-center gap-3">
              {[
                'https://www.avatartion.com/og.png',
                '/sample-avatar-1.png',
                '/sample-avatar-2.png',
              ].map((url, i) => (
                <button
                  key={i}
                  onClick={() => setAvatarUrl(url)}
                  className="w-16 h-16 rounded-xl bg-white/5 border border-white/10 hover:border-orange-500 transition-all overflow-hidden"
                >
                  <div className="w-full h-full bg-gradient-to-br from-orange-500/20 to-red-500/20 flex items-center justify-center text-2xl">
                    {['😎', '🤓', '😈'][i]}
                  </div>
                </button>
              ))}
            </div>
          </div>
        </>
      ) : (
        /* Preview */
        <div className="space-y-6">
          <div className="glass rounded-3xl p-8 text-center">
            <div className="relative inline-block">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img 
                src={avatarUrl} 
                alt="Your avatar" 
                className="w-48 h-48 rounded-2xl object-cover mx-auto"
              />
              <button
                onClick={() => setAvatarUrl(null)}
                className="absolute -top-2 -right-2 w-8 h-8 bg-red-500 rounded-full text-white text-sm hover:bg-red-600"
              >
                ✕
              </button>
            </div>
            <p className="text-white/50 mt-4">Looking good! Ready to get cooked?</p>
          </div>

          <div className="flex gap-4">
            <Button
              variant="outline"
              onClick={() => setAvatarUrl(null)}
              className="flex-1 h-14 bg-white/5 border-white/10 text-white rounded-2xl"
            >
              Change Avatar
            </Button>
            <Button
              onClick={() => onComplete(avatarUrl)}
              className="flex-1 h-14 bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 text-white font-bold text-lg rounded-2xl"
            >
              Start Cooking 🔥
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
