import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import * as RNLocalize from 'react-native-localize';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Import translation files
import en from './locales/en.json';
import pidgin from './locales/pcm.json';
import yoruba from './locales/yo.json';
import arabic from './locales/ar.json';

// Supported languages
export const supportedLanguages = {
  en: { name: 'English', nativeName: 'English' },
  pcm: { name: 'Pidgin', nativeName: 'Pidgin' },
  yo: { name: 'Yoruba', nativeName: 'Yorùbá' },
  ar: { name: 'Arabic', nativeName: 'العربية' },
};

// RTL languages
export const rtlLanguages = ['ar'];

// Language storage key
const LANGUAGE_STORAGE_KEY = '@ChainGive:language';

// Get stored language or device language
const getInitialLanguage = async (): Promise<string> => {
  try {
    const storedLanguage = await AsyncStorage.getItem(LANGUAGE_STORAGE_KEY);
    if (storedLanguage && supportedLanguages[storedLanguage as keyof typeof supportedLanguages]) {
      return storedLanguage;
    }
  } catch (error) {
    console.warn('Failed to load stored language:', error);
  }

  // Fallback to device language
  const locales = RNLocalize.getLocales();
  if (locales.length > 0) {
    const deviceLang = locales[0].languageCode;
    // Map device language to supported language
    if (deviceLang === 'en') return 'en';
    if (deviceLang === 'ar') return 'ar';
    if (deviceLang === 'yo') return 'yo';
    // Default to English for unsupported languages
    return 'en';
  }
  return 'en';
};

// Translation resources
const resources = {
  en: { translation: en },
  pcm: { translation: pidgin },
  yo: { translation: yoruba },
  ar: { translation: arabic },
};

// Initialize i18n
const initializeI18n = async () => {
  const initialLanguage = await getInitialLanguage();

  await i18n
    .use(initReactI18next)
    .init({
      resources,
      lng: initialLanguage,
      fallbackLng: 'en',
      interpolation: {
        escapeValue: false, // React already escapes values
      },
      react: {
        useSuspense: false,
      },
    });

  // Set RTL direction for RTL languages
  i18n.on('languageChanged', async (lng) => {
    // Store language preference
    try {
      await AsyncStorage.setItem(LANGUAGE_STORAGE_KEY, lng);
    } catch (error) {
      console.warn('Failed to store language preference:', error);
    }

    // Note: RTL direction is handled by React Native I18nManager
    // and doesn't require document manipulation like web
  });

  return i18n;
};

// Export the initialization function
export const initI18n = initializeI18n;

// Export i18n instance
export default i18n;

// Language switching utility
export const changeLanguage = async (language: string): Promise<void> => {
  if (!supportedLanguages[language as keyof typeof supportedLanguages]) {
    throw new Error(`Unsupported language: ${language}`);
  }

  await i18n.changeLanguage(language);
};

// Get current language
export const getCurrentLanguage = (): string => {
  return i18n.language;
};

// Check if language is RTL
export const isRTL = (language?: string): boolean => {
  const lang = language || i18n.language;
  return rtlLanguages.includes(lang);
};