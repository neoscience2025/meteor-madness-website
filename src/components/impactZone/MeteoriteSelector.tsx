import { cn } from "@/lib/utils";

export const MeteoriteSelector = ({

}) => {


    return <div>
        <div
            className={cn(
                "gird relative h-40 place-content-center overflow-hidden rounded-[15px] border-white bg-white/70 dark:border-neutral-950 dark:bg-black/50",
            )}
        >
            //here goes the meteorite model with Three.js
        // The meteorite options are in src/lib/map/meteorites.ts
        // The glb assets for Three.js are in public/models/meteorites
        // to select the meteorite model use the meteo
        </div>
        //here goes the controls to change METEORITE_OPTIONS name
    </div>
}