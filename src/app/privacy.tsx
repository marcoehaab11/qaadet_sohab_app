import { useEffect, useState } from 'react';
import { router } from 'expo-router';
import { Button, Panel, Screen, styles, Text } from '../components/ui';
import { adPrivacyOptionsRequired, openAdPrivacyOptions } from '../ads/interstitial';

export default function PrivacyScreen() {
  const [showAdOptions, setShowAdOptions] = useState(false);
  const [adOptionsError, setAdOptionsError] = useState(false);
  useEffect(() => {
    let active = true;
    void adPrivacyOptionsRequired().then((required) => {
      if (active) setShowAdOptions(required);
    });
    return () => { active = false; };
  }, []);
  return <Screen>
    <Text style={styles.title}>الخصوصية</Text>
    <Panel>
      <Text>قعدة صحاب لعبة على موبايل واحد، من غير حساب. قد يظهر إعلان من Google AdMob بين لعبتين، ولا يظهر أثناء اللعب.</Text>
      <Text>قد يعالج Google بيانات الجهاز ومعرّفات الإعلانات والنشاط الإعلاني لعرض الإعلان وقياسه. تُطلب موافقتك حيث يلزم قبل تحميل الإعلانات، ويمكنك إدارة تفضيلات الخصوصية من إعدادات جهازك.</Text>
      <Text>أسماء اللاعبين وإعدادات القعدة وأسئلة الشلة بتتحفظ على جهازك بس. التطبيق ما بيبعتهاش لخادم تابع لينا.</Text>
      <Text>النقط وأدوار اللعب والكلمات السرية للجلسة الحالية مؤقتة وبتختفي لما تقفل التطبيق.</Text>
      <Text>بعد القعدة الثالثة، ممكن يظهر طلب تقييم من Google Play أو App Store. المتجر هو اللي بيتعامل مع التقييم؛ التطبيق ما بيشوفوش.</Text>
      <Text>تقدر تمسح أسئلتك من شاشة «أسئلة الشلة». ولمسح كل البيانات المحلية، احذف التطبيق وبياناته من إعدادات الموبايل.</Text>
      <Text>للتواصل بخصوص الخصوصية: devmarcoehab@gmail.com</Text>
    </Panel>
    {showAdOptions && <Button secondary label="إدارة خيارات الإعلانات" onPress={() => {
      setAdOptionsError(false);
      void openAdPrivacyOptions().catch(() => setAdOptionsError(true));
    }} />}
    {adOptionsError && <Text accessibilityRole="alert">تعذر فتح خيارات الإعلانات. حاول مرة أخرى لاحقًا.</Text>}
    <Button secondary label="رجوع" onPress={() => router.back()} />
  </Screen>;
}
