import React, { createContext, useContext, useMemo } from 'react';
import { Dimensions, Platform } from 'react-native';
import {
  SafeAreaProvider,
  useSafeAreaInsets,
  type EdgeInsets,
} from 'react-native-safe-area-context';

export const TAB_BAR_BASE_HEIGHT = Platform.OS === 'android' ? 60 : 52;
const ANDROID_NAV_BAR_FALLBACK = 48;

export function resolveBottomInset(insets: EdgeInsets): number {
  if (Platform.OS !== 'android') {
    return insets.bottom;
  }

  if (insets.bottom > 0) {
    return insets.bottom;
  }

  const screen = Dimensions.get('screen');
  const window = Dimensions.get('window');

  // Non-edge-to-edge: the window already ends above the system nav bar.
  if (screen.height - window.height > 1) {
    return 0;
  }

  // Edge-to-edge: content draws behind the nav bar; fallback for 3-button nav.
  return ANDROID_NAV_BAR_FALLBACK;
}

type BasePaddingToInsetContextType = {
  insets: EdgeInsets;
  bottomInset: number;
  tabBarHeight: number;
  tabBarPaddingBottom: number;
  contentPadding: {
    paddingTop: number;
    paddingBottom: number;
    paddingLeft: number;
    paddingRight: number;
  };
};

const BasePaddingToInsetContext =
  createContext<BasePaddingToInsetContextType | null>(null);

function BasePaddingToInsetInner({ children }: { children: React.ReactNode }) {
  const insets = useSafeAreaInsets();

  const value = useMemo(() => {
    const bottomInset = resolveBottomInset(insets);

    return {
      insets,
      bottomInset,
      tabBarHeight: TAB_BAR_BASE_HEIGHT + bottomInset,
      tabBarPaddingBottom: bottomInset,
      contentPadding: {
        paddingTop: insets.top,
        paddingBottom: bottomInset,
        paddingLeft: insets.left,
        paddingRight: insets.right,
      },
    };
  }, [insets]);

  return (
    <BasePaddingToInsetContext.Provider value={value}>
      {children}
    </BasePaddingToInsetContext.Provider>
  );
}

export function BasePaddingToInsetProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <SafeAreaProvider>
      <BasePaddingToInsetInner>{children}</BasePaddingToInsetInner>
    </SafeAreaProvider>
  );
}

export function useBasePaddingToInset() {
  const context = useContext(BasePaddingToInsetContext);
  if (!context) {
    throw new Error(
      'useBasePaddingToInset must be used within BasePaddingToInsetProvider'
    );
  }
  return context;
}
