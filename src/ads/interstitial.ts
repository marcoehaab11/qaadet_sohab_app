import Constants from 'expo-constants';
import { Platform } from 'react-native';
import type { InterstitialAd } from 'react-native-google-mobile-ads';

type AdsConfig = {
  mode?: 'test' | 'production';
  androidInterstitialId?: string | null;
  iosInterstitialId?: string | null;
};

const MIN_GAP_MS = 90_000;
const SHOW_TIMEOUT_MS = 90_000;
let ad: InterstitialAd | null = null;
let loaded = false;
let showing = false;
let lastShownAt = 0;
let startPromise: Promise<void> | null = null;
let closePending: (() => void) | null = null;

export function startAds(): Promise<void> {
  if (Platform.OS === 'web') return Promise.resolve();
  if (startPromise) return startPromise;
  startPromise = (async () => {
    try {
      const { default: mobileAds, AdsConsent, AdEventType, InterstitialAd, MaxAdContentRating, TestIds } =
        await import('react-native-google-mobile-ads');
      // UMP is checked on each launch. No ad request is made unless it allows one.
      await AdsConsent.gatherConsent().catch(() => undefined);
      const { canRequestAds } = await AdsConsent.getConsentInfo();
      if (!canRequestAds) return;
      await mobileAds().setRequestConfiguration({ maxAdContentRating: MaxAdContentRating.PG });
      await mobileAds().initialize();
      const config = Constants.expoConfig?.extra?.ads as AdsConfig | undefined;
      const unitId = config?.mode === 'production'
        ? Platform.OS === 'ios' ? config.iosInterstitialId : config.androidInterstitialId
        : TestIds.INTERSTITIAL;
      if (!unitId) return;
      ad = InterstitialAd.createForAdRequest(unitId);
      ad.addAdEventListener(AdEventType.LOADED, () => { loaded = true; });
      ad.addAdEventListener(AdEventType.ERROR, () => {
        loaded = false;
        closePending?.();
      });
      ad.addAdEventListener(AdEventType.CLOSED, () => {
        loaded = false;
        closePending?.();
        ad?.load();
      });
      ad.load();
    } catch {
      // Ads are optional: an unavailable SDK or network must never block a game.
    }
  })();
  return startPromise;
}

export async function showBetweenGames(): Promise<void> {
  if (!ad || !loaded || showing || Date.now() - lastShownAt < MIN_GAP_MS) return;
  const currentAd = ad;
  loaded = false;
  showing = true;
  await new Promise<void>((resolve) => {
    let settled = false;
    const timeout = setTimeout(done, SHOW_TIMEOUT_MS);
    function done() {
      if (settled) return;
      settled = true;
      clearTimeout(timeout);
      closePending = null;
      showing = false;
      resolve();
    }
    closePending = done;
    try {
      void currentAd.show().then(() => { lastShownAt = Date.now(); }).catch(done);
    } catch {
      done();
    }
  });
}
