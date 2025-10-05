"use client";

import { cn } from "@/lib/utils";
import { Canvas } from "@react-three/fiber";
import { OrbitControls, useGLTF } from "@react-three/drei";
import { Suspense, useState } from "react";
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
            scale={[2, 2, 2]}
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

    const handleMeteoriteChange = (meteorite: MeteoriteName) => {
        if (disabled) return;
        setSelectedMeteorite(meteorite);
        onChange?.(meteorite);
    };

    const modelPath = `/models/meteorites/${selectedMeteorite}.glb`;

    return (
        <div className="space-y-4">
            <div
                className={cn(
                    "gird relative h-40 place-content-center overflow-hidden rounded-[15px] border-white bg-white/70 dark:border-neutral-950 dark:bg-black/50",
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

            <div className="space-y-2">
                <div className="text-center">
                    <span className="text-sm font-medium text-neutral-300">
                        Selected: {METEORITE_OPTIONS[selectedMeteorite]?.name || selectedMeteorite}
                    </span>
                </div>

                <div className="grid grid-cols-5 gap-2">
                    {Object.keys(METEORITE_OPTIONS).map((meteorite) => {
                        const meteoriteName = meteorite as MeteoriteName;
                        const isSelected = selectedMeteorite === meteoriteName;

                        return (
                            <button
                                key={meteorite}
                                onClick={() => handleMeteoriteChange(meteoriteName)}
                                disabled={disabled}
                                className={cn(
                                    "px-3 py-2 text-xs rounded-md border transition-colors",
                                    "hover:bg-neutral-100 dark:hover:bg-neutral-800",
                                    "disabled:opacity-50 disabled:cursor-not-allowed",
                                    isSelected
                                        ? "bg-blue-600 text-white border-blue-600"
                                        : "bg-neutral-50 dark:bg-neutral-900 border-neutral-300 dark:border-neutral-600 text-neutral-700 dark:text-neutral-300"
                                )}
                            >
                                {meteorite}
                            </button>
                        );
                    })}
                </div>
            </div>
        </div>
    );
};

MeteoriteSelector.displayName = 'MeteoriteSelector';