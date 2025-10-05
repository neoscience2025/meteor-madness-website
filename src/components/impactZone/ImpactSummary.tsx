"use client";

import React from "react";
import { useTranslation } from "react-i18next";

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

const Section: React.FC<{ 
  title: string; 
  children: React.ReactNode; 
  explanation?: string;
}> = ({ title, children, explanation }) => (
  <div className="rounded-xl bg-blue-950/40 border border-blue-900/60 p-4">
    <h3 className="text-sm font-semibold text-blue-100 tracking-wide mb-2">
      {title}
    </h3>
    {explanation && (
      <p className="text-xs text-blue-200/80 mb-3 leading-relaxed">
        {explanation}
      </p>
    )}
    {children}
  </div>
);

const Grid: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
    {children}
  </div>
);

const Row: React.FC<{ 
  label: string; 
  value?: React.ReactNode; 
  description?: string;
}> = ({ label, value, description }) => (
  <div className="rounded-lg bg-blue-900/30 px-3 py-2">
    <div className="flex items-center justify-between">
      <span className="text-[13px] text-blue-200/90">{label}</span>
      <span className="text-sm font-medium text-white">{value ?? "—"}</span>
    </div>
    {description && (
      <p className="text-xs text-blue-300/70 mt-1 leading-tight">
        {description}
      </p>
    )}
  </div>
);

type Props = {
  /** Objeto devuelto por runImpactFromUI/retrieveImpactData */
  result: any | null;
};

