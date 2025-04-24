module.exports = function(api) {
  api.cache(true);
  return {
    presets: ["module:@react-native/babel-preset"],
    presets: ['babel-preset-expo'],
    plugins: [
      ["react-native-reanimated/plugin"],
      ["module:react-native-dotenv", {
        "moduleName": "@env",
        "path": ".env",
        "safe": false,
      }],
      // Integrating module-resolver configuration from .babelrc
      ["module-resolver", {
        "root": ["./src"],
        "alias": {
          "~": "./src",
          "assets": "./assets",
          "shared": "./shared",
          "styles": "./styles",
          "locales": ["locales"],
        }
      }]
    ]
  };
};