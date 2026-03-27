import * as Haptics from "expo-haptics";
import { Image } from "expo-image";
import React, { useEffect } from "react";
import {
  Animated,
  Dimensions,
  Modal,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import type { SwipeUser } from "../(tabs)/home";

interface MatchModalProps {
  currentUser: SwipeUser;
  matchedUser: SwipeUser;
  onChat: () => void;
  onContinue: () => void;
}

const { width, height } = Dimensions.get("window");

const MatchModal: React.FC<MatchModalProps> = ({
  currentUser,
  matchedUser,
  onChat,
  onContinue,
}) => {
  const scaleAnimation = new Animated.Value(0);
  const rotateAnimation = new Animated.Value(0);

  useEffect(() => {
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);

    Animated.parallel([
      Animated.spring(scaleAnimation, {
        toValue: 1,
        friction: 5,
        tension: 40,
        useNativeDriver: true,
      }),
      Animated.timing(rotateAnimation, {
        toValue: 1,
        duration: 600,
        useNativeDriver: true,
      }),
    ]).start();
  }, []);

  const scale = scaleAnimation;
  const rotation = rotateAnimation.interpolate({
    inputRange: [0, 1],
    outputRange: ["0deg", "360deg"],
  });

  const currentUserPhoto = currentUser.media[0] || "";
  const matchedUserPhoto = matchedUser.media[0] || "";

  return (
    <Modal transparent visible animationType="fade">
      <View style={styles.overlay}>
        <Animated.View
          style={[
            styles.container,
            {
              transform: [{ scale }],
            },
          ]}
        >
          {/* Celebration Header */}
          <View style={styles.header}>
            <Animated.Text
              style={[
                styles.title,
                {
                  transform: [{ rotate: rotation }],
                },
              ]}
            >
              🎉
            </Animated.Text>
            <Text style={styles.matchText}>It's a Match!</Text>
            <Animated.Text
              style={[
                styles.title,
                {
                  transform: [{ rotate: rotation }],
                },
              ]}
            >
              🎉
            </Animated.Text>
          </View>

          {/* Profile Photos */}
          <View style={styles.photosContainer}>
            {/* Current User Photo */}
            <Animated.View style={[styles.photoWrapper, { zIndex: 2 }]}>
              <Image
                source={{ uri: currentUserPhoto }}
                style={styles.photo}
                contentFit="cover"
              />
              <View style={styles.photoLabel}>
                <Text style={styles.photoName}>{currentUser.name}</Text>
              </View>
            </Animated.View>

            {/* Matched User Photo */}
            <Animated.View
              style={[
                styles.photoWrapper,
                {
                  zIndex: 1,
                  marginRight: -20,
                },
              ]}
            >
              <Image
                source={{ uri: matchedUserPhoto }}
                style={styles.photo}
                contentFit="cover"
              />
              <View style={styles.photoLabel}>
                <Text style={styles.photoName}>{matchedUser.name}</Text>
              </View>
            </Animated.View>
          </View>

          {/* Heart Animation */}
          <Animated.View
            style={[
              styles.heartContainer,
              {
                transform: [{ scale }],
              },
            ]}
          >
            <Text style={styles.heart}>❤️</Text>
          </Animated.View>

          {/* User Names */}
          <Text style={styles.names}>
            {currentUser.name} & {matchedUser.name}
          </Text>
          <Text style={styles.subtitle}>You both liked each other!</Text>

          {/* Buttons */}
          <View style={styles.buttonContainer}>
            <TouchableOpacity
              style={styles.continueButton}
              onPress={onContinue}
              activeOpacity={0.8}
            >
              <Text style={styles.continueBtnText}>Keep Swiping</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.chatButton}
              onPress={onChat}
              activeOpacity={0.8}
            >
              <Text style={styles.chatBtnText}>💬 Say Hello!</Text>
            </TouchableOpacity>
          </View>
        </Animated.View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.85)",
    justifyContent: "center",
    alignItems: "center",
  },
  container: {
    backgroundColor: "#1a1a1a",
    borderRadius: 24,
    paddingHorizontal: 20,
    paddingVertical: 32,
    alignItems: "center",
    width: width - 40,
    elevation: 10,
    shadowColor: "#ff1493",
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.4,
    shadowRadius: 12,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 12,
    marginBottom: 20,
  },
  title: {
    fontSize: 48,
  },
  matchText: {
    fontSize: 32,
    fontWeight: "800",
    color: "#ff1493",
    letterSpacing: 1,
  },
  photosContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    height: 200,
    marginVertical: 20,
    position: "relative",
  },
  photoWrapper: {
    width: 140,
    height: 140,
    borderRadius: 20,
    overflow: "hidden",
    borderWidth: 3,
    borderColor: "#ff1493",
    elevation: 5,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
  },
  photo: {
    flex: 1,
    width: "100%",
    height: "100%",
  },
  photoLabel: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: "rgba(0,0,0,0.6)",
    paddingVertical: 6,
  },
  photoName: {
    color: "#fff",
    fontSize: 12,
    fontWeight: "700",
    textAlign: "center",
  },
  heartContainer: {
    marginVertical: 12,
  },
  heart: {
    fontSize: 64,
    textAlign: "center",
  },
  names: {
    fontSize: 24,
    fontWeight: "700",
    color: "#fff",
    marginBottom: 4,
    textAlign: "center",
  },
  subtitle: {
    fontSize: 14,
    color: "#b0b0b0",
    marginBottom: 24,
    textAlign: "center",
  },
  buttonContainer: {
    gap: 12,
    width: "100%",
  },
  continueButton: {
    backgroundColor: "rgba(255,255,255,0.1)",
    borderWidth: 1.5,
    borderColor: "rgba(255,255,255,0.2)",
    borderRadius: 12,
    paddingVertical: 14,
    paddingHorizontal: 20,
  },
  continueBtnText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "600",
    textAlign: "center",
  },
  chatButton: {
    backgroundColor: "#ff1493",
    borderRadius: 12,
    paddingVertical: 14,
    paddingHorizontal: 20,
    elevation: 3,
    shadowColor: "#ff1493",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
  },
  chatBtnText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "700",
    textAlign: "center",
    letterSpacing: 0.5,
  },
});

export default MatchModal;
