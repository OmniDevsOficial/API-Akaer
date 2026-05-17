import { useState } from "react";

export function useRecolher(initialState = false) {
  const [recolher, setRecolher] = useState(initialState);
  const alternar = () => setRecolher(!recolher);
  return { recolher, alternar };
}