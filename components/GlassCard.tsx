import React from 'react';
import { Platform, StyleProp, StyleSheet, View, ViewStyle } from 'react-native';

type LiquidGlassModule = typeof import('@callstack/liquid-glass');

type LiquidGlassStatics = {
  supported: boolean;
  LiquidGlassView: LiquidGlassModule['LiquidGlassView'] | null;
  LiquidGlassContainerView: LiquidGlassModule['LiquidGlassContainerView'] | null;
};

const liquidGlass: LiquidGlassStatics = (() => {
  if (Platform.OS !== 'ios') {
    return {
      supported: false,
      LiquidGlassView: null,
      LiquidGlassContainerView: null,
    };
  }

  try {
    const module = require('@callstack/liquid-glass') as LiquidGlassModule;
    return {
      supported: Boolean(module?.isLiquidGlassSupported),
      LiquidGlassView: module?.LiquidGlassView ?? null,
      LiquidGlassContainerView: module?.LiquidGlassContainerView ?? null,
    };
  } catch (error) {
    console.warn('LiquidGlass native module unavailable, falling back to static card.', error);
    return {
      supported: false,
      LiquidGlassView: null,
      LiquidGlassContainerView: null,
    };
  }
})();

export const isLiquidGlassAvailable = liquidGlass.supported && !!liquidGlass.LiquidGlassView;

type GlassCardProps = {
  style?: StyleProp<ViewStyle>;
  children: React.ReactNode;
  interactive?: boolean;
  effect?: 'clear' | 'regular' | 'none';
  tintColor?: string;
  colorScheme?: 'light' | 'dark' | 'system';
};

export default function GlassCard({
  style,
  children,
  interactive = false,
  effect = 'regular',
  tintColor,
  colorScheme = 'system',
}: GlassCardProps) {
  const tint = tintColor ?? 'rgba(12,12,12,0.35)';

  if (isLiquidGlassAvailable && liquidGlass.LiquidGlassView) {
    const LiquidView = liquidGlass.LiquidGlassView;
    return (
      <LiquidView
        style={[styles.glassBase, style]}
        interactive={interactive}
        effect={effect}
        tintColor={tint}
        colorScheme={colorScheme}
      >
        {children}
      </LiquidView>
    );
  }

  return <View style={[styles.fallback, style]}>{children}</View>;
}

type GlassStackProps = {
  children: React.ReactNode;
  spacing?: number;
  style?: StyleProp<ViewStyle>;
};

export function GlassStack({ children, spacing = 16, style }: GlassStackProps) {
  if (isLiquidGlassAvailable && liquidGlass.LiquidGlassContainerView) {
    const Container = liquidGlass.LiquidGlassContainerView;
    return (
      <Container spacing={spacing} style={style}>
        {children}
      </Container>
    );
  }

  const content = React.Children.toArray(children);
  return (
    <View style={[style, { gap: spacing }]}>
      {content}
    </View>
  );
}

const styles = StyleSheet.create({
  glassBase: {
    borderRadius: 18,
    padding: 16,
    backgroundColor: 'transparent',
  },
  fallback: {
    backgroundColor: 'rgba(17,17,17,0.92)',
    borderRadius: 18,
    padding: 16,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.04)',
  },
});

