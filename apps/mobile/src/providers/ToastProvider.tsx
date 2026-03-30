import { createContext, PropsWithChildren, useContext, useEffect, useMemo, useRef, useState } from 'react';
import { Animated, Easing, StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { useTheme } from '../theme';
import { Text } from '../ui/Text';

type ToastTone = 'neutral' | 'success' | 'error';

type ToastMessage = {
  id: string;
  title: string;
  description?: string;
  tone?: ToastTone;
};

type ToastContextValue = {
  showToast: (input: Omit<ToastMessage, 'id'>) => void;
};

const ToastContext = createContext<ToastContextValue>({
  showToast: () => undefined,
});

function ToastCard({ message }: { message: ToastMessage }) {
  const theme = useTheme();
  const opacity = useRef(new Animated.Value(0)).current;
  const translateY = useRef(new Animated.Value(-12)).current;

  useEffect(() => {
    const animation = Animated.parallel([
      Animated.timing(opacity, {
        toValue: 1,
        duration: theme.motion.soft + 60,
        easing: Easing.bezier(0.16, 1, 0.3, 1),
        useNativeDriver: true,
      }),
      Animated.timing(translateY, {
        toValue: 0,
        duration: theme.motion.soft + 60,
        easing: Easing.bezier(0.16, 1, 0.3, 1),
        useNativeDriver: true,
      }),
    ]);

    animation.start();

    return () => {
      animation.stop();
    };
  }, [opacity, theme.motion.soft, translateY]);

  const toneStyle =
    message.tone === 'success'
      ? {
          backgroundColor: theme.colors.successSoft,
          borderColor: theme.colors.success,
          dotColor: theme.colors.success,
          eyebrow: 'Ready',
        }
      : message.tone === 'error'
        ? {
            backgroundColor: theme.colors.dangerSoft,
            borderColor: theme.colors.danger,
            dotColor: theme.colors.danger,
            eyebrow: 'Attention',
          }
        : {
            backgroundColor: theme.colors.sheet,
            borderColor: theme.colors.softLine,
            dotColor: theme.colors.brass,
            eyebrow: 'Update',
          };

  return (
    <Animated.View
      style={[
        styles.toast,
        {
          backgroundColor: toneStyle.backgroundColor,
          borderColor: toneStyle.borderColor,
          opacity,
          transform: [{ translateY }],
        },
        theme.shadow.soft,
      ]}>
      <View style={styles.toastHeader}>
        <View style={[styles.toastDot, { backgroundColor: toneStyle.dotColor }]} />
        <Text color="muted" variant="caption">
          {toneStyle.eyebrow}
        </Text>
      </View>
      <Text variant="label">{message.title}</Text>
      {message.description ? (
        <Text color="muted" style={styles.toastDescription}>
          {message.description}
        </Text>
      ) : null}
    </Animated.View>
  );
}

export function ToastProvider({ children }: PropsWithChildren) {
  const [messages, setMessages] = useState<ToastMessage[]>([]);
  const insets = useSafeAreaInsets();
  const nextIdRef = useRef(0);
  const timeoutRefs = useRef<Record<string, ReturnType<typeof setTimeout>>>({});

  useEffect(() => {
    return () => {
      Object.values(timeoutRefs.current).forEach((timeout) => clearTimeout(timeout));
      timeoutRefs.current = {};
    };
  }, []);

  const contextValue = useMemo<ToastContextValue>(
    () => ({
      showToast: ({ title, description, tone = 'neutral' }) => {
        nextIdRef.current += 1;
        const id = `toast_${nextIdRef.current}`;

        setMessages((current) => [...current, { id, title, description, tone }].slice(-3));

        timeoutRefs.current[id] = setTimeout(() => {
          setMessages((current) => current.filter((message) => message.id !== id));
          delete timeoutRefs.current[id];
        }, 3200);
      },
    }),
    [],
  );

  return (
    <ToastContext.Provider value={contextValue}>
      {children}
      <View pointerEvents="box-none" style={[styles.overlay, { top: insets.top + 12 }]}>
        {messages.map((message) => (
          <ToastCard key={message.id} message={message} />
        ))}
      </View>
    </ToastContext.Provider>
  );
}

export function useToast() {
  return useContext(ToastContext);
}

const styles = StyleSheet.create({
  overlay: {
    alignItems: 'center',
    left: 0,
    position: 'absolute',
    right: 0,
    zIndex: 30,
    gap: 10,
    paddingHorizontal: 16,
  },
  toast: {
    borderRadius: 20,
    borderWidth: 1,
    maxWidth: 560,
    paddingHorizontal: 16,
    paddingVertical: 14,
    width: '100%',
  },
  toastHeader: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: 6,
    marginBottom: 8,
  },
  toastDot: {
    borderRadius: 999,
    height: 6,
    width: 6,
  },
  toastDescription: {
    marginTop: 4,
  },
});
