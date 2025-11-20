// babel.config.js
module.exports = function(api) {
    api.cache(true);
    return {
        presets: ['babel-preset-expo'],
        plugins: [
            // Add this line, making sure it's the last plugin
            'react-native-reanimated/plugin',
        ],
    };
};