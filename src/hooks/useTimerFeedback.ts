import { useCallback } from 'react';
import { useAudioPlayer } from 'expo-audio';
import * as Haptics from 'expo-haptics';
import { useApp } from '../store';
export function useTimerFeedback() {
  const sound = useApp((s) => s.data.settings.sound);
  const tick = useAudioPlayer(require('../../assets/sounds/tick.wav'));
  const end = useAudioPlayer(require('../../assets/sounds/end.wav'));
  return useCallback(
    (finished: boolean) => {
      if (finished)
        void Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success).catch(() => {});
      if (!sound) return;
      const player = finished ? end : tick;
      void player
        .seekTo(0)
        .then(() => player.play())
        .catch(() => {});
    },
    [sound, tick, end],
  );
}
