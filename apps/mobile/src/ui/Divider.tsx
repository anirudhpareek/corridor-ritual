import { StyleSheet, View } from 'react-native';

import { useTheme } from '../theme';

export function Divider() {
  const theme = useTheme();

  return <View style={[styles.base, { backgroundColor: theme.colors.softLine }]} />;
}

const styles = StyleSheet.create({
  base: {
    height: StyleSheet.hairlineWidth,
    width: '100%',
  },
});
