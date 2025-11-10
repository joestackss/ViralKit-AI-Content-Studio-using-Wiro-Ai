import { Ionicons } from "@expo/vector-icons";
import * as FileSystem from "expo-file-system/legacy";
import * as MediaLibrary from "expo-media-library";
import { StatusBar } from "expo-status-bar";
import React, { useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Image,
  RefreshControl,
  ScrollView,
  Share,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import Toast from "react-native-toast-message";
import CaptionDisplay from "../../components/CaptionDisplay";
import ImageViewerModal from "../../components/ImageViewerModal";
import VideoPlayer from "../../components/VideoPlayer";
import VideoViewerModal from "../../components/VideoViewerModal";
import { useCaptions, useTryOns, useVideos } from "../../stores/content-store";
import { useAutoPolling } from "../../utils/use-generation";

export default function GalleryScreen() {
  const [refreshing, setRefreshing] = useState(false);
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [selectedVideo, setSelectedVideo] = useState<string | null>(null);
  const [savingImageId, setSavingImageId] = useState<string | null>(null);
  const [savingVideoId, setSavingVideoId] = useState<string | null>(null);

  // Auto-poll processing items
  const { processingCount } = useAutoPolling();

  // Get content by type
  const tryOns = useTryOns();
  const videos = useVideos();
  const captions = useCaptions();

  // Get the last 3 completed items for each type, sorted by createdAt (newest first)
  const recentTryOns = tryOns
    .filter((item) => item.status === "completed")
    .sort((a, b) => b.createdAt - a.createdAt)
    .slice(0, 3);

  const recentVideos = videos
    .filter((item) => item.status === "completed")
    .sort((a, b) => b.createdAt - a.createdAt)
    .slice(0, 3);

  const recentCaptions = captions
    .filter((item) => item.status === "completed")
    .sort((a, b) => b.createdAt - a.createdAt)
    .slice(0, 3);

  const hasContent =
    recentTryOns.length > 0 ||
    recentVideos.length > 0 ||
    recentCaptions.length > 0;

  const onRefresh = React.useCallback(() => {
    setRefreshing(true);
    setTimeout(() => setRefreshing(false), 1000);
  }, []);

  const handleSaveImage = async (imageUrl: string, itemId: string) => {
    try {
      setSavingImageId(itemId);
      // Request media library permissions
      const { status } = await MediaLibrary.requestPermissionsAsync();
      if (status !== "granted") {
        Alert.alert(
          "Permission Required",
          "Please grant media library permission to save images"
        );
        setSavingImageId(null);
        return;
      }

      const fileUri =
        FileSystem.documentDirectory + `tryon_${Date.now()}_${itemId}.jpg`;
      await FileSystem.downloadAsync(imageUrl, fileUri);
      await MediaLibrary.saveToLibraryAsync(fileUri);

      Toast.show({
        type: "success",
        text1: "Saved!",
        text2: "Image saved to your gallery",
        position: "top",
      });
    } catch (error) {
      console.error("Error saving image:", error);
      Alert.alert("Error", "Failed to save image");
    } finally {
      setSavingImageId(null);
    }
  };

  const handleSaveVideo = async (videoUrl: string, itemId: string) => {
    try {
      setSavingVideoId(itemId);
      // Request media library permissions
      const { status } = await MediaLibrary.requestPermissionsAsync();
      if (status !== "granted") {
        Alert.alert(
          "Permission Required",
          "Please grant media library permission to save videos"
        );
        setSavingVideoId(null);
        return;
      }

      const fileUri =
        FileSystem.documentDirectory + `video_${Date.now()}_${itemId}.mp4`;
      await FileSystem.downloadAsync(videoUrl, fileUri);
      await MediaLibrary.saveToLibraryAsync(fileUri);

      Toast.show({
        type: "success",
        text1: "Saved!",
        text2: "Video saved to your gallery",
        position: "top",
      });
    } catch (error) {
      console.error("Error saving video:", error);
      Alert.alert("Error", "Failed to save video");
    } finally {
      setSavingVideoId(null);
    }
  };

  const handleShareAll = async () => {
    try {
      const shareContent: string[] = [];

      // Add try-on images from all recent items
      if (recentTryOns.length > 0) {
        shareContent.push(`👔 Virtual Try-On (${recentTryOns.length} sets):`);
        recentTryOns.forEach((tryOn, setIndex) => {
          tryOn.outputs.forEach((output, index) => {
            shareContent.push(
              `Set ${setIndex + 1}, Image ${index + 1}: ${output.url}`
            );
          });
        });
      }

      // Add videos from all recent items
      if (recentVideos.length > 0) {
        shareContent.push(`\n🎬 Promotional Videos (${recentVideos.length}):`);
        recentVideos.forEach((video, index) => {
          if (video.outputs.length > 0) {
            shareContent.push(`Video ${index + 1}: ${video.outputs[0].url}`);
          }
        });
      }

      // Add captions from all recent items
      if (recentCaptions.length > 0) {
        shareContent.push(`\n✍️ Captions (${recentCaptions.length}):`);
        recentCaptions.forEach((caption, index) => {
          if (caption.caption) {
            shareContent.push(`Caption ${index + 1}:\n${caption.caption}`);
          }
        });
      }

      if (shareContent.length === 0) {
        Alert.alert("No Content", "No content available to share");
        return;
      }

      const message = `Check out my AI-generated content!\n\n${shareContent.join("\n")}`;

      await Share.share({
        message,
      });
    } catch (error: any) {
      if (error.message !== "User did not share") {
        console.error("Share error:", error);
        Alert.alert("Error", "Failed to share content");
      }
    }
  };

  // Extract hashtags from caption
  const parseCaption = (captionText: string) => {
    const parts = captionText.split("\n\n");
    const mainText = parts[0] || captionText;
    const hashtagLine = parts[1] || "";
    const hashtags = hashtagLine
      .split(" ")
      .filter((word) => word.startsWith("#"));

    return {
      text: mainText,
      hashtags: hashtags.length > 0 ? hashtags : undefined,
    };
  };

  return (
    <SafeAreaView className="flex-1 bg-white">
      <StatusBar style="dark" />

      {/* Header */}
      <View className="bg-white border-b border-gray-200 px-6 py-4">
        <View className="flex-row items-center justify-between">
          <View>
            <Text className="text-3xl font-bold text-gray-900">Gallery</Text>
            <Text className="text-gray-600 mt-1">Your generated content</Text>
          </View>
          {processingCount > 0 && (
            <View className="bg-yellow-100 px-3 py-1 rounded-full">
              <Text className="text-yellow-800 font-semibold text-sm">
                {processingCount} processing...
              </Text>
            </View>
          )}
        </View>
      </View>

      <ScrollView
        className="flex-1"
        contentContainerStyle={{ padding: 24 }}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        {!hasContent ? (
          /* Empty State */
          <View className="flex-1 items-center justify-center py-20">
            <Ionicons name="images-outline" size={80} color="#d1d5db" />
            <Text className="text-gray-500 text-lg font-semibold mt-4">
              No Content Yet
            </Text>
            <Text className="text-gray-400 text-center mt-2 px-8">
              Upload an image and generate content to see it here
            </Text>
          </View>
        ) : (
          <>
            {/* Virtual Try-On Section */}
            {recentTryOns.length > 0 && (
              <View className="mb-8">
                <View className="flex-row items-center mb-4">
                  <Ionicons name="shirt" size={24} color="#7c3aed" />
                  <Text className="text-xl font-bold text-gray-900 ml-2">
                    Virtual Try-On
                  </Text>
                  <View className="ml-2 bg-purple-100 px-2 py-1 rounded-full">
                    <Text className="text-purple-700 text-xs font-bold">
                      {recentTryOns.length}
                    </Text>
                  </View>
                </View>

                {recentTryOns.map((tryOnItem, itemIndex) => (
                  <View key={tryOnItem.id} className="mb-6">
                    {recentTryOns.length > 1 && (
                      <Text className="text-sm text-gray-500 mb-2">
                        Set {itemIndex + 1} (Latest)
                      </Text>
                    )}
                    <View className="flex-row flex-wrap gap-2">
                      {tryOnItem.outputs.map((output, outputIndex) => (
                        <View
                          key={`${tryOnItem.id}-${outputIndex}`}
                          className="w-[48%] aspect-square rounded-xl overflow-hidden bg-gray-200 relative"
                        >
                          <TouchableOpacity
                            className="w-full h-full"
                            onPress={() => setSelectedImage(output.url)}
                            activeOpacity={0.8}
                          >
                            <Image
                              source={{ uri: output.url }}
                              className="w-full h-full"
                              resizeMode="cover"
                            />
                          </TouchableOpacity>

                          {/* Action buttons */}
                          <View className="absolute top-2 right-2 flex-col gap-2">
                            <TouchableOpacity
                              onPress={() =>
                                handleSaveImage(
                                  output.url,
                                  `${tryOnItem.id}-${outputIndex}`
                                )
                              }
                              className="bg-black/50 rounded-full p-2"
                              activeOpacity={0.7}
                              disabled={
                                savingImageId ===
                                `${tryOnItem.id}-${outputIndex}`
                              }
                            >
                              {savingImageId ===
                              `${tryOnItem.id}-${outputIndex}` ? (
                                <ActivityIndicator size="small" color="white" />
                              ) : (
                                <Ionicons
                                  name="download-outline"
                                  size={16}
                                  color="white"
                                />
                              )}
                            </TouchableOpacity>
                          </View>

                          {/* Tap to enlarge hint */}
                          <View className="absolute bottom-2 right-2 bg-black/50 rounded-full p-1">
                            <Ionicons name="expand" size={16} color="white" />
                          </View>
                        </View>
                      ))}
                    </View>
                  </View>
                ))}
              </View>
            )}

            {/* Video Section */}
            {recentVideos.length > 0 && (
              <View className="mb-8">
                <View className="flex-row items-center mb-4">
                  <Ionicons name="videocam" size={24} color="#7c3aed" />
                  <Text className="text-xl font-bold text-gray-900 ml-2">
                    Promotional Video
                  </Text>
                  <View className="ml-2 bg-purple-100 px-2 py-1 rounded-full">
                    <Text className="text-purple-700 text-xs font-bold">
                      {recentVideos.length}
                    </Text>
                  </View>
                </View>

                {recentVideos.map((videoItem, index) => (
                  <View key={videoItem.id} className="mb-6">
                    {recentVideos.length > 1 && (
                      <Text className="text-sm text-gray-500 mb-2">
                        Video {index + 1} (Latest)
                      </Text>
                    )}
                    {videoItem.outputs.length > 0 && (
                      <View className="relative">
                        <TouchableOpacity
                          onPress={() =>
                            setSelectedVideo(videoItem.outputs[0].url)
                          }
                          activeOpacity={0.9}
                        >
                          <VideoPlayer uri={videoItem.outputs[0].url} />
                        </TouchableOpacity>

                        {/* Action buttons */}
                        <View className="absolute top-4 right-4">
                          <TouchableOpacity
                            onPress={() =>
                              handleSaveVideo(
                                videoItem.outputs[0].url,
                                videoItem.id
                              )
                            }
                            className="bg-black/50 rounded-full p-2"
                            activeOpacity={0.7}
                            disabled={savingVideoId === videoItem.id}
                          >
                            {savingVideoId === videoItem.id ? (
                              <ActivityIndicator size="small" color="white" />
                            ) : (
                              <Ionicons
                                name="download-outline"
                                size={20}
                                color="white"
                              />
                            )}
                          </TouchableOpacity>
                        </View>

                        {/* Tap to fullscreen hint */}
                        <View className="absolute bottom-4 right-4 bg-black/50 rounded-full p-2">
                          <Ionicons name="expand" size={20} color="white" />
                        </View>
                      </View>
                    )}
                  </View>
                ))}
              </View>
            )}

            {/* Caption Section */}
            {recentCaptions.length > 0 && (
              <View className="mb-8">
                <View className="flex-row items-center mb-4">
                  <Ionicons name="text" size={24} color="#7c3aed" />
                  <Text className="text-xl font-bold text-gray-900 ml-2">
                    Social Media Caption
                  </Text>
                  <View className="ml-2 bg-purple-100 px-2 py-1 rounded-full">
                    <Text className="text-purple-700 text-xs font-bold">
                      {recentCaptions.length}
                    </Text>
                  </View>
                </View>

                {recentCaptions.map((captionItem, index) => (
                  <View key={captionItem.id} className="mb-6">
                    {recentCaptions.length > 1 && (
                      <Text className="text-sm text-gray-500 mb-2">
                        Caption {index + 1} (Latest)
                      </Text>
                    )}
                    {captionItem.caption && (
                      <CaptionDisplay
                        caption={parseCaption(captionItem.caption).text}
                        hashtags={parseCaption(captionItem.caption).hashtags}
                      />
                    )}
                  </View>
                ))}
              </View>
            )}

            {/* Actions */}
            <View className="mt-4">
              <TouchableOpacity
                className="bg-white border-2 border-purple-600 rounded-xl py-4 items-center"
                activeOpacity={0.8}
                onPress={handleShareAll}
              >
                <View className="flex-row items-center">
                  <Ionicons name="share-outline" size={20} color="#7c3aed" />
                  <Text className="text-purple-600 font-bold ml-2">
                    Share All
                  </Text>
                </View>
              </TouchableOpacity>
            </View>
          </>
        )}
      </ScrollView>

      {/* Image Viewer Modal */}
      <ImageViewerModal
        visible={selectedImage !== null}
        imageUri={selectedImage || ""}
        onClose={() => setSelectedImage(null)}
      />

      {/* Video Viewer Modal */}
      <VideoViewerModal
        visible={selectedVideo !== null}
        videoUri={selectedVideo || ""}
        onClose={() => setSelectedVideo(null)}
      />
    </SafeAreaView>
  );
}
