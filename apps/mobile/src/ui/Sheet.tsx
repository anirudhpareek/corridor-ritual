import { BottomSheetBackdrop, BottomSheetModal, BottomSheetScrollView } from '@gorhom/bottom-sheet';
import { forwardRef, ReactNode, useMemo } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';
import { X } from 'lucide-react-native';

import { useTheme } from '../theme';
import { Text } from './Text';

type Props = {
  title: string;
  subtitle?: string;
  snapPoints?: Array<string | number>;
  children: ReactNode;
};

export const Sheet = forwardRef<BottomSheetModal, Props>(function Sheet(
  { children, snapPoints = ['56%'], subtitle, title },
  ref,
) {
  const theme = useTheme();
  const points = useMemo(() => snapPoints, [snapPoints]);

  return (
    <BottomSheetModal
      backdropComponent={(props) => <BottomSheetBackdrop {...props} disappearsOnIndex={-1} opacity={0.18} />}
      backgroundStyle={{ backgroundColor: theme.colors.sheet }}
      enablePanDownToClose
      handleIndicatorStyle={{ backgroundColor: theme.colors.softLine, width: 42 }}
      ref={ref}
      snapPoints={points}>
      <BottomSheetScrollView contentContainerStyle={styles.content}>
        <View style={styles.header}>
          <View style={styles.headerCopy}>
            <Text variant="title">{title}</Text>
            {subtitle ? (
              <Text color="muted" style={styles.subtitle}>
                {subtitle}
              </Text>
            ) : null}
          </View>
          <Pressable onPress={() => ref && 'current' in ref && ref.current?.dismiss()} style={styles.close}>
            <X color={theme.colors.mutedText} size={18} />
          </Pressable>
        </View>
        {children}
      </BottomSheetScrollView>
    </BottomSheetModal>
  );
});

const styles = StyleSheet.create({
  content: {
    gap: 18,
    paddingBottom: 32,
    paddingHorizontal: 20,
  },
  header: {
    alignItems: 'flex-start',
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingTop: 2,
  },
  headerCopy: {
    flex: 1,
    paddingRight: 12,
  },
  subtitle: {
    marginTop: 6,
  },
  close: {
    alignItems: 'center',
    borderRadius: 999,
    height: 30,
    justifyContent: 'center',
    width: 30,
  },
});
