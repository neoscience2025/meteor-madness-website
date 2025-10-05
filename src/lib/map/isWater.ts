// isWater.ts
// Resolver "is water?" SIEMPRE desde la API de Lobster.
// Mantiene axios para Node/Browser.

import axios from "axios";

const LOBSTER_BASE = "https://lobster-app-bhpix.ondigitalocean.app";

/**
 * Devuelve true/false si la lat/lon está sobre agua.
 * Si no puede resolver (timeout/red), retorna null.
 */
export async function fetchIsWater(lat: number, lng: number): Promise<boolean | null> {
  try {
    const url = `${LOBSTER_BASE}/is-water?lat=${encodeURIComponent(lat)}&lng=${encodeURIComponent(lng)}`;
    const { data } = await axios.get(url, { timeout: 10_000 });
    if (typeof data?.isWater === "boolean") return data.isWater;
    if (typeof data === "boolean") return data;
    return null;
  } catch {
    return null;
  }
}
