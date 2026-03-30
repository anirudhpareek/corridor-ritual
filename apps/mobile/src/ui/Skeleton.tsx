import { LinearGradient } from 'expo-linear-gradient';
import { useEffect, useRef } from 'react';
import { Animated, StyleProp, StyleSheet, View, ViewStyle } from 'react-native';

import { useTheme } from '../theme';

type Props = {
  height: number;
  width?: number | `${number}%` | 'auto';
  radius?: number;
  style?: StyleProp<ViewStyle>;
};

export function Skeleton({ height, radius = 16, style, width = '100%' }: Props) {
  const theme = useTheme();
  const opacity = useRef(new Animated.Value(0.7)).current;
  const translateX = useRef(new Animated.Value(-180)).current;

  useEffect(() => {
    const animation = Animated.loop(
      Animated.parallel([
        Animated.sequence([
          Animated.timing(opacity, {
            duration: 900,
            toValue: 0.92,
            useNativeDriver: true,
          }),
          Animated.timing(opacity, {
            duration: 900,
            toValue: 0.62,
            useNativeDriver: true,
          }),
        ]),
        Animated.sequence([
          Animated.timing(translateX, {
            duration: 1200,
            toValue: 240,
            useNativeDriver: true,
          }),
          Animated.timing(translateX, {
            duration: 0,
            toValue: -180,
            useNativeDriver: true,
          }),
        ]),
      ]),
    );

    animation.start();

    return () => animation.stop();
  }, [opacity, translateX]);

  return (
    <View
      style={[
        styles.base,
        {
          backgroundColor: theme.colors.elevated,
          borderColor: theme.colors.softLine,
          borderRadius: radius,
          height,
          width,
        },
        style,
      ]}>
      <Animated.View
        style={[
          StyleSheet.absoluteFillObject,
          {
            opacity,
          },
        ]}>
        <View style={[styles.tintLayer, { backgroundColor: theme.colors.brassSoft }]} />
        <Animated.View
          style={[
            styles.shimmerWrap,
            {
              transform: [{ translateX }],
            },
          ]}>
          <LinearGradient
            colors={['rgba(255,255,255,0)', 'rgba(255,255,255,0.42)', 'rgba(255,255,255,0)']}
            end={{ x: 1, y: 0.6 }}
            start={{ x: 0, y: 0.4 }}
            style={styles.shimmer}
          />
        </Animated.View>
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  base: {
    borderWidth: 1,
    overflow: 'hidden',
  },
  tintLayer: {
    ...StyleSheet.absoluteFillObject,
  },
  shimmerWrap: {
    bottom: -20,
    position: 'absolute',
    top: -20,
    width: 180,
  },
  shimmer: {
    flex: 1,
    transform: [{ skewX: '-18deg' }],
  },
});
