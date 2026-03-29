import { ResizeMode, Video } from "expo-av";
import { Image } from "expo-image";
import React, { useMemo } from "react";
import {
  Animated,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import type { SwipeUser } from "../(tabs)/home";

interface SwipeCardProps {
  user: SwipeUser;
  mediaIndex: number;
  onMediaPrev: () => void;
  onMediaNext: () => void;
  onPress: () => void;
  style?: any;
}

const SwipeCard = React.memo(
  ({
    user,
    mediaIndex,
    onMediaPrev,
    onMediaNext,
    onPress,
    style,
  }: SwipeCardProps) => {
    if (!user) return null;

    const currentMedia = user.media?.[mediaIndex];

    const isVideo = useMemo(
      () => typeof currentMedia === "string" && currentMedia.includes(".mp4"),
      [currentMedia],
    );

    const totalMedia = user.media?.length || 0;

    return (
      <Animated.View style={[styles.card, style]}>
        {/* ❌ REMOVED onPress from here */}
        <View style={{ flex: 1 }}>
          {isVideo ? (
            <Video
              key={currentMedia}
              source={{ uri: currentMedia }}
              style={StyleSheet.absoluteFillObject}
              resizeMode={ResizeMode.COVER}
              shouldPlay
              isLooping
            />
          ) : (
            <Image
              key={currentMedia}
              source={{ uri: currentMedia }}
              style={StyleSheet.absoluteFillObject}
              contentFit="cover"
              contentPosition="center"
            />
          )}

          {/* ✅ TAP CONTROLS FIXED */}
          <View style={styles.controls} pointerEvents="box-none">
            <TouchableOpacity
              style={styles.sideButton}
              activeOpacity={1}
              onPressIn={onMediaPrev}
            />

            <TouchableOpacity
              style={styles.sideButton}
              activeOpacity={1}
              onPressIn={onMediaNext}
            />
          </View>

          {/* Progress Bars */}
          <View style={styles.progressContainer}>
            {user.media?.map((_, i) => (
              <View
                key={i}
                style={[
                  styles.progressBar,
                  {
                    backgroundColor:
                      i <= mediaIndex ? "#fff" : "rgba(255,255,255,0.3)",
                  },
                ]}
              />
            ))}
          </View>
        </View>

        {/* ✅ Profile click alag se */}
        <TouchableOpacity
          style={styles.infoOverlay}
          activeOpacity={0.8}
          onPress={onPress}
        >
          <Text style={styles.name}>
            {user.name}, {user.age}
          </Text>

          {user.bio ? (
            <Text style={styles.bio} numberOfLines={2}>
              {user.bio}
            </Text>
          ) : null}

          {user.distance !== undefined && (
            <Text style={styles.distance}>📍 {user.distance} km away</Text>
          )}
        </TouchableOpacity>
      </Animated.View>
    );
  },
);

SwipeCard.displayName = "SwipeCard";

const styles = StyleSheet.create({
  card: {
    width: "100%",
    height: "100%", // 🔥 FULL SCREEN FIX
    borderRadius: 0, // 🔥 edge to edge
    overflow: "hidden",
    backgroundColor: "#1a1a1a",
  },

  controls: {
    ...StyleSheet.absoluteFillObject,
    flexDirection: "row",
    zIndex: 10,
  },

  sideButton: {
    flex: 1,
  },

  progressContainer: {
    position: "absolute",
    top: 40,
    left: 8,
    right: 8,
    flexDirection: "row",
    gap: 4,
  },

  progressBar: {
    flex: 1,
    height: 3,
    borderRadius: 2,
  },

  infoOverlay: {
    position: "absolute",
    bottom: 0,
    width: "100%",
    padding: 20,
    backgroundColor: "rgba(0,0,0,0.5)",
  },

  name: {
    color: "#fff",
    fontSize: 22,
    fontWeight: "bold",
  },

  bio: {
    color: "#ddd",
    fontSize: 14,
    marginTop: 4,
  },

  distance: {
    color: "#fff",
    marginTop: 6,
    fontSize: 13,
  },
});

export default SwipeCard;
