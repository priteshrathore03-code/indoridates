import { ResizeMode, Video } from "expo-av";
import React, { useMemo, useState } from "react";
import {
  ActivityIndicator,
  Animated,
  Image,
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

    const [loaded, setLoaded] = useState(false);

    return (
      <Animated.View style={[styles.card, style]}>
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
            <View style={styles.imageContainer}>
              {!loaded && (
                <ActivityIndicator
                  size="large"
                  color="#fff"
                  style={styles.loader}
                />
              )}

              <Image
                key={currentMedia}
                source={{ uri: currentMedia }}
                style={StyleSheet.absoluteFillObject}
                resizeMode="cover"
                onLoad={() => setLoaded(true)}
              />
            </View>
          )}

          {/* Tap Controls */}
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

        {/* Info */}
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
    width: "94%",
    height: "92%",
    borderRadius: 30,
    overflow: "hidden",
    backgroundColor: "#1a1a1a",
    alignSelf: "center",
    marginTop: 18,
    borderWidth: 1.5,
    borderColor: "rgba(255,255,255,0.08)",
  },

  imageContainer: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#000",
  },

  loader: {
    position: "absolute",
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
    top: 20,
    left: 16,
    right: 16,
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
    paddingHorizontal: 20,
    paddingTop: 35,
    paddingBottom: 22,

    backgroundColor: "rgba(0,0,0,0.38)",
  },

  name: {
    color: "#fff",
    fontSize: 28,
    fontWeight: "bold",
    marginBottom: 10,
  },

  bio: {
    color: "rgba(255,255,255,0.9)",
    marginBottom: 8,
    fontSize: 15,
    lineHeight: 20,
  },
  distance: {
    color: "#fff",
    fontSize: 14,
    fontWeight: "600",
  },
});

export default SwipeCard;
