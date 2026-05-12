import { Ionicons } from "@expo/vector-icons";
import React, { useEffect, useRef, useState } from "react";
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

  // 🔥 NEW: media index state
  const [mediaIndex, setMediaIndex] = useState(0);

  // 🔥 NEXT PHOTO
  const handleNext = () => {
    if (!currentUser?.media) return;

    setMediaIndex((prev) =>
      prev + 1 < currentUser.media.length ? prev + 1 : prev,
    );
  };

  // 🔥 PREVIOUS PHOTO
  const handlePrev = () => {
    setMediaIndex((prev) => (prev > 0 ? prev - 1 : prev));
  };

  // 🔥 RESET WHEN USER CHANGES
  useEffect(() => {
    setMediaIndex(0);
  }, [currentUser]);

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
    }),
  ).current;

  return (
    <View style={styles.container}>
      {/* Profile Card */}
      <Animated.View {...panResponder.panHandlers} style={[styles.cardWrapper]}>
        <SwipeCard
          user={currentUser}
          mediaIndex={mediaIndex} // 🔥 FIXED
          onMediaPrev={handlePrev} // 🔥 FIXED
          onMediaNext={handleNext} // 🔥 FIXED
          onPress={onCardPress}
        />
      </Animated.View>

      {/* Right Action Panel */}
      <View style={styles.actionsPanel}>
        <TouchableOpacity
          style={styles.actionBtn}
          onPress={() => onSwipe("superlike")}
          activeOpacity={0.7}
        >
          <Ionicons name="star" size={30} color="#FFD700" />
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.actionBtn}
          onPress={() => onSwipe("like")}
          activeOpacity={0.7}
        >
          <Ionicons name="heart" size={30} color="#ff4d6d" />
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.actionBtn}
          onPress={() => onSwipe("dislike")}
          activeOpacity={0.7}
        >
          <Ionicons name="close" size={30} color="#ff4d6d" />
        </TouchableOpacity>

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
  container: {
    width: "100%",
    height: height,
    alignItems: "center",
    justifyContent: "center",
    position: "relative",
  },

  cardWrapper: {
    width: "100%",
    height: "100%",
    borderRadius: 0,
    overflow: "hidden",
  },

  actionsPanel: {
    position: "absolute",
    right: 10,
    bottom: 120,
    alignItems: "center",
    gap: 10,
  },

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

  undoBtn: {
    marginTop: 4,
  },
});

export default SwipeStack;
