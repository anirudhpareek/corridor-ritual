import { ActivityIndicator, Pressable, StyleProp, StyleSheet, View, ViewStyle } from 'react-native';

import { useTheme } from '../theme';
import { Text } from './Text';

type Variant = 'primary' | 'secondary' | 'ghost' | 'quiet';

type Props = {
  label: string;
  onPress?: () => void;
  variant?: Variant;
  disabled?: boolean;
  loading?: boolean;
  style?: StyleProp<ViewStyle>;
  icon?: React.ReactNode;
  accessibilityHint?: string;
  accessibilityLabel?: string;
};

export function Button({
  accessibilityHint,
  accessibilityLabel,
  disabled,
  icon,
  label,
  loading,
  onPress,
  style,
  variant = 'primary',
}: Props) {
  const theme = useTheme();

  const variantStyle =
    variant === 'primary'
      ? {
          backgroundColor: theme.colors.primaryText,
          borderColor: theme.colors.primaryText,
          textColor: theme.colors.sheet,
        }
      : variant === 'secondary'
        ? {
            backgroundColor: theme.colors.elevated,
            borderColor: theme.colors.softLine,
            textColor: theme.colors.primaryText,
          }
        : variant === 'ghost'
          ? {
              backgroundColor: 'transparent',
              borderColor: 'transparent',
              textColor: theme.colors.primaryText,
            }
          : {
              backgroundColor: theme.colors.brassSoft,
              borderColor: 'transparent',
              textColor: theme.colors.inkSoft,
            };

  return (
    <Pressable
      accessibilityHint={accessibilityHint}
      accessibilityLabel={accessibilityLabel ?? label}
      accessibilityRole="button"
      accessibilityState={{ busy: loading, disabled: disabled || loading }}
      disabled={disabled || loading}
      onPress={onPress}
      style={({ pressed }) => [
        styles.base,
        {
          backgroundColor: variantStyle.backgroundColor,
          borderColor: variantStyle.borderColor,
          opacity: disabled ? 0.44 : pressed ? 0.84 : 1,
        },
        style,
      ]}>
      <View style={styles.content}>
        {loading ? <ActivityIndicator color={variantStyle.textColor} size="small" /> : icon}
        <Text style={{ color: variantStyle.textColor }} variant="label">
          {label}
        </Text>
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  base: {
    borderRadius: 999,
    borderWidth: 1,
    minHeight: 48,
    justifyContent: 'center',
    paddingHorizontal: 18,
  },
  content: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: 8,
    justifyContent: 'center',
  },
});
