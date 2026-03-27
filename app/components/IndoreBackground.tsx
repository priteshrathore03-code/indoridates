import { LinearGradient } from "expo-linear-gradient";
import React, { useEffect, useRef } from "react";
import {
  Animated,
  Dimensions,
  ImageBackground,
  StyleSheet,
  View,
} from "react-native";

type Props = {
  children: React.ReactNode;
};

const { width, height } = Dimensions.get("window");

/**
 * IndoreBackground
 *
 * A fully responsive, centered background component that works on all devices.
 * The background image is perfectly centered with no white edges or side gaps.
 *
 * Features:
 * - Image fills entire screen with proper centering
 * - Fade-in animation on component mount
 * - LinearGradient overlay for readability
 * - Works with nested screens (tabs, stack navigation)
 * - Compatible with SafeArea on iPhone
 * - Production-ready for Android & iOS
 */
export default function IndoreBackground({ children }: Props) {
  const fadeAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 500,
      useNativeDriver: true,
    }).start();
  }, [fadeAnim]);

  return (
    <View style={styles.container}>
      <ImageBackground
        source={require("../../assets/indore-bg.png")}
        style={styles.background}
        imageStyle={styles.image}
        resizeMode="cover"
      >
        <Animated.View style={[styles.overlay, { opacity: fadeAnim }]}>
          <LinearGradient
            colors={[
              "rgba(0, 0, 0, 0.2)",
              "rgba(0, 0, 0, 0.5)",
              "rgba(0, 0, 0, 0.7)",
            ]}
            locations={[0, 0.5, 1]}
            style={styles.gradient}
          >
            {children}
          </LinearGradient>
        </Animated.View>
      </ImageBackground>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    width: "100%",
    height: "100%",
  },

  background: {
    flex: 1,
    width: width,
    height: height,
  },

  /**
   * Image styling that ensures perfect centering
   * - Uses explicit dimensions from Dimensions.get("window")
   * - alignSelf: "center" centers the image on all aspect ratios
   * - resizeMode: "cover" on ImageBackground fills without gaps
   */
  image: {
    resizeMode: "cover",
    width: width,
    height: height,
    alignSelf: "center",
  },

  overlay: {
    flex: 1,
  },

  gradient: {
    flex: 1,
    width: "100%",
    height: "100%",
    justifyContent: "flex-start",
  },
});