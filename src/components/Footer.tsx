import s from "./Footer.module.css";
import { Facebook, Instagram, Linkedin, Twitter } from "lucide-react";

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
            <a className={`${solid} bg-[rgba(24,119,242,0.9)] hover:bg-[rgba(24,119,242,1)]`} href="https://facebook.com/..." target="_blank" rel="noreferrer">
              <Facebook className="w-5 h-5" strokeWidth={2.2} />
            </a>
            
            <a className={`${solid} bg-[rgba(29,161,242,0.9)] hover:bg-[rgba(29,161,242,1)]`} href="https://x.com/..." target="_blank" rel="noreferrer">
              <Twitter className="w-5 h-5" strokeWidth={2.2} />
            </a>
            
            <a className={`${solid} bg-[rgba(228,64,95,0.9)] hover:bg-[rgba(228,64,95,1)]`} href="https://instagram.com/..." target="_blank" rel="noreferrer">
              <Instagram className="w-5 h-5" strokeWidth={2.2} />
            </a>
            
            <a className={`${solid} bg-[rgba(0,119,181,0.9)] hover:bg-[rgba(0,119,181,1)]`} href="https://linkedin.com/..." target="_blank" rel="noreferrer">
              <Linkedin className="w-5 h-5" strokeWidth={2.2} />
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