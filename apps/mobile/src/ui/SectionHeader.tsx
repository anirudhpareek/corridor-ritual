import { ArrowRight } from 'lucide-react-native';
import { Pressable, StyleSheet, View } from 'react-native';

import { useTheme } from '../theme';
import { Text } from './Text';

type Props = {
  title: string;
  subtitle?: string;
  eyebrow?: string;
  actionLabel?: string;
  onActionPress?: () => void;
};

export function SectionHeader({ actionLabel, eyebrow, onActionPress, subtitle, title }: Props) {
  const theme = useTheme();

  return (
    <View style={styles.row}>
      <View style={styles.copy}>
        {eyebrow ? (
          <View style={styles.kickerRow}>
            <View style={[styles.kickerLine, { backgroundColor: theme.colors.brass }]} />
            <Text color="brass" variant="caption">
              {eyebrow}
            </Text>
          </View>
        ) : null}
        <Text variant="section">{title}</Text>
        {subtitle ? (
          <Text color="muted" style={styles.subtitle}>
            {subtitle}
          </Text>
        ) : null}
      </View>
      {actionLabel ? (
        <Pressable onPress={onActionPress} style={styles.action}>
          <Text color="brass" variant="caption">
            {actionLabel}
          </Text>
          <ArrowRight color={theme.colors.brass} size={14} strokeWidth={1.8} />
        </Pressable>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    alignItems: 'flex-end',
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 14,
  },
  copy: {
    flex: 1,
    paddingRight: 12,
  },
  kickerRow: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: 8,
    marginBottom: 6,
  },
  kickerLine: {
    borderRadius: 999,
    height: 1.5,
    width: 18,
  },
  subtitle: {
    marginTop: 4,
  },
  action: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: 4,
  },
});
