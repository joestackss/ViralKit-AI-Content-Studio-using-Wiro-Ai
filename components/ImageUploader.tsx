import { Ionicons } from "@expo/vector-icons";
import React, { useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Image,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { useContentStore } from "../stores/content-store";
import { pickImageFromLibrary, takePhoto } from "../utils/image-utils";

interface ImageUploaderProps {
  onImageSelected?: (uri: string) => void;
  mode?: "single" | "tryon"; // New prop for mode
}

export default function ImageUploader({
  onImageSelected,
  mode = "single",
}: ImageUploaderProps) {
  const [loading, setLoading] = useState(false);
  const {
    currentImage,
    setCurrentImage,
    currentHumanImage,
    setCurrentHumanImage,
    currentClothesImage,
    setCurrentClothesImage,
  } = useContentStore();

  const handlePickImage = async (type?: "human" | "clothes") => {
    try {
      setLoading(true);
      const uri = await pickImageFromLibrary();

      if (uri) {
        if (mode === "tryon") {
          if (type === "human") {
            setCurrentHumanImage(uri);
          } else if (type === "clothes") {
            setCurrentClothesImage(uri);
          }
        } else {
          setCurrentImage(uri);
          onImageSelected?.(uri);
        }
      }
    } catch (error: any) {
      Alert.alert("Error", error.message || "Failed to pick image");
    } finally {
      setLoading(false);
    }
  };

  const handleTakePhoto = async (type?: "human" | "clothes") => {
    try {
      setLoading(true);
      const uri = await takePhoto();

      if (uri) {
        if (mode === "tryon") {
          if (type === "human") {
            setCurrentHumanImage(uri);
          } else if (type === "clothes") {
            setCurrentClothesImage(uri);
          }
        } else {
          setCurrentImage(uri);
          onImageSelected?.(uri);
        }
      }
    } catch (error: any) {
      Alert.alert("Error", error.message || "Failed to take photo");
    } finally {
      setLoading(false);
    }
  };

  // Render try-on mode (two images)
  if (mode === "tryon") {
    return (
      <View className="w-full">
        {/* Human Image Section */}
        <View className="mb-4">
          <Text className="text-lg font-semibold text-gray-700 mb-2">
            Person Image
          </Text>
          {currentHumanImage ? (
            <View className="relative">
              <Image
                source={{ uri: currentHumanImage }}
                className="w-full h-48 rounded-2xl"
                resizeMode="cover"
              />
              <TouchableOpacity
                onPress={() => handlePickImage("human")}
                className="absolute bottom-2 right-2 bg-white rounded-full p-2 shadow-lg"
                disabled={loading}
              >
                <Ionicons name="images" size={20} color="#7c3aed" />
              </TouchableOpacity>
            </View>
          ) : (
            <TouchableOpacity
              onPress={() => handlePickImage("human")}
              disabled={loading}
              className="border-2 border-dashed border-purple-300 rounded-2xl p-6 items-center justify-center bg-purple-50"
              activeOpacity={0.7}
            >
              {loading ? (
                <ActivityIndicator size="large" color="#7c3aed" />
              ) : (
                <>
                  <Ionicons name="person-outline" size={48} color="#7c3aed" />
                  <Text className="text-sm font-semibold text-purple-900 mt-2">
                    Upload Person Photo
                  </Text>
                </>
              )}
            </TouchableOpacity>
          )}
        </View>

        {/* Clothes Image Section */}
        <View>
          <Text className="text-lg font-semibold text-gray-700 mb-2">
            Clothing Image
          </Text>
          {currentClothesImage ? (
            <View className="relative">
              <Image
                source={{ uri: currentClothesImage }}
                className="w-full h-48 rounded-2xl"
                resizeMode="cover"
              />
              <TouchableOpacity
                onPress={() => handlePickImage("clothes")}
                className="absolute bottom-2 right-2 bg-white rounded-full p-2 shadow-lg"
                disabled={loading}
              >
                <Ionicons name="images" size={20} color="#7c3aed" />
              </TouchableOpacity>
            </View>
          ) : (
            <TouchableOpacity
              onPress={() => handlePickImage("clothes")}
              disabled={loading}
              className="border-2 border-dashed border-purple-300 rounded-2xl p-6 items-center justify-center bg-purple-50"
              activeOpacity={0.7}
            >
              {loading ? (
                <ActivityIndicator size="large" color="#7c3aed" />
              ) : (
                <>
                  <Ionicons name="shirt-outline" size={48} color="#7c3aed" />
                  <Text className="text-sm font-semibold text-purple-900 mt-2">
                    Upload Clothing Photo
                  </Text>
                </>
              )}
            </TouchableOpacity>
          )}
        </View>
      </View>
    );
  }

  // Render single image mode (original)
  return (
    <View className="w-full">
      {/* Image Preview */}
      {currentImage ? (
        <View className="relative">
          <Image
            source={{ uri: currentImage }}
            className="w-full h-64 rounded-2xl"
            resizeMode="cover"
          />
          {/* Change Image Button */}
          <TouchableOpacity
            onPress={() => handlePickImage()}
            className="absolute bottom-4 right-4 bg-white rounded-full p-3 shadow-lg"
            disabled={loading}
          >
            <Ionicons name="images" size={24} color="#7c3aed" />
          </TouchableOpacity>
        </View>
      ) : (
        <>
          {/* Upload Area */}
          <TouchableOpacity
            onPress={() => handlePickImage()}
            disabled={loading}
            className="border-2 border-dashed border-purple-300 rounded-2xl p-8 items-center justify-center bg-purple-50"
            activeOpacity={0.7}
          >
            {loading ? (
              <ActivityIndicator size="large" color="#7c3aed" />
            ) : (
              <>
                <Ionicons
                  name="cloud-upload-outline"
                  size={64}
                  color="#7c3aed"
                />
                <Text className="text-lg font-semibold text-purple-900 mt-4">
                  Upload Product Photo
                </Text>
                <Text className="text-sm text-purple-600 mt-2 text-center">
                  Tap to select from library
                </Text>
              </>
            )}
          </TouchableOpacity>

          {/* Camera Button */}
          <View className="flex-row items-center justify-center mt-4 gap-2">
            <View className="h-px bg-gray-300 flex-1" />
            <Text className="text-gray-500 text-sm">or</Text>
            <View className="h-px bg-gray-300 flex-1" />
          </View>

          <TouchableOpacity
            onPress={() => handleTakePhoto()}
            disabled={loading}
            className="mt-4 bg-white border-2 border-purple-300 rounded-xl py-4 px-6 flex-row items-center justify-center"
            activeOpacity={0.7}
          >
            <Ionicons name="camera" size={24} color="#7c3aed" />
            <Text className="text-purple-900 font-semibold ml-2 text-base">
              Take Photo
            </Text>
          </TouchableOpacity>
        </>
      )}
    </View>
  );
}
