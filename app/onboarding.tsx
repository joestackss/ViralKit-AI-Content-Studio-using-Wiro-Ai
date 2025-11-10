import AsyncStorage from "@react-native-async-storage/async-storage";
import { useRouter } from "expo-router";
import {} from "react";
import { Image, Text, View } from "react-native";
import AppIntroSlider from "react-native-app-intro-slider";
import Animated, {
  interpolateColor,
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from "react-native-reanimated";

type Slide = {
  key: string;
  subtitle: string;
  title: string;
  text: string;
  image: any;
};

const slides: Slide[] = [
  {
    key: "one",
    title: "Create viral-ready",
    subtitle: "content fast",
    text: "Generate eye-catching visuals in minutes with streamlined workflows.",
    image: require("../assets/images/board-1.png"),
  },
  {
    key: "two",
    title: "AI try-ons ",
    subtitle: "and video generation",
    text: "Preview styles with AI try-ons and produce short-form videos.",
    image: require("../assets/images/board-2.png"),
  },
  {
    key: "three",
    title: "Save, share, and",
    subtitle: "grow your gallery",
    text: "Organize results, share them, and keep inspiration in one place.",
    image: require("../assets/images/board-3.png"),
  },
];

export default function OnboardingScreen() {
  const router = useRouter();
  const slideIndex = useSharedValue(0);

  // Animated background color (Yellow → Blue → Pink)
  const animatedContainerStyle = useAnimatedStyle(() => {
    const bg = interpolateColor(
      slideIndex.value,
      [0, 1, 2],
      ["#f4c637", "#7ed6df", "#f3d0dc"]
    );
    return { backgroundColor: bg };
  });

  const handleDone = async () => {
    await AsyncStorage.setItem("hasSeenOnboarding", "true");
    router.replace("/(tabs)");
  };

  const renderItem = ({ item }: { item: Slide }) => (
    <View className="flex-1 items-center justify-center">
      <View className=" w-full h-[40%] items-center justify-center">
        <Image
          source={item.image}
          style={{ width: "100%", height: "100%", resizeMode: "contain" }}
        />
      </View>

      <View className="items-left justify-center  w-full px-8">
        <Text className="mt-8 text-4xl font-bold text-left">{item.title}</Text>
        <Text className=" text-4xl font-bold opacity-80">{item.subtitle}</Text>
        <Text className="mt-3 text-xl opacity-80  max-w-[80%]">
          {item.text}
        </Text>
      </View>
    </View>
  );

  return (
    <Animated.View style={[{ flex: 1 }, animatedContainerStyle]}>
      <AppIntroSlider
        data={slides}
        renderItem={renderItem}
        onDone={handleDone}
        showSkipButton
        onSkip={handleDone}
        onSlideChange={(i) => {
          const next = (i as number) ?? 0;
          slideIndex.value = withTiming(next, { duration: 450 });
        }}
        renderNextButton={() => (
          <Text className="px-4 py-2 text-base font-semibold">Next</Text>
        )}
        renderSkipButton={() => (
          <Text className="px-4 py-2 text-base font-semibold">Skip</Text>
        )}
        renderDoneButton={() => (
          <Text className="px-4 py-2 text-base font-semibold">Get Started</Text>
        )}
      />
    </Animated.View>
  );
}
