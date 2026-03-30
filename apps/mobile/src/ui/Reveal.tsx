import { PropsWithChildren, useEffect, useRef } from 'react';
import { Animated, Easing, StyleProp, View, ViewStyle } from 'react-native';

import { useTheme } from '../theme';

type Props = PropsWithChildren<{
  delay?: number;
  distance?: number;
  style?: StyleProp<ViewStyle>;
}>;

export function Reveal({ children, delay = 0, distance = 18, style }: Props) {
  const theme = useTheme();
  const isTest = process.env.NODE_ENV === 'test';
  const opacity = useRef(new Animated.Value(0)).current;
  const translateY = useRef(new Animated.Value(distance)).current;

  useEffect(() => {
    if (isTest) {
      return;
    }

    opacity.setValue(0);
    translateY.setValue(distance);

    const animation = Animated.parallel([
      Animated.timing(opacity, {
        toValue: 1,
        duration: theme.motion.entrance,
        delay,
        easing: Easing.out(Easing.cubic),
        useNativeDriver: true,
      }),
      Animated.timing(translateY, {
        toValue: 0,
        duration: theme.motion.entrance + 40,
        delay,
        easing: Easing.bezier(0.16, 1, 0.3, 1),
        useNativeDriver: true,
      }),
    ]);

    animation.start();

    return () => {
      animation.stop();
    };
  }, [delay, distance, isTest, opacity, theme.motion.entrance, translateY]);

  if (isTest) {
    return <View style={style}>{children}</View>;
  }

  return (
    <Animated.View
      style={[
        style,
        {
          opacity,
          transform: [{ translateY }],
        },
      ]}>
      {children}
    </Animated.View>
  );
}
