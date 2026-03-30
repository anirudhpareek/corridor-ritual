import { BlurView } from 'expo-blur';
import { LinearGradient } from 'expo-linear-gradient';
import { router } from 'expo-router';
import type { BottomTabBarProps } from '@react-navigation/bottom-tabs';
import { Home, MapPinned, QrCode, UserRound, Wallet } from 'lucide-react-native';
import { Pressable, StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { triggerHaptic } from '../lib/haptics';
import { useTheme } from '../theme';
import { Text } from '../ui/Text';

const routeMeta = {
  index: { icon: Home, label: 'Home' },
  trips: { icon: MapPinned, label: 'Trips' },
  wallet: { icon: Wallet, label: 'Wallet' },
  profile: { icon: UserRound, label: 'Profile' },
} as const;

export function FloatingTabBar({ navigation, state }: BottomTabBarProps) {
  const theme = useTheme();
  const insets = useSafeAreaInsets();
  const visibleRoutes = state.routes.filter((route) => route.name in routeMeta);
  const leftRoutes = visibleRoutes.slice(0, 2);
  const rightRoutes = visibleRoutes.slice(2);
  const renderTab = (route: (typeof visibleRoutes)[number]) => {
    const index = state.routes.findIndex((candidate) => candidate.key === route.key);
    const meta = routeMeta[route.name as keyof typeof routeMeta];
    const focused = state.index === index;
    const Icon = meta.icon;

    return (
      <Pressable
        key={route.key}
        onPress={() => {
          void triggerHaptic('soft');
          navigation.navigate(route.name);
        }}
        style={[
          styles.tab,
          focused
            ? {
                backgroundColor: theme.colors.elevated,
                borderColor: theme.colors.softLine,
              }
            : null,
        ]}>
        <Icon color={focused ? theme.colors.primaryText : theme.colors.mutedText} size={18} strokeWidth={1.9} />
        <Text color={focused ? 'primary' : 'muted'} variant="caption">
          {meta.label}
        </Text>
      </Pressable>
    );
  };

  return (
    <View pointerEvents="box-none" style={[styles.container, { paddingBottom: Math.max(insets.bottom, 10) }]}>
      <View style={[styles.inner, { maxWidth: theme.layout.maxWidth }]}>
        <BlurView intensity={40} style={[styles.bar, { borderColor: theme.colors.softLine }]} tint="light">
          <View style={styles.tabGroup}>{leftRoutes.map(renderTab)}</View>
          <View style={styles.centerGap} />
          <View style={styles.tabGroup}>{rightRoutes.map(renderTab)}</View>
        </BlurView>

        <Pressable
          onPress={() => {
            void triggerHaptic('soft');
            router.push('/pay');
          }}
          style={[styles.payButtonWrap, theme.shadow.lifted]}>
          <LinearGradient colors={['#AC8466', '#8B664B']} style={styles.payButton}>
            <QrCode color={theme.colors.sheet} size={20} strokeWidth={2.2} />
            <Text color="sheet" variant="label">
              Pay
            </Text>
          </LinearGradient>
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    bottom: 0,
    left: 0,
    paddingHorizontal: 20,
    position: 'absolute',
    right: 0,
  },
  inner: {
    width: '100%',
  },
  bar: {
    alignItems: 'center',
    borderRadius: 28,
    borderWidth: 1,
    flexDirection: 'row',
    justifyContent: 'space-between',
    overflow: 'hidden',
    paddingHorizontal: 16,
    paddingVertical: 16,
  },
  tabGroup: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: 8,
  },
  centerGap: {
    minWidth: 88,
  },
  tab: {
    alignItems: 'center',
    borderRadius: 18,
    borderWidth: 1,
    borderColor: 'transparent',
    gap: 6,
    minWidth: 74,
    paddingHorizontal: 12,
    paddingVertical: 10,
  },
  payButtonWrap: {
    alignSelf: 'center',
    marginTop: -66,
  },
  payButton: {
    alignItems: 'center',
    borderRadius: 999,
    flexDirection: 'row',
    gap: 8,
    paddingHorizontal: 22,
    paddingVertical: 16,
  },
});
