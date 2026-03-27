import * as Haptics from "expo-haptics";
import React from "react";
import {
  Animated,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

interface SwipeButtonsProps {
  onLike: () => void;
  onDislike: () => void;
  onSuperLike: () => void;
  onUndo: () => void;
  canUndo: boolean;
}

const SwipeButtons: React.FC<SwipeButtonsProps> = ({
  onLike,
  onDislike,
  onSuperLike,
  onUndo,
  canUndo,
}) => {
  const scaleAnimation = React.useRef(new Animated.Value(1)).current;

  const animateButton = () => {
    Animated.sequence([
      Animated.timing(scaleAnimation, {
        toValue: 0.9,
        duration: 100,
        useNativeDriver: true,
      }),
      Animated.timing(scaleAnimation, {
        toValue: 1,
        duration: 100,
        useNativeDriver: true,
      }),
    ]).start();
  };

  const handleDislike = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    animateButton();
    onDislike();
  };

  const handleLike = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    animateButton();
    onLike();
  };

  const handleSuperLike = () => {
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    animateButton();
    onSuperLike();
  };

  const handleUndo = () => {
    if (canUndo) {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      onUndo();
    }
  };

  return (
    <View style={styles.container}>
      {/* Undo Button */}
      <TouchableOpacity
        style={[styles.undoButton, !canUndo && styles.undoButtonDisabled]}
        onPress={handleUndo}
        disabled={!canUndo}
        activeOpacity={0.7}
      >
        <Text style={styles.undoIcon}>↶</Text>
      </TouchableOpacity>

      <View style={styles.mainButtons}>
        {/* Dislike Button */}
        <Animated.View style={{ transform: [{ scale: scaleAnimation }] }}>
          <TouchableOpacity
            style={styles.dislikeButton}
            onPress={handleDislike}
            activeOpacity={0.7}
          >
            <Text style={styles.dislikeIcon}>✕</Text>
          </TouchableOpacity>
        </Animated.View>

        {/* Super Like Button */}
        <Animated.View style={{ transform: [{ scale: scaleAnimation }] }}>
          <TouchableOpacity
            style={styles.superLikeButton}
            onPress={handleSuperLike}
            activeOpacity={0.7}
          >
            <Text style={styles.superLikeIcon}>⭐</Text>
          </TouchableOpacity>
        </Animated.View>

        {/* Like Button */}
        <Animated.View style={{ transform: [{ scale: scaleAnimation }] }}>
          <TouchableOpacity
            style={styles.likeButton}
            onPress={handleLike}
            activeOpacity={0.7}
          >
            <Text style={styles.likeIcon}>❤️</Text>
          </TouchableOpacity>
        </Animated.View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    gap: 18,
    width: "100%",
  },
  mainButtons: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    gap: 18,
  },

  // Dislike Button
  dislikeButton: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: "#2A2F45",
    justifyContent: "center",
    alignItems: "center",
    elevation: 4,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3,
  },
  dislikeIcon: {
    fontSize: 24,
    color: "#FF4D6D",
  },

  // Super Like Button
  superLikeButton: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: "#2A2F45",
    justifyContent: "center",
    alignItems: "center",
    elevation: 4,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3,
  },
  superLikeIcon: {
    fontSize: 24,
    color: "#4CC9F0",
  },

  // Like Button
  likeButton: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: "#2A2F45",
    justifyContent: "center",
    alignItems: "center",
    elevation: 4,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3,
  },
  likeIcon: {
    fontSize: 24,
    color: "#FF4D6D",
  },

  // Undo Button
  undoButton: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: "#2A2F45",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.2)",
    justifyContent: "center",
    alignItems: "center",
    elevation: 3,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 2,
  },
  undoButtonDisabled: {
    opacity: 0.4,
  },
  undoIcon: {
    fontSize: 18,
    color: "#fff",
    fontWeight: "bold",
  },
});

export default SwipeButtons;
