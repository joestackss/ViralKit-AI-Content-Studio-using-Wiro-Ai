import AsyncStorage from "@react-native-async-storage/async-storage";
import { Redirect } from "expo-router";
import { useEffect, useState } from "react";

export default function IndexGate() {
  const [isLoading, setIsLoading] = useState(true);
  const [hasSeenOnboarding, setHasSeenOnboarding] = useState<boolean | null>(
    null
  );

  useEffect(() => {
    const checkOnboarding = async () => {
      try {
        const flag = await AsyncStorage.getItem("hasSeenOnboarding");
        setHasSeenOnboarding(flag === "true");
      } catch (e) {
        setHasSeenOnboarding(true);
      } finally {
        setIsLoading(false);
      }
    };
    checkOnboarding();
  }, []);

  if (isLoading || hasSeenOnboarding === null) {
    return null;
  }

  if (!hasSeenOnboarding) {
    return <Redirect href="/onboarding" />;
  }

  return <Redirect href="/(tabs)" />;
}
