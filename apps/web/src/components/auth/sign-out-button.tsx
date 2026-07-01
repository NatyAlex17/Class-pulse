'use client';

import * as React from 'react';
import { useRouter } from 'next/navigation';
import { IconLogout } from '@tabler/icons-react';
import { useAuth } from '@/components/auth/auth-provider';

type SignOutButtonProps = {
  className?: string;
  onBeforeSignOut?: () => void;
};

export function SignOutButton({ className, onBeforeSignOut }: SignOutButtonProps) {
  const router = useRouter();
  const { signOut } = useAuth();
  const [isSigningOut, setIsSigningOut] = React.useState(false);

  const handleSignOut = React.useCallback(async () => {
    setIsSigningOut(true);

    try {
      onBeforeSignOut?.();
      await signOut();
      router.replace('/login');
    } finally {
      setIsSigningOut(false);
    }
  }, [onBeforeSignOut, router, signOut]);

  return (
    <button type="button" onClick={() => void handleSignOut()} disabled={isSigningOut} className={className}>
      <IconLogout className="size-4" />
      <span>{isSigningOut ? 'Signing out...' : 'Logout'}</span>
    </button>
  );
}
