import React, { useEffect, useRef } from "react";
import { Animated, ImageBackground, StyleSheet, View } from "react-native";

type Props = {
  children: React.ReactNode;
};

export default function IndoreBackground({ children }: Props) {
  const fadeAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 500,
      useNativeDriver: true,
    }).start();
  }, []);

  return (
    <ImageBackground
      source={require("../../assets/indore-bg.png")}
      style={styles.background}
      resizeMode="cover"
    >
      <Animated.View style={[styles.overlay, { opacity: fadeAnim }]}>
        <View style={styles.content}>{children}</View>
      </Animated.View>
    </ImageBackground>
  );
}

const styles = StyleSheet.create({
  background: {
    flex: 1,
  },
  overlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.3)", // slight dark overlay
  },
  content: {
    flex: 1,
    justifyContent: "center",
    paddingHorizontal: 20,
  },
});
