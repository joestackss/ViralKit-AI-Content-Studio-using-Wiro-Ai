import { Ionicons } from "@expo/vector-icons";
import { StatusBar } from "expo-status-bar";
import React, { useMemo, useState } from "react";
import {
  Alert,
  Image,
  ScrollView,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import GenerationCard from "../../components/GenerationCard";
import ImageUploader from "../../components/ImageUploader";
import { useContentStore } from "../../stores/content-store";
import { useAutoPolling, useGeneration } from "../../utils/use-generation";

export default function VideoScreen() {
  const { setCurrentImage, removeItemsByType } = useContentStore();
  const { generateVideo, cancelAllProcessingTasks, isGenerating } =
    useGeneration();

  // Prompt state
  const [videoPrompt, setVideoPrompt] = useState(
    "A stunning product showcase video with smooth camera movement, professional lighting, and elegant transitions. The product is displayed from multiple angles, highlighting its key features and premium quality."
  );
  const [selectedImageUri, setSelectedImageUri] = useState<string | null>(null);
  const [useTryOnResult, setUseTryOnResult] = useState<boolean>(false);
  const [showWarning, setShowWarning] = useState(false);

  // Auto-poll all processing items
  useAutoPolling();

  // Get latest items for status display
  const items = useContentStore((state) => state.items);
  const tryOnItem = useMemo(
    () =>
      items.find(
        (item) => item.type === "tryon" && item.status === "completed"
      ),
    [items]
  );
  const videoItem = useMemo(
    () => items.find((item) => item.type === "video"),
    [items]
  );

  // Check if there are any items
  const hasAnyItems = useMemo(() => {
    return videoItem !== undefined;
  }, [videoItem]);

  // Check if there are any processing items
  const hasProcessingItems = useMemo(() => {
    return videoItem?.status === "processing";
  }, [videoItem]);

  // Get the image to use for video generation
  const getVideoImage = () => {
    // Priority: selected image > explicitly chosen try-on result
    if (selectedImageUri) {
      return selectedImageUri;
    }
    if (useTryOnResult && tryOnItem?.outputs?.[0]?.url) {
      return tryOnItem.outputs[0].url;
    }
    return null;
  };

  const handleImageSelected = (uri: string) => {
    // Clear any existing video items to start fresh
    removeItemsByType("video");
    setSelectedImageUri(uri);
    // Don't set currentImage to avoid duplicate display
    // setCurrentImage(uri); // Removed to prevent duplicate
    setShowWarning(true);
    // Auto-dismiss warning after 5 seconds
    setTimeout(() => setShowWarning(false), 5000);
  };

  const handleGenerateVideo = () => {
    const imageUri = getVideoImage();

    if (!imageUri) {
      Alert.alert(
        "No Image",
        "Please select an image or generate a virtual try-on first"
      );
      return;
    }

    if (!videoPrompt.trim()) {
      Alert.alert("No Prompt", "Please enter a video prompt");
      return;
    }

    generateVideo({ imageUri, prompt: videoPrompt });
  };

  const handleClearCurrent = () => {
    Alert.alert(
      "Clear Current Image",
      "This will clear the selected image. You can select a new one or use the try-on result.",
      [
        {
          text: "Cancel",
          style: "cancel",
        },
        {
          text: "Clear",
          style: "destructive",
          onPress: () => {
            setSelectedImageUri(null);
            setCurrentImage(null);
          },
        },
      ]
    );
  };

  const handleStopAll = () => {
    Alert.alert(
      "Stop All Tasks",
      "Are you sure you want to stop all currently processing tasks? This will cancel any ongoing generations.",
      [
        {
          text: "Cancel",
          style: "cancel",
        },
        {
          text: "Stop All",
          style: "destructive",
          onPress: () => {
            cancelAllProcessingTasks();
          },
        },
      ]
    );
  };

  const videoImage = getVideoImage();

  console.log("videoImage", videoImage);

  return (
    <SafeAreaView className="flex-1 bg-white">
      <StatusBar style="dark" />

      {/* Header */}
      <View className="bg-white border-b border-gray-200 px-6 py-4">
        <View className="flex-row items-center justify-between">
          <Text className="text-3xl font-bold text-gray-900">Video</Text>
          {/* Action Buttons */}
          <View className="flex-row items-center">
            {/* Stop All Button - Show when there are processing items */}
            {hasProcessingItems && (
              <TouchableOpacity
                onPress={handleStopAll}
                className="bg-white border-2 border-orange-300 rounded-xl py-2 px-3 mr-2"
                activeOpacity={0.8}
              >
                <View className="flex-row items-center justify-center">
                  <Ionicons
                    name="stop-circle-outline"
                    size={14}
                    color="#ea580c"
                  />
                  <Text className="text-orange-600 font-bold text-sm ml-1">
                    Stop All
                  </Text>
                </View>
              </TouchableOpacity>
            )}
            {/* Clear Button - Show when there are any items */}
            {hasAnyItems && (
              <TouchableOpacity
                onPress={handleClearCurrent}
                className="bg-white border-2 border-red-300 rounded-xl py-2 px-3"
                activeOpacity={0.8}
              >
                <View className="flex-row items-center justify-center">
                  <Ionicons name="trash-outline" size={14} color="#dc2626" />
                  <Text className="text-red-600 font-bold text-sm ml-1">
                    Clear
                  </Text>
                </View>
              </TouchableOpacity>
            )}
          </View>
        </View>

        <Text className="text-gray-600 mt-1">
          Create promotional videos from images
        </Text>
      </View>

      <ScrollView
        className="flex-1"
        contentContainerStyle={{ padding: 24 }}
        showsVerticalScrollIndicator={false}
      >
        {/* Warning Banner */}
        {showWarning && (
          <View className="mb-4 bg-yellow-50 border border-yellow-200 rounded-xl p-4">
            <View className="flex-row items-start">
              <Ionicons name="warning" size={20} color="#f59e0b" />
              <View className="flex-1 ml-2">
                <Text className="text-yellow-900 font-semibold">
                  Custom Image Selected
                </Text>
                <Text className="text-yellow-700 text-sm mt-1">
                  You&apos;ve selected a custom image. For best results, use the
                  generated try-on image from the Create tab.
                </Text>
              </View>
              <TouchableOpacity onPress={() => setShowWarning(false)}>
                <Ionicons name="close" size={20} color="#f59e0b" />
              </TouchableOpacity>
            </View>
          </View>
        )}

        {/* Image Selection Section */}
        <View className="mb-6">
          <Text className="text-lg font-semibold text-gray-700 mb-3">
            Select Image for Video
          </Text>

          {/* Show selected image or try-on result */}
          {videoImage ? (
            <View className="relative mb-4">
              <Image
                source={{ uri: videoImage }}
                className="w-full h-64 rounded-2xl"
                resizeMode="cover"
              />
              <View className="absolute top-2 left-2 bg-black/50 rounded-full px-3 py-1">
                <Text className="text-white text-xs font-semibold">
                  {selectedImageUri
                    ? "Custom Image"
                    : tryOnItem
                      ? "Try-On Result"
                      : "Selected Image"}
                </Text>
              </View>
              <TouchableOpacity
                onPress={() => {
                  setSelectedImageUri(null);
                  setCurrentImage(null);
                }}
                className="absolute top-2 right-2 bg-red-500 rounded-full p-2"
                activeOpacity={0.7}
              >
                <Ionicons name="close" size={20} color="white" />
              </TouchableOpacity>
            </View>
          ) : null}

          {/* Image Uploader - Only show when no image is selected */}
          {!videoImage && (
            <View>
              <ImageUploader
                mode="single"
                onImageSelected={handleImageSelected}
              />
            </View>
          )}

          {/* Change Image Button - Show when image is selected */}
          {videoImage && (
            <TouchableOpacity
              onPress={() => {
                // Clear any existing video items to start fresh
                removeItemsByType("video");
                setSelectedImageUri(null);
                setUseTryOnResult(false);
                setCurrentImage(null);
              }}
              className="mt-4 bg-purple-50 border-2 border-purple-200 rounded-xl p-4"
              activeOpacity={0.8}
            >
              <View className="flex-row items-center justify-center">
                <Ionicons name="images" size={20} color="#7c3aed" />
                <Text className="text-purple-700 font-semibold ml-2">
                  Change Image
                </Text>
              </View>
            </TouchableOpacity>
          )}

          {/* Try-On Result Option - Show when try-on exists and not currently using it */}
          {tryOnItem &&
            tryOnItem.outputs?.[0]?.url &&
            !useTryOnResult &&
            !selectedImageUri && (
              <TouchableOpacity
                onPress={() => {
                  // Clear any existing video items to start fresh
                  removeItemsByType("video");
                  setSelectedImageUri(null);
                  setUseTryOnResult(true);
                }}
                className="mt-4 bg-purple-50 border-2 border-purple-200 rounded-xl p-4"
                activeOpacity={0.8}
              >
                <View className="flex-row items-center">
                  <Ionicons name="checkmark-circle" size={24} color="#7c3aed" />
                  <View className="flex-1 ml-3">
                    <Text className="text-purple-900 font-bold">
                      Use Generated Try-On
                    </Text>
                    <Text className="text-purple-700 text-sm mt-1">
                      Use the try-on result from the Create tab (recommended)
                    </Text>
                  </View>
                </View>
              </TouchableOpacity>
            )}
        </View>

        {/* Video Prompt Input */}
        <View className="mb-4">
          <Text className="text-sm font-semibold text-gray-700 mb-2">
            Video Prompt
          </Text>
          <TextInput
            className="bg-white border border-gray-300 rounded-xl p-3 text-gray-900"
            placeholder="Enter your video generation prompt..."
            value={videoPrompt}
            onChangeText={setVideoPrompt}
            multiline
            numberOfLines={4}
            textAlignVertical="top"
            editable={!isGenerating}
          />
        </View>

        {/* Generation Card */}
        <GenerationCard
          icon="videocam"
          title="Promotional Video"
          description="Create an engaging video showcase of your product"
          status={videoItem?.status || "pending"}
          onPress={handleGenerateVideo}
          disabled={
            !videoImage ||
            isGenerating ||
            videoItem?.status === "completed" ||
            videoItem?.status === "processing"
          }
          progressMessage={videoItem?.progressMessage}
          progressPercentage={videoItem?.progressPercentage}
          elapsedSeconds={videoItem?.elapsedSeconds}
          onRecover={
            videoItem && videoItem.status === "failed"
              ? handleGenerateVideo
              : undefined
          }
        />

        {/* Info Box */}
        <View className="mt-6 bg-blue-50 border border-blue-200 rounded-xl p-4">
          <View className="flex-row items-start">
            <Ionicons name="information-circle" size={20} color="#3b82f6" />
            <View className="flex-1 ml-2">
              <Text className="text-blue-900 font-semibold">How It Works</Text>
              <Text className="text-blue-700 text-sm mt-1">
                1. Select an image or use the try-on result from Create tab
                {"\n"}
                2. Enter a prompt describing your video{"\n"}
                3. Generate your promotional video{"\n"}
                4. Video generation takes 2-4 minutes
              </Text>
            </View>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
