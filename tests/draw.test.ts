import { createDraw, drawReducer } from '../src/games/draw/reducer';
import { Participant } from '../src/engine/types';

const players: Participant[] = ['a', 'b', 'c'].map((id) => ({ id, name: id, emoji: '🙂', color: '#ffffff', away: false }));
test('artist and first guesser each get one point; replay cannot score twice', () => {
  let state = createDraw(players, 1, 7);
  const artistId = state.artistId!;
  const guesserId = players.find((player) => player.id !== artistId)!.id;
  state = drawReducer(state, { type: 'showWord', wordId: 'drawing', seed: 8 }, players).state;
  expect(drawReducer(state, { type: 'guessed', playerId: guesserId }, players).changes).toEqual([]);
  state = drawReducer(state, { type: 'start' }, players).state;
  const answer = drawReducer(state, { type: 'guessed', playerId: guesserId }, players);
  expect(answer.changes).toEqual([{ playerId: artistId, points: 1 }, { playerId: guesserId, points: 1 }]);
  expect(answer.stats).toEqual([{ playerId: artistId, stat: 'artist', amount: 1 }, { playerId: guesserId, stat: 'guess', amount: 1 }]);
  expect(drawReducer(answer.state, { type: 'guessed', playerId: guesserId }, players).changes).toEqual([]);
});
test('artist and away player cannot guess; timeout scores nothing', () => {
  let state = createDraw(players, 1, 7);
  state = drawReducer(state, { type: 'showWord', wordId: 'drawing', seed: 8 }, players).state;
  state = drawReducer(state, { type: 'start' }, players).state;
  expect(drawReducer(state, { type: 'guessed', playerId: state.artistId! }, players).changes).toEqual([]);
  const absent = players.find((player) => player.id !== state.artistId)!;
  expect(drawReducer(state, { type: 'guessed', playerId: absent.id },
    players.map((player) => player.id === absent.id ? { ...player, away: true } : player)).changes).toEqual([]);
  expect(drawReducer(state, { type: 'timeUp' }, players).changes).toEqual([]);
});
