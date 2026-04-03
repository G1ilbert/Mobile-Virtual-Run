import { useEffect, useState } from 'react';
import { useRouter, useSegments, useRootNavigationState } from 'expo-router';
import { useAuth } from '../contexts/AuthContext';

/**
 * Auth guard hook for protected non-tab screens.
 * Redirects to /login if not authenticated.
 * Waits for navigation to be ready before redirecting (prevents "navigate before mount" crash).
 */
export function useAuthGuard() {
  const { isAuthenticated, loading } = useAuth();
  const router = useRouter();
  const segments = useSegments();
  const navigationState = useRootNavigationState();

  useEffect(() => {
    // Don't navigate until the root layout is mounted
    if (!navigationState?.key) return;
    if (loading) return;

    if (!isAuthenticated) {
      const currentPath = '/' + segments.join('/');
      router.replace({
        pathname: '/login',
        params: { redirect: currentPath },
      });
    }
  }, [loading, isAuthenticated, navigationState?.key]);

  return {
    isReady: !loading && isAuthenticated,
    loading,
  };
}

/**
 * Auth check for tab screens — doesn't redirect, just returns auth state.
 */
export function useAuthCheck() {
  const { isAuthenticated, loading } = useAuth();
  return { isAuthenticated, loading };
}
