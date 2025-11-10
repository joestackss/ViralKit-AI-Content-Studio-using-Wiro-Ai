import * as ImagePicker from "expo-image-picker";
import * as ImageManipulator from "expo-image-manipulator";

// Image constraints
const MAX_IMAGE_SIZE = 1920; // Max width/height
const IMAGE_QUALITY = 0.8; // Compression quality

/**
 * Request camera roll permissions
 */
export async function requestImagePermissions(): Promise<boolean> {
  const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
  return status === "granted";
}

/**
 * Request camera permissions
 */
export async function requestCameraPermissions(): Promise<boolean> {
  const { status } = await ImagePicker.requestCameraPermissionsAsync();
  return status === "granted";
}

/**
 * Pick an image from the user's photo library
 */
export async function pickImageFromLibrary(): Promise<string | null> {
  try {
    // Request permissions
    const hasPermission = await requestImagePermissions();
    if (!hasPermission) {
      throw new Error("Camera roll permission denied");
    }

    // Launch image picker
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ["images"],
      allowsEditing: true,
      aspect: [1, 1],
      quality: 1,
    });

    if (result.canceled) {
      return null;
    }

    // Compress and optimize the image
    const optimizedUri = await optimizeImage(result.assets[0].uri);
    return optimizedUri;
  } catch (error) {
    console.error("Error picking image:", error);
    throw error;
  }
}

/**
 * Take a photo with the camera
 */
export async function takePhoto(): Promise<string | null> {
  try {
    // Request permissions
    const hasPermission = await requestCameraPermissions();
    if (!hasPermission) {
      throw new Error("Camera permission denied");
    }

    // Launch camera
    const result = await ImagePicker.launchCameraAsync({
      allowsEditing: true,
      aspect: [1, 1],
      quality: 1,
    });

    if (result.canceled) {
      return null;
    }

    // Compress and optimize the image
    const optimizedUri = await optimizeImage(result.assets[0].uri);
    return optimizedUri;
  } catch (error) {
    console.error("Error taking photo:", error);
    throw error;
  }
}

/**
 * Optimize and compress an image
 * - Resize to max 1920x1920
 * - Compress to reduce file size
 */
export async function optimizeImage(uri: string): Promise<string> {
  try {
    console.log("🖼️ Optimizing image...");

    const manipResult = await ImageManipulator.manipulateAsync(
      uri,
      [
        {
          resize: {
            width: MAX_IMAGE_SIZE,
            height: MAX_IMAGE_SIZE,
          },
        },
      ],
      {
        compress: IMAGE_QUALITY,
        format: ImageManipulator.SaveFormat.JPEG,
      }
    );

    console.log("✅ Image optimized:", manipResult.uri);
    return manipResult.uri;
  } catch (error) {
    console.error("Error optimizing image:", error);
    // Return original URI if optimization fails
    return uri;
  }
}

/**
 * Get file size of an image URI
 */
export async function getImageSize(uri: string): Promise<number> {
  try {
    const response = await fetch(uri);
    const blob = await response.blob();
    return blob.size;
  } catch (error) {
    console.error("Error getting image size:", error);
    return 0;
  }
}

/**
 * Format bytes to human-readable size
 */
export function formatBytes(bytes: number, decimals: number = 2): string {
  if (bytes === 0) return "0 Bytes";

  const k = 1024;
  const dm = decimals < 0 ? 0 : decimals;
  const sizes = ["Bytes", "KB", "MB", "GB"];

  const i = Math.floor(Math.log(bytes) / Math.log(k));

  return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + " " + sizes[i];
}

/**
 * Validate image URI
 */
export function isValidImageUri(uri: string): boolean {
  if (!uri) return false;

  // Check if it's a valid URI
  const imageExtensions = [".jpg", ".jpeg", ".png", ".gif", ".webp"];
  const lowerUri = uri.toLowerCase();

  return imageExtensions.some((ext) => lowerUri.includes(ext)) ||
    lowerUri.startsWith("file://") ||
    lowerUri.startsWith("http://") ||
    lowerUri.startsWith("https://");
}
