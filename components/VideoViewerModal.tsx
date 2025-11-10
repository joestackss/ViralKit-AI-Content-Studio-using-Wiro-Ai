import { Ionicons } from "@expo/vector-icons";
import { AVPlaybackStatus, ResizeMode, Video } from "expo-av";
import { StatusBar } from "expo-status-bar";
import React, { useRef, useState } from "react";
import {
  ActivityIndicator,
  Dimensions,
  Modal,
  Platform,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

interface VideoViewerModalProps {
  visible: boolean;
  videoUri: string;
  onClose: () => void;
}

const { width, height } = Dimensions.get("window");

export default function VideoViewerModal({
  visible,
  videoUri,
  onClose,
}: VideoViewerModalProps) {
  const videoRef = useRef<Video>(null);
  const [status, setStatus] = useState<AVPlaybackStatus>();
  const [isLoading, setIsLoading] = useState(true);
  const [hasError, setHasError] = useState(false);

  const isPlaying = status?.isLoaded && status.isPlaying;

  const handlePlayPause = async () => {
    if (!videoRef.current) return;

    if (isPlaying) {
      await videoRef.current.pauseAsync();
    } else {
      await videoRef.current.playAsync();
    }
  };

  const handleReplay = async () => {
    if (!videoRef.current) return;
    await videoRef.current.replayAsync();
  };

  return (
    <Modal
      visible={visible}
      transparent={true}
      animationType="fade"
      onRequestClose={onClose}
    >
      <StatusBar style="light" />
      <View style={styles.container}>
        {/* Close Button */}
        <TouchableOpacity
          style={styles.closeButton}
          onPress={onClose}
          activeOpacity={0.8}
        >
          <Ionicons name="close" size={32} color="white" />
        </TouchableOpacity>

        {/* Video */}
        <View style={styles.videoContainer}>
          <Video
            ref={videoRef}
            source={{ uri: videoUri }}
            style={styles.video}
            resizeMode={ResizeMode.CONTAIN}
            isLooping={false}
            shouldPlay={true}
            onPlaybackStatusUpdate={(newStatus) => {
              setStatus(newStatus);
              // Reset error state if playback is working
              if (newStatus?.isLoaded && !newStatus.error) {
                setHasError(false);
              }
            }}
            onLoad={() => {
              setIsLoading(false);
              setHasError(false);
            }}
            onError={(error) => {
              // Error code -1002 (NSURLErrorDomain) often occurs when video finishes
              // or during normal playback transitions. Only log if it's a real error.
              const errorCode = (error as any)?.code;
              const errorDomain = (error as any)?.domain;

              // Check if this is a completion-related error that we can ignore
              if (
                errorDomain === "NSURLErrorDomain" &&
                (errorCode === -1002 || errorCode === -1009)
              ) {
                // These are often network-related errors that occur during playback completion
                // Only log in development, don't show to user
                if (__DEV__) {
                  console.log("Video playback note (non-critical):", error);
                }
                setIsLoading(false);
                return;
              }

              // For other errors, log and show error state
              console.error("Video error:", error);
              setIsLoading(false);
              setHasError(true);
            }}
          />

          {/* Loading Indicator */}
          {isLoading && (
            <View style={styles.loadingOverlay}>
              <ActivityIndicator size="large" color="#fff" />
              <Text style={styles.loadingText}>Loading video...</Text>
            </View>
          )}

          {/* Error Message */}
          {hasError && !isLoading && (
            <View style={styles.errorOverlay}>
              <Ionicons name="alert-circle" size={48} color="#ef4444" />
              <Text style={styles.errorText}>Failed to load video</Text>
              <TouchableOpacity
                onPress={() => {
                  setHasError(false);
                  setIsLoading(true);
                  // Try to reload the video
                  if (videoRef.current) {
                    videoRef.current.reloadAsync();
                  }
                }}
                style={styles.retryButton}
                activeOpacity={0.8}
              >
                <Text style={styles.retryButtonText}>Retry</Text>
              </TouchableOpacity>
            </View>
          )}

          {/* Play/Pause Overlay */}
          {!isLoading && !hasError && (
            <View style={styles.controlsOverlay}>
              <TouchableOpacity
                onPress={handlePlayPause}
                style={styles.playButton}
                activeOpacity={0.8}
              >
                <Ionicons
                  name={isPlaying ? "pause" : "play"}
                  size={48}
                  color="white"
                />
              </TouchableOpacity>
            </View>
          )}

          {/* Replay Button (shown when video ends) */}
          {status?.isLoaded && status.didJustFinish && (
            <View style={styles.replayOverlay}>
              <TouchableOpacity
                onPress={handleReplay}
                style={styles.replayButton}
                activeOpacity={0.8}
              >
                <Ionicons name="refresh" size={48} color="white" />
              </TouchableOpacity>
              <Text style={styles.replayText}>Replay</Text>
            </View>
          )}

          {/* Progress Bar */}
          {status?.isLoaded && (
            <View style={styles.progressContainer}>
              <View
                style={[
                  styles.progressBar,
                  {
                    width: `${
                      (status.positionMillis / (status.durationMillis || 1)) *
                      100
                    }%`,
                  },
                ]}
              />
            </View>
          )}
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.95)",
    justifyContent: "center",
    alignItems: "center",
  },
  closeButton: {
    position: "absolute",
    top: Platform.OS === "ios" ? 60 : 40,
    right: 20,
    zIndex: 10,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    borderRadius: 25,
    width: 50,
    height: 50,
    justifyContent: "center",
    alignItems: "center",
  },
  videoContainer: {
    width: width,
    height: height * 0.6,
    position: "relative",
  },
  video: {
    width: "100%",
    height: "100%",
  },
  loadingOverlay: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(0, 0, 0, 0.5)",
  },
  loadingText: {
    color: "white",
    marginTop: 16,
    fontSize: 16,
  },
  controlsOverlay: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: "center",
    alignItems: "center",
  },
  playButton: {
    backgroundColor: "rgba(124, 58, 237, 0.8)",
    borderRadius: 50,
    width: 80,
    height: 80,
    justifyContent: "center",
    alignItems: "center",
  },
  replayOverlay: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(0, 0, 0, 0.3)",
  },
  replayButton: {
    backgroundColor: "#7c3aed",
    borderRadius: 50,
    width: 80,
    height: 80,
    justifyContent: "center",
    alignItems: "center",
  },
  replayText: {
    color: "white",
    marginTop: 16,
    fontSize: 18,
    fontWeight: "600",
  },
  progressContainer: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    height: 3,
    backgroundColor: "rgba(255, 255, 255, 0.3)",
  },
  progressBar: {
    height: "100%",
    backgroundColor: "#7c3aed",
  },
  errorOverlay: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(0, 0, 0, 0.8)",
  },
  errorText: {
    color: "white",
    marginTop: 16,
    fontSize: 16,
    fontWeight: "600",
  },
  retryButton: {
    marginTop: 20,
    backgroundColor: "#7c3aed",
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
  },
  retryButtonText: {
    color: "white",
    fontSize: 16,
    fontWeight: "600",
  },
});
