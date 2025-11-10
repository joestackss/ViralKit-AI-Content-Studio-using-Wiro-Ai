import React, { useState, useRef } from "react";
import { View, TouchableOpacity, Text, ActivityIndicator } from "react-native";
import { Video, ResizeMode, AVPlaybackStatus } from "expo-av";
import { Ionicons } from "@expo/vector-icons";

interface VideoPlayerProps {
  uri: string;
  thumbnail?: string;
}

export default function VideoPlayer({ uri, thumbnail }: VideoPlayerProps) {
  const videoRef = useRef<Video>(null);
  const [status, setStatus] = useState<AVPlaybackStatus>();
  const [isLoading, setIsLoading] = useState(true);

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
    <View className="relative w-full h-64 bg-black rounded-2xl overflow-hidden">
      <Video
        ref={videoRef}
        source={{ uri }}
        className="w-full h-full"
        resizeMode={ResizeMode.CONTAIN}
        isLooping={false}
        onPlaybackStatusUpdate={(newStatus) => setStatus(newStatus)}
        onLoad={() => setIsLoading(false)}
        onError={(error) => {
          console.error("Video error:", error);
          setIsLoading(false);
        }}
      />

      {/* Loading Indicator */}
      {isLoading && (
        <View className="absolute inset-0 items-center justify-center bg-black/50">
          <ActivityIndicator size="large" color="#fff" />
          <Text className="text-white mt-2">Loading video...</Text>
        </View>
      )}

      {/* Play/Pause Overlay */}
      {!isLoading && (
        <View className="absolute inset-0 items-center justify-center">
          <TouchableOpacity
            onPress={handlePlayPause}
            className="bg-purple-600/80 rounded-full p-4"
            activeOpacity={0.8}
          >
            <Ionicons
              name={isPlaying ? "pause" : "play"}
              size={32}
              color="white"
            />
          </TouchableOpacity>
        </View>
      )}

      {/* Replay Button (shown when video ends) */}
      {status?.isLoaded && status.didJustFinish && (
        <View className="absolute inset-0 items-center justify-center bg-black/30">
          <TouchableOpacity
            onPress={handleReplay}
            className="bg-purple-600 rounded-full p-4"
            activeOpacity={0.8}
          >
            <Ionicons name="refresh" size={32} color="white" />
          </TouchableOpacity>
          <Text className="text-white mt-2 font-semibold">Replay</Text>
        </View>
      )}

      {/* Progress Bar */}
      {status?.isLoaded && (
        <View className="absolute bottom-0 left-0 right-0 h-1 bg-white/30">
          <View
            className="h-full bg-purple-600"
            style={{
              width: `${
                (status.positionMillis / (status.durationMillis || 1)) * 100
              }%`,
            }}
          />
        </View>
      )}
    </View>
  );
}
