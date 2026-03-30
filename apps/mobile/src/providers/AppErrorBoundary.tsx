import React, { PropsWithChildren } from 'react';
import { RotateCcw } from 'lucide-react-native';
import { StyleSheet, View } from 'react-native';

import { theme } from '../theme';
import { Button } from '../ui/Button';
import { Card } from '../ui/Card';
import { Text } from '../ui/Text';

type State = {
  error: Error | null;
};

export class AppErrorBoundary extends React.Component<PropsWithChildren, State> {
  state: State = {
    error: null,
  };

  static getDerivedStateFromError(error: Error) {
    return { error };
  }

  render() {
    if (!this.state.error) {
      return this.props.children;
    }

    return (
      <View style={styles.container}>
        <Card style={styles.card} variant="hero">
          <View style={[styles.iconWrap, { backgroundColor: theme.colors.sheet }]}>
            <RotateCcw color={theme.colors.brass} size={20} strokeWidth={2} />
          </View>
          <Text color="brass" variant="caption">
            Preview safeguard
          </Text>
          <Text variant="display">A quiet reset is needed.</Text>
          <Text color="muted" style={styles.body}>
            {this.state.error.message}
          </Text>
          <Button
            accessibilityHint="Clear the current error state and render the app again"
            label="Try again"
            onPress={() => this.setState({ error: null })}
            style={styles.button}
          />
        </Card>
      </View>
    );
  }
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    backgroundColor: theme.colors.canvas,
    flex: 1,
    justifyContent: 'center',
    paddingHorizontal: 24,
  },
  card: {
    gap: 14,
    maxWidth: 440,
    width: '100%',
  },
  iconWrap: {
    alignItems: 'center',
    borderRadius: 999,
    height: 44,
    justifyContent: 'center',
    width: 44,
  },
  body: {
    maxWidth: 360,
  },
  button: {
    marginTop: 6,
  },
});
