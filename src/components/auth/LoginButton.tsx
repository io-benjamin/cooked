'use client';

import { createClient } from '@/lib/supabase/client';
import { Button } from '@/components/ui/button';

interface LoginButtonProps {
  provider: 'google' | 'apple' | 'github';
  className?: string;
}

const providerInfo = {
  google: { label: 'Google', icon: '🔵' },
  apple: { label: 'Apple', icon: '🍎' },
  github: { label: 'GitHub', icon: '🐙' },
};

export function LoginButton({ provider, className }: LoginButtonProps) {
  const handleLogin = async () => {
    const supabase = createClient();
    
    await supabase.auth.signInWithOAuth({
      provider,
      options: {
        redirectTo: `${window.location.origin}/auth/callback`,
      },
    });
  };

  const info = providerInfo[provider];

  return (
    <Button
      onClick={handleLogin}
      variant="outline"
      className={`flex items-center gap-2 ${className}`}
    >
      <span>{info.icon}</span>
      <span>Continue with {info.label}</span>
    </Button>
  );
}
