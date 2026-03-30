import '@testing-library/jest-native/extend-expect';
import { jest } from '@jest/globals';
import mockSafeAreaContext from 'react-native-safe-area-context/jest/mock';

jest.mock('react-native-safe-area-context', () => mockSafeAreaContext);
jest.mock('react-native-reanimated', () => require('react-native-reanimated/mock'));

jest.mock('expo-router', () => ({
  router: {
    back: jest.fn(),
    push: jest.fn(),
    replace: jest.fn(),
  },
}));

jest.mock('@gorhom/bottom-sheet', () => {
  const React = require('react');
  const { ScrollView, View } = require('react-native');

  const BottomSheetModal = React.forwardRef(({ children }: { children?: unknown }, ref: any) => {
    React.useImperativeHandle(ref, () => ({
      dismiss: jest.fn(),
      present: jest.fn(),
    }));

    return React.createElement(View, null, children);
  });

  return {
    BottomSheetBackdrop: () => null,
    BottomSheetModal,
    BottomSheetModalProvider: ({ children }: { children?: unknown }) => children,
    BottomSheetScrollView: ({ children, ...props }: { children?: unknown }) =>
      React.createElement(ScrollView, props, children),
  };
});

jest.mock('expo-camera', () => {
  const React = require('react');
  const { View } = require('react-native');

  return {
    CameraView: ({ children }: { children?: unknown }) => React.createElement(View, null, children),
    useCameraPermissions: () => [{ granted: false }, () => Promise.resolve({ granted: false })],
  };
});
