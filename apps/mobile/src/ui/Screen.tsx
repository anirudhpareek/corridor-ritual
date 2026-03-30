import { PropsWithChildren } from 'react';
import { RefreshControl, ScrollView, StyleProp, StyleSheet, View, ViewStyle } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';

import { useTheme } from '../theme';

type Ornament = 'plain' | 'home' | 'wallet' | 'pay' | 'trips';

type Props = PropsWithChildren<{
  scroll?: boolean;
  contentContainerStyle?: StyleProp<ViewStyle>;
  style?: StyleProp<ViewStyle>;
  refreshing?: boolean;
  onRefresh?: () => void;
  ornament?: Ornament;
}>;

export function Screen({
  children,
  scroll = true,
  contentContainerStyle,
  style,
  refreshing = false,
  onRefresh,
  ornament = 'plain',
}: Props) {
  const theme = useTheme();
  const ornamentStyle =
    ornament === 'home'
      ? {
          primary: theme.colors.brassSoft,
          secondary: theme.colors.successSoft,
          tertiary: 'rgba(154, 115, 86, 0.08)',
        }
      : ornament === 'wallet'
        ? {
            primary: 'rgba(154, 115, 86, 0.14)',
            secondary: 'rgba(54, 86, 73, 0.08)',
            tertiary: 'rgba(255, 253, 248, 0.72)',
          }
        : ornament === 'pay'
          ? {
              primary: 'rgba(43, 38, 33, 0.1)',
              secondary: 'rgba(154, 115, 86, 0.12)',
              tertiary: 'rgba(54, 86, 73, 0.06)',
            }
          : ornament === 'trips'
            ? {
                primary: 'rgba(54, 86, 73, 0.12)',
                secondary: 'rgba(154, 115, 86, 0.1)',
                tertiary: 'rgba(255, 253, 248, 0.72)',
              }
          : {
              primary: 'rgba(154, 115, 86, 0.08)',
              secondary: 'rgba(255, 253, 248, 0.72)',
              tertiary: 'rgba(54, 86, 73, 0.04)',
            };

  const content = (
    <View style={styles.contentWrap}>
      <View
        style={[
          styles.content,
          {
            maxWidth: theme.layout.maxWidth,
            paddingBottom: theme.layout.tabBarHeight + 40,
          },
          contentContainerStyle,
        ]}>
        {children}
      </View>
    </View>
  );

  return (
    <SafeAreaView edges={['top']} style={[styles.safeArea, { backgroundColor: theme.colors.canvas }, style]}>
      <View pointerEvents="none" style={styles.ornamentLayer}>
        <LinearGradient
          colors={[ornamentStyle.primary, 'rgba(244,239,231,0)']}
          end={{ x: 0.9, y: 0.75 }}
          start={{ x: 0.2, y: 0 }}
          style={styles.topWash}
        />
        <View style={[styles.glow, styles.glowLeft, { backgroundColor: ornamentStyle.secondary }]} />
        <View style={[styles.glow, styles.glowRight, { backgroundColor: ornamentStyle.tertiary }]} />
      </View>
      {scroll ? (
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled"
          refreshControl={
            onRefresh ? (
              <RefreshControl
                colors={[theme.colors.brass]}
                onRefresh={onRefresh}
                progressBackgroundColor={theme.colors.sheet}
                refreshing={refreshing}
                tintColor={theme.colors.brass}
              />
            ) : undefined
          }
          showsVerticalScrollIndicator={false}>
          {content}
        </ScrollView>
      ) : (
        content
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
  },
  ornamentLayer: {
    ...StyleSheet.absoluteFillObject,
  },
  topWash: {
    height: 220,
    left: 0,
    position: 'absolute',
    right: 0,
    top: 0,
  },
  glow: {
    borderRadius: 999,
    position: 'absolute',
  },
  glowLeft: {
    height: 240,
    left: -70,
    top: 84,
    width: 240,
  },
  glowRight: {
    height: 300,
    right: -110,
    top: 180,
    width: 300,
  },
  contentWrap: {
    flexGrow: 1,
    width: '100%',
  },
  content: {
    alignSelf: 'center',
    flexGrow: 1,
    paddingHorizontal: 20,
    paddingTop: 10,
    width: '100%',
  },
});
