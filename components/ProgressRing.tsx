import { useAppTheme } from '@/hooks/useAppTheme';
import React, { useEffect } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import Svg, { Circle } from 'react-native-svg';
import Animated, {
  useAnimatedProps,
  useSharedValue,
  withSpring,
} from 'react-native-reanimated';
import { Theme } from '@/constants/theme';

const AnimatedCircle = Animated.createAnimatedComponent(Circle);

interface ProgressRingProps {
  size?: number;
  strokeWidth?: number;
  progress: number; // 0 to 1
  color?: string;
  backgroundColor?: string;
  showText?: boolean;
}

export const ProgressRing: React.FC<ProgressRingProps> = ({
  size = 120,
  strokeWidth = 10,
  progress,
  color,
  backgroundColor,
  showText = true,
}) => {
  const { colors } = useAppTheme();
  const styles = useStyles(colors);

  const radius = (size - strokeWidth) / 2;
  const circumference = radius * 2 * Math.PI;

  const animatedProgress = useSharedValue(0);

  useEffect(() => {
    animatedProgress.value = withSpring(progress, {
      damping: 17,
      stiffness: 90,
    });
  }, [progress, animatedProgress]);

  const animatedProps = useAnimatedProps(() => {
    // Math.max to prevent weird SVG visual bugs when percentage is exactly 0
    const boundedProgress = Math.max(0.001, animatedProgress.value); 
    const strokeDashoffset = circumference - boundedProgress * circumference;
    return {
      strokeDashoffset,
    };
  });

  // Dynamically scale font size and container for percentage text
  const percentFontSize = Math.max(12, size * 0.22); // 22% of ring size, min 12
  const percentMaxWidth = size * 0.7; // 70% of ring size

  return (
    <View style={{ width: size, height: size, justifyContent: 'center', alignItems: 'center' }}>
      <Svg width={size} height={size}>
        {/* Background Circle */}
        <Circle
          stroke={backgroundColor || colors.border}
          fill="none"
          cx={size / 2}
          cy={size / 2}
          r={radius}
          strokeWidth={strokeWidth}
        />
        {/* Progress Circle */}
        <AnimatedCircle
          stroke={color || colors.success}
          fill="none"
          cx={size / 2}
          cy={size / 2}
          r={radius}
          strokeWidth={strokeWidth}
          strokeDasharray={circumference}
          strokeLinecap="round"
          animatedProps={animatedProps}
          originX={size / 2}
          originY={size / 2}
          rotation="-90"
        />
      </Svg>
      {showText && (
        <View style={[StyleSheet.absoluteFill, styles.textContainer]}>
          <Text
            style={[
              styles.percentageText,
              {
                fontSize: percentFontSize,
                maxWidth: percentMaxWidth,
                textAlign: 'center',
                includeFontPadding: false,
                textAlignVertical: 'center',
              },
            ]}
            numberOfLines={1}
            adjustsFontSizeToFit
            minimumFontScale={0.5}
          >
            {Math.round(progress * 100)}%
          </Text>
        </View>
      )}
    </View>
  );
};

const useStyles = (colors: any) => StyleSheet.create({
  textContainer: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  percentageText: {
    fontFamily: Theme.typography.fontFamily.bold,
    fontSize: Theme.typography.sizes.xl,
    color: colors.text,
  },
});
