import { ReactNode } from 'react';
import { StyleProp, StyleSheet, Text as RNText, TextProps as RNTextProps, TextStyle } from 'react-native';

import { useTheme } from '../theme';

type Variant = 'display' | 'title' | 'section' | 'body' | 'label' | 'caption';
type ColorTone = 'primary' | 'muted' | 'brass' | 'forest' | 'danger' | 'success' | 'sheet';

type Props = RNTextProps & {
  children: ReactNode;
  color?: ColorTone;
  variant?: Variant;
  style?: StyleProp<TextStyle>;
};

export function Text({ children, color = 'primary', style, variant = 'body', ...rest }: Props) {
  const theme = useTheme();

  const colorStyle = {
    color:
      color === 'muted'
        ? theme.colors.mutedText
        : color === 'brass'
          ? theme.colors.brass
          : color === 'forest'
            ? theme.colors.forest
            : color === 'danger'
              ? theme.colors.danger
              : color === 'success'
                ? theme.colors.success
                : color === 'sheet'
                  ? theme.colors.sheet
                  : theme.colors.primaryText,
  };

  const variantStyle =
    variant === 'display'
      ? theme.typography.display
      : variant === 'title'
        ? theme.typography.title
        : variant === 'section'
          ? theme.typography.section
          : variant === 'label'
            ? theme.typography.label
            : variant === 'caption'
              ? theme.typography.caption
              : theme.typography.body;

  return (
    <RNText {...rest} style={[styles.base, variantStyle, colorStyle, style]}>
      {children}
    </RNText>
  );
}

const styles = StyleSheet.create({
  base: {
    includeFontPadding: false,
  },
});
