// utils/jwtDecodeHelper.ts
import { jwtDecode } from "jwt-decode";

export function decodeToken<T>(token: string): T | null {
  try {
    return jwtDecode<T>(token);
  } catch (error) {
    console.error("Erro ao decodificar o token:", error);
    return null;
  }
}
