import { useMutation } from '@tanstack/react-query';
import { AuthService } from '../services/auth.service';

export const useLoginMutation = () => {
  return useMutation({
    mutationFn: AuthService.login,
  });
};

export const useRegisterMutation = () => {
  return useMutation({
    mutationFn: AuthService.register,
  });
};

export const useResetPasswordMutation = () => {
  return useMutation({
    mutationFn: AuthService.requestPasswordReset,
  });
};

export const useLogoutMutation = () => {
  return useMutation({
    mutationFn: AuthService.logout,
  });
}
