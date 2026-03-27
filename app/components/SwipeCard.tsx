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
      [currentMedia]
    );

    const totalMedia = user.media?.length || 0;

    return (
      <Animated.View style={[styles.card, style]}>
        <TouchableOpacity
          activeOpacity={1}
          onPress={onPress}
          style={{ flex: 1 }}
        >
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

          {/* Media tap controls */}
          <View style={styles.controls}>
            <TouchableOpacity
              style={styles.sideButton}
              onPress={onMediaPrev}
              disabled={mediaIndex === 0}
            />
            <TouchableOpacity
              style={styles.sideButton}
              onPress={onMediaNext}
              disabled={mediaIndex === totalMedia - 1}
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
        </TouchableOpacity>

        {/* Profile Info */}
        <View style={styles.infoOverlay}>
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
        </View>
      </Animated.View>
    );
  }
);

SwipeCard.displayName = "SwipeCard";

const styles = StyleSheet.create({
  card: {
    width: "100%",
    height: 550,
    borderRadius: 20,
    overflow: "hidden",
    backgroundColor: "#1a1a1a",
    elevation: 8,
  },

  controls: {
    ...StyleSheet.absoluteFillObject,
    flexDirection: "row",
  },

  sideButton: {
    flex: 1,
  },

  progressContainer: {
    position: "absolute",
    top: 8,
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