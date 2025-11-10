import { Ionicons } from "@expo/vector-icons";
import React from "react";
import { ActivityIndicator, Text, TouchableOpacity, View } from "react-native";
import { ContentStatus } from "../types";

interface GenerationCardProps {
  icon: keyof typeof Ionicons.glyphMap;
  title: string;
  description: string;
  status: ContentStatus;
  onPress: () => void;
  disabled?: boolean;
  progressMessage?: string;
  progressPercentage?: number;
  elapsedSeconds?: string;
  onRecover?: () => void; // For failed items that can be recovered
}

export default function GenerationCard({
  icon,
  title,
  description,
  status,
  onPress,
  disabled,
  progressMessage,
  progressPercentage,
  elapsedSeconds,
  onRecover,
}: GenerationCardProps) {
  const getStatusColor = () => {
    switch (status) {
      case "completed":
        return "bg-green-500";
      case "processing":
        return "bg-yellow-500";
      case "failed":
        return "bg-red-500";
      default:
        return "bg-gray-300";
    }
  };

  const getStatusText = () => {
    switch (status) {
      case "completed":
        return "Completed";
      case "processing":
        return "Generating...";
      case "failed":
        return "Failed";
      default:
        return "Pending";
    }
  };

  const isProcessing = status === "processing";
  const isCompleted = status === "completed";

  return (
    <TouchableOpacity
      onPress={onPress}
      disabled={disabled || isProcessing}
      className={`bg-white rounded-xl p-4 mb-3 border-2 ${
        isCompleted ? "border-green-200" : "border-purple-200"
      } ${disabled || isProcessing ? "opacity-50" : ""}`}
      activeOpacity={0.7}
    >
      <View className="flex-row items-center">
        {/* Icon */}
        <View
          className={`w-12 h-12 rounded-full items-center justify-center ${
            isCompleted ? "bg-green-100" : "bg-purple-100"
          }`}
        >
          {isProcessing ? (
            <ActivityIndicator size="small" color="#7c3aed" />
          ) : (
            <Ionicons
              name={icon}
              size={24}
              color={isCompleted ? "#22c55e" : "#7c3aed"}
            />
          )}
        </View>

        {/* Content */}
        <View className="flex-1 ml-4">
          <Text className="text-gray-900 font-bold text-base">{title}</Text>
          <Text className="text-gray-600 text-sm mt-1">{description}</Text>

          {/* Progress Info */}
          {isProcessing &&
            (progressMessage ||
              progressPercentage !== undefined ||
              elapsedSeconds) && (
              <View className="mt-2">
                {/* Progress Bar */}
                {progressPercentage !== undefined && (
                  <View className="mb-2">
                    <View className="flex-row items-center justify-between mb-1">
                      <Text className="text-purple-600 text-xs font-semibold">
                        {Math.round(progressPercentage)}%
                      </Text>
                      {elapsedSeconds && (
                        <Text className="text-gray-500 text-xs">
                          {Math.floor(parseFloat(elapsedSeconds))}s
                        </Text>
                      )}
                    </View>
                    <View className="h-2 bg-gray-200 rounded-full overflow-hidden">
                      <View
                        className="h-full bg-purple-500 rounded-full transition-all"
                        style={{ width: `${progressPercentage}%` }}
                      />
                    </View>
                  </View>
                )}

                {progressMessage && (
                  <Text
                    className="text-purple-600 text-xs font-medium"
                    numberOfLines={2}
                  >
                    {progressMessage}
                  </Text>
                )}

                {!progressPercentage && elapsedSeconds && (
                  <Text className="text-gray-500 text-xs mt-1">
                    {Math.floor(parseFloat(elapsedSeconds))}s elapsed
                  </Text>
                )}
              </View>
            )}

          {/* Failed Status with Recovery */}
          {status === "failed" && onRecover && (
            <View className="mt-2">
              {progressMessage && (
                <Text
                  className="text-red-600 text-xs font-medium mb-2"
                  numberOfLines={2}
                >
                  {progressMessage}
                </Text>
              )}
              <TouchableOpacity
                onPress={onRecover}
                className="bg-purple-100 rounded-lg py-2 px-3 flex-row items-center justify-center"
                activeOpacity={0.7}
              >
                <Ionicons name="refresh" size={14} color="#7c3aed" />
                <Text className="text-purple-700 text-xs font-semibold ml-1">
                  Try Again
                </Text>
              </TouchableOpacity>
            </View>
          )}
        </View>

        {/* Status Badge */}
        <View className="ml-2">
          <View
            className={`px-3 py-1 rounded-full ${getStatusColor().replace(
              "bg-",
              "bg-"
            )}/20`}
          >
            <Text
              className={`text-xs font-semibold ${getStatusColor().replace(
                "bg-",
                "text-"
              )}`}
            >
              {getStatusText()}
            </Text>
          </View>
        </View>
      </View>
    </TouchableOpacity>
  );
}
