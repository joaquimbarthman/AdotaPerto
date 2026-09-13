type AuthError = {
  code?: string;
  message?: string;
  status?: number;
};

const messages: Record<string, string> = {
  INVALID_EMAIL_OR_PASSWORD: "E-mail ou senha incorretos.",
  INVALID_EMAIL: "Informe um endereço de e-mail válido.",
  INVALID_PASSWORD: "A senha informada é inválida.",
  PASSWORD_TOO_SHORT: "A senha deve ter pelo menos 8 caracteres.",
  PASSWORD_TOO_LONG: "A senha ultrapassa o tamanho máximo permitido.",
  USER_ALREADY_EXISTS: "Já existe uma conta com este e-mail.",
  USER_ALREADY_EXISTS_USE_ANOTHER_EMAIL:
    "Este e-mail já está cadastrado. Use outro endereço.",
  EMAIL_NOT_VERIFIED: "Confirme seu e-mail antes de entrar.",
  SESSION_EXPIRED: "Sua sessão expirou. Entre novamente.",
  CREDENTIAL_ACCOUNT_NOT_FOUND: "E-mail ou senha incorretos.",
  TOO_MANY_REQUESTS: "Muitas tentativas. Aguarde um pouco e tente novamente.",
  INVALID_OTP: "O código informado é inválido.",
  OTP_EXPIRED: "O código expirou. Solicite um novo código.",
};

export function authErrorMessage(error: unknown, fallback: string) {
  if (!error || typeof error !== "object") return fallback;
  const { code, message, status } = error as AuthError;

  if (code && messages[code]) return messages[code];
  if (status === 429) return messages.TOO_MANY_REQUESTS;

  const normalized = message?.trim().toLowerCase() || "";
  if (/invalid email or password|incorrect email or password|user not found/.test(normalized)) {
    return messages.INVALID_EMAIL_OR_PASSWORD;
  }
  if (/invalid email|email is invalid/.test(normalized)) return messages.INVALID_EMAIL;
  if (/invalid password|incorrect password/.test(normalized)) return messages.INVALID_PASSWORD;
  if (/password.*too short|at least 8/.test(normalized)) return messages.PASSWORD_TOO_SHORT;
  if (/already exists|already registered/.test(normalized)) return messages.USER_ALREADY_EXISTS;
  if (/email.*not verified/.test(normalized)) return messages.EMAIL_NOT_VERIFIED;
  if (/invalid otp|invalid code/.test(normalized)) return messages.INVALID_OTP;
  if (/otp expired|code expired/.test(normalized)) return messages.OTP_EXPIRED;

  return fallback;
}
