const { getDefaultConfig } = require('expo/metro-config');
const { exclusionList } = require('metro-config/src/defaults/exclusionList');
const path = require('path');

module.exports = (async () => {
  const config = await getDefaultConfig(__dirname);
  const isWeb = process.env.EXPO_TARGET === 'web';

  config.resolver.alias = {
    ...(config.resolver.alias || {}),
    'react-native-maps': path.resolve(
      __dirname,
      isWeb ? './web-polyfills/maps-web.js' : './shim/react-native-maps.js'
    ),
    // Add an alias for the problematic path:
    'react-native/Libraries/react-native/react-native-implementation': 'react-native',
  };

  config.resolver.extraNodeModules = {
    'AccessibilityInfo': path.resolve(
      __dirname,
      'node_modules/react-native/Libraries/Components/AccessibilityInfo/AccessibilityInfo'
    ),
  };

  config.resolver.blockList = [
    /\/app\/api\/.*/,
    /\/node_modules\/rn-credit-card\/node_modules\/react-native\/.*/
  ];

  return config;
})();
