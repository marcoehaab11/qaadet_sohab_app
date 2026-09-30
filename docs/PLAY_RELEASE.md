# تجهيز Google Play — مسودة العمل

الحالة الحالية **غير جاهزة للنشر**. لا توجد نسخة AAB موقّعة، ولم يحدث اختبار على جهاز Android فعلي أو رفع إلى Play Console.

## الموجود في المشروع

- معرّف Android المقترح: `com.marcoehaab11.qaadetsohab`، و`versionCode` الأول 1. تحقّق من الاسم النهائي وملكية الحساب قبل أول رفع؛ معرّف الحزمة لا يمكن تغييره للتطبيق نفسه بعد نشره.
- `eas.json`: ملف `preview` ينتج APK للتجربة على الهاتف، و`production` ينتج AAB. إعداد الإرسال الداخلي محفوظ كـ draft لتجنّب النشر المباشر. لم يمكن التحقق من `eas config` لأن حساب Expo غير مسجل في هذه البيئة.
- أيقونة أصلية ورسمة splash جاهزتان في `assets/`؛ يلزم فحص ظهورهما في نسخة Android فعلية واعتماد الهوية النهائية.
- [سياسة الخصوصية العربية](PRIVACY.md) ومسار «الخصوصية» داخل التطبيق. رابط GitHub العام للسياسة بعد رفع الملف: `https://github.com/marcoehaab11/qaadet_sohab_app/blob/main/docs/PRIVACY.md`.
- ٨ ألعاب قابلة للتجربة و«أسئلة الشلة» محلية. المحتوى الأساسي 236 عنصرًا فقط، أقل من هدف 1400.

## قبل بناء نسخة اختبار

1. إنهاء محتوى M6 والمراجعة التحريرية من شخصين؛ تشغيل `npm run content:lint -- --release` حتى ينجح.
2. اعتماد الأيقونة الحالية أو تعديلها بعد تجربة الهاتف، وإنشاء صور المتجر النهائية ومراجعة نصوصه.
3. تأكيد معرّف الحزمة واسم المطور، وتسجيل الدخول إلى حساب Expo. نفّذ `npx eas-cli@latest whoami`، ثم `npx eas-cli@latest build --platform android --profile preview` لإنشاء APK اختبار. لا تحفظ بيانات الدخول أو مفاتيح التوقيع في Git.
4. جرّب APK على هاتف Android حقيقي: RTL، الخط الكبير، TalkBack، الوضع العائلي، المؤقت مع قفل الشاشة والعودة، الصوت/الاهتزاز، حفظ البيانات دون إنترنت، كل الألعاب الثمانية، وطلب التقييم بعد القعدة الثالثة. سجّل الأجهزة وإصدارات النظام ونتائج الاختبار.
5. راجع أذونات وSDKs حزمة Android النهائية واملأ نموذج Data safety بما يحدث فعلًا. أضف بريدًا/وسيلة تواصل رسمية إلى سياسة الخصوصية، وتأكد من أن رابطها متاح علنًا داخل Play Console.

## الرفع التجريبي وبعده

1. أكمل بيانات Play Console: تصنيف المحتوى، الفئة العمرية، الصور، وصف التطبيق، سياسة الخصوصية، ونموذج Data safety. تحقّق من متطلبات الاختبار والحساب السارية وقت الرفع.
2. أنشئ AAB بـ `npx eas-cli@latest build --platform android --profile production` بعد اجتياز المراجعات. اختبره عبر المسار الداخلي في Play Console. الملف المصدر وحده و`expo export` لا ينتجان AAB.
3. الانتقال من الاختبار إلى الإنتاج قرار منفصل بعد نتائج الأجهزة ومراجعة المتجر. لا تشغّل `eas submit` تلقائيًا عند كل push.

مراجع رسمية: [EAS Build](https://docs.expo.dev/build/eas-json/)، [EAS Submit Android](https://docs.expo.dev/submit/android/)، [Google Play Data safety](https://support.google.com/googleplay/android-developer/answer/10787469)، [إعداد محتوى التطبيق في Play Console](https://support.google.com/googleplay/android-developer/answer/9859455).
