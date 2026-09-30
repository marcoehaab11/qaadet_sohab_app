import { router } from 'expo-router';
import { Button, Panel, Screen, styles, Text } from '../components/ui';

export default function PrivacyScreen() {
  return <Screen>
    <Text style={styles.title}>الخصوصية</Text>
    <Panel>
      <Text>قعدة صحاب لعبة على موبايل واحد، من غير حساب أو إعلانات أو تتبّع.</Text>
      <Text>أسماء اللاعبين وإعدادات القعدة وأسئلة الشلة بتتحفظ على جهازك بس. التطبيق ما بيبعتهاش لخادم تابع لينا.</Text>
      <Text>النقط وأدوار اللعب والكلمات السرية للجلسة الحالية مؤقتة وبتختفي لما تقفل التطبيق.</Text>
      <Text>بعد القعدة الثالثة، ممكن يظهر طلب تقييم من Google Play أو App Store. المتجر هو اللي بيتعامل مع التقييم؛ التطبيق ما بيشوفوش.</Text>
      <Text>تقدر تمسح أسئلتك من شاشة «أسئلة الشلة». ولمسح كل البيانات المحلية، احذف التطبيق وبياناته من إعدادات الموبايل.</Text>
    </Panel>
    <Button secondary label="رجوع" onPress={() => router.back()} />
  </Screen>;
}
