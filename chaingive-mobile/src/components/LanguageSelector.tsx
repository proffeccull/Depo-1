import React, { useState } from 'react';
import { View, Text, TouchableOpacity, Modal, FlatList, StyleSheet, ViewStyle, TextStyle } from 'react-native';
import { useTranslation } from 'react-i18next';
import { supportedLanguages, changeLanguage, isRTL } from '../i18n';

interface LanguageSelectorProps {
  style?: ViewStyle;
  textStyle?: TextStyle;
}

export const LanguageSelector: React.FC<LanguageSelectorProps> = ({
  style,
  textStyle,
}) => {
  const { t, i18n } = useTranslation();
  const [modalVisible, setModalVisible] = useState(false);
  const currentLanguage = i18n.language;

  const handleLanguageChange = async (languageCode: string) => {
    try {
      await changeLanguage(languageCode);
      setModalVisible(false);
    } catch (error) {
      console.error('Failed to change language:', error);
    }
  };

  const renderLanguageItem = ({ item }: { item: [string, any] }) => {
    const [code, language] = item;
    const isSelected = code === currentLanguage;

    return (
      <TouchableOpacity
        style={[styles.languageItem, isSelected && styles.selectedLanguageItem]}
        onPress={() => handleLanguageChange(code)}
      >
        <Text style={[styles.languageText, isSelected && styles.selectedLanguageText]}>
          {language.nativeName}
        </Text>
        {isSelected && <Text style={styles.checkmark}>✓</Text>}
      </TouchableOpacity>
    );
  };

  return (
    <View style={style}>
      <TouchableOpacity
        style={styles.selectorButton}
        onPress={() => setModalVisible(true)}
      >
        <Text style={[styles.selectorText, textStyle]}>
          {supportedLanguages[currentLanguage as keyof typeof supportedLanguages]?.nativeName || 'English'}
        </Text>
        <Text style={styles.dropdownIcon}>▼</Text>
      </TouchableOpacity>

      <Modal
        visible={modalVisible}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setModalVisible(false)}
      >
        <TouchableOpacity
          style={styles.modalOverlay}
          activeOpacity={1}
          onPress={() => setModalVisible(false)}
        >
          <View style={[styles.modalContent, isRTL() && styles.modalContentRTL]}>
            <Text style={styles.modalTitle}>{t('settings.language')}</Text>

            <FlatList
              data={Object.entries(supportedLanguages)}
              keyExtractor={([code]) => code}
              renderItem={renderLanguageItem}
              showsVerticalScrollIndicator={false}
            />

            <TouchableOpacity
              style={styles.closeButton}
              onPress={() => setModalVisible(false)}
            >
              <Text style={styles.closeButtonText}>{t('common.cancel')}</Text>
            </TouchableOpacity>
          </View>
        </TouchableOpacity>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  selectorButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 8,
    backgroundColor: '#f5f5f5',
    borderRadius: 8,
    minWidth: 100,
  },
  selectorText: {
    fontSize: 14,
    color: '#333',
    marginRight: 8,
    fontWeight: '500',
  },
  dropdownIcon: {
    fontSize: 12,
    color: '#666',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 20,
    width: '80%',
    maxWidth: 300,
    maxHeight: '60%',
  },
  modalContentRTL: {
    direction: 'rtl',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 16,
    textAlign: 'center',
    color: '#333',
  },
  languageItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    marginVertical: 2,
  },
  selectedLanguageItem: {
    backgroundColor: '#e3f2fd',
  },
  languageText: {
    fontSize: 16,
    color: '#333',
  },
  selectedLanguageText: {
    color: '#1976d2',
    fontWeight: '600',
  },
  checkmark: {
    fontSize: 16,
    color: '#1976d2',
    fontWeight: 'bold',
  },
  closeButton: {
    marginTop: 16,
    paddingVertical: 12,
    paddingHorizontal: 24,
    backgroundColor: '#f5f5f5',
    borderRadius: 8,
    alignItems: 'center',
  },
  closeButtonText: {
    fontSize: 16,
    color: '#666',
    fontWeight: '500',
  },
});

export default LanguageSelector;