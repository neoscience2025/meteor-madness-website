"use client";

import { useForm, Controller } from "react-hook-form";
import { useState, forwardRef, useImperativeHandle } from "react";
import { TbRuler2, TbGauge, TbAngle } from "react-icons/tb";
import { useTranslation } from "react-i18next";

// 👇 Ajusta estas rutas si tu alias @ no apunta a src/
import { formatDistance, convertKmsToMs } from "@/lib/map/utils";
import { runImpactFromUI } from "@/lib/map/retrieveImpactData";

// Si quieres tipar estricto, puedes importar MaterialType de tu lib:
// import { MaterialType } from "@/lib/impactForm";

import { MeteoriteSelector } from "./MeteoriteSelector";
import { MeteoriteName } from "@/interfaces/meteorites";

const LaunchAsteroidButton = ({
  onClick,
  isLoading = false,
  text = "Launch Asteroid",
  disabled = false,
}: {
  onClick: () => void;
  isLoading?: boolean;
  text?: string;
  disabled?: boolean;
}) => {
  const { t } = useTranslation();

  return (
    <button
      onClick={onClick}
      disabled={isLoading || disabled}
      className="group/button relative inline-flex h-[calc(48px+8px)] items-center justify-center rounded-full bg-blue-950 py-1 pl-6 pr-14 font-medium text-neutral-50 disabled:opacity-50 disabled:cursor-not-allowed"
    >
      <span className="z-10 pr-2">
        {isLoading ? t("impactZone:form.launching") : text}
      </span>
      <div className="absolute right-1 inline-flex h-12 w-12 items-center justify-end rounded-full bg-blue-900 transition-[width] group-hover/button:w-[calc(100%-8px)] group-disabled/button:hover:w-12">
        <div className="mr-3.5 flex items-center justify-center">
          {isLoading ? (
            <div className="animate-spin h-5 w-5 border-2 border-neutral-50 border-t-transparent rounded-full" />
          ) : (
            <svg
              width="15"
              height="15"
              viewBox="0 0 15 15"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
              className="h-5 w-5 text-neutral-50"
            >
              <path
                d="M8.14645 3.14645C8.34171 2.95118 8.65829 2.95118 8.85355 3.14645L12.8536 7.14645C13.0488 7.34171 13.0488 7.65829 12.8536 7.85355L8.85355 11.8536C8.65829 12.0488 8.34171 12.0488 8.14645 11.8536C7.95118 11.6583 7.95118 11.3417 8.14645 11.1464L11.2929 8H2.5C2.22386 8 2 7.77614 2 7.5C2 7.22386 2.22386 7 2.5 7H11.2929L8.14645 3.85355C7.95118 3.65829 7.95118 3.34171 8.14645 3.14645Z"
                fill="currentColor"
                fillRule="evenodd"
                clipRule="evenodd"
              />
            </svg>
          )}
        </div>
      </div>
    </button>
  );
};

const SliderField = ({
  icon: Icon,
  label,
  value,
  onChange,
  min,
  max,
  step = 1,
  formatValue,
  disabled = false,
}: {
  icon: any;
  label: string;
  value: number;
  onChange: (v: number) => void;
  min: number;
  max: number;
  step?: number;
  formatValue?: (v: number) => string;
  disabled?: boolean;
}) => {
  return (
    <div className="space-y-3">
      <div className="flex items-center space-x-3">
        <Icon className="w-5 h-5 text-neutral-400" />
        <div className="flex-1 flex justify-between items-center">
          <span className="text-sm font-medium text-neutral-300">{label}</span>
          <span className="text-sm text-neutral-400">
            {formatValue ? formatValue(value) : value}
          </span>
        </div>
      </div>
      <div className="relative">
        <input
          type="range"
          min={min}
          max={max}
          step={step}
          value={value}
          onChange={(e) => onChange(parseFloat(e.target.value))}
          disabled={disabled}
          className={`w-full h-2 bg-neutral-700 rounded-lg appearance-none slider ${
            disabled ? "cursor-not-allowed opacity-50" : "cursor-pointer"
          }`}
        />
        <style jsx>{`
          .slider::-webkit-slider-thumb {
            appearance: none;
            height: 18px;
            width: 18px;
            border-radius: 50%;
            background: #3b82f6;
            cursor: pointer;
            box-shadow: 0 0 2px 0 rgba(0, 0, 0, 0.2);
          }
          .slider::-moz-range-thumb {
            height: 18px;
            width: 18px;
            border-radius: 50%;
            background: #3b82f6;
            cursor: pointer;
            border: none;
            box-shadow: 0 0 2px 0 rgba(0, 0, 0, 0.2);
          }
        `}</style>
      </div>
    </div>
  );
};

export interface ImpactFormRef {
  reset: () => void;
}

