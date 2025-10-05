// src/components/Header.jsx
"use client";

import React, { useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion, useReducedMotion } from "framer-motion";
import { useTranslation } from "react-i18next";
import i18nConfig from "../../i18nConfig";
import LanguageChanger from "./LanguageChanger";
import s from "./Header.module.css";
import { MenuItem } from "@/interfaces/header";
import MorphingText from "@/components/eldoraui/morphingtext";


const texts = [
    "NeoScience 🪐",
  "NeoScience 🌏",
  "NeoScience 🪐",
  "NeoScience 🌐",
];


export function MorphingTextDemo({ className }: { className?: string }) {
  return (
    <span className={className}>
      <MorphingText texts={texts} />
    </span>
  );
}

/** Inline icons */
function ChevronDown({ className }) {
  return (
    <svg
      viewBox="0 0 24 24"
      className={className}
      aria-hidden="true"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="m6 9 6 6 6-6" />
    </svg>
  );
}

function MenuIcon({ className }) {
  return (
    <svg viewBox="0 0 24 24" className={className} aria-hidden="true">
      <path
        d="M3 6h18M3 12h18M3 18h18"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
      />
    </svg>
  );
}

function CloseIcon({ className }) {
  return (
    <svg viewBox="0 0 24 24" className={className} aria-hidden="true">
      <path
        d="M6 6l12 12M18 6L6 18"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
      />
    </svg>
  );
}

