import { useRef, useState } from 'react';
import { Pressable, View } from 'react-native';
import Svg, { Path } from 'react-native-svg';
import { ar } from '../i18n/ar-EG';
import { Button, Text } from './ui';

type Stroke = { path: string; color: string; width: number };
const colors = ['#2c2730', '#f26b38', '#2b88c6', '#469d58'] as const;
export function DrawingCanvas({ onDrawingChange }: { onDrawingChange?: (drawing: boolean) => void }) {
  const [strokes, setStrokes] = useState<Stroke[]>([]);
  const [current, setCurrent] = useState<Stroke | null>(null);
  const [color, setColor] = useState<string>(colors[0]);
  const width = useRef(320);
  const selected = useRef<string>(colors[0]);
  const draft = useRef<Stroke | null>(null);
  const toPoint = (x: number, y: number) => {
    const scale = 320 / width.current;
    return `${Math.max(0, Math.min(320, x * scale)).toFixed(1)} ${Math.max(0, Math.min(320, y * scale)).toFixed(1)}`;
  };
  return <View style={{ gap: 10 }}>
    <View style={{ width: '100%', aspectRatio: 1, maxHeight: 390, backgroundColor: '#ffffff',
      borderRadius: 18, overflow: 'hidden', direction: 'ltr' }}
      onLayout={(event) => { width.current = event.nativeEvent.layout.width; }}
      onStartShouldSetResponderCapture={() => true}
      onStartShouldSetResponder={() => true}
      onMoveShouldSetResponder={() => true}
      onResponderTerminationRequest={() => false}
      onResponderGrant={(event) => {
      onDrawingChange?.(true);
      const colorValue = selected.current;
      const point = toPoint(event.nativeEvent.locationX, event.nativeEvent.locationY);
      draft.current = { path: `M ${point} L ${point}`,
        color: colorValue, width: colorValue === '#ffffff' ? 18 : 5 };
      setCurrent(draft.current);
    }}
      onResponderMove={(event) => {
      if (!draft.current) return;
      draft.current = { ...draft.current,
        path: `${draft.current.path} L ${toPoint(event.nativeEvent.locationX, event.nativeEvent.locationY)}` };
      setCurrent(draft.current);
    }}
      onResponderRelease={() => {
      onDrawingChange?.(false);
      const stroke = draft.current;
      if (stroke) setStrokes((value) => [...value, stroke]);
      draft.current = null;
      setCurrent(null);
    }}
    onResponderTerminate={() => {
      onDrawingChange?.(false);
      draft.current = null; setCurrent(null);
    }}>
      <Svg pointerEvents="none" width="100%" height="100%" viewBox="0 0 320 320">
        {[...strokes, ...(current ? [current] : [])].map((stroke, index) =>
          <Path key={index} d={stroke.path} stroke={stroke.color} strokeWidth={stroke.width}
            strokeLinecap="round" strokeLinejoin="round" fill="none" />)}
      </Svg>
    </View>
    <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8 }}>
      {colors.map((choice) => <Pressable key={choice} accessibilityRole="button"
        accessibilityLabel={ar.drawColor(choice)} accessibilityState={{ selected: color === choice }}
        onPress={() => { selected.current = choice; setColor(choice); }}
        style={{ width: 54, height: 54, borderRadius: 27, backgroundColor: choice,
          borderWidth: color === choice ? 4 : 2, borderColor: color === choice ? '#ffd766' : '#777777' }} />)}
      <Pressable accessibilityRole="button" accessibilityLabel={ar.drawEraser}
        onPress={() => { selected.current = '#ffffff'; setColor('#ffffff'); }}
        style={{ minWidth: 70, minHeight: 54, justifyContent: 'center', alignItems: 'center',
          borderRadius: 14, borderWidth: color === '#ffffff' ? 3 : 1, borderColor: '#777777' }}>
        <Text>{ar.drawEraser}</Text>
      </Pressable>
    </View>
    <Button secondary label={ar.drawClear} onPress={() => { draft.current = null; setCurrent(null); setStrokes([]); }} />
  </View>;
}
