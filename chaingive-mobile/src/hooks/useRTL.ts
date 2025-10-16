import { useEffect, useState } from 'react';
import { I18nManager } from 'react-native';
import { useTranslation } from 'react-i18next';
import { rtlLanguages } from '../i18n';

export const useRTL = () => {
  const { i18n } = useTranslation();
  const [isRTL, setIsRTL] = useState(false);

  useEffect(() => {
    const checkRTL = () => {
      const currentLang = i18n.language;
      const shouldBeRTL = rtlLanguages.includes(currentLang);

      // Update React Native's RTL setting
      if (shouldBeRTL !== I18nManager.isRTL) {
        I18nManager.forceRTL(shouldBeRTL);
        setIsRTL(shouldBeRTL);
      } else {
        setIsRTL(shouldBeRTL);
      }
    };

    checkRTL();

    // Listen for language changes
    i18n.on('languageChanged', checkRTL);

    return () => {
      // Remove the event listener
      i18n.off('languageChanged', checkRTL);
    };
  }, [i18n]);

  return isRTL;
};

// Hook to get text alignment based on RTL status
export const useTextAlignment = () => {
  const isRTL = useRTL();
  return {
    textAlign: isRTL ? 'right' : 'left',
    writingDirection: isRTL ? 'rtl' : 'ltr',
  };
};

// Hook to get flex direction based on RTL status
export const useFlexDirection = () => {
  const isRTL = useRTL();
  return {
    flexDirection: isRTL ? 'row-reverse' : 'row',
  };
};