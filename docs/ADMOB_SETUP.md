# تجهيز إعلانات قعدة صحاب

هذه الخطوة تضيف إعلانًا بين لعبتين في نسخة اختبار Android. لا يُعرض إعلان أثناء اللعبة، ولا يتوقف الانتقال إذا لم يكن الإعلان جاهزًا. توجد مهلة 90 ثانية بين إعلانين. النسخة التجريبية تستخدم معرّفات Google الاختبارية ولا تحقق دخلًا.

1. في AdMob: **Apps → Add app → Android → No** لأن التطبيق حاليًا في اختبار مغلق وغير متاح علنًا على Google Play. الاسم «قعدة صحاب».
2. بعد إنشاء التطبيق، انسخ **Android App ID** بصيغة `ca-app-pub-…~…` وأنشئ وحدة **Interstitial** وانسخ **Ad Unit ID** بصيغة `ca-app-pub-…/…`. لا ترسل بيانات الدخول أو الدفع.
3. أضف المتغيرين `ADMOB_ANDROID_APP_ID` و`ADMOB_ANDROID_INTERSTITIAL_ID` إلى بيئة EAS المستخدمة لبناء `production`. بناء Android production يفشل عمدًا بدونهما. `preview` يبقى على معرّفات الاختبار حتى بعد إنشاء الحساب.
4. أنشئ رسالة موافقة من نوع Google UMP في AdMob للأسواق التي تتطلبها. التطبيق يتحقق من الموافقة قبل تهيئة SDK وطلب الإعلان.
5. قبل رفع نسخة إعلانات إلى Google Play، راجع `docs/PRIVACY.md`، وغيّر **Contains ads** و**Advertising ID** و**Data safety** بحسب الحزمة النهائية وسلوك Google Mobile Ads SDK. لا تستخدم إقرار النسخة 2 الخالية من الإعلانات للنسخة الجديدة.
6. بعد نشر التطبيق علنًا، اربطه بصفحة Google Play في AdMob وأكمل `app-ads.txt` ومراجعة جاهزية التطبيق. الاختبار المغلق وحده لا يكفي للربط العام، والإعلانات التجريبية لا تحقق دخلًا.

مراجع: [إعداد تطبيق غير منشور في AdMob](https://support.google.com/admob/answer/9989980)، [مراجعة الجاهزية](https://support.google.com/admob/answer/10564477)، [إفصاح بيانات SDK](https://developers.google.com/admob/android/privacy/play-data-disclosure)، [إعلانات اختبار Google](https://developers.google.com/admob/android/test-ads)، [تنفيذ Expo للمكتبة](https://docs.page/invertase/react-native-google-mobile-ads/installation/expo).
