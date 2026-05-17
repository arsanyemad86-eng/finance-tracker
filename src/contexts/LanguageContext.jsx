import { createContext, useContext, useEffect, useState } from "react";
import en from "../locales/en";
import ar from "../locales/ar";

const STORAGE_KEY = "fintrack_lang";

const dictionaries = { en, ar };

const LanguageContext = createContext({
  lang: "en",
  setLang: () => {},
  t: (key) => key,
});

export function LanguageProvider({ children }) {
  const [lang, setLangState] = useState(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      return stored === "ar" || stored === "en" ? stored : "en";
    } catch {
      return "en";
    }
  });

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, lang);
    } catch {
      // ignore quota errors
    }
    // Keep <html> in sync for accessibility / CSS targeting
    if (typeof document !== "undefined") {
      document.documentElement.setAttribute("lang", lang);
      document.documentElement.setAttribute("dir", lang === "ar" ? "rtl" : "ltr");
    }
  }, [lang]);

  const setLang = (next) => {
    if (next === "ar" || next === "en") setLangState(next);
  };

  const t = (key, vars) => {
    const dict = dictionaries[lang] || dictionaries.en;
    let str = dict[key] ?? dictionaries.en[key] ?? key;
    if (vars && typeof str === "string") {
      Object.keys(vars).forEach((k) => {
        str = str.replace(new RegExp(`\\{${k}\\}`, "g"), String(vars[k]));
      });
    }
    return str;
  };

  return (
    <LanguageContext.Provider value={{ lang, setLang, t }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLang() {
  return useContext(LanguageContext);
}
