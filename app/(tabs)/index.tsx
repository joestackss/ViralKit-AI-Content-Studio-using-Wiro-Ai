import { Ionicons } from "@expo/vector-icons";
import { StatusBar } from "expo-status-bar";
import React, { useEffect, useMemo, useRef, useState } from "react";
import {
  Alert,
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

export default function HomeScreen() {
  const {
    currentHumanImage,
    currentClothesImage,
    clearCurrentState,
    removeItemsByType,
  } = useContentStore();
  const {
    generateTryOn,
    generateCaption,
    recoverTask,
    cancelAllProcessingTasks,
    isGenerating,
  } = useGeneration();

  // Prompt state
  const [captionPrompt, setCaptionPrompt] = useState(
    "Analyze the product in this image and create an engaging Instagram caption. Include 2-3 sentences highlighting key features, benefits, and style. Add a compelling call-to-action and 5-8 relevant hashtags. Make it authentic and conversational."
  );

  // Track previous image values to detect changes
  const prevHumanImageRef = useRef<string | null>(null);
  const prevClothesImageRef = useRef<string | null>(null);

  // Auto-poll all processing items
  useAutoPolling();

  // Clear existing items when new images are selected
  useEffect(() => {
    // Check if images have changed (not just initial mount)
    const humanImageChanged =
      prevHumanImageRef.current !== null &&
      prevHumanImageRef.current !== currentHumanImage;
    const clothesImageChanged =
      prevClothesImageRef.current !== null &&
      prevClothesImageRef.current !== currentClothesImage;

    // If either image changed, clear existing try-on and caption items
    if (humanImageChanged || clothesImageChanged) {
      removeItemsByType("tryon");
      removeItemsByType("caption");
    }

    // Update refs
    prevHumanImageRef.current = currentHumanImage;
    prevClothesImageRef.current = currentClothesImage;
  }, [currentHumanImage, currentClothesImage, removeItemsByType]);

  // Get latest items for status display
  const items = useContentStore((state) => state.items);
  const tryOnItem = useMemo(
    () => items.find((item) => item.type === "tryon"),
    [items]
  );
  const captionItem = useMemo(
    () => items.find((item) => item.type === "caption"),
    [items]
  );

  // Check if all existing items are completed
  const allCompleted = useMemo(() => {
    const existingItems = [tryOnItem, captionItem].filter(
      (item) => item !== undefined
    );
    // If there are any items, check if all of them are completed
    return (
      existingItems.length > 0 &&
      existingItems.every((item) => item?.status === "completed")
    );
  }, [tryOnItem, captionItem]);

  // Check if there are any items (completed, failed, or processing)
  const hasAnyItems = useMemo(() => {
    return tryOnItem !== undefined || captionItem !== undefined;
  }, [tryOnItem, captionItem]);

  // Check if there are any processing items
  const hasProcessingItems = useMemo(() => {
    return (
      tryOnItem?.status === "processing" || captionItem?.status === "processing"
    );
  }, [tryOnItem, captionItem]);

  const handleGenerateTryOn = () => {
    if (!currentHumanImage) {
      Alert.alert("No Person Image", "Please upload a person image first");
      return;
    }
    if (!currentClothesImage) {
      Alert.alert("No Clothing Image", "Please upload a clothing image first");
      return;
    }
    generateTryOn({
      humanImageUri: currentHumanImage,
      clothesImageUri: currentClothesImage,
    });
  };

  const handleGenerateCaption = () => {
    // Check if try-on is completed first
    if (!tryOnItem || tryOnItem.status !== "completed") {
      Alert.alert(
        "Try-On Required",
        "Please generate virtual try-on first before creating a caption"
      );
      return;
    }

    if (!captionPrompt.trim()) {
      Alert.alert("No Prompt", "Please enter a caption prompt");
      return;
    }

    // Use the first generated try-on image for context
    const generatedImage = tryOnItem.outputs[0]?.url;
    if (!generatedImage) {
      Alert.alert("Error", "No try-on images available");
      return;
    }

    generateCaption({ imageUri: generatedImage, prompt: captionPrompt });
  };

  const handleClearAll = () => {
    Alert.alert(
      "Clear Current Images",
      "This will clear the uploaded images so you can start fresh. Your generated content in the gallery will remain.",
      [
        {
          text: "Cancel",
          style: "cancel",
        },
        {
          text: "Clear",
          style: "destructive",
          onPress: () => {
            clearCurrentState();
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

  const handleGenerateAll = () => {
    if (!currentHumanImage || !currentClothesImage) {
      Alert.alert(
        "Images Required",
        "Please upload both person and clothing images first"
      );
      return;
    }

    // Start with try-on
    handleGenerateTryOn();

    // Note: Caption will need to wait for try-on to complete
    // The user can click it individually after try-on is done
    Alert.alert(
      "Generation Started",
      "Virtual try-on generation has started. Once complete, you can generate the caption."
    );
  };

  return (
    <SafeAreaView className="flex-1 bg-white">
      <StatusBar style="dark" />

      {/* Header */}
      <View className="bg-white border-b border-gray-200 px-6 py-4">
        <View className="flex-row items-center justify-between">
          <Text className="text-3xl font-bold text-gray-900">Viral Kit</Text>
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
            {/* Clear All Button - Show when there are any items */}
            {hasAnyItems && (
              <TouchableOpacity
                onPress={handleClearAll}
                className="bg-white border-2 border-red-300 rounded-xl py-2 px-3"
                activeOpacity={0.8}
              >
                <View className="flex-row items-center justify-center">
                  <Ionicons name="trash-outline" size={14} color="#dc2626" />
                  <Text className="text-red-600 font-bold text-sm ml-1">
                    Clear All
                  </Text>
                </View>
              </TouchableOpacity>
            )}
          </View>
        </View>

        <Text className="text-gray-600 mt-1">
          Create stunning social media content
        </Text>
      </View>

      <ScrollView
        className="flex-1"
        contentContainerStyle={{ padding: 24 }}
        showsVerticalScrollIndicator={false}
      >
        {/* Image Uploader */}
        <ImageUploader mode="tryon" />

        {/* Generation Section */}
        {currentHumanImage && currentClothesImage && (
          <>
            <View className="mt-8">
              <Text className="text-xl font-bold text-gray-900 mb-4">
                Generate Content
              </Text>

              <GenerationCard
                icon="shirt"
                title="Virtual Try-On"
                description="Try on clothing virtually with AI-powered fitting"
                status={tryOnItem?.status || "pending"}
                onPress={handleGenerateTryOn}
                disabled={
                  !currentHumanImage ||
                  !currentClothesImage ||
                  isGenerating ||
                  tryOnItem?.status === "completed" ||
                  tryOnItem?.status === "processing"
                }
                progressMessage={tryOnItem?.progressMessage}
                progressPercentage={tryOnItem?.progressPercentage}
                elapsedSeconds={tryOnItem?.elapsedSeconds}
                onRecover={
                  tryOnItem && tryOnItem.status === "failed"
                    ? () => recoverTask(tryOnItem)
                    : undefined
                }
              />

              {/* Caption Prompt Input */}
              <View className="mb-4 mt-4">
                <Text className="text-sm font-semibold text-gray-700 mb-2">
                  Caption Prompt
                </Text>
                <TextInput
                  className="bg-white border border-gray-300 rounded-xl p-3 text-gray-900"
                  placeholder="Enter your caption generation prompt..."
                  value={captionPrompt}
                  onChangeText={setCaptionPrompt}
                  multiline
                  numberOfLines={4}
                  textAlignVertical="top"
                  editable={!isGenerating && tryOnItem?.status === "completed"}
                />
              </View>

              <GenerationCard
                icon="text"
                title="Social Captions"
                description="Generate engaging captions with hashtags"
                status={captionItem?.status || "pending"}
                onPress={handleGenerateCaption}
                disabled={
                  !currentHumanImage ||
                  !currentClothesImage ||
                  !tryOnItem ||
                  tryOnItem?.status !== "completed" ||
                  isGenerating ||
                  captionItem?.status === "completed" ||
                  captionItem?.status === "processing"
                }
                progressMessage={captionItem?.progressMessage}
                progressPercentage={captionItem?.progressPercentage}
                elapsedSeconds={captionItem?.elapsedSeconds}
                onRecover={
                  captionItem && captionItem.status === "failed"
                    ? handleGenerateCaption
                    : undefined
                }
              />
            </View>

            {/* Generate All Button */}
            <TouchableOpacity
              onPress={handleGenerateAll}
              disabled={isGenerating || allCompleted}
              className={`mt-6 bg-purple-600 rounded-xl py-4 px-6 shadow-lg ${
                isGenerating || allCompleted ? "opacity-50" : ""
              }`}
              activeOpacity={0.8}
            >
              <View className="flex-row items-center justify-center">
                <Ionicons name="sparkles" size={24} color="white" />
                <Text className="text-white font-bold text-lg ml-2">
                  {isGenerating ? "Generating..." : "Generate All Content"}
                </Text>
              </View>
            </TouchableOpacity>

            {/* Info Box */}
            <View className="mt-6 bg-blue-50 border border-blue-200 rounded-xl p-4">
              <View className="flex-row items-start">
                <Ionicons name="information-circle" size={20} color="#3b82f6" />
                <View className="flex-1 ml-2">
                  <Text className="text-blue-900 font-semibold">
                    How It Works
                  </Text>
                  <Text className="text-blue-700 text-sm mt-1">
                    1. Upload person and clothing images{"\n"}
                    2. Generate virtual try-on first{"\n"}
                    3. Customize your caption prompt{"\n"}
                    4. Generate caption (requires completed try-on){"\n"}
                    5. Go to Video tab to create promotional videos{"\n"}
                    6. Each generation takes 1-3 minutes
                  </Text>
                </View>
              </View>
            </View>
          </>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}
