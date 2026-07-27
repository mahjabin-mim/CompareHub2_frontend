'use client';

import { useMutation } from '@tanstack/react-query';
import { authenticationService } from './authentication.services';

export const useRegister = () => {
  return useMutation({
    mutationFn: authenticationService.register,
    onSuccess: (data) => {
      localStorage.setItem('comparehub_token', data.token);
      localStorage.setItem('comparehub_email', data.email);
    }
  });
};

export const useLogin = () => {
  return useMutation({
    mutationFn: authenticationService.login,
    onSuccess: (data) => {
      localStorage.setItem('comparehub_token', data.token);
      localStorage.setItem('comparehub_email', data.email);
    }
  });
};