export default function Header() {
  const { t } = useTranslation();
  const pathname = usePathname();

  const [mounted, setMounted] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [activeDropdown, setActiveDropdown] = useState(null);
  const dropdownRef = useRef(null);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  const prefersReducedMotion = useReducedMotion();
  const enableMotion = mounted && !prefersReducedMotion;

  // Montado del cliente
  useEffect(() => {
    setMounted(true);
  }, []);

  // Get current locale from pathname
  const currentLocale = pathname.split("/")[1] || i18nConfig.defaultLocale;

  useEffect(() => {
    const onClick = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setActiveDropdown(null);
      }
    };
    const onKey = (e) => {
      if (e.key === "Escape") {
        setActiveDropdown(null);
        setMobileOpen(false);
      }
    };
    document.addEventListener("mousedown", onClick);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onClick);
      document.removeEventListener("keydown", onKey);
    };
  }, []);

  const isHoverCapable =
    typeof window !== "undefined" &&
    window.matchMedia &&
    window.matchMedia("(hover: hover) and (pointer: fine)").matches;

  const openDropdown = (key) => {
    if (timerRef.current) {
      clearTimeout(timerRef.current);
      timerRef.current = null;
    }
    setActiveDropdown(key);
  };
  const closeDropdown = () => {
    if (timerRef.current) {
      clearTimeout(timerRef.current);
    }
    timerRef.current = setTimeout(() => setActiveDropdown(null), 150);
  };
  const toggleDropdown = (key) =>
    setActiveDropdown((prev) => (prev === key ? null : key));

  const MENU: MenuItem[] = useMemo(
    () => [
      { key: "home", label: t("menu:home"), to: `/` },
      {
        key: "aboutProject",
        label: t("menu:aboutProject"),
        to: "",
        subitems: [
          { key: "story-telling", label: t("menu:storyTelling"), to: `/story-telling` },
          { key: "about-team", label: t("menu:aboutTeam"), to: `/about-team` },
        ],
      },
      {
        key: "learn",
        label: t("menu:learn"),
        to: "",
        subitems: [
          { key: "game", label: t("menu:game"), to: `/game` },
          { key: "quiz", label: t("menu:quiz"), to: `/quiz` },
        ],
      },
      {
        key: "simulation",
        label: t("menu:simulation"),
        to: "",
        subitems: [
           { key: "neo-pha", label: t("menu:neo-pha"), to: `/neo-pha` },
          { key: "impact-zone", label: t("menu:impact"), to: `/impact-zone` },
         
        ],
      },
      {
        key: "exploreData",
        label: t("menu:exploreData"),
        to: "",
        subitems: [
          { key: "newsOfWeek", label: t("menu:newsOfWeek"), to: `/newsOfWeek` },
          { key: "aiAssistant", label: t("menu:aiAssistant"), to: `/aiAssistant` },
        ],
      },
    ],
    [t]
  );

  const isParentActive = (item) =>
    item.subitems?.some((s) => pathname.startsWith(s.to)) ||
    pathname === item.to;

  return (
    <motion.header
      className={s.header}
      // En SSR no aplicamos transform → sin mismatch.
      initial={enableMotion ? { y: -100 } : false}
      animate={enableMotion ? { y: 0 } : undefined}
      transition={{ duration: 0.6 }}
    >
      <div className={s.inner}>
       <div className={s.brandLink}>
  <MorphingTextDemo className={s.brandText} />
</div>

        <button
          className={s.burger}
          aria-label={
            mobileOpen
              ? currentLocale.startsWith("es")
                ? "Cerrar menú"
                : "Close menu"
              : currentLocale.startsWith("es")
              ? "Abrir menú"
              : "Open menu"
          }
          aria-expanded={mobileOpen}
          aria-controls="main-nav"
          onClick={() => setMobileOpen((o) => !o)}
        >
          {mobileOpen ? (
            <CloseIcon className={s.burgerIcon} />
          ) : (
            <MenuIcon className={s.burgerIcon} />
          )}
        </button>

        <nav
          id="main-nav"
          className={`${s.nav} ${mobileOpen ? s.navOpen : ""}`}
          role="navigation"
          aria-label="Main"
          ref={dropdownRef}
        >
          {MENU.map((item) => {
            const hasSub = !!item.subitems?.length;
            const isOpen = activeDropdown === item.key;
            const hoverProps =
              isHoverCapable && hasSub
                ? {
                    onMouseEnter: () => openDropdown(item.key),
                    onMouseLeave: () => closeDropdown(),
                  }
                : {};

            return (
              <div key={item.key} className={s.item} {...hoverProps}>
                {hasSub ? (
                  <>
                    <button
                      className={`${s.btn} ${isParentActive(item) ? s.btnActive : ""}`}
                      aria-haspopup="menu"
                      aria-expanded={isOpen}
                      aria-controls={`${item.key}-menu`}
                      onClick={() => toggleDropdown(item.key)}
                      onKeyDown={(e) => {
                        if (e.key === "ArrowDown") setActiveDropdown(item.key);
                      }}
                    >
                      <span className={s.btnLabel}>{item.label}</span>
                      <ChevronDown className={`${s.chev} ${isOpen ? s.chevOpen : ""}`} />
                    </button>

                    {isOpen && (
                      <motion.div
                        id={`${item.key}-menu`}
                        role="menu"
                        className={s.dropdown}
                        initial={enableMotion ? { opacity: 0 } : false}
                        animate={enableMotion ? { opacity: 1 } : undefined}
                        exit={enableMotion ? { opacity: 0 } : undefined}
                        transition={{ duration: 0.14 }}
                        onMouseEnter={() => openDropdown(item.key)}
                        onMouseLeave={closeDropdown}
                      >
                        {item.subitems.map((sub) => {
                          const active = pathname === sub.to;
                          return (
                            <Link
                              key={sub.key}
                              href={sub.to}
                              role="menuitem"
                              className={`${s.dropBtn} ${active ? s.dropBtnActive : ""}`}
                              onClick={() => {
                                closeDropdown();
                                setMobileOpen(false);
                              }}
                            >
                              {sub.icon && (
                                <span className={s.dropIcon} aria-hidden="true">
                                  {sub.icon}
                                </span>
                              )}
                              <span>{sub.label}</span>
                            </Link>
                          );
                        })}
                      </motion.div>
                    )}
                  </>
                ) : (
                  <Link
                    href={item.to}
                    className={`${s.btn} ${pathname === item.to ? s.btnActive : ""}`}
                    onClick={() => setMobileOpen(false)}
                  >
                    {item.label}
                  </Link>
                )}
              </div>
            );
          })}
        </nav>

        <div className={s.auth}>
          <LanguageChanger />
        </div>
      </div>
    </motion.header>
  );
}
