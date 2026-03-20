const fs = require('fs');
const path = require('path');

const files = [
  'app/(tabs)/index.tsx',
  'app/(tabs)/habits.tsx',
  'app/(tabs)/rewards.tsx',
  'app/focus.tsx',
  'components/TaskItem.tsx',
  'components/ProgressRing.tsx',
  'components/Button.tsx',
  'components/CalendarHeatmap.tsx',
  'components/ReflectionPrompt.tsx'
];

files.forEach(file => {
  const p = path.join(__dirname, '..', file);
  if (!fs.existsSync(p)) return;
  let code = fs.readFileSync(p, 'utf8');

  if (code.includes('useAppTheme')) return;

  code = `import { useAppTheme } from '@/hooks/useAppTheme';\n` + code;

  // Change StyleSheet.create to a factory function
  code = code.replace(/const styles = StyleSheet\.create\(\{([\s\S]+?)\}\);/g, 'const useStyles = (colors: any) => StyleSheet.create({$1});');

  // Inject the hook and styles factory into the main export functions
  code = code.replace(/(export default function \w+\(.*?\)\s*\{)/g, `$1\n  const { colors } = useAppTheme();\n  const styles = useStyles(colors);\n`);
  code = code.replace(/(export const \w+: React\.FC\s*=\s*\(\)\s*=>\s*\{)/g, `$1\n  const { colors } = useAppTheme();\n  const styles = useStyles(colors);\n`);
  code = code.replace(/(export const \w+: React\.FC<.*?>\s*=\s*\(\{[\s\S]*?\}\)\s*=>\s*\{)/g, `$1\n  const { colors } = useAppTheme();\n  const styles = useStyles(colors);\n`);

  // Transform Theme.colors calls
  code = code.replace(/Theme\.colors/g, 'colors');

  // In components, static default props referring to dynamic colors must be stripped
  if (file === 'components/ProgressRing.tsx') {
      code = code.replace(/color = colors\.success/, 'color');
      code = code.replace(/backgroundColor = colors\.border/, 'backgroundColor');
      code = code.replace(/stroke=\{color\}/, 'stroke={color || colors.success}');
      code = code.replace(/stroke=\{backgroundColor\}/, 'stroke={backgroundColor || colors.border}');
  }

  fs.writeFileSync(p, code);
  console.log('Fixed', file);
});
