import { Ionicons } from "@expo/vector-icons";
import React, { useRef } from "react";
import {
  Animated,
  Dimensions,
  PanResponder,
  StyleSheet,
  TouchableOpacity,
  View,
} from "react-native";

import type { SwipeUser } from "../(tabs)/home";
import SwipeCard from "./SwipeCard";

const { width, height } = Dimensions.get("window");

interface SwipeStackProps {
  users: SwipeUser[];
  onSwipe: (action: "like" | "dislike" | "superlike") => void;
  onCardPress: () => void;
  onUndo?: () => void;
}

/**
 * SwipeStack Component
 *
 * Modern dating app-style UI with:
 * - Profile card taking 100% of screen height
 * - Vertical action panel on right side with Ionicons
 * - Full swipe gesture support
 * - Responsive layout for all devices
 */
const SwipeStack: React.FC<SwipeStackProps> = ({
  users,
  onSwipe,
  onCardPress,
  onUndo,
}) => {
  if (!users || users.length === 0) {
    return <View style={{ height: height }} />;
  }

  const currentUser = users[0];

  const pan = useRef(new Animated.ValueXY()).current;

  const panResponder = useRef(
    PanResponder.create({
      onMoveShouldSetPanResponder: () => true,

      onPanResponderMove: (_, gesture) => {
        pan.setValue({ x: gesture.dx, y: gesture.dy });
      },

      onPanResponderRelease: (_, gesture) => {
        if (gesture.dx > 120) {
          onSwipe("like");
        } else if (gesture.dx < -120) {
          onSwipe("dislike");
        } else if (gesture.dy < -150) {
          onSwipe("superlike");
        }

        pan.setValue({ x: 0, y: 0 });
      },
    })
  ).current;

  return (
    <View style={styles.container}>
      {/* Profile Card */}
      <Animated.View
        {...panResponder.panHandlers}
        style={[styles.cardWrapper]}
      >
        <SwipeCard
          user={currentUser}
          mediaIndex={0}
          onMediaPrev={() => {}}
          onMediaNext={() => {}}
          onPress={onCardPress}
        />
      </Animated.View>

      {/* Right Action Panel - Modern Dating App Style */}
      <View style={styles.actionsPanel}>
        {/* Super Like Button */}
        <TouchableOpacity
          style={styles.actionBtn}
          onPress={() => onSwipe("superlike")}
          activeOpacity={0.7}
        >
          <Ionicons name="star" size={30} color="#FFD700" />
        </TouchableOpacity>

        {/* Like Button */}
        <TouchableOpacity
          style={styles.actionBtn}
          onPress={() => onSwipe("like")}
          activeOpacity={0.7}
        >
          <Ionicons name="heart" size={30} color="#ff4d6d" />
        </TouchableOpacity>

        {/* Dislike Button */}
        <TouchableOpacity
          style={styles.actionBtn}
          onPress={() => onSwipe("dislike")}
          activeOpacity={0.7}
        >
          <Ionicons name="close" size={30} color="#ff4d6d" />
        </TouchableOpacity>

        {/* Undo Button */}
        <TouchableOpacity
          style={[styles.actionBtn, styles.undoBtn]}
          onPress={onUndo}
          activeOpacity={0.7}
        >
          <Ionicons name="refresh" size={30} color="#fff" />
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  /**
   * Main container
   * - Full width and height - covers entire screen
   * - Uses relative positioning for child layout
   */
  container: {
    width: "100%",
    height: height,
    alignItems: "center",
    justifyContent: "center",
    position: "relative",
  },

  /**
   * Profile card wrapper
   * - Takes 100% of screen height and width to fill completely
   * - No gaps or background visible
   * - Covers entire screen
   */
  cardWrapper: {
    width: "100%",
    height: "100%",
    borderRadius: 0,
    overflow: "hidden",
  },

  /**
   * Right action panel
   * - Absolute positioning on far right and bottom
   * - Vertically stacked buttons
   * - Easy to tap with right thumb
   */
  actionsPanel: {
    position: "absolute",
    right: 10,
    bottom: 100,
    alignItems: "center",
    gap: 10,
  },

  /**
   * Individual action button styling
   * - Circular design with semi-transparent background
   * - Proper spacing and touch targets
   * - Works on all phone sizes
   */
  actionBtn: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: "rgba(0, 0, 0, 0.6)",
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 1.5,
    borderColor: "rgba(255, 255, 255, 0.1)",
  },

  /**
   * Undo button styling
   * - Slightly different visual treatment
   */
  undoBtn: {
    marginTop: 4,
  },
});

export default SwipeStack;