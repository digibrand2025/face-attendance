const tintColorLight = '#2563eb'; // blue600
const tintColorDark = '#fff';

export const PALETTE = {
  green50: '#f0fdf4',
  green100: '#dcfce7',
  green400: '#4ade80',
  green500: '#22c55e',
  green600: '#16a34a',
  blue50: '#eff6ff',
  blue100: '#dbeafe',
  blue200: '#bfdbfe',
  blue400: '#60a5fa',
  blue600: '#2563eb',
  yellow50: '#fefce8',
  yellow200: '#fef08a',
  yellow300: '#fde047',
  yellow400: '#facc15',
  yellow700: '#a16207',
  orange400: '#fb923c',
  pink200: '#fbcfe8',
  pink500: '#ec4899',
  slate400: '#94a3b8',
  slate500: '#64748b',
  slate600: '#475569',
  slate700: '#334155',
  slate800: '#1e293b',
  slate900: '#0f172a',
  white: '#ffffff',
  bgMain: '#F0F9FF',
};

export default {
  light: {
    text: PALETTE.slate800,
    background: PALETTE.bgMain,
    tint: tintColorLight,
    tabIconDefault: PALETTE.slate400,
    tabIconSelected: tintColorLight,
  },
  dark: {
    text: '#fff',
    background: '#000',
    tint: tintColorDark,
    tabIconDefault: '#ccc',
    tabIconSelected: tintColorDark,
  },
};
