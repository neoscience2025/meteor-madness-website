'use client';

import { useRouter } from 'next/navigation';
import { usePathname } from 'next/navigation';
import { useTranslation } from 'react-i18next';
import { useState, useRef, useEffect } from 'react';
import { motion } from 'framer-motion';
import i18nConfig from '../../i18nConfig';
import styles from './LanguageChanger.module.css';
import Image from 'next/image';

export default function LanguageChanger() {
  const { i18n } = useTranslation();
  const currentLocale = i18n.language;
  const router = useRouter();
  const currentPathname = usePathname();
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef(null);

  const languages = [
    { code: 'en', name: 'EN', flag: 'https://flagcdn.com/w20/us.png' },
    { code: 'es', name: 'ES', flag: 'https://flagcdn.com/w20/es.png' },
    { code: 'qu', name: 'QU', flag: 'https://flagcdn.com/w20/ec.png' }
  ];

  const currentLanguage = languages.find(lang => lang.code === currentLocale) || languages[0];

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleLanguageChange = (newLocale) => {
    setIsOpen(false);

    // set cookie for next-i18n-router
    const days = 30;
    const date = new Date();
    date.setTime(date.getTime() + days * 24 * 60 * 60 * 1000);
    const expires = date.toUTCString();
    document.cookie = `NEXT_LOCALE=${newLocale};expires=${expires};path=/`;

    // redirect to the new locale path
    if (
      currentLocale === i18nConfig.defaultLocale &&
      !i18nConfig.prefixDefault
    ) {
      router.push('/' + newLocale + currentPathname);
    } else {
      router.push(
        currentPathname.replace(`/${currentLocale}`, `/${newLocale}`)
      );
    }

    router.refresh();
  };

  return (
    <div className={styles.languageChanger} ref={dropdownRef}>
      <button
        className={styles.triggerButton}
        onClick={() => setIsOpen(!isOpen)}
        aria-expanded={isOpen}
        aria-haspopup="menu"
      >
        <Image
          src={currentLanguage.flag}
          alt={currentLanguage.name}
          className={styles.flagIcon}
          width={20}
          height={30}
        />
        <span>{currentLanguage.name}</span>
        <svg
          className={`${styles.chevron} ${isOpen ? styles.chevronOpen : ''}`}
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <path d="m6 9 6 6 6-6" />
        </svg>
      </button>

      {isOpen && (
        <motion.div
          className={styles.dropdown}
          role="menu"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.14 }}
        >
          {languages.map((language) => (
            <button
              key={language.code}
              role="menuitem"
              className={`${styles.dropdownItem} ${language.code === currentLocale ? styles.dropdownItemActive : ''
                }`}
              onClick={() => handleLanguageChange(language.code)}
            >
              <Image
                src={language.flag}
                alt={language.name}
                className={styles.flagIcon}
                width={20}
                height={30}
              />
              <span>{language.name}</span>
            </button>
          ))}
        </motion.div>
      )}
    </div>
  );
}