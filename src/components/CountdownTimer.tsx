import { useEffect, useRef, useState } from 'react';
import { AppState } from 'react-native';
import { useKeepAwake } from 'expo-keep-awake';
import { createTimer, pauseTimer, remaining, resumeTimer } from '../engine/timer';
import { ar } from '../i18n/ar-EG';
import { Button, Panel, Text } from './ui';
import { useTimerFeedback } from '../hooks/useTimerFeedback';
export function CountdownTimer({
  seconds,
  paused = false,
  controls = true,
  onEnd,
}: {
  seconds: number;
  paused?: boolean;
  controls?: boolean;
  onEnd: () => void;
}) {
  useKeepAwake();
  const timer = useRef(createTimer(seconds));
  const ended = useRef(false);
  const callback = useRef(onEnd);
  useEffect(() => {
    callback.current = onEnd;
  }, [onEnd]);
  const [manualPause, setManualPause] = useState(false);
  const [inBackground, setInBackground] = useState(false);
  const [ms, setMs] = useState(seconds * 1000);
  const stopped = paused || manualPause || inBackground;
  const feedback = useTimerFeedback();
  useEffect(() => {
    const sub = AppState.addEventListener('change', (state) => {
      if (state !== 'active') timer.current = pauseTimer(timer.current, Date.now());
      setInBackground(state !== 'active');
    });
    return () => sub.remove();
  }, []);
  useEffect(() => {
    timer.current = stopped
      ? pauseTimer(timer.current, Date.now())
      : resumeTimer(timer.current, Date.now());
    setMs(remaining(timer.current, Date.now()));
  }, [stopped]);
  useEffect(() => {
    const handle = setInterval(() => {
      const value = remaining(timer.current, Date.now());
      setMs(value);
      if (!value && !ended.current) {
        ended.current = true;
        callback.current();
      }
    }, 100);
    return () => clearInterval(handle);
  }, []);
  const display = Math.ceil(ms / 1000);
  const previous = useRef(display);
  useEffect(() => {
    if (display !== previous.current && display <= 3 && !stopped) feedback(display === 0);
    previous.current = display;
  }, [display, stopped, feedback]);
  return (
    <Panel>
      <Text style={{ textAlign: 'center', fontSize: 48, lineHeight: 66, writingDirection: 'ltr' }}>
        {display}
      </Text>
      {controls && ms > 0 && (
        <Button
          secondary
          label={stopped ? ar.resume : ar.pause}
          disabled={paused || inBackground}
          onPress={() => setManualPause((value) => !value)}
        />
      )}
      {ms === 0 && <Text style={{ textAlign: 'center' }}>{ar.timeUp}</Text>}
    </Panel>
  );
}
