import s from "./Footer.module.css";
import { Github } from "lucide-react";
import NasaLogo from "./NasaLogo";

const solid =
  "p-3 rounded-full bg-white/5 text-white/80 hover:text-white " +
  "hover:shadow-[0_0_18px_rgba(107,127,215,0.8)] hover:bg-[#FFE87C]/20 " +
  "transition-all duration-300";


export default function Footer({t}) {

  return (
    <footer className={s.footer}>
      <div className="container mx-auto px-4 py-6 flex flex-col items-center justify-center gap-6">

        <div className="flex flex-col items-center gap-4">
          <span className="text-white/80 text-sm">{t("footer:share")}</span>

          <div className="flex items-center gap-3">
            <a className={`${solid} bg-[rgba(36,41,46,0.9)] hover:bg-[rgba(36,41,46,1)]`} href="https://github.com/neoscience2025" target="_blank" rel="noreferrer">
              <Github className="w-5 h-5" strokeWidth={2.2} />
            </a>
            
            <a className={`${solid} bg-[rgba(252,61,57,0.9)] hover:bg-[rgba(252,61,57,1)]`} href="https://www.spaceappschallenge.org/2025/find-a-team/neoscience/?tab=members" target="_blank" rel="noreferrer">
              <NasaLogo className="w-5 h-5" />
            </a>
          </div>
        </div>

        <div className="text-sm italic text-gray-400 text-center">
          {t("footer:terms")}
        </div>
      </div>
    </footer>
  );
}