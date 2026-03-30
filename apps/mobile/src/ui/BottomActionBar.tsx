import { LinearGradient } from 'expo-linear-gradient';
import { PropsWithChildren } from 'react';
import { StyleProp, StyleSheet, View, ViewStyle } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { useTheme } from '../theme';

type Props = PropsWithChildren<{
  style?: StyleProp<ViewStyle>;
}>;

export function BottomActionBar({ children, style }: Props) {
  const theme = useTheme();
  const insets = useSafeAreaInsets();

  return (
    <View
      style={[
        styles.base,
        {
          backgroundColor: theme.colors.sheet,
          borderTopColor: theme.colors.softLine,
          paddingBottom: Math.max(insets.bottom, 12),
        },
        theme.shadow.sheet,
        style,
      ]}>
      <LinearGradient
        colors={['rgba(255,255,255,0)', 'rgba(154,115,86,0.08)', 'rgba(255,255,255,0)']}
        end={{ x: 1, y: 0.5 }}
        start={{ x: 0, y: 0.5 }}
        style={styles.seam}
      />
      <View style={[styles.inner, { maxWidth: theme.layout.maxWidth }]}>{children}</View>
    </View>
  );
}

const styles = StyleSheet.create({
  base: {
    borderTopWidth: StyleSheet.hairlineWidth,
    paddingHorizontal: 20,
    paddingTop: 16,
    position: 'relative',
  },
  seam: {
    height: 1,
    left: 20,
    position: 'absolute',
    right: 20,
    top: 0,
  },
  inner: {
    alignSelf: 'center',
    width: '100%',
  },
});
