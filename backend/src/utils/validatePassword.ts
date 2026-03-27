export const validatePassword = (password: string) => {

  if (password.length < 6) {
    throw new Error("Senha deve ter pelo menos 6 caracteres");
}
  if (!/\d/.test(password)) {
    throw new Error("Senha deve conter pelo menos um número");
}
}