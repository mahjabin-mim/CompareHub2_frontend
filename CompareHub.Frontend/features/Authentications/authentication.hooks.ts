'use client';

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useCallback, useSyncExternalStore } from 'react';
import { authStore } from './auth-store';
import { authenticationService } from './authentication.services';

export const useAuth = () => {
  const { user, token } = useSyncExternalStore(authStore.subscribe, authStore.getSnapshot, authStore.getServerSnapshot);
  const queryClient = useQueryClient();

  const signOut = useCallback(() => {
    authStore.signOut();
    // Nothing from the previous account may linger in memory.
    queryClient.clear();
  }, [queryClient]);

  return { user, token, isSignedIn: user !== null, signOut };
};

export const useRegister = () =>
  useMutation({
    mutationFn: authenticationService.register,
    onSuccess: authStore.signIn
  });

export const useLogin = () =>
  useMutation({
    mutationFn: authenticationService.login,
    onSuccess: authStore.signIn
  });

export const useGoogleLogin = () =>
  useMutation({
    mutationFn: authenticationService.loginWithGoogle,
    onSuccess: authStore.signIn
  });

// The server says whether Google sign-in is set up, so the button only shows when it will work.
export const useAuthConfig = () =>
  useQuery({
    queryKey: ['auth-config'],
    queryFn: authenticationService.getConfig,
    staleTime: Infinity,
    retry: 1
  });

export const useAccountSettings = (enabled: boolean) =>
  useQuery({
    queryKey: ['account-settings'],
    queryFn: authenticationService.getSettings,
    enabled
  });

export const useUpdateAccountSettings = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: authenticationService.updateSettings,
    onSuccess: (settings) => queryClient.setQueryData(['account-settings'], settings)
  });
};
