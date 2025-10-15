import React from 'react';
import {
  View,
  ScrollView,
  SafeAreaView,
  ViewStyle,
  ScrollViewProps,
} from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import { colors } from '../../theme/colors';

interface ThemedLayoutProps {
  children: React.ReactNode;
  gradient?: boolean;
  gradientColors?: string[];
  backgroundColor?: string;
  safeArea?: boolean;
  scrollable?: boolean;
  scrollProps?: ScrollViewProps;
  padding?: number;
  style?: ViewStyle;
  header?: React.ReactNode;
  footer?: React.ReactNode;
}

const ThemedLayout: React.FC<ThemedLayoutProps> = ({
  children,
  gradient = false,
  gradientColors = [colors.primary, colors.secondary],
  backgroundColor = colors.background.default,
  safeArea = true,
  scrollable = false,
  scrollProps,
  padding = 16,
  style,
  header,
  footer,
}) => {
  const content = (
    <View style={[{ flex: 1, padding }, style]}>
      {header && (
        <View style={{ marginBottom: 16 }}>
          {header}
        </View>
      )}

      <View style={{ flex: 1 }}>
        {children}
      </View>

      {footer && (
        <View style={{ marginTop: 16 }}>
          {footer}
        </View>
      )}
    </View>
  );

  const backgroundContent = gradient ? (
    <LinearGradient
      colors={gradientColors}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
      style={{ flex: 1 }}
    >
      {content}
    </LinearGradient>
  ) : (
    <View style={[{ flex: 1, backgroundColor }]}>
      {content}
    </View>
  );

  const Container = safeArea ? SafeAreaView : View;

  if (scrollable) {
    return (
      <Container style={{ flex: 1 }}>
        <ScrollView
          style={{ flex: 1 }}
          contentContainerStyle={{ flexGrow: 1 }}
          showsVerticalScrollIndicator={false}
          showsHorizontalScrollIndicator={false}
          {...scrollProps}
        >
          {backgroundContent}
        </ScrollView>
      </Container>
    );
  }

  return (
    <Container style={{ flex: 1 }}>
      {backgroundContent}
    </Container>
  );
};

export default ThemedLayout;