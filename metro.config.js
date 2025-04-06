const { getDefaultConfig } = require('expo/metro-config');
const path = require('path');

module.exports = (async () => {
  const config = await getDefaultConfig(__dirname);

  // Add an alias for react-native-maps to use our shim.
  config.resolver.alias = {
    ...(config.resolver.alias || {}),
    'react-native-maps': path.resolve(__dirname, 'shim/react-native-maps.js'),
  };

  // Keep your other config settings:
  config.resolver.extraNodeModules = {
    'AccessibilityInfo': path.resolve(__dirname, 'node_modules/react-native/Libraries/Components/AccessibilityInfo/AccessibilityInfo'),
  };

  config.resolver.blacklistRE = [
    new RegExp(
      `${path.resolve(__dirname, 'node_modules/rn-credit-card/node_modules/react-native')}/.*`
    ),
  ];

  return config;
})();
