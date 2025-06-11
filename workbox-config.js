module.exports = {
    globDirectory: 'site/',
    globPatterns: ['**/*.{html,js,css,json,svg,png,ico,webmanifest}'],
    swSrc: 'serviceWorker.js',
    swDest: 'site/serviceWorker.js',
    maximumFileSizeToCacheInBytes: 5 * 1024 * 1024
};
