import { ArrowRight } from 'lucide-react-native';
import { ReactNode } from 'react';
import { StyleSheet, View } from 'react-native';

import { useTheme } from '../theme';
import { Button } from './Button';
import { Text } from './Text';

type Props = {
  icon?: ReactNode;
  title: string;
  description: string;
  actionLabel?: string;
  onActionPress?: () => void;
};

export function EmptyState({ actionLabel, description, icon, onActionPress, title }: Props) {
  const theme = useTheme();

  return (
    <View style={[styles.container, { borderColor: theme.colors.softLine, backgroundColor: theme.colors.elevated }]}>
      {icon ? <View style={[styles.icon, { backgroundColor: theme.colors.sheet }]}>{icon}</View> : null}
      <Text style={styles.title} variant="title">
        {title}
      </Text>
      <Text color="muted" style={styles.description}>
        {description}
      </Text>
      {actionLabel ? (
        <View style={styles.hintRow}>
          <ArrowRight color={theme.colors.brass} size={14} strokeWidth={1.9} />
          <Text color="brass" variant="caption">
            Continue with the next clear step
          </Text>
        </View>
      ) : null}
      {actionLabel ? <Button label={actionLabel} onPress={onActionPress} style={styles.action} variant="secondary" /> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    borderRadius: 24,
    borderWidth: 1,
    justifyContent: 'center',
    paddingHorizontal: 20,
    paddingVertical: 32,
  },
  icon: {
    alignItems: 'center',
    borderRadius: 999,
    height: 44,
    justifyContent: 'center',
    marginBottom: 12,
    width: 44,
  },
  title: {
    textAlign: 'center',
  },
  description: {
    marginTop: 8,
    textAlign: 'center',
  },
  hintRow: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: 6,
    marginTop: 16,
  },
  action: {
    marginTop: 18,
  },
});
