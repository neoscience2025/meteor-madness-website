// population.ts
// Consulta de poblaciones acumuladas por radios a la API Lobster.
// Mantiene axios, con reintento y normalización opcional en quien lo use.

import axios from "axios";

const LOBSTER_BASE = "https://lobster-app-bhpix.ondigitalocean.app";

/**
 * Pide a Lobster la población acumulada para cada radio especificado.
 * Retorna un array paralelo a `radiiMeters` o null si falla.
 *
 * Nota: No normaliza longitudes; quien la usa debe comprobar que
 * populations.length === radiiMeters.length (o normalizar).
 */
export async function fetchPopulations(
  lat: number,
  lng: number,
  radiiMeters: number[]
): Promise<number[] | null> {
  const params = new URLSearchParams();
  params.set("lat", String(lat));
  params.set("lng", String(lng));
  radiiMeters.forEach((r) => params.append("radii", Math.round(r).toString()));
  const url = `${LOBSTER_BASE}/?${params.toString()}`;

  const tryOnce = async (timeoutMs: number) => {
    try {
      const { data } = await axios.get(url, { timeout: timeoutMs });
      if (data && Array.isArray(data.populations)) {
        return data.populations.map((n: any) => Number(n) || 0);
      }
      // respuesta sin estructura esperada
      return null;
    } catch {
      return null;
    }
  };

  // intento rápido + intento más laxo
  const p1 = await tryOnce(20000);
  if (p1) return p1;
  return await tryOnce(30000);
}
