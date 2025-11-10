import React, { useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  Share,
  Alert,
} from "react-native";
import * as Clipboard from "expo-clipboard";
import { Ionicons } from "@expo/vector-icons";
import Toast from "react-native-toast-message";

interface CaptionDisplayProps {
  caption: string;
  hashtags?: string[];
}

export default function CaptionDisplay({
  caption,
  hashtags,
}: CaptionDisplayProps) {
  const fullText = hashtags
    ? `${caption}\n\n${hashtags.join(" ")}`
    : caption;

  const handleCopy = async () => {
    try {
      await Clipboard.setStringAsync(fullText);
      Toast.show({
        type: "success",
        text1: "Copied!",
        text2: "Caption copied to clipboard",
        position: "bottom",
        visibilityTime: 2000,
      });
    } catch (error) {
      Alert.alert("Error", "Failed to copy caption");
    }
  };

  const handleShare = async () => {
    try {
      await Share.share({
        message: fullText,
      });
    } catch (error: any) {
      if (error.message !== "User did not share") {
        Alert.alert("Error", "Failed to share caption");
      }
    }
  };

  return (
    <View className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100">
      {/* Header */}
      <View className="flex-row items-center justify-between mb-3">
        <View className="flex-row items-center">
          <Ionicons name="text" size={20} color="#7c3aed" />
          <Text className="text-purple-900 font-bold text-base ml-2">
            Social Media Caption
          </Text>
        </View>
        <View className="flex-row gap-2">
          <TouchableOpacity
            onPress={handleCopy}
            className="bg-purple-100 rounded-lg p-2"
            activeOpacity={0.7}
          >
            <Ionicons name="copy-outline" size={18} color="#7c3aed" />
          </TouchableOpacity>
          <TouchableOpacity
            onPress={handleShare}
            className="bg-purple-100 rounded-lg p-2"
            activeOpacity={0.7}
          >
            <Ionicons name="share-outline" size={18} color="#7c3aed" />
          </TouchableOpacity>
        </View>
      </View>

      {/* Caption Text */}
      <ScrollView
        className="max-h-40"
        showsVerticalScrollIndicator={false}
        nestedScrollEnabled
      >
        <Text className="text-gray-800 text-base leading-6">{caption}</Text>

        {/* Hashtags */}
        {hashtags && hashtags.length > 0 && (
          <View className="flex-row flex-wrap gap-2 mt-3">
            {hashtags.map((tag, index) => (
              <View key={index} className="bg-purple-50 px-3 py-1 rounded-full">
                <Text className="text-purple-700 text-sm font-medium">
                  {tag}
                </Text>
              </View>
            ))}
          </View>
        )}
      </ScrollView>

      {/* Character Count */}
      <View className="mt-3 pt-3 border-t border-gray-100">
        <Text className="text-gray-500 text-xs">
          {fullText.length} characters
        </Text>
      </View>
    </View>
  );
}
