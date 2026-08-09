// Ensure Metro resolves pnpm symlinks and package exports correctly
// This helps with modules like lucide-react-native under pnpm
const { getDefaultConfig } = require('@expo/metro-config');

/** @type {import('metro-config').MetroConfig} */
const config = getDefaultConfig(__dirname);

config.resolver.unstable_enableSymlinks = true;
config.resolver.unstable_enablePackageExports = true;

module.exports = config;
