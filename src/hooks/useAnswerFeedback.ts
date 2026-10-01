import { useCallback } from 'react';
import { useAudioPlayer } from 'expo-audio';
import { useApp } from '../store';

export function useAnswerFeedback() {
  const sound = useApp((state) => state.data.settings.sound);
  const correct = useAudioPlayer(require('../../assets/sounds/correct.wav'));
  const wrong = useAudioPlayer(require('../../assets/sounds/wrong.wav'));

  return useCallback((isCorrect: boolean) => {
    if (!sound) return;
    const player = isCorrect ? correct : wrong;
    void player.seekTo(0).then(() => player.play()).catch(() => {});
  }, [sound, correct, wrong]);
}
