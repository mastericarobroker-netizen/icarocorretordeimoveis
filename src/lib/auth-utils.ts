export interface AuthOutcome {
  success: boolean;
  requiresEmailConfirmation: boolean;
  message?: string;
}

export interface PasswordValidationResult {
  valid: boolean;
  message?: string;
}

export function validatePassword(password: string): PasswordValidationResult {
  const trimmed = password.trim();

  if (trimmed.length < 8) {
    return {
      valid: false,
      message: 'A senha deve ter pelo menos 8 caracteres.',
    };
  }

  if (!/[A-Z]/.test(trimmed)) {
    return {
      valid: false,
      message: 'Adicione pelo menos uma letra maiúscula.',
    };
  }

  if (!/[a-z]/.test(trimmed)) {
    return {
      valid: false,
      message: 'Adicione pelo menos uma letra minúscula.',
    };
  }

  if (!/\d/.test(trimmed)) {
    return {
      valid: false,
      message: 'Adicione pelo menos um número.',
    };
  }

  if (!/[!@#$%^&*()_+\-=[\]{};':"\\|,.<>/?]/.test(trimmed)) {
    return {
      valid: false,
      message: 'Adicione pelo menos um símbolo especial.',
    };
  }

  return { valid: true };
}

export function getAuthErrorMessage(error: unknown, fallback: string): string {
  if (!error || typeof error !== 'object') {
    return fallback;
  }

  const message = (error as { message?: string }).message ?? '';

  if (/weak_password|weak password|known to be weak/i.test(message)) {
    return 'A senha é muito fraca para o Supabase. Use ao menos 8 caracteres, incluindo maiúscula, minúscula, número e símbolo.';
  }

  if (/invalid login credentials|invalid_credentials|email or password/i.test(message)) {
    return 'E-mail ou senha incorretos. Verifique os dados e tente novamente.';
  }

  if (/already registered|already exists|user already/i.test(message)) {
    return 'Este e-mail já está cadastrado. Tente entrar com a senha correta ou recupere o acesso.';
  }

  return fallback;
}

export function resolveAuthOutcome({
  user,
  session,
  error,
}: {
  user?: { id?: string } | null;
  session?: unknown;
  error: unknown;
}): AuthOutcome {
  if (error) {
    return {
      success: false,
      requiresEmailConfirmation: false,
      message: getAuthErrorMessage(error, 'Não foi possível concluir a autenticação.'),
    };
  }

  if (session) {
    return {
      success: true,
      requiresEmailConfirmation: false,
    };
  }

  if (user?.id) {
    return {
      success: false,
      requiresEmailConfirmation: true,
    };
  }

  return {
    success: false,
    requiresEmailConfirmation: false,
  };
}
