import React, { useEffect, useRef } from "react";
import { Animated, StyleSheet } from "react-native";

type Props = {
  children: React.ReactNode;
};

export default function FadeWrapper({ children }: Props) {
  const fadeAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 500,
      useNativeDriver: true,
    }).start();
  }, []);

  return (
    <Animated.View style={[styles.container, { opacity: fadeAnim }]}>
      {children}
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});
