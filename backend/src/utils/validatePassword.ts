export const validatePassword = (password: string) => {
  if (password.length < 6 || !/\d/.test(password)) {
    throw new Error("Senha deve ter pelo menos 6 caracteres e um número");
  }
};