const ImpactSummary: React.FC<Props> = ({ result }) => {
  const { t } = useTranslation();
  
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
      {/* Overview/Curiosities */}
      <Section title={t("impactSummary:sections.overview")}>
        <div className="rounded-lg bg-amber-500/10 border border-amber-500/30 p-3">
          <div className="text-sm font-semibold text-amber-300">
            {curios.headline ?? t("impactSummary:noData")}
          </div>
          <div className="text-[13px] text-amber-200/90 mt-1">
            {curios.detail ?? t("impactSummary:noData")}
          </div>
          {curios.periodicity && (
            <div className="text-[12px] text-amber-200/75 mt-2">
              <strong>{t("impactSummary:periodicity")}:</strong> {curios.periodicity}
            </div>
          )}
        </div>
      </Section>

      {/* Energy */}
      <Section 
        title={t("impactSummary:sections.energy")}
        explanation={t("impactSummary:explanations.energyExplainer")}
      >
        <Grid>
          <Row 
            label={t("impactSummary:labels.energyJoules")} 
            value={fmtNum(energy.J, 0)} 
          />
          <Row 
            label={t("impactSummary:labels.energyMT")} 
            value={fmtNum(energy.MT, 2)} 
          />
          <Row 
            label={t("impactSummary:labels.surfaceVelocity")} 
            value={fmtNum(energy.velocitySurface_kmh, 2)} 
          />
        </Grid>
      </Section>

      {/* Crater */}
      {crater.formed && (
        <Section 
          title={t("impactSummary:sections.crater")}
          explanation={t("impactSummary:explanations.craterExplainer")}
        >
          <Grid>
            <Row 
              label={t("impactSummary:labels.craterFormed")} 
              value={crater.formed ? t("impactSummary:yes") : t("impactSummary:no")} 
            />
            <Row 
              label={t("impactSummary:labels.craterType")} 
              value={crater.type ?? t("impactSummary:noData")} 
            />
            <Row 
              label={t("impactSummary:labels.finalDiameter")} 
              value={fmtLen(crater.finalDiameter_m)} 
            />
            <Row 
              label={t("impactSummary:labels.depth")} 
              value={fmtLen(crater.depth_m)} 
            />
            <Row 
              label={t("impactSummary:labels.rimHeight")} 
              value={fmtLen(crater.rimHeight_m)} 
            />
          </Grid>
        </Section>
      )}

      {/* Blast & Thermal Effects */}
      <Section 
        title={t("impactSummary:sections.effects")}
        explanation={t("impactSummary:explanations.blastExplainer")}
      >
        <Grid>
          <Row 
            label={t("impactSummary:labels.severeBlast")} 
            value={fmtLen(blast.severe_50kPa)}
            description={t("impactSummary:descriptions.severeBlast")}
          />
          <Row 
            label={t("impactSummary:labels.moderateBlast")} 
            value={fmtLen(blast.moderate_20kPa)}
            description={t("impactSummary:descriptions.moderateBlast")}
          />
          <Row 
            label={t("impactSummary:labels.lightDamage")} 
            value={fmtLen(blast.windows_5kPa)}
            description={t("impactSummary:descriptions.lightDamage")}
          />
          <Row 
            label={t("impactSummary:labels.ignition")} 
            value={fmtLen(thermal.ignition_1MJm2)}
            description={t("impactSummary:descriptions.ignition")}
          />
          <Row 
            label={t("impactSummary:labels.burns2nd")} 
            value={fmtLen(thermal.burns2ndDeg_0_25MJm2)}
            description={t("impactSummary:descriptions.burns2nd")}
          />
        </Grid>
      </Section>

      {/* Seismic & Tsunami */}
      <Section 
        title={t("impactSummary:sections.seismic")}
        explanation={t("impactSummary:explanations.seismicExplainer")}
      >
        <Grid>
          <Row 
            label={t("impactSummary:labels.seismicMagnitude")} 
            value={fmtNum(seismic.magnitude, 2)} 
          />
          <Row 
            label={t("impactSummary:labels.tsunami")} 
            value={tsunami ? t("impactSummary:yes") : t("impactSummary:no")} 
          />
          {tsunami && (
            <>
              {"cavityDepth_m" in tsunami && (
                <Row 
                  label={t("impactSummary:labels.cavityDepth")} 
                  value={fmtInt(tsunami.cavityDepth_m)} 
                />
              )}
              {"deepHeightAt50km_m" in tsunami && (
                <Row 
                  label={t("impactSummary:labels.tsunamiHeight")} 
                  value={fmtNum(tsunami.deepHeightAt50km_m, 2)} 
                />
              )}
            </>
          )}
        </Grid>
      </Section>

      {/* Affected Area */}
      <Section title={t("impactSummary:sections.affected")}>
        <Grid>
          <Row 
            label={t("impactSummary:labels.referenceRadius")} 
            value={fmtLen(affected.radius_m)} 
          />
          <Row 
            label={t("impactSummary:labels.affectedArea")} 
            value={
              typeof affected.area_m2 === "number" ? `${(affected.area_m2 / 1e6).toFixed(2)} km²` : t("impactSummary:noData")
            } 
          />
        </Grid>
      </Section>

      {/* Casualties */}
      <Section 
        title={t("impactSummary:sections.casualties")}
        explanation={t("impactSummary:explanations.casualtiesExplainer")}
      >
        {casualties ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {"craterVaporized" in casualties && casualties.craterVaporized > 0 && (
              <Row 
                label={t("impactSummary:labels.craterVaporized")} 
                value={fmtInt(casualties.craterVaporized)}
                description={t("impactSummary:descriptions.craterVaporized")}
              />
            )}
            {"fireballDeaths" in casualties && casualties.fireballDeaths > 0 && (
              <Row 
                label={t("impactSummary:labels.fireballDeaths")} 
                value={fmtInt(casualties.fireballDeaths)}
                description={t("impactSummary:descriptions.fireballDeaths")}
              />
            )}
            {"burns3rd" in casualties && casualties.burns3rd > 0 && (
              <Row 
                label={t("impactSummary:labels.burns3rd")} 
                value={fmtInt(casualties.burns3rd)}
                description={t("impactSummary:descriptions.burns3rd")}
              />
            )}
            {"burns2nd" in casualties && casualties.burns2nd > 0 && (
              <Row 
                label={t("impactSummary:labels.burns2nd")} 
                value={fmtInt(casualties.burns2nd)}
                description={t("impactSummary:descriptions.burns2ndDesc")}
              />
            )}
            {"shockwaveDeaths" in casualties && casualties.shockwaveDeaths > 0 && (
              <Row 
                label={t("impactSummary:labels.shockwaveDeaths")} 
                value={fmtInt(casualties.shockwaveDeaths)}
                description={t("impactSummary:descriptions.shockwaveDeaths")}
              />
            )}
            {"windDeaths" in casualties && casualties.windDeaths > 0 && (
              <Row 
                label={t("impactSummary:labels.windDeaths")} 
                value={fmtInt(casualties.windDeaths)}
                description={t("impactSummary:descriptions.windDeaths")}
              />
            )}
            {"earthquakeDeaths" in casualties && casualties.earthquakeDeaths > 0 && (
              <Row 
                label={t("impactSummary:labels.earthquakeDeaths")} 
                value={fmtInt(casualties.earthquakeDeaths)}
                description={t("impactSummary:descriptions.earthquakeDeaths")}
              />
            )}
          </div>
        ) : (
          <div className="text-sm text-blue-200/80">
            {t("impactSummary:noCasualties")}
          </div>
        )}
      </Section>

      {/* Technical Details */}
      <Section title={t("impactSummary:sections.details")}>
        <Grid>
          <Row label={t("impactSummary:labels.latitude")} value={inputs.latitude} />
          <Row label={t("impactSummary:labels.longitude")} value={inputs.longitude} />
          <Row label={t("impactSummary:labels.material")} value={inputs.material ?? t("impactSummary:noData")} />
          <Row label={t("impactSummary:labels.density")} value={fmtInt(inputs.density)} />
          <Row label={t("impactSummary:labels.mode")} value={inputs.mode ?? t("impactSummary:noData")} />
          <Row label={t("impactSummary:labels.burstAltitude")} value={fmtLen(inputs.burstAltitude_m, 0)} />
          <Row label={t("impactSummary:labels.impactOnWater")} value={inputs.isWater ? t("impactSummary:yes") : t("impactSummary:no")} />
          {inputs.waterDepth != null && (
            <Row label={t("impactSummary:labels.waterDepth")} value={fmtLen(inputs.waterDepth, 0)} />
          )}
        </Grid>
      </Section>
    </div>
  );
};

export default ImpactSummary;