type FormValues = {
  diameter: number;      // m
  speed: number;         // km/s (slider UI)
  impactAngle: number;   // degrees (slider UI)
  meteoriteType: string; // UI codes: 'stone' | 'iron' | 'stony-iron' | 'gold' | 'comet' | 'carbon'
};

// Mapeo UI -> MaterialType del motor
function uiMeteoriteToMaterial(ui: string): string {
  const k = ui.toLowerCase();
  if (k === "stone" || k === "stony") return "stony";
  if (k === "iron") return "iron";
  if (k === "stony-iron" || k === "stonyiron") return "stony-iron";
  if (k === "gold") return "gold";
  if (k === "comet" || k === "cometary") return "cometary";
  if (k === "carbon" || k === "carbonaceous") return "carbonaceous";
  // default razonable
  return "stony";
}

export const ImpactForm = forwardRef<
  ImpactFormRef,
  {
    latitude: number;
    longitude: number;
    onImpactResult?: (result: any) => void;
    onNewLaunch?: () => void;
    buttonText?: string;
    isReadyForNew?: boolean;
    disabled?: boolean;
    inputsDisabled?: boolean;
  }
>(
  (
    {
      latitude,
      longitude,
      onImpactResult,
      onNewLaunch,
      buttonText,
      isReadyForNew = false,
      disabled = false,
      inputsDisabled = false,
    },
    ref
  ) => {
    const { t } = useTranslation();
    const { control, handleSubmit, reset } = useForm<FormValues>({
      defaultValues: {
        diameter: 100,    // m
        speed: 17,        // km/s
        impactAngle: 45,  // deg
        meteoriteType: "stone",
      },
    });

    const [isLoading, setIsLoading] = useState(false);

    useImperativeHandle(ref, () => ({
      reset: () => {
        reset();
        setIsLoading(false);
      },
    }));

    const onSubmit = async (data: FormValues) => {
      if (isReadyForNew && onNewLaunch) {
        onNewLaunch();
        return;
      }
      setIsLoading(true);

      try {
        const result = await runImpactFromUI({
          lat: latitude,
          lng: longitude,
          material: uiMeteoriteToMaterial(data.meteoriteType) as any,
          diameter: data.diameter,
          speed: convertKmsToMs(data.speed), // km/s -> m/s
          angleDeg: data.impactAngle,        // la UI entrega grados; el helper espera grados
        });

        // Log en JSON para depurar
        console.log("result json:\n" + JSON.stringify(result, null, 2));

        if (onImpactResult) onImpactResult(result);
      } catch (error) {
        console.error("Impact calculation failed:", error);
      } finally {
        setIsLoading(false);
      }
    };

    return (
      <div className="p-6">
        <form
          onSubmit={handleSubmit(onSubmit)}
          className="space-y-8 md:space-y-0 md:grid md:grid-cols-2 md:gap-6 md:h-full"
        >
          {/* Left column: Meteorite selector */}
          <div className="space-y-6">
            <Controller
              name="meteoriteType"
              control={control}
              render={({ field }) => (
                <MeteoriteSelector
                  value={field.value as MeteoriteName}
                  onChange={field.onChange}
                  disabled={inputsDisabled}
                />
              )}
            />
          </div>

          {/* Right column: sliders + button */}
          <div className="space-y-6">
            <Controller
              name="diameter"
              control={control}
              render={({ field }) => (
                <SliderField
                  icon={TbRuler2}
                  label={t("impactZone:form.diameter")}
                  value={field.value}
                  onChange={field.onChange}
                  min={1}
                  max={1500}
                  step={1}
                  formatValue={formatDistance}
                  disabled={inputsDisabled}
                />
              )}
            />

            <Controller
              name="speed"
              control={control}
              render={({ field }) => (
                <SliderField
                  icon={TbGauge}
                  label={t("impactZone:form.speed")}
                  value={field.value}
                  onChange={field.onChange}
                  min={1}
                  max={100}
                  step={0.1}
                  formatValue={(value) => `${value} km/s`}
                  disabled={inputsDisabled}
                />
              )}
            />

            <Controller
              name="impactAngle"
              control={control}
              render={({ field }) => (
                <SliderField
                  icon={TbAngle}
                  label={t("impactZone:form.impactAngle")}
                  value={field.value}
                  onChange={field.onChange}
                  min={5}
                  max={90}
                  step={1}
                  formatValue={(value) => `${value}°`}
                  disabled={inputsDisabled}
                />
              )}
            />

            <div className="pt-6 md:pt-0 flex justify-center md:justify-end md:items-end">
              <LaunchAsteroidButton
                onClick={handleSubmit(onSubmit)}
                isLoading={isLoading}
                text={buttonText ? t(`impactZone:${buttonText}`) : t("impactZone:form.launchAsteroid")}
                disabled={disabled}
              />
            </div>
          </div>
        </form>
      </div>
    );
  }
);

ImpactForm.displayName = "ImpactForm";
