import { PropsWithChildren } from 'react';
import { StyleProp, StyleSheet, View, ViewStyle } from 'react-native';

import { useTheme } from '../theme';

type Variant = 'default' | 'hero' | 'quiet';

type Props = PropsWithChildren<{
  style?: StyleProp<ViewStyle>;
  variant?: Variant;
}>;

export function Card({ children, style, variant = 'default' }: Props) {
  const theme = useTheme();

  const variantStyle =
    variant === 'hero'
      ? { backgroundColor: theme.colors.elevated, borderColor: 'transparent', ...theme.shadow.lifted }
      : variant === 'quiet'
        ? { backgroundColor: 'rgba(255,255,255,0.42)', borderColor: 'transparent' }
        : { backgroundColor: theme.colors.sheet, borderColor: theme.colors.softLine, ...theme.shadow.soft };

  return <View style={[styles.base, variantStyle, style]}>{children}</View>;
}

const styles = StyleSheet.create({
  base: {
    borderRadius: 24,
    borderWidth: 1,
    padding: 18,
  },
});
