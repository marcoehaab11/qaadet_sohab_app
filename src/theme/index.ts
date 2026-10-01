export const theme = {
  night: '#140d1f',
  ink: '#23172f',
  surface: '#261c34',
  line: '#493a56',
  cream: '#fff5e1',
  muted: '#d7cbe4',
  gold: '#ffc83d',
  goldShadow: '#c98a00',
  coral: '#ff5d5d',
  cyan: '#35d0c9',
  felt: '#0b4a3a',
  feltLight: '#167a60',
  feltDark: '#07322a',
  wood: '#4a2911',
  woodLight: '#94592b',
  body: 'Cairo_400Regular',
  bold: 'Cairo_700Bold',
  display: 'Lalezar_400Regular',
};
export const avatars = ['🦊', '🐼', '🐸', '🦁', '🐧', '🐙', '🦄', '🐯'];
export const colors = [
  '#d3b4ff',
  '#ff9c9c',
  '#8ce5d7',
  '#ffda70',
  '#a7d7ff',
  '#ffc1e8',
  '#c1e79e',
  '#e2be98',
];
export const clearColors = [
  '#E69F00',
  '#56B4E9',
  '#009E73',
  '#F0E442',
  '#0072B2',
  '#D55E00',
  '#CC79A7',
  '#FFFFFF',
];
export const playerColor = (color: string, clear: boolean) =>
  clear ? clearColors[Math.max(0, colors.indexOf(color))]! : color;
