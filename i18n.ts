import i18next from 'i18next';
import Backend from 'i18next-fs-backend';
import LanguageDetector from 'i18next-browser-languagedetector';
import path from 'path';
import { readdirSync, lstatSync } from 'fs';

import { fileURLToPath } from 'url';
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const localesFolder = path.join(__dirname, './locales')

i18next
  .use(Backend)
  .use(LanguageDetector)
  .init({
    initImmediate: false,
    fallbackLng: 'en',
    interpolation: {
      escapeValue: false,
    },
    preload: readdirSync(localesFolder).filter((fileName) => {
      const joinedPath = path.join(localesFolder, fileName)
      return lstatSync(joinedPath).isDirectory()
    }),
    backend: {
      loadPath: path.join(localesFolder, '{{lng}}/{{ns}}.json')
    }
  })

export default i18next
/*(lng: any) =>
  i18n.getFixedT(lng || systemLocale);*/