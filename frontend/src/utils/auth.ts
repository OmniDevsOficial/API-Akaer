function getDecodedToken(): Record<string, string> | null {
  const token = localStorage.getItem("token") || sessionStorage.getItem("token");
  if (!token) return null;
  try {
    const payload = token.split(".")[1];
    return JSON.parse(atob(payload));
  } catch (error) {
    console.error("Erro ao decodificar token:", error);
    return null;
  }
}

export function getUserRole(): string | null {
  return getDecodedToken()?.role ?? null;
}

export function getUserName(): string | null {
  return getDecodedToken()?.nome ?? getDecodedToken()?.name ?? null;
}

export function getUserEmail(): string | null {
  return getDecodedToken()?.email ?? null;
}

export function getUserCargo(): string | null {
  return getDecodedToken()?.cargo ?? null;
}

export function getUserTelefone(): string | null {
  return getDecodedToken()?.telefone ?? null;
}

export function getUserNivelAcesso(): string | null {
  return getDecodedToken()?.nivelAcesso ?? null;
}

export function clearAuth(): void {
  localStorage.removeItem("token");
  sessionStorage.removeItem("token");
  localStorage.removeItem("userRole");
}

/** @deprecated use clearAuth() */
export function handleLogout(): void {
  clearAuth();
}