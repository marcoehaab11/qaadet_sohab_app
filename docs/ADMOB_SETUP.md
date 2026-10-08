# تجهيز إعلانات قعدة صحاب

هذه الخطوة تضيف إعلانًا بين لعبتين في نسخة اختبار Android. لا يُعرض إعلان أثناء اللعبة، ولا يتوقف الانتقال إذا لم يكن الإعلان جاهزًا. توجد مهلة 90 ثانية بين إعلانين. النسخة التجريبية تستخدم معرّفات Google الاختبارية ولا تحقق دخلًا.

1. في AdMob: **Apps → Add app → Android → No** لأن التطبيق حاليًا في اختبار مغلق وغير متاح علنًا على Google Play. الاسم «قعدة صحاب».
2. أُنشئ تطبيق Android في AdMob ووحدة **Interstitial** باسم `between_games`. معرّفا App ID وAd Unit ID موجودان في بيئة `production` داخل `eas.json`، ويستخدمهما إصدار Android المخصص للمتجر. هذه معرّفات عامة وليست بيانات دخول أو دفع.
3. بناء Android production يفشل عمدًا لو نقص أي معرّف. `preview` يبقى على معرّفات Google الاختبارية حتى بعد إنشاء الحساب، ولا يحقق دخلًا.
4. أنشئ رسالة موافقة من نوع Google UMP في AdMob للأسواق التي تتطلبها. التطبيق يتحقق من الموافقة قبل تهيئة SDK وطلب الإعلان.
5. قبل رفع نسخة إعلانات إلى Google Play، راجع `docs/PRIVACY.md`، وغيّر **Contains ads** و**Advertising ID** و**Data safety** بحسب الحزمة النهائية وسلوك Google Mobile Ads SDK. لا تستخدم إقرار النسخة 2 الخالية من الإعلانات للنسخة الجديدة.
6. بعد نشر التطبيق علنًا، اربطه بصفحة Google Play في AdMob وأكمل `app-ads.txt` ومراجعة جاهزية التطبيق. الاختبار المغلق وحده لا يكفي للربط العام، والإعلانات التجريبية لا تحقق دخلًا.

مراجع: [إعداد تطبيق غير منشور في AdMob](https://support.google.com/admob/answer/9989980)، [مراجعة الجاهزية](https://support.google.com/admob/answer/10564477)، [إفصاح بيانات SDK](https://developers.google.com/admob/android/privacy/play-data-disclosure)، [إعلانات اختبار Google](https://developers.google.com/admob/android/test-ads)، [تنفيذ Expo للمكتبة](https://docs.page/invertase/react-native-google-mobile-ads/installation/expo).
