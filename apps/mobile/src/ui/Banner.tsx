import { LinearGradient } from 'expo-linear-gradient';
import { ReactNode } from 'react';
import { StyleSheet, View } from 'react-native';

import { useTheme } from '../theme';
import { Text } from './Text';

type Tone = 'neutral' | 'success' | 'warning' | 'danger';

type Props = {
  title: string;
  description: string;
  icon?: ReactNode;
  tone?: Tone;
};

export function Banner({ description, icon, title, tone = 'neutral' }: Props) {
  const theme = useTheme();

  const colors =
    tone === 'success'
      ? { backgroundColor: theme.colors.successSoft, borderColor: theme.colors.success, accentColor: theme.colors.success }
      : tone === 'warning'
        ? { backgroundColor: theme.colors.pendingSoft, borderColor: theme.colors.pending, accentColor: theme.colors.pending }
        : tone === 'danger'
          ? { backgroundColor: theme.colors.dangerSoft, borderColor: theme.colors.danger, accentColor: theme.colors.danger }
          : { backgroundColor: theme.colors.elevated, borderColor: theme.colors.softLine, accentColor: theme.colors.brass };

  return (
    <View style={[styles.base, { backgroundColor: colors.backgroundColor, borderColor: colors.borderColor }]}>
      <LinearGradient
        colors={['rgba(255,255,255,0)', colors.accentColor + '22', 'rgba(255,255,255,0)']}
        end={{ x: 1, y: 0.5 }}
        start={{ x: 0, y: 0.5 }}
        style={styles.seam}
      />
      {icon ? <View style={[styles.icon, { backgroundColor: theme.colors.sheet }]}>{icon}</View> : null}
      <View style={styles.copy}>
        <View style={styles.header}>
          <View style={[styles.dot, { backgroundColor: colors.accentColor }]} />
          <Text variant="label">{title}</Text>
        </View>
        <Text color="muted" style={styles.description}>
          {description}
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  base: {
    borderRadius: 18,
    borderWidth: 1,
    flexDirection: 'row',
    gap: 12,
    overflow: 'hidden',
    paddingHorizontal: 14,
    paddingVertical: 14,
    position: 'relative',
  },
  seam: {
    height: 1,
    left: 14,
    position: 'absolute',
    right: 14,
    top: 0,
  },
  icon: {
    alignItems: 'center',
    borderRadius: 999,
    height: 34,
    justifyContent: 'center',
    width: 34,
  },
  copy: {
    flex: 1,
  },
  header: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: 8,
  },
  dot: {
    borderRadius: 999,
    height: 6,
    width: 6,
  },
  description: {
    marginTop: 4,
  },
});
