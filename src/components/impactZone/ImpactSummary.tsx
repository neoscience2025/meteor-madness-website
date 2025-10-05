"use client";

import React from "react";

/** Utilidades de formato */
const fmtInt = (n: unknown) =>
  typeof n === "number" && isFinite(n) ? n.toLocaleString() : "—";

const fmtNum = (n: unknown, d = 2) =>
  typeof n === "number" && isFinite(n) ? n.toFixed(d) : "—";

const fmtLen = (m?: number, d = 2) =>
  typeof m === "number" && isFinite(m)
    ? m >= 1000
      ? `${(m / 1000).toFixed(d)} km`
      : `${Math.round(m)} m`
    : "—";

const Section: React.FC<{ title: string; children: React.ReactNode }> = ({
  title,
  children,
}) => (
  <div className="rounded-xl bg-blue-950/40 border border-blue-900/60 p-4">
    <h3 className="text-sm font-semibold text-blue-100 tracking-wide mb-3">
      {title}
    </h3>
    {children}
  </div>
);

const Grid: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
    {children}
  </div>
);

const Row: React.FC<{ label: string; value?: React.ReactNode }> = ({
  label,
  value,
}) => (
  <div className="flex items-center justify-between rounded-lg bg-blue-900/30 px-3 py-2">
    <span className="text-[13px] text-blue-200/90">{label}</span>
    <span className="text-sm font-medium text-white">{value ?? "—"}</span>
  </div>
);

type Props = {
  /** Objeto devuelto por runImpactFromUI/retrieveImpactData */
  result: any | null;
};

const ImpactSummary: React.FC<Props> = ({ result }) => {
  if (!result) return null;

  const inputs = result.inputs ?? {};
  const energy = result.energy ?? {};
  const crater = result.crater ?? {};
  const blast = result.blastRadii_m ?? {};
  const thermal = result.thermalRadii_m ?? {};
  const seismic = result.seismic ?? {};
  const tsunami = result.tsunami ?? null;
  const curios = result.curiosities ?? {};
  const affected = result.affected ?? {};
  const casualties = result.casualties?.totals ?? null;

  return (
    <div className="mt-6 space-y-4">
      {/* Curiosities */}
      <Section title="Curiosities">
        <div className="rounded-lg bg-amber-500/10 border border-amber-500/30 p-3">
          <div className="text-sm font-semibold text-amber-300">
            {curios.headline ?? "—"}
          </div>
          <div className="text-[13px] text-amber-200/90 mt-1">
            {curios.detail ?? "—"}
          </div>
          {curios.periodicity && (
            <div className="text-[12px] text-amber-200/75 mt-2">
              Periodicity: {curios.periodicity}
            </div>
          )}
        </div>
      </Section>

      {/* Inputs */}
      <Section title="Inputs">
        <Grid>
          <Row label="Latitude" value={inputs.latitude} />
          <Row label="Longitude" value={inputs.longitude} />
          <Row label="Material" value={inputs.material ?? "—"} />
          <Row label="Density (kg/m³)" value={fmtInt(inputs.density)} />
          <Row label="Mode" value={inputs.mode ?? "—"} />
          <Row label="Burst altitude" value={fmtLen(inputs.burstAltitude_m, 0)} />
          <Row label="Impact on water?" value={String(inputs.isWater ?? false)} />
          {inputs.waterDepth != null && (
            <Row label="Water depth" value={fmtLen(inputs.waterDepth, 0)} />
          )}
        </Grid>
      </Section>

      {/* Energy */}
      <Section title="Energy & Kinematics">
        <Grid>
          <Row label="Energy (J)" value={fmtNum(energy.J, 0)} />
          <Row label="Energy (MT TNT)" value={fmtNum(energy.MT, 2)} />
          <Row label="Surface velocity (km/h)" value={fmtNum(energy.velocitySurface_kmh, 2)} />
        </Grid>
      </Section>

      {/* Crater */}
      <Section title="Crater">
        <Grid>
          <Row label="Formed" value={String(crater.formed ?? false)} />
          <Row label="Type" value={crater.type ?? "—"} />
          <Row label="Final diameter" value={fmtLen(crater.finalDiameter_m)} />
          <Row label="Depth" value={fmtLen(crater.depth_m)} />
          <Row label="Rim height" value={fmtLen(crater.rimHeight_m)} />
        </Grid>
      </Section>

      {/* Radii */}
      <Section title="Radii — Blast & Thermal">
        <Grid>
          <Row label="Severe blast (50 kPa)" value={fmtLen(blast.severe_50kPa)} />
          <Row label="Moderate blast (20 kPa)" value={fmtLen(blast.moderate_20kPa)} />
          <Row label="Light damage (5 kPa)" value={fmtLen(blast.windows_5kPa)} />
          <Row label="Ignition (≈1 MJ/m²)" value={fmtLen(thermal.ignition_1MJm2)} />
          <Row label="2nd-degree burns (0.25 MJ/m²)" value={fmtLen(thermal.burns2ndDeg_0_25MJm2)} />
        </Grid>
      </Section>

      {/* Seismic & Tsunami */}
      <Section title="Seismic & Tsunami">
        <Grid>
          <Row label="Seismic magnitude (Mw)" value={fmtNum(seismic.magnitude, 2)} />
          <Row label="Tsunami" value={tsunami ? "Yes" : "No"} />
          {tsunami && (
            <>
              {"cavityDepth_m" in tsunami && (
                <Row label="Cavity depth (m)" value={fmtInt(tsunami.cavityDepth_m)} />
              )}
              {"deepHeightAt50km_m" in tsunami && (
                <Row label="Deep-water height @50 km (m)" value={fmtNum(tsunami.deepHeightAt50km_m, 2)} />
              )}
            </>
          )}
        </Grid>
      </Section>

      {/* Affected */}
      <Section title="Affected Footprint">
        <Grid>
          <Row label="Reference radius" value={fmtLen(affected.radius_m)} />
          <Row label="Area" value={
            typeof affected.area_m2 === "number" ? `${(affected.area_m2 / 1e6).toFixed(2)} km²` : "—"
          } />
        </Grid>
      </Section>

      {/* Casualties */}
      <Section title="Casualties (Totals)">
        {casualties ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {"craterVaporized" in casualties && (
              <Row label="Crater vaporized" value={fmtInt(casualties.craterVaporized)} />
            )}
            {"fireballDeaths" in casualties && (
              <Row label="Fireball deaths" value={fmtInt(casualties.fireballDeaths)} />
            )}
            {"burns3rd" in casualties && (
              <Row label="3rd-degree burns" value={fmtInt(casualties.burns3rd)} />
            )}
            {"burns2nd" in casualties && (
              <Row label="2nd-degree burns" value={fmtInt(casualties.burns2nd)} />
            )}
            {"shockwaveDeaths" in casualties && (
              <Row label="Shockwave deaths" value={fmtInt(casualties.shockwaveDeaths)} />
            )}
            {"windDeaths" in casualties && (
              <Row label="Wind-related deaths" value={fmtInt(casualties.windDeaths)} />
            )}
            {"earthquakeDeaths" in casualties && (
              <Row label="Earthquake deaths" value={fmtInt(casualties.earthquakeDeaths)} />
            )}
          </div>
        ) : (
          <div className="text-sm text-blue-200/80">
            No casualties available (Lobster population data may have failed or was not requested).
          </div>
        )}
      </Section>
    </div>
  );
};

export default ImpactSummary;
