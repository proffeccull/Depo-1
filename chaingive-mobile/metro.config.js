const { getDefaultConfig } = require('expo/metro-config');

/**
 * Metro configuration
 * https://facebook.github.io/metro/docs/configuration
 *
 * @type {import('metro-config').MetroConfig}
 */
const config = {
  resolver: {
    alias: {
      '@': './src',
      '@components': './src/components',
      '@screens': './src/screens',
      '@navigation': './src/navigation',
      '@store': './src/store',
      '@api': './src/api',
      '@theme': './src/theme',
      '@types': './src/types',
      '@utils': './src/utils',
      '@hooks': './src/hooks',
      '@assets': './src/assets',
    },
  },
  watchFolders: [
    // Add any additional watch folders here
  ],
};

module.exports = getDefaultConfig(__dirname, config);