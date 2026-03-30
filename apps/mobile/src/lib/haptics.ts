import * as Haptics from 'expo-haptics';
import { Platform } from 'react-native';

export async function triggerHaptic(type: 'soft' | 'success' | 'error') {
  if (Platform.OS === 'web') {
    return;
  }

  if (type === 'success') {
    await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    return;
  }

  if (type === 'error') {
    await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
    return;
  }

  await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
}
