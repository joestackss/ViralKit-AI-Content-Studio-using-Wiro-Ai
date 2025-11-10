import AsyncStorage from "@react-native-async-storage/async-storage";
import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";
import { ContentItem, ContentType } from "../types";

interface ContentStore {
  // State
  items: ContentItem[];
  currentImage: string | null;
  currentHumanImage: string | null; // For virtual try-on: person image
  currentClothesImage: string | null; // For virtual try-on: clothing image

  // Actions
  setCurrentImage: (imageUri: string | null) => void;
  setCurrentHumanImage: (imageUri: string | null) => void;
  setCurrentClothesImage: (imageUri: string | null) => void;
  addItem: (item: ContentItem) => void;
  updateItem: (id: string, updates: Partial<ContentItem>) => void;
  removeItem: (id: string) => void;
  removeItemsByType: (type: ContentType) => void; // Remove all items of a specific type
  getItemsByType: (type: ContentType) => ContentItem[];
  getItemById: (id: string) => ContentItem | undefined;
  clearAll: () => void;
  clearCurrentState: () => void; // Clear only current images, keep all items
  clearCompleted: () => void;
}

/**
 * Content Store
 * Manages all generated content items (try-ons, videos, captions)
 * Persists data to AsyncStorage so content survives app reloads
 */
export const useContentStore = create<ContentStore>()(
  persist(
    (set, get) => ({
      // Initial state
      items: [],
      currentImage: null,
      currentHumanImage: null,
      currentClothesImage: null,

      // Set the current image being worked on
      setCurrentImage: (imageUri) => set({ currentImage: imageUri }),

      // Set the human image for virtual try-on
      setCurrentHumanImage: (imageUri) => set({ currentHumanImage: imageUri }),

      // Set the clothes image for virtual try-on
      setCurrentClothesImage: (imageUri) =>
        set({ currentClothesImage: imageUri }),

      // Add a new content item
      addItem: (item) =>
        set((state) => ({
          items: [item, ...state.items],
        })),

      // Update an existing content item
      updateItem: (id, updates) =>
        set((state) => ({
          items: state.items.map((item) =>
            item.id === id ? { ...item, ...updates } : item
          ),
        })),

      // Remove a content item
      removeItem: (id) =>
        set((state) => ({
          items: state.items.filter((item) => item.id !== id),
        })),

      // Remove all items of a specific type
      removeItemsByType: (type) =>
        set((state) => ({
          items: state.items.filter((item) => item.type !== type),
        })),

      // Get items by type
      getItemsByType: (type) => {
        return get().items.filter((item) => item.type === type);
      },

      // Get a specific item by ID
      getItemById: (id) => {
        return get().items.find((item) => item.id === id);
      },

      // Clear all items
      clearAll: () =>
        set({
          items: [],
          currentImage: null,
          currentHumanImage: null,
          currentClothesImage: null,
        }),

      // Clear only current images (keep all generated items in gallery)
      clearCurrentState: () =>
        set({
          currentImage: null,
          currentHumanImage: null,
          currentClothesImage: null,
        }),

      // Clear only completed items
      clearCompleted: () =>
        set((state) => ({
          items: state.items.filter((item) => item.status !== "completed"),
        })),
    }),
    {
      name: "viralkit-content-storage", // unique name for the storage key
      storage: createJSONStorage(() => AsyncStorage),
      // Only persist the items array and current images
      // Exclude getters/methods from persistence
      partialize: (state) => ({
        items: state.items,
        currentImage: state.currentImage,
        currentHumanImage: state.currentHumanImage,
        currentClothesImage: state.currentClothesImage,
      }),
    }
  )
);

// Selector hooks for convenience
export const useCurrentImage = () =>
  useContentStore((state) => state.currentImage);

export const useTryOns = (): ContentItem[] => {
  const items = useContentStore((state) => state.items);
  return items.filter((item) => item.type === "tryon");
};

export const useVideos = (): ContentItem[] => {
  const items = useContentStore((state) => state.items);
  return items.filter((item) => item.type === "video");
};

export const useCaptions = (): ContentItem[] => {
  const items = useContentStore((state) => state.items);
  return items.filter((item) => item.type === "caption");
};

export const useLatestContent = () =>
  useContentStore((state) => state.items[0]);
