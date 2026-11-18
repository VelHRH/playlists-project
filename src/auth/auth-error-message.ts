const messages: Record<string, string> = {
  USER_ALREADY_EXISTS: "Користувач з таким email уже існує. Спробуйте увійти.",
  USER_ALREADY_EXISTS_USE_ANOTHER_EMAIL:
    "Користувач з таким email уже існує. Спробуйте увійти.",
  INVALID_EMAIL_OR_PASSWORD: "Неправильний email або пароль.",
  INVALID_EMAIL: "Некоректний email.",
  PASSWORD_TOO_SHORT: "Пароль має містити щонайменше 8 символів.",
  PASSWORD_TOO_LONG: "Пароль має містити не більше 128 символів.",
};

export function authErrorMessage(error: { code?: string; status?: number }) {
  if (error.status === 429) {
    return "Забагато спроб. Зачекайте трохи й спробуйте знову.";
  }
  return (error.code && messages[error.code]) ?? "Щось пішло не так. Спробуйте ще раз.";
}
