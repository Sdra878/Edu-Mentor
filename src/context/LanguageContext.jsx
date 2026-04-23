import { createContext, useContext, useState, useEffect } from 'react';

const i18n = {
  en: { appName: "Edu Mentor", dashboard: "Dashboard" },
  ar: { appName: "إديو مينتور", dashboard: "لوحة التحكم" }
};

const LanguageContext = createContext();

export const LanguageProvider = ({ children }) => {
  const [lang, setLang] = useState('en');
  useEffect(() => { document.documentElement.dir = lang === 'ar' ? 'rtl' : 'ltr'; }, [lang]);
  return (
    <LanguageContext.Provider value={{ lang, setLang, t: i18n[lang] }}>
      {children}
    </LanguageContext.Provider>
  );
};
export const useLanguage = () => useContext(LanguageContext);