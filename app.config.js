const TEST_ANDROID_APP_ID = 'ca-app-pub-3940256099942544~3347511713';
const TEST_IOS_APP_ID = 'ca-app-pub-3940256099942544~1458002511';
const isProduction = process.env.ADS_BUILD_MODE === 'production';
const androidAppId = process.env.ADMOB_ANDROID_APP_ID;
const androidInterstitialId = process.env.ADMOB_ANDROID_INTERSTITIAL_ID;
const iosAppId = process.env.ADMOB_IOS_APP_ID;
const iosInterstitialId = process.env.ADMOB_IOS_INTERSTITIAL_ID;

if (isProduction && (!androidAppId || !androidInterstitialId)) {
  throw new Error('Production Android builds require ADMOB_ANDROID_APP_ID and ADMOB_ANDROID_INTERSTITIAL_ID.');
}
if (isProduction && process.env.EAS_BUILD_PLATFORM === 'ios' && (!iosAppId || !iosInterstitialId)) {
  throw new Error('Production iOS builds require ADMOB_IOS_APP_ID and ADMOB_IOS_INTERSTITIAL_ID.');
}

module.exports = ({ config }) => ({
  ...config,
  plugins: [
    ...(config.plugins || []),
    ['react-native-google-mobile-ads', {
      androidAppId: isProduction ? androidAppId : TEST_ANDROID_APP_ID,
      iosAppId: isProduction && iosAppId ? iosAppId : TEST_IOS_APP_ID,
      userTrackingUsageDescription: 'نستخدم المعرّف الإعلاني لعرض إعلانات مناسبة لك، إذا وافقت على التتبع.',
    }],
  ],
  extra: {
    ...config.extra,
    ads: {
      mode: isProduction ? 'production' : 'test',
      androidInterstitialId: isProduction ? androidInterstitialId : null,
      iosInterstitialId: isProduction ? iosInterstitialId : null,
    },
  },
});
