"use client";

import { cn } from "@/lib/utils";
import { Canvas } from "@react-three/fiber";
import { OrbitControls, useGLTF } from "@react-three/drei";
import { Suspense, useState, useEffect } from "react";
import { TbChevronLeft, TbChevronRight } from "react-icons/tb";
import { METEORITE_OPTIONS } from "@/lib/map/meteorites";
import { MeteoriteName } from "@/interfaces/meteorites";

interface MeteoriteModelProps {
    modelPath: string;
}

function MeteoriteModel({ modelPath }: MeteoriteModelProps) {
    const { scene } = useGLTF(modelPath);
    return (
        <primitive
            object={scene}
            scale={[0.8, 0.8, 0.8]}
            position={[0, 0, 0]}
            rotation={[0, 0, 0]}
        />
    );
}

interface MeteoriteSelectorProps {
    value?: MeteoriteName;
    onChange?: (value: MeteoriteName) => void;
    disabled?: boolean;
}

export const MeteoriteSelector = ({
    value = 'stone',
    onChange,
    disabled = false
}: MeteoriteSelectorProps) => {
    const [selectedMeteorite, setSelectedMeteorite] = useState<MeteoriteName>(value);
    const meteoriteNames = Object.keys(METEORITE_OPTIONS) as MeteoriteName[];
    const currentIndex = meteoriteNames.indexOf(selectedMeteorite);

    // Sync internal state with prop changes
    useEffect(() => {
        setSelectedMeteorite(value);
    }, [value]);

    const handleMeteoriteChange = (meteorite: MeteoriteName) => {
        if (disabled) return;
        setSelectedMeteorite(meteorite);
        onChange?.(meteorite);
    };

    const goToPrevious = () => {
        if (disabled) return;
        const prevIndex = currentIndex > 0 ? currentIndex - 1 : meteoriteNames.length - 1;
        const prevMeteorite = meteoriteNames[prevIndex];
        handleMeteoriteChange(prevMeteorite);
    };

    const goToNext = () => {
        if (disabled) return;
        const nextIndex = currentIndex < meteoriteNames.length - 1 ? currentIndex + 1 : 0;
        const nextMeteorite = meteoriteNames[nextIndex];
        handleMeteoriteChange(nextMeteorite);
    };

    const modelPath = `/models/meteorites/${selectedMeteorite}.glb`;

    return (
        <div className="space-y-6">
            {/* 3D Model Display - Responsive height */}
            <div
                className={cn(
                    "grid relative overflow-hidden rounded-[15px] bg-white/70 dark:bg-black/50",
                    "h-48 md:h-64 lg:h-80", // Responsive height
                    "place-content-center",
                    disabled && "opacity-50"
                )}
            >
                <Canvas
                    camera={{ position: [0, 0, 5], fov: 50 }}
                    className="w-full h-full"
                >
                    <ambientLight intensity={0.5} />
                    <directionalLight position={[10, 10, 5]} intensity={1} />
                    <Suspense fallback={null}>
                        <MeteoriteModel modelPath={modelPath} />
                    </Suspense>
                    <OrbitControls enableZoom={false} enablePan={false} />
                </Canvas>
            </div>

            {/* Carousel Selector */}
            <div className="space-y-4">
                <div className="text-center">
                    <h3 className="text-lg font-semibold text-neutral-200 mb-1">
                        {METEORITE_OPTIONS[selectedMeteorite]?.name?.charAt(0).toUpperCase() + METEORITE_OPTIONS[selectedMeteorite]?.name?.slice(1) || selectedMeteorite}
                    </h3>
                    <p className="text-sm text-neutral-400">
                        Density: {METEORITE_OPTIONS[selectedMeteorite]?.density.toLocaleString()} kg/m³
                    </p>
                </div>

                <div className="flex items-center justify-center space-x-4">
                    {/* Previous Button */}
                    <button
                        onClick={goToPrevious}
                        disabled={disabled}
                        className={cn(
                            "flex items-center justify-center w-12 h-12 rounded-full transition-all duration-200",
                            "bg-neutral-100 dark:bg-neutral-800 border border-neutral-300 dark:border-neutral-600",
                            "hover:bg-neutral-200 dark:hover:bg-neutral-700 hover:scale-105",
                            "disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100",
                            "shadow-lg hover:shadow-xl"
                        )}
                    >
                        <TbChevronLeft className="w-6 h-6 text-neutral-600 dark:text-neutral-400" />
                    </button>

                    {/* Meteorite Indicators */}
                    <div className="flex space-x-2">
                        {meteoriteNames.map((meteorite, index) => (
                            <button
                                key={meteorite}
                                onClick={() => handleMeteoriteChange(meteorite)}
                                disabled={disabled}
                                className={cn(
                                    "w-3 h-3 rounded-full transition-all duration-200",
                                    "border-2",
                                    index === currentIndex
                                        ? "bg-blue-600 border-blue-600 scale-125"
                                        : "bg-neutral-300 dark:bg-neutral-600 border-neutral-400 dark:border-neutral-500 hover:bg-neutral-400 dark:hover:bg-neutral-500",
                                    "disabled:opacity-50 disabled:cursor-not-allowed"
                                )}
                                title={meteorite}
                            />
                        ))}
                    </div>

                    {/* Next Button */}
                    <button
                        onClick={goToNext}
                        disabled={disabled}
                        className={cn(
                            "flex items-center justify-center w-12 h-12 rounded-full transition-all duration-200",
                            "bg-neutral-100 dark:bg-neutral-800 border border-neutral-300 dark:border-neutral-600",
                            "hover:bg-neutral-200 dark:hover:bg-neutral-700 hover:scale-105",
                            "disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100",
                            "shadow-lg hover:shadow-xl"
                        )}
                    >
                        <TbChevronRight className="w-6 h-6 text-neutral-600 dark:text-neutral-400" />
                    </button>
                </div>
            </div>
        </div>
    );
};

MeteoriteSelector.displayName = 'MeteoriteSelector';