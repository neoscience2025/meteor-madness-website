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
            scale={[1.5, 1.5, 1.5]}
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
        <div className="flex flex-col justify-between h-full space-y-4 md:space-y-0">
            <div
                className={cn(
                    "grid relative overflow-hidden rounded-[15px] bg-black/50",
                    "h-56",
                    "place-content-center",
                    disabled && "opacity-50"
                )}
            >
                <Canvas
                    camera={{ position: [0, 0, 5], fov: 50 }}
                    className="w-full h-full"
                >
                    <ambientLight intensity={8} />
                    <directionalLight position={[10, 10, 5]} intensity={10} />
                    <directionalLight position={[-10, -10, -5]} intensity={8} />
                    <pointLight position={[0, 10, 0]} intensity={5} />
                    <pointLight position={[5, 0, 5]} intensity={4} />
                    <pointLight position={[-5, 0, 5]} intensity={4} />
                    <Suspense fallback={null}>
                        <MeteoriteModel modelPath={modelPath} />
                    </Suspense>
                    <OrbitControls enableZoom={false} enablePan={false} />
                </Canvas>
            </div>

            {/* Carousel Selector - Aligned to bottom */}
            <div className="flex items-end">
                <div className="flex items-center justify-center space-x-4 w-full">
                {/* Previous Button */}
                <button
                    type="button"
                    onClick={goToPrevious}
                    disabled={disabled}
                    className={cn(
                        "p-2 transition-all duration-200 flex items-center",
                        "disabled:opacity-50 disabled:cursor-not-allowed"
                    )}
                >
                    <TbChevronLeft className="w-10 h-10 text-white hover:text-blue-900 active:text-blue-900 transition-colors duration-200" />
                </button>

                {/* Meteorite Info - Centered between controls */}
                <div className="text-center w-40 min-w-40">
                    <h3 className="text-lg font-semibold text-neutral-200 mb-1">
                        {METEORITE_OPTIONS[selectedMeteorite]?.name?.charAt(0).toUpperCase() + METEORITE_OPTIONS[selectedMeteorite]?.name?.slice(1) || selectedMeteorite}
                    </h3>
                    <p className="text-sm text-neutral-400">
                        Density: {METEORITE_OPTIONS[selectedMeteorite]?.density.toLocaleString()} kg/m³
                    </p>
                </div>

                {/* Next Button */}
                <button
                    type="button"
                    onClick={goToNext}
                    disabled={disabled}
                    className={cn(
                        "p-2 transition-all duration-200 flex items-center",
                        "disabled:opacity-50 disabled:cursor-not-allowed"
                    )}
                >
                    <TbChevronRight className="w-10 h-10 text-white hover:text-blue-900 active:text-blue-900 transition-colors duration-200" />
                </button>
                </div>
            </div>
        </div>
    );
};

MeteoriteSelector.displayName = 'MeteoriteSelector';