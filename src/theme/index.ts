export const theme = {
  night: '#140d1f',
  surface: '#261d32',
  line: '#46374f',
  cream: '#fff5e1',
  muted: '#c0b2ce',
  gold: '#ffc83d',
  goldShadow: '#a47016',
  coral: '#ff7979',
  cyan: '#65ded5',
  felt: '#183e36',
  wood: '#715039',
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
