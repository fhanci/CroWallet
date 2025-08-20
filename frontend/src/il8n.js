import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import HttpBackend from 'i18next-http-backend';
import LanguageDetector from 'i18next-browser-languagedetector';

i18n
  .use(HttpBackend) // JSON dosyalarını yükler
  .use(LanguageDetector) // Tarayıcı dilini algılar
  .use(initReactI18next) // React entegrasyonu
  .init({
    fallbackLng: 'tr',
    debug: true,
    interpolation: {
      escapeValue: false
    },
    backend: {
      loadPath: '/locales/{{lng}}/translation.json'
    }
  });

export default i18n;